import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import {
  Download,
  Video,
  Music,
  Loader2,
  RefreshCw,
  Share2,
  LinkIcon,
  CheckCircle2,
  AlertCircle,
  Film,
  Zap,
} from "lucide-react";

type VideoMetadata = {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  platform: string;
};

type VideoFormat = {
  quality: string;
  format_id: string;
  ext: string;
  height: number;
  fps: number;
  filesize: number;
};

type AudioFormat = {
  quality: string;
  format_id: string;
  ext: string;
  abr: number;
  filesize: number;
};

type DownloadResult = {
  metadata: VideoMetadata;
  videoFormats: VideoFormat[];
  audioFormats: AudioFormat[];
};

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio" | null>(null);
  const [selectedQuality, setSelectedQuality] = useState("");
  const { toast } = useToast();

  // URL validation
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setUrlError("Please enter a video URL");
      return false;
    }

    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|twitter\.com|x\.com|facebook\.com|reddit\.com|vimeo\.com|dailymotion\.com)/i;
    
    if (!urlPattern.test(url)) {
      setUrlError("Please enter a valid video URL from supported platforms");
      return false;
    }

    setUrlError("");
    return true;
  };

  const handleUrlChange = (value: string) => {
    setVideoUrl(value);
    if (value.trim()) {
      validateUrl(value);
    } else {
      setUrlError("");
    }
  };

  const handleFetchFormats = async () => {
    if (!validateUrl(videoUrl)) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/download/formats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video information");
      }

      setResult({
        metadata: data.metadata,
        videoFormats: data.video_formats || [],
        audioFormats: data.audio_formats || [],
      });

      // Set default quality
      if (data.video_formats?.length > 0) {
        setSelectedQuality(data.video_formats[0].format_id);
      }
      
      toast({
        title: "✅ Video loaded!",
        description: `Found ${data.video_formats?.length || 0} video formats`,
      });

    } catch (err) {
      console.error("Fetch formats error:", err);
      let errorMessage = "Failed to load video. ";
      
      if (err instanceof Error) {
        if (err.message.includes("<!DOCTYPE") || err.message.includes("Unexpected token")) {
          errorMessage = "⚠️ Backend service is starting up or unavailable. The Python backend on Render may need to be deployed with yt-dlp support. Please try again in a moment.";
        } else if (err.message.includes("service is currently unavailable")) {
          errorMessage = err.message;
        } else {
          errorMessage += err.message;
        }
      }
      
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Failed to load video",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result || !selectedQuality) {
      toast({
        variant: "destructive",
        title: "No quality selected",
        description: "Please select a quality before downloading",
      });
      return;
    }

    setDownloading(true);
    setError("");

    try {
      toast({
        title: "🚀 Starting download...",
        description: "Please wait while we prepare your file",
      });

      const response = await fetch("/api/download/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl.trim(),
          formatId: selectedQuality,
          isAudioOnly: downloadType === "audio",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = result.metadata?.title 
        ? `${result.metadata.title}.${downloadType === "audio" ? "mp3" : "mp4"}`
        : `download.${downloadType === "audio" ? "mp3" : "mp4"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);

      toast({
        title: "✅ Download started!",
        description: "Your file is being downloaded",
      });

    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err instanceof Error ? err.message : "Download failed";
      setError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Download failed",
        description: errorMessage,
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Video Downloader - Back2Life.Studio",
          text: "Download videos from YouTube, TikTok, Instagram & more",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share canceled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "✅ Link copied!",
        description: "Share link copied to clipboard",
      });
    }
  };

  const getQualityLabel = (format: VideoFormat) => {
    const height = format.height;
    if (height >= 2160) return "4K (2160p) - Highest Quality";
    if (height >= 1440) return "2K (1440p) - Very High Quality";
    if (height >= 1080) return "Full HD (1080p) - High Quality";
    if (height >= 720) return "HD (720p) - Good Quality";
    if (height >= 480) return "SD (480p) - Standard Quality";
    return `${height}p - Basic Quality`;
  };

  const getAudioQualityLabel = (format: AudioFormat) => {
    const bitrate = Math.round(format.abr);
    if (bitrate >= 256) return "320 kbps - Highest Quality";
    if (bitrate >= 192) return "256 kbps - Very High Quality";
    if (bitrate >= 128) return "192 kbps - High Quality";
    if (bitrate >= 96) return "128 kbps - Good Quality";
    return `${bitrate} kbps - Standard Quality`;
  };

  return (
    <>
      <SEO 
        title="Video Downloader - Download from YouTube, TikTok & More | Back2Life.Studio"
        description="Free video downloader supporting YouTube, TikTok, Instagram, Twitter and 1000+ sites. Download videos in 4K, 1080p, 720p or extract audio in MP3 format."
      />
      <Navigation />
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-cyan-500 mb-4 shadow-lg shadow-cyan-500/20">
              <Download className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Video <span className="text-primary">Downloader</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Download videos from YouTube, TikTok, Instagram & more with quality options
            </p>
            
            {/* Share Button */}
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share This Tool
            </Button>
          </div>

          <div className="space-y-6">
            {/* Error Display */}
            {error && (
              <Card className="border-2 border-destructive bg-destructive/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Error</p>
                      <p className="text-sm text-destructive/90">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* URL Input Section */}
            {!result && (
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                        <Input
                          type="url"
                          placeholder="Paste video URL here (YouTube, TikTok, Instagram, etc.)"
                          value={videoUrl}
                          onChange={(e) => handleUrlChange(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleFetchFormats()}
                          className={`h-14 pl-12 pr-4 text-lg ${urlError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                          disabled={loading}
                        />
                        {videoUrl && !urlError && !loading && (
                          <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                        )}
                      </div>
                      {urlError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {urlError}
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleFetchFormats}
                      disabled={loading || !videoUrl.trim() || !!urlError}
                      size="lg"
                      className="w-full h-14 text-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Loading Video...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download Video
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video Result Section */}
            {result && (
              <div className="space-y-6">
                {/* Video Preview Card */}
                <Card className="border-2 border-primary/20 overflow-hidden">
                  {result.metadata?.thumbnail && (
                    <div className="relative aspect-video bg-slate-900">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Film className="w-24 h-24 text-cyan-500/30" />
                      </div>
                    </div>
                  )}
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {result.metadata?.title || "Video"}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                      <span>{result.metadata?.platform || "YouTube"}</span>
                      <span>•</span>
                      <span>
                        {result.metadata?.duration 
                          ? `${Math.floor(result.metadata.duration / 60)}:${String(result.metadata.duration % 60).padStart(2, '0')}`
                          : "0:00"} minutes
                      </span>
                    </div>

                    {/* Format Selection Buttons */}
                    {!downloadType && (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => {
                            setDownloadType("video");
                            setSelectedQuality(result.videoFormats[0]?.format_id || "");
                          }}
                          className="group relative p-6 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all duration-200"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Film className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-lg mb-1">Video + Audio</h4>
                              <p className="text-sm text-muted-foreground">
                                {result.videoFormats.length} quality options
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setDownloadType("audio");
                            setSelectedQuality(result.audioFormats[0]?.format_id || "");
                          }}
                          className="group relative p-6 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Zap className="w-6 h-6" />
                            </div>
                            <div className="text-center">
                              <h4 className="font-bold text-lg mb-1">Audio Only</h4>
                              <p className="text-sm text-muted-foreground">
                                {result.audioFormats.length} format options
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Quality Selection List */}
                    {downloadType && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold">
                            Select {downloadType === "video" ? "Video" : "Audio"} Quality
                          </h4>
                          <Button
                            onClick={() => {
                              setDownloadType(null);
                              setSelectedQuality("");
                            }}
                            variant="ghost"
                            size="sm"
                          >
                            Change
                          </Button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {downloadType === "video" 
                            ? result.videoFormats.map((format) => (
                                <button
                                  key={format.format_id}
                                  onClick={() => setSelectedQuality(format.format_id)}
                                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedQuality === format.format_id
                                      ? "border-cyan-500 bg-cyan-500/10"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-lg">
                                        {getQualityLabel(format)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {format.ext.toUpperCase()}
                                        {format.filesize ? ` • ${(format.filesize / 1024 / 1024).toFixed(1)}MB` : ""}
                                      </p>
                                    </div>
                                    {selectedQuality === format.format_id && (
                                      <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>
                              ))
                            : result.audioFormats.map((format) => (
                                <button
                                  key={format.format_id}
                                  onClick={() => setSelectedQuality(format.format_id)}
                                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                    selectedQuality === format.format_id
                                      ? "border-cyan-500 bg-cyan-500/10"
                                      : "border-border hover:border-primary/50"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-semibold text-lg">
                                        {getAudioQualityLabel(format)}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {format.ext.toUpperCase()}
                                        {format.filesize ? ` • ${(format.filesize / 1024 / 1024).toFixed(1)}MB` : ""}
                                      </p>
                                    </div>
                                    {selectedQuality === format.format_id && (
                                      <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0" />
                                    )}
                                  </div>
                                </button>
                              ))
                          }
                        </div>

                        {/* Download Actions */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={handleDownload}
                            disabled={downloading || !selectedQuality}
                            size="lg"
                            className="flex-1 h-14 text-lg bg-cyan-500 hover:bg-cyan-600"
                          >
                            {downloading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <Download className="w-5 h-5 mr-2" />
                                Download
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setResult(null);
                              setVideoUrl("");
                              setSelectedQuality("");
                              setDownloadType(null);
                            }}
                            variant="outline"
                            size="lg"
                            className="h-14"
                          >
                            New Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Copyright Notice */}
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">
                        Please respect copyright laws and only download content you have permission to download.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}