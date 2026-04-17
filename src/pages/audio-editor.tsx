import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Loader2, Download, Scissors, Play, Pause, Volume2, RotateCcw, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AudioEditor() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [editedURL, setEditedURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  
  // Edit controls
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [volumeAdjust, setVolumeAdjust] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const drawWaveform = () => {
    const canvas = waveformCanvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const barCount = 40;

    const draw = () => {
      if (!isPlaying) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const percent = value / 255;
        const height = canvas.height * percent;
        const x = i * barWidth;
        const y = canvas.height - height;

        const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#ec4899");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - 2, height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      toast({
        title: "Invalid File",
        description: "Please upload an audio file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 100MB",
        variant: "destructive",
      });
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioURL(url);
    setEditedURL("");
    setTrimStart(0);
    setTrimEnd(0);
    setFadeIn(0);
    setFadeOut(0);
    setSpeed(1);
    setVolumeAdjust(1);

    toast({
      title: "Audio Loaded",
      description: `${file.name} is ready to edit`,
    });
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      setDuration(dur);
      setTrimEnd(dur);

      // Set up Web Audio API for visualization
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const source = audioContext.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioContext.destination);

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
      }
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      drawWaveform();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percent = x / bounds.width;
    const time = percent * duration;

    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setTrimStart(0);
    setTrimEnd(duration);
    setFadeIn(0);
    setFadeOut(0);
    setSpeed(1);
    setVolumeAdjust(1);
    setEditedURL("");
    
    toast({
      title: "Reset Complete",
      description: "All edits have been reset",
    });
  };

  const handleApplyEdits = async () => {
    if (!audioFile) return;

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("trimStart", trimStart.toString());
      formData.append("trimEnd", trimEnd.toString());
      formData.append("fadeIn", fadeIn.toString());
      formData.append("fadeOut", fadeOut.toString());
      formData.append("speed", speed.toString());
      formData.append("volume", volumeAdjust.toString());

      const response = await fetch("/api/audio-editor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEditedURL(url);

      toast({
        title: "Edits Applied",
        description: "Your audio has been edited successfully",
      });
    } catch (error) {
      console.error("Error editing audio:", error);
      toast({
        title: "Error",
        description: "Failed to edit audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!editedURL) return;

    const link = document.createElement("a");
    link.href = editedURL;
    link.download = `edited_${audioFile?.name || "audio.mp3"}`;
    link.click();

    toast({
      title: "Download Started",
      description: "Your edited audio is downloading",
    });
  };

  return (
    <>
      <SEO 
        title="Audio Editor - Back2Life.Studio"
        description="Edit audio files with trim, fade, speed, and volume controls"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Scissors className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Audio Editor</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Edit Audio
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Trim, fade, adjust volume and speed
              </p>
            </div>

            {/* Upload Section */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6 sm:p-8">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="audio-upload" className="text-lg font-semibold text-white mb-4 block">
                      Upload Audio File
                    </Label>
                    <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 sm:p-12 text-center hover:border-purple-500/50 transition-colors">
                      <input
                        id="audio-upload"
                        type="file"
                        accept="audio/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="audio-upload" className="cursor-pointer block">
                        <Upload className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-slate-400" />
                        <p className="text-base sm:text-lg text-slate-300 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-slate-500">MP3, WAV, M4A, OGG, FLAC (Max 100MB)</p>
                      </label>
                    </div>
                  </div>

                  {audioFile && (
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-2">Loaded File:</p>
                      <p className="text-white font-medium truncate">{audioFile.name}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {formatTime(duration)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Audio Player & Waveform */}
            {audioURL && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-semibold text-white">Original Audio</h3>
                  
                  {/* Waveform Visualization */}
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <canvas
                      ref={waveformCanvasRef}
                      width={600}
                      height={120}
                      className="w-full h-24 sm:h-32"
                    />
                  </div>

                  {/* Progress Bar */}
                  <div 
                    className="bg-slate-700 rounded-full h-2 cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                  >
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>

                  {/* Audio Element */}
                  <audio
                    ref={audioRef}
                    src={audioURL}
                    onLoadedMetadata={handleLoadedMetadata}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />

                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      onClick={togglePlayPause}
                      size="lg"
                      className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                      {isPlaying ? "Pause" : "Play"}
                    </Button>

                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                      <span className="text-sm text-slate-400 min-w-[45px]">{formatTime(currentTime)}</span>
                      <span className="text-sm text-slate-500">/</span>
                      <span className="text-sm text-slate-400 min-w-[45px]">{formatTime(duration)}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <Volume2 className="w-5 h-5 text-slate-400" />
                      <Slider
                        value={[volume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleVolumeChange}
                        className="w-24"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edit Controls */}
            {audioURL && (
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-semibold text-white">Edit Controls</h3>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Trim Start */}
                    <div className="space-y-2">
                      <Label className="text-white">Trim Start: {formatTime(trimStart)}</Label>
                      <Slider
                        value={[trimStart]}
                        min={0}
                        max={duration}
                        step={0.1}
                        onValueChange={(val) => setTrimStart(val[0])}
                      />
                    </div>

                    {/* Trim End */}
                    <div className="space-y-2">
                      <Label className="text-white">Trim End: {formatTime(trimEnd)}</Label>
                      <Slider
                        value={[trimEnd]}
                        min={0}
                        max={duration}
                        step={0.1}
                        onValueChange={(val) => setTrimEnd(val[0])}
                      />
                    </div>

                    {/* Fade In */}
                    <div className="space-y-2">
                      <Label className="text-white">Fade In: {fadeIn.toFixed(1)}s</Label>
                      <Slider
                        value={[fadeIn]}
                        min={0}
                        max={5}
                        step={0.1}
                        onValueChange={(val) => setFadeIn(val[0])}
                      />
                    </div>

                    {/* Fade Out */}
                    <div className="space-y-2">
                      <Label className="text-white">Fade Out: {fadeOut.toFixed(1)}s</Label>
                      <Slider
                        value={[fadeOut]}
                        min={0}
                        max={5}
                        step={0.1}
                        onValueChange={(val) => setFadeOut(val[0])}
                      />
                    </div>

                    {/* Speed */}
                    <div className="space-y-2">
                      <Label className="text-white">Speed: {speed.toFixed(2)}x</Label>
                      <Slider
                        value={[speed]}
                        min={0.5}
                        max={2}
                        step={0.05}
                        onValueChange={(val) => setSpeed(val[0])}
                      />
                    </div>

                    {/* Volume Adjust */}
                    <div className="space-y-2">
                      <Label className="text-white">Volume Adjust: {volumeAdjust.toFixed(2)}x</Label>
                      <Slider
                        value={[volumeAdjust]}
                        min={0.1}
                        max={3}
                        step={0.1}
                        onValueChange={(val) => setVolumeAdjust(val[0])}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleApplyEdits}
                      disabled={isProcessing}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Apply Edits
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="lg"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edited Audio Download */}
            {editedURL && (
              <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white">Edited Audio Ready!</h3>
                  </div>
                  
                  <audio controls src={editedURL} className="w-full" />

                  <Button
                    onClick={handleDownload}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Edited Audio
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}