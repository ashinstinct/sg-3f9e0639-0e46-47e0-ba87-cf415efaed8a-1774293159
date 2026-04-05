import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, Check, Sparkles } from "lucide-react";
import { getCreditPackages, addCredits, type CreditPackage } from "@/services/creditsService";

type Props = {
  open: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
};

export function CreditPurchaseModal({ open, onClose, onPurchaseComplete }: Props) {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  useEffect(() => {
    if (open) {
      loadPackages();
    }
  }, [open]);

  const loadPackages = async () => {
    const data = await getCreditPackages();
    setPackages(data);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    setLoading(true);

    // In production, integrate with Stripe here
    // For now, simulate purchase (add credits directly)
    const totalCredits = selectedPackage.credits + selectedPackage.bonus_credits;
    
    const result = await addCredits(
      totalCredits,
      "purchase",
      `Purchased ${selectedPackage.name} package`,
      {
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        price_paid: selectedPackage.price_usd,
      }
    );

    setLoading(false);

    if (result.success) {
      onPurchaseComplete();
      onClose();
    } else {
      alert(result.error || "Purchase failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Coins className="w-6 h-6 text-primary" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            Choose a credit package to continue creating amazing content
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                selectedPackage?.id === pkg.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {pkg.bonus_credits > 0 && (
                <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold shadow-lg">
                  +{pkg.bonus_credits} Bonus
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">{pkg.name}</h3>
                {selectedPackage?.id === pkg.id && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{pkg.credits}</span>
                  <span className="text-muted-foreground">credits</span>
                </div>
                {pkg.bonus_credits > 0 && (
                  <div className="flex items-center gap-1 text-primary text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>+{pkg.bonus_credits} bonus credits</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="text-2xl font-bold">
                  ${pkg.price_usd.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  ${(pkg.price_usd / (pkg.credits + pkg.bonus_credits)).toFixed(3)} per credit
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || loading}
            className="flex-1"
          >
            {loading ? "Processing..." : `Purchase ${selectedPackage?.name || "Package"}`}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          🔒 Secure payment powered by Stripe (integration coming soon)
        </p>
      </DialogContent>
    </Dialog>
  );
}