import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";

// Initialize fal.ai client
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
      prompt,
      make_instrumental = false,
      wait_audio = false,
      model_version = "chirp-v3-5",
      duration = 30,
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Generating music with SUNO via fal.ai:", {
      prompt: prompt.trim(),
      make_instrumental,
      wait_audio,
      model_version,
      duration,
    });

    // Call fal.ai SUNO API
    const result = await fal.subscribe("fal-ai/suno", {
      input: {
        prompt: prompt.trim(),
        make_instrumental,
        wait_audio,
        model_version,
        duration,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("SUNO generation in progress:", update.logs);
        }
      },
    });

    console.log("SUNO generation complete:", result);

    // Return the generated music data
    return res.status(200).json({
      success: true,
      audio_url: result.audio_url || result.data?.audio_url,
      video_url: result.video_url || result.data?.video_url,
      title: result.title || result.data?.title,
      duration: result.duration || result.data?.duration,
      data: result,
    });
  } catch (error: unknown) {
    console.error("SUNO generation error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate music",
    });
  }
}