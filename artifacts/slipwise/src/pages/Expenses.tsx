import { useState } from "react";
import { 
  useListExpenses, 
  getListExpensesQueryKey,
  useDeleteExpense
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Search, Trash2, Edit2, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatCurrency, formatShortDate } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Expenses() {
  const { t, currency, language, calendarEra } = usePreferences();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useListExpenses({ limit: 100 }, {
    query: {
      queryKey: getListExpensesQueryKey({ limit: 100 })
    }
  });

  const deleteExpense = useDeleteExpense();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense.mutateAsync({ id });
      queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      toast({ title: t.expenses.deleteSuccess });
      setDeleteId(null);
    } catch {
      toast({ title: t.expenses.deleteFail, variant: "destructive" });
    }
  };

  const expenses = data?.data ?? [];
  const filtered = search.trim()
    ? expenses.filter(
        (e) =>
          e.merchant.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      )
    : expenses;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t.expenses.title}</h1>
        <Link
          href="/expenses/new"
          className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-2xl hover:bg-primary/90 transition-colors"
        >
          + {t.expenses.addExpense}
        </Link>
      </header>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t.expenses.searchPlaceholder}
          className="pl-9 bg-card/80 backdrop-blur-md rounded-xl h-12"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Expense list */}
      <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden shadow-sm">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="p-4 border-b border-border/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Skeleton className="h-4 w-12 mb-2" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          <AnimatePresence>
            {filtered.map((expense, i) => (
              <SwipeableExpenseCard
                key={expense.id}
                expense={expense}
                isLast={i === filtered.length - 1}
                currency={currency}
                language={language}
                calendarEra={calendarEra}
                onDelete={() => setDeleteId(expense.id)}
                onEdit={() => setLocation(`/expenses/${expense.id}/edit`)}
                onTap={() => setLocation(`/expenses/${expense.id}`)}
              />
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold text-lg">{search ? t.expenses.noResults ?? "ไม่พบรายการ" : t.expenses.noExpenses}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">
              {search ? "" : t.expenses.addFirst}
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-3xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.expenseDetail.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>{t.expenseDetail.confirmDeleteDesc}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 flex-row">
            <AlertDialogCancel className="flex-1 rounded-xl">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId !== null && handleDelete(deleteId)}
            >
              {t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SwipeableExpenseCard({
  expense,
  isLast,
  currency,
  language,
  calendarEra,
  onDelete,
  onEdit,
  onTap,
}: {
  expense: {
    id: number;
    merchant: string;
    amount: number;
    category: string;
    date: string;
    imageUrl?: string | null;
  };
  isLast: boolean;
  currency: string;
  language: string;
  calendarEra: string;
  onDelete: () => void;
  onEdit: () => void;
  onTap: () => void;
}) {
  const categoryEmoji = expense.category?.match(/^\p{Emoji}/u)?.[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, overflow: "hidden" }}
      transition={{ duration: 0.2 }}
      className={`relative group overflow-hidden ${!isLast ? "border-b border-border/50" : ""}`}
    >
      {/* Swipe left action (delete) — shown on left swipe */}
      <div className="absolute inset-y-0 right-0 w-24 flex items-center justify-center bg-destructive">
        <Trash2 className="w-5 h-5 text-white" />
      </div>
      {/* Swipe right action (edit) — shown on right swipe */}
      <div className="absolute inset-y-0 left-0 w-24 flex items-center justify-center bg-blue-500">
        <Edit2 className="w-5 h-5 text-white" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) {
            onDelete();
          } else if (info.offset.x > 80) {
            onEdit();
          }
        }}
        onClick={onTap}
        className="bg-card px-4 py-3.5 flex items-center justify-between relative z-10 touch-pan-y cursor-pointer active:scale-[0.99] transition-transform"
      >
        {/* Left: icon + name */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center text-xl flex-shrink-0">
            {expense.imageUrl ? (
              <img
                src={expense.imageUrl}
                alt="receipt"
                className="w-11 h-11 rounded-2xl object-cover"
              />
            ) : categoryEmoji ? (
              <span>{categoryEmoji}</span>
            ) : (
              <Receipt className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm leading-tight">{expense.merchant}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{expense.category}</p>
          </div>
        </div>

        {/* Right: amount + date */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-bold text-sm tabular-nums">{formatCurrency(expense.amount, currency)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatShortDate(expense.date, { language, era: calendarEra })}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
        </div>
      </motion.div>
    </motion.div>
  );
}
