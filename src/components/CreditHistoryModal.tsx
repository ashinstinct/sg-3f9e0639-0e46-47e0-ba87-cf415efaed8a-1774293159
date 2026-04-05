import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getCreditHistory, type CreditTransaction } from "@/services/creditsService";
import { ArrowDownRight, ArrowUpRight, Gift, RotateCcw } from "lucide-react";
import { format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CreditHistoryModal({ open, onClose }: Props) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await getCreditHistory(100);
    setTransactions(data);
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case "usage":
        return <ArrowDownRight className="w-4 h-4 text-red-500" />;
      case "bonus":
        return <Gift className="w-4 h-4 text-purple-500" />;
      case "refund":
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getColor = (amount: number) => {
    return amount > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Credit History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getIcon(tx.type)}
                    <div className="flex-1">
                      <p className="font-medium">
                        {tx.description || `${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} transaction`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${getColor(tx.amount)}`}>
                    {tx.amount > 0 ? "+" : ""}
                    {tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}