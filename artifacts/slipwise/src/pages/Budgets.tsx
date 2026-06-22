import { 
  useListBudgets, 
  getListBudgetsQueryKey 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Target, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Budgets() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const { data: budgets, isLoading } = useListBudgets({ month: currentMonth }, {
    query: { queryKey: getListBudgetsQueryKey({ month: currentMonth }) }
  });

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
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
            // API might not return progress depending on if we hit the raw endpoint or aggregated
            // Default to fake progress if actual spent/remaining isn't available
            const spent = budget.spent || 0;
            const limit = budget.budget;
            const percentage = budget.percentage || (spent / limit) * 100;
            const remaining = budget.remaining || (limit - spent);
            
            const isWarning = percentage > 85;
            const isDanger = percentage >= 100;

            return (
              <div key={budget.id} className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm overflow-hidden relative">
                {isDanger && (
                  <div className="absolute top-0 right-0 p-2 bg-destructive/10 text-destructive rounded-bl-xl font-medium text-[10px] uppercase flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> Exceeded
                  </div>
                )}
                
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{budget.category}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ${remaining > 0 ? remaining.toFixed(2) : '0.00'} left
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isDanger ? 'text-destructive' : ''}`}>
                      ${spent.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">of ${limit.toFixed(0)}</p>
                  </div>
                </div>

                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger ? 'bg-destructive' : 
                      isWarning ? 'bg-orange-500' : 
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
          <h3 className="text-lg font-semibold">No Budgets Set</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto mb-6">
            Set budgets for categories to keep your spending on track.
          </p>
          <Button variant="outline" className="rounded-xl">Create a Budget</Button>
        </div>
      )}
    </div>
  );
}