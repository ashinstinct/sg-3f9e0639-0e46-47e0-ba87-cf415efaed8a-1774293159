import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Video, Download, Loader2, Sparkles, Play, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

type VideoModel = "kling" | "luma" | "runway" | "minimax" | "hunyuan";
type AspectRatio = "16:9" | "9:16" | "1:1";

const VIDEO_MODELS = {
  kling: {
    name: "Kling 3.0",
    description: "Next-gen video synthesis with cinematic quality",
    credits: 20,
    maxDuration: 10,
  },
  luma: {
    name: "Luma Dream Machine",
    description: "Fast, high-quality video generation",
    credits: 15,
    maxDuration: 5,
  },
  runway: {
    name: "Runway Gen-3 Turbo",
    description: "Professional video generation at speed",
    credits: 18,
    maxDuration: 10,
  },
  minimax: {
    name: "MiniMax Video",
    description: "Efficient text-to-video conversion",
    credits: 12,
    maxDuration: 6,
  },
  hunyuan: {
    name: "Hunyuan Video",
    description: "Tencent's advanced video model",
    credits: 16,
    maxDuration: 8,
  },
};

const ASPECT_RATIOS = {
  "16:9": "Landscape (1920×1080)",
  "9:16": "Portrait (1080×1920)",
  "1:1": "Square (1080×1080)",
};

export default function ProVideoTools() {
  const [selectedModel, setSelectedModel] = useState<VideoModel>("kling");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { toast } = useToast();

  const currentModel = VIDEO_MODELS[selectedModel];

  // Check user credits on mount
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to generate a video",
      });
      return;
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro video tools",
      });
      return;
    }

    // Check credits
    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, currentModel.credits);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${currentModel.credits} credits to generate with ${currentModel.name}. Please purchase more credits.`,
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo("");

    try {
      toast({
        title: "🎬 Generating video...",
        description: `This may take 2-5 minutes with ${currentModel.name}`,
      });

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          model: selectedModel,
          duration,
          aspect_ratio: aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Deduct credits
      const success = await creditsService.deductCredits(
        session.user.id,
        currentModel.credits,
        `${currentModel.name} Video Generation`
      );

      if (!success) {
        throw new Error("Failed to deduct credits");
      }

      setGeneratedVideo(data.video_url);
      
      // Update credits display
      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Video generated!",
        description: `${currentModel.credits} credits used. ${userCredits ? userCredits - currentModel.credits : 0} remaining.`,
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

  const downloadVideo = () => {
    if (!generatedVideo) return;
    const link = document.createElement("a");
    link.href = generatedVideo;
    link.download = `back2life-video-${Date.now()}.mp4`;
    link.click();
  };

  return (
    <>
      <SEO
        title="Pro Video Generation - Back2Life.Studio"
        description="Generate cinematic videos with AI models like Kling 3.0, Runway Gen-3, and more"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 mb-4">
              <Video className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Professional Video Generation</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Video Generation
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              Create stunning videos with state-of-the-art AI models
            </p>

            {userCredits !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits} credits available</span>
              </div>
            )}
          </div>

          {/* Generation Interface */}
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
                <CardDescription>
                  Create professional-quality videos with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Tabs value={selectedModel} onValueChange={(v) => setSelectedModel(v as VideoModel)}>
                    <TabsList className="grid grid-cols-3 lg:grid-cols-5">
                      <TabsTrigger value="kling" className="text-xs">Kling 3.0</TabsTrigger>
                      <TabsTrigger value="luma" className="text-xs">Luma</TabsTrigger>
                      <TabsTrigger value="runway" className="text-xs">Runway</TabsTrigger>
                      <TabsTrigger value="minimax" className="text-xs">MiniMax</TabsTrigger>
                      <TabsTrigger value="hunyuan" className="text-xs">Hunyuan</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm font-medium">{currentModel.name}</p>
                    <p className="text-xs text-muted-foreground">{currentModel.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>💎 {currentModel.credits} credits</span>
                      <span>⏱️ Max {currentModel.maxDuration}s</span>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Label>Video Prompt</Label>
                  <Textarea
                    placeholder="A drone shot flying over a futuristic city at sunset, cinematic, 4K..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters
                  </p>
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label>Negative Prompt (Optional)</Label>
                  <Textarea
                    placeholder="blurry, low quality, distorted, jittery..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value) => setAspectRatio(value as AspectRatio)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASPECT_RATIOS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration (seconds)</Label>
                    <Select
                      value={duration.toString()}
                      onValueChange={(value) => setDuration(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: currentModel.maxDuration - 2 }, (_, i) => i + 3).map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d}s
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 hover:opacity-90 h-14 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video ({currentModel.credits} credits)
                    </>
                  )}
                </Button>

                {/* Tips */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Pro Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Be descriptive with camera movements and scenes</li>
                    <li>Include keywords like "cinematic" or "4K"</li>
                    <li>Shorter videos (3-5s) process faster</li>
                    <li>Use negative prompts to avoid unwanted elements</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Video</CardTitle>
                <CardDescription>
                  Your AI-generated cinematic video
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedVideo && !isGenerating && (
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No video generated yet</p>
                      <p className="text-xs mt-1">Enter a prompt and select a model</p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="aspect-video bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                      <p className="text-sm font-medium">Generating your video...</p>
                      <p className="text-xs text-muted-foreground mt-1">This may take 2-5 minutes</p>
                      <p className="text-xs text-muted-foreground mt-2">Model: {currentModel.name}</p>
                    </div>
                  </div>
                )}

                {generatedVideo && (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border">
                      <video
                        src={generatedVideo}
                        controls
                        className="w-full h-auto"
                      />
                    </div>
                    
                    <Button
                      onClick={downloadVideo}
                      size="lg"
                      className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 hover:opacity-90"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Free Alternative */}
          <div className="max-w-6xl mx-auto mt-12">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for free video tools?</h3>
                    <p className="text-sm text-muted-foreground">Check out our free Frame Extractor, Video Splitter, and more</p>
                  </div>
                  <Link href="/free-tools#video">
                    <Button variant="outline">
                      View Free Tools
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}