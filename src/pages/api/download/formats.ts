import type { NextApiRequest, NextApiResponse } from "next";

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || "http://localhost:5328";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Call Python backend yt-dlp endpoint
    const response = await fetch(`${PYTHON_BACKEND_URL}/api/video-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Video formats API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch video formats",
    });
  }
}