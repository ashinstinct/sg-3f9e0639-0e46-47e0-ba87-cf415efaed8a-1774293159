import type { NextApiRequest, NextApiResponse } from "next";
import * as fal from "@fal-ai/serverless-client";
import formidable from "formidable";
import fs from "fs";

// Disable default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const falHeaders = {
  Authorization: `Key ${process.env.FAL_KEY}`,
};

// Helper to convert local file path to data URI
const fileToDataUri = async (filePath: string, mimetype: string) => {
  const data = await fs.promises.readFile(filePath);
  const base64 = data.toString("base64");
  return `data:${mimetype};base64,${base64}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({});
    const [fields, files] = await form.parse(req);

    const model = fields.model?.[0];
    const prompt = fields.prompt?.[0];
    const aspectRatio = fields.aspect_ratio?.[0] || "16:9";
    const durationStr = fields.duration?.[0] || "5";
    const duration = parseInt(durationStr, 10);
    const mode = fields.mode?.[0] || "frames";
    const fps = fields.fps?.[0] ? parseInt(fields.fps[0], 10) : 24;

    if (!model || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Process file uploads into data URIs
    let startFrameUrl = null;
    let endFrameUrl = null;
    let videoUrl = null;
    let audioUrl = null;
    const elementUrls: string[] = [];

    const startFile = Array.isArray(files.start_frame) ? files.start_frame[0] : files.start_frame;
    if (startFile) {
      startFrameUrl = await fileToDataUri(startFile.filepath, startFile.mimetype || "image/jpeg");
    }

    const endFile = Array.isArray(files.end_frame) ? files.end_frame[0] : files.end_frame;
    if (endFile) {
      endFrameUrl = await fileToDataUri(endFile.filepath, endFile.mimetype || "image/jpeg");
    }

    const videoFile = Array.isArray(files.video) ? files.video[0] : files.video;
    if (videoFile) {
      videoUrl = await fileToDataUri(videoFile.filepath, videoFile.mimetype || "video/mp4");
    }

    const audioFile = Array.isArray(files.audio) ? files.audio[0] : files.audio;
    if (audioFile) {
      audioUrl = await fileToDataUri(audioFile.filepath, audioFile.mimetype || "audio/mpeg");
    }

    // Process elements for Kling Omni
    for (let i = 0; i < 5; i++) {
      const elFileRaw = files[`element_${i}`];
      const elFile = Array.isArray(elFileRaw) ? elFileRaw[0] : elFileRaw;
      if (elFile) {
        const uri = await fileToDataUri(elFile.filepath, elFile.mimetype || "image/jpeg");
        elementUrls.push(uri);
      }
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
      "runway-gen3-alpha": "fal-ai/runway-gen3/turbo", // Using turbo as default
      "runway-gen3-turbo": "fal-ai/runway-gen3/turbo",

      // MiniMax models
      "minimax-02": "fal-ai/minimax/video-01",
      "minimax-02-fast": "fal-ai/minimax/video-01",

      // Hunyuan models
      "hunyuan-1.0": "fal-ai/hunyuan-video",

      // Grok models
      "grok-1.0": "fal-ai/grok-video",

      // Seedance models
      "seedance-1.5-pro": "fal-ai/seedance-video",

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

      // Wan models
      "wan-2.2": "fal-ai/wan-video",
    };

    const endpoint = modelEndpoints[model];
    if (!endpoint) {
      return res.status(400).json({ error: "Invalid model selected" });
    }

    // Build request payload based on model
    const payload: any = {
      prompt: prompt,
      aspect_ratio: aspectRatio,
      duration: duration.toString(),
    };

    // Handle Kling Omni specific modes
    if (model === "kling-omni-3.0") {
      if (mode === "elements" && elementUrls.length > 0) {
        payload.element_images = elementUrls;
      } else if (mode === "frames") {
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

    console.log(`Calling Fal.ai endpoint: ${endpoint}`);

    // Clean up temporary files
    try {
      if (startFile) fs.unlinkSync(startFile.filepath);
      if (endFile) fs.unlinkSync(endFile.filepath);
      if (videoFile) fs.unlinkSync(videoFile.filepath);
      if (audioFile) fs.unlinkSync(audioFile.filepath);
      for (let i = 0; i < 5; i++) {
        const elFileRaw = files[`element_${i}`];
        const elFile = Array.isArray(elFileRaw) ? elFileRaw[0] : elFileRaw;
        if (elFile) fs.unlinkSync(elFile.filepath);
      }
    } catch (e) {
      console.warn("Failed to clean up temp files:", e);
    }

    const result = await fal.subscribe(endpoint, {
      input: payload,
      pollInterval: 2000,
      logs: true,
      onQueueUpdate(update) {
        console.log("Queue update:", update);
      },
    });

    console.log("Generation complete:", result);

    // Standardize output format
    let videoOutputUrl = null;
    if (result.video?.url) {
      videoOutputUrl = result.video.url;
    } else if (result.url) {
      videoOutputUrl = result.url;
    } else if (result.output?.url) {
      videoOutputUrl = result.output.url;
    }

    if (!videoOutputUrl) {
      console.error("Unexpected response format:", result);
      return res.status(500).json({ error: "Failed to get video URL from response" });
    }

    return res.status(200).json({
      video: {
        url: videoOutputUrl,
        contentType: "video/mp4",
      },
      seed: result.seed,
    });
  } catch (error: any) {
    console.error("Fal.ai generation error:", error);
    
    // Check for validation errors
    if (error.body?.detail) {
      console.error("Validation details:", error.body.detail);
    }

    return res.status(500).json({
      error: error.message || "Failed to generate video",
    });
  }
}