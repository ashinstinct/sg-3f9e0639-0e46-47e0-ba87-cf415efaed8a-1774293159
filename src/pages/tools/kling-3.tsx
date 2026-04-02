import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Video, Upload, Loader2, Play, Pause, Download, ArrowLeft, Sparkles, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

type AspectRatio = "16:9" | "9:16" | "1:1";

const ASPECT_RATIOS: Record<AspectRatio, string> = {
  "16:9": "Landscape",
  "9:16": "Portrait",
  "1:1": "Square",
};

export default function Kling3() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [duration, setDuration] = useState(5);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const CREDITS_COST = 20;
  const MAX_DURATION = 10;

  useEffect(() => {
    const checkCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const credits = await creditsService.getUserCredits(session.user.id);
        if (credits) {
          setUserCredits(credits.free_credits + credits.paid_credits);
        }
      }
    };
    checkCredits();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "start") {
          setStartFrame(reader.result as string);
        } else {
          setEndFrame(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to generate a video",
      });
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, CREDITS_COST);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${CREDITS_COST} credits. Please purchase more.`,
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo("");

    try {
      toast({
        title: "🎬 Generating video...",
        description: "This may take 2-5 minutes",
      });

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: aspectRatio,
          duration,
          start_frame_url: startFrame,
          end_frame_url: endFrame,
          model: "fal-ai/kling-video/v1.5/standard/text-to-video",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      const success = await creditsService.deductCredits(
        session.user.id,
        CREDITS_COST,
        "Kling 3.0 Video Generation"
      );
      if (!success) throw new Error("Failed to deduct credits");

      setGeneratedVideo(data.video_url);
      
      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Video generated!",
        description: `${CREDITS_COST} credits used. ${userCredits ? userCredits - CREDITS_COST : 0} remaining.`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadVideo = () => {
    if (!generatedVideo) return;
    const link = document.createElement("a");
    link.href = generatedVideo;
    link.download = `kling-3-${Date.now()}.mp4`;
    link.click();
  };

  return (
    <>
      <SEO title="Kling 3.0 - AI Video Generator" description="Generate cinematic videos with Kling 3.0" />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <Link href="/video" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to Video Tools
            </Link>

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
                <Video className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Kling AI</span>
              </div>
              
              <h1 className="font-heading font-bold text-4xl mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Kling 3.0
              </h1>
              
              <p className="text-muted-foreground mb-4">
                Latest cinematic quality video generation with advanced camera movements
              </p>

              {userCredits !== null && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{userCredits} credits</span>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Configure your video generation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Start Frame (Optional)</Label>
                      <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                        {startFrame ? (
                          <div className="relative">
                            <img src={startFrame} alt="Start" className="w-full h-20 object-cover rounded" />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => setStartFrame(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label htmlFor="start-frame" className="cursor-pointer flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                            <input
                              id="start-frame"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "start")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">End Frame (Optional)</Label>
                      <div className="relative border-2 border-dashed rounded-lg p-4 hover:border-primary/50 transition-colors">
                        {endFrame ? (
                          <div className="relative">
                            <img src={endFrame} alt="End" className="w-full h-20 object-cover rounded" />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => setEndFrame(null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <label htmlFor="end-frame" className="cursor-pointer flex flex-col items-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-1" />
                            <span className="text-xs text-muted-foreground">Upload</span>
                            <input
                              id="end-frame"
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, "end")}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Video Prompt</Label>
                    <Textarea
                      placeholder="A woman walking through a neon-lit city at night, cinematic camera movement..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[120px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">{prompt.length} characters</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Negative Prompt (Optional)</Label>
                    <Textarea
                      placeholder="blurry, low quality, distorted..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ASPECT_RATIOS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Duration: {duration}s</Label>
                      <input
                        type="range"
                        min="3"
                        max={MAX_DURATION}
                        step="1"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:opacity-90 h-14 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5 mr-2" />
                        Generate ({CREDITS_COST} credits)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Your generated video</CardDescription>
                </CardHeader>
                <CardContent>
                  {!generatedVideo && !isGenerating && (
                    <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No video generated yet</p>
                      </div>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                        <p className="text-sm font-medium">Generating...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 2-5 minutes</p>
                      </div>
                    </div>
                  )}

                  {generatedVideo && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border">
                        <video
                          ref={videoRef}
                          src={generatedVideo}
                          className="w-full h-auto"
                          onEnded={() => setIsPlaying(false)}
                        />
                      </div>
                      
                      <div className="flex gap-4">
                        <Button onClick={togglePlayPause} variant="outline" className="flex-1">
                          {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                          {isPlaying ? "Pause" : "Play"}
                        </Button>
                        <Button onClick={downloadVideo} className="flex-1">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
