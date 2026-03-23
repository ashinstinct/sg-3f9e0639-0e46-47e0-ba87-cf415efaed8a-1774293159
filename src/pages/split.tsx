import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Scissors, Download, Loader2, PlayCircle, FileVideo } from "lucide-react";

type SplitMode = "segments" | "duration";

export default function VideoSplitter() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [splitMode, setSplitMode] = useState<SplitMode>("segments");
  const [segmentCount, setSegmentCount] = useState<number>(3);
  const [segmentDuration, setSegmentDuration] = useState<number>(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [segments, setSegments] = useState<Array<{ start: number; end: number; duration: number }>>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setSegments([]);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const calculateSegments = () => {
    if (videoDuration === 0) return;

    const newSegments: Array<{ start: number; end: number; duration: number }> = [];

    if (splitMode === "segments") {
      const segDuration = videoDuration / segmentCount;
      for (let i = 0; i < segmentCount; i++) {
        const start = i * segDuration;
        const end = Math.min((i + 1) * segDuration, videoDuration);
        newSegments.push({
          start,
          end,
          duration: end - start
        });
      }
    } else {
      let currentTime = 0;
      while (currentTime < videoDuration) {
        const end = Math.min(currentTime + segmentDuration, videoDuration);
        newSegments.push({
          start: currentTime,
          end,
          duration: end - currentTime
        });
        currentTime = end;
      }
    }

    setSegments(newSegments);
  };

  const handleSplit = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    
    // This would call your FFmpeg API endpoint
    // For now, we'll show the preview of what segments would be created
    calculateSegments();
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
      alert("Video splitting requires server-side FFmpeg processing. This feature will be implemented when you set up the backend API.");
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
        description="Split videos into multiple segments by count or duration. Perfect for social media content creation."
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
                <h1 className="font-heading font-bold text-4xl">Video Splitter</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Split videos into multiple segments by count or duration. Perfect for social media content.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Column - Upload & Settings */}
              <div className="space-y-6">
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
                        MP4, WebM, MOV (max 500MB)
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
                        <FileVideo className="w-8 h-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{videoFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(videoFile.size)} • {formatTime(videoDuration)}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {videoFile && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Split Settings</CardTitle>
                      <CardDescription>
                        Choose how to split your video
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Tabs value={splitMode} onValueChange={(v) => setSplitMode(v as SplitMode)}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="segments">By Segments</TabsTrigger>
                          <TabsTrigger value="duration">By Duration</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="segments" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Number of Segments</Label>
                            <div className="flex gap-2">
                              {[2, 3, 4, 5].map((count) => (
                                <Button
                                  key={count}
                                  variant={segmentCount === count ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSegmentCount(count)}
                                  className="flex-1"
                                >
                                  {count}
                                </Button>
                              ))}
                            </div>
                            <Input
                              type="number"
                              min="2"
                              max="20"
                              value={segmentCount}
                              onChange={(e) => setSegmentCount(parseInt(e.target.value) || 2)}
                              placeholder="Custom count"
                            />
                            <p className="text-sm text-muted-foreground">
                              Each segment will be ~{formatTime(videoDuration / segmentCount)} long
                            </p>
                          </div>
                        </TabsContent>

                        <TabsContent value="duration" className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Segment Duration (seconds)</Label>
                            <div className="flex gap-2">
                              {[15, 30, 60, 120].map((duration) => (
                                <Button
                                  key={duration}
                                  variant={segmentDuration === duration ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSegmentDuration(duration)}
                                  className="flex-1"
                                >
                                  {duration}s
                                </Button>
                              ))}
                            </div>
                            <Input
                              type="number"
                              min="5"
                              max="600"
                              value={segmentDuration}
                              onChange={(e) => setSegmentDuration(parseInt(e.target.value) || 30)}
                              placeholder="Custom duration"
                            />
                            <p className="text-sm text-muted-foreground">
                              Will create ~{Math.ceil(videoDuration / segmentDuration)} segments
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex gap-3">
                        <Button
                          onClick={calculateSegments}
                          variant="outline"
                          className="flex-1"
                        >
                          Preview Segments
                        </Button>
                        <Button
                          onClick={handleSplit}
                          disabled={isProcessing}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Scissors className="w-4 h-4 mr-2" />
                              Split Video
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Preview & Results */}
              <div className="space-y-6">
                {videoUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Video Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <video
                        ref={videoRef}
                        src={videoUrl}
                        controls
                        onLoadedMetadata={handleVideoLoad}
                        className="w-full rounded-lg"
                      />
                    </CardContent>
                  </Card>
                )}

                {segments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Segment Preview</CardTitle>
                      <CardDescription>
                        {segments.length} segments will be created
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {segments.map((segment, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  Segment {index + 1}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatTime(segment.start)} → {formatTime(segment.end)}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              {formatTime(segment.duration)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!videoFile && (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Scissors className="w-16 h-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        Upload a video to get started
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Info Card */}
            <Card className="mt-6 bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">How it works:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Upload your video file (MP4, WebM, MOV)</li>
                    <li>Choose to split by number of segments or duration</li>
                    <li>Preview the segments before processing</li>
                    <li>Download all segments as a ZIP file</li>
                    <li>Each segment maintains original quality</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">
                    Note: This tool requires FFmpeg backend processing. Contact support to enable this feature.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}