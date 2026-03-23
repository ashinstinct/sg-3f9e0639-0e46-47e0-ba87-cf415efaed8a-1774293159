import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const creditsService = {
  async getUserCredits(userId: string): Promise<Tables<"credits"> | null> {
    const { data, error } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching credits:", error);
      return null;
    }

    return data;
  },

  async deductCredits(userId: string, amount: number, tool: string): Promise<boolean> {
    try {
      const credits = await this.getUserCredits(userId);
      if (!credits) return false;

      let updatedFreeCredits = credits.free_credits;
      let updatedPaidCredits = credits.paid_credits;

      // Use free credits first, then paid credits
      if (credits.free_credits >= amount) {
        updatedFreeCredits -= amount;
      } else {
        const remaining = amount - credits.free_credits;
        if (credits.paid_credits >= remaining) {
          updatedFreeCredits = 0;
          updatedPaidCredits -= remaining;
        } else {
          // Not enough credits
          return false;
        }
      }

      // Update credits
      const { error: updateError } = await supabase
        .from("credits")
        .update({
          free_credits: updatedFreeCredits,
          paid_credits: updatedPaidCredits,
        })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // Log usage
      await supabase.from("usage_logs").insert({
        user_id: userId,
        tool_name: tool,
        credits_used: amount,
        tier: "free",
      });

      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      return false;
    }
  },

  async addPaidCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const credits = await this.getUserCredits(userId);
      if (!credits) return false;

      const { error } = await supabase
        .from("credits")
        .update({
          paid_credits: credits.paid_credits + amount,
        })
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error adding credits:", error);
      return false;
    }
  },

  async hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const credits = await this.getUserCredits(userId);
    if (!credits) return false;

    const totalCredits = credits.free_credits + credits.paid_credits;
    return totalCredits >= amount;
  },
};