import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

// Configure FAL client with API key from environment
fal.config({
  credentials: process.env.FAL_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    operation,
    imageUrl,
    prompt,
    maskUrl,
    negativePrompt,
    strength,
    scale,
    direction,
  } = req.body;

  if (!imageUrl || !operation) {
    return res.status(400).json({ success: false, error: "Image URL and operation are required" });
  }

  try {
    let result;

    switch (operation) {
      case "inpaint":
        // AI Inpainting - remove/replace objects
        result = await fal.subscribe("fal-ai/flux/dev/inpainting", {
          input: {
            image_url: imageUrl,
            mask_url: maskUrl,
            prompt: prompt || "remove object",
            negative_prompt: negativePrompt,
            strength: strength || 0.95,
          },
        });
        break;

      case "outpaint":
        // AI Outpainting - extend image borders
        result = await fal.subscribe("fal-ai/flux-pro/v1.1/outpainting", {
          input: {
            image_url: imageUrl,
            prompt: prompt || "extend image seamlessly",
            direction: direction || "all", // top, bottom, left, right, all
            num_inference_steps: 50,
          },
        });
        break;

      case "upscale":
        // AI Upscaling - enhance resolution
        result = await fal.subscribe("fal-ai/clarity-upscaler", {
          input: {
            image_url: imageUrl,
            scale: scale || 2, // 2x or 4x
          },
        });
        break;

      case "background-remove":
        // Background removal
        result = await fal.subscribe("fal-ai/birefnet", {
          input: {
            image_url: imageUrl,
          },
        });
        break;

      case "relight":
        // AI Relighting
        result = await fal.subscribe("fal-ai/flux/dev/relight", {
          input: {
            image_url: imageUrl,
            prompt: prompt || "natural lighting",
            num_inference_steps: 30,
          },
        });
        break;

      case "enhance":
        // Smart enhancement
        result = await fal.subscribe("fal-ai/aura-flow", {
          input: {
            image_url: imageUrl,
            prompt: prompt || "enhance quality and details",
            num_inference_steps: 25,
          },
        });
        break;

      default:
        return res.status(400).json({ success: false, error: "Invalid operation" });
    }

    // Return the edited image
    const outputImage = result.images?.[0]?.url || result.image?.url;
    
    if (!outputImage) {
      throw new Error("No output image received");
    }

    return res.status(200).json({
      success: true,
      image: {
        url: outputImage,
        width: result.images?.[0]?.width || result.image?.width,
        height: result.images?.[0]?.height || result.image?.height,
      },
    });
  } catch (error: any) {
    console.error("Image editing error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to edit image",
    });
  }
}