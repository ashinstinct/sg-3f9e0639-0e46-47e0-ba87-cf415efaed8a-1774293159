import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { 
  getCreditBalance, 
  getCreditHistory, 
  subscribeToCreditsUpdates 
} from "@/services/creditsService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  TrendingDown, 
  TrendingUp, 
  Activity,
  Plus,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubscriptionModal } from "@/components/SubscriptionModal";

interface CreditTransaction {
  id: string;
  amount: number;
  type: "purchase" | "usage" | "bonus" | "refund" | "deduct" | "add";
  description: string;
  created_at: string;
  tool_type?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [credits, setCredits] = useState<number>(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Use mock data for development
      setCredits(1000);
      
      // Mock transaction history - last 5 only
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
        {
          id: "4",
          amount: -15,
          type: "deduct" as const,
          description: "Avatar video - Hedra",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          tool_type: "Avatar"
        },
        {
          id: "5",
          amount: -3,
          type: "deduct" as const,
          description: "Voice cloning - Fish Audio",
          created_at: new Date(Date.now() - 345600000).toISOString(),
          tool_type: "Voice"
        },
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
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
      
      <main className="min-h-screen pt-20 pb-4 px-4">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Credit Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your credits and view recent activity
            </p>
          </div>

          {/* Current Balance Card */}
          <Card className="p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold">{credits.toLocaleString()}</p>
                </div>
              </div>
              <Button
                onClick={() => setSubscriptionModalOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Top Up
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase more credits to continue creating amazing content
            </p>
          </Card>

          {/* Recent Transactions */}
          <Card className="p-6">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Recent Transactions
            </h3>
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Coins className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "p-1.5 rounded-lg flex-shrink-0",
                        transaction.type === "add"
                          ? "bg-emerald-500/10"
                          : "bg-orange-500/10"
                      )}>
                        {transaction.type === "add" ? (
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "font-semibold text-sm flex-shrink-0 ml-2",
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

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}