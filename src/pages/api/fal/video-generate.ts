import type { NextApiRequest, NextApiResponse } from "next";
import { fal } from "@fal-ai/client";

// Video generation models available on fal.ai
const VIDEO_MODELS = {
  "kling": "fal-ai/kling-video/v1.5/standard/text-to-video",
  "luma": "fal-ai/luma-dream-machine",
  "runway": "fal-ai/runway-gen3/turbo/text-to-video",
  "minimax": "fal-ai/minimax-video",
  "hunyuan": "fal-ai/hunyuan-video",
} as const;

type VideoModel = keyof typeof VIDEO_MODELS;

interface GenerateVideoRequest {
  prompt: string;
  model: VideoModel;
  duration?: number;
  aspect_ratio?: string;
  negative_prompt?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, model, duration = 5, aspect_ratio = "16:9", negative_prompt } = req.body as GenerateVideoRequest;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!model || !VIDEO_MODELS[model]) {
      return res.status(400).json({ error: "Invalid model specified" });
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return res.status(500).json({ error: "FAL API key not configured" });
    }

    // Configure fal.ai client
    fal.config({
      credentials: falKey,
    });

    console.log(`Generating video with ${model}:`, { prompt, duration, aspect_ratio });

    // Generate video based on model
    let result;
    const modelPath = VIDEO_MODELS[model];

    // Different models have different input formats
    if (model === "kling") {
      result = await fal.subscribe(modelPath, {
        input: {
          prompt,
          negative_prompt: negative_prompt || undefined,
          duration: duration.toString(),
          aspect_ratio,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Video generation progress:", update.logs);
          }
        },
      });
    } else if (model === "luma") {
      result = await fal.subscribe(modelPath, {
        input: {
          prompt,
          aspect_ratio,
          loop: false,
        },
        logs: true,
      });
    } else if (model === "runway") {
      result = await fal.subscribe(modelPath, {
        input: {
          prompt,
          duration: duration.toString(),
          aspect_ratio,
        },
        logs: true,
      });
    } else if (model === "minimax" || model === "hunyuan") {
      result = await fal.subscribe(modelPath, {
        input: {
          prompt,
          negative_prompt: negative_prompt || undefined,
        },
        logs: true,
      });
    }

    console.log("Video generation result:", result);

    // Extract video URL from result
    let videoUrl = "";
    if (result?.data?.video?.url) {
      videoUrl = result.data.video.url;
    } else if (result?.data?.url) {
      videoUrl = result.data.url;
    } else if (Array.isArray(result?.data?.videos) && result.data.videos[0]?.url) {
      videoUrl = result.data.videos[0].url;
    }

    if (!videoUrl) {
      console.error("No video URL in result:", result);
      return res.status(500).json({ error: "Failed to extract video URL from result" });
    }

    return res.status(200).json({
      success: true,
      video_url: videoUrl,
      model,
      prompt,
    });

  } catch (error) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate video",
    });
  }
}