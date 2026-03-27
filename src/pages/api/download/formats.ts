import type { NextApiRequest, NextApiResponse } from "next";

type VideoFormat = {
  quality: string;
  format: string;
  size: string;
};

type FormatsResponse = {
  title: string;
  thumbnail: string;
  platform: string;
  videoFormats: VideoFormat[];
  audioFormats: VideoFormat[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FormatsResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Detect platform from URL
    const platform = detectPlatform(url);

    // Get video metadata from YouTube oEmbed API
    let title = "Video";
    let thumbnail = "";

    if (platform === "YouTube") {
      try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const oEmbedResponse = await fetch(oEmbedUrl);
        
        if (oEmbedResponse.ok) {
          const oEmbedData = await oEmbedResponse.json();
          title = oEmbedData.title || "Video";
          thumbnail = oEmbedData.thumbnail_url || "";
        }
      } catch (error) {
        console.log("oEmbed fetch failed, using defaults:", error);
      }
    }

    // Return hardcoded quality options (cobalt.tools handles actual quality selection)
    const videoFormats: VideoFormat[] = [
      { quality: "2160", format: "MP4", size: "~800-1200 MB/min" },
      { quality: "1440", format: "MP4", size: "~400-600 MB/min" },
      { quality: "1080", format: "MP4", size: "~200-300 MB/min" },
      { quality: "720", format: "MP4", size: "~100-150 MB/min" },
      { quality: "480", format: "MP4", size: "~50-70 MB/min" },
      { quality: "360", format: "MP4", size: "~30-40 MB/min" },
    ];

    const audioFormats: VideoFormat[] = [
      { quality: "256", format: "M4A", size: "~1.9 MB/min" },
      { quality: "128", format: "M4A", size: "~1 MB/min" },
      { quality: "96", format: "M4A", size: "~0.7 MB/min" },
      { quality: "64", format: "M4A", size: "~0.5 MB/min" },
    ];

    return res.status(200).json({
      title,
      thumbnail,
      platform,
      videoFormats,
      audioFormats,
    });
  } catch (error) {
    console.error("Formats API error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch video formats",
    });
  }
}

function detectPlatform(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return "YouTube";
  } else if (lowerUrl.includes("tiktok.com")) {
    return "TikTok";
  } else if (lowerUrl.includes("instagram.com")) {
    return "Instagram";
  } else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    return "Twitter/X";
  } else if (lowerUrl.includes("facebook.com")) {
    return "Facebook";
  } else if (lowerUrl.includes("reddit.com")) {
    return "Reddit";
  } else if (lowerUrl.includes("vimeo.com")) {
    return "Vimeo";
  } else if (lowerUrl.includes("twitch.tv")) {
    return "Twitch";
  }
  
  return "Unknown";
}