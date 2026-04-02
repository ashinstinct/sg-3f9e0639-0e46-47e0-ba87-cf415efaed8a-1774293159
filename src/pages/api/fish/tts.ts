import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice_id, format = "mp3", speed = 1.0 } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Fish Audio API key not configured" });
  }

  try {
    // Fish Audio API endpoint for TTS
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: voice_id || "default", // Voice model ID
        format, // mp3, wav, opus
        normalize: true, // Normalize audio levels
        speed, // Speaking speed (0.5 - 2.0)
        chunk_length: 200, // Text chunk length for processing
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Fish Audio API error: ${error}`);
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer();
    
    // Convert to base64 for client-side handling
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/${format};base64,${base64Audio}`;

    return res.status(200).json({
      success: true,
      audio_url: audioUrl,
      format,
      duration_estimate: Math.ceil(text.length / 10), // Rough estimate
    });

  } catch (error) {
    console.error("Fish Audio TTS error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate speech",
    });
  }
}