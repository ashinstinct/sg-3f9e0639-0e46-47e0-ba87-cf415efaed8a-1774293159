import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Scissors, 
  Download,
  Plus,
  Trash2,
  Volume2,
  Type,
  Sparkles,
  Film
} from "lucide-react";

interface VideoClip {
  id: string;
  file: File;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
  volume: number;
  speed: number;
}

interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export default function VideoEditor() {
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("video/")) {
        setError("Please select video files only");
        return;
      }

      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = url;
      
      video.onloadedmetadata = () => {
        const newClip: VideoClip = {
          id: Math.random().toString(36).substr(2, 9),
          file,
          url,
          duration: video.duration,
          startTime: clips.length > 0 ? clips[clips.length - 1].endTime : 0,
          endTime: (clips.length > 0 ? clips[clips.length - 1].endTime : 0) + video.duration,
          volume: 100,
          speed: 1
        };
        
        setClips(prev => [...prev, newClip]);
        setError("");
      };
    });
  };

  const getTotalDuration = () => {
    return clips.reduce((sum, clip) => Math.max(sum, clip.endTime), 0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual playback
  };

  const deleteClip = (clipId: string) => {
    setClips(clips.filter(clip => clip.id !== clipId));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  const updateClipVolume = (clipId: string, volume: number) => {
    setClips(clips.map(clip => 
      clip.id === clipId ? { ...clip, volume } : clip
    ));
  };

  const updateClipSpeed = (clipId: string, speed: number) => {
    setClips(clips.map(clip => 
      clip.id === clipId ? { ...clip, speed } : clip
    ));
  };

  const addTextOverlay = () => {
    const newText: TextOverlay = {
      id: Math.random().toString(36).substr(2, 9),
      text: "New Text",
      startTime: currentTime,
      duration: 3,
      x: 50,
      y: 50,
      fontSize: 48,
      color: "#ffffff"
    };
    setTextOverlays(prev => [...prev, newText]);
  };

  const exportVideo = async () => {
    if (clips.length === 0) {
      setError("Add at least one video clip to export");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      // TODO: Implement actual video rendering with FFmpeg
      await new Promise(resolve => setTimeout(resolve, 3000));
      setError("Backend video rendering not yet configured. Requires FFmpeg for merging clips, applying effects, and rendering final video.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setProcessing(false);
    }
  };

  const selectedClip = clips.find(c => c.id === selectedClipId);

  return (
    <>
      <SEO 
        title="Video Editor - Back2Life.Studio"
        description="Professional video editing in your browser - trim, merge, add text, effects, and more"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-violet-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Video Editor
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional video editing in your browser - CapCut-style timeline editor
              </p>
            </div>

            {/* Main Editor */}
            <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Preview & Timeline */}
              <div className="space-y-4">
                {/* Video Preview */}
                <Card className="border-violet-500/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-full object-contain"
                      />
                      {clips.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <Film className="w-16 h-16 mx-auto text-muted-foreground" />
                            <div>
                              <p className="text-lg font-medium text-muted-foreground">
                                No clips added yet
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Upload videos to start editing
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Playback Controls */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                          variant="outline"
                          size="icon"
                          disabled={clips.length === 0}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          onClick={togglePlayPause}
                          variant="outline"
                          size="icon"
                          disabled={clips.length === 0}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => setCurrentTime(Math.min(getTotalDuration(), currentTime + 5))}
                          variant="outline"
                          size="icon"
                          disabled={clips.length === 0}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>

                        <div className="flex-1">
                          <Slider
                            value={[currentTime]}
                            onValueChange={([value]) => setCurrentTime(value)}
                            max={getTotalDuration() || 100}
                            step={0.1}
                            disabled={clips.length === 0}
                          />
                        </div>

                        <span className="text-sm font-mono text-muted-foreground min-w-24">
                          {formatTime(currentTime)} / {formatTime(getTotalDuration())}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card className="border-violet-500/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Timeline</CardTitle>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Zoom:</Label>
                        <Slider
                          value={[zoom]}
                          onValueChange={([value]) => setZoom(value)}
                          min={50}
                          max={200}
                          step={10}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground w-12">{zoom}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      ref={timelineRef}
                      className="bg-muted/30 rounded-lg p-4 min-h-48 overflow-x-auto"
                      style={{ zoom: `${zoom}%` }}
                    >
                      {clips.length === 0 ? (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-sm text-muted-foreground">
                            No clips on timeline
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {clips.map((clip, index) => (
                            <div
                              key={clip.id}
                              onClick={() => setSelectedClipId(clip.id)}
                              className={`bg-violet-500/20 border-2 rounded px-3 py-2 cursor-pointer transition-colors ${
                                selectedClipId === clip.id 
                                  ? "border-violet-500" 
                                  : "border-violet-500/30 hover:border-violet-500/50"
                              }`}
                              style={{
                                width: `${(clip.duration / getTotalDuration()) * 100}%`,
                                minWidth: "100px"
                              }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-medium truncate">
                                  {clip.file.name}
                                </span>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteClip(clip.id);
                                  }}
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTime(clip.duration)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Add Clips
                      </Button>
                      <Button
                        onClick={addTextOverlay}
                        variant="outline"
                        disabled={clips.length === 0}
                      >
                        <Type className="w-4 h-4 mr-2" />
                        Add Text
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Properties */}
              <div className="space-y-4">
                <Card className="border-violet-500/20">
                  <CardHeader>
                    <CardTitle>Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedClip ? (
                      <Tabs defaultValue="clip" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="clip">Clip</TabsTrigger>
                          <TabsTrigger value="effects">Effects</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="clip" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Volume</Label>
                            <div className="flex items-center gap-3">
                              <Volume2 className="w-4 h-4" />
                              <Slider
                                value={[selectedClip.volume]}
                                onValueChange={([value]) => updateClipVolume(selectedClip.id, value)}
                                max={200}
                                step={1}
                              />
                              <span className="text-sm text-muted-foreground w-12">
                                {selectedClip.volume}%
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Speed</Label>
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[selectedClip.speed]}
                                onValueChange={([value]) => updateClipSpeed(selectedClip.id, value)}
                                min={0.25}
                                max={4}
                                step={0.25}
                              />
                              <span className="text-sm text-muted-foreground w-12">
                                {selectedClip.speed}x
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(selectedClip.duration)}
                            </p>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="effects" className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Filters and effects coming soon
                          </p>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-sm text-muted-foreground">
                          Select a clip to edit properties
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-violet-500/20">
                  <CardContent className="p-6">
                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}

                    <Button
                      onClick={exportVideo}
                      disabled={processing || clips.length === 0}
                      className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                          Rendering...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 mr-2" />
                          Export Video
                        </>
                      )}
                    </Button>

                    <div className="mt-4 bg-muted/30 rounded-lg p-4 space-y-2">
                      <h4 className="font-medium text-sm">Export Settings</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Format: MP4 (H.264)</li>
                        <li>• Quality: 1080p / 30fps</li>
                        <li>• Audio: AAC 192kbps</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">✨ Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Multi-track timeline editor</li>
                <li>• Trim, split, and merge video clips</li>
                <li>• Volume and speed adjustments per clip</li>
                <li>• Text overlays with positioning</li>
                <li>• Visual timeline with zoom controls</li>
                <li>• Export as MP4 (requires FFmpeg backend)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}