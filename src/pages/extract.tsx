import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scissors, Upload, Download, Loader2, AlertCircle, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

export default function FrameExtractor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [frameInterval, setFrameInterval] = useState(1);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setExtractedFrames([]);
    setError("");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const extractFrames = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsExtracting(true);
    setError("");
    setExtractedFrames([]);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const frames: string[] = [];
      const totalFrames = Math.floor(duration / frameInterval);
      
      for (let i = 0; i < totalFrames; i++) {
        const time = i * frameInterval;
        
        await new Promise<void>((resolve) => {
          video.currentTime = time;
          video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0);
            frames.push(canvas.toDataURL("image/png"));
            resolve();
          };
        });
      }

      setExtractedFrames(frames);
      toast({
        title: "Success!",
        description: `Extracted ${frames.length} frames`,
      });
    } catch (err) {
      setError("Failed to extract frames. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadAllFrames = async () => {
    if (extractedFrames.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("frames");

    extractedFrames.forEach((frame, index) => {
      const base64Data = frame.split(",")[1];
      folder?.file(`frame_${String(index + 1).padStart(4, "0")}.png`, base64Data, { base64: true });
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `frames_${Date.now()}.zip`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded!",
      description: `${extractedFrames.length} frames saved as ZIP`,
    });
  };

  const downloadFrame = (frame: string, index: number) => {
    const link = document.createElement("a");
    link.href = frame;
    link.download = `frame_${String(index + 1).padStart(4, "0")}.png`;
    link.click();
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <>
      <SEO
        title="Frame Extractor - Back2Life.Studio"
        description="Extract frames from videos instantly in your browser. No upload required, 100% client-side processing."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-6xl mx-auto">
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
                Extract frames from videos instantly in your browser. No upload required, 100% client-side processing.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video</CardTitle>
                  <CardDescription>
                    Select a video file to extract frames from
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* File Upload */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="relative"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    
                    {!videoFile ? (
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        size="lg"
                        className="w-full h-48 border-dashed"
                      >
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                          <p className="text-sm font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            MP4, MOV, WebM, AVI, MKV
                          </p>
                        </div>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border bg-black">
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            onLoadedMetadata={(e) => {
                              setDuration(e.currentTarget.duration);
                            }}
                            onTimeUpdate={(e) => {
                              setCurrentTime(e.currentTarget.currentTime);
                            }}
                            onEnded={() => setIsPlaying(false)}
                            className="w-full h-auto"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                        </div>
                        
                        <div className="flex gap-3">
                          <Button
                            onClick={togglePlayPause}
                            variant="outline"
                            size="sm"
                          >
                            {isPlaying ? (
                              <><Pause className="w-4 h-4 mr-2" />Pause</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" />Play</>
                            )}
                          </Button>
                          <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Change Video
                          </Button>
                        </div>

                        <div className="text-xs text-muted-foreground text-center">
                          {Math.floor(currentTime)}s / {Math.floor(duration)}s
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  {videoFile && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="interval">Frame Interval (seconds)</Label>
                        <Input
                          id="interval"
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={frameInterval}
                          onChange={(e) => setFrameInterval(parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Extract one frame every {frameInterval} second(s). Estimated: ~{Math.floor(duration / frameInterval)} frames
                        </p>
                      </div>

                      <Button
                        onClick={extractFrames}
                        disabled={isExtracting}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Extracting Frames...
                          </>
                        ) : (
                          <>
                            <Scissors className="w-5 h-5 mr-2" />
                            Extract Frames
                          </>
                        )}
                      </Button>

                      {error && (
                        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">How it works:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>100% browser-based (no upload to server)</li>
                      <li>Uses HTML5 Canvas API</li>
                      <li>Extracts high-quality PNG frames</li>
                      <li>Download individually or as ZIP</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Frames */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Extracted Frames</CardTitle>
                      <CardDescription>
                        {extractedFrames.length > 0
                          ? `${extractedFrames.length} frame(s) extracted`
                          : "Frames will appear here"}
                      </CardDescription>
                    </div>
                    {extractedFrames.length > 0 && (
                      <Button
                        onClick={downloadAllFrames}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {extractedFrames.length === 0 ? (
                    <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Scissors className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No frames extracted yet</p>
                        <p className="text-xs mt-1">Upload a video and click extract</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {extractedFrames.map((frame, index) => (
                        <div key={index} className="group relative rounded-lg overflow-hidden border bg-muted/50">
                          <img
                            src={frame}
                            alt={`Frame ${index + 1}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <Button
                              onClick={() => downloadFrame(frame, index)}
                              size="sm"
                              variant="secondary"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Frame {index + 1}
                            </Button>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            Frame {index + 1}/{extractedFrames.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}