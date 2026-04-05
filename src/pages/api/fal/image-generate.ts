import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

fal.config({
  credentials: process.env.FAL_KEY,
});

type ImageGenerateRequest = {
  model: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  numImages?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
  enableSafetyChecker?: boolean;
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
      width = 1024,
      height = 1024,
      numImages = 1,
      guidanceScale = 7.5,
      numInferenceSteps = 50,
      seed,
      enableSafetyChecker = true,
    } = req.body as ImageGenerateRequest;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Model and prompt are required" });
    }

    // Map model IDs to Fal.ai endpoints
    const modelEndpoints: Record<string, string> = {
      "flux-pro-1.1": "fal-ai/flux-pro/v1.1",
      "flux-pro": "fal-ai/flux-pro",
      "flux-dev": "fal-ai/flux/dev",
      "flux-schnell": "fal-ai/flux/schnell",
      "flux-realism": "fal-ai/flux-realism",
      "nana-banana-2": "fal-ai/nano-banana-2",
      "nana-banana-1.5-pro": "fal-ai/nano-banana/v1.5-pro",
      "sd-3.5-large": "fal-ai/stable-diffusion-v35-large",
      "sd-xl": "fal-ai/fast-sdxl",
      "grok-image": "fal-ai/grok/image",
      "recraft-v3": "fal-ai/recraft-v3",
      "ideogram-v2": "fal-ai/ideogram/v2",
      "ideogram-v1": "fal-ai/ideogram/v1",
      "playground-v2.5": "fal-ai/playground-v25",
      "playground-v2": "fal-ai/playground-v2",
      "auraflow": "fal-ai/aura-flow",
      "imagen-4": "fal-ai/imagen/v4",
    };

    const endpoint = modelEndpoints[model];
    if (!endpoint) {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    console.log(`Generating image with ${endpoint}...`);

    const result = await fal.subscribe(endpoint, {
      input: {
        prompt,
        negative_prompt: negativePrompt,
        image_size: {
          width,
          height,
        },
        num_images: numImages,
        guidance_scale: guidanceScale,
        num_inference_steps: numInferenceSteps,
        ...(seed && { seed }),
        enable_safety_checker: enableSafetyChecker,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation in progress...");
        }
      },
    });

    console.log("Generation complete:", result);

    return res.status(200).json({
      success: true,
      images: result.data.images,
      seed: result.data.seed,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate image",
    });
  }
}