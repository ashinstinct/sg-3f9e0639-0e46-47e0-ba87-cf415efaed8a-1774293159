import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileAudio, Download, Loader2, RefreshCw } from "lucide-react";

type AudioFormat = "mp3" | "wav" | "m4a" | "aiff" | "ogg" | "flac" | "opus";
type BitRate = "128" | "192" | "256" | "320";

const formatInfo: Record<AudioFormat, { name: string; description: string }> = {
  mp3: { name: "MP3", description: "Most compatible, good compression" },
  wav: { name: "WAV", description: "Uncompressed, highest quality" },
  m4a: { name: "M4A", description: "Apple format, good quality" },
  aiff: { name: "AIFF", description: "Apple uncompressed format" },
  ogg: { name: "OGG Vorbis", description: "Open source, good compression" },
  flac: { name: "FLAC", description: "Lossless compression" },
  opus: { name: "Opus", description: "Modern codec, best for voice" }
};

export default function AudioConverter() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<AudioFormat>("mp3");
  const [bitRate, setBitRate] = useState<BitRate>("192");
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setConvertedUrl("");
    }
  };

  const handleAudioLoad = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleConvert = async () => {
    if (!audioFile) return;

    setIsConverting(true);
    
    // This would call your FFmpeg API endpoint
    // For now, we'll simulate the process
    setTimeout(() => {
      setIsConverting(false);
      alert(`Audio conversion requires server-side FFmpeg processing.\n\nWhen ready, implement:\nPOST /api/convert-audio\n\nPayload:\n- File: ${audioFile.name}\n- Format: ${outputFormat.toUpperCase()}\n- Bitrate: ${bitRate}kbps`);
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInputFormat = (): string => {
    if (!audioFile) return "Unknown";
    const ext = audioFile.name.split(".").pop()?.toLowerCase() || "";
    return ext.toUpperCase();
  };

  return (
    <>
      <SEO
        title="Audio Converter - Back2Life.Studio"
        description="Convert audio files between MP3, WAV, M4A, AIFF, OGG, FLAC, and Opus formats with quality control."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-purple-500">
                  <RefreshCw className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Audio Converter</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Convert audio files between popular formats with quality control.
              </p>
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Column - Upload & Settings */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Audio</CardTitle>
                    <CardDescription>
                      Choose an audio file to convert
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
                        MP3, WAV, M4A, AIFF, OGG, FLAC, Opus
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
                            {formatFileSize(audioFile.size)} • {formatTime(audioDuration)} • {getInputFormat()}
                          </p>
                        </div>
                      </div>
                    )}

                    {audioUrl && (
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        controls
                        onLoadedMetadata={handleAudioLoad}
                        className="w-full"
                      />
                    )}
                  </CardContent>
                </Card>

                {audioFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion Settings</CardTitle>
                      <CardDescription>
                        Choose output format and quality
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as AudioFormat)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(formatInfo).map(([format, info]) => (
                              <SelectItem key={format} value={format}>
                                <div className="flex flex-col items-start">
                                  <span className="font-medium">{info.name}</span>
                                  <span className="text-xs text-muted-foreground">{info.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(outputFormat === "mp3" || outputFormat === "ogg" || outputFormat === "opus") && (
                        <div className="space-y-2">
                          <Label>Bitrate (Quality)</Label>
                          <Select value={bitRate} onValueChange={(v) => setBitRate(v as BitRate)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="128">128 kbps (Good)</SelectItem>
                              <SelectItem value="192">192 kbps (Better)</SelectItem>
                              <SelectItem value="256">256 kbps (High)</SelectItem>
                              <SelectItem value="320">320 kbps (Maximum)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <Button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90"
                        size="lg"
                      >
                        {isConverting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Convert Audio
                          </>
                        )}
                      </Button>

                      {convertedUrl && (
                        <Button
                          onClick={() => {/* Download logic */}}
                          variant="outline"
                          className="w-full"
                          size="lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Converted File
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Info */}
              <div className="lg:col-span-2">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Conversion Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Input</span>
                        <Badge variant="secondary">{getInputFormat()}</Badge>
                      </div>
                      <div className="flex items-center justify-center text-muted-foreground">
                        <RefreshCw className="w-4 h-4" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Output</span>
                        <Badge className="bg-gradient-to-r from-violet-500 to-purple-500">
                          {outputFormat.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Supported Formats:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(formatInfo).map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>High-quality conversion</li>
                        <li>Preserves metadata</li>
                        <li>Customizable bitrate</li>
                        <li>Fast processing</li>
                        <li>No quality loss (lossless formats)</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        Note: This tool requires FFmpeg backend processing. Contact support to enable this feature.
                      </p>
                    </div>
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