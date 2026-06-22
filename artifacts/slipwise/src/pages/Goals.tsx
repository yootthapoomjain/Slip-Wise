import { 
  useListGoals, 
  getListGoalsQueryKey 
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, Plus, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays, isBefore } from "date-fns";
import { usePreferences } from "@/contexts/PreferencesContext";
import { formatCurrency, formatDate } from "@/lib/format";

export default function Goals() {
  const { t, currency, language, calendarEra } = usePreferences();
  const { data: goals, isLoading } = useListGoals({});

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t.goals.title}</h1>
        </div>
        <Button size="icon" className="rounded-full w-10 h-10 shadow-md">
          <Plus className="w-5 h-5" />
        </Button>
      </header>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-card border border-border/50 rounded-3xl p-5">
              <Skeleton className="w-10 h-10 rounded-xl mb-4" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-8 w-40 mb-6" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const percentage = Math.min((goal.current / goal.target) * 100, 100);
            const isCompleted = percentage >= 100;
            const deadline = goal.deadline ? new Date(goal.deadline) : null;
            const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;
            const isOverdue = deadline ? isBefore(deadline, new Date()) && !isCompleted : false;

            return (
              <div key={goal.id} className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm relative overflow-hidden group hover:border-primary/30 transition-colors">
                {isCompleted && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-green-500/20 to-transparent -z-10 rounded-bl-full" />
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCompleted ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                    {isCompleted ? <Trophy className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                  </div>
                  {deadline && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                        {t.goals.deadline}: {formatDate(deadline, { language, era: calendarEra, format: 'short' })}
                      </span>
                      {isOverdue ? (
                         <span className="text-[9px] text-destructive font-bold uppercase">{t.goals.overdue}</span>
                      ) : daysLeft !== null && daysLeft >= 0 && !isCompleted ? (
                         <span className="text-[9px] text-primary font-bold uppercase">{daysLeft} {t.goals.daysLeft}</span>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">{formatCurrency(goal.current, currency)}</span>
                    <span className="text-sm font-medium text-muted-foreground">/ {formatCurrency(goal.target, currency)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>{percentage.toFixed(0)}%</span>
                    <span>{formatCurrency(Math.max(goal.target - goal.current, 0), currency)} {t.budgets.remaining}</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border/50 rounded-3xl shadow-sm">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-semibold">{t.goals.noGoals}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px] mx-auto mb-6">
            {t.goals.setFirst}
          </p>
          <Button variant="outline" className="rounded-xl">{t.goals.addGoal}</Button>
        </div>
      )}
    </div>
  );
}