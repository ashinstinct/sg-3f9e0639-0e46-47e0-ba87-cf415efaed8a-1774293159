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
    {
      id: "starter",
      name: "Starter Pack",
      credits: 500,
      price: 4.80,
      description: "Perfect for trying out our tools",
      icon: Coins,
      color: "from-slate-500 to-slate-600",
      popular: false,
    },
    {
      id: "basic",
      name: "Basic Pack",
      credits: 1000,
      price: 9.60,
      description: "Great for occasional creators",
      icon: Zap,
      color: "from-emerald-500 to-teal-500",
      popular: false,
      monthlySavings: "$1.60",
    },
    {
      id: "pro",
      name: "Pro Pack",
      credits: 2500,
      price: 24,
      description: "For regular content creation",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      popular: true,
    },
    {
      id: "creator",
      name: "Creator Pack",
      credits: 5000,
      price: 43.20,
      description: "Best value for serious creators",
      icon: Crown,
      color: "from-purple-500 to-indigo-500",
      popular: false,
      monthlySavings: "$7.20",
    },
    {
      id: "enterprise",
      name: "Enterprise Pack",
      credits: 10000,
      price: 86.40,
      description: "For high-volume production",
      icon: Crown,
      color: "from-orange-500 to-red-500",
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background">
          <h2 className="text-2xl font-bold">Pricing & Credits</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-6 pb-4">
          <button
            onClick={() => setSelectedTab("monthly")}
            className={cn(
              "flex-1 px-6 py-3 rounded-full font-semibold transition-all",
              selectedTab === "monthly"
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Monthly Plans
          </button>
          <button
            onClick={() => setSelectedTab("credits")}
            className={cn(
              "flex-1 px-6 py-3 rounded-full font-semibold transition-all",
              selectedTab === "credits"
                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            Buy Credits
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pt-2">
          {selectedTab === "monthly" ? (
            // Monthly Subscription Plans
            <div className="space-y-6">
              {/* Basic Plan */}
              <div className="border-2 border-emerald-500/30 rounded-xl p-6 bg-gradient-to-br from-emerald-950/20 to-teal-950/20">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">Basic</h3>
                    <p className="text-muted-foreground">Perfect for getting started with AI generation</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="text-4xl font-bold mb-1">$8 <span className="text-base text-muted-foreground font-normal">/month</span></div>
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">1,000 credits/month</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">WHAT'S INCLUDED</div>
                  {[
                    "~50 videos per month",
                    "~250 images per month",
                    "3 custom AI voices",
                    "All AI video & image models",
                    "Text-to-speech & voice cloning",
                    "Voice changer & audio tools",
                    "Characters, scenes & objects",
                    "Prompt enhancement",
                    "Gallery & project folders",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-6 text-base"
                  disabled={isLoading || currentSubscription === "basic"}
                >
                  {currentSubscription === "basic" ? "Current Plan" : "Get Started →"}
                </Button>
              </div>

              {/* Creator Plan - BEST VALUE */}
              <div className="relative border-2 border-purple-500 rounded-xl p-6 bg-gradient-to-br from-purple-950/30 to-indigo-950/30">
                {/* Best Value Badge */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full text-white text-sm font-semibold flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    BEST VALUE
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">Creator</h3>
                    <p className="text-muted-foreground">Best value for serious creators</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-background/50 rounded-lg border border-border/50">
                  <div className="text-4xl font-bold mb-1">$36 <span className="text-base text-muted-foreground font-normal">/month</span></div>
                  <div className="flex items-center gap-2 text-purple-400">
                    <Coins className="w-4 h-4" />
                    <span className="font-semibold">5,000 credits/month</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="text-sm font-semibold text-muted-foreground mb-2">WHAT'S INCLUDED</div>
                  {[
                    "~250 videos per month",
                    "~1,250 images per month",
                    "5 custom AI voices",
                    "All AI video & image models",
                    "Text-to-speech & voice cloning",
                    "Voice changer & audio tools",
                    "Characters, scenes & objects",
                    "Prompt enhancement",
                    "Gallery & project folders",
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-6 text-base"
                  disabled={isLoading || currentSubscription === "creator"}
                >
                  {currentSubscription === "creator" ? "Current Plan" : "Get Started →"}
                </Button>
              </div>

              {/* Footer Note */}
              <div className="text-center text-sm text-muted-foreground pt-4">
                All plans include a 7-day free trial. Cancel anytime.
              </div>
            </div>
          ) : (
            // One-Time Credit Purchases
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <ShoppingCart className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-1">Pay-As-You-Go Credits</h4>
                    <p className="text-sm text-muted-foreground">
                      One-time purchases for maximum flexibility. Credits never expire. 
                      <span className="text-amber-400 font-medium"> Save 20% with monthly plans!</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Credit Packages Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {creditPackages.map((pack) => {
                  const Icon = pack.icon;
                  return (
                    <div
                      key={pack.id}
                      className={cn(
                        "relative border rounded-xl p-5 bg-gradient-to-br transition-all hover:scale-[1.02]",
                        pack.popular
                          ? "border-blue-500 from-blue-950/30 to-cyan-950/30"
                          : "border-border/50 from-background/50 to-muted/20"
                      )}
                    >
                      {pack.popular && (
                        <div className="absolute -top-2 right-4">
                          <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                            POPULAR
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-4">
                        <div className={cn("w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center", pack.color)}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{pack.name}</h3>
                          <p className="text-xs text-muted-foreground">{pack.description}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-3xl font-bold">
                          ${pack.price.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Coins className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold">{pack.credits.toLocaleString()} credits</span>
                        </div>
                        {pack.monthlySavings && (
                          <div className="mt-2 text-xs text-amber-400">
                            Save {pack.monthlySavings} with monthly plan
                          </div>
                        )}
                      </div>

                      <Button
                        className={cn(
                          "w-full font-semibold",
                          pack.popular
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            : "bg-primary hover:bg-primary/90"
                        )}
                      >
                        Buy Now
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Footer Note */}
              <div className="text-center text-sm text-muted-foreground pt-4 space-y-1">
                <p>Credits never expire and can be used for any AI generation tool.</p>
                <p className="text-xs">All prices are in USD. Instant delivery after purchase.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}