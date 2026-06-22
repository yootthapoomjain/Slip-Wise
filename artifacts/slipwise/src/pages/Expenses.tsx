import { 
  useListExpenses, 
  getListExpensesQueryKey,
  useDeleteExpense
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Receipt, Search, Filter, Trash2, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatCurrency, formatShortDate } from "@/lib/format";

export default function Expenses() {
  const { t, currency, language, calendarEra } = usePreferences();
  const { data, isLoading } = useListExpenses({ limit: 50 }, {
    query: {
      queryKey: getListExpensesQueryKey({ limit: 50 })
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
    } catch (error) {
      toast({ title: t.expenses.deleteFail, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">{t.expenses.title}</h1>
      </header>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t.expenses.searchPlaceholder} className="pl-9 bg-card/80 backdrop-blur-md rounded-xl h-12" data-testid="input-search-expenses" />
        </div>
        <Button variant="outline" size="icon" className="shrink-0 bg-card/80 backdrop-blur-md rounded-xl h-12 w-12" data-testid="button-filter-expenses">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

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
        ) : data?.data && data.data.length > 0 ? (
          <AnimatePresence>
            {data.data.map((expense, i) => (
              <motion.div 
                key={expense.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                transition={{ duration: 0.2 }}
                className={`relative group ${i !== data.data.length - 1 ? 'border-b border-border/50' : ''}`}
              >
                <div className="absolute inset-y-0 right-0 flex items-center justify-end px-4 bg-destructive w-full -z-10">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: -100, right: 0 }}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -80) {
                      handleDelete(expense.id);
                    }
                  }}
                  className="bg-card p-4 flex items-center justify-between z-10 relative touch-pan-y"
                >
                  <Link href={`/expenses/${expense.id}/edit`} className="flex-1 flex items-center justify-between" data-testid={`link-edit-expense-${expense.id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-secondary-foreground">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-base tracking-tight">{expense.merchant}</p>
                        <p className="text-xs font-medium text-muted-foreground">{expense.category}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-base">{formatCurrency(expense.amount, currency)}</p>
                        <p className="text-xs font-medium text-muted-foreground">{formatShortDate(expense.date, { language, era: calendarEra })}</p>
                      </div>
                      <Edit2 className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="text-center py-16">
            <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="font-semibold text-lg">{t.expenses.noExpenses}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[200px] mx-auto">{t.expenses.addFirst}</p>
          </div>
        )}
      </div>
    </div>
  );
}