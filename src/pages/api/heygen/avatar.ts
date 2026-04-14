import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

// Configure fal.ai
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

  try {
    const { 
      avatarImage,
      audioSource,
      text,
      voice
    } = req.body;

    if (!avatarImage || (!audioSource && !text)) {
      return res.status(400).json({ 
        error: "Missing required fields: avatarImage and either audioSource or text" 
      });
    }

    console.log("Generating avatar video with Hedra...");

    // Generate talking avatar video using fal.ai Hedra
    const result = await fal.subscribe("fal-ai/hedra", {
      input: {
        avatar_image: avatarImage,
        audio_source: audioSource || undefined,
        text: text || undefined,
        voice_id: voice || "ash" // Default voice
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Hedra progress:", update.logs);
        }
      },
    });

    console.log("Hedra generation complete:", result);

    return res.status(200).json({
      success: true,
      video_url: result.video?.url || result.data?.video?.url,
      data: result
    });

  } catch (error: unknown) {
    console.error("Hedra API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate avatar video"
    });
  }
}