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
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url.trim(),
        isAudioOnly: isAudioOnly || false,
        videoQuality: videoQuality || "720",
        audioBitrate: audioBitrate,
        filenamePattern: "classic",
        isAudioMuted: false,
        dubLang: false,
        disableMetadata: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Cobalt API error: ${response.status}`);
    }

    const data: CobaltResponse = await response.json();

    if (data.status === "error" || data.status === "rate-limit") {
      return res.status(400).json({
        error: data.text || "Failed to process video",
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