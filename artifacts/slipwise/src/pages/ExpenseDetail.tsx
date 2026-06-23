import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, Edit2, Trash2, Receipt, CreditCard,
  FileText, Calendar, Store, Tag, ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  useGetExpense,
  useDeleteExpense,
  getListExpensesQueryKey,
  getGetExpenseQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PAYMENT_ICONS: Record<string, string> = {
  cash: "💵",
  card: "💳",
  transfer: "🏦",
  promptpay: "📲",
  qr: "📱",
};

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, currency, language, calendarEra } = usePreferences();
  const { toast } = useToast();
  const qc = useQueryClient();

  const expenseId = parseInt(id ?? "0", 10);
  const { data: expense, isLoading } = useGetExpense(expenseId, {
    query: {
      queryKey: getGetExpenseQueryKey(expenseId),
      enabled: !!expenseId,
    },
  });

  const deleteMut = useDeleteExpense();

  async function handleDelete() {
    try {
      await deleteMut.mutateAsync({ id: expenseId });
      await qc.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      toast({ title: t.expenses.deleteSuccess });
      setLocation("/expenses");
    } catch {
      toast({ title: t.expenses.deleteFail, variant: "destructive" });
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8 animate-in fade-in duration-300">
        <header className="pt-2 flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-xl" />
          <Skeleton className="h-7 w-40" />
        </header>
        <Skeleton className="h-40 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Receipt className="w-12 h-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Expense not found</p>
        <Button variant="outline" className="rounded-2xl" onClick={() => setLocation("/expenses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </Button>
      </div>
    );
  }

  const paymentIcon = PAYMENT_ICONS[expense.paymentMethod?.toLowerCase() ?? ""] ?? "💳";

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <header className="pt-2 flex items-center justify-between">
        <button
          onClick={() => setLocation("/expenses")}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-lg font-bold">{t.expenseDetail.title}</h1>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="w-9 h-9 rounded-xl"
            onClick={() => setLocation(`/expenses/${expenseId}/edit`)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="w-9 h-9 rounded-xl text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>{t.expenseDetail.confirmDelete}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t.expenseDetail.confirmDeleteDesc}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2 flex-row">
                <AlertDialogCancel className="flex-1 rounded-xl">{t.common.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  className="flex-1 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                >
                  {t.common.delete}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </header>

      {/* Hero amount card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-primary/20 rounded-3xl p-6 text-center shadow-sm"
      >
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
          {expense.category
            ? expense.category.match(/^\p{Emoji}/u)?.[0] ?? <Receipt className="w-7 h-7 text-primary" />
            : <Receipt className="w-7 h-7 text-primary" />}
        </div>
        <p className="text-4xl font-bold tracking-tight">
          {formatCurrency(expense.amount, currency)}
        </p>
        <p className="text-muted-foreground mt-1 font-medium">{expense.merchant}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {expense.category}
          </span>
          <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
            {formatDate(expense.date, { language, era: calendarEra })}
          </span>
        </div>
      </motion.div>

      {/* Details card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm divide-y divide-border/50"
      >
        <DetailRow
          icon={<Store className="w-4 h-4 text-blue-500" />}
          label={t.expenses.merchant}
          value={expense.merchant}
        />
        <DetailRow
          icon={<Tag className="w-4 h-4 text-purple-500" />}
          label={t.expenseDetail.category}
          value={expense.category}
        />
        <DetailRow
          icon={<Calendar className="w-4 h-4 text-orange-500" />}
          label={t.expenses.date}
          value={formatDate(expense.date, { language, era: calendarEra })}
        />
        {expense.paymentMethod && (
          <DetailRow
            icon={<CreditCard className="w-4 h-4 text-green-500" />}
            label={t.expenseDetail.paymentMethod}
            value={`${paymentIcon} ${expense.paymentMethod}`}
          />
        )}
        {expense.note && (
          <DetailRow
            icon={<FileText className="w-4 h-4 text-muted-foreground" />}
            label={t.expenseDetail.note}
            value={expense.note}
            multiline
          />
        )}
      </motion.div>

      {/* Receipt image */}
      {expense.imageUrl ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
            {t.expenseDetail.receipt}
          </h3>
          <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
            <img
              src={expense.imageUrl}
              alt="receipt"
              className="w-full object-contain max-h-80"
            />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-dashed border-border/50 rounded-3xl p-6 flex flex-col items-center gap-2 text-center"
        >
          <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">{t.expenseDetail.noReceipt}</p>
        </motion.div>
      )}

      {/* Edit button */}
      <Button
        className="w-full h-14 rounded-2xl text-base font-semibold gap-2"
        onClick={() => setLocation(`/expenses/${expenseId}/edit`)}
      >
        <Edit2 className="w-4 h-4" />
        {t.expenseDetail.editExpense}
      </Button>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-medium ${multiline ? "text-sm whitespace-pre-wrap" : "truncate"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
