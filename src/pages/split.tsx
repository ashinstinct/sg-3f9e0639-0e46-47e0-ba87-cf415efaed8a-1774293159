import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, Download, Loader2, Scissors, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import JSZip from "jszip";

interface VideoSegment {
  name: string;
  url: string;
  blob: Blob;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000";

export default function VideoSplitter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [segmentLength, setSegmentLength] = useState<string>("30");
  
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      
      // Reset states
      setSegments([]);
      setZipBlob(null);
      setError("");
      setSuccess("");
      setProgress(0);
    } else {
      setError("Please select a valid video file");
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSplit = async () => {
    if (!videoFile) {
      setError("Please select a video file first");
      return;
    }

    setIsSplitting(true);
    setError("");
    setSuccess("");
    setProgress(10);
    setSegments([]);
    setZipBlob(null);

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("segment_length", segmentLength);

      setProgress(30);

      const response = await fetch(`${BACKEND_URL}/api/split-video`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Video splitting failed");
      }

      setProgress(80);

      const blob = await response.blob();
      setZipBlob(blob);
      
      // Extract ZIP to show individual files
      const zip = await JSZip.loadAsync(blob);
      const extractedSegments: VideoSegment[] = [];

      for (const [filename, fileData] of Object.entries(zip.files)) {
        if (!fileData.dir) {
          const fileBlob = await fileData.async("blob");
          const url = URL.createObjectURL(fileBlob);
          extractedSegments.push({ name: filename, url, blob: fileBlob });
        }
      }

      // Sort by filename to maintain order (part000, part001, etc.)
      extractedSegments.sort((a, b) => a.name.localeCompare(b.name));
      
      setSegments(extractedSegments);
      setProgress(100);
      setSuccess(`Successfully split video into ${extractedSegments.length} clips!`);
    } catch (err) {
      console.error("Split error:", err);
      setError(err instanceof Error ? err.message : "Failed to split video. Please try again.");
      setProgress(0);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadZip = () => {
    if (!zipBlob || !videoFile) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${videoFile.name.split(".")[0]}_segments.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSegment = (segment: VideoSegment) => {
    const a = document.createElement("a");
    a.href = segment.url;
    a.download = segment.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl("");
    setZipBlob(null);
    setSegments([]);
    setProgress(0);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

  return (
    <>
      <SEO
        title="Social Video Splitter - Back2Life.Studio"
        description="Split long videos into perfectly sized short clips for TikTok, Instagram Reels, and Facebook Stories."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Social Video Splitter</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Automatically slice long videos into bite-sized clips perfect for Reels, Shorts, and Stories.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 border-green-500/50 bg-green-500/10">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid lg:grid-cols-5 gap-6">
              {/* Left Column - Upload & Settings */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>1. Upload Video</CardTitle>
                    <CardDescription>
                      Upload a video (1 to 10 minutes recommended)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, MOV, WebM (Max 100MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {videoFile && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Video className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{videoFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(videoFile.size)} {videoDuration > 0 && `• ${formatTime(videoDuration)}`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {videoUrl && (
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        onLoadedMetadata={handleVideoLoad}
                        className="w-full rounded-lg bg-black aspect-video object-contain"
                      />
                    )}
                  </CardContent>
                </Card>

                {videoFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>2. Split Settings</CardTitle>
                      <CardDescription>
                        Choose the duration for each clip
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <Label>Clip Duration</Label>
                        <Select value={segmentLength} onValueChange={setSegmentLength}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 Seconds (Quick Stories)</SelectItem>
                            <SelectItem value="30">30 Seconds (FB Stories / Short Reels)</SelectItem>
                            <SelectItem value="60">1 Minute (Standard Reels / Shorts)</SelectItem>
                            <SelectItem value="120">2 Minutes (Long Form)</SelectItem>
                            <SelectItem value="180">3 Minutes (Extended)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isSplitting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Slicing video...</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSplit}
                          disabled={isSplitting || !videoFile}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                        >
                          {isSplitting ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Splitting...</>
                          ) : (
                            <><Scissors className="w-4 h-4 mr-2" /> Split Video</>
                          )}
                        </Button>
                        {!isSplitting && (
                          <Button onClick={handleReset} variant="outline" size="icon">
                            <AlertCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Results */}
              <div className="lg:col-span-3 space-y-6">
                <Card className="min-h-[400px] h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Generated Clips</CardTitle>
                        <CardDescription>
                          {segments.length > 0 
                            ? `Created ${segments.length} clips ready for upload` 
                            : "Your split clips will appear here"}
                        </CardDescription>
                      </div>
                      {segments.length > 0 && zipBlob && (
                        <Button
                          onClick={handleDownloadZip}
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All (ZIP)
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {segments.length === 0 && !isSplitting && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <PlayCircle className="w-12 h-12 mb-4 opacity-50" />
                        <p>Upload a video and click Split to generate clips</p>
                      </div>
                    )}

                    {isSplitting && (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <Loader2 className="w-12 h-12 mb-4 animate-spin text-primary" />
                        <p className="font-medium">Processing your video...</p>
                        <p className="text-sm text-muted-foreground">Slicing perfectly without losing quality</p>
                      </div>
                    )}

                    {segments.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {segments.map((segment, idx) => (
                          <div key={idx} className="bg-muted/30 p-3 rounded-xl border space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="font-mono">
                                Clip {idx + 1}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(segment.blob.size)}
                              </span>
                            </div>
                            
                            <video
                              src={segment.url}
                              controls
                              className="w-full rounded-lg bg-black aspect-video object-contain"
                            />
                            
                            <Button
                              onClick={() => handleDownloadSegment(segment)}
                              variant="secondary"
                              className="w-full"
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Clip
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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