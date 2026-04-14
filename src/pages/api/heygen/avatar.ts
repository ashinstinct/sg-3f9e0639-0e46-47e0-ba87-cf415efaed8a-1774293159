import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, ...params } = req.body;

    const heygenApiKey = process.env.HEYGEN_API_KEY;
    if (!heygenApiKey) {
      return res.status(500).json({ error: "Heygen API key not configured" });
    }

    const baseUrl = "https://api.heygen.com/v2";
    let endpoint = "";
    let method = "POST";
    let requestBody: any = {};

    switch (action) {
      case "list_avatars":
        endpoint = `${baseUrl}/avatars`;
        method = "GET";
        break;

      case "create_video":
        endpoint = `${baseUrl}/video/generate`;
        requestBody = {
          video_inputs: [{
            character: {
              type: "avatar",
              avatar_id: params.avatar_id,
              avatar_style: params.avatar_style || "normal"
            },
            voice: {
              type: params.voice_type || "text",
              input_text: params.text,
              voice_id: params.voice_id
            },
            background: params.background || {
              type: "color",
              value: "#FFFFFF"
            }
          }],
          dimension: {
            width: params.width || 1280,
            height: params.height || 720
          },
          aspect_ratio: params.aspect_ratio || "16:9",
          test: params.test || false
        };
        break;

      case "get_video_status":
        endpoint = `${baseUrl}/video_status.get?video_id=${params.video_id}`;
        method = "GET";
        break;

      case "list_voices":
        endpoint = `${baseUrl}/voices`;
        method = "GET";
        break;

      default:
        return res.status(400).json({ error: "Invalid action" });
    }

    const options: RequestInit = {
      method,
      headers: {
        "X-Api-Key": heygenApiKey,
        "Content-Type": "application/json"
      }
    };

    if (method === "POST" && Object.keys(requestBody).length > 0) {
      options.body = JSON.stringify(requestBody);
    }

    console.log(`Calling Heygen API: ${endpoint}`);
    const response = await fetch(endpoint, options);
    const data = await response.json();

    if (!response.ok) {
      console.error("Heygen API error:", data);
      return res.status(response.status).json({
        error: data.message || "Heygen API request failed"
      });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Heygen API error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process Heygen request"
    });
  }
}