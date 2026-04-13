import { useState, useEffect } from "react";
import { X, Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getUserSubscription } from "@/services/creditsService";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedTab, setSelectedTab] = useState<"monthly" | "individual" | "teams">("monthly");
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

  const plans = [
    {
      id: "basic",
      name: "Basic",
      description: "Perfect for getting started with AI generation",
      price: 8,
      credits: 1000,
      icon: Zap,
      features: [
        "~50 videos per month",
        "~250 images per month",
        "3 custom AI voices",
        "All AI video & image models",
        "Text-to-speech & voice cloning",
        "Voice changer & audio tools",
        "Characters, scenes & objects",
        "Prompt enhancement",
        "Gallery & project folders",
      ],
      buttonColor: "bg-green-500 hover:bg-green-600",
      cardColor: "bg-green-950/30 border-green-800/40",
    },
    {
      id: "creator",
      name: "Creator",
      description: "Best value for serious creators",
      price: 36,
      credits: 5000,
      icon: Crown,
      badge: "BEST VALUE",
      features: [
        "~250 videos per month",
        "~1250 images per month",
        "5 custom AI voices",
        "All AI video & image models",
        "Text-to-speech & voice cloning",
        "Voice changer & audio tools",
        "Characters, scenes & objects",
        "Prompt enhancement",
        "Gallery & project folders",
      ],
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      cardColor: "bg-purple-950/30 border-purple-800/40",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">Subscription Plans</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit mx-auto">
            <button
              onClick={() => setSelectedTab("monthly")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                selectedTab === "monthly"
                  ? "bg-green-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedTab("individual")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                selectedTab === "individual"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Individual
            </button>
            <button
              onClick={() => setSelectedTab("teams")}
              className={cn(
                "px-6 py-2 rounded-md text-sm font-medium transition-colors",
                selectedTab === "teams"
                  ? "bg-purple-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Teams
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="px-6 py-8 space-y-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative border rounded-xl p-6",
                  plan.cardColor
                )}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="px-4 py-1 bg-purple-600 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Left: Plan Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center",
                        plan.id === "basic" ? "bg-green-900/50" : "bg-purple-900/50"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6",
                          plan.id === "basic" ? "text-green-400" : "text-purple-400"
                        )} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>

                        {/* Price Box */}
                        <div className="mt-4 p-4 bg-background/50 rounded-lg border border-border/50">
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <Zap className="w-4 h-4" />
                            <span>{plan.credits.toLocaleString()} credits/month</span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mt-6">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                            WHAT'S INCLUDED
                          </h4>
                          <div className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <Check className={cn(
                                  "w-5 h-5 mt-0.5 flex-shrink-0",
                                  plan.id === "basic" ? "text-green-500" : "text-purple-500"
                                )} />
                                <span className="text-sm">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Get Started Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold py-6 text-base"
                          disabled={isLoading || currentSubscription === "creator"}
                        >
                          {currentSubscription === "creator" ? "Current Plan" : "Get Started →"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}