import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { 
  getCreditBalance, 
  getCreditHistory, 
  subscribeToCreditsUpdates,
  getTotalCreditsSpent 
} from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { 
  Coins, 
  TrendingDown, 
  TrendingUp, 
  Calendar,
  Image as ImageIcon,
  Video,
  Music,
  Wand2,
  Activity,
  DollarSign
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditTransaction {
  id: string;
  amount: number;
  type: "add" | "deduct";
  description: string;
  tool_type?: string;
  created_at: string;
}

interface DailySpending {
  date: string;
  amount: number;
}

interface ToolBreakdown {
  tool: string;
  amount: number;
  count: number;
  percentage: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [dailySpending, setDailySpending] = useState<DailySpending[]>([]);
  const [toolBreakdown, setToolBreakdown] = useState<ToolBreakdown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }
      
      await fetchDashboardData();
    };

    checkAuth();

    // Real-time credit updates
    const channel = subscribeToCreditsUpdates((newBalance) => {
      setCredits(newBalance);
    });

    return () => {
      channel.unsubscribe();
    };
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch credit balance
      const balance = await getCreditBalance();
      setCredits(balance);

      // Fetch total spent
      const spent = await getTotalCreditsSpent();
      setTotalSpent(spent);

      // Fetch transaction history (last 30 days)
      const history = await getCreditHistory(30);
      setTransactions(history);

      // Calculate daily spending for chart
      const daily = calculateDailySpending(history);
      setDailySpending(daily);

      // Calculate tool breakdown
      const breakdown = calculateToolBreakdown(history);
      setToolBreakdown(breakdown);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDailySpending = (transactions: CreditTransaction[]): DailySpending[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split("T")[0];
    });

    const spendingMap = new Map<string, number>();
    
    transactions
      .filter(t => t.type === "deduct")
      .forEach(t => {
        const date = new Date(t.created_at).toISOString().split("T")[0];
        const current = spendingMap.get(date) || 0;
        spendingMap.set(date, current + Math.abs(t.amount));
      });

    return last7Days.map(date => ({
      date,
      amount: spendingMap.get(date) || 0
    }));
  };

  const calculateToolBreakdown = (transactions: CreditTransaction[]): ToolBreakdown[] => {
    const toolMap = new Map<string, { amount: number; count: number }>();
    
    const deductions = transactions.filter(t => t.type === "deduct");
    const totalDeducted = deductions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    deductions.forEach(t => {
      const tool = t.tool_type || "Other";
      const current = toolMap.get(tool) || { amount: 0, count: 0 };
      toolMap.set(tool, {
        amount: current.amount + Math.abs(t.amount),
        count: current.count + 1
      });
    });

    return Array.from(toolMap.entries())
      .map(([tool, data]) => ({
        tool,
        amount: data.amount,
        count: data.count,
        percentage: totalDeducted > 0 ? (data.amount / totalDeducted) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  const getToolIcon = (toolType: string) => {
    const type = toolType.toLowerCase();
    if (type.includes("image") || type.includes("photo")) return <ImageIcon className="w-4 h-4" />;
    if (type.includes("video")) return <Video className="w-4 h-4" />;
    if (type.includes("audio") || type.includes("music") || type.includes("voice")) return <Music className="w-4 h-4" />;
    return <Wand2 className="w-4 h-4" />;
  };

  const getToolColor = (index: number) => {
    const colors = [
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-pink-500 to-rose-500",
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const maxSpending = Math.max(...dailySpending.map(d => d.amount), 1);

  if (isLoading) {
    return (
      <>
        <SEO title="Dashboard - Back2Life.Studio" />
        <Navigation />
        <div className="min-h-screen pt-16 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title="Dashboard - Back2Life.Studio" />
      <Navigation />
      
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Credit Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your credit usage and spending patterns
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Current Balance */}
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Balance</h3>
              <p className="text-3xl font-bold">{credits.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">Available credits</p>
            </Card>

            {/* Total Spent */}
            <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Spent</h3>
              <p className="text-3xl font-bold">{totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">All-time usage</p>
            </Card>

            {/* Average Daily */}
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">7-Day Average</h3>
              <p className="text-3xl font-bold">
                {Math.round(dailySpending.reduce((sum, d) => sum + d.amount, 0) / 7).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-2">Credits per day</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Spending Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                7-Day Spending Trend
              </h3>
              <div className="space-y-4">
                {dailySpending.map((day, index) => (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatDate(day.date)}
                      </span>
                      <span className="font-semibold">{day.amount} credits</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${(day.amount / maxSpending) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Tool Breakdown */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary" />
                Spending by Tool
              </h3>
              {toolBreakdown.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tool usage yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {toolBreakdown.map((tool, index) => (
                    <div key={tool.tool} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-1.5 rounded-md bg-gradient-to-br",
                            getToolColor(index)
                          )}>
                            {getToolIcon(tool.tool)}
                          </div>
                          <span className="font-medium">{tool.tool}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {tool.amount} credits ({tool.count}x)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500 bg-gradient-to-r",
                            getToolColor(index)
                          )}
                          style={{ width: `${tool.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Transaction History */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Transactions
            </h3>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 10).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        transaction.type === "add"
                          ? "bg-emerald-500/10"
                          : "bg-orange-500/10"
                      )}>
                        {transaction.type === "add" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "font-semibold",
                      transaction.type === "add" ? "text-emerald-500" : "text-orange-500"
                    )}>
                      {transaction.type === "add" ? "+" : "-"}
                      {Math.abs(transaction.amount).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}