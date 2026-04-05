import { useState, useEffect } from "react";
import { Coins, Plus, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCreditBalance } from "@/services/creditsService";
import { CreditPurchaseModal } from "@/components/CreditPurchaseModal";
import { CreditHistoryModal } from "@/components/CreditHistoryModal";

export function CreditBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showPurchase, setShowPurchase] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    setLoading(true);
    const credits = await getCreditBalance();
    setBalance(credits);
    setLoading(false);
  };

  const handleBalanceUpdate = () => {
    loadBalance();
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
          <Coins className="w-5 h-5 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Credits</span>
            <span className="text-lg font-bold">
              {loading ? "..." : balance.toLocaleString()}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPurchase(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Buy Credits
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory(true)}
          className="gap-2"
        >
          <History className="w-4 h-4" />
        </Button>
      </div>

      <CreditPurchaseModal
        open={showPurchase}
        onClose={() => setShowPurchase(false)}
        onPurchaseComplete={handleBalanceUpdate}
      />

      <CreditHistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
      />
    </>
  );
}