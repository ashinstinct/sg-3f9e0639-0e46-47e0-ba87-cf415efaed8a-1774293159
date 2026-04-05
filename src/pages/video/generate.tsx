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
import { Sparkles, ArrowLeft, Wand2, Image as ImageIcon, Search, Check, Clock, Volume2, X, Info, Maximize2, Monitor, Download, Share2, Twitter, Facebook, MessageCircle, Link2, CheckCircle, Video } from "lucide-react";
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
    name: "Veo",
    company: "Google",
    icon: Video,
    badge: null,
    models: [
      {
        id: "veo-3.1",
        name: "3.1",
        credits: 22,
        duration: 15,
        hasAudio: true,
        aspectRatios: ["16:9", "9:16", "1:1"],
      },
      {
        id: "veo-3.0",
        name: "3.0",
        credits: 18,
        duration: 10,
        hasAudio: true,
        aspectRatios: ["16:9", "9:16", "1:1"],
      },
    ],
  },
  {
    id: "ltx",
    name: "LTX-2",
    company: "Lightricks",
    icon: Sparkles,
    badge: "MULTIMODAL",
    models: [
      {
        id: "ltx-2-19b",
        name: "19B",
        credits: 16,
        duration: 10,
        hasAudio: true,
        duration: 10,
        hasAudio: true,
        aspectRatios: ["16:9", "9:16", "1:1"],
        supportsImage: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    ],
  },
  {
    id: "seedream",
    name: "Seedream",
    company: "Bytedance",
    icon: Video,
    badge: "SOON",
    models: [
      {
        id: "seedream-2.0",
        name: "2.0",
        credits: 20,
        duration: 12,
        hasAudio: true,
        aspectRatios: ["16:9", "9:16", "1:1"],
      },
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
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleDownload = async () => {
    if (!generatedVideo) return;
    
    try {
      const response = await fetch(generatedVideo);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `back2life-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download video. Please try right-clicking and selecting 'Save video as...'");
    }
  };

  const handleCopyLink = async () => {
    if (!generatedVideo) return;
    
    try {
      await navigator.clipboard.writeText(generatedVideo);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy link");
    }
  };

  const handleShare = (platform: string) => {
    if (!generatedVideo) return;
    
    const text = `Check out this AI-generated video I created with Back2Life.Studio!`;
    const url = encodeURIComponent(generatedVideo);
    const encodedText = encodeURIComponent(text);
    
    let shareUrl = "";
    
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${url}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodedText}%20${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400");
    }
  };

  const handleGenerate = async () => {
    if (!prompt && !startFrame && !elementImage) {
      alert("Please enter a prompt or upload an image");
      return;
    }

    setIsGenerating(true);
    setGeneratedVideo(null);

    try {
      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedVersion.id,
          prompt,
          duration,
          aspectRatio: aspectRatio.id,
          audioEnabled,
          startImage: startFrame,
          endImage: endFrame,
          elementImage,
          resolution,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      if (data.success && data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
      } else {
        throw new Error("No video URL in response");
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      alert(error.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
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
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-[1800px]">
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

                {/* Prompt Box */}
                <div className="space-y-3">
                  <Textarea
                    placeholder={`Describe your video idea...\n\nExample: "A futuristic cityscape at sunset with flying cars"`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] bg-muted/50 border-muted-foreground/20 resize-none"
                  />

                  {/* Multi-shot toggle */}
                  {selectedVersion.id.startsWith("sora") && (
                    <div className="flex items-center gap-2 text-sm">
                      <Switch checked={multiShot} onCheckedChange={setMultiShot} />
                      <span className="text-muted-foreground">Multi-shot mode</span>
                    </div>
                  )}
                </div>

                {/* Model Selector - Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedModel.icon}</span>
                      <div className="text-left">
                        <div className="font-semibold">{selectedModel.name}</div>
                        <div className="text-xs text-muted-foreground">{selectedVersion.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedModel.badge && (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {selectedModel.badge}
                        </span>
                      )}
                      <span className="text-muted-foreground">▼</span>
                    </div>
                  </button>

                  {isModelDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-lg shadow-2xl z-50 max-h-[60vh] overflow-y-auto">
                      {/* Search */}
                      <div className="p-3 border-b border-border sticky top-0 bg-background">
                        <input
                          type="text"
                          placeholder="Search models..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-3 py-2 bg-muted rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      {/* Models List */}
                      <div className="p-2">
                        {filteredModels.map((model) => (
                          <div key={model.id} className="mb-3">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                              <span className="text-lg">{model.icon}</span>
                              {model.name}
                              {model.badge && (
                                <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                  {model.badge}
                                </span>
                              )}
                            </div>
                            {model.versions.map((version) => (
                              <button
                                key={version.id}
                                onClick={() => handleModelVersionSelect(model, version)}
                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                  selectedVersion.id === version.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">{version.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      {version.credits}c
                                    </span>
                                    <span className="text-xs text-muted-foreground">{version.duration}s max</span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Toggle - Only show for models with audio support */}
                {selectedVersion.hasAudio && (
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-medium">Audio</div>
                        <div className="text-xs text-muted-foreground">Generate video with sound</div>
                      </div>
                    </div>
                    <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                  </div>
                )}

                {/* Compact Controls */}
                <div className="flex flex-wrap gap-3">
                  {/* Aspect Ratio */}
                  <Select
                    value={aspectRatio.id}
                    onValueChange={(val) =>
                      setAspectRatio(ASPECT_RATIOS.find((ar) => ar.id === val) || ASPECT_RATIOS[0])
                    }
                  >
                    <SelectTrigger className="w-auto min-w-[120px] h-9 bg-muted/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>{aspectRatio.label}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ar) => (
                        <SelectItem key={ar.id} value={ar.id}>
                          {ar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Resolution */}
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="w-auto min-w-[100px] h-9 bg-muted/50 text-sm">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-3.5 h-3.5" />
                        <span>{resolution}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p</SelectItem>
                      <SelectItem value="1080p">1080p</SelectItem>
                      <SelectItem value="4K">4K</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Batch Count */}
                  <Select
                    value={batchCount.toString()}
                    onValueChange={(val) => setBatchCount(parseInt(val))}
                  >
                    <SelectTrigger className="w-16 h-9 bg-muted/50 text-sm">
                      <span>×{batchCount}</span>
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          ×{count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Duration dropdown for non-slider models */}
                  {!(selectedVersion.id === "kling-3.0" || selectedVersion.id === "kling-omni") && (
                    <Select
                      value={duration.toString()}
                      onValueChange={(val) => setDuration(parseInt(val))}
                    >
                      <SelectTrigger className="w-20 h-9 bg-muted/50 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" />
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
                </div>

                {/* Duration Slider - Compact for Kling 3.0/Omni */}
                {(selectedVersion.id === "kling-3.0" || selectedVersion.id === "kling-omni") && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <Label className="text-sm font-medium">Duration</Label>
                      </div>
                      <span className="text-xl font-bold text-primary">{duration}s</span>
                    </div>
                    <Slider
                      value={[duration]}
                      onValueChange={(vals) => setDuration(vals[0])}
                      min={3}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>3s</span>
                      <span>9s</span>
                      <span>15s</span>
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || (!prompt && !startFrame && !elementImage)}
                  className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-5 h-5" />
                        {totalCredits * batchCount}
                      </span>
                    </>
                  )}
                </button>

              </CardContent>
            </Card>

            {/* Output Preview Area */}
            <div className="sticky top-6">
              <div className="aspect-[9/16] bg-[#121212] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                {generatedVideo ? (
                  <div className="relative w-full h-full flex flex-col">
                    {/* Video Player */}
                    <div className="flex-1 relative">
                      <video 
                        src={generatedVideo} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                        loop 
                        playsInline
                      />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="p-4 space-y-3 bg-[#1a1a1a] border-t border-white/5">
                      {/* Download Button */}
                      <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black rounded-lg font-semibold transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Download Video
                      </button>
                      
                      {/* Share Buttons */}
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center">Share</div>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => handleShare("twitter")}
                            className="flex items-center justify-center p-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 rounded-lg transition-colors group"
                            title="Share on Twitter"
                          >
                            <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                          </button>
                          <button
                            onClick={() => handleShare("facebook")}
                            className="flex items-center justify-center p-3 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 rounded-lg transition-colors group"
                            title="Share on Facebook"
                          >
                            <Facebook className="w-4 h-4 text-[#1877F2]" />
                          </button>
                          <button
                            onClick={() => handleShare("whatsapp")}
                            className="flex items-center justify-center p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-lg transition-colors group"
                            title="Share on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 text-[#25D366]" />
                          </button>
                          <button
                            onClick={handleCopyLink}
                            className="flex items-center justify-center p-3 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group relative"
                            title="Copy Link"
                          >
                            {copySuccess ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <Link2 className="w-4 h-4 text-primary" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center p-6">
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <Sparkles className="w-8 h-8 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-medium">Your video will appear here</p>
                      <p className="text-sm text-muted-foreground/60 mt-2">Adjust settings and click generate</p>
                    </div>
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