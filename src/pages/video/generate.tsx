import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { hasEnoughCredits, deductCredits } from "@/services/creditsService";
import { saveVideoGeneration } from "@/services/libraryService";
import {
  Video,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Volume2,
  Clock,
  Maximize2,
  Loader2,
  ChevronDown,
  Upload,
  Copy,
  Share2,
  Download,
  ArrowLeft,
  Search,
  Check,
  X,
  Info,
  Monitor,
  Twitter,
  Facebook,
  MessageCircle,
  Link2,
  CheckCircle
} from "lucide-react";
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
    icon: "🎥",
    badge: null,
    description: "Google's advanced video generation AI",
    latestVersion: "veo-3.1",
    versions: [
      { id: "veo-3.1", name: "Veo 3.1", credits: 22, duration: 15, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
      { id: "veo-3.0", name: "Veo 3.0", credits: 18, duration: 10, hasAudio: true, hasElements: false, supportsMultipleFrames: false },
    ],
  },
  {
    id: "ltx",
    name: "LTX-2-19B",
    company: "Lightricks",
    icon: "✨",
    badge: "MULTIMODAL",
    description: "Multimodal video lab: text, image, video, audio inputs",
    latestVersion: "ltx-2-19b",
    versions: [
      { id: "ltx-2-19b", name: "LTX-2-19B", credits: 16, duration: 10, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
    ],
  },
  {
    id: "seedream",
    name: "Seedream",
    company: "Bytedance",
    icon: "🎬",
    badge: "SOON",
    description: "Next-gen video synthesis from Bytedance",
    latestVersion: "seedream-2.0",
    versions: [
      { id: "seedream-2.0", name: "Seedream 2.0", credits: 20, duration: 12, hasAudio: true, hasElements: false, supportsMultipleFrames: true },
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

export default function VideoGeneratePage() {
  const [selectedModel, setSelectedModel] = useState(VIDEO_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(VIDEO_MODELS[0].versions[0]);
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Prompt enhancer states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  // Missing UI states
  const [audioEnabled, setAudioEnabled] = useState(VIDEO_MODELS[0].versions[0].hasAudio);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadMode, setUploadMode] = useState<"elements" | "frames">("elements");
  const [multiShot, setMultiShot] = useState(false);
  const [resolution, setResolution] = useState("1080p");
  const [batchCount, setBatchCount] = useState(1);

  // LTX-2 multimodal inputs
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const [startFramePreview, setStartFramePreview] = useState<string | null>(null);
  const [endFramePreview, setEndFramePreview] = useState<string | null>(null);
  const [singleImagePreview, setSingleImagePreview] = useState<string | null>(null);
  const [elementPreview, setElementPreview] = useState<string | null>(null);

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

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    setOriginalPrompt(prompt);
    
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success && data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        if (!autoEnhance) {
          setPrompt(data.enhancedPrompt);
        }
      }
    } catch (err) {
      console.error("Prompt enhancement failed:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(selectedVersion.credits);
    if (!hasCredits) {
      setError(`Insufficient credits. You need ${selectedVersion.credits} credits to generate with ${selectedModel.name} ${selectedVersion.name}.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    try {
      let finalPrompt = prompt.trim();
      
      // Auto-enhance if enabled
      if (autoEnhance) {
        setIsEnhancing(true);
        try {
          const enhanceResponse = await fetch("/api/enhance-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: finalPrompt }),
          });
          
          const enhanceData = await enhanceResponse.json();
          
          if (enhanceData.success && enhanceData.enhancedPrompt) {
            finalPrompt = enhanceData.enhancedPrompt;
            setEnhancedPrompt(finalPrompt);
          }
        } catch (err) {
          console.error("Auto-enhancement failed, using original prompt:", err);
        } finally {
          setIsEnhancing(false);
        }
      }

      // For LTX-2, convert files to URLs if provided
      let imageUrl: string | undefined;
      let videoUrl: string | undefined;
      let audioUrl: string | undefined;

      if (selectedModel.id === "ltx") {
        if (imageFile) {
          // In production, upload to storage and get URL
          // For now, create object URL (client-side only)
          imageUrl = URL.createObjectURL(imageFile);
        }
        if (videoFile) {
          videoUrl = URL.createObjectURL(videoFile);
        }
        if (audioFile) {
          audioUrl = URL.createObjectURL(audioFile);
        }
      }

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedVersion.id,
          prompt: finalPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          duration,
          aspectRatio: aspectRatio.id,
          imageUrl,
          videoUrl,
          audioUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      if (data.success && data.video) {
        // Deduct credits after successful generation
        const deductResult = await deductCredits(
          selectedVersion.credits,
          `Generated video with ${selectedModel.name} ${selectedVersion.name}`,
          {
            model: selectedModel.id,
            version: selectedVersion.id,
            prompt: finalPrompt,
            videoUrl: data.video.url,
            duration,
            aspectRatio: aspectRatio.id,
          }
        );

        if (!deductResult.success) {
          console.error("Failed to deduct credits:", deductResult.error);
        }

        // Save to library
        await saveVideoGeneration({
          videoUrl: data.video.url,
          prompt: finalPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          versionName: selectedVersion.name,
          duration,
          aspectRatio: aspectRatio.id,
          creditsUsed: selectedVersion.credits,
        });

        setGeneratedVideo(data.video.url);
        
        if (autoEnhance && enhancedPrompt) {
          setPrompt(enhancedPrompt);
        }
      } else {
        throw new Error("No video returned from API");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredModels = VIDEO_MODELS.filter((model) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(searchLower) ||
      model.company.toLowerCase().includes(searchLower) ||
      model.description?.toLowerCase().includes(searchLower)
    );
  });

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
                      <UploadBox 
                        label="Add consistent element" 
                        image={elementPreview} 
                        onUpload={setElementPreview} 
                        onClear={() => setElementPreview(null)} 
                        isOptional 
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <UploadBox 
                          label="Start frame" 
                          image={startFramePreview} 
                          onUpload={setStartFramePreview} 
                          onClear={() => setStartFramePreview(null)} 
                        />
                        <UploadBox 
                          label="End frame" 
                          image={endFramePreview} 
                          onUpload={setEndFramePreview} 
                          onClear={() => setEndFramePreview(null)} 
                          isOptional 
                        />
                      </div>
                    )}
                  </div>
                ) : selectedVersion.id.startsWith("sora") || selectedVersion.id.startsWith("veo") || !selectedVersion.supportsMultipleFrames ? (
                  // Sora, Veo, and other single-image models - ONE upload only
                  <UploadBox 
                    label="Choose image to upload" 
                    image={singleImagePreview} 
                    onUpload={setSingleImagePreview} 
                    onClear={() => setSingleImagePreview(null)} 
                    isOptional 
                  />
                ) : (
                  // Other models - Start/End frames
                  <div className="grid grid-cols-2 gap-4">
                    <UploadBox 
                      label="Start frame" 
                      image={startFramePreview} 
                      onUpload={setStartFramePreview} 
                      onClear={() => setStartFramePreview(null)} 
                    />
                    <UploadBox 
                      label="End frame" 
                      image={endFramePreview} 
                      onUpload={setEndFramePreview} 
                      onClear={() => setEndFramePreview(null)} 
                      isOptional 
                    />
                  </div>
                )}

                {/* Prompt Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5 text-muted-foreground" />
                      <Label className="text-base font-semibold">Prompt</Label>
                    </div>
                  </div>

                  <div className="relative">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the video you want to create..."
                      className="min-h-[140px] resize-none bg-background/50 text-base pb-12"
                      maxLength={500}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={autoEnhance ? "default" : "outline"}
                      onClick={() => setAutoEnhance(!autoEnhance)}
                      disabled={isEnhancing}
                      className="absolute bottom-3 left-3 h-8 w-8 p-0"
                      title={autoEnhance ? "Auto-enhance: ON" : "Auto-enhance: OFF"}
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className={cn("w-4 h-4", autoEnhance && "text-primary-foreground")} />
                      )}
                    </Button>
                  </div>

                  {/* Enhanced Prompt Display */}
                  {enhancedPrompt && enhancedPrompt !== originalPrompt && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                      <div className="flex items-start gap-2">
                        <Wand2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-primary mb-1">Enhanced Prompt:</p>
                          <p className="text-muted-foreground">{enhancedPrompt}</p>
                        </div>
                      </div>
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
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Video ({selectedVersion.credits} credits)
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Generated Video Preview */}
                {generatedVideo && (
                  <div className="mt-6 rounded-xl overflow-hidden border-0">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full"
                      autoPlay
                      loop
                    />
                    <div className="p-4 bg-muted/50 flex gap-2">
                      <Button
                        onClick={() => window.open(generatedVideo, "_blank")}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Open Full Size
                      </Button>
                      <Button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = generatedVideo;
                          a.download = `generated-video-${Date.now()}.mp4`;
                          a.click();
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}

                {/* LTX-2 Multimodal Inputs */}
                {selectedModel?.id === "ltx" && selectedVersion && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Multimodal Inputs (Optional)</span>
                    </div>
                    
                    {/* Image Input */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reference Image</Label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="ltx-image-upload"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="ltx-image-upload"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-sm">{imageFile ? imageFile.name : "Upload Image"}</span>
                        </label>
                        {imageFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImageFile(null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Video Input */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reference Video</Label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          id="ltx-video-upload"
                          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="ltx-video-upload"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm">{videoFile ? videoFile.name : "Upload Video"}</span>
                        </label>
                        {videoFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setVideoFile(null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Audio Input */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Audio Track (Synced)</Label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          id="ltx-audio-upload"
                          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                        />
                        <label
                          htmlFor="ltx-audio-upload"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span className="text-sm">{audioFile ? audioFile.name : "Upload Audio"}</span>
                        </label>
                        {audioFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAudioFile(null)}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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