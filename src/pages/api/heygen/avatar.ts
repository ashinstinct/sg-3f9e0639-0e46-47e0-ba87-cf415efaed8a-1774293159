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
    const { 
      avatarId,
      voiceId,
      text,
      aspectRatio = "16:9",
      test = false
    } = req.body;

    if (!avatarId || !text || !voiceId) {
      return res.status(400).json({ 
        error: "Missing required fields: avatarId, voiceId, and text are required" 
      });
    }

    console.log("Generating Heygen avatar video via fal.ai...");

    // Use fal.ai's Heygen endpoint
    const result = await fal.subscribe("fal-ai/heygen/avatar-video", {
      input: {
        avatar_id: avatarId,
        voice_id: voiceId,
        text: text,
        aspect_ratio: aspectRatio,
        test: test
      },
      logs: true,
      onQueueUpdate(update) {
        console.log("Queue update:", update);
      },
    }) as any;

    console.log("Avatar video generation complete:", result);

    if (!result.video?.url) {
      return res.status(500).json({ 
        error: "Failed to generate video - no URL returned" 
      });
    }

    return res.status(200).json({
      video_url: result.video.url,
      thumbnail_url: result.thumbnail?.url,
      duration: result.duration,
      seed: result.seed
    });

  } catch (error: any) {
    console.error("Fal.ai Heygen error:", error);
    
    return res.status(500).json({
      error: error.message || "Failed to generate avatar video"
    });
  }
}