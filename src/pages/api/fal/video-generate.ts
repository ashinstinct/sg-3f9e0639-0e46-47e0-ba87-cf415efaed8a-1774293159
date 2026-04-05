import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

type VideoGenerateRequest = {
  model: string;
  prompt: string;
  negativePrompt?: string;
  duration?: number;
  aspectRatio?: string;
  fps?: number;
  seed?: number;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
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
      model,
      prompt,
      negativePrompt,
      duration = 5,
      aspectRatio = "16:9",
      fps = 24,
      seed,
      imageUrl,
      videoUrl,
      audioUrl,
    } = req.body as VideoGenerateRequest;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Model and prompt are required" });
    }

    // Map model IDs to Fal.ai endpoints
    const modelEndpoints: Record<string, string> = {
      // Kling models
      "kling-3.0-pro": "fal-ai/kling-video/v3/pro",
      "kling-3.0-standard": "fal-ai/kling-video/v3/standard",
      "kling-1.6-pro": "fal-ai/kling-video/v1.6/pro",
      "kling-1.5-pro": "fal-ai/kling-video/v1.5/pro",
      "kling-1.0-pro": "fal-ai/kling-video/v1/pro",
      "kling-1.0-standard": "fal-ai/kling-video/v1/standard",

      // Luma models
      "luma-1.6": "fal-ai/luma-dream-machine/v1.6",
      "luma-1.5": "fal-ai/luma-dream-machine/v1.5",

      // Runway models
      "runway-gen3-turbo": "fal-ai/runway-gen3/turbo",
      "runway-gen3-alpha": "fal-ai/runway-gen3/alpha",

      // MiniMax
      "minimax-video": "fal-ai/minimax-video",

      // Hunyuan
      "hunyuan-video": "fal-ai/hunyuan-video",

      // Grok
      "grok-video": "fal-ai/grok/video",

      // Seedance
      "seedance-1.5-pro": "fal-ai/seedance/v1.5-pro",

      // Sora models
      "sora-2-pro-max": "fal-ai/sora/v2-pro-max",
      "sora-2-max": "fal-ai/sora/v2-max",
      "sora-2-pro": "fal-ai/sora/v2-pro",
      "sora-2": "fal-ai/sora/v2",

      // Veo models
      "veo-3.1": "fal-ai/veo/v3.1",
      "veo-3.0": "fal-ai/veo/v3.0",

      // LTX-2
      "ltx-2-19b": "fal-ai/ltx-video",

      // Seedream
      "seedream-2.0": "fal-ai/seedream/v2",

      // Wan
      "wan-2.2": "fal-ai/wan/v2.2",
    };

    const endpoint = modelEndpoints[model];
    if (!endpoint) {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    console.log(`Generating video with ${endpoint}...`);

    // Build input based on model capabilities
    const input: any = {
      prompt,
      negative_prompt: negativePrompt,
      duration,
      aspect_ratio: aspectRatio,
      fps,
      ...(seed && { seed }),
    };

    // LTX-2 multimodal inputs
    if (model === "ltx-2-19b") {
      if (imageUrl) input.image_url = imageUrl;
      if (videoUrl) input.video_url = videoUrl;
      if (audioUrl) input.audio_url = audioUrl;
    }

    const result = await fal.subscribe(endpoint, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation in progress...");
        }
      },
    });

    console.log("Video generation complete:", result);

    return res.status(200).json({
      success: true,
      video: result.data.video,
      seed: result.data.seed,
      duration: result.data.duration,
    });
  } catch (error: any) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate video",
    });
  }
}