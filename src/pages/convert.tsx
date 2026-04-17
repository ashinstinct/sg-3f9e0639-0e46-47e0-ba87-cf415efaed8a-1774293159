import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Upload, Loader2, Download, FileAudio, Play, Pause, Share2, Edit, Sparkles, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const AUDIO_FORMATS = ["mp3", "wav", "m4a", "aiff", "ogg", "flac", "opus"];

export default function AudioConverter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedURL, setConvertedURL] = useState<string>("");
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
        gradient.addColorStop(0, "#a855f7");
        gradient.addColorStop(1, "#ec4899");

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
      setConvertedURL("");
      const format = file.name.split(".").pop()?.toLowerCase() || "";
      setSourceFormat(format);
      
      if (format === targetFormat) {
        setTargetFormat("mp3");
      }
    }
  };

  const handleConvert = async () => {
    if (!audioFile) {
      toast({
        title: "No file selected",
        description: "Please upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    if (sourceFormat === targetFormat) {
      toast({
        title: "Same format",
        description: "Source and target formats are the same",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("format", targetFormat);

      const response = await fetch("/api/download/formats", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedURL(url);

      toast({
        title: "Conversion complete",
        description: `File converted to ${targetFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: "Could not convert the audio file",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const togglePlayback = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(convertedURL);
      
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
    if (!convertedURL) return;

    try {
      const response = await fetch(convertedURL);
      const blob = await response.blob();
      const file = new File([blob], `converted-${Date.now()}.${targetFormat}`, { 
        type: `audio/${targetFormat}` 
      });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Converted Audio",
        });
        toast({
          title: "Shared successfully",
          description: "Audio file shared",
        });
      } else {
        await navigator.clipboard.writeText(convertedURL);
        toast({
          title: "Link copied",
          description: "Audio URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share failed",
        description: "Could not share audio file",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <SEO
        title="Audio Converter - Convert Audio Formats"
        description="Convert audio files between MP3, WAV, M4A, and more"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 pt-24 max-w-6xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Converter
            </h1>
            <p className="text-muted-foreground">
              Convert audio files between formats
            </p>
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
                  <>
                    <div>
                      <Label className="text-sm mb-2 block">Source Format</Label>
                      <div className="px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                        {sourceFormat.toUpperCase()}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="target-format" className="text-sm mb-2 block">
                        Convert To
                      </Label>
                      <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger id="target-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUDIO_FORMATS.filter(f => f !== sourceFormat).map((format) => (
                            <SelectItem key={format} value={format}>
                              {format.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={handleConvert}
                      disabled={isConverting || !audioFile}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        "Convert Audio"
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                {convertedURL ? (
                  <div className="space-y-6">
                    <div className="relative rounded-lg overflow-hidden bg-muted/20 border">
                      <canvas
                        ref={waveformCanvasRef}
                        width={800}
                        height={200}
                        className="w-full h-[200px]"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        <Button
                          onClick={togglePlayback}
                          size="lg"
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          {isPlaying ? (
                            <Pause className="w-6 h-6" />
                          ) : (
                            <Play className="w-6 h-6 ml-1" />
                          )}
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Slider
                          value={[currentTime]}
                          max={duration || 100}
                          step={0.1}
                          onValueChange={handleSeek}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted-foreground" />
                        <Slider
                          value={[volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="w-full"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full"
                        >
                          <a href={convertedURL} download={`converted-${Date.now()}.${targetFormat}`}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </a>
                        </Button>
                        <Button
                          onClick={handleShare}
                          variant="outline"
                          className="w-full"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-blue-500/50 hover:bg-blue-500/10"
                        >
                          <Link href="/edit">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Audio
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full border-emerald-500/50 hover:bg-emerald-500/10"
                        >
                          <Link href="/enhance">
                            <Sparkles className="w-4 h-4 mr-2" />
                            Enhance
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground py-20">
                    {isConverting ? "Converting..." : "Converted audio will appear here"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}