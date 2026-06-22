import { 
  useListBudgets, 
  getListBudgetsQueryKey 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatCurrency, formatMonthHeader } from "@/lib/format";

export default function Budgets() {
  const { t, currency, language, calendarEra } = usePreferences();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: budgets, isLoading } = useListBudgets({ month: currentMonth }, {
    query: { queryKey: getListBudgetsQueryKey({ month: currentMonth }) }
  });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.budgets.title}</h1>
          <p className="text-sm text-muted-foreground">{formatMonthHeader(new Date(), { language, era: calendarEra })}</p>
        </div>
        <Button size="icon" className="rounded-full w-10 h-10 shadow-md">
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-3xl p-5">
              <div className="flex justify-between mb-3">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget: any) => {
            const spent = budget.spent || 0;
            const limit = budget.budget;
            const percentage = budget.percentage || (spent / limit) * 100;
            const remaining = budget.remaining || (limit - spent);
            
            const isWarning50 = percentage >= 50 && percentage < 80;
            const isWarning80 = percentage >= 80 && percentage < 100;
            const isDanger = percentage >= 100;

            return (
              <div key={budget.id} className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm overflow-hidden relative">
                {isDanger && (
                  <div className="absolute top-0 right-0 p-2 bg-destructive/10 text-destructive rounded-bl-xl font-medium text-[10px] uppercase flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {t.budgets.over}
                  </div>
                )}
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {remaining > 0 ? formatCurrency(remaining, currency) : formatCurrency(0, currency)} {t.budgets.remaining}
                    </p>
                    {isWarning80 && !isDanger && (
                      <p className="text-[10px] text-orange-500 font-bold mt-1 uppercase">{t.budgets.warningAt80}</p>
                    )}
                    {isWarning50 && !isWarning80 && (
                      <p className="text-[10px] text-yellow-500 font-bold mt-1 uppercase">{t.budgets.warningAt50}</p>
                    )}
                    {isDanger && (
                      <p className="text-[10px] text-destructive font-bold mt-1 uppercase">{t.budgets.warningAt100}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDanger ? 'text-destructive' : ''}`}>
                      {formatCurrency(spent, currency)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.budgets.of} {formatCurrency(limit, currency)}</p>
                  </div>
                </div>

                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger ? 'bg-destructive' : 
                      isWarning80 ? 'bg-orange-500' : 
                      isWarning50 ? 'bg-yellow-500' :
                      'bg-primary'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border/50 rounded-3xl shadow-sm">
          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold">{t.budgets.noBudgets}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto mb-6">
            {t.budgets.setFirst}
          </p>
          <Button variant="outline" className="rounded-xl">{t.budgets.addBudget}</Button>
        </div>
      )}
    </div>
  );
}