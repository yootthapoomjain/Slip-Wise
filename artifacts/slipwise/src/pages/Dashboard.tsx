import { 
  useGetDashboardSummary, 
  getGetDashboardSummaryQueryKey 
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Link } from "wouter";
import { ArrowRight, Receipt, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetDashboardSummary({}, {
    query: {
      queryKey: getGetDashboardSummaryQueryKey({})
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        <header>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </header>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  const { todaySpend, weekSpend, monthSpend, monthBudget, budgetRemaining, budgetPercentage, recentExpenses, topCategories } = summary;

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-500">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(), 'MMMM yyyy')}</p>
      </header>

      {/* Hero Stats */}
      <section className="bg-gradient-to-br from-primary to-blue-700 text-primary-foreground rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        <p className="text-primary-foreground/80 text-sm font-medium mb-1">Spent this month</p>
        <h2 className="text-4xl font-bold tracking-tight mb-6">${monthSpend.toFixed(2)}</h2>
        
        {monthBudget > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2 text-primary-foreground/90">
              <span>Budget: ${monthBudget.toFixed(0)}</span>
              <span>${budgetRemaining.toFixed(0)} left</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${budgetPercentage && budgetPercentage > 90 ? 'bg-red-400' : 'bg-white'}`} 
                style={{ width: `${Math.min(budgetPercentage || 0, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">Today</p>
          <p className="text-xl font-semibold">${todaySpend.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium mb-1">This Week</p>
          <p className="text-xl font-semibold">${weekSpend.toFixed(2)}</p>
        </div>
      </section>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <section className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Spending by Category</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="category"
                  stroke="none"
                >
                  {topCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-semibold tracking-tight">Recent</h3>
          <Link href="/expenses" className="text-sm text-primary font-medium flex items-center hover:underline">
            See all <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
        
        {recentExpenses.length > 0 ? (
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden shadow-sm">
            {recentExpenses.map((expense, i) => (
              <div key={expense.id} className={`p-4 flex items-center justify-between ${i !== recentExpenses.length - 1 ? 'border-b border-border/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.merchant}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">${expense.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'MMM d')}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-card border border-border/50 rounded-2xl shadow-sm">
            <Receipt className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">No recent transactions</p>
          </div>
        )}
      </section>
    </div>
  );
}