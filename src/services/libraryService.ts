import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ImageGeneration = Tables<"image_generations">;
export type VideoGeneration = Tables<"video_generations">;

/**
 * Save a generated image to user's library
 */
export async function saveImageGeneration(data: {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  modelName: string;
  versionName?: string;
  width?: number;
  height?: number;
  guidanceScale?: number;
  numSteps?: number;
  seed?: number;
  creditsUsed: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data: generation, error } = await supabase
      .from("image_generations")
      .insert({
        user_id: user.id,
        image_url: data.imageUrl,
        prompt: data.prompt,
        negative_prompt: data.negativePrompt || null,
        model_id: data.modelId,
        model_name: data.modelName,
        version_name: data.versionName || null,
        width: data.width || null,
        height: data.height || null,
        guidance_scale: data.guidanceScale || null,
        num_steps: data.numSteps || null,
        seed: data.seed || null,
        credits_used: data.creditsUsed,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving image generation:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: generation };
  } catch (err) {
    console.error("Save image error:", err);
    return { success: false, error: "Failed to save image generation" };
  }
}

/**
 * Save a generated video to user's library
 */
export async function saveVideoGeneration(data: {
  videoUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
  modelName: string;
  versionName?: string;
  duration?: number;
  aspectRatio?: string;
  creditsUsed: number;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data: generation, error } = await supabase
      .from("video_generations")
      .insert({
        user_id: user.id,
        video_url: data.videoUrl,
        thumbnail_url: data.thumbnailUrl || null,
        prompt: data.prompt,
        negative_prompt: data.negativePrompt || null,
        model_id: data.modelId,
        model_name: data.modelName,
        version_name: data.versionName || null,
        duration: data.duration || null,
        aspect_ratio: data.aspectRatio || null,
        credits_used: data.creditsUsed,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving video generation:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: generation };
  } catch (err) {
    console.error("Save video error:", err);
    return { success: false, error: "Failed to save video generation" };
  }
}

/**
 * Get user's image generation history
 */
export async function getImageGenerations(limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("image_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching image generations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get images error:", err);
    return [];
  }
}

/**
 * Get user's video generation history
 */
export async function getVideoGenerations(limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("video_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching video generations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Get videos error:", err);
    return [];
  }
}

/**
 * Delete an image generation
 */
export async function deleteImageGeneration(id: string) {
  try {
    const { error } = await supabase
      .from("image_generations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting image:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete image error:", err);
    return { success: false, error: "Failed to delete image" };
  }
}

/**
 * Delete a video generation
 */
export async function deleteVideoGeneration(id: string) {
  try {
    const { error } = await supabase
      .from("video_generations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting video:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Delete video error:", err);
    return { success: false, error: "Failed to delete video" };
  }
}

/**
 * Generic library functions for Avatar
 */
export async function saveToLibrary(data: {
  url: string;
  type: string;
  metadata: any;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Save as video generation since we don't have a generic library table
    const { data: generation, error } = await supabase
      .from("video_generations")
      .insert({
        user_id: user.id,
        video_url: data.url,
        thumbnail_url: data.url, // Video URL works as fallback
        prompt: data.metadata?.script || "Audio Lip Sync",
        model_id: "fal-ai/hedra",
        model_name: "Hedra Avatar",
        aspect_ratio: data.metadata?.aspect_ratio || "16:9",
        credits_used: 15,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving to library:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: generation };
  } catch (err) {
    console.error("Save error:", err);
    return { success: false, error: "Failed to save" };
  }
}

export async function getLibraryItems(type: string, limit = 50) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("video_generations")
      .select("*")
      .eq("user_id", user.id)
      .eq("model_id", "fal-ai/hedra")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching library items:", error);
      return [];
    }

    // Format to match expected interface
    return (data || []).map(item => ({
      id: item.id,
      url: item.video_url,
      type: "avatar",
      created_at: item.created_at,
      metadata: {
        avatar: item.model_name,
        script: item.prompt,
        aspect_ratio: item.aspect_ratio
      }
    }));
  } catch (err) {
    console.error("Get items error:", err);
    return [];
  }
}

export async function deleteLibraryItem(id: string) {
  return deleteVideoGeneration(id);
}