import { useState, useEffect } from "react";
import { X, Check, Zap, Crown, Coins, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUserSubscription } from "@/services/creditsService";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedTab, setSelectedTab] = useState<"monthly" | "credits">("monthly");
  const [currentSubscription, setCurrentSubscription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const fetchSubscription = async () => {
        try {
          setIsLoading(true);
          const subscription = await getUserSubscription();
          setCurrentSubscription(subscription?.plan_type || null);
        } catch (error) {
          console.error("Error fetching subscription:", error);
          setCurrentSubscription(null);
        } finally {
          setIsLoading(false);
        }
      };

      fetchSubscription();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const creditPackages = [
    { id: "trial", name: "Trial", credits: 300, price: 3 },
    { id: "starter", name: "Starter", credits: 500, price: 5 },
    { id: "basic", name: "Basic", credits: 1000, price: 10 },
    { id: "creator", name: "Creator", credits: 5000, price: 45, popular: true },
    { id: "pro", name: "Pro", credits: 10000, price: 100 },
    { id: "business", name: "Business", credits: 20000, price: 200 },
    { id: "enterprise", name: "Enterprise", credits: 30000, price: 300 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 md:p-6">
      {/* Backdrop - Click to close */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Compact Modal - Top Right Corner */}
      <div className="relative w-full max-w-sm max-h-[85vh] overflow-y-auto bg-background border border-border rounded-xl shadow-2xl mt-16 mr-0 md:mr-2">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-background">
          <h2 className="text-lg font-bold">Pricing</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-3 pb-2">
          <button
            onClick={() => setSelectedTab("monthly")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
              selectedTab === "monthly"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedTab("credits")}
            className={cn(
              "flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
              selectedTab === "credits"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Credits
          </button>
        </div>

        {/* Content */}
        <div className="p-3 pt-1">
          {selectedTab === "monthly" ? (
            // Monthly Plans - Compact
            <div className="space-y-3">
              {/* Basic Plan */}
              <div className="border border-emerald-500/30 rounded-lg p-3 bg-gradient-to-br from-emerald-950/10 to-teal-950/10">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base font-bold">Basic</h3>
                    <p className="text-xs text-muted-foreground">1,000 credits/mo</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">$8</div>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  disabled={isLoading || currentSubscription === "basic"}
                >
                  {currentSubscription === "basic" ? "Current Plan" : "Get Started"}
                </Button>
              </div>

              {/* Creator Plan */}
              <div className="relative border-2 border-purple-500 rounded-lg p-3 bg-gradient-to-br from-purple-950/20 to-indigo-950/20">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                  <div className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    BEST VALUE
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2 mt-1">
                  <div>
                    <h3 className="text-base font-bold">Creator</h3>
                    <p className="text-xs text-muted-foreground">5,000 credits/mo</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">$36</div>
                    <div className="text-xs text-muted-foreground">/month</div>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                  disabled={isLoading || currentSubscription === "creator"}
                >
                  {currentSubscription === "creator" ? "Current Plan" : "Get Started"}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground pt-2">
                Cancel anytime. No hidden fees.
              </p>
            </div>
          ) : (
            // Credit Packages - Compact
            <div className="space-y-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mb-3">
                <p className="text-xs text-muted-foreground">
                  One-time purchases. Credits never expire.
                </p>
              </div>

              {creditPackages.map((pack) => (
                <div
                  key={pack.id}
                  className={cn(
                    "border rounded-lg p-2.5 bg-gradient-to-br from-background/50 to-muted/20",
                    pack.popular && "border-blue-500"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold">{pack.name}</h3>
                        {pack.popular && (
                          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-semibold rounded">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Coins className="w-3 h-3 text-primary" />
                        <span className="text-xs font-semibold">{pack.credits.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold">${pack.price}</div>
                  </div>
                  <Button
                    size="sm"
                    className={cn(
                      "w-full",
                      pack.popular && "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                    )}
                  >
                    Buy Now
                  </Button>
                </div>
              ))}

              <p className="text-center text-xs text-muted-foreground pt-2">
                All prices in USD. Instant delivery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}