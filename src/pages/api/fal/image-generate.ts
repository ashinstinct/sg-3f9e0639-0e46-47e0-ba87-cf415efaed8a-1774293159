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
  image_size?: string;
  referenceImages?: string[]; // For models that support multiple reference images
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
      guidanceScale = 3.5,
      numInferenceSteps = 28,
      seed,
      enableSafetyChecker = true,
      image_size = "landscape_16_9",
      referenceImages = [],
    } = req.body as ImageGenerateRequest;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Model and prompt are required" });
    }

    // Map model IDs to Fal.ai endpoints
    const modelEndpoints: Record<string, string> = {
      // FLUX models
      "flux-pro-1.1": "fal-ai/flux-pro/v1.1",
      "flux-pro": "fal-ai/flux-pro",
      "flux-dev": "fal-ai/flux/dev",
      "flux-schnell": "fal-ai/flux/schnell",
      "flux-realism": "fal-ai/flux-realism",
      
      // Nano Banana models
      "nano-banana-2": "fal-ai/nano-banana/v2",
      "nano-banana-1.5-pro": "fal-ai/nano-banana/v1.5-pro",
      
      // Stable Diffusion models
      "sd-3.5-large": "fal-ai/stable-diffusion-v35-large",
      "sd-xl": "fal-ai/fast-sdxl",
      
      // Google models
      "imagen-4": "fal-ai/google/imagen-4",
      
      // Grok models
      "grok-1.5-image": "fal-ai/grok/image",
      
      // Seedream models
      "seedream-4.5": "fal-ai/seedream/v4.5",
      "seedream-4.5-turbo": "fal-ai/seedream/v4.5/turbo",
      
      // Recraft models
      "recraft-v3": "fal-ai/recraft-v3",
      
      // Ideogram models
      "ideogram-v2": "fal-ai/ideogram/v2",
      "ideogram-v1": "fal-ai/ideogram/v1",
      
      // Playground models
      "playground-v2.5": "fal-ai/playground-v25",
      
      // AuraFlow models
      "auraflow": "fal-ai/aura-flow",
    };

    const endpoint = modelEndpoints[model];
    if (!endpoint) {
      return res.status(400).json({ error: `Unsupported model: ${model}` });
    }

    console.log(`Generating image with ${endpoint}...`);

    let result: any;

    // Nano Banana 2 - supports up to 14 reference images
    if (model === "nano-banana-2") {
      result = await fal.subscribe("fal-ai/nano-banana/v2", {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_inference_steps: numInferenceSteps || 28,
          guidance_scale: guidanceScale || 3.5,
          num_images: numImages || 1,
          seed: seed,
          enable_safety_checker: enableSafetyChecker,
          ...(referenceImages.length > 0 && { reference_images: referenceImages.slice(0, 14) }),
        },
      });
    }
    // Nano Banana 1.5 Pro - supports up to 8 reference images
    else if (model === "nano-banana-1.5-pro") {
      result = await fal.subscribe("fal-ai/nano-banana/v1.5-pro", {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_inference_steps: numInferenceSteps || 35,
          guidance_scale: guidanceScale || 4.0,
          num_images: numImages || 1,
          seed: seed,
          enable_safety_checker: enableSafetyChecker,
          ...(referenceImages.length > 0 && { reference_images: referenceImages.slice(0, 8) }),
        },
      });
    }
    // FLUX models - support up to 3 reference images
    else if (model.startsWith("flux-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_images: numImages,
          guidance_scale: guidanceScale || 3.5,
          num_inference_steps: numInferenceSteps || 50,
          seed: seed,
          enable_safety_checker: enableSafetyChecker,
          ...(referenceImages.length > 0 && { image_url: referenceImages[0] }),
          ...(referenceImages.length > 1 && { controlnet_image_url: referenceImages[1] }),
        },
      });
    }
    // Stable Diffusion models - support up to 3 reference images
    else if (model.startsWith("sd-")) {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_images: numImages,
          guidance_scale: guidanceScale || 7.5,
          num_inference_steps: numInferenceSteps || 50,
          seed: seed,
          enable_safety_checker: enableSafetyChecker,
          ...(referenceImages.length > 0 && { image_url: referenceImages[0] }),
        },
      });
    }
    // Seedream models - support up to 3 reference images
    else if (model.startsWith("seedream-")) {
      const isturbo = model.includes("turbo");
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_inference_steps: isturbo ? 20 : 30,
          guidance_scale: guidanceScale || 7.0,
          num_images: numImages || 1,
          seed: seed,
          ...(referenceImages.length > 0 && { reference_image_url: referenceImages[0] }),
        },
      });
    }
    // Grok Image - supports up to 2 reference images
    else if (model === "grok-1.5-image") {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
          num_inference_steps: numInferenceSteps || 35,
          guidance_scale: guidanceScale || 7.5,
          num_images: numImages || 1,
          seed: seed,
          ...(referenceImages.length > 0 && { reference_image_url: referenceImages[0] }),
        },
      });
    }
    // Text-only models (no image inputs)
    else {
      result = await fal.subscribe(endpoint, {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          image_size,
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
    }

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