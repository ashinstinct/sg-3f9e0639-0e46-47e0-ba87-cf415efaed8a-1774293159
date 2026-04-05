import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { Sparkles, ArrowLeft, Wand2, Image as ImageIcon, Search, Check, Clock, Volume2, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", icon: "▭" },
  { id: "9:16", label: "9:16", icon: "▯" },
  { id: "1:1", label: "1:1", icon: "□" },
  { id: "4:3", label: "4:3", icon: "▭" },
  { id: "3:4", label: "3:4", icon: "▯" },
];

// Reconfigured to perfectly match API specs per model/version
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
      { id: "kling-3.0", name: "Kling 3.0", credits: 20, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
      { id: "kling-2.6", name: "Kling 2.6", credits: 18, duration: 10, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
      { id: "kling-2.5-pro", name: "Kling 2.5 Pro", credits: 18, duration: 10, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
      { id: "kling-2.1", name: "Kling 2.1", credits: 16, duration: 10, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
      { id: "kling-01", name: "Kling 01", credits: 15, duration: 10, hasAudio: true, hasElements: true, supportsMultipleFrames: true },
      { id: "kling-omni", name: "Kling Omni", credits: 14, duration: 15, hasAudio: true, hasElements: true, supportsMultipleFrames: true },
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
      { id: "luma-1.6", name: "Dream Machine 1.6", credits: 15, duration: 5, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "runway-gen3-alpha", name: "Gen-3 Alpha", credits: 18, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "runway-gen3-turbo", name: "Gen-3 Turbo", credits: 16, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "minimax-02", name: "MiniMax 02", credits: 14, duration: 6, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "minimax-02-fast", name: "MiniMax 02 Fast", credits: 12, duration: 6, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "minimax-2.3", name: "MiniMax 2.3", credits: 13, duration: 6, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "minimax-2.3-fast", name: "MiniMax 2.3 Fast", credits: 11, duration: 6, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "hunyuan-1.0", name: "Hunyuan Video", credits: 16, duration: 8, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "grok-1.0", name: "Grok Imagine", credits: 22, duration: 15, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", credits: 20, duration: 12, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "seedance-pro", name: "Seedance Pro", credits: 18, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "seedance-pro-fast", name: "Seedance Pro Fast", credits: 16, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "sora-2-pro-max", name: "Sora 2 Pro Max", credits: 30, duration: 20, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "sora-2-max", name: "Sora 2 Max", credits: 28, duration: 20, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "sora-2-pro", name: "Sora 2 Pro", credits: 26, duration: 20, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "sora-2", name: "Sora 2", credits: 25, duration: 20, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
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
      { id: "veo-3.1", name: "Veo 3.1", credits: 22, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "veo-3.1-fast", name: "Veo 3.1 Fast", credits: 20, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "veo-3", name: "Veo 3", credits: 20, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "veo-3-fast", name: "Veo 3 Fast", credits: 18, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
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
      { id: "wan-2.2-pro", name: "Wan 2.2 Pro", credits: 18, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "wan-2.2", name: "Wan 2.2", credits: 16, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "wan-2.1", name: "Wan 2.1", credits: 15, duration: 10, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "wan-2.0", name: "Wan 2.0", credits: 14, duration: 8, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
      { id: "wan-1.5", name: "Wan 1.5", credits: 12, duration: 8, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
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
      { id: "seedream-2.0", name: "Seedream 2.0", credits: 20, duration: 12, hasAudio: false, hasElements: false, supportsMultipleFrames: true },
    ],
  },
];

export default function VideoGenerate() {
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(selectedModel.versions[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(selectedModel.versions[0].hasAudio);
  const [multiShot, setMultiShot] = useState(false);
  const [uploadMode, setUploadMode] = useState<"elements" | "frames">("elements");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState(5);
  const [batchCount, setBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);
  const [elementImage, setElementImage] = useState<string | null>(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [resolution, setResolution] = useState("1080p");

  const handleModelChange = (modelId: string) => {
    const model = VIDEO_MODELS.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      const version = model.versions.find((v) => v.id === model.latestVersion) || model.versions[0];
      setSelectedVersion(version);
      setAudioEnabled(version.hasAudio); // Set audio based on model capability
      setDuration(Math.min(duration, version.duration));
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = selectedModel.versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      setAudioEnabled(version.hasAudio); // Update audio when version changes
      setDuration(Math.min(duration, version.duration));
    }
  };

  const handleModelVersionSelect = (model: any, version: any) => {
    setSelectedModel(model);
    setSelectedVersion(version);
    setAudioEnabled(version.hasAudio);
    setDuration(Math.min(duration, version.duration));
    setIsModelDropdownOpen(false);
  };

  const getDurationOptions = (version: any) => {
    if (version.id.startsWith("sora")) return [5, 10, 15, 20].filter(d => d <= version.duration);
    if (version.id.startsWith("seedance")) return [5, 10, 12].filter(d => d <= version.duration);
    if (version.id.startsWith("veo")) return [5, 10, 15].filter(d => d <= version.duration);
    if (version.id.startsWith("kling") && !version.id.includes("3.0") && !version.id.includes("omni")) return [5, 10].filter(d => d <= version.duration);
    return [version.duration];
  };

  const handleGenerate = async () => {
    if (!prompt && !startFrame && !elementImage) return;
    setIsGenerating(true);
    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setGeneratedVideo("https://assets.mixkit.co/videos/preview/mixkit-abstract-gradient-background-with-colors-31622-large.mp4");
    setIsGenerating(false);
  };

  const filteredModels = VIDEO_MODELS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Dynamic Credit Calculation
  const calculateCredits = () => {
    return Math.max(1, Math.round((selectedVersion.credits / selectedVersion.duration) * duration));
  };
  const totalCredits = calculateCredits();

  const UploadBox = ({ label, image, onUpload, onClear, isOptional }: { label: string, image: string | null, onUpload: (url: string) => void, onClear: () => void, isOptional?: boolean }) => (
    <div className="relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center bg-muted/20 hover:bg-muted/40 transition-colors aspect-video cursor-pointer">
      <input 
        type="file" 
        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
        accept="image/*" 
        onChange={(e) => {
          if(e.target.files?.[0]) onUpload(URL.createObjectURL(e.target.files[0]))
        }} 
      />
      {image ? (
        <div className="absolute inset-0 p-1 z-20">
          <img src={image} className="w-full h-full object-cover rounded-lg" alt={label} />
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClear(); }} 
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
          >
            <X className="w-4 h-4"/>
          </button>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {isOptional && <span className="absolute top-2 right-2 text-[10px] text-muted-foreground/60 uppercase font-semibold">Optional</span>}
        </>
      )}
    </div>
  );

  return (
    <>
      <SEO title="AI Video Generator - Back2Life.Studio" description="Professional AI video generation." />
      
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        
        <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/video" className="p-2 hover:bg-muted rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="font-heading font-bold text-2xl">Create Video</h1>
          </div>

          <div className="grid lg:grid-cols-[1fr,400px] gap-6 items-start">
            {/* Main Editor Area */}
            <Card className="border-0 shadow-none bg-transparent">
              <CardContent className="p-0 space-y-6">
                
                {/* Image Upload Area - Dynamic based on model capabilities */}
                {selectedVersion.hasElements ? (
                  // Kling Omni/01 - Elements/Frames tabs
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUploadMode("elements")}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          uploadMode === "elements"
                            ? "bg-muted text-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        Elements
                      </button>
                      <button
                        onClick={() => setUploadMode("frames")}
                        className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                          uploadMode === "frames"
                            ? "bg-muted text-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        Frames
                      </button>
                    </div>

                    {uploadMode === "elements" ? (
                      <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                        <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">Add consistent element</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground mb-1">Start frame</p>
                        </div>
                        <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 relative">
                          <span className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Optional</span>
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground mb-1">End frame</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedVersion.id.startsWith("sora") || selectedVersion.id.startsWith("veo") || !selectedVersion.supportsMultipleFrames ? (
                  // Sora, Veo, and other single-image models - ONE upload only
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mb-1">Choose image to upload</p>
                    <p className="text-xs text-muted-foreground/60">(optional)</p>
                  </div>
                ) : (
                  // Other models - Start/End frames
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mb-1">Start frame</p>
                    </div>
                    <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/20 relative">
                      <span className="absolute top-2 right-2 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Optional</span>
                      <ImageIcon className="w-10 h-10 mx-auto mb-2 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mb-1">End frame</p>
                    </div>
                  </div>
                )}

                {/* Prompt Area */}
                <div className="bg-[#121212] rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-muted-foreground">Multi-shot</Label>
                      <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
                    </div>
                    <Switch checked={multiShot} onCheckedChange={setMultiShot} />
                  </div>
                  
                  <Textarea
                    placeholder='Describe your video, like "A woman walking through a neon-lit city". Add elements using @'
                    className="min-h-[120px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 text-base"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  
                  <div className="p-3 border-t border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex gap-2">
                      <Button
                        variant={enhancePrompt ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 rounded-full text-xs bg-white/5 hover:bg-white/10 border-0"
                        onClick={() => setEnhancePrompt(!enhancePrompt)}
                      >
                        <Wand2 className="w-3 h-3 mr-2 text-indigo-400" />
                        Enhance {enhancePrompt && "On"}
                      </Button>
                      
                      {selectedVersion.hasAudio && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 rounded-full text-xs bg-white/5 hover:bg-white/10 border-0"
                          onClick={() => setAudioEnabled(!audioEnabled)}
                        >
                          <Volume2 className={cn("w-3 h-3 mr-2", audioEnabled ? "text-cyan-400" : "text-muted-foreground")} />
                          {audioEnabled ? "On" : "Off"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Higgsfield Model Selector (Inside the prompt box card) */}
                  <div className="p-3 border-t border-white/5 bg-black/40">
                    <Select open={isModelDropdownOpen} onOpenChange={setIsModelDropdownOpen}>
                      <SelectTrigger className="w-full border-0 bg-transparent hover:bg-white/5 h-auto py-2 px-3 shadow-none focus:ring-0">
                        <div className="flex flex-col items-start text-left w-full">
                          <span className="text-xs text-muted-foreground mb-1">Model</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{selectedVersion.name}</span>
                            <span className="text-xs text-amber-500">⚛</span>
                          </div>
                        </div>
                      </SelectTrigger>
                      
                      <SelectContent className="w-[380px] p-0 border-white/10 bg-[#121212]">
                        <div className="p-3 border-b border-white/10">
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                            <input 
                              type="text"
                              placeholder="Search models..."
                              className="w-full bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-white/20 transition-colors"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-[60vh] overflow-y-auto p-2">
                          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 pt-2">All models</div>
                          {filteredModels.map((model) => (
                            <div key={model.id} className="mb-4">
                              {model.versions.map((version) => (
                                <button
                                  key={version.id}
                                  onClick={() => handleModelVersionSelect(model, version)}
                                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors text-left group relative"
                                >
                                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:bg-white/10 transition-colors">
                                    {model.icon}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="font-semibold text-sm truncate">{version.name}</span>
                                      {model.badge && (
                                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase">
                                          {model.badge}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      {model.description}
                                    </div>
                                  </div>
                                  {selectedVersion.id === version.id && (
                                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Bottom Row Controls */}
                <div className="flex items-center gap-3">
                  {/* Duration */}
                  {(selectedVersion.id === "kling-3.0" || selectedVersion.id === "kling-omni") ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Duration</Label>
                        <span className="text-sm font-medium">{duration}s</span>
                      </div>
                      <Slider
                        value={[duration]}
                        onValueChange={(vals) => setDuration(vals[0])}
                        min={3}
                        max={15}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  ) : (
                    <Select
                      value={duration.toString()}
                      onValueChange={(val) => setDuration(parseInt(val))}
                    >
                      <SelectTrigger className="w-20 h-10 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{duration}s</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {getDurationOptions(selectedVersion).map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d}s
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select value={aspectRatio.id} onValueChange={(val) => setAspectRatio(ASPECT_RATIOS.find(r => r.id === val) || ASPECT_RATIOS[1])}>
                    <SelectTrigger className="flex-1 h-12 bg-[#121212] border-white/5 rounded-xl justify-center font-medium">
                      <span className="mr-2 text-muted-foreground">{aspectRatio.icon}</span>
                      {aspectRatio.label}
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{ratio.icon}</span>
                            {ratio.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="flex-1 h-12 bg-[#121212] border-white/5 rounded-xl justify-center font-medium">
                      <span className="mr-2 text-muted-foreground">❖</span>
                      {resolution}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4k">4K Ultra HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || (!prompt && !startFrame && !elementImage)}
                  className="w-full h-14 text-base font-bold bg-[#E6F85E] hover:bg-[#D4E555] text-black rounded-2xl shadow-none"
                >
                  {isGenerating ? "Generating..." : (
                    <>
                      Generate <Sparkles className="w-4 h-4 mx-1" /> {totalCredits}
                    </>
                  )}
                </Button>

              </CardContent>
            </Card>

            {/* Output Preview Area */}
            <div className="sticky top-6">
              <div className="aspect-[9/16] bg-[#121212] border border-white/5 rounded-2xl flex flex-col items-center justify-center overflow-hidden">
                {generatedVideo ? (
                  <video 
                    src={generatedVideo} 
                    className="w-full h-full object-cover" 
                    controls 
                    autoPlay 
                    loop 
                    muted 
                  />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                      <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground font-medium">Your video will appear here</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">Adjust settings and click generate</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}