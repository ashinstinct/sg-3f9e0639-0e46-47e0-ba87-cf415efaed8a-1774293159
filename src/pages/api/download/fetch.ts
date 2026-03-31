import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                    "https://back2life-audio-processing.onrender.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, formatId, isAudioOnly } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log(`Downloading from: ${BACKEND_URL}/api/video-download`);
    
    const response = await fetch(`${BACKEND_URL}/api/video-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url.trim(),
        format_id: formatId || "best",
        is_audio_only: isAudioOnly || false,
      }),
      signal: AbortSignal.timeout(120000),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("video/") && !contentType.includes("audio/") && !contentType.includes("application/octet-stream")) {
      if (contentType.includes("application/json")) {
        const data = await response.json();
        return res.status(response.status).json({
          error: data.error || "Failed to download video",
        });
      }
      
      const text = await response.text();
      console.error("Backend returned non-file response:", text.substring(0, 200));
      
      return res.status(503).json({
        error: "Video download service is currently unavailable. Please try again in a moment.",
        hint: "The Python backend may need to be redeployed with yt-dlp support.",
      });
    }

    const contentDisposition = response.headers.get("content-disposition") || "";

    res.setHeader("Content-Type", contentType);
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
    
  } catch (error) {
    console.error("Download API error:", error);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res.status(504).json({
          error: "Download timed out. The video may be too large.",
        });
      }
      
      return res.status(500).json({
        error: `Failed to download video: ${error.message}`,
        hint: "The Python backend may not be accessible or may need to be restarted.",
      });
    }
    
    return res.status(500).json({
      error: "Failed to download video",
    });
  }
}