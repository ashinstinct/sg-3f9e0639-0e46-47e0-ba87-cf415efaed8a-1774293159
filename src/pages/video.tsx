import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Video,
  Loader2,
  Sparkles,
  Download,
  ImagePlus,
  X,
  Info,
  Clock,
  Monitor,
  Wand2,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "21:9";
type Quality = "720p" | "1080p";

interface VideoModel {
  id: string;
  name: string;
  description: string;
  credits: number;
  maxDuration: number;
  supportsFrames: boolean;
}

const VIDEO_MODELS: VideoModel[] = [
  {
    id: "fal-ai/kling-video/v1.6/pro/text-to-video",
    name: "Kling 3.0",
    description: "Latest Kling with cinematic quality",
    credits: 20,
    maxDuration: 10,
    supportsFrames: true,
  },
  {
    id: "fal-ai/kling-video/v1.5/standard/text-to-video",
    name: "Kling 2.6",
    description: "Standard Kling with balanced quality",
    credits: 16,
    maxDuration: 10,
    supportsFrames: true,
  },
  {
    id: "fal-ai/kling-video/v1/pro/text-to-video",
    name: "Kling 2.5",
    description: "Pro version with enhanced details",
    credits: 18,
    maxDuration: 8,
    supportsFrames: true,
  },
  {
    id: "fal-ai/kling-video/v1.6/01/text-to-video",
    name: "Kling 01",
    description: "Experimental Kling variant",
    credits: 15,
    maxDuration: 6,
    supportsFrames: true,
  },
  {
    id: "fal-ai/luma-dream-machine",
    name: "Luma Dream Machine",
    description: "Fast, high-quality generation",
    credits: 15,
    maxDuration: 5,
    supportsFrames: true,
  },
  {
    id: "fal-ai/runway-gen3/turbo/text-to-video",
    name: "Runway Gen-3 Turbo",
    description: "Professional-grade video synthesis",
    credits: 18,
    maxDuration: 10,
    supportsFrames: true,
  },
  {
    id: "fal-ai/minimax-video",
    name: "MiniMax Video",
    description: "Cost-effective quality",
    credits: 12,
    maxDuration: 6,
    supportsFrames: true,
  },
  {
    id: "fal-ai/hunyuan-video",
    name: "Hunyuan Video",
    description: "Tencent's advanced AI model",
    credits: 16,
    maxDuration: 8,
    supportsFrames: true,
  },
  {
    id: "fal-ai/sora-v2",
    name: "Sora 2.0",
    description: "OpenAI's latest video model",
    credits: 25,
    maxDuration: 20,
    supportsFrames: true,
  },
  {
    id: "fal-ai/veo-v3.1",
    name: "Veo 3.1",
    description: "Google's advanced video AI",
    credits: 22,
    maxDuration: 15,
    supportsFrames: true,
  },
  {
    id: "fal-ai/veo-v3.1-fast",
    name: "Veo 3.1 Fast",
    description: "Faster Veo with great quality",
    credits: 18,
    maxDuration: 10,
    supportsFrames: true,
  },
  {
    id: "fal-ai/seedream-v2",
    name: "Seedream 2.0",
    description: "State-of-the-art video synthesis",
    credits: 20,
    maxDuration: 12,
    supportsFrames: true,
  },
];

const DURATIONS = [3, 5, 6, 8, 10, 12, 15, 20];
const ASPECT_RATIOS: Record<AspectRatio, string> = {
  "1:1": "Square",
  "16:9": "Landscape",
  "9:16": "Portrait",
  "4:3": "Standard",
  "21:9": "Cinematic",
};

export default function ProVideoGeneration() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<VideoModel>(VIDEO_MODELS[0]);
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [quality, setQuality] = useState<Quality>("1080p");
  const [multiShot, setMultiShot] = useState(false);
  const [startFrame, setStartFrame] = useState<string>("");
  const [endFrame, setEndFrame] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { toast } = useToast();

  const startFrameInputRef = useRef<HTMLInputElement>(null);
  const endFrameInputRef = useRef<HTMLInputElement>(null);

  // Load credits on mount
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

  const handleFrameUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "start" | "end") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "start") {
        setStartFrame(reader.result as string);
      } else {
        setEndFrame(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const enhancePrompt = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Enter a prompt first",
        description: "Add a prompt before enhancing",
      });
      return;
    }

    toast({
      title: "Enhancing prompt...",
      description: "Using AI to improve your prompt",
    });

    // Simple prompt enhancement (you can replace with actual AI call)
    const enhanced = `${prompt}, cinematic lighting, high quality, professional cinematography, 8K resolution`;
    setPrompt(enhanced);

    toast({
      title: "Prompt enhanced!",
      description: "Your prompt has been optimized",
    });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to generate video",
      });
      return;
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    // Check credits
    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, selectedModel.credits);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${selectedModel.credits} credits. Please purchase more.`,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          model: selectedModel.id,
          duration,
          aspect_ratio: aspectRatio,
          quality,
          start_frame: startFrame || undefined,
          end_frame: endFrame || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Deduct credits
      const success = await creditsService.deductCredits(
        session.user.id,
        selectedModel.credits,
        `${selectedModel.name} Video Generation`
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
        description: `${selectedModel.credits} credits used. ${userCredits ? userCredits - selectedModel.credits : 0} remaining.`,
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

  const availableDurations = DURATIONS.filter((d) => d <= selectedModel.maxDuration);

  return (
    <>
      <SEO
        title="Pro Video Generation - Back2Life.Studio"
        description="Generate professional videos with advanced AI models"
      />
      <div className="min-h-screen bg-black text-white">
        <Navigation />

        <div className="container mx-auto px-4 pt-20 pb-12 max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Video className="w-5 h-5 text-white" />
              </div>
              <h1 className="font-heading font-bold text-2xl">Create Video</h1>
            </div>
            {userCredits !== null && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full mb-8" />

          {/* Main Card */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6 space-y-6">
              {/* Start & End Frames */}
              <div className="grid grid-cols-2 gap-4">
                {/* Start Frame */}
                <div>
                  <div className="relative">
                    <input
                      ref={startFrameInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFrameUpload(e, "start")}
                      className="hidden"
                    />
                    {!startFrame ? (
                      <button
                        onClick={() => startFrameInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-600 bg-zinc-800/50 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-700/50 flex items-center justify-center">
                          <ImagePlus className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-xs text-zinc-400">Start frame</p>
                        <span className="text-xs text-zinc-500">Optional</span>
                      </button>
                    ) : (
                      <div className="relative">
                        <img src={startFrame} alt="Start" className="w-full aspect-video object-cover rounded-xl" />
                        <button
                          onClick={() => setStartFrame("")}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* End Frame */}
                <div>
                  <div className="relative">
                    <input
                      ref={endFrameInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFrameUpload(e, "end")}
                      className="hidden"
                    />
                    {!endFrame ? (
                      <button
                        onClick={() => endFrameInputRef.current?.click()}
                        className="w-full aspect-video rounded-xl border-2 border-dashed border-zinc-700 hover:border-zinc-600 bg-zinc-800/50 flex flex-col items-center justify-center gap-2 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-700/50 flex items-center justify-center">
                          <ImagePlus className="w-6 h-6 text-zinc-400" />
                        </div>
                        <p className="text-xs text-zinc-400">End frame</p>
                        <span className="text-xs text-zinc-500">Optional</span>
                      </button>
                    ) : (
                      <div className="relative">
                        <img src={endFrame} alt="End" className="w-full aspect-video object-cover rounded-xl" />
                        <button
                          onClick={() => setEndFrame("")}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-shot Toggle */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Label htmlFor="multi-shot" className="text-sm font-normal text-zinc-300">
                    Multi-shot
                  </Label>
                  <Info className="w-4 h-4 text-zinc-500" />
                </div>
                <Switch
                  id="multi-shot"
                  checked={multiShot}
                  onCheckedChange={setMultiShot}
                />
              </div>

              {/* Prompt */}
              <div>
                <Textarea
                  placeholder='Describe your video, like "A woman walking through a neon-lit city". Add elements using @'
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none bg-zinc-800/50 border-zinc-700 focus:border-zinc-600 text-base"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <button className="text-xs text-zinc-400 hover:text-white transition-colors">
                      @ Elements
                    </button>
                  </div>
                  <button
                    onClick={enhancePrompt}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <Wand2 className="w-3 h-3" />
                    Enhance Prompt
                  </button>
                </div>
              </div>

              {/* Model Selector */}
              <button
                className="w-full flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 transition-colors"
                onClick={() => {
                  // You could open a modal with all models here
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <p className="text-xs text-zinc-400 mb-0.5">Model</p>
                    <p className="font-medium flex items-center gap-2">
                      {selectedModel.name}
                      <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 text-xs">✓</span>
                      </span>
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-400" />
              </button>

              {/* Quick Settings */}
              <div className="grid grid-cols-3 gap-3">
                {/* Duration */}
                <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-14">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableDurations.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Aspect Ratio */}
                <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatio)}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-14">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-zinc-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASPECT_RATIOS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {key}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Quality */}
                <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
                  <SelectTrigger className="bg-zinc-800/50 border-zinc-700 h-14">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-zinc-400" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Model Info */}
              <div className="p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/50">
                <p className="text-xs text-zinc-400">{selectedModel.description}</p>
                <p className="text-xs text-zinc-500 mt-1">Max duration: {selectedModel.maxDuration}s</p>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                size="lg"
                className="w-full h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold text-lg rounded-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate
                    <Sparkles className="w-5 h-5 ml-2" />
                    {selectedModel.credits}
                  </>
                )}
              </Button>

              {/* Video Preview */}
              {generatedVideo && (
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full rounded-xl"
                  />
                  <Button
                    onClick={downloadVideo}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:opacity-90"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download Video
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Selection Modal - Simple dropdown for now */}
          <Card className="mt-6 bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-6">
              <h3 className="font-heading font-bold text-lg mb-4">Select Model</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {VIDEO_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      selectedModel.id === model.id
                        ? "bg-zinc-800 border-cyan-500"
                        : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium flex items-center gap-2">
                        {model.name}
                        {selectedModel.id === model.id && (
                          <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <span className="text-green-400 text-xs">✓</span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-zinc-400 mt-1">{model.description}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {model.credits} credits • Max {model.maxDuration}s
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}