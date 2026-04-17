import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WaveformVisualizer } from "@/components/WaveformVisualizer";
import {
  Repeat,
  Upload,
  Download,
  Loader2,
  Music,
  FileAudio,
  Video,
  Sparkles
} from "lucide-react";

const AUDIO_FORMATS = [
  { value: "mp3", label: "MP3", icon: Music },
  { value: "wav", label: "WAV", icon: FileAudio },
  { value: "m4a", label: "M4A", icon: Music },
  { value: "aiff", label: "AIFF", icon: FileAudio },
  { value: "ogg", label: "OGG", icon: Music },
  { value: "flac", label: "FLAC", icon: FileAudio },
  { value: "opus", label: "Opus", icon: Music },
];

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState("mp3");
  const [loading, setLoading] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/x-wav",
      "audio/mp4",
      "audio/m4a",
      "audio/aiff",
      "audio/x-aiff",
      "audio/ogg",
      "audio/flac",
      "audio/opus",
      "video/mp4",
    ];

    if (!validTypes.includes(selectedFile.type)) {
      alert("Please upload a valid audio file (MP3, WAV, M4A, AIFF, OGG, FLAC, Opus) or MP4 video");
      return;
    }

    setFile(selectedFile);
    setConvertedUrl("");

    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("audio", file);
    formData.append("format", outputFormat);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedUrl(url);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert audio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!convertedUrl) return;

    const a = document.createElement("a");
    a.href = convertedUrl;
    a.download = `converted.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    setAudioUrl("");
    setConvertedUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <SEO
        title="Audio Converter - Convert MP3, WAV, M4A, FLAC & More"
        description="Free audio converter supporting MP3, WAV, M4A, AIFF, OGG, FLAC, Opus formats. Convert MP4 videos to MP3 audio."
      />
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2">
                <Repeat className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">Free Tool</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-cyan-400">
                Audio Converter
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Convert between MP3, WAV, M4A, AIFF, OGG, FLAC, Opus formats. Also converts MP4 video to MP3 audio.
              </p>
            </div>

            {/* Upload Section */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6 space-y-6">
                {/* Drag and Drop Zone */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                    dragActive
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-slate-600 hover:border-cyan-400/50 hover:bg-slate-700/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/mp4"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center">
                      {file ? (
                        <FileAudio className="w-8 h-8 text-white" />
                      ) : (
                        <Upload className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white mb-2">
                        {file ? file.name : "Drop audio file here or click to upload"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Supports: MP3, WAV, M4A, AIFF, OGG, FLAC, Opus, MP4
                      </p>
                    </div>
                  </div>
                </div>

                {/* Waveform Display */}
                {audioUrl && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-300">Audio Preview</span>
                      <Badge variant="outline" className="border-cyan-500/50 text-cyan-300">
                        {file?.type.includes("video") ? "Video → Audio" : "Audio File"}
                      </Badge>
                    </div>
                    <WaveformVisualizer audioUrl={audioUrl} height={100} />
                  </div>
                )}

                {/* Format Selection */}
                {file && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-300">
                        Convert to:
                      </label>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-slate-400" />
                        <Repeat className="w-4 h-4 text-cyan-400" />
                        <Music className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {AUDIO_FORMATS.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex items-center gap-2">
                              <format.icon className="w-4 h-4" />
                              {format.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleConvert}
                    disabled={!file || loading}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Repeat className="w-4 h-4 mr-2" />
                        Convert to {outputFormat.toUpperCase()}
                      </>
                    )}
                  </Button>
                  {file && (
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      className="border-slate-600 hover:bg-slate-700"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                {/* Download Section */}
                {convertedUrl && (
                  <div className="space-y-4 p-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="font-semibold text-white">Conversion Complete!</span>
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="w-full bg-emerald-500 hover:bg-emerald-600"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download {outputFormat.toUpperCase()}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Supported Conversions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {AUDIO_FORMATS.map((format) => (
                    <div
                      key={format.value}
                      className="flex items-center gap-2 p-3 rounded-lg bg-slate-700/30 border border-slate-600/50"
                    >
                      <format.icon className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-medium text-slate-300">
                        {format.label}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Video className="w-5 h-5" />
                    <span className="font-medium">MP4 to MP3</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Extract audio from MP4 videos and convert to MP3 format
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}