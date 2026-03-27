import type { NextApiRequest, NextApiResponse } from "next";

type CobaltResponse = {
  status: string;
  text?: string;
  url?: string;
  thumb?: string;
  picker?: Array<{
    url: string;
    thumb?: string;
  }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, isAudioOnly, videoQuality, audioBitrate } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const requestBody: {
      url: string;
      vQuality?: string;
      aFormat?: string;
      filenamePattern?: string;
      isAudioOnly?: boolean;
      isAudioMuted?: boolean;
      dubLang?: boolean;
      disableMetadata?: boolean;
    } = {
      url: url.trim(),
      filenamePattern: "classic",
      isAudioOnly: isAudioOnly || false,
      isAudioMuted: false,
      dubLang: false,
      disableMetadata: false,
    };

    // Add video quality if specified and not audio-only
    if (!isAudioOnly && videoQuality) {
      requestBody.vQuality = videoQuality;
    }

    // Add audio format for audio-only downloads
    if (isAudioOnly) {
      requestBody.aFormat = "mp3";
    }

    console.log("Cobalt API request:", requestBody);

    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data: CobaltResponse = await response.json();
    console.log("Cobalt API response:", data);

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.text || `Cobalt API error: ${response.status}`,
        status: data.status,
      });
    }

    if (data.status === "error" || data.status === "rate-limit") {
      return res.status(400).json({
        error: data.text || "Failed to process video",
        status: data.status,
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Download API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to download video",
    });
  }
}