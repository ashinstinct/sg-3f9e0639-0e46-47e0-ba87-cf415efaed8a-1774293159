import type { NextApiRequest, NextApiResponse } from "next";
import { fal } from "@fal-ai/client";

// Configure fal.ai client
fal.config({
  credentials: process.env.FAL_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
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
      prompt,
      model,
      duration = 5,
      aspect_ratio = "16:9",
      quality = "1080p",
      start_frame,
      end_frame,
      negative_prompt,
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!model) {
      return res.status(400).json({ error: "Model is required" });
    }

    console.log("Generating video with:", { model, prompt, duration, aspect_ratio, quality });

    // Prepare input based on model requirements
    const input: any = {
      prompt,
    };

    // Add common parameters
    if (negative_prompt) {
      input.negative_prompt = negative_prompt;
    }

    // Model-specific configurations
    if (model.includes("kling")) {
      input.duration = duration;
      input.aspect_ratio = aspect_ratio;
      if (start_frame) input.image_url = start_frame;
    } else if (model.includes("luma")) {
      input.aspect_ratio = aspect_ratio;
      if (start_frame) input.image_url = start_frame;
    } else if (model.includes("runway")) {
      input.duration = duration;
      input.ratio = aspect_ratio;
      if (start_frame) input.image_url = start_frame;
    } else if (model.includes("minimax")) {
      input.duration = duration;
      if (start_frame) input.first_frame_image = start_frame;
      if (end_frame) input.last_frame_image = end_frame;
    } else if (model.includes("hunyuan")) {
      input.duration = duration;
      if (start_frame) input.image_url = start_frame;
    } else if (model.includes("sora") || model.includes("veo") || model.includes("seedream")) {
      input.duration = duration;
      input.aspect_ratio = aspect_ratio;
      if (start_frame) input.image_url = start_frame;
      if (end_frame) input.end_image_url = end_frame;
    }

    // Call fal.ai API
    const result = await fal.subscribe(model, {
      input,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    console.log("Generation complete:", result);

    // Extract video URL from result
    const resultData = result as any;
    let videoUrl = "";
    
    if (resultData.video) {
      videoUrl = typeof resultData.video === "string" ? resultData.video : resultData.video.url;
    } else if (resultData.data?.video) {
      videoUrl = typeof resultData.data.video === "string" ? resultData.data.video : resultData.data.video.url;
    }

    if (!videoUrl) {
      throw new Error("No video URL in response");
    }

    return res.status(200).json({
      video_url: videoUrl,
      duration: resultData.duration || duration,
      model,
    });
  } catch (error) {
    console.error("Video generation error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate video",
    });
  }
}