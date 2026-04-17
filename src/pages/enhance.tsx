import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Upload, Loader2, Download, Sparkles, Play, Pause, Volume2, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EnhanceAudio() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedURL, setEnhancedURL] = useState<string>("");
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
        gradient.addColorStop(0, "#10b981");
        gradient.addColorStop(1, "#059669");

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
      setEnhancedURL("");
      const url = URL.createObjectURL(file);
      setAudioURL(url);
    }
  };

  const handleEnhance = async () => {
    if (!audioFile) {
      toast({
        title: "No file selected",
        description: "Please upload an audio file first",
        variant: "destructive",
      });
      return;
    }

    setIsEnhancing(true);

    try {
      const formData = new FormData();
      formData.append("file", audioFile);

      const response = await fetch("https://your-backend-url.com/enhance", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Enhancement failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedURL(url);

      toast({
        title: "Enhancement complete",
        description: "Your audio has been enhanced",
      });
    } catch (error) {
      console.error("Enhancement error:", error);
      toast({
        title: "Enhancement failed",
        description: "Using original audio for now",
        variant: "destructive",
      });
      setEnhancedURL(audioURL);
    } finally {
      setIsEnhancing(false);
    }
  };

  const togglePlayback = async () => {
    const playURL = enhancedURL || audioURL;
    if (!playURL) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(playURL);
      
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
    const shareURL = enhancedURL || audioURL;
    if (!shareURL) return;

    try {
      const response = await fetch(shareURL);
      const blob = await response.blob();
      const file = new File([blob], `enhanced-${Date.now()}.mp3`, { type: "audio/mp3" });

      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: "Enhanced Audio",
        });
        toast({
          title: "Shared successfully",
          description: "Audio file shared",
        });
      } else {
        await navigator.clipboard.writeText(shareURL);
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
        title="Audio Enhancer - Remove Noise & Improve Quality"
        description="Enhance audio quality with AI-powered noise reduction"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8 pt-20 max-w-4xl">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Enhance Audio
            </h1>
            <p className="text-sm text-muted-foreground">
              Upload an audio file to enhance
            </p>
          </div>

          <div className="space-y-6">
            <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0 space-y-4">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Upload Audio File</Label>
                  <div 
                    className="border-2 border-dashed border-border/50 rounded-lg p-6 sm:p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("audio-upload")?.click()}
                  >
                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm sm:text-base mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">MP3, WAV, M4A, OGG, FLAC (Max 100MB)</p>
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
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium truncate">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(audioFile.size / 1024).toFixed(2)} KB • {formatTime(duration)}
                    </p>
                  </div>
                )}

                {audioURL && (
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold block">Original Audio</Label>
                    <audio controls className="w-full" src={audioURL} />
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleEnhance}
                        disabled={isEnhancing}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enhancing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            Enhance Audio
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setAudioFile(null);
                          setAudioURL("");
                          setEnhancedURL("");
                          setIsPlaying(false);
                          if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current = null;
                          }
                        }}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {enhancedURL && (
              <Card className="p-4 sm:p-6 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0 space-y-4">
                  <Label className="text-base font-semibold block">Enhanced Audio</Label>
                  
                  <div className="relative rounded-lg overflow-hidden bg-muted/20 border">
                    <canvas
                      ref={waveformCanvasRef}
                      width={800}
                      height={150}
                      className="w-full h-[150px]"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={togglePlayback}
                        size="lg"
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1" />
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
                      <Volume2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
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
                        <a href={enhancedURL} download={`enhanced-${Date.now()}.mp3`}>
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
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
}