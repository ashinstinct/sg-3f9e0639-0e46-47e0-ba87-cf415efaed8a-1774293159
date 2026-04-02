import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audio_file, text, title, description } = req.body;

  if (!audio_file || !text) {
    return res.status(400).json({ error: "Audio file and text are required" });
  }

  const apiKey = process.env.FISH_AUDIO_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Fish Audio API key not configured" });
  }

  try {
    // Step 1: Create a voice model from the audio sample
    const createVoiceResponse = await fetch("https://api.fish.audio/v1/voices", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title || "Cloned Voice",
        description: description || "Voice cloned via Back2Life.Studio",
        audio_data: audio_file, // Base64 encoded audio
      }),
    });

    if (!createVoiceResponse.ok) {
      const error = await createVoiceResponse.text();
      throw new Error(`Failed to create voice model: ${error}`);
    }

    const voiceData = await createVoiceResponse.json();
    const voiceId = voiceData.id;

    // Step 2: Generate speech using the cloned voice
    const ttsResponse = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId,
        format: "mp3",
        normalize: true,
        speed: 1.0,
        chunk_length: 200,
      }),
    });

    if (!ttsResponse.ok) {
      const error = await ttsResponse.text();
      throw new Error(`Failed to generate cloned speech: ${error}`);
    }

    // Get audio buffer
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");
    const audioUrl = `data:audio/mp3;base64,${base64Audio}`;

    return res.status(200).json({
      success: true,
      voice_id: voiceId,
      audio_url: audioUrl,
      format: "mp3",
      message: "Voice cloned and speech generated successfully",
    });

  } catch (error) {
    console.error("Fish Audio voice cloning error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to clone voice",
    });
  }
}