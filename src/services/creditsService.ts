import { supabase } from "@/integrations/supabase/client";

export type CreditTransaction = {
  id: string;
  user_id: string;
  amount: number;
  type: "purchase" | "usage" | "bonus" | "refund";
  description: string | null;
  metadata: any;
  created_at: string;
};

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price_usd: number;
  bonus_credits: number;
  is_active: boolean;
  display_order: number;
};

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0; // Not authenticated - return 0 instead of error
    }

    const { data, error } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching credit balance:", error);
      return 0;
    }

    return data?.balance || 0;
  } catch (err) {
    console.error("Credit balance error:", err);
    return 0;
  }
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(required: number): Promise<boolean> {
  const balance = await getCreditBalance();
  return balance >= required;
}

/**
 * Deduct credits from user account
 */
export async function deductCredits(
  amount: number,
  description: string,
  metadata?: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Check current balance
    const currentBalance = await getCreditBalance();
    
    if (currentBalance < amount) {
      return { success: false, error: "Insufficient credits" };
    }

    // Deduct credits
    const newBalance = currentBalance - amount;
    
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error deducting credits:", updateError);
      return { success: false, error: updateError.message };
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount: -amount, // Negative for usage
        type: "usage",
        description,
        metadata,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Don't fail if transaction log fails, credits already deducted
    }

    return { success: true, newBalance };
  } catch (err: any) {
    console.error("Deduct credits error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Add credits to user account
 */
export async function addCredits(
  amount: number,
  type: "purchase" | "bonus" | "refund",
  description: string,
  metadata?: any
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Get current balance
    const currentBalance = await getCreditBalance();
    const newBalance = currentBalance + amount;

    // Add credits
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ balance: newBalance })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error adding credits:", updateError);
      return { success: false, error: updateError.message };
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: user.id,
        amount, // Positive for additions
        type,
        description,
        metadata,
      });

    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
    }

    return { success: true, newBalance };
  } catch (err: any) {
    console.error("Add credits error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(limit: number = 50): Promise<CreditTransaction[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching credit history:", error);
      return [];
    }

    return (data || []) as CreditTransaction[];
  } catch (err) {
    console.error("Credit history error:", err);
    return [];
  }
}

/**
 * Get available credit packages
 */
export async function getCreditPackages(): Promise<CreditPackage[]> {
  try {
    const { data, error } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching packages:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Packages error:", err);
    return [];
  }
}

/**
 * Get total credits spent by the current user
 */
export async function getTotalCreditsSpent(): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("amount")
    .eq("user_id", user.id)
    .eq("type", "deduct");

  if (error) throw error;

  return data?.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0) || 0;
}

/**
 * Get user's current subscription details
 */
export async function getUserSubscription() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("subscriptions" as any)
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching subscription:", error);
    return null;
  }

  return data as any;
}

/**
 * Subscribe to real-time credit updates
 */
export function subscribeToCreditsUpdates(callback: (balance: number) => void) {
  return supabase
    .channel('user_credits_updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'user_credits' },
      (payload: any) => {
        if (payload.new && typeof payload.new.balance === 'number') {
          callback(payload.new.balance);
        }
      }
    )
    .subscribe();
}