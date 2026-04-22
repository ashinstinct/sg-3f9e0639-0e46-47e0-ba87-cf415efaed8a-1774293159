import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Camera, Upload, Download, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/router";

type ExtractionMode = "start" | "pick" | "end";

export default function FrameExtractor() {
  const router = useRouter();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [sliderValue, setSliderValue] = useState(0);
  const [extractedFrame, setExtractedFrame] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<ExtractionMode>("pick");
  const [error, setError] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const seekTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Load video from URL query parameter
  useEffect(() => {
    if (router.query.video && typeof router.query.video === "string") {
      const decodedUrl = decodeURIComponent(router.query.video);
      setVideoUrl(decodedUrl);
      
      // Auto-load the video
      const video = document.createElement("video");
      video.src = decodedUrl;
      video.crossOrigin = "anonymous";
      video.onloadeddata = () => {
        setVideoUrl(decodedUrl);
      };
    }
  }, [router.query.video]);

  // Smooth video seek with debounce
  useEffect(() => {
    if (videoRef.current && duration > 0 && mode === "pick") {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }

      setIsSeeking(true);
      
      seekTimeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          const time = (sliderValue / 100) * duration;
          videoRef.current.currentTime = time;
        }
      }, 50); // Debounce for smoother seeking
    }

    return () => {
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
      }
    };
  }, [sliderValue, duration, mode]);

  // Handle video seeked event
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      setIsSeeking(false);
    };

    video.addEventListener("seeked", handleSeeked);
    return () => video.removeEventListener("seeked", handleSeeked);
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
    setExtractedFrame("");
    setError("");
    setSliderValue(0);
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

  const captureCurrentFrame = (): string => {
    if (!videoRef.current || !canvasRef.current) return "";
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const extractStartFrame = async () => {
    if (!videoRef.current || duration === 0) return;

    setIsExtracting(true);
    setError("");

    try {
      // Seek to start
      videoRef.current.currentTime = 0;
      
      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return;
        videoRef.current.onseeked = () => {
          const frame = captureCurrentFrame();
          setExtractedFrame(frame);
          toast({
            title: "Success!",
            description: "Extracted start frame",
          });
          resolve();
        };
      });
    } catch (err) {
      setError("Failed to extract start frame. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractPickFrame = () => {
    if (!videoRef.current || duration === 0) return;

    setIsExtracting(true);
    setError("");

    try {
      const frame = captureCurrentFrame();
      const time = (sliderValue / 100) * duration;
      
      setExtractedFrame(frame);
      
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

  const extractEndFrame = async () => {
    if (!videoRef.current || duration === 0) return;

    setIsExtracting(true);
    setError("");

    try {
      // Seek to end (slightly before to avoid black frame)
      videoRef.current.currentTime = duration - 0.1;
      
      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        if (!videoRef.current) return;
        videoRef.current.onseeked = () => {
          const frame = captureCurrentFrame();
          setExtractedFrame(frame);
          toast({
            title: "Success!",
            description: "Extracted end frame",
          });
          resolve();
        };
      });
    } catch (err) {
      setError("Failed to extract end frame. Please try again.");
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtract = () => {
    if (mode === "start") {
      extractStartFrame();
    } else if (mode === "pick") {
      extractPickFrame();
    } else {
      extractEndFrame();
    }
  };

  const downloadFrame = () => {
    if (!extractedFrame) return;

    const link = document.createElement("a");
    link.href = extractedFrame;
    const fileName = mode === "start" 
      ? "start_frame.png" 
      : mode === "end" 
      ? "end_frame.png" 
      : `frame_${Math.floor((sliderValue / 100) * duration)}s.png`;
    link.download = fileName;
    link.click();

    toast({
      title: "Downloaded!",
      description: `Saved as ${fileName}`,
    });
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
        
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <div className="flex items-center gap-3 mb-4 justify-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/20">
                  Free
                </Badge>
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
                Frame Extractor
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Extract frames from videos instantly in your browser. No upload required, 100% client-side processing.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upload & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Video</CardTitle>
                  <CardDescription>
                    Select a video file and choose which frame to extract
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
                        className="w-full h-48 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                      >
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                          <p className="text-sm font-medium">Click to upload or drag & drop</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            MP4, MOV, WebM, AVI, MKV
                          </p>
                        </div>
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative rounded-lg overflow-hidden border bg-black group">
                          <video
                            ref={videoRef}
                            src={videoUrl}
                            onLoadedMetadata={(e) => {
                              setDuration(e.currentTarget.duration);
                            }}
                            className={`w-full h-auto transition-opacity duration-300 ${
                              isSeeking ? "opacity-90" : "opacity-100"
                            }`}
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {/* Seeking Indicator */}
                          {isSeeking && mode === "pick" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-200">
                              <div className="bg-black/70 px-4 py-2 rounded-lg">
                                <p className="text-white text-sm font-medium">
                                  {formatTime((sliderValue / 100) * duration)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                          className="w-full hover:bg-primary/5 transition-colors duration-200"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Change Video
                        </Button>

                        <div className="text-xs text-muted-foreground text-center">
                          Duration: {formatTime(duration)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extraction Mode Selection */}
                  {videoFile && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>Choose Frame to Extract</Label>
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            variant={mode === "start" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("start")}
                            className={mode === "start" ? "bg-purple-500" : ""}
                          >
                            Start Frame
                          </Button>
                          <Button
                            variant={mode === "pick" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("pick")}
                            className={mode === "pick" ? "bg-purple-500" : ""}
                          >
                            Pick Frame
                          </Button>
                          <Button
                            variant={mode === "end" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMode("end")}
                            className={mode === "end" ? "bg-purple-500" : ""}
                          >
                            End Frame
                          </Button>
                        </div>
                      </div>

                      {/* Mode-Specific Controls */}
                      {mode === "start" && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">
                            Extract the first frame of the video
                          </p>
                        </div>
                      )}

                      {mode === "pick" && (
                        <div className="space-y-3">
                          <Label className="flex items-center justify-between">
                            <span>Pick Frame Position</span>
                            <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                              {formatTime((sliderValue / 100) * duration)}
                            </span>
                          </Label>
                          <div className="relative">
                            <Slider
                              value={[sliderValue]}
                              onValueChange={(value) => setSliderValue(value[0])}
                              max={100}
                              step={0.1}
                              className="w-full [&_[role=slider]]:transition-all [&_[role=slider]]:duration-150 [&_[role=slider]]:hover:scale-110 [&_[role=slider]]:active:scale-105"
                            />
                            {/* Progress indicator glow */}
                            <div 
                              className="absolute top-1/2 left-0 h-0.5 bg-purple-500 pointer-events-none transition-all duration-150 rounded-full"
                              style={{ 
                                width: `${sliderValue}%`,
                                transform: "translateY(-50%)",
                                boxShadow: "0 0 8px rgba(168, 85, 247, 0.6)"
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Move the slider to see the video frames change above. The video will update in real-time as you move the slider.
                          </p>
                        </div>
                      )}

                      {mode === "end" && (
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground">
                            Extract the last frame of the video
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={handleExtract}
                        disabled={isExtracting}
                        size="lg"
                        className="w-full bg-purple-500 hover:bg-purple-600 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-5 h-5 mr-2" />
                            Extract {mode === "start" ? "Start" : mode === "end" ? "End" : "This"} Frame
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
                      <li>Instant, privacy-friendly processing on your device</li>
                      <li>Live video preview when using slider</li>
                      <li>Extracts high-quality PNG frames</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Extracted Frame */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Extracted Frame</CardTitle>
                      <CardDescription>
                        {extractedFrame
                          ? "Frame extracted successfully"
                          : "Frame will appear here"}
                      </CardDescription>
                    </div>
                    {extractedFrame && (
                      <Button
                        onClick={downloadFrame}
                        size="sm"
                        className="bg-purple-500 hover:bg-purple-600 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {!extractedFrame ? (
                    <div className="h-[400px] bg-muted/50 rounded-lg flex items-center justify-center transition-all duration-300">
                      <div className="text-center text-muted-foreground">
                        <Camera className="w-12 h-12 mx-auto mb-3 opacity-50 animate-pulse" />
                        <p className="text-sm">No frame extracted yet</p>
                        <p className="text-xs mt-1">Upload a video and choose which frame to extract</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-500">
                      <div className="relative rounded-lg overflow-hidden border bg-muted/50 group">
                        <img
                          src={extractedFrame}
                          alt="Extracted frame"
                          className="w-full h-auto transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>
                          {mode === "start" ? "Start Frame" : mode === "end" ? "End Frame" : `Frame at ${formatTime((sliderValue / 100) * duration)}`}
                        </span>
                        <span>PNG format</span>
                      </div>
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