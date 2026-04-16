import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

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
    const { prompt, make_instrumental = false } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Generating music with SUNO:", { prompt, make_instrumental });

    // Use fal.ai's SUNO v3.5 model
    const result = await fal.subscribe("fal-ai/suno", {
      input: {
        prompt: prompt.trim(),
        make_instrumental,
        wait_audio: true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log("Queue update:", update.status);
      },
    });

    console.log("SUNO generation complete:", result);

    const falResult = result as any;

    // Return the generated music data
    return res.status(200).json({
      success: true,
      audio_url: falResult.audio_url || falResult.data?.audio_url,
      video_url: falResult.video_url || falResult.data?.video_url,
      title: falResult.title || falResult.data?.title,
      duration: falResult.duration || falResult.data?.duration,
      data: falResult,
    });
  } catch (error: unknown) {
    console.error("SUNO generation error:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate music",
    });
  }
}