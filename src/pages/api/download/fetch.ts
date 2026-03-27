import type { NextApiRequest, NextApiResponse } from "next";

type CobaltResponse = {
  status: string;
  text?: string;
  url?: string;
  picker?: Array<{ url: string }>;
};

type FetchResponse = {
  downloadUrl: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FetchResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url, quality, isAudio } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Build cobalt.tools API request
    const cobaltRequest: {
      url: string;
      vQuality?: string;
      aFormat?: string;
      filenamePattern: string;
      isAudioOnly: boolean;
      isAudioMuted: boolean;
      dubLang: boolean;
      disableMetadata: boolean;
    } = {
      url: url.trim(),
      filenamePattern: "classic",
      isAudioOnly: isAudio || false,
      isAudioMuted: false,
      dubLang: false,
      disableMetadata: false,
    };

    // Add quality preference
    if (!isAudio && quality) {
      cobaltRequest.vQuality = quality;
    }

    // Set audio format for audio-only downloads
    if (isAudio) {
      cobaltRequest.aFormat = "mp3";
    }

    console.log("Cobalt API request:", cobaltRequest);

    // Call cobalt.tools API
    const response = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cobaltRequest),
    });

    const data: CobaltResponse = await response.json();
    console.log("Cobalt API response:", data);

    // Handle different response statuses
    if (data.status === "error" || data.status === "rate-limit") {
      return res.status(400).json({
        error: data.text || "Failed to process video",
      });
    }

    // Extract download URL from response
    let downloadUrl = "";

    if (data.status === "redirect" || data.status === "stream") {
      downloadUrl = data.url || "";
    } else if (data.status === "picker" && data.picker && data.picker.length > 0) {
      downloadUrl = data.picker[0].url;
    }

    if (!downloadUrl) {
      return res.status(400).json({
        error: "No download URL returned from video service",
      });
    }

    return res.status(200).json({
      downloadUrl,
    });
  } catch (error) {
    console.error("Fetch API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch download URL",
    });
  }
}