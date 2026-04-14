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
  imageUrls?: string[];
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
      imageUrls = [],
      videoUrl,
      audioUrl,
    } = req.body as VideoGenerateRequest;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Model and prompt are required" });
    }

    // Map model IDs to Fal.ai endpoints
    const modelEndpoints: Record<string, string> = {
      // Kling models
      "kling-3.0": "fal-ai/kling-video/v3/pro",
      "kling-2.6": "fal-ai/kling-video/v2.6/pro",

      // Luma models
      "luma-1.6": "fal-ai/luma-dream-machine/v1.6",

      // Runway models
      "runway-gen3-turbo": "fal-ai/runway-gen3/turbo",
      "runway-gen3-alpha": "fal-ai/runway-gen3/alpha",

      // MiniMax models
      "minimax-02": "fal-ai/minimax-video/02",
      "minimax-02-fast": "fal-ai/minimax-video/02/fast",

      // Hunyuan
      "hunyuan-1.0": "fal-ai/hunyuan-video",

      // Grok
      "grok-1.0": "fal-ai/grok/video",

      // Seedance
      "seedance-1.5-pro": "fal-ai/seedance/v1.5-pro",

      // Sora models
      "sora-2-pro-max": "fal-ai/sora/v2-pro-max",
      "sora-2-max": "fal-ai/sora/v2-max",

      // Veo models
      "veo-3.1": "fal-ai/veo/v3.1",

      // LTX-2 (multimodal)
      "ltx-2-19b": "fal-ai/ltx-video",

      // Wan
      "wan-2.2": "fal-ai/wan/v2.2",
    };

    const endpoint = modelEndpoints[model];
    if (!endpoint) {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    console.log(`Generating video with ${endpoint}...`);

    let result: any;

    // Kling models - support 2 images
    if (model.startsWith("kling-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(seed && { seed }),
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(imageUrls.length > 1 && { image_url_end: imageUrls[1] }),
        },
        logs: true,
      });
    }
    // Luma Dream Machine - supports 2 images (start + end frame)
    else if (model.startsWith("luma-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(imageUrls.length > 1 && { image_url_end: imageUrls[1] }),
        },
        logs: true,
      });
    }
    // Runway Gen-3 - supports 2 images
    else if (model.startsWith("runway-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(seed && { seed }),
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
        },
        logs: true,
      });
    }
    // MiniMax - supports 1 image
    else if (model.startsWith("minimax-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
        },
        logs: true,
      });
    }
    // Hunyuan - supports 1 image
    else if (model === "hunyuan-1.0") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(seed && { seed }),
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
        },
        logs: true,
      });
    }
    // Grok - supports 1 image
    else if (model === "grok-1.0") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
        },
        logs: true,
      });
    }
    // Seedance - supports 1 image
    else if (model.startsWith("seedance-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(seed && { seed }),
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
        },
        logs: true,
      });
    }
    // Sora models - support 1 image + 1 audio
    else if (model.startsWith("sora-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(audioUrl && { audio_url: audioUrl }),
          ...(seed && { seed }),
        },
        logs: true,
      });
    }
    // Veo 3.1 - supports 1 image + 1 audio
    else if (model === "veo-3.1") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(audioUrl && { audio_url: audioUrl }),
        },
        logs: true,
      });
    }
    // LTX-2 - Multimodal (1 image + 1 video + 1 audio)
    else if (model === "ltx-2-19b") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(videoUrl && { video_url: videoUrl }),
          ...(audioUrl && { audio_url: audioUrl }),
          ...(seed && { seed }),
        },
        logs: true,
      });
    }
    // Wan - supports 2 images
    else if (model === "wan-2.2") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          duration,
          aspect_ratio: aspectRatio,
          ...(imageUrls.length > 0 && { image_url: imageUrls[0] }),
          ...(imageUrls.length > 1 && { image_url_end: imageUrls[1] }),
        },
        logs: true,
      });
    }
    // Fallback for any other models
    else {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          duration,
          aspect_ratio: aspectRatio,
          fps,
          ...(seed && { seed }),
        },
        logs: true,
      });
    }

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