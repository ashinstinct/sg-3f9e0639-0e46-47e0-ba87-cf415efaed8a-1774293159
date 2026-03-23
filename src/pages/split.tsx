import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Video, Download, Loader2, Scissors, Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface TimeSegment {
  id: string;
  start: string;
  end: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || "http://localhost:5000";

export default function VideoSplitter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [segments, setSegments] = useState<TimeSegment[]>([
    { id: "1", start: "00:00:00", end: "00:00:30" }
  ]);
  const [isSplitting, setIsSplitting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setDownloadUrl("");
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

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const addSegment = () => {
    const lastSegment = segments[segments.length - 1];
    const lastEndTime = parseTime(lastSegment.end);
    const newStartTime = formatTime(lastEndTime);
    const newEndTime = formatTime(Math.min(lastEndTime + 30, videoDuration));
    
    setSegments([
      ...segments,
      {
        id: Date.now().toString(),
        start: newStartTime,
        end: newEndTime
      }
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter(seg => seg.id !== id));
    }
  };

  const updateSegment = (id: string, field: "start" | "end", value: string) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, [field]: value } : seg
    ));
  };

  const validateSegments = (): boolean => {
    for (const segment of segments) {
      const start = parseTime(segment.start);
      const end = parseTime(segment.end);
      
      if (start >= end) {
        setError("Start time must be before end time for all segments");
        return false;
      }
      
      if (end > videoDuration) {
        setError("End time cannot exceed video duration");
        return false;
      }
    }
    return true;
  };

  const handleSplit = async () => {
    if (!videoFile) {
      setError("Please select a video file first");
      return;
    }

    if (!validateSegments()) {
      return;
    }

    setIsSplitting(true);
    setError("");
    setSuccess("");
    setProgress(10);
    setDownloadUrl("");

    try {
      const formData = new FormData();
      formData.append("file", videoFile);
      formData.append("segments", JSON.stringify(segments.map(seg => ({
        start: seg.start,
        end: seg.end
      }))));

      setProgress(30);

      const response = await fetch(`${BACKEND_URL}/api/split-video`, {
        method: "POST",
        body: formData,
      });

      setProgress(60);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Video splitting failed");
      }

      setProgress(80);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setSuccess(`Successfully split video into ${segments.length} segments!`);
    } catch (err) {
      console.error("Split error:", err);
      setError(err instanceof Error ? err.message : "Failed to split video. Please try again.");
      setProgress(0);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !videoFile) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${videoFile.name.split(".")[0]}_segments.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl("");
    setDownloadUrl("");
    setProgress(0);
    setError("");
    setSuccess("");
    setSegments([{ id: "1", start: "00:00:00", end: "00:00:30" }]);
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

  return (
    <>
      <SEO
        title="Video Splitter - Back2Life.Studio"
        description="Split videos into multiple segments with precise time controls using FFmpeg."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">Video Splitter</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Split videos into multiple segments with precise time controls.
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
              {/* Left Column - Upload & Segments */}
              <div className="lg:col-span-3 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Video</CardTitle>
                    <CardDescription>
                      Choose a video file to split into segments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM, AVI, MOV, MKV (Max 100MB)
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
                          <p className="font-medium truncate">{videoFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(videoFile.size)} • {formatTime(videoDuration)}
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
                        className="w-full rounded-lg"
                      />
                    )}
                  </CardContent>
                </Card>

                {videoFile && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Time Segments</CardTitle>
                          <CardDescription>
                            Define where to split the video (HH:MM:SS format)
                          </CardDescription>
                        </div>
                        <Button onClick={addSegment} size="sm" variant="outline">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Segment
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {segments.map((segment, index) => (
                        <div key={segment.id} className="flex items-end gap-3 p-4 bg-muted/50 rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-xs">Start Time</Label>
                              <Input
                                value={segment.start}
                                onChange={(e) => updateSegment(segment.id, "start", e.target.value)}
                                placeholder="00:00:00"
                                className="font-mono"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">End Time</Label>
                              <Input
                                value={segment.end}
                                onChange={(e) => updateSegment(segment.id, "end", e.target.value)}
                                placeholder="00:00:30"
                                className="font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="whitespace-nowrap">
                              Segment {index + 1}
                            </Badge>
                            {segments.length > 1 && (
                              <Button
                                onClick={() => removeSegment(segment.id)}
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isSplitting && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Splitting video...</span>
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
                          size="lg"
                        >
                          {isSplitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Splitting...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4 mr-2" />
                              Split Video
                            </>
                          )}
                        </Button>

                        {videoFile && !isSplitting && (
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            size="lg"
                          >
                            Reset
                          </Button>
                        )}
                      </div>

                      {downloadUrl && (
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="w-full border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-600"
                          size="lg"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download All Segments (ZIP)
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Info */}
              <div className="lg:col-span-2">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Split Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Segments</span>
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500">
                          {segments.length}
                        </Badge>
                      </div>
                      {videoDuration > 0 && (
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm text-muted-foreground">Duration</span>
                          <Badge variant="outline">{formatTime(videoDuration)}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Supported Formats:</p>
                      <div className="flex flex-wrap gap-2">
                        {["MP4", "WebM", "AVI", "MOV", "MKV"].map((format) => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t space-y-2">
                      <p className="text-sm font-medium">Features:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>Precise time control (HH:MM:SS)</li>
                        <li>Multiple segments support</li>
                        <li>No quality loss</li>
                        <li>Fast processing with FFmpeg</li>
                        <li>ZIP download for convenience</li>
                        <li>Up to 100MB file size</li>
                      </ul>
                    </div>

                    {videoFile && (
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          <strong>Backend:</strong> Flask + FFmpeg processing
                        </p>
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