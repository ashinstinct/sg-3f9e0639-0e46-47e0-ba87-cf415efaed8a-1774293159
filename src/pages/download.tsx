import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Video, Music, AlertCircle } from "lucide-react";

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

  const handleFetchFormats = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setLoading(true);
    setError("");
    setMetadata(null);
    setVideoFormats([]);
    setAudioFormats([]);
    setSelectedFormat(null);

    try {
      const response = await fetch("/api/download/formats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch video information");
      }

      setMetadata(data.metadata);
      setVideoFormats(data.video_formats || []);
      setAudioFormats(data.audio_formats || []);

      // Auto-select best quality
      if (downloadType === "video" && data.video_formats?.length > 0) {
        setSelectedFormat(data.video_formats[0]);
      } else if (downloadType === "audio" && data.audio_formats?.length > 0) {
        setSelectedFormat(data.audio_formats[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedFormat || !url) {
      setError("Please select a quality option");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      const response = await fetch("/api/download/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          formatId: selectedFormat.format_id,
          isAudioOnly: downloadType === "audio",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to download");
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${metadata?.title || "download"}.${selectedFormat.ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed");
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
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Video Downloader
            </h1>
            <p className="text-lg text-muted-foreground">
              Download videos from YouTube, TikTok, Instagram, Twitter, and 1000+ sites
            </p>
          </div>

          <div className="bg-card border rounded-xl p-8 shadow-lg">
            {!metadata ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Video URL
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleFetchFormats()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleFetchFormats}
                      disabled={loading || !url.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Fetch Video"
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Supported platforms:</strong> YouTube, TikTok, Instagram, Twitter, Facebook, Reddit, Vimeo, Dailymotion, and 1000+ more sites.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="flex gap-4">
                  {metadata.thumbnail && (
                    <img
                      src={metadata.thumbnail}
                      alt={metadata.title}
                      className="w-40 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{metadata.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {metadata.uploader} • {formatDuration(metadata.duration)}
                    </p>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                        {metadata.platform}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Type Tabs */}
                <div className="flex gap-2 border-b">
                  <button
                    onClick={() => {
                      setDownloadType("video");
                      setSelectedFormat(videoFormats[0] || null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                      downloadType === "video"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Video (MP4)
                  </button>
                  <button
                    onClick={() => {
                      setDownloadType("audio");
                      setSelectedFormat(audioFormats[0] || null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                      downloadType === "audio"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    Audio (MP3)
                  </button>
                </div>

                {/* Quality Options */}
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
          </div>
        </div>
      </div>
    </>
  );
}