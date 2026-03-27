import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, Video, Music, Share2, Play, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface DownloadResult {
  url: string;
  filename: string;
  quality: string;
  filesize?: string;
  thumbnail?: string;
}

type VideoQuality = "max" | "2160" | "1440" | "1080" | "720" | "480" | "360";
type AudioBitrate = "320" | "256" | "128" | "96" | "64";

type DownloadStatus = 
  | { stage: "idle" }
  | { stage: "validating"; message: "Validating URL..." }
  | { stage: "fetching"; message: "Connecting to platform..." }
  | { stage: "processing"; message: "Processing video..." }
  | { stage: "ready"; message: "Ready to download!" }
  | { stage: "error"; message: string };

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080");
  const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>("128");
  const [showPreview, setShowPreview] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>({ stage: "idle" });
  const { toast } = useToast();

  const supportedPlatforms = [
    "YouTube", "TikTok", "Instagram", "Twitter/X", "Facebook",
    "Reddit", "Vimeo", "Twitch", "SoundCloud", "Dailymotion"
  ];

  const qualityOptions: { value: VideoQuality; label: string; size: string }[] = [
    { value: "max", label: "Best Available", size: "Varies" },
    { value: "2160", label: "4K (2160p)", size: "~800-1200 MB/min" },
    { value: "1440", label: "2K (1440p)", size: "~400-600 MB/min" },
    { value: "1080", label: "Full HD (1080p)", size: "~200-300 MB/min" },
    { value: "720", label: "HD (720p)", size: "~100-150 MB/min" },
    { value: "480", label: "SD (480p)", size: "~50-70 MB/min" },
    { value: "360", label: "Low (360p)", size: "~30-40 MB/min" },
  ];

  const audioBitrateOptions: { value: AudioBitrate; label: string; size: string }[] = [
    { value: "320", label: "320 kbps (Best)", size: "~2.4 MB/min" },
    { value: "256", label: "256 kbps (High)", size: "~1.9 MB/min" },
    { value: "128", label: "128 kbps (Standard)", size: "~1 MB/min" },
    { value: "96", label: "96 kbps (Good)", size: "~0.7 MB/min" },
    { value: "64", label: "64 kbps (Low)", size: "~0.5 MB/min" },
  ];

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setShowPreview(false);
    setDownloadStatus({ stage: "validating", message: "Validating URL..." });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDownloadStatus({ stage: "fetching", message: "Connecting to platform..." });
      
      const response = await fetch("/api/download-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl.trim(),
          isAudioOnly: downloadType === "audio",
          videoQuality: videoQuality,
          audioBitrate: downloadType === "audio" ? audioBitrate : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === "error" || data.status === "rate-limit") {
        throw new Error(data.error || data.text || `Failed to process video`);
      }

      setDownloadStatus({ stage: "processing", message: "Processing video..." });
      await new Promise(resolve => setTimeout(resolve, 800));

      setDownloadStatus({ stage: "ready", message: "Ready to download!" });

      if (data.status === "redirect" || data.status === "stream") {
        setResult({
          url: data.url,
          filename: extractFilename(videoUrl),
          quality: videoQuality === "max" ? "Best Available" : `${videoQuality}p`,
          thumbnail: data.thumb,
        });
        setShowPreview(true);
        toast({
          title: "✅ Download ready!",
          description: `${downloadType === "audio" ? "Audio" : "Video"} processed successfully`,
        });
      } else if (data.status === "picker" && data.picker && data.picker.length > 0) {
        const firstPick = data.picker[0];
        setResult({
          url: firstPick.url,
          filename: extractFilename(videoUrl),
          quality: videoQuality === "max" ? "Best Available" : `${videoQuality}p`,
          thumbnail: firstPick.thumb,
        });
        setShowPreview(true);
        toast({
          title: "✅ Download ready!",
          description: `${downloadType === "audio" ? "Audio" : "Video"} processed successfully`,
        });
      } else {
        throw new Error("Unexpected response format from video service");
      }
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to download video. Please check the URL and try again.";
      setError(errorMessage);
      setDownloadStatus({ stage: "error", message: errorMessage });
      toast({
        variant: "destructive",
        title: "Download failed",
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractFilename = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace("www.", "");
      const timestamp = new Date().toISOString().slice(0, 10);
      return `${hostname}-${timestamp}${downloadType === "audio" ? ".mp3" : ".mp4"}`;
    } catch {
      return `download-${Date.now()}${downloadType === "audio" ? ".mp3" : ".mp4"}`;
    }
  };

  const handleDirectDownload = () => {
    if (!result) return;

    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download started!",
      description: "Check your downloads folder",
    });
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = "Check out this free video downloader - download from YouTube, TikTok, Instagram & more!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Back2Life.Studio - Video Downloader",
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully!",
          description: "Thanks for spreading the word",
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Share this tool with your friends",
    });
  };

  const handleNewDownload = () => {
    setVideoUrl("");
    setResult(null);
    setError("");
    setShowPreview(false);
    setDownloadStatus({ stage: "idle" });
  };

  return (
    <>
      <SEO
        title="Video Downloader - Back2Life.Studio"
        description="Download videos from YouTube, TikTok, Instagram, and 50+ platforms. Fast, free, and no watermarks."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl text-white mb-3">
                Video Downloader
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
                Download videos from YouTube, TikTok, Instagram, and 50+ platforms. 
                High quality, fast, and no watermarks.
              </p>
              <Button onClick={handleShare} variant="outline" size="sm" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share This Tool
              </Button>
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {/* URL Input Section (when no result) */}
              {!result && (
                <Card className="backdrop-blur-sm bg-card/50 border-primary/20">
                  <CardContent className="pt-8 pb-8">
                    <div className="space-y-6">
                      {/* Download Type Toggle */}
                      <div className="flex gap-2 p-1 bg-muted rounded-lg max-w-md mx-auto">
                        <Button
                          variant={downloadType === "video" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => setDownloadType("video")}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video
                        </Button>
                        <Button
                          variant={downloadType === "audio" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => setDownloadType("audio")}
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Audio Only
                        </Button>
                      </div>

                      {/* Large URL Input */}
                      <div className="space-y-3">
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                          <Input
                            type="url"
                            placeholder="Paste video URL here (YouTube, TikTok, Instagram, etc.)"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                            className="pl-12 pr-4 h-14 text-lg"
                            disabled={loading}
                          />
                        </div>
                        <Button
                          onClick={handleDownload}
                          disabled={loading || !videoUrl.trim()}
                          size="lg"
                          className="w-full h-12 text-base"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              Download {downloadType === "video" ? "Video" : "Audio"}
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Supported Platforms */}
                      <div className="pt-4 border-t text-center">
                        <p className="text-sm text-muted-foreground mb-3">Supports 50+ platforms including:</p>
                        <div className="flex flex-wrap justify-center gap-2">
                          {supportedPlatforms.map((platform) => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                          <Badge variant="outline" className="text-xs">
                            +40 more...
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Real-Time Status Display */}
              {downloadStatus.stage !== "idle" && downloadStatus.stage !== "error" && !result && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 pb-6">
                    <div className="space-y-4">
                      {/* Progress Steps */}
                      <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {/* Step 1: Validating */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            downloadStatus.stage === "validating" 
                              ? "bg-primary animate-pulse" 
                              : ["fetching", "processing", "ready"].includes(downloadStatus.stage)
                              ? "bg-green-500" 
                              : "bg-muted"
                          }`}>
                            {["fetching", "processing", "ready"].includes(downloadStatus.stage) ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            )}
                          </div>
                          <span className="text-sm mt-2 text-muted-foreground font-medium">Validating</span>
                        </div>

                        {/* Connector Line */}
                        <div className={`flex-1 h-1 mx-3 transition-all ${
                          ["fetching", "processing", "ready"].includes(downloadStatus.stage)
                            ? "bg-green-500"
                            : "bg-muted"
                        }`} />

                        {/* Step 2: Fetching */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            downloadStatus.stage === "fetching" 
                              ? "bg-primary animate-pulse" 
                              : ["processing", "ready"].includes(downloadStatus.stage)
                              ? "bg-green-500" 
                              : "bg-muted"
                          }`}>
                            {["processing", "ready"].includes(downloadStatus.stage) ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : downloadStatus.stage === "fetching" ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <LinkIcon className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm mt-2 text-muted-foreground font-medium">Fetching</span>
                        </div>

                        {/* Connector Line */}
                        <div className={`flex-1 h-1 mx-3 transition-all ${
                          ["processing", "ready"].includes(downloadStatus.stage)
                            ? "bg-green-500"
                            : "bg-muted"
                        }`} />

                        {/* Step 3: Processing */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            downloadStatus.stage === "processing" 
                              ? "bg-primary animate-pulse" 
                              : downloadStatus.stage === "ready"
                              ? "bg-green-500" 
                              : "bg-muted"
                          }`}>
                            {downloadStatus.stage === "ready" ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : downloadStatus.stage === "processing" ? (
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            ) : (
                              <Video className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm mt-2 text-muted-foreground font-medium">Processing</span>
                        </div>

                        {/* Connector Line */}
                        <div className={`flex-1 h-1 mx-3 transition-all ${
                          downloadStatus.stage === "ready"
                            ? "bg-green-500"
                            : "bg-muted"
                        }`} />

                        {/* Step 4: Ready */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            downloadStatus.stage === "ready" 
                              ? "bg-green-500" 
                              : "bg-muted"
                          }`}>
                            {downloadStatus.stage === "ready" ? (
                              <CheckCircle2 className="w-6 h-6 text-white" />
                            ) : (
                              <Download className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <span className="text-sm mt-2 text-muted-foreground font-medium">Ready</span>
                        </div>
                      </div>

                      {/* Status Message */}
                      <div className="text-center">
                        <p className="text-base font-semibold text-foreground">
                          {downloadStatus.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Video Preview Section (replaces URL input when ready) */}
              {result && (
                <Card className="backdrop-blur-sm bg-card/50 border-primary/20 overflow-hidden">
                  <CardContent className="p-0">
                    {/* Video/Thumbnail Display */}
                    <div className="relative bg-black">
                      {showPreview && downloadType === "video" ? (
                        <video
                          src={result.url}
                          controls
                          className="w-full aspect-video"
                          controlsList="nodownload"
                        />
                      ) : result.thumbnail ? (
                        <div className="relative aspect-video">
                          <img
                            src={result.thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                          {downloadType === "video" && (
                            <button
                              onClick={() => setShowPreview(true)}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
                            >
                              <div className="w-20 h-20 rounded-full bg-primary/90 group-hover:bg-primary flex items-center justify-center">
                                <Play className="w-10 h-10 text-white ml-1" />
                              </div>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-muted">
                          {downloadType === "video" ? (
                            <Video className="w-16 h-16 text-muted-foreground" />
                          ) : (
                            <Music className="w-16 h-16 text-muted-foreground" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Download Info & Actions */}
                    <div className="p-6 space-y-6">
                      {/* File Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate mb-1">{result.filename}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            {downloadType === "video" ? (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <Video className="w-4 h-4" />
                                  <span>{result.quality}</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-1.5">
                                  <Music className="w-4 h-4" />
                                  <span>{audioBitrate} kbps</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="ml-4">
                          {downloadType === "video" ? "Video" : "Audio"}
                        </Badge>
                      </div>

                      {/* Quality/Bitrate Options */}
                      <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                        {downloadType === "video" ? (
                          <div className="space-y-2">
                            <Label>Video Quality</Label>
                            <Select value={videoQuality} onValueChange={(value) => setVideoQuality(value as VideoQuality)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {qualityOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {option.size}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label>Audio Bitrate</Label>
                            <Select value={audioBitrate} onValueChange={(value) => setAudioBitrate(value as AudioBitrate)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {audioBitrateOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {option.size}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Download Actions */}
                      <div className="flex gap-3 pt-2">
                        <Button onClick={handleDirectDownload} size="lg" className="flex-1 h-12">
                          <Download className="w-5 h-5 mr-2" />
                          Download {downloadType === "video" ? "Video" : "Audio"}
                        </Button>
                        <Button 
                          onClick={() => window.open(result.url, "_blank")} 
                          variant="outline"
                          size="lg"
                          className="h-12"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* New Download Button */}
                      <Button 
                        onClick={handleNewDownload} 
                        variant="outline" 
                        className="w-full"
                      >
                        Download Another Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features Cards */}
              {!result && (
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Video className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Multiple Qualities</h4>
                          <p className="text-xs text-muted-foreground">Download from 360p to 4K resolution</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary/10">
                          <Music className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Audio Extract</h4>
                          <p className="text-xs text-muted-foreground">Extract audio up to 320 kbps</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-accent/10">
                          <CheckCircle2 className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">No Watermarks</h4>
                          <p className="text-xs text-muted-foreground">Clean, professional downloads</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Info Card */}
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Privacy:</strong> Videos are processed through cobalt.tools API. 
                        No data is stored on our servers.
                      </p>
                      <p>
                        <strong className="text-foreground">Legal:</strong> Only download videos you have rights to or that are 
                        available under Creative Commons licenses. Respect copyright laws.
                      </p>
                      <p>
                        <strong className="text-foreground">Limits:</strong> Free tier has rate limits. 
                        For unlimited downloads, consider upgrading to Pro.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}