<![CDATA[import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Loader2, Download, Music, Share2, Edit, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const FORMATS = [
  { value: "mp3", label: "MP3", icon: "🎵" },
  { value: "wav", label: "WAV", icon: "🎼" },
  { value: "m4a", label: "M4A", icon: "🎹" },
  { value: "aiff", label: "AIFF", icon: "🎧" },
  { value: "ogg", label: "OGG", icon: "🎸" },
  { value: "flac", label: "FLAC", icon: "💿" },
  { value: "opus", label: "Opus", icon: "🎤" },
];

export default function ConvertPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [sourceFormat, setSourceFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("mp3");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setConvertedUrl(null);
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      setSourceFormat(ext);
    }
  };

  const setupAudioVisualization = () => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    
    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;
    }

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, "rgb(168, 85, 247)");
        gradient.addColorStop(1, "rgb(236, 72, 153)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  const handlePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        await audio.play();
        setIsPlaying(true);
        setupAudioVisualization();
      }
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const handleShare = async () => {
    if (!convertedUrl) return;

    try {
      const response = await fetch(convertedUrl);
      const blob = await response.blob();
      const file = new File([blob], `converted.${targetFormat}`, { type: blob.type });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Converted Audio",
          files: [file],
        });
        toast({ title: "Shared successfully!" });
      } else {
        await navigator.clipboard.writeText(convertedUrl);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Share failed",
        description: "Could not share the audio file",
        variant: "destructive",
      });
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
      formData.append("audio", audioFile);
      formData.append("targetFormat", targetFormat);

      const response = await fetch("/api/download/formats", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);

      toast({
        title: "Conversion successful!",
        description: `Audio converted to ${targetFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `converted-${Date.now()}.${targetFormat}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <SEO
        title="Audio Converter - Convert Between MP3, WAV, M4A & More"
        description="Free online audio converter. Convert between MP3, WAV, M4A, AIFF, OGG, FLAC, and Opus formats"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12 max-w-4xl pt-24">
          <div className="mb-8 text-center">
            <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Converter
            </h1>
            <p className="text-muted-foreground">
              Convert audio files between MP3, WAV, M4A, and more formats
            </p>
          </div>

          <div className="grid gap-8">
            {/* Upload & Convert Section */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-400" />
                  Convert Audio
                </CardTitle>
                <CardDescription>
                  Upload your audio file and select the target format
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div>
                  <label
                    htmlFor="audio-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-purple-400/50 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        {audioFile ? (
                          <span className="font-semibold text-foreground">{audioFile.name}</span>
                        ) : (
                          <>
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A, AIFF, OGG, FLAC, Opus
                      </p>
                    </div>
                    <input
                      id="audio-upload"
                      type="file"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {/* Format Selection */}
                {audioFile && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Source Format</label>
                      <div className="px-4 py-3 bg-muted/50 rounded-lg border border-border/50 text-center">
                        <span className="text-lg font-semibold uppercase">{sourceFormat}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Format</label>
                      <Select value={targetFormat} onValueChange={setTargetFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FORMATS.map((format) => (
                            <SelectItem key={format.value} value={format.value}>
                              {format.icon} {format.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Convert Button */}
                <Button
                  onClick={handleConvert}
                  disabled={!audioFile || isConverting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  {isConverting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5 mr-2" />
                      Convert Audio
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Converted Audio Section */}
            {convertedUrl && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-green-400">Conversion Complete!</CardTitle>
                  <CardDescription>
                    Your audio has been converted to {targetFormat.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Waveform Visualization */}
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={200}
                      className="w-full h-[200px] rounded-lg bg-slate-950 border border-border/50"
                    />
                    <audio
                      ref={audioRef}
                      src={convertedUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={handlePlay}
                      variant="outline"
                      className="flex-1 min-w-[140px]"
                    >
                      {isPlaying ? "⏸️ Pause" : "▶️ Play"}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="flex-1 min-w-[140px]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="flex-1 min-w-[140px]"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                    <Link href="/edit">
                      <Button variant="outline" className="w-full border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Audio
                      </Button>
                    </Link>
                    <Link href="/enhance">
                      <Button variant="outline" className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Enhance Audio
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supported Formats Info */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-base">Supported Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {FORMATS.map((format) => (
                    <div
                      key={format.value}
                      className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      <span className="text-2xl">{format.icon}</span>
                      <span className="font-semibold">{format.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
</![CDATA[>
