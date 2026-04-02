import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
                    "https://back2life-audio-processing.onrender.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024,
    });

    const [fields, files] = await form.parse(req);
    const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const formData = new FormData();
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);
    const blob = new Blob([fileBuffer], { type: uploadedFile.mimetype || "audio/mpeg" });
    
    formData.append("file", blob, uploadedFile.originalFilename || "audio.mp3");

    console.log(`Transcribing file via: ${BACKEND_URL}/api/transcribe`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000);

    const response = await fetch(`${BACKEND_URL}/api/transcribe`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    fs.unlinkSync(uploadedFile.filepath);

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
        error: data.error || "Failed to transcribe audio",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Transcription file API error:", error);
    
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return res.status(504).json({
          error: "Transcription timed out. The audio file may be too long.",
        });
      }
      
      return res.status(500).json({
        error: `Failed to transcribe audio: ${error.message}`,
      });
    }
    
    return res.status(500).json({
      error: "Failed to transcribe audio",
    });
  }
}