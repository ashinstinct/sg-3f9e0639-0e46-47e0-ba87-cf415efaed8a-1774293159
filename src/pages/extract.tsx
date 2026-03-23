import { useState, useRef, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Scissors, Download, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface ExtractedFrame {
  id: string;
  blob: Blob;
  url: string;
  timestamp: number;
}

export default function FrameExtractor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionMode, setExtractionMode] = useState<"interval" | "total">("interval");
  const [intervalSeconds, setIntervalSeconds] = useState(1);
  const [totalFrames, setTotalFrames] = useState(10);
  const [progress, setProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file");
      return;
    }

    // Clean up previous video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    // Clean up previous frames
    frames.forEach(frame => URL.revokeObjectURL(frame.url));
    setFrames([]);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setProgress(0);
  }, [videoUrl, frames]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const extractFrames = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsExtracting(true);
    setFrames([]);
    setProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const extractedFrames: ExtractedFrame[] = [];
    const duration = video.duration;

    let timestamps: number[];
    if (extractionMode === "interval") {
      timestamps = [];
      for (let t = 0; t < duration; t += intervalSeconds) {
        timestamps.push(t);
      }
    } else {
      timestamps = Array.from({ length: totalFrames }, (_, i) => (i * duration) / (totalFrames - 1));
    }

    for (let i = 0; i < timestamps.length; i++) {
      const timestamp = timestamps[i];
      
      await new Promise<void>((resolve) => {
        video.currentTime = timestamp;
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              extractedFrames.push({
                id: `frame-${i}`,
                blob,
                url,
                timestamp,
              });
              setFrames([...extractedFrames]);
              setProgress(((i + 1) / timestamps.length) * 100);
            }
            resolve();
          }, "image/png");
        };
      });
    }

    setIsExtracting(false);
  };

  const downloadFrame = (frame: ExtractedFrame, index: number) => {
    const link = document.createElement("a");
    link.href = frame.url;
    link.download = `frame-${index + 1}.png`;
    link.click();
  };

  const downloadAllFrames = async () => {
    if (frames.length === 0) return;

    const zip = new JSZip();
    frames.forEach((frame, index) => {
      zip.file(`frame-${index + 1}.png`, frame.blob);
    });

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `frames-${Date.now()}.zip`);
  };

  const clearFrames = () => {
    frames.forEach(frame => URL.revokeObjectURL(frame.url));
    setFrames([]);
    setProgress(0);
  };

  return (
    <>
      <SEO
        title="Frame Extractor - Back2Life.Studio"
        description="Extract frames from videos instantly in your browser. No upload required - 100% client-side processing."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Frame Extractor</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Extract frames from videos instantly in your browser. No upload required - 100% client-side processing.
              </p>
            </div>

            {!videoFile ? (
              <Card
                className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop video file here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports MP4, WebM, MOV, and more</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Video Preview</CardTitle>
                    <CardDescription>{videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      controls
                      onLoadedMetadata={handleVideoLoad}
                      className="w-full rounded-lg bg-black"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Extraction Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Button
                          variant={extractionMode === "interval" ? "default" : "outline"}
                          onClick={() => setExtractionMode("interval")}
                          className="flex-1"
                        >
                          Extract by Interval
                        </Button>
                        <Button
                          variant={extractionMode === "total" ? "default" : "outline"}
                          onClick={() => setExtractionMode("total")}
                          className="flex-1"
                        >
                          Extract Total Frames
                        </Button>
                      </div>

                      {extractionMode === "interval" ? (
                        <div className="space-y-2">
                          <Label>Extract every {intervalSeconds} second{intervalSeconds !== 1 ? "s" : ""}</Label>
                          <Slider
                            value={[intervalSeconds]}
                            onValueChange={([value]) => setIntervalSeconds(value)}
                            min={0.5}
                            max={10}
                            step={0.5}
                            className="w-full"
                          />
                          <p className="text-sm text-muted-foreground">
                            ~{Math.ceil(videoDuration / intervalSeconds)} frames will be extracted
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Total frames to extract: {totalFrames}</Label>
                          <Slider
                            value={[totalFrames]}
                            onValueChange={([value]) => setTotalFrames(value)}
                            min={5}
                            max={100}
                            step={5}
                            className="w-full"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={extractFrames}
                        disabled={isExtracting}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Extracting... {Math.round(progress)}%
                          </>
                        ) : (
                          <>
                            <Scissors className="w-4 h-4 mr-2" />
                            Extract Frames
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setVideoFile(null);
                        setVideoUrl("");
                        clearFrames();
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {frames.length > 0 && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Extracted Frames ({frames.length})</CardTitle>
                          <CardDescription>Click to download individual frames</CardDescription>
                        </div>
                        <Button onClick={downloadAllFrames}>
                          <Download className="w-4 h-4 mr-2" />
                          Download All (ZIP)
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {frames.map((frame, index) => (
                          <div
                            key={frame.id}
                            className="group relative aspect-video rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                            onClick={() => downloadFrame(frame, index)}
                          >
                            <img
                              src={frame.url}
                              alt={`Frame ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Download className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs bg-black/80 text-white border-none">
                                {frame.timestamp.toFixed(1)}s
                              </Badge>
                              <Badge variant="secondary" className="text-xs bg-black/80 text-white border-none">
                                #{index + 1}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}