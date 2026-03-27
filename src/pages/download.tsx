import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon, Download, Loader2, Video, Music, AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

type VideoFormat = {
  quality: string;
  format: string;
  size: string;
};

type VideoMetadata = {
  title: string;
  thumbnail: string;
  platform: string;
  videoFormats: VideoFormat[];
  audioFormats: VideoFormat[];
};

export default function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [selectedTab, setSelectedTab] = useState<"video" | "audio">("video");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleFetchMetadata = async () => {
    if (!url.trim()) {
      setError("Please enter a video URL");
      return;
    }

    setLoading(true);
    setError("");
    setMetadata(null);
    setSelectedQuality("");

    try {
      const response = await fetch("/api/download/formats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video metadata");
      }

      setMetadata(data);
      
      // Auto-select default quality
      if (selectedTab === "video" && data.videoFormats.length > 0) {
        setSelectedQuality(data.videoFormats[2]?.quality || data.videoFormats[0].quality); // Default to 1080p
      } else if (selectedTab === "audio" && data.audioFormats.length > 0) {
        setSelectedQuality(data.audioFormats[1]?.quality || data.audioFormats[0].quality); // Default to 128k
      }

      toast({
        title: "✅ Video found!",
        description: `Ready to download from ${data.platform}`,
      });
    } catch (err) {
      console.error("Metadata fetch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch video metadata";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata || !selectedQuality) {
      setError("Please select a quality first");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/download/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
          quality: selectedQuality,
          isAudio: selectedTab === "audio",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get download URL");
      }

      // Open download URL in new tab
      window.open(data.downloadUrl, "_blank");

      toast({
        title: "✅ Download started!",
        description: "Check your downloads folder",
      });
    } catch (err) {
      console.error("Download error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to download video";
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

  const handleReset = () => {
    setUrl("");
    setMetadata(null);
    setSelectedQuality("");
    setError("");
  };

  return (
    <>
      <SEO
        title="Video Downloader - Back2Life.Studio"
        description="Download videos from YouTube, TikTok, Instagram, and more. Fast, free, and no watermarks."
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl text-white mb-3">
                Video Downloader
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Download videos from YouTube, TikTok, Instagram, and 50+ platforms. 
                High quality, fast, and no watermarks.
              </p>
            </div>

            {/* URL Input Section */}
            <Card className="backdrop-blur-sm bg-card/50 border-primary/20 mb-6">
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                    <Input
                      type="url"
                      placeholder="Paste video URL here (YouTube, TikTok, Instagram, etc.)"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchMetadata()}
                      className="pl-12 pr-4 h-14 text-lg"
                      disabled={loading || !!metadata}
                    />
                  </div>
                  {!metadata && (
                    <Button
                      onClick={handleFetchMetadata}
                      disabled={loading || !url.trim()}
                      size="lg"
                      className="w-full h-12"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Fetching video info...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Get Video Info
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Video Info & Download Section */}
            {metadata && (
              <div className="space-y-6">
                {/* Video Preview */}
                <Card className="backdrop-blur-sm bg-card/50 border-primary/20 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative bg-black">
                      {metadata.thumbnail ? (
                        <img
                          src={metadata.thumbnail}
                          alt={metadata.title}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="aspect-video flex items-center justify-center bg-muted">
                          <Video className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg mb-2">{metadata.title}</h3>
                          <Badge variant="secondary">{metadata.platform}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Format Selection */}
                <Card className="backdrop-blur-sm bg-card/50 border-primary/20">
                  <CardContent className="pt-6 pb-6">
                    <div className="space-y-6">
                      {/* Video/Audio Tabs */}
                      <div className="flex gap-2 p-1 bg-muted rounded-lg">
                        <Button
                          variant={selectedTab === "video" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => {
                            setSelectedTab("video");
                            setSelectedQuality(metadata.videoFormats[2]?.quality || metadata.videoFormats[0].quality);
                          }}
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Video (MP4)
                        </Button>
                        <Button
                          variant={selectedTab === "audio" ? "default" : "ghost"}
                          className="flex-1"
                          onClick={() => {
                            setSelectedTab("audio");
                            setSelectedQuality(metadata.audioFormats[1]?.quality || metadata.audioFormats[0].quality);
                          }}
                        >
                          <Music className="w-4 h-4 mr-2" />
                          Audio (M4A)
                        </Button>
                      </div>

                      {/* Quality Pills */}
                      <div>
                        <h4 className="text-sm font-medium mb-3">
                          Select Quality:
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {(selectedTab === "video" ? metadata.videoFormats : metadata.audioFormats).map((format) => (
                            <button
                              key={format.quality}
                              onClick={() => setSelectedQuality(format.quality)}
                              className={`p-4 rounded-lg border-2 transition-all text-left ${
                                selectedQuality === format.quality
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="font-semibold mb-1">
                                {selectedTab === "video" ? `${format.quality}p` : `${format.quality}k`}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {format.size}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Download Button */}
                      <div className="flex gap-3 pt-4 border-t">
                        <Button
                          onClick={handleDownload}
                          disabled={downloading || !selectedQuality}
                          size="lg"
                          className="flex-1 h-12"
                        >
                          {downloading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Getting download link...
                            </>
                          ) : (
                            <>
                              <Download className="w-5 h-5 mr-2" />
                              Download {selectedTab === "video" ? "Video" : "Audio"}
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={handleReset}
                          variant="outline"
                          size="lg"
                          className="h-12"
                        >
                          New Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Notice */}
                <Card className="border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>
                          <strong className="text-foreground">Note:</strong> Currently optimized for YouTube. 
                          Other platforms (TikTok, Instagram, Twitter) may have limited support.
                        </p>
                        <p>
                          <strong className="text-foreground">Legal:</strong> Only download videos you have rights to. 
                          Respect copyright laws and platform terms of service.
                        </p>
                      </div>
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