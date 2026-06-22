import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import Tesseract from "tesseract.js";
import { useLocation } from "wouter";
import { 
  useCreateExpense,
  useUpdateExpense,
  useListCategories,
  getListCategoriesQueryKey,
  Expense
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

import { CalendarIcon, Camera, Loader2, Upload, ScanLine, Info } from "lucide-react";
import { usePreferences } from "@/contexts/PreferencesContext";
import { parseThaiOcr, getCurrencySymbol, formatDate } from "@/lib/format";

const formSchema = z.object({
  merchant: z.string().min(1, "Merchant is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  date: z.date({
    required_error: "A date is required.",
  }),
  paymentMethod: z.string().optional(),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormProps {
  initialData?: Expense;
  isEdit?: boolean;
}

export function ExpenseForm({ initialData, isEdit }: ExpenseFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, currency, language, calendarEra } = usePreferences();
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [receiptImage, setReceiptImage] = useState<string | null>(initialData?.imageUrl || null);
  const [ocrReview, setOcrReview] = useState<ReturnType<typeof parseThaiOcr> | null>(null);

  const { data: categories } = useListCategories({});

  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant: initialData?.merchant || "",
      amount: initialData?.amount || 0,
      category: initialData?.category || "",
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      paymentMethod: initialData?.paymentMethod || "",
      note: initialData?.note || "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScanReceipt = async () => {
    if (!receiptImage) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setOcrReview(null);
    
    try {
      const worker = await (Tesseract as any).createWorker();
      
      const { data: { text } } = await worker.recognize(receiptImage);
      await worker.terminate();
      
      const result = parseThaiOcr(text);
      setOcrReview(result);
      
      if (result.amount && !form.getValues("amount")) {
        form.setValue("amount", result.amount);
        toast({ title: t.expenses.amountDetected, description: `${getCurrencySymbol(currency)}${result.amount.toFixed(2)}` });
      }
      
      if (result.merchant && !form.getValues("merchant")) {
        form.setValue("merchant", result.merchant);
        toast({ title: t.expenses.merchantDetected, description: result.merchant });
      }

      if (result.bank) {
        toast({ title: t.ocr.bankName + ": " + result.bank });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({ 
        title: t.expenses.scanFailed, 
        description: t.common.error,
        variant: "destructive"
      });
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const onSubmit = async (values: FormValues) => {
    const data = {
      merchant: values.merchant,
      amount: values.amount,
      category: values.category,
      date: format(values.date, "yyyy-MM-dd"),
      paymentMethod: values.paymentMethod,
      note: values.note,
      imageUrl: receiptImage || undefined,
    };

    try {
      if (isEdit && initialData) {
        await updateExpense.mutateAsync({
          id: initialData.id,
          data
        });
        toast({ title: t.expenses.expenseUpdated });
      } else {
        await createExpense.mutateAsync({ data });
        toast({ title: t.expenses.expenseAdded });
      }
      
      queryClient.invalidateQueries();
      setLocation("/expenses");
    } catch (error) {
      toast({ 
        title: t.expenses.saveFailed, 
        description: t.common.error,
        variant: "destructive"
      });
    }
  };

  const isPending = createExpense.isPending || updateExpense.isPending;

  return (
    <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-300 pb-8">
      {/* Receipt Scanner */}
      <div className="bg-card border border-border/50 rounded-3xl p-4 shadow-sm">
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{t.expenses.receipt}</Label>
        
        {receiptImage ? (
          <div className="space-y-3">
            <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-black/5">
              <img src={receiptImage} alt="Receipt" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <Button 
                type="button"
                variant="secondary" 
                size="sm"
                className="absolute bottom-2 right-2 rounded-xl backdrop-blur-md bg-white/20 text-white border-none hover:bg-white/30"
                onClick={() => {
                  setReceiptImage(null);
                  setOcrReview(null);
                }}
              >
                {t.expenses.remove}
              </Button>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full rounded-xl h-12"
              onClick={handleScanReceipt}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.expenses.scanning} ({Math.round(scanProgress)}%)...
                </>
              ) : (
                <>
                  <ScanLine className="w-4 h-4 mr-2 text-primary" />
                  {t.expenses.extractDetails}
                </>
              )}
            </Button>

            {ocrReview && (
              <div className="mt-4 p-3 bg-secondary/30 rounded-2xl border border-border/50 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-tight">{t.ocr.editBeforeSave}</span>
                </div>
                {ocrReview.bank && <div className="text-xs flex justify-between"><span>{t.ocr.bankName}</span><span className="font-medium">{ocrReview.bank}</span></div>}
                {ocrReview.sender && <div className="text-xs flex justify-between"><span>{t.ocr.sender}</span><span className="font-medium">{ocrReview.sender}</span></div>}
                {ocrReview.receiver && <div className="text-xs flex justify-between"><span>{t.ocr.receiver}</span><span className="font-medium">{ocrReview.receiver}</span></div>}
                {ocrReview.reference && <div className="text-xs flex justify-between"><span>{t.ocr.reference}</span><span className="font-medium truncate ml-4">{ocrReview.reference}</span></div>}
              </div>
            )}
          </div>
        ) : (
          <div 
            className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{t.expenses.addReceipt}</p>
            <p className="text-xs text-muted-foreground mt-1">{t.expenses.tapToUpload}</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.expenses.amount}</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">{getCurrencySymbol(currency)}</span>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                className="pl-8 text-2xl font-bold h-14 rounded-2xl bg-secondary/50 border-transparent focus-visible:bg-transparent"
                {...form.register("amount")} 
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive">{t.expenses.amountRequired}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchant" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.expenses.merchant}</Label>
            <Input 
              id="merchant" 
              className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:bg-transparent font-medium" 
              placeholder={t.expenses.merchant}
              {...form.register("merchant")} 
            />
            {form.formState.errors.merchant && (
              <p className="text-sm text-destructive">{t.expenses.merchantRequired}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.expenses.category}</Label>
            {!categories ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : (
              <Select 
                value={form.watch("category")} 
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-transparent focus-visible:bg-transparent font-medium">
                  <SelectValue placeholder={t.expenses.selectCategory} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name} className="rounded-lg">{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {form.formState.errors.category && (
              <p className="text-sm text-destructive">{t.expenses.categoryRequired}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.expenses.date}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-medium h-12 rounded-xl bg-secondary/50 border-transparent hover:bg-secondary"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {form.watch("date") ? formatDate(form.watch("date"), { language, era: calendarEra, format: 'long' }) : <span>{t.expenses.pickDate}</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch("date")}
                  onSelect={(date) => date && form.setValue("date", date)}
                  initialFocus
                  className="rounded-2xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.expenses.note} {t.common.optional}</Label>
            <Textarea 
              id="note" 
              className="resize-none rounded-xl bg-secondary/50 border-transparent focus-visible:bg-transparent font-medium min-h-[80px]" 
              placeholder={t.expenses.addDetails}
              {...form.register("note")} 
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20" 
          disabled={isPending}
        >
          {isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isEdit ? t.expenses.saveChanges : t.expenses.saveExpense}
        </Button>
      </form>
    </div>
  );
}