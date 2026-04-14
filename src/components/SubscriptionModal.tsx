import { useState } from "react";
import { X, Check, Zap, Crown, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [view, setView] = useState<"plans" | "credits">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  if (!isOpen) return null;

  const monthlyPlans = [
    {
      id: "basic",
      name: "Basic",
      monthlyPrice: 10,
      yearlyPrice: 8,
      credits: 1000,
      description: "Perfect for casual creators",
      features: [
        "1,000 credits/month",
        "Access to all free tools",
        "Standard AI models",
        "Email support",
        "720p video generation",
      ],
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      popular: false,
    },
    {
      id: "creator",
      name: "Creator",
      monthlyPrice: 30,
      yearlyPrice: 27,
      credits: 3500,
      description: "Best for active creators",
      features: [
        "3,500 credits/month",
        "Priority processing",
        "Premium AI models",
        "Priority support",
        "1080p video generation",
        "Advanced editing tools",
      ],
      icon: Crown,
      color: "from-purple-500 to-indigo-500",
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: 50,
      yearlyPrice: 52,
      credits: 6000,
      description: "For professional creators",
      features: [
        "6,000 credits/month",
        "Fastest processing",
        "All premium models",
        "24/7 priority support",
        "4K video generation",
        "API access",
        "Custom branding",
      ],
      icon: Crown,
      color: "from-orange-500 to-red-500",
      popular: false,
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: 100,
      yearlyPrice: 80,
      credits: 15000,
      description: "For teams and agencies",
      features: [
        "15,000 credits/month",
        "Dedicated processing",
        "Enterprise models",
        "Dedicated support",
        "4K video generation",
        "Full API access",
        "Team collaboration",
        "White-label options",
      ],
      icon: Crown,
      color: "from-pink-500 to-rose-500",
      popular: false,
    },
  ];

  const creditPackages = [
    {
      id: "trial",
      name: "Trial Pack",
      credits: 300,
      price: 3,
      description: "Try our AI tools risk-free",
      icon: Coins,
      color: "from-slate-500 to-slate-600",
      popular: false,
    },
    {
      id: "starter",
      name: "Starter Pack",
      credits: 500,
      price: 5,
      description: "Perfect for getting started",
      icon: Coins,
      color: "from-emerald-500 to-teal-500",
      popular: false,
    },
    {
      id: "basic",
      name: "Basic Pack",
      credits: 1000,
      price: 10,
      description: "Great for occasional creators",
      icon: Zap,
      color: "from-blue-500 to-cyan-500",
      popular: false,
      monthlySavings: "Save $2 with monthly",
    },
    {
      id: "creator",
      name: "Creator Pack",
      credits: 5000,
      price: 45,
      description: "Best value for serious creators",
      icon: Crown,
      color: "from-purple-500 to-indigo-500",
      popular: true,
      monthlySavings: "Save $9 with monthly",
    },
    {
      id: "pro",
      name: "Pro Pack",
      credits: 10000,
      price: 100,
      description: "For professional creators",
      icon: Crown,
      color: "from-orange-500 to-red-500",
      popular: false,
    },
    {
      id: "business",
      name: "Business Pack",
      credits: 20000,
      price: 200,
      description: "For teams and agencies",
      icon: Crown,
      color: "from-pink-500 to-rose-500",
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise Pack",
      credits: 30000,
      price: 300,
      description: "For high-volume production",
      icon: Crown,
      color: "from-violet-500 to-purple-500",
      popular: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur-sm z-10">
          <div>
            <h2 className="text-2xl font-bold">Choose Your Plan</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Flexible pricing for creators of all sizes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setView("plans")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                view === "plans"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Monthly Plans
            </button>
            <button
              onClick={() => setView("credits")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                view === "credits"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              One-Time Credits
            </button>
          </div>

          {view === "plans" ? (
            <>
              {/* Monthly/Yearly Toggle */}
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                  className={`relative w-14 h-7 rounded-full transition-colors ${
                    billingCycle === "yearly" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-6 h-6 bg-background rounded-full shadow-md transition-transform ${
                      billingCycle === "yearly" ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                    Yearly
                  </span>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    Save ~20%
                  </Badge>
                </div>
              </div>

              {/* Monthly Plans Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {monthlyPlans.map((plan) => {
                  const Icon = plan.icon;
                  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
                  const totalYearly = billingCycle === "yearly" ? price * 12 : null;
                  
                  return (
                    <Card
                      key={plan.id}
                      className={`relative p-6 border-2 transition-all hover:shadow-lg ${
                        plan.popular
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 border-0 text-white">
                          BEST VALUE
                        </Badge>
                      )}

                      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${plan.color} mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold">${price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {billingCycle === "yearly" && (
                          <p className="text-xs text-muted-foreground mt-1">
                            ${totalYearly}/year billed annually
                          </p>
                        )}
                      </div>

                      <Button
                        className={`w-full mb-4 ${
                          plan.popular
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        Get Started
                      </Button>

                      <div className="space-y-2">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              {/* One-Time Credit Packages */}
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pay once, use anytime • No subscription required
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditPackages.map((pack) => {
                  const Icon = pack.icon;
                  
                  return (
                    <Card
                      key={pack.id}
                      className={`relative p-6 border-2 transition-all hover:shadow-lg ${
                        pack.popular
                          ? "border-primary shadow-md shadow-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {pack.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 border-0 text-white">
                          POPULAR
                        </Badge>
                      )}

                      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${pack.color} mb-3`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <h3 className="font-bold mb-1">{pack.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{pack.description}</p>

                      <div className="mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold">${pack.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {pack.credits.toLocaleString()} credits
                        </p>
                        {pack.monthlySavings && (
                          <p className="text-xs text-emerald-500 mt-1">{pack.monthlySavings}</p>
                        )}
                      </div>

                      <Button
                        className={`w-full ${
                          pack.popular
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            : ""
                        }`}
                        variant={pack.popular ? "default" : "outline"}
                        size="sm"
                      >
                        Purchase
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-border/40">
            <p className="text-center text-sm text-muted-foreground">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}