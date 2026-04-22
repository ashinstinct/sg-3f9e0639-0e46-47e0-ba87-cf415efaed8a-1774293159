import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, FileAudio, Play, Pause, Download, Share2, Sparkles, Volume2, Scissors } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function AudioEditor() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

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
        const barHeight = canvas.height * percent * 0.8;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "#3b82f6"); // Blue for editor
        gradient.addColorStop(1, "#8b5cf6");

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioURL(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioURL);
      
      audioRef.current.addEventListener("loadedmetadata", () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });

      audioRef.current.addEventListener("timeupdate", () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });

      audioRef.current.addEventListener("ended", () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });

      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext();
      }

      const source = audioContextRef.current.createMediaElementSource(audioRef.current);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      await audioRef.current.play();
      setIsPlaying(true);
      drawWaveform();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleShare = async () => {
    if (!audioURL) return;

    try {
      const response = await fetch(audioURL);
      const blob = await response.blob();
      const file = new File([blob], `edited-audio-${Date.now()}.mp3`, { type: "audio/mp3" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Edited Audio",
        });
        toast({ title: "Shared successfully", description: "Audio file shared" });
      } else {
        await navigator.clipboard.writeText(audioURL);
        toast({ title: "Link copied", description: "Audio URL copied to clipboard" });
      }
    } catch (error) {
      console.error("Share error:", error);
      toast({ title: "Share failed", description: "Could not share audio file", variant: "destructive" });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO title="Audio Editor - Edit & Trim Audio" description="Edit and modify your audio files" />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Audio Editor
              </h1>
              <p className="text-muted-foreground">Upload and edit your audio files</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0 space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Upload Audio File</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("audio-upload")?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Choose File
                      </Button>
                      {audioFile && (
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {audioFile.name}
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      id="audio-upload"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {audioFile && (
                    <div className="pt-4 border-t">
                      <Label className="text-sm mb-4 block font-medium">Editor Tools</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="w-full flex flex-col h-auto py-4 gap-2">
                          <Scissors className="w-5 h-5 text-blue-500" />
                          <span>Trim Audio</span>
                        </Button>
                        <Button asChild variant="secondary" className="w-full flex flex-col h-auto py-4 gap-2">
                          <Link href="/enhance">
                            <Sparkles className="w-5 h-5 text-emerald-500" />
                            <span>Enhance</span>
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="p-6 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {audioURL ? (
                    <div className="space-y-6">
                      <div className="relative rounded-lg overflow-hidden bg-muted/20 border">
                        <canvas ref={waveformCanvasRef} width={800} height={200} className="w-full h-[200px]" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <Button
                            onClick={togglePlayback}
                            size="lg"
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="w-full" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-muted-foreground" />
                          <Slider value={[volume]} max={1} step={0.1} onValueChange={handleVolumeChange} className="w-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button asChild variant="outline" className="w-full">
                            <a href={audioURL} download={`edited-${Date.now()}.mp3`}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                          <Button onClick={handleShare} variant="outline" className="w-full">
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground py-20">
                      Upload an audio file to start editing
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