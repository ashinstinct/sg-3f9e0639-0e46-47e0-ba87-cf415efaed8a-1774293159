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

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    console.log(`Fetching formats from: ${BACKEND_URL}/api/video-formats`);
    
    const response = await fetch(`${BACKEND_URL}/api/video-formats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url.trim() }),
      signal: AbortSignal.timeout(30000),
    });

    const contentType = response.headers.get("content-type");
    
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Backend returned non-JSON response:", text.substring(0, 200));
      
      return res.status(503).json({
        error: "Video processing service is currently unavailable. The backend may be starting up or experiencing issues. Please try again in a moment.",
        hint: "If the issue persists, the Python backend may need to be redeployed with yt-dlp support.",
      });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Failed to fetch video formats",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Formats API error:", error);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res.status(504).json({
          error: "Request timed out. The video may be too large or the service is busy.",
        });
      }
      
      return res.status(500).json({
        error: `Failed to fetch video formats: ${error.message}`,
        hint: "The Python backend may not be accessible or may need to be restarted.",
      });
    }
    
    return res.status(500).json({
      error: "Failed to fetch video formats",
    });
  }
}