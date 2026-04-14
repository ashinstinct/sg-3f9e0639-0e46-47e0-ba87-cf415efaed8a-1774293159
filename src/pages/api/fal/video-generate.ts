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
      aspectRatio,
      duration,
      startFrameUrl,
      endFrameUrl,
      elementUrls = [],
      klingMode = "frames",
      videoUrl,
      audioUrl,
      negativePrompt,
      seed,
    } = req.body;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Model and prompt are required" });
    }

    // Map model IDs to Fal.ai endpoints
    const modelEndpoints: Record<string, string> = {
      // Kling models
      "kling-3.0": "fal-ai/kling-video/v3.0/pro",
      "kling-omni-3.0": "fal-ai/kling-video/v3.0/omni",
      "kling-motion-3.0": "fal-ai/kling-video/v3.0/motion-control",
      "kling-2.6": "fal-ai/kling-video/v2.6/pro",
      "kling-2.5": "fal-ai/kling-video/v2.5/pro",
      "kling-2.1": "fal-ai/kling-video/v2.1/standard",

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
      "sora-2-pro": "fal-ai/sora/v2-pro",
      "sora-2-max": "fal-ai/sora/v2-max",
      "sora-2-fast": "fal-ai/sora/v2-fast",
      "sora-1-pro": "fal-ai/sora/v1-pro",
      "sora-1-turbo": "fal-ai/sora/v1-turbo",

      // Veo models
      "veo-3.1-pro-max": "fal-ai/veo/v3.1-pro-max",
      "veo-3.1-pro": "fal-ai/veo/v3.1-pro",
      "veo-3.1-fast": "fal-ai/veo/v3.1-fast",
      "veo-3.0-pro": "fal-ai/veo/v3.0-pro",
      "veo-3.0-fast": "fal-ai/veo/v3.0-fast",

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

    // Build request payload based on model
    const payload: any = {
      prompt: prompt,
      aspect_ratio: aspectRatio,
      duration: duration,
    };

    // Add negative prompt if provided
    if (negativePrompt) {
      payload.negative_prompt = negativePrompt;
    }

    // Add seed if provided
    if (seed) {
      payload.seed = seed;
    }

    // Handle Kling Omni specific modes
    if (model === "kling-omni-3.0") {
      if (klingMode === "elements" && elementUrls.length > 0) {
        payload.element_images = elementUrls;
      } else if (klingMode === "frames") {
        if (startFrameUrl) payload.start_image_url = startFrameUrl;
        if (endFrameUrl) payload.end_image_url = endFrameUrl;
      }
    }
    // Handle models with start/end frame support
    else if (model.includes("kling") || model.includes("runway") || model.includes("luma") || model.includes("wan")) {
      if (startFrameUrl) {
        payload.start_image_url = startFrameUrl;
      }
      if (endFrameUrl && (model === "kling-3.0" || model === "kling-2.6" || model.includes("runway") || model.includes("luma") || model.includes("wan"))) {
        payload.end_image_url = endFrameUrl;
      }
    }
    // Handle models with single image support (Sora, Veo, etc.)
    else if (startFrameUrl) {
      payload.image_url = startFrameUrl;
    }

    // Add video for LTX-2
    if (videoUrl && model === "ltx-2-19b") {
      payload.video_url = videoUrl;
    }

    // Add audio for Sora/Veo/LTX models
    if (audioUrl && (model.includes("sora") || model.includes("veo") || model === "ltx-2-19b")) {
      payload.audio_url = audioUrl;
    }

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