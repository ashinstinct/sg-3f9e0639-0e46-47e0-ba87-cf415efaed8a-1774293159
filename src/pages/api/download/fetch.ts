import type { NextApiRequest, NextApiResponse } from "next";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5328";

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
    // Call Python backend yt-dlp download endpoint
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/video-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url,
        format_id: formatId || "best",
        is_audio_only: isAudioOnly || false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }

    // Stream the file from Python backend to client
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";

    res.setHeader("Content-Type", contentType);
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }

    // Pipe the response
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    return res.send(buffer);
  } catch (error) {
    console.error("Video download API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to download video",
    });
  }
}