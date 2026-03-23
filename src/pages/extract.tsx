import { useState, useRef, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, Trash2, Image as ImageIcon, SkipForward, SkipBack } from "lucide-react";

export default function FrameExtractor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentFrame, setCurrentFrame] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [selectedFrameType, setSelectedFrameType] = useState<"first" | "last" | "custom" | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please select a valid video file");
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (currentFrame) {
      URL.revokeObjectURL(currentFrame);
    }

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setCurrentFrame("");
    setSelectedFrameType(null);
    setCurrentTime(0);
  }, [videoUrl, currentFrame]);

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

  const captureFrame = useCallback((time?: number) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    return new Promise<void>((resolve) => {
      const targetTime = time !== undefined ? time : video.currentTime;
      video.currentTime = targetTime;
      
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL("image/png");
        if (currentFrame) {
          URL.revokeObjectURL(currentFrame);
        }
        setCurrentFrame(dataUrl);
        setCurrentTime(targetTime);
        resolve();
      };
    });
  }, [currentFrame]);

  const extractFirstFrame = async () => {
    setSelectedFrameType("first");
    await captureFrame(0);
  };

  const extractLastFrame = async () => {
    setSelectedFrameType("last");
    if (videoRef.current) {
      await captureFrame(videoRef.current.duration);
    }
  };

  const handleSliderChange = async (value: number[]) => {
    setSelectedFrameType("custom");
    await captureFrame(value[0]);
  };

  const downloadFrame = () => {
    if (!currentFrame) return;

    const link = document.createElement("a");
    link.href = currentFrame;
    const frameLabel = selectedFrameType === "first" ? "first" : selectedFrameType === "last" ? "last" : `${currentTime.toFixed(2)}s`;
    link.download = `frame-${frameLabel}-${Date.now()}.png`;
    link.click();
  };

  const clearVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (currentFrame) {
      URL.revokeObjectURL(currentFrame);
    }
    setVideoFile(null);
    setVideoUrl("");
    setCurrentFrame("");
    setSelectedFrameType(null);
    setCurrentTime(0);
    setVideoDuration(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2);
    return `${mins}:${secs.padStart(5, "0")}`;
  };

  return (
    <>
      <SEO
        title="Frame Extractor - Back2Life.Studio"
        description="Extract first frame, last frame, or any custom frame from videos instantly in your browser. No upload required."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Frame Extractor</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Extract first frame, last frame, or pick any custom frame from your video. 100% client-side processing.
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
                    <CardDescription>
                      {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB) · Duration: {formatTime(videoDuration)}
                    </CardDescription>
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
                    <CardTitle>Frame Extraction</CardTitle>
                    <CardDescription>Select which frame to extract from your video</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Extract Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={extractFirstFrame}
                        size="lg"
                        variant={selectedFrameType === "first" ? "default" : "outline"}
                        className="h-16"
                      >
                        <SkipBack className="w-5 h-5 mr-2" />
                        <div className="text-left">
                          <div className="font-semibold">First Frame</div>
                          <div className="text-xs opacity-70">0:00.00</div>
                        </div>
                      </Button>
                      <Button
                        onClick={extractLastFrame}
                        size="lg"
                        variant={selectedFrameType === "last" ? "default" : "outline"}
                        className="h-16"
                      >
                        <div className="text-right flex-1">
                          <div className="font-semibold">Last Frame</div>
                          <div className="text-xs opacity-70">{formatTime(videoDuration)}</div>
                        </div>
                        <SkipForward className="w-5 h-5 ml-2" />
                      </Button>
                    </div>

                    {/* Custom Frame Slider */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Pick Custom Frame</label>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(currentTime)}
                        </span>
                      </div>
                      <Slider
                        value={[currentTime]}
                        onValueChange={handleSliderChange}
                        min={0}
                        max={videoDuration}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0:00.00</span>
                        <span>{formatTime(videoDuration)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={downloadFrame}
                        disabled={!currentFrame}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 h-12"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Frame
                      </Button>
                      <Button variant="outline" onClick={clearVideo} className="h-12">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Frame Preview */}
                {currentFrame && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Extracted Frame Preview</CardTitle>
                      <CardDescription>
                        {selectedFrameType === "first" && "First frame of the video"}
                        {selectedFrameType === "last" && "Last frame of the video"}
                        {selectedFrameType === "custom" && `Custom frame at ${formatTime(currentTime)}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative rounded-lg overflow-hidden border border-border">
                        <img
                          src={currentFrame}
                          alt="Extracted frame"
                          className="w-full h-auto"
                        />
                        <Badge 
                          variant="secondary" 
                          className="absolute top-4 right-4 bg-black/80 text-white border-none"
                        >
                          {formatTime(currentTime)}
                        </Badge>
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