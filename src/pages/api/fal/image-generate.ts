import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/client";

// Configure fal.ai with API key
fal.config({
  credentials: process.env.FAL_KEY,
});

export const config = {
  maxDuration: 60,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, model = "fal-ai/flux-pro", aspect_ratio = "1:1", negative_prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY not configured" });
    }

    // Map aspect ratios to dimensions
    const aspectRatioMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "16:9": { width: 1344, height: 768 },
      "9:16": { width: 768, height: 1344 },
      "4:3": { width: 1152, height: 896 },
      "3:4": { width: 896, height: 1152 },
    };

    const dimensions = aspectRatioMap[aspect_ratio] || aspectRatioMap["1:1"];

    // Call fal.ai API
    const result = await fal.subscribe(model, {
      input: {
        prompt,
        negative_prompt,
        image_size: {
          width: dimensions.width,
          height: dimensions.height,
        },
        num_inference_steps: model.includes("flux-pro") ? 28 : 4,
        guidance_scale: 3.5,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    // Return the generated image URL
    const imageUrl = result.data?.images?.[0]?.url;
    
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    return res.status(200).json({
      success: true,
      image_url: imageUrl,
      seed: result.data?.seed,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate image",
    });
  }
}