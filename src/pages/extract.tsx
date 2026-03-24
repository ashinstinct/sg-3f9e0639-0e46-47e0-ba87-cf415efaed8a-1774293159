import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Scissors, Upload, Download, Loader2, AlertCircle, Play, Pause, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JSZip from "jszip";

type ExtractionMode = "start-end" | "slider" | "all";

export default function FrameExtractor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [frameInterval, setFrameInterval] = useState(1);
  const [sliderValue, setSliderValue] = useState(0);
  const [extractedFrames, setExtractedFrames] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<ExtractionMode>("slider");
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

  const captureFrame = async (time: number): Promise<string> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      video.currentTime = time;
      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const extractStartEndFrames = async () => {
    if (!videoRef.current || !canvasRef.current || duration === 0) return;

    setIsExtracting(true);
    setError("");

    try {
      const startFrame = await captureFrame(0);
      const endFrame = await captureFrame(duration - 0.1);
      
      setExtractedFrames([startFrame, endFrame]);
      
      toast({
        title: "Success!",
        description: "Extracted start and end frames",
      });
    } catch (err) {
      setError("Failed to extract frames. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractSliderFrame = async () => {
    if (!videoRef.current || !canvasRef.current || duration === 0) return;

    setIsExtracting(true);
    setError("");

    try {
      const time = (sliderValue / 100) * duration;
      const frame = await captureFrame(time);
      
      setExtractedFrames([frame]);
      
      toast({
        title: "Success!",
        description: `Extracted frame at ${Math.floor(time)}s`,
      });
    } catch (err) {
      setError("Failed to extract frame. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractAllFrames = async () => {
    if (!videoRef.current || !canvasRef.current || duration === 0) return;

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
        const frame = await captureFrame(time);
        frames.push(frame);
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

  const handleExtract = () => {
    if (mode === "start-end") {
      extractStartEndFrames();
    } else if (mode === "slider") {
      extractSliderFrame();
    } else {
      extractAllFrames();
    }
  };

  const downloadAllFrames = async () => {
    if (extractedFrames.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("frames");

    extractedFrames.forEach((frame, index) => {
      const base64Data = frame.split(",")[1];
      const fileName = mode === "start-end" 
        ? (index === 0 ? "start_frame.png" : "end_frame.png")
        : `frame_${String(index + 1).padStart(4, "0")}.png`;
      folder?.file(fileName, base64Data, { base64: true });
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
      description: `${extractedFrames.length} frame(s) saved as ZIP`,
    });
  };

  const downloadFrame = (frame: string, index: number) => {
    const link = document.createElement("a");
    link.href = frame;
    const fileName = mode === "start-end" 
      ? (index === 0 ? "start_frame.png" : "end_frame.png")
      : `frame_${String(index + 1).padStart(4, "0")}.png`;
    link.download = fileName;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
                    Select a video file and choose extraction mode
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
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extraction Mode Selection */}
                  {videoFile && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Extraction Mode</Label>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant={mode === "start-end" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("start-end")}
                            className={mode === "start-end" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                          >
                            Start + End
                          </Button>
                          <Button
                            variant={mode === "slider" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("slider")}
                            className={mode === "slider" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                          >
                            Pick Frame
                          </Button>
                          <Button
                            variant={mode === "all" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("all")}
                            className={mode === "all" ? "bg-gradient-to-r from-purple-500 to-pink-500" : ""}
                          >
                            All Frames
                          </Button>
                        </div>
                      </div>

                      {/* Mode-Specific Controls */}
                      {mode === "start-end" && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">
                            Extract the first and last frame of the video
                          </p>
                        </div>
                      )}

                      {mode === "slider" && (
                        <div className="space-y-3">
                          <Label>Pick Frame Position ({Math.floor((sliderValue / 100) * duration)}s)</Label>
                          <Slider
                            value={[sliderValue]}
                            onValueChange={(value) => setSliderValue(value[0])}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                          <p className="text-xs text-muted-foreground">
                            Use the slider to select any moment in the video
                          </p>
                        </div>
                      )}

                      {mode === "all" && (
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
                      )}

                      <Button
                        onClick={handleExtract}
                        disabled={isExtracting}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Extract {mode === "start-end" ? "Start + End" : mode === "slider" ? "Frame" : "All Frames"}
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
                        Download {extractedFrames.length > 1 ? "ZIP" : "Frame"}
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
                        <p className="text-xs mt-1">Upload a video and select extraction mode</p>
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
                              Download {mode === "start-end" ? (index === 0 ? "Start" : "End") : `Frame ${index + 1}`}
                            </Button>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                            {mode === "start-end" ? (index === 0 ? "Start Frame" : "End Frame") : `Frame ${index + 1}/${extractedFrames.length}`}
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