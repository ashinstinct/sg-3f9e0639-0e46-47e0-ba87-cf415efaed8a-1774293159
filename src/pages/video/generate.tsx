import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Video, Loader2, Wand2, ArrowLeft, Volume2, VolumeX, Upload, Search, Check, Sparkles, Clock } from "lucide-react";
import Link from "next/link";

const VIDEO_MODELS = [
  {
    id: "kling",
    name: "Kling",
    company: "Kuaishou AI",
    icon: "🎬",
    badge: null,
    description: "Perfect motion with advanced video control",
    latestVersion: "kling-3.0",
    versions: [
      { id: "kling-3.0", name: "Kling 3.0", credits: 20, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-2.6", name: "Kling 2.6", credits: 18, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-2.5-pro", name: "Kling 2.5 Pro", credits: 18, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-2.1", name: "Kling 2.1", credits: 16, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-01", name: "Kling 01", credits: 15, duration: 10, hasAudio: true, hasElements: true },
      { id: "kling-omni", name: "Kling Omni", credits: 14, duration: 10, hasAudio: true, hasElements: true },
    ],
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    company: "Luma AI",
    icon: "⚡",
    badge: null,
    description: "Fast, high-quality video generation",
    latestVersion: "luma-1.6",
    versions: [
      { id: "luma-1.6", name: "Dream Machine 1.6", credits: 15, duration: 5, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "runway",
    name: "Runway Gen-3",
    company: "Runway ML",
    icon: "🎥",
    badge: null,
    description: "Professional-grade video generation",
    latestVersion: "runway-gen3-alpha",
    versions: [
      { id: "runway-gen3-alpha", name: "Gen-3 Alpha", credits: 18, duration: 10, hasAudio: false, hasElements: false },
      { id: "runway-gen3-turbo", name: "Gen-3 Turbo", credits: 16, duration: 10, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "minimax",
    name: "MiniMax Hailuo",
    company: "Hailuo AI",
    icon: "✨",
    badge: null,
    description: "High-dynamic, VFX-ready, fastest and most affordable",
    latestVersion: "minimax-02",
    versions: [
      { id: "minimax-02", name: "MiniMax 02", credits: 14, duration: 6, hasAudio: false, hasElements: false },
      { id: "minimax-02-fast", name: "MiniMax 02 Fast", credits: 12, duration: 6, hasAudio: false, hasElements: false },
      { id: "minimax-2.3", name: "MiniMax 2.3", credits: 13, duration: 6, hasAudio: false, hasElements: false },
      { id: "minimax-2.3-fast", name: "MiniMax 2.3 Fast", credits: 11, duration: 6, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "hunyuan",
    name: "Hunyuan Video",
    company: "Tencent",
    icon: "🎬",
    badge: null,
    description: "Advanced scene understanding and realistic motion",
    latestVersion: "hunyuan-1.0",
    versions: [
      { id: "hunyuan-1.0", name: "Hunyuan Video", credits: 16, duration: 8, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "grok",
    name: "Grok Imagine",
    company: "xAI",
    icon: "🌟",
    badge: null,
    description: "Perfect motion with advanced video control",
    latestVersion: "grok-1.0",
    versions: [
      { id: "grok-1.0", name: "Grok Imagine", credits: 22, duration: 15, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "seedance",
    name: "Seedance",
    company: "Bytedance",
    icon: "🎭",
    badge: null,
    description: "Cinematic, multi-shot video creation",
    latestVersion: "seedance-1.5-pro",
    versions: [
      { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", credits: 20, duration: 12, hasAudio: false, hasElements: false },
      { id: "seedance-pro", name: "Seedance Pro", credits: 18, duration: 10, hasAudio: false, hasElements: false },
      { id: "seedance-pro-fast", name: "Seedance Pro Fast", credits: 16, duration: 10, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "sora",
    name: "Sora",
    company: "OpenAI",
    icon: "🎬",
    badge: null,
    description: "Multi-shot video with sound generation",
    latestVersion: "sora-2-pro-max",
    versions: [
      { id: "sora-2-pro-max", name: "Sora 2 Pro Max", credits: 30, duration: 20, hasAudio: true, hasElements: false },
      { id: "sora-2-max", name: "Sora 2 Max", credits: 28, duration: 20, hasAudio: true, hasElements: false },
      { id: "sora-2-pro", name: "Sora 2 Pro", credits: 26, duration: 20, hasAudio: true, hasElements: false },
      { id: "sora-2", name: "Sora 2", credits: 25, duration: 20, hasAudio: true, hasElements: false },
    ],
  },
  {
    id: "veo",
    name: "Veo 3",
    company: "Google",
    icon: "🎨",
    badge: "SOON",
    description: "Precision video with sound control",
    latestVersion: "veo-3.1",
    comingSoon: true,
    versions: [
      { id: "veo-3.1", name: "Veo 3.1", credits: 22, duration: 15, hasAudio: true, hasElements: false },
      { id: "veo-3.1-fast", name: "Veo 3.1 Fast", credits: 20, duration: 15, hasAudio: true, hasElements: false },
      { id: "veo-3", name: "Veo 3", credits: 20, duration: 15, hasAudio: true, hasElements: false },
      { id: "veo-3-fast", name: "Veo 3 Fast", credits: 18, duration: 15, hasAudio: true, hasElements: false },
    ],
  },
  {
    id: "wan",
    name: "Wan 2.2",
    company: "Wan AI",
    icon: "🎬",
    badge: null,
    description: "Camera-controlled video with sound, more freedom",
    latestVersion: "wan-2.2-pro",
    versions: [
      { id: "wan-2.2-pro", name: "Wan 2.2 Pro", credits: 18, duration: 10, hasAudio: false, hasElements: false },
      { id: "wan-2.2", name: "Wan 2.2", credits: 16, duration: 10, hasAudio: false, hasElements: false },
      { id: "wan-2.1", name: "Wan 2.1", credits: 15, duration: 10, hasAudio: false, hasElements: false },
      { id: "wan-2.0", name: "Wan 2.0", credits: 14, duration: 8, hasAudio: false, hasElements: false },
      { id: "wan-1.5", name: "Wan 1.5", credits: 12, duration: 8, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "seedream",
    name: "Seedream 2.0",
    company: "Bytedance",
    icon: "🎭",
    badge: "SOON",
    description: "Next-gen video synthesis with temporal consistency",
    latestVersion: "seedream-2.0",
    comingSoon: true,
    versions: [
      { id: "seedream-2.0", name: "Seedream 2.0", credits: 20, duration: 12, hasAudio: false, hasElements: false },
    ],
  },
];

const ASPECT_RATIOS = [
  { id: "16:9", name: "16:9", value: "16:9" },
  { id: "9:16", name: "9:16", value: "9:16" },
  { id: "1:1", name: "1:1", value: "1:1" },
  { id: "4:3", name: "4:3", value: "4:3" },
  { id: "3:4", name: "3:4", value: "3:4" },
];

const DURATIONS = [
  { id: "5s", name: "5s", value: 5 },
  { id: "8s", name: "8s", value: 8 },
  { id: "10s", name: "10s", value: 10 },
  { id: "12s", name: "12s", value: 12 },
  { id: "15s", name: "15s", value: 15 },
  { id: "20s", name: "20s", value: 20 },
];

export default function VideoGenerate() {
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(selectedModel.versions[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState(10);
  const [batchCount, setBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

  const handleModelChange = (modelId: string) => {
    const model = VIDEO_MODELS.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setSelectedVersion(model.versions[0]);
      setAudioEnabled(false);
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = selectedModel.versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      if (!version.hasAudio) setAudioEnabled(false);
    }
  };

  const filteredModels = VIDEO_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const totalCredits = selectedVersion.credits * batchCount;

  return (
    <>
      <SEO
        title="AI Video Generator - Back2Life.Studio"
        description="Generate stunning videos with the latest AI models"
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="border-2">
            <CardContent className="p-8">
              <Link
                href="/video"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Video
              </Link>

              <div className="mb-6">
                <h1 className="font-heading font-bold text-3xl mb-2">Create Video</h1>
                <p className="text-muted-foreground">
                  Generate high-quality videos using AI models
                </p>
              </div>

              <div className="space-y-6">
                {/* Video Upload Area (for image-to-video) */}
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Choose images to upload <span className="text-muted-foreground/60">(up to 2)</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Optional - for image-to-video generation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your video, like 'A woman walking through a neon-lit city'. Add elements using @"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none text-base"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="enhance"
                        checked={enhancePrompt}
                        onCheckedChange={setEnhancePrompt}
                      />
                      <Label htmlFor="enhance" className="text-sm cursor-pointer">
                        Enhance prompt with AI
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {prompt.length}/2000
                    </span>
                  </div>
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Video className="w-4 h-4" />
                    Model
                  </Label>
                  <Select value={selectedModel.id} onValueChange={handleModelChange}>
                    <SelectTrigger className="h-14">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">{selectedModel.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold flex items-center gap-2">
                            {selectedModel.name}
                            {selectedModel.badge && (
                              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                                {selectedModel.badge}
                              </span>
                            )}
                          </div>
                          {selectedModel.versions.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {selectedVersion.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[500px]">
                      <div className="sticky top-0 bg-background p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      {filteredModels.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="h-auto py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{model.icon}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold flex items-center gap-2 mb-0.5">
                                {model.name}
                                {model.badge && (
                                  <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {model.description}
                              </div>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Version Selector */}
                {selectedModel.versions.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Version</Label>
                    <Select value={selectedVersion.id} onValueChange={handleVersionChange}>
                      <SelectTrigger className="h-12">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{selectedVersion.name}</span>
                          <span className="text-xs text-amber-500">
                            {selectedVersion.credits} credits
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModel.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id} className="h-auto py-2.5">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-medium">{version.name}</span>
                              <span className="text-xs text-amber-500">
                                {version.credits} credits
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Audio Toggle */}
                {selectedVersion.hasAudio && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <Label htmlFor="audio-toggle" className="cursor-pointer">
                        Generate with Audio
                      </Label>
                    </div>
                    <Switch
                      id="audio-toggle"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                    />
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Aspect Ratio */}
                  <Select
                    value={aspectRatio.id}
                    onValueChange={(id) => setAspectRatio(ASPECT_RATIOS.find((r) => r.id === id)!)}
                  >
                    <SelectTrigger className="w-24 h-10 bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.id}>
                          {ratio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Duration */}
                  <Select
                    value={duration.toString()}
                    onValueChange={(val) => setDuration(parseInt(val))}
                  >
                    <SelectTrigger className="w-20 h-10 bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: selectedVersion.duration }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}s
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Batch Count */}
                  <Select
                    value={batchCount.toString()}
                    onValueChange={(val) => setBatchCount(parseInt(val))}
                  >
                    <SelectTrigger className="w-16 h-10 bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Selector */}
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select 
                    value={duration.toString()} 
                    onValueChange={(val) => setDuration(parseInt(val))}
                  >
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{duration}s</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: selectedVersion.duration }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                          {d}s
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate
                      <Sparkles className="w-5 h-5 ml-2" />
                      {totalCredits}
                    </>
                  )}
                </Button>

                {/* Generated Video Preview */}
                {generatedVideo && (
                  <div className="mt-6 rounded-xl overflow-hidden border-2">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}