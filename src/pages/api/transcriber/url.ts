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
    console.log(`Transcribing URL via: ${BACKEND_URL}/api/transcribe-url`);
    
    const response = await fetch(`${BACKEND_URL}/api/transcribe-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: url.trim() }),
      signal: AbortSignal.timeout(180000),
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Backend returned non-JSON response:", text.substring(0, 200));
      
      return res.status(503).json({
        error: "Transcription service is currently unavailable. Please try again in a moment.",
      });
    }

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || "Failed to transcribe audio from URL",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Transcription URL API error:", error);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res.status(504).json({
          error: "Transcription timed out. The audio may be too long.",
        });
      }
      
      return res.status(500).json({
        error: `Failed to transcribe audio: ${error.message}`,
      });
    }
    
    return res.status(500).json({
      error: "Failed to transcribe audio from URL",
    });
  }
}