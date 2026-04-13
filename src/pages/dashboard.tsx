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
  DollarSign,
  Loader2,
  PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Use the type from creditsService or define a compatible one
interface CreditTransaction {
  id: string;
  amount: number;
  type: "purchase" | "usage" | "bonus" | "refund" | "deduct" | "add";
  description: string;
  created_at: string;
  tool_type?: string;
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
    // Temporarily disabled auth check for development
    fetchDashboardData();

    // Real-time credit updates (disabled for now)
    // const channel = subscribeToCreditsUpdates((newBalance) => {
    //   setCredits(newBalance);
    // });

    // return () => {
    //   channel.unsubscribe();
    // };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Use mock data for development (no auth required)
      setCredits(1000);
      setTotalSpent(2500);
      
      // Mock transaction history
      const mockTransactions = [
        {
          id: "1",
          amount: -20,
          type: "deduct" as const,
          description: "Video generation - Kling AI",
          created_at: new Date().toISOString(),
          tool_type: "Video Generation"
        },
        {
          id: "2",
          amount: 500,
          type: "add" as const,
          description: "Credit purchase - Creator Pack",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "3",
          amount: -5,
          type: "deduct" as const,
          description: "Image generation - Nano Banana",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          tool_type: "Image Generation"
        },
      ];
      
      setTransactions(mockTransactions);

      // Calculate daily spending for chart
      const daily = calculateDailySpending(mockTransactions);
      setDailySpending(daily);

      // Calculate tool breakdown
      const breakdown = calculateToolBreakdown(mockTransactions);
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

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Current Balance */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Balance</h3>
              </div>
              <p className="text-3xl font-bold">{credits.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">credits available</p>
            </Card>

            {/* Total Spent */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Spent</h3>
              </div>
              <p className="text-3xl font-bold">{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground mt-1">lifetime credits</p>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Spending Chart */}
            <Card className="p-6 col-span-2">
              <h2 className="text-lg font-semibold mb-4">Credit Usage (Last 7 Days)</h2>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : dailySpending.length > 0 ? (
                <div className="h-64">
                  <div className="flex items-end justify-between h-full gap-2">
                    {dailySpending.map((day, idx) => {
                      const maxSpending = Math.max(...dailySpending.map(d => Math.abs(d.amount)));
                      const height = maxSpending > 0 ? (Math.abs(day.amount) / maxSpending) * 100 : 0;
                      
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="flex-1 flex items-end w-full">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-lg transition-all hover:opacity-80"
                              style={{ height: `${height}%`, minHeight: day.amount !== 0 ? '4px' : '0' }}
                              title={`${day.date}: ${Math.abs(day.amount)} credits`}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground text-center">
                            {day.date}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No spending data yet</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Tool Breakdown */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Usage by Tool Type</h2>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : toolBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {toolBreakdown.map((tool, idx) => {
                    const total = toolBreakdown.reduce((sum, t) => sum + t.amount, 0);
                    const percentage = total > 0 ? ((tool.amount / total) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{tool.tool}</span>
                          <span className="text-sm text-muted-foreground">{tool.amount} credits</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No tool usage data yet</p>
                  </div>
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