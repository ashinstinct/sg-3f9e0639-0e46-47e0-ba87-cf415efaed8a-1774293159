import type { NextApiRequest, NextApiResponse } from "next";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 
                          process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 
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
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/video-download`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url.trim(),
        format_id: formatId || "best",
        is_audio_only: isAudioOnly || false,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      return res.status(response.status).json({
        error: data.error || "Failed to download video",
      });
    }

    // Stream the file back to client
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = response.headers.get("content-disposition") || "";

    res.setHeader("Content-Type", contentType);
    if (contentDisposition) {
      res.setHeader("Content-Disposition", contentDisposition);
    }

    // Pipe the response
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error("Download API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to download video",
    });
  }
}