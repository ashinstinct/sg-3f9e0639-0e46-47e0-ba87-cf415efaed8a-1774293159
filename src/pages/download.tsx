import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Download, 
  Video, 
  Music, 
  AlertCircle,
  CheckCircle2,
  LinkIcon,
  ExternalLink,
  Share2,
  User,
  Clock,
  RefreshCw,
  Badge
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
  height?: number;
  fps?: number;
  abr?: number;
  filesize?: number;
};

type DownloadStatus = 
  | { stage: "idle" }
  | { stage: "validating"; message: "Validating URL..." }
  | { stage: "fetching"; message: "Connecting to platform..." }
  | { stage: "processing"; message: "Processing video..." }
  | { stage: "ready"; message: "Ready to download!" }
  | { stage: "error"; message: string };

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [videoFormats, setVideoFormats] = useState<VideoFormat[]>([]);
  const [audioFormats, setAudioFormats] = useState<VideoFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<VideoFormat | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({ stage: "idle" });
  const { toast } = useToast();

  // URL validation
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setError("Please enter a video URL");
      return false;
    }

    const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|tiktok\.com|instagram\.com|twitter\.com|x\.com|facebook\.com|reddit\.com|vimeo\.com|dailymotion\.com)/i;
    
    if (!urlPattern.test(url)) {
      setError("Please enter a valid video URL from supported platforms");
      return false;
    }

    setError("");
    return true;
  };

  // Handle URL input change with real-time validation
  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      validateUrl(value);
    } else {
      setError("");
    }
  };

  const handleFetchFormats = async () => {
    // Validate URL first
    if (!validateUrl(url)) {
      return;
    }

    setLoading(true);
    setError("");
    setMetadata(null);
    setVideoFormats([]);
    setAudioFormats([]);
    setSelectedFormat(null);
    setDownloadStatus({ stage: "validating", message: "Validating URL..." });

    try {
      // Stage 1: Validating
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 2: Fetching
      setDownloadStatus({ stage: "fetching", message: "Connecting to platform..." });
      
      const response = await fetch("/api/download/formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video information");
      }

      // Stage 3: Processing
      setDownloadStatus({ stage: "processing", message: "Processing video..." });
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 4: Ready
      setDownloadStatus({ stage: "ready", message: "Ready to download!" });

      setMetadata(data.metadata);
      setVideoFormats(data.video_formats || []);
      setAudioFormats(data.audio_formats || []);

      // Auto-select best quality
      if (downloadType === "video" && data.video_formats?.length > 0) {
        setSelectedFormat(data.video_formats[0]);
      } else if (downloadType === "audio" && data.audio_formats?.length > 0) {
        setSelectedFormat(data.audio_formats[0]);
      }

      toast({
        title: "✅ Video information loaded",
        description: "Select your preferred quality and download",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setDownloadStatus({ stage: "error", message: errorMessage });
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
    if (!selectedFormat || !url) {
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
          url: url.trim(),
          formatId: selectedFormat.format_id,
          isAudioOnly: downloadType === "audio",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Download failed");
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${metadata?.title || "download"}.${selectedFormat.ext}`;
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
      const errorMessage = err instanceof Error ? err.message : "Download failed. Please try again.";
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

  const resetDownload = () => {
    setUrl("");
    setMetadata(null);
    setVideoFormats([]);
    setAudioFormats([]);
    setSelectedFormat(null);
    setError("");
    setDownloadStatus({ stage: "idle" });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentFormats = downloadType === "video" ? videoFormats : audioFormats;

  return (
    <>
      <SEO
        title="Video Downloader - Download Videos from YouTube, TikTok & More | Back2Life.Studio"
        description="Free video downloader supporting YouTube, TikTok, Instagram, Twitter and 1000+ sites. Download in multiple quality options including 4K."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <div className="container max-w-4xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Video Downloader
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Download videos from YouTube, TikTok, Instagram, Twitter, and 1000+ sites
            </p>
            
            {/* Share Button */}
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share This Tool
            </Button>
          </div>

          {/* Main Content Card */}
          <Card className="border-2 shadow-xl">
            <CardContent className="p-8">
              {!metadata ? (
                /* Initial State - Large URL Input */
                <div className="space-y-6">
                  {/* Download Type Toggle */}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant={downloadType === "video" ? "default" : "outline"}
                      onClick={() => setDownloadType("video")}
                      className="gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </Button>
                    <Button
                      variant={downloadType === "audio" ? "default" : "outline"}
                      onClick={() => setDownloadType("audio")}
                      className="gap-2"
                    >
                      <Music className="w-4 h-4" />
                      Audio Only
                    </Button>
                  </div>

                  {/* Large URL Input */}
                  <div className="space-y-3">
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="url"
                        placeholder="Paste video URL here (YouTube, TikTok, Instagram, Twitter...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleFetchFormats()}
                        className="h-14 pl-12 text-lg"
                        disabled={loading}
                      />
                    </div>
                    <Button
                      onClick={handleFetchFormats}
                      disabled={loading || !url.trim()}
                      size="lg"
                      className="w-full h-12 text-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          {downloadType === "video" ? "Download Video" : "Download Audio"}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Real-Time Status Display */}
                  {downloadStatus.stage !== "idle" && downloadStatus.stage !== "error" && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {/* Progress Steps */}
                          <div className="flex items-center justify-between">
                            {/* Step 1: Validating */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                downloadStatus.stage === "validating" 
                                  ? "bg-primary animate-pulse" 
                                  : ["fetching", "processing", "ready"].includes(downloadStatus.stage)
                                  ? "bg-green-500" 
                                  : "bg-muted"
                              }`}>
                                {["fetching", "processing", "ready"].includes(downloadStatus.stage) ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                                )}
                              </div>
                              <span className="text-xs mt-2 text-muted-foreground">Validating</span>
                            </div>

                            {/* Connector Line */}
                            <div className={`flex-1 h-1 mx-2 transition-all ${
                              ["fetching", "processing", "ready"].includes(downloadStatus.stage)
                                ? "bg-green-500"
                                : "bg-muted"
                            }`} />

                            {/* Step 2: Fetching */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                downloadStatus.stage === "fetching" 
                                  ? "bg-primary animate-pulse" 
                                  : ["processing", "ready"].includes(downloadStatus.stage)
                                  ? "bg-green-500" 
                                  : "bg-muted"
                              }`}>
                                {["processing", "ready"].includes(downloadStatus.stage) ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : downloadStatus.stage === "fetching" ? (
                                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                  <LinkIcon className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <span className="text-xs mt-2 text-muted-foreground">Fetching</span>
                            </div>

                            {/* Connector Line */}
                            <div className={`flex-1 h-1 mx-2 transition-all ${
                              ["processing", "ready"].includes(downloadStatus.stage)
                                ? "bg-green-500"
                                : "bg-muted"
                            }`} />

                            {/* Step 3: Processing */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                downloadStatus.stage === "processing" 
                                  ? "bg-primary animate-pulse" 
                                  : downloadStatus.stage === "ready"
                                  ? "bg-green-500" 
                                  : "bg-muted"
                              }`}>
                                {downloadStatus.stage === "ready" ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : downloadStatus.stage === "processing" ? (
                                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                                ) : (
                                  <Video className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <span className="text-xs mt-2 text-muted-foreground">Processing</span>
                            </div>

                            {/* Connector Line */}
                            <div className={`flex-1 h-1 mx-2 transition-all ${
                              downloadStatus.stage === "ready"
                                ? "bg-green-500"
                                : "bg-muted"
                            }`} />

                            {/* Step 4: Ready */}
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                downloadStatus.stage === "ready" 
                                  ? "bg-green-500" 
                                  : "bg-muted"
                              }`}>
                                {downloadStatus.stage === "ready" ? (
                                  <CheckCircle2 className="w-5 h-5 text-white" />
                                ) : (
                                  <Download className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              <span className="text-xs mt-2 text-muted-foreground">Ready</span>
                            </div>
                          </div>

                          {/* Status Message */}
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">
                              {downloadStatus.message}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Supported Platforms */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4">
                    {["YouTube", "TikTok", "Instagram", "Twitter", "Facebook", "Reddit", "Vimeo", "Dailymotion"].map((platform) => (
                      <div
                        key={platform}
                        className="px-3 py-2 bg-muted/50 rounded-lg text-center text-sm font-medium"
                      >
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Video Loaded State */
                <div className="space-y-6">
                  {/* Video Preview (Replaces URL Input) */}
                  <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
                    {metadata.thumbnail ? (
                      <img
                        src={metadata.thumbnail}
                        alt={metadata.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Video Info */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{metadata.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{metadata.uploader}</span>
                      <span>•</span>
                      <span>{formatDuration(metadata.duration)}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                        {metadata.platform}
                      </span>
                    </div>
                  </div>

                  {/* Download Type Toggle */}
                  <div className="flex gap-2 justify-center pt-2">
                    <Button
                      variant={downloadType === "video" ? "default" : "outline"}
                      onClick={() => {
                        setDownloadType("video");
                        setSelectedFormat(videoFormats[0] || null);
                      }}
                      className="gap-2"
                    >
                      <Video className="w-4 h-4" />
                      Video
                    </Button>
                    <Button
                      variant={downloadType === "audio" ? "default" : "outline"}
                      onClick={() => {
                        setDownloadType("audio");
                        setSelectedFormat(audioFormats[0] || null);
                      }}
                      className="gap-2"
                    >
                      <Music className="w-4 h-4" />
                      Audio Only
                    </Button>
                  </div>

                  {/* Quality Options */}
                  {currentFormats.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Select Quality
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {currentFormats.map((format) => (
                          <button
                            key={format.format_id}
                            onClick={() => setSelectedFormat(format)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              selectedFormat?.format_id === format.format_id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-semibold">{format.quality}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format.ext.toUpperCase()}
                              {format.filesize && ` • ${formatFileSize(format.filesize)}`}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleDownload}
                      disabled={!selectedFormat || downloading}
                      className="flex-1"
                      size="lg"
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Download {selectedFormat?.quality}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={resetDownload}
                      variant="outline"
                      disabled={downloading}
                      size="lg"
                    >
                      New Download
                    </Button>
                  </div>

                  {/* Legal Notice */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ <strong>Legal Notice:</strong> Only download videos you have permission to download. 
                      Respect copyright laws and terms of service of the platform.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}