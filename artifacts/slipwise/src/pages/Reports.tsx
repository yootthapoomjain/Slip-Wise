import { 
  useGetSpendingByCategory, 
  getGetSpendingByCategoryQueryKey,
  useGetSpendingByPeriod,
  getGetSpendingByPeriodQueryKey,
  useGetTopMerchants,
  getGetTopMerchantsQueryKey
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import { format, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Reports() {
  const currentMonth = format(new Date(), 'yyyy-MM');
  
  const { data: categories, isLoading: isLoadingCats } = useGetSpendingByCategory({ month: currentMonth }, {
    query: { queryKey: getGetSpendingByCategoryQueryKey({ month: currentMonth }) }
  });

  const { data: trends, isLoading: isLoadingTrends } = useGetSpendingByPeriod({ 
    granularity: 'daily',
    startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  }, {
    query: { queryKey: getGetSpendingByPeriodQueryKey({ 
      granularity: 'daily',
      startDate: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    }) }
  });

  const { data: merchants, isLoading: isLoadingMerchants } = useGetTopMerchants({ month: currentMonth, limit: 5 }, {
    query: { queryKey: getGetTopMerchantsQueryKey({ month: currentMonth, limit: 5 }) }
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg text-sm">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color || 'hsl(var(--primary))' }} className="font-bold">
              ${p.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      <header className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      </header>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-border/50 rounded-xl p-1 mb-6">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Overview</TabsTrigger>
          <TabsTrigger value="trends" className="rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
          {/* Categories Chart */}
          <section className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-4 tracking-tight">Spending by Category</h3>
            {isLoadingCats ? (
              <Skeleton className="w-full h-64 rounded-full" />
            ) : categories && categories.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="amount"
                      nameKey="category"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || `hsl(var(--chart-${(index % 5) + 1}))`} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto pr-2">
                  {categories.map((cat, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || `hsl(var(--chart-${(i % 5) + 1}))` }} />
                        <span className="font-medium text-muted-foreground">{cat.category}</span>
                      </div>
                      <span className="font-semibold">${cat.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data for this month</div>
            )}
          </section>

          {/* Top Merchants */}
          <section className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-4 tracking-tight">Top Merchants</h3>
            {isLoadingMerchants ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
              </div>
            ) : merchants && merchants.length > 0 ? (
              <div className="space-y-4">
                {merchants.map((merchant, i) => {
                  const maxAmount = Math.max(...merchants.map(m => m.amount));
                  const percentage = (merchant.amount / maxAmount) * 100;
                  
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{merchant.merchant}</span>
                        <span className="font-semibold">${merchant.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-1000" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">No data for this month</div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <section className="bg-card border border-border/50 rounded-3xl p-5 shadow-sm">
            <h3 className="text-base font-semibold mb-6 tracking-tight">Spending Over Time</h3>
            {isLoadingTrends ? (
              <Skeleton className="w-full h-64 rounded-xl" />
            ) : trends && trends.length > 0 ? (
              <div className="h-64 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(val) => {
                        try { return format(new Date(val), 'd MMM'); } 
                        catch { return val; }
                      }}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(val) => `$${val}`}
                      dx={-10}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}