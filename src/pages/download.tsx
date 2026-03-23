import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Link as LinkIcon, Loader2, Video, Music, AlertCircle } from "lucide-react";

type VideoQuality = "max" | "1080" | "720" | "480" | "360";
type DownloadType = "video" | "audio";

interface VideoInfo {
  title?: string;
  thumbnail?: string;
  duration?: number;
}

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState<VideoQuality>("720");
  const [downloadType, setDownloadType] = useState<DownloadType>("video");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      setError("Please enter a video URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setVideoInfo(null);

    try {
      const response = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          videoQuality: quality,
          filenameStyle: "pretty",
          downloadMode: downloadType === "audio" ? "audio" : "auto",
        }),
      });

      const data = await response.json();

      if (data.status === "error" || data.error) {
        setError(data.text || "Failed to download video. Please check the URL and try again.");
        setIsLoading(false);
        return;
      }

      if (data.status === "redirect" || data.url) {
        // Direct download
        const downloadUrl = data.url;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (data.status === "picker" && data.picker) {
        // Multiple quality options available
        const downloadUrl = data.picker[0].url;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Set video info if available
      if (data.filename || data.text) {
        setVideoInfo({
          title: data.filename || data.text || "Video",
        });
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to connect to download service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleDownload();
    }
  };

  const getSupportedPlatforms = () => [
    "YouTube", "Instagram", "TikTok", "Twitter/X", "Reddit", 
    "Facebook", "Vimeo", "SoundCloud", "Streamable", "Twitch Clips"
  ];

  return (
    <>
      <SEO
        title="Video Downloader - Back2Life.Studio"
        description="Download videos from YouTube, Instagram, TikTok, Twitter and more. Free, fast, and no watermarks."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Video Downloader</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Download videos from YouTube, Instagram, TikTok, Twitter and more. No watermarks, no limits.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Download Video</CardTitle>
                <CardDescription>
                  Paste a video URL and choose your preferred quality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Download Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Download Type</label>
                    <Select
                      value={downloadType}
                      onValueChange={(value) => setDownloadType(value as DownloadType)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video + Audio
                          </div>
                        </SelectItem>
                        <SelectItem value="audio">
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            Audio Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Quality</label>
                    <Select
                      value={quality}
                      onValueChange={(value) => setQuality(value as VideoQuality)}
                      disabled={isLoading || downloadType === "audio"}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="max">Max Quality</SelectItem>
                        <SelectItem value="1080">1080p (Full HD)</SelectItem>
                        <SelectItem value="720">720p (HD)</SelectItem>
                        <SelectItem value="480">480p (SD)</SelectItem>
                        <SelectItem value="360">360p</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={handleDownload}
                  disabled={isLoading || !url.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90 h-14 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Video
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">Error</p>
                      <p className="text-sm text-destructive/80 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Video Info */}
                {videoInfo && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm font-medium text-green-600">Download Started!</p>
                    {videoInfo.title && (
                      <p className="text-sm text-muted-foreground mt-1">{videoInfo.title}</p>
                    )}
                  </div>
                )}

                {/* Supported Platforms */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Supported Platforms:</p>
                  <div className="flex flex-wrap gap-2">
                    {getSupportedPlatforms().map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Usage Tips */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Works with most video sharing platforms</li>
                    <li>No watermarks or branding added</li>
                    <li>Audio-only mode extracts MP3 from videos</li>
                    <li>Higher quality = larger file size</li>
                    <li>Some platforms may have rate limits</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}