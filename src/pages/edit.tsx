import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileAudio, Download, Loader2, Scissors, Volume2, Gauge, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://back2life-audio-processing.onrender.com";

export default function AudioEditor() {
  const { toast } = useToast();
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Editing parameters
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [fadeIn, setFadeIn] = useState<number>(0);
  const [fadeOut, setFadeOut] = useState<number>(0);
  const [volume, setVolume] = useState<number>(100);
  const [speed, setSpeed] = useState<number>(1.0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedUrl, setEditedUrl] = useState<string>("");
  const [processedAudio, setProcessedAudio] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<number[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.playbackRate = speed;
    }
  }, [volume, speed]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setEditedUrl("");
      setError("");
      setSuccess("");
      setProgress(0);
      setTrimStart(0);
      setTrimEnd(0);
      setFadeIn(0);
      setFadeOut(0);
      setVolume(100);
      setSpeed(1.0);
    } else {
      setError("Please select a valid audio file");
    }
  };

  const handleAudioLoad = async () => {
    if (audioRef.current) {
      const duration = audioRef.current.duration;
      setAudioDuration(duration);
      setTrimEnd(duration);
      
      // Generate waveform
      await generateWaveform();
    }
  };

  const generateWaveform = async () => {
    if (!audioRef.current || !canvasRef.current) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const rawData = audioBuffer.getChannelData(0);
    const samples = 500;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData = [];

    for (let i = 0; i < samples; i++) {
      const blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }

    waveformRef.current = filteredData;
    drawWaveform();
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const data = waveformRef.current;
    const barWidth = width / data.length;
    const maxAmplitude = Math.max(...data);

    // Draw waveform bars
    data.forEach((amplitude, i) => {
      const barHeight = (amplitude / maxAmplitude) * height * 0.8;
      const x = i * barWidth;
      const y = (height - barHeight) / 2;

      // Gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.8)");
      gradient.addColorStop(1, "rgba(167, 139, 250, 0.4)");

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });

    // Draw trim markers
    if (audioDuration > 0) {
      const startX = (trimStart / audioDuration) * width;
      const endX = (trimEnd / audioDuration) * width;

      // Trim start marker
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)";
      ctx.fillRect(0, 0, startX, height);

      // Trim end marker
      ctx.fillStyle = "rgba(239, 68, 68, 0.3)";
      ctx.fillRect(endX, 0, width - endX, height);

      // Fade in marker
      if (fadeIn > 0) {
        const fadeInX = (fadeIn / audioDuration) * width;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.fillRect(startX, 0, fadeInX, height);
      }

      // Fade out marker
      if (fadeOut > 0) {
        const fadeOutX = ((audioDuration - fadeOut) / audioDuration) * width;
        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.fillRect(fadeOutX, 0, endX - fadeOutX, height);
      }

      // Current time marker
      const currentX = (currentTime / audioDuration) * width;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawWaveform();
  }, [trimStart, trimEnd, fadeIn, fadeOut, currentTime]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !audioRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * audioDuration;

    audioRef.current.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  const handleProcessAudio = async () => {
    if (!audioFile) {
      toast({
        title: "No Audio File",
        description: "Please upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setProcessedAudio(null);
    setError("");

    try {
      // Create FormData for backend
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("trim_start", trimStart.toString());
      formData.append("trim_end", trimEnd.toString());
      formData.append("fade_in", fadeIn.toString());
      formData.append("fade_out", fadeOut.toString());
      formData.append("volume", (volume / 100).toString()); // Convert percentage to decimal (100% = 1.0)
      formData.append("speed", speed.toString());

      // Send to Python backend
      const response = await fetch(`${BACKEND_URL}/api/edit-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Audio editing failed");
      }

      // Get the processed audio blob
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setProcessedAudio(url);

      toast({
        title: "Success!",
        description: "Audio edited successfully",
      });
    } catch (err) {
      console.error("Processing error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to process audio";
      setError(errorMessage);
      toast({
        title: "Processing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedAudio) return;

    const a = document.createElement("a");
    a.href = processedAudio;
    a.download = `${audioFile?.name.replace(/\.[^/.]+$/, "")}_edited.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Downloaded!",
      description: "Your edited audio has been downloaded",
    });
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioUrl("");
    setEditedUrl("");
    setProgress(0);
    setError("");
    setSuccess("");
    setTrimStart(0);
    setTrimEnd(0);
    setFadeIn(0);
    setFadeOut(0);
    setVolume(100);
    setSpeed(1.0);
    setIsPlaying(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <>
      <SEO
        title="Audio Editor - Back2Life.Studio"
        description="Edit audio files with trim, fade, volume, and speed controls. CapCut-style waveform editor."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Audio Editor</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Professional audio editing with waveform visualization - CapCut-style.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              {/* Upload Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Audio</CardTitle>
                  <CardDescription>
                    Choose an audio file to edit
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, M4A, OGG, FLAC
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {audioFile && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <FileAudio className="w-8 h-8 text-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{audioFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(audioFile.size)} • {formatTime(audioDuration)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {audioUrl && (
                <>
                  {/* Waveform Viewer */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Waveform</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatTime(currentTime)} / {formatTime(audioDuration)}
                          </span>
                          <Button onClick={togglePlayPause} size="sm" variant="outline">
                            {isPlaying ? "Pause" : "Play"}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="w-full h-32 bg-muted/30 rounded-lg cursor-pointer"
                      />
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onLoadedMetadata={handleAudioLoad}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    </CardContent>
                  </Card>

                  {/* Editing Controls */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Controls</CardTitle>
                      <CardDescription>
                        Adjust trim, fade, volume, and speed settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Trim Controls */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Scissors className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Trim</Label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Start</Label>
                              <span className="text-xs font-mono">{formatTime(trimStart)}</span>
                            </div>
                            <Slider
                              value={[trimStart]}
                              onValueChange={([v]) => setTrimStart(Math.min(v, trimEnd - 0.1))}
                              max={audioDuration}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">End</Label>
                              <span className="text-xs font-mono">{formatTime(trimEnd)}</span>
                            </div>
                            <Slider
                              value={[trimEnd]}
                              onValueChange={([v]) => setTrimEnd(Math.max(v, trimStart + 0.1))}
                              max={audioDuration}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Fade Controls */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Fade Effects</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Fade In</Label>
                              <span className="text-xs font-mono">{fadeIn.toFixed(1)}s</span>
                            </div>
                            <Slider
                              value={[fadeIn]}
                              onValueChange={([v]) => setFadeIn(v)}
                              max={Math.min(5, audioDuration / 2)}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs text-muted-foreground">Fade Out</Label>
                              <span className="text-xs font-mono">{fadeOut.toFixed(1)}s</span>
                            </div>
                            <Slider
                              value={[fadeOut]}
                              onValueChange={([v]) => setFadeOut(v)}
                              max={Math.min(5, audioDuration / 2)}
                              step={0.1}
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Volume Control */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Volume</Label>
                          <span className="text-xs text-muted-foreground ml-auto">{volume}%</span>
                        </div>
                        <Slider
                          value={[volume]}
                          onValueChange={([v]) => setVolume(v)}
                          max={200}
                          step={1}
                          className="w-full"
                        />
                      </div>

                      {/* Speed Control */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Speed</Label>
                          <span className="text-xs text-muted-foreground ml-auto">{speed}x</span>
                        </div>
                        <Slider
                          value={[speed * 10]}
                          onValueChange={([v]) => setSpeed(v / 10)}
                          min={5}
                          max={20}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0.5x (Slow)</span>
                          <span>1.0x (Normal)</span>
                          <span>2.0x (Fast)</span>
                        </div>
                      </div>

                      {isProcessing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Processing audio...</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleProcessAudio}
                          disabled={isProcessing || !audioFile}
                          size="lg"
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing Audio...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-5 h-5 mr-2" />
                              Process Audio
                            </>
                          )}
                        </Button>

                        {audioFile && !isProcessing && (
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            size="lg"
                          >
                            Reset
                          </Button>
                        )}
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Error</p>
                            <p className="text-sm text-destructive/80 mt-1">{error}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Make sure the backend server is running at {BACKEND_URL}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Processed Audio Player */}
                      {processedAudio && (
                        <Card className="border-green-500/20 bg-green-500/5">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Volume2 className="w-5 h-5 text-green-600" />
                              Edited Audio
                            </CardTitle>
                            <CardDescription>
                              Your processed audio is ready to download
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <audio
                              src={processedAudio}
                              controls
                              className="w-full"
                            />
                            <Button
                              onClick={handleDownload}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Edited Audio
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}