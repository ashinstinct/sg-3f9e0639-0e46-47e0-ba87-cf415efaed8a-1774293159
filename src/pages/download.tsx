import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

type VideoQuality = "max" | "2160" | "1440" | "1080" | "720" | "480" | "360" | "240" | "144";
type AudioBitrate = "320" | "192" | "128" | "64";

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("720");
  const [audioBitrate, setAudioBitrate] = useState<AudioBitrate>("192");
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const supportedPlatforms = [
    "YouTube", "TikTok", "Instagram", "Twitter/X", "Facebook",
    "Reddit", "Vimeo", "Twitch", "SoundCloud", "Dailymotion",
    "Bilibili", "Twitter Spaces", "VK", "OK.ru", "Pinterest"
  ];

  const qualityOptions = [
    { value: "2160", label: "4K (2160p)", size: "~800-1200 MB/min" },
    { value: "1440", label: "2K (1440p)", size: "~400-600 MB/min" },
    { value: "1080", label: "Full HD (1080p)", size: "~200-300 MB/min" },
    { value: "720", label: "HD (720p)", size: "~100-150 MB/min" },
    { value: "480", label: "SD (480p)", size: "~50-70 MB/min" },
    { value: "360", label: "Low (360p)", size: "~30-40 MB/min" },
  ];

  const audioBitrateOptions = [
    { value: "320", label: "320 kbps (Best)", size: "~2.4 MB/min" },
    { value: "192", label: "192 kbps (High)", size: "~1.4 MB/min" },
    { value: "128", label: "128 kbps (Standard)", size: "~1 MB/min" },
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

    try {
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "error" || data.status === "rate-limit") {
        throw new Error(data.text || "Failed to process video");
      }

      if (data.status === "redirect" || data.status === "stream") {
        setResult({
          url: data.url,
          filename: extractFilename(videoUrl),
          quality: videoQuality === "max" ? "Best Available" : `${videoQuality}p`,
          thumbnail: data.thumb,
        });
        toast({
          title: "Ready to download!",
          description: `${downloadType === "audio" ? "Audio" : "Video"} processed successfully`,
        });
      } else if (data.status === "picker") {
        const firstPick = data.picker[0];
        setResult({
          url: firstPick.url,
          filename: extractFilename(videoUrl),
          quality: videoQuality === "max" ? "Best Available" : `${videoQuality}p`,
          thumbnail: firstPick.thumb,
        });
        toast({
          title: "Ready to download!",
          description: `${downloadType === "audio" ? "Audio" : "Video"} processed successfully`,
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Failed to download video. Please check the URL and try again.");
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

  return (
    <>
      <SEO
        title="Video Downloader - Back2Life.Studio"
        description="Download videos from YouTube, TikTok, Instagram, and 50+ platforms. Fast, free, and no watermarks."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
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

            {/* Main Card */}
            <Card className="backdrop-blur-sm bg-card/50 border-primary/20">
              <CardHeader>
                <CardTitle>Download Video or Audio</CardTitle>
                <CardDescription>
                  Paste a video URL from any supported platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Download Type Toggle */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
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

                {/* Quality & Bitrate Settings */}
                <div className="grid md:grid-cols-2 gap-4">
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

                {/* URL Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=... or https://tiktok.com/@user/video/..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDownload()}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    disabled={loading || !videoUrl.trim()}
                    size="lg"
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Result */}
                {result && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-green-500">Ready to download!</span>
                      <div className="flex gap-2">
                        {downloadType === "video" && result.url && (
                          <Button 
                            onClick={() => setShowPreview(!showPreview)} 
                            size="sm" 
                            variant="outline"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {showPreview ? "Hide" : "Preview"}
                          </Button>
                        )}
                        <Button onClick={handleDirectDownload} size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download Now
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Video Preview */}
                {result && showPreview && downloadType === "video" && (
                  <Card className="border-primary/20 overflow-hidden">
                    <CardContent className="p-0">
                      <video
                        src={result.url}
                        controls
                        className="w-full h-auto bg-black"
                        controlsList="nodownload"
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Download Result Card */}
                {result && (
                  <Card className="border-primary/20">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {result.thumbnail && (
                          <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            <img
                              src={result.thumbnail}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold truncate">{result.filename}</h3>
                            <Badge variant="secondary">{result.quality}</Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            {downloadType === "video" ? (
                              <>
                                <Video className="w-4 h-4" />
                                <span>Quality: {result.quality}</span>
                              </>
                            ) : (
                              <>
                                <Music className="w-4 h-4" />
                                <span>Bitrate: {audioBitrate} kbps</span>
                              </>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleDirectDownload} className="flex-1">
                              <Download className="w-4 h-4 mr-2" />
                              Download {downloadType === "audio" ? "Audio" : "Video"}
                            </Button>
                            <Button 
                              onClick={() => window.open(result.url, "_blank")} 
                              variant="outline"
                              size="icon"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Supported Platforms */}
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-semibold mb-3">Supported Platforms (50+)</h3>
                  <div className="flex flex-wrap gap-2">
                    {supportedPlatforms.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">
                      +35 more...
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Video className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Multiple Qualities</h4>
                      <p className="text-xs text-muted-foreground">Up to 4K resolution</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Music className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Audio Extract</h4>
                      <p className="text-xs text-muted-foreground">Up to 320 kbps</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">No Watermarks</h4>
                      <p className="text-xs text-muted-foreground">Clean downloads</p>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">How to use:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Copy video URL from any supported platform</li>
                    <li>Choose Video or Audio Only mode</li>
                    <li>Select quality (default 720p) or bitrate (default 192 kbps)</li>
                    <li>Paste URL and click Download</li>
                    <li>Preview video (optional) or download directly</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 border-primary/20">
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
    </>
  );
}