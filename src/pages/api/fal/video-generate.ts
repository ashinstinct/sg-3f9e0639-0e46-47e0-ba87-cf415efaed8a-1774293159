import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
});

// Map our model IDs to fal.ai endpoints
const MODEL_ENDPOINTS: Record<string, string> = {
  // Kling models
  "kling-3.0": "fal-ai/kling-video/v1.6/pro",
  "kling-2.6": "fal-ai/kling-video/v1.6/pro",
  "kling-2.5-pro": "fal-ai/kling-video/v1.5/pro",
  "kling-2.1": "fal-ai/kling-video/v1/pro",
  "kling-01": "fal-ai/kling-video/v1.0",
  "kling-omni": "fal-ai/kling-video/v1.6/pro",
  
  // Luma models
  "luma-1.6": "fal-ai/luma-dream-machine",
  
  // Runway models
  "runway-gen3-alpha": "fal-ai/runway-gen3/turbo/image-to-video",
  "runway-gen3-turbo": "fal-ai/runway-gen3/turbo/image-to-video",
  
  // MiniMax models
  "minimax-02": "fal-ai/minimax-video/image-to-video",
  "minimax-02-fast": "fal-ai/minimax-video/image-to-video",
  "minimax-2.3": "fal-ai/minimax-video/image-to-video",
  "minimax-2.3-fast": "fal-ai/minimax-video/image-to-video",
  
  // Hunyuan
  "hunyuan-1.0": "fal-ai/hunyuan-video",
  
  // Grok (if available)
  "grok-1.0": "fal-ai/grok-imagine/video",
  
  // Seedance
  "seedance-1.5-pro": "fal-ai/seedance/v1.5-pro",
  "seedance-pro": "fal-ai/seedance/pro",
  "seedance-pro-fast": "fal-ai/seedance/pro-fast",
  
  // Wan
  "wan-2.2-pro": "fal-ai/wan/v2.2-pro",
  "wan-2.2": "fal-ai/wan/v2.2",
  "wan-2.1": "fal-ai/wan/v2.1",
  "wan-2.0": "fal-ai/wan/v2.0",
  "wan-1.5": "fal-ai/wan/v1.5",
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      modelId,
      prompt,
      duration = 5,
      aspectRatio = "16:9",
      audioEnabled = false,
      startImage,
      endImage,
      elementImage,
      resolution = "1080p",
    } = req.body;

    // Validate input
    if (!modelId || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get endpoint for model
    const endpoint = MODEL_ENDPOINTS[modelId];
    if (!endpoint) {
      return res.status(400).json({ error: "Unsupported model" });
    }

    // Build request payload based on model
    const payload: any = {
      prompt,
      duration,
      aspect_ratio: aspectRatio,
    };

    // Add optional parameters
    if (audioEnabled) {
      payload.enable_audio = true;
    }

    if (startImage) {
      payload.image_url = startImage;
    }

    if (endImage && modelId.startsWith("kling")) {
      payload.end_image_url = endImage;
    }

    if (elementImage && (modelId === "kling-01" || modelId === "kling-omni")) {
      payload.element_image_url = elementImage;
    }

    // Map resolution
    if (resolution === "4K") {
      payload.resolution = "2160p";
    } else {
      payload.resolution = resolution.toLowerCase();
    }

    console.log("Calling fal.ai with:", { endpoint, payload });

    // Call fal.ai API
    const result = (await fal.subscribe(endpoint, {
      input: payload,
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update);
      },
    })) as any;

    console.log("fal.ai result:", result);

    // Return the video URL
    return res.status(200).json({
      success: true,
      videoUrl: result.video?.url || result.video_url || result.output?.url,
      duration: result.duration,
      data: result,
    });
  } catch (error: any) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate video",
      details: error.response?.data || error,
    });
  }
}