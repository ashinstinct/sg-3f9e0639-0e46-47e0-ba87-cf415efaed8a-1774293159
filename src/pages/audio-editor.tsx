import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  Play, 
  Pause, 
  Download,
  Scissors,
  Volume2,
  Zap,
  Clock,
  Repeat,
  X
} from "lucide-react";

declare global {
  interface Window {
    WaveSurfer: any;
  }
}

export default function AudioEditorPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Edit parameters
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [volume, setVolume] = useState(100);
  const [speed, setSpeed] = useState(100);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  const wavesurferRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load WaveSurfer.js from CDN
  useEffect(() => {
    if (typeof window !== "undefined" && !window.WaveSurfer) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/wavesurfer.js@7";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Initialize WaveSurfer when audio file is loaded
  useEffect(() => {
    if (!audioUrl || !containerRef.current || typeof window === "undefined" || !window.WaveSurfer) return;

    // Cleanup previous instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Create WaveSurfer instance
    const wavesurfer = window.WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgb(148 163 184)", // slate-400
      progressColor: "rgb(168 85 247)", // purple-500
      cursorColor: "rgb(236 72 153)", // pink-500
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 128,
      normalize: true,
      backend: "WebAudio",
    });

    // Load audio
    wavesurfer.load(audioUrl);

    // Event listeners
    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    wavesurferRef.current = wavesurfer;

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [audioUrl]);

  // Update volume
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(volume / 100);
    }
  }, [volume]);

  // Update playback speed
  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(speed / 100);
    }
  }, [speed]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    
    toast({
      title: "Audio loaded",
      description: "Ready to edit",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleExport = async () => {
    if (!audioFile) return;

    setIsProcessing(true);
    toast({
      title: "Processing audio...",
      description: "Applying edits and preparing download",
    });

    try {
      const formData = new FormData();
      formData.append("audio", audioFile);
      formData.append("trimStart", trimStart.toString());
      formData.append("trimEnd", trimEnd.toString());
      formData.append("volume", volume.toString());
      formData.append("speed", speed.toString());
      formData.append("fadeIn", fadeIn.toString());
      formData.append("fadeOut", fadeOut.toString());

      const response = await fetch("/api/audio/edit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `edited_${audioFile.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success!",
        description: "Audio exported successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetEdits = () => {
    setTrimStart(0);
    setTrimEnd(100);
    setVolume(100);
    setSpeed(100);
    setFadeIn(0);
    setFadeOut(0);
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Professional audio editing with trim, fade, volume, and speed controls"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2">
                <Scissors className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Audio Editor</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Audio Editor
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Professional audio editing with real-time waveform visualization
              </p>
            </div>

            {/* Upload Section */}
            {!audioFile && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-8">
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-slate-600 hover:border-purple-500/50 hover:bg-slate-700/50"
                    }`}
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {isDragging ? "Drop your audio file here" : "Upload Audio File"}
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Drag and drop or click to browse
                    </p>
                    <p className="text-sm text-slate-500">
                      Supports MP3, WAV, M4A, FLAC, OGG (Max 50MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Editor Section */}
            {audioFile && (
              <div className="space-y-6">
                {/* File Info */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-white">{audioFile.name}</p>
                        <p className="text-xs text-slate-400">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAudioFile(null);
                          setAudioUrl(null);
                          setIsPlaying(false);
                          resetEdits();
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Waveform */}
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-6 space-y-4">
                    <div ref={containerRef} className="rounded-lg overflow-hidden bg-slate-900/50" />
                    
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={togglePlayPause}
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5 mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Controls Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Trim Controls */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Scissors className="w-5 h-5 text-purple-400" />
                        Trim
                      </CardTitle>
                      <CardDescription>Select the portion to keep</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Start: {trimStart}%</Label>
                        <Slider
                          value={[trimStart]}
                          onValueChange={(value) => setTrimStart(value[0])}
                          max={100}
                          step={1}
                          className="[&_[role=slider]]:bg-purple-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">End: {trimEnd}%</Label>
                        <Slider
                          value={[trimEnd]}
                          onValueChange={(value) => setTrimEnd(value[0])}
                          max={100}
                          step={1}
                          className="[&_[role=slider]]:bg-purple-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Volume & Speed */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                        Volume & Speed
                      </CardTitle>
                      <CardDescription>Adjust playback settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Volume: {volume}%</Label>
                        <Slider
                          value={[volume]}
                          onValueChange={(value) => setVolume(value[0])}
                          max={200}
                          step={1}
                          className="[&_[role=slider]]:bg-cyan-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Speed: {speed}%</Label>
                        <Slider
                          value={[speed]}
                          onValueChange={(value) => setSpeed(value[0])}
                          min={50}
                          max={200}
                          step={1}
                          className="[&_[role=slider]]:bg-cyan-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Fade Effects */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Zap className="w-5 h-5 text-pink-400" />
                        Fade Effects
                      </CardTitle>
                      <CardDescription>Smooth transitions</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Fade In: {fadeIn}s</Label>
                        <Slider
                          value={[fadeIn]}
                          onValueChange={(value) => setFadeIn(value[0])}
                          max={10}
                          step={0.1}
                          className="[&_[role=slider]]:bg-pink-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Fade Out: {fadeOut}s</Label>
                        <Slider
                          value={[fadeOut]}
                          onValueChange={(value) => setFadeOut(value[0])}
                          max={10}
                          step={0.1}
                          className="[&_[role=slider]]:bg-pink-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <Card className="bg-slate-800/50 border-slate-700/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Download className="w-5 h-5 text-green-400" />
                        Export
                      </CardTitle>
                      <CardDescription>Save your edited audio</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        onClick={handleExport}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        {isProcessing ? (
                          <>
                            <Clock className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Export Audio
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={resetEdits}
                        variant="outline"
                        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        <Repeat className="w-4 h-4 mr-2" />
                        Reset Edits
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}