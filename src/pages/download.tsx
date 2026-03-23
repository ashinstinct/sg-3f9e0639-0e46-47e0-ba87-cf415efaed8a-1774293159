import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, Video, Music, Image as ImageIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DownloadResult {
  url: string;
  filename: string;
  quality: string;
  filesize?: string;
  thumbnail?: string;
}

export default function VideoDownloader() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DownloadResult | null>(null);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");

  const supportedPlatforms = [
    "YouTube", "TikTok", "Instagram", "Twitter/X", "Facebook",
    "Reddit", "Vimeo", "Twitch", "SoundCloud", "Dailymotion",
    "Bilibili", "Twitter Spaces", "VK", "OK.ru", "Pinterest"
  ];

  const handleDownload = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a video URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // cobalt.tools API endpoint
      const response = await fetch("https://api.cobalt.tools/api/json", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: videoUrl.trim(),
          isAudioOnly: downloadType === "audio",
          videoQuality: "max", // max, 4320, 2160, 1440, 1080, 720, 480, 360, 240, 144
          filenamePattern: "classic", // classic, pretty, basic, nerdy
          isAudioMuted: false,
          dubLang: false,
          disableMetadata: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === "error" || data.status === "rate-limit") {
        throw new Error(data.text || "Failed to process video");
      }

      if (data.status === "redirect" || data.status === "stream") {
        // Direct download URL
        setResult({
          url: data.url,
          filename: extractFilename(videoUrl),
          quality: "Best Available",
          thumbnail: data.thumb,
        });
      } else if (data.status === "picker") {
        // Multiple quality options (use first one)
        const firstPick = data.picker[0];
        setResult({
          url: firstPick.url,
          filename: extractFilename(videoUrl),
          quality: "Best Available",
          thumbnail: firstPick.thumb,
        });
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError(err instanceof Error ? err.message : "Failed to download video. Please check the URL and try again.");
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

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Free Tool</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Video Downloader
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Download videos from YouTube, TikTok, Instagram, and 50+ platforms. 
                High quality, fast, and no watermarks.
              </p>
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

                {/* URL Input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
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
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-green-500">Ready to download!</span>
                      <Button onClick={handleDirectDownload} size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                      </Button>
                    </AlertDescription>
                  </Alert>
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
                          {result.filesize && (
                            <p className="text-sm text-muted-foreground mb-3">
                              Size: {result.filesize}
                            </p>
                          )}
                          <Button onClick={handleDirectDownload} className="w-full">
                            <Download className="w-4 h-4 mr-2" />
                            Download {downloadType === "audio" ? "Audio" : "Video"}
                          </Button>
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
                      <h4 className="font-semibold text-sm mb-1">Best Quality</h4>
                      <p className="text-xs text-muted-foreground">Up to 4K resolution</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Music className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Audio Extract</h4>
                      <p className="text-xs text-muted-foreground">Download MP3 audio</p>
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
                    <li>Paste URL and click Download</li>
                    <li>Wait for processing (5-30 seconds)</li>
                    <li>Download your file</li>
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