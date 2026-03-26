import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Music, Download, Loader2, RefreshCw, CheckCircle2, AlertCircle, Play, Pause } from "lucide-react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

interface ConversionSettings {
  format: string;
  quality: string;
}

export default function AudioConverter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [convertedUrl, setConvertedUrl] = useState<string>("");
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  
  const [outputFormat, setOutputFormat] = useState<string>("mp3");
  const [quality, setQuality] = useState<string>("standard");
  
  const [isConverting, setIsConverting] = useState(false);
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressText, setProgressText] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const convertedAudioRef = useRef<HTMLAudioElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    loadFFmpeg();
  }, []);

  const loadFFmpeg = async () => {
    try {
      setIsLoadingFFmpeg(true);
      setProgressText("Loading audio engine...");
      
      const ffmpeg = new FFmpeg();
      
      ffmpeg.on("log", ({ message }) => {
        console.log("FFmpeg:", message);
      });

      ffmpeg.on("progress", ({ progress: prog }) => {
        const percentage = Math.round(prog * 100);
        if (isConverting) {
          setProgress(percentage);
          setProgressText(`Converting: ${percentage}%`);
        }
      });

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      ffmpegRef.current = ffmpeg;
      setFfmpegLoaded(true);
      setProgressText("");
    } catch (err) {
      console.error("FFmpeg load error:", err);
      setError("Failed to load audio engine. Please refresh and try again.");
    } finally {
      setIsLoadingFFmpeg(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      
      setConvertedUrl("");
      setConvertedBlob(null);
      setError("");
      setSuccess("");
      setProgress(0);
    } else {
      setError("Please select a valid audio file");
    }
  };

  const getFFmpegArgs = (inputExt: string, outputExt: string): string[] => {
    const args = ["-i", `input.${inputExt}`];
    
    // Quality settings based on format and quality preset
    switch (quality) {
      case "low":
        if (outputExt === "mp3") args.push("-b:a", "96k");
        else if (outputExt === "ogg") args.push("-b:a", "96k");
        else if (outputExt === "m4a") args.push("-b:a", "96k");
        break;
      
      case "standard":
        if (outputExt === "mp3") args.push("-b:a", "192k");
        else if (outputExt === "ogg") args.push("-b:a", "160k");
        else if (outputExt === "m4a") args.push("-b:a", "192k");
        break;
      
      case "high":
        if (outputExt === "mp3") args.push("-b:a", "320k");
        else if (outputExt === "ogg") args.push("-b:a", "256k");
        else if (outputExt === "m4a") args.push("-b:a", "256k");
        break;
      
      case "lossless":
        if (outputExt === "flac") args.push("-compression_level", "8");
        else if (outputExt === "wav") args.push("-c:a", "pcm_s16le");
        else args.push("-b:a", "320k");
        break;
    }
    
    args.push(`output.${outputExt}`);
    return args;
  };

  const handleConvert = async () => {
    if (!audioFile) {
      setError("Please select an audio file first");
      return;
    }

    if (!ffmpegLoaded || !ffmpegRef.current) {
      setError("Audio engine not loaded. Please wait and try again.");
      return;
    }

    setIsConverting(true);
    setError("");
    setSuccess("");
    setProgress(0);
    setConvertedUrl("");
    setConvertedBlob(null);
    setProgressText("Preparing audio...");

    try {
      const ffmpeg = ffmpegRef.current;
      const inputExt = audioFile.name.split(".").pop() || "mp3";
      const inputFileName = `input.${inputExt}`;
      const outputFileName = `output.${outputFormat}`;
      
      setProgressText("Loading audio file...");
      await ffmpeg.writeFile(inputFileName, await fetchFile(audioFile));

      setProgressText("Converting audio...");
      const args = getFFmpegArgs(inputExt, outputFormat);
      await ffmpeg.exec(args);

      setProgressText("Finalizing...");
      const data = await ffmpeg.readFile(outputFileName);
      const mimeType = `audio/${outputFormat === "m4a" ? "mp4" : outputFormat}`;
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setConvertedBlob(blob);
      setConvertedUrl(url);
      setProgress(100);
      setProgressText("");
      setSuccess(`Successfully converted to ${outputFormat.toUpperCase()}!`);

      await ffmpeg.deleteFile(inputFileName);
      await ffmpeg.deleteFile(outputFileName);

    } catch (err) {
      console.error("Conversion error:", err);
      setError(err instanceof Error ? err.message : "Failed to convert audio. Please try again.");
      setProgress(0);
      setProgressText("");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob || !audioFile) return;
    const a = document.createElement("a");
    a.href = convertedUrl;
    const baseName = audioFile.name.split(".").slice(0, -1).join(".");
    a.download = `${baseName}_converted.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setAudioFile(null);
    setAudioUrl("");
    setConvertedUrl("");
    setConvertedBlob(null);
    setProgress(0);
    setProgressText("");
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePlayOriginal = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
        title="Audio Format Converter - Back2Life.Studio"
        description="Convert audio files between MP3, WAV, M4A, FLAC, OGG, AIFF, and Opus formats with quality presets."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Audio Format Converter</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Convert audio files to any format with studio-quality encoding.
              </p>
              {isLoadingFFmpeg && (
                <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
                  <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                  <AlertDescription className="text-blue-600">
                    Loading audio engine... (First time may take 10-15 seconds)
                  </AlertDescription>
                </Alert>
              )}
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

            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Upload Audio</CardTitle>
                    <CardDescription>
                      Supports MP3, WAV, M4A, FLAC, OGG, AIFF, Opus
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP3, WAV, M4A, FLAC, OGG, AIFF, Opus
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Music className="w-8 h-8 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{audioFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(audioFile.size)}
                            </p>
                          </div>
                          <Button
                            onClick={togglePlayOriginal}
                            variant="ghost"
                            size="icon"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                        
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => setIsPlaying(false)}
                          className="w-full"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {audioFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Conversion Settings</CardTitle>
                      <CardDescription>
                        Choose output format and quality
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label>Output Format</Label>
                        <Select value={outputFormat} onValueChange={setOutputFormat}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mp3">MP3 (Most Compatible)</SelectItem>
                            <SelectItem value="wav">WAV (Uncompressed)</SelectItem>
                            <SelectItem value="m4a">M4A (Apple/iTunes)</SelectItem>
                            <SelectItem value="flac">FLAC (Lossless)</SelectItem>
                            <SelectItem value="ogg">OGG (Open Source)</SelectItem>
                            <SelectItem value="aiff">AIFF (Apple Lossless)</SelectItem>
                            <SelectItem value="opus">Opus (High Efficiency)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label>Quality Preset</Label>
                        <Select value={quality} onValueChange={setQuality}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low (96kbps - Smaller file)</SelectItem>
                            <SelectItem value="standard">Standard (192kbps - Balanced)</SelectItem>
                            <SelectItem value="high">High (320kbps - Premium)</SelectItem>
                            <SelectItem value="lossless">Lossless (Studio Quality)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isConverting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{progressText}</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleConvert}
                          disabled={isConverting || !audioFile || !ffmpegLoaded}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                        >
                          {isConverting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Converting...</>
                          ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" /> Convert Audio</>
                          )}
                        </Button>
                        {!isConverting && !convertedUrl && (
                          <Button onClick={handleReset} variant="outline" size="icon">
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="lg:col-span-3 space-y-6">
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Converted Audio</CardTitle>
                    <CardDescription>
                      {convertedUrl 
                        ? "Your converted audio is ready!" 
                        : "Your converted file will appear here"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!convertedUrl && !isConverting && (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Music className="w-12 h-12 mb-4 opacity-50" />
                        <p>Upload an audio file and click Convert to get started</p>
                      </div>
                    )}

                    {isConverting && (
                      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8">
                        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                        <p className="font-medium">{progressText}</p>
                        <p className="text-sm text-muted-foreground">Processing with studio-quality encoding</p>
                      </div>
                    )}

                    {convertedUrl && convertedBlob && (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20 rounded-xl p-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                                <Music className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-lg">
                                  {audioFile?.name.split(".").slice(0, -1).join(".")}_converted.{outputFormat}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatFileSize(convertedBlob.size)} • {outputFormat.toUpperCase()} • {quality.charAt(0).toUpperCase() + quality.slice(1)} Quality
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Ready
                            </Badge>
                          </div>

                          <audio
                            ref={convertedAudioRef}
                            src={convertedUrl}
                            controls
                            className="w-full"
                          />

                          <div className="flex gap-3">
                            <Button
                              onClick={handleDownload}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download {outputFormat.toUpperCase()}
                            </Button>
                            <Button
                              onClick={handleReset}
                              variant="outline"
                            >
                              Convert Another
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original Format</p>
                            <p className="font-medium">{audioFile?.name.split(".").pop()?.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Original Size</p>
                            <p className="font-medium">{formatFileSize(audioFile?.size || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Output Format</p>
                            <p className="font-medium">{outputFormat.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Output Size</p>
                            <p className="font-medium">{formatFileSize(convertedBlob.size)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}