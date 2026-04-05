import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Here we can use an LLM API. For immediate reliability and no extra API costs, 
    // we use an algorithmic enhancement that adds high-quality keywords 
    // tailored for standard AI image and video models.
    const enhancedPrompt = `${prompt.trim()}, highly detailed, masterpiece, best quality, 8k resolution, stunning lighting, cinematic composition, vivid colors, photorealistic, ultra-detailed`;

    return res.status(200).json({
      success: true,
      enhancedPrompt,
    });
  } catch (error: any) {
    console.error("Prompt enhancement error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to enhance prompt",
    });
  }
}