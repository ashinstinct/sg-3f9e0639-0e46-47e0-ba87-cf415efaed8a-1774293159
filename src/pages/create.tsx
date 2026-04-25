import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Loader2, Crown, Sliders, Layers, Maximize2, Droplet, Check, ArrowLeftRight, Plus, X, Upload, ChevronRight, BarChart3 } from "lucide-react";

const VideoIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="12" rx="2" />
    <path d="M17 10l4-2v8l-4-2z" />
  </svg>
);

const ImageIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 17l6-6 12 12" />
  </svg>
);

const AudioIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="10" x2="5" y2="14" />
    <line x1="9" y1="6" x2="9" y2="18" />
    <line x1="13" y1="4" x2="13" y2="20" />
    <line x1="17" y1="4" x2="17" y2="20" />
    <line x1="21" y1="11" x2="21" y2="13" />
  </svg>
);

const videoModels = [
  { id: "seedance-2", name: "Seedance 2.0", category: "premium", costPerSec: 0.25, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", category: "premium", costPerSec: 0.30, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "kling-3-pro", name: "Kling 3.0 Pro", category: "premium", costPerSec: 0.112, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "kling-3-omni", name: "Kling 3.0 Omni", category: "premium", costPerSec: 0.15, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "minimax-hailuo-2", name: "MiniMax Hailuo 2", category: "premium", costPerSec: 0.18, maxDuration: 6, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "veo-3.1", name: "Veo 3.1", category: "premium", costPerSec: 0.35, maxDuration: 8, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "veo-3", name: "Veo 3", category: "premium", costPerSec: 0.30, maxDuration: 8, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "sora-2-pro", name: "Sora 2 Pro", category: "premium", costPerSec: 0.30, maxDuration: 20, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16", "4:3"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "sora-2-turbo", name: "Sora 2 Turbo", category: "standard", costPerSec: 0.25, maxDuration: 20, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16", "4:3"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "ltx-2", name: "LTX 2", category: "standard", costPerSec: 0.20, maxDuration: 30, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "grok-video", name: "Grok Video", category: "premium", costPerSec: 0.28, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "kling-2.5-turbo", name: "Kling 2.5 Turbo", category: "budget", costPerSec: 0.07, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["480p", "720p", "1080p"], defaultResolution: "720p", supportsReference: true },
  { id: "kling-2.6-pro", name: "Kling 2.6 Pro", category: "standard", costPerSec: 0.10, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["480p", "720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "wan-2.2", name: "Wan 2.2", category: "budget", costPerSec: 0.10, maxDuration: 5, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["480p", "720p"], defaultResolution: "720p", supportsReference: false },
  { id: "wan-2.1", name: "Wan 2.1", category: "budget", costPerSec: 0.08, maxDuration: 5, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["480p", "720p"], defaultResolution: "720p", supportsReference: false },
  { id: "luma-1.6", name: "Luma 1.6", category: "standard", costPerSec: 0.18, maxDuration: 5, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "runway-gen-4", name: "Runway Gen-4", category: "premium", costPerSec: 0.22, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16", "4:3"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "1080p", supportsReference: true },
  { id: "runway-gen-3-turbo", name: "Runway Gen-3 Turbo", category: "standard", costPerSec: 0.14, maxDuration: 10, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "720p", supportsReference: true },
  { id: "minimax-hailuo", name: "MiniMax Hailuo", category: "standard", costPerSec: 0.12, maxDuration: 6, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["720p", "1080p"], defaultResolution: "720p", supportsReference: false },
  { id: "hunyuan-video", name: "Hunyuan Video", category: "standard", costPerSec: 0.10, maxDuration: 5, defaultDuration: "5s", ratios: ["16:9", "1:1", "9:16"], defaultRatio: "16:9", resolutions: ["480p", "720p"], defaultResolution: "720p", supportsReference: false },
];

const imageModels = [
  { id: "nano-banana-2", name: "Nano Banana 2", category: "premium", cost: 0.05, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "gpt-image-2", name: "GPT Image 2", category: "premium", cost: 0.045, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "flux-pro-1.1", name: "FLUX.1 Pro 1.1", category: "premium", cost: 0.06, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "flux-pro", name: "FLUX.1 Pro", category: "premium", cost: 0.055, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "flux-dev", name: "FLUX.1 Dev", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "flux-schnell", name: "FLUX.1 Schnell", category: "budget", cost: 0.003, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "flux-realism", name: "FLUX.1 Realism", category: "standard", cost: 0.03, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "stable-diffusion-3.5-large", name: "SD 3.5 Large", category: "standard", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "stable-diffusion-3.5-medium", name: "SD 3.5 Medium", category: "standard", cost: 0.03, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "stable-diffusion-xl", name: "SD XL", category: "budget", cost: 0.02, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "grok-2-image", name: "Grok 2 Image", category: "premium", cost: 0.05, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "nano-banana-1.5-pro", name: "Nano Banana 1.5 Pro", category: "premium", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "seedream-4.5", name: "Seedream 4.5", category: "premium", cost: 0.05, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "seedream-4.5-turbo", name: "Seedream 4.5 Turbo", category: "premium", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "recraft-v3", name: "Recraft V3", category: "standard", cost: 0.04, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
  { id: "ideogram-3.0", name: "Ideogram 3.0", category: "standard", cost: 0.035, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "ideogram-2.0", name: "Ideogram 2.0", category: "standard", cost: 0.03, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "playground-v2.5", name: "Playground v2.5", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "auraflow", name: "AuraFlow", category: "standard", cost: 0.025, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: false },
  { id: "imagen-4", name: "Imagen 4", category: "premium", cost: 0.045, ratios: ["16:9", "4:3", "1:1", "3:4", "9:16"], defaultRatio: "1:1", defaultResolution: "1024", supportsUpscale: true },
];

const audioModels = [
  { id: "musicgen", name: "MusicGen", category: "standard", cost: 0.02, maxDuration: 30, defaultDuration: 10, supportsPrompt: true },
  { id: "audiocraft", name: "AudioCraft", category: "standard", cost: 0.025, maxDuration: 30, defaultDuration: 10, supportsPrompt: true },
  { id: "stable-audio", name: "Stable Audio", category: "premium", cost: 0.04, maxDuration: 45, defaultDuration: 15, supportsPrompt: true },
  { id: "audiogen", name: "AudioGen", category: "standard", cost: 0.02, maxDuration: 10, defaultDuration: 5, supportsPrompt: true },
];

type ReferenceMode = "text-to-video" | "image-to-video" | "text-to-image" | "image-to-image" | "audio-to-video" | "text-to-audio";

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<"video" | "image" | "audio">("video");
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showReferenceSelector, setShowReferenceSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerations, setShowGenerations] = useState(false);
  const [selectedModel, setSelectedModel] = useState("seedance-2");
  const [referenceMode, setReferenceMode] = useState<ReferenceMode>("text-to-video");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [duration, setDuration] = useState("5s");
  const [generations, setGenerations] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPromptExpand, setShowPromptExpand] = useState(false);
  const [showReferenceUpload, setShowReferenceUpload] = useState(false);
  const [references, setReferences] = useState<Array<{ type: "image" | "video" | "audio"; url: string }>>([]);
  const [result, setResult] = useState<{ type: "video" | "image" | "audio"; url: string } | null>(null);
  const [startFrame, setStartFrame] = useState<string | null>(null);
  const [endFrame, setEndFrame] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const startFrameInputRef = useRef<HTMLInputElement>(null);
  const endFrameInputRef = useRef<HTMLInputElement>(null);

  const getCurrentModels = () => {
    switch (activeTab) {
      case "video": return videoModels;
      case "image": return imageModels;
      case "audio": return audioModels;
      default: return videoModels;
    }
  };

  const getCurrentRatioOptions = () => {
    const model = getCurrentModels().find(m => m.id === selectedModel);
    if (!model) return ["16:9", "1:1", "9:16"];
    if ("ratios" in model) {
      return (model as { ratios: string[] }).ratios;
    }
    return ["16:9", "1:1", "9:16"];
  };

  const getCurrentResolutionOptions = () => {
    const model = getCurrentModels().find(m => m.id === selectedModel);
    if (!model) return ["720p", "1080p"];
    if ("resolutions" in model) {
      return (model as { resolutions: string[] }).resolutions || ["720p", "1080p"];
    }
    return ["720p", "1080p"];
  };

  const getCurrentMaxDuration = () => {
    const model = getCurrentModels().find(m => m.id === selectedModel);
    if (!model) return 5;
    if ("maxDuration" in model) {
      return (model as { maxDuration: number }).maxDuration || 5;
    }
    return 5;
  };

  const getDurationOptions = () => {
    const max = getCurrentMaxDuration();
    const options = [];
    for (let i = 1; i <= max; i++) {
      options.push(`${i}s`);
    }
    return options;
  };

  const getReferenceModes = () => {
    if (activeTab === "video") {
      return [
        { id: "text-to-video", label: "Text to Video" },
        { id: "image-to-video", label: "Image to Video" },
        { id: "audio-to-video", label: "Audio to Video" },
      ];
    }
    if (activeTab === "image") {
      return [
        { id: "text-to-image", label: "Text to Image" },
        { id: "image-to-image", label: "Image to Image" },
      ];
    }
    return [{ id: "text-to-audio", label: "Text to Audio" }];
  };

  const getReferenceModeLabel = () => {
    const mode = getReferenceModes().find(m => m.id === referenceMode);
    return mode?.label || "Text to Video";
  };

  const calculateTotalCost = () => {
    const model = getCurrentModels().find(m => m.id === selectedModel);
    if (!model) return 0;
    let cost = 0;
    if (activeTab === "video") {
      if ("costPerSec" in model) {
        const dur = parseInt(duration);
        cost = (model as { costPerSec: number }).costPerSec * dur;
      }
    } else if (activeTab === "image") {
      if ("cost" in model) {
        cost = (model as { cost: number }).cost;
      }
    } else {
      if ("cost" in model && "maxDuration" in model) {
        const dur = parseInt(duration);
        cost = (model as { cost: number }).cost * dur;
      }
    }
    return Math.round(cost * 100 * generations);
  };

  const switchTab = (tab: "video" | "image" | "audio") => {
    setActiveTab(tab);
    if (tab === "video") {
      setSelectedModel("seedance-2");
      setAspectRatio("16:9");
      setDuration("5s");
      setResolution("1080p");
      setReferenceMode("text-to-video");
    }
    if (tab === "image") {
      setSelectedModel("nano-banana-2");
      setAspectRatio("1:1");
      setReferenceMode("text-to-image");
    }
    if (tab === "audio") {
      setSelectedModel("musicgen");
      setDuration("10s");
      setReferenceMode("text-to-audio");
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    const newModel = getCurrentModels().find(m => m.id === modelId);
    if (newModel) {
      if (activeTab === "video") {
        if ("defaultRatio" in newModel && "defaultDuration" in newModel && "defaultResolution" in newModel) {
          setAspectRatio((newModel as { defaultRatio: string }).defaultRatio);
          setDuration((newModel as { defaultDuration: string }).defaultDuration);
          setResolution((newModel as { defaultResolution: string }).defaultResolution);
        }
      } else if (activeTab === "image") {
        if ("defaultRatio" in newModel) {
          setAspectRatio((newModel as { defaultRatio: string }).defaultRatio);
        }
      } else if (activeTab === "audio") {
        if ("defaultDuration" in newModel) {
          setDuration((newModel as { defaultDuration: number }).defaultDuration.toString() + "s");
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newRefs = Array.from(files).map(file => {
      const url = URL.createObjectURL(file);
      const type: "image" | "video" | "audio" = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "audio";
      return { type, url };
    });
    setReferences(prev => [...prev, ...newRefs].slice(0, 12));
  };

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setStartFrame(url);
    }
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setEndFrame(url);
    }
  };

  const removeReference = (idx: number) => {
    setReferences(prev => prev.filter((_, i) => i !== idx));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const endpoint = activeTab === "video" ? "/api/fal/video-generate" : activeTab === "image" ? "/api/fal/image-generate" : "/api/fal/music-generate";
      const body = {
        model: selectedModel,
        prompt,
        aspectRatio,
        duration: parseInt(duration),
        resolution,
        generations,
        references: references.map(r => r.url),
        referenceMode,
        startFrame,
        endFrame,
      };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.url) {
        setResult({ type: activeTab, url: data.url });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col">
        {activeTab === "video" && (
          <div className="absolute left-4 bottom-[400px] sm:bottom-[420px] z-20 flex items-center gap-3">
            <div className="relative -rotate-6">
              <button onClick={() => startFrameInputRef.current?.click()} className="w-14 h-14 rounded-2xl bg-[#2a2a2a] border border-white/20 flex items-center justify-center hover:bg-[#3a3a3a] transition-all shadow-lg">
                {startFrame ? <img src={startFrame} alt="Start" className="w-full h-full object-cover rounded-2xl" /> : <Plus className="w-6 h-6 text-white/80" />}
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 whitespace-nowrap">Start</span>
              <input ref={startFrameInputRef} type="file" accept="image/*" className="hidden" onChange={handleStartFrameUpload} />
            </div>
            <div className="text-white/40"><ArrowLeftRight className="w-5 h-5" /></div>
            <div className="relative rotate-6">
              <button onClick={() => endFrameInputRef.current?.click()} className="w-14 h-14 rounded-2xl bg-[#2a2a2a] border border-white/20 flex items-center justify-center hover:bg-[#3a3a3a] transition-all shadow-lg">
                {endFrame ? <img src={endFrame} alt="End" className="w-full h-full object-cover rounded-2xl" /> : <Plus className="w-6 h-6 text-white/80" />}
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/50 whitespace-nowrap">End</span>
              <input ref={endFrameInputRef} type="file" accept="image/*" className="hidden" onChange={handleEndFrameUpload} />
            </div>
          </div>
        )}
        <div className="flex-1" />
        <div className="bg-[#1a1a1a] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] mx-0 sm:mx-4 sm:mb-4">
          <div className="flex justify-end p-3 sm:p-4">
            <div className="flex items-center bg-[#2a2a2a] rounded-full p-1 gap-0.5">
              <button onClick={() => switchTab("video")} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all ${activeTab === "video" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-gray-300"}`}>
                <VideoIcon className={`w-4 h-4 ${activeTab === "video" ? "text-white" : "text-gray-400"}`} />
                {activeTab === "video" && <span className="font-medium">Video</span>}
              </button>
              <button onClick={() => switchTab("image")} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all ${activeTab === "image" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-gray-300"}`}>
                <ImageIcon className={`w-4 h-4 ${activeTab === "image" ? "text-white" : "text-gray-400"}`} />
                {activeTab === "image" && <span className="font-medium">Image</span>}
              </button>
              <button onClick={() => switchTab("audio")} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm transition-all ${activeTab === "audio" ? "bg-[#3a3a3a] text-white" : "text-gray-400 hover:text-gray-300"}`}>
                <AudioIcon className={`w-4 h-4 ${activeTab === "audio" ? "text-white" : "text-gray-400"}`} />
                {activeTab === "audio" && <span className="font-medium">Audio</span>}
              </button>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-3">
            <div className="relative">
              <div className="absolute left-3 top-3"><Droplet className="w-5 h-5 text-gray-400" /></div>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Upload images, videos or audio to freely combine characters, scenes, actions and music. e.g. @Image1" className="w-full bg-[#2a2a2a] rounded-2xl pl-10 pr-20 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50" rows={Math.min(prompt.split("\n").length + 2, 5)} />
              <button onClick={() => setShowReferenceUpload(true)} className="absolute right-10 top-2 px-2 py-1 bg-[#3a3a3a] rounded-lg text-xs text-gray-300 flex items-center gap-1 hover:bg-[#4a4a4a]"><Plus className="w-3 h-3" />Refs ({references.length}/12)</button>
              <button onClick={() => setShowPromptExpand(true)} className="absolute right-3 bottom-3 text-gray-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-4 space-y-2">
            <div className="flex items-center justify-between">
              <button onClick={() => setShowModelSelector(true)} className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full px-4 py-2.5 transition-colors">
                <BarChart3 className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white font-medium">{getCurrentModels().find(m => m.id === selectedModel)?.name}</span>
                {getCurrentModels().find(m => m.id === selectedModel)?.category === "premium" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button onClick={() => setShowReferenceSelector(true)} className="flex-shrink-0 flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full px-3 py-2 transition-colors">
                <span className="text-sm text-gray-300">{getReferenceModeLabel()}</span><ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={() => setShowSettings(true)} className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] flex items-center justify-center"><Sliders className="w-4 h-4 text-gray-400" /></button>
              <div className="relative">
                <button onClick={() => setShowGenerations(true)} className="flex-shrink-0 flex items-center gap-1.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-full px-3 py-2 transition-colors">
                  <Layers className="w-4 h-4 text-gray-400" /><span className="text-sm text-white font-medium">{generations}</span>
                </button>
                {showGenerations && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#2a2a2a] rounded-lg shadow-xl p-1 flex gap-1">
                    {[1, 2, 3, 4].map(n => (
                      <button key={n} onClick={() => { setGenerations(n); setShowGenerations(false); }} className={`w-8 h-8 rounded-md text-sm font-medium ${generations === n ? "bg-purple-500 text-white" : "text-gray-400 hover:bg-[#3a3a3a] hover:text-white"}`}>{n}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="flex-shrink-0 ml-auto bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-full px-5 py-2.5 flex items-center gap-2 shadow-lg shadow-purple-500/25">
                {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin text-white" /><span className="text-sm font-semibold text-white">...</span></> : <><Crown className="w-4 h-4 text-white" /><span className="text-sm font-semibold text-white">{calculateTotalCost()}</span></>}
              </button>
            </div>
          </div>
        </div>
        {showModelSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowModelSelector(false)}>
            <div className="bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10"><h3 className="text-lg font-semibold">Select Model</h3><p className="text-sm text-gray-400">Choose a {activeTab} generation model</p></div>
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-2">
                {getCurrentModels().map((m) => {
                  const videoModel = videoModels.find(vm => vm.id === m.id);
                  const imageModel = imageModels.find(im => im.id === m.id);
                  const audioModel = audioModels.find(am => am.id === m.id);
                  
                  return (
                    <button key={m.id} onClick={() => { handleModelChange(m.id); setShowModelSelector(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl ${selectedModel === m.id ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]/50"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center text-xl">{activeTab === "video" && "🎬"}{activeTab === "image" && "🖼️"}{activeTab === "audio" && "🎵"}</div>
                        <div className="text-left">
                          <div className="font-medium text-white">{m.name}</div>
                          <div className="text-xs text-gray-400">
                            {videoModel && `${videoModel.maxDuration}s max · ${videoModel.ratios.join(", ")}`}
                            {imageModel && imageModel.ratios.join(", ")}
                            {audioModel && `${audioModel.maxDuration}s max`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {m.category === "premium" && <Crown className="w-4 h-4 text-amber-400" />}
                        <div className="text-right"><div className="text-sm font-semibold text-purple-400">
                          {Math.round((videoModel ? videoModel.costPerSec : imageModel ? imageModel.cost : audioModel?.cost || 0) * 100)}
                        </div><div className="text-[10px] text-gray-500">credits</div></div>
                        {selectedModel === m.id && <Check className="w-5 h-5 text-purple-400" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {showReferenceSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowReferenceSelector(false)}>
            <div className="bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10"><h3 className="text-lg font-semibold">Reference Mode</h3><p className="text-sm text-gray-400">Choose how to reference your uploads</p></div>
              <div className="p-4 space-y-2">
                {getReferenceModes().map(mode => (
                  <button key={mode.id} onClick={() => { setReferenceMode(mode.id as ReferenceMode); setShowReferenceSelector(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl ${referenceMode === mode.id ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]/50"}`}>
                    <span className="font-medium text-white">{mode.label}</span>
                    {referenceMode === mode.id && <Check className="w-5 h-5 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setShowSettings(false)}>
            <div className="bg-[#1a1a1a] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div><h3 className="text-lg font-semibold">Settings</h3><p className="text-sm text-gray-400">Configure generation parameters</p></div>
                <button onClick={() => setShowSettings(false)} className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[60vh] space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-3 block">Aspect Ratio</label>
                  <div className="flex items-center gap-3">
                    {getCurrentRatioOptions().map(ratio => (
                      <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`flex flex-col items-center gap-2 p-3 rounded-xl ${aspectRatio === ratio ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]/50"}`}>
                        <div className={`rounded-md border-2 ${aspectRatio === ratio ? "border-purple-500" : "border-gray-600"} ${ratio === "21:9" ? "w-6 h-2.5" : ratio === "16:9" ? "w-6 h-3.5" : ratio === "4:3" ? "w-6 h-4.5" : ratio === "1:1" ? "w-5 h-5" : ratio === "3:4" ? "w-4.5 h-6" : "w-3 h-6"}`} />
                        <span className="text-xs text-gray-400">{ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {activeTab !== "audio" && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Resolution</label>
                    <div className="flex gap-2">
                      {getCurrentResolutionOptions().map(res => (
                        <button key={res} onClick={() => setResolution(res)} className={`flex-1 py-2.5 px-4 rounded-full text-sm font-medium ${resolution === res ? "bg-purple-500 text-white" : "bg-[#2a2a2a] text-gray-400 hover:text-white"}`}>{res}</button>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab !== "image" && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">Duration <span className="text-gray-500 ml-2">(Max: {getCurrentMaxDuration()}s)</span></label>
                    <div className="grid grid-cols-4 gap-2">
                      {getDurationOptions().map(dur => (
                        <button key={dur} onClick={() => setDuration(dur)} disabled={parseInt(dur) > getCurrentMaxDuration()} className={`py-2.5 rounded-xl text-sm font-medium ${duration === dur ? "bg-purple-500 text-white" : parseInt(dur) > getCurrentMaxDuration() ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-[#2a2a2a] text-gray-400 hover:text-white"}`}>{dur}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {showPromptExpand && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPromptExpand(false)}>
            <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10 flex items-center justify-between"><h3 className="text-lg font-semibold">Edit Prompt</h3><button onClick={() => setShowPromptExpand(false)} className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white"><X className="w-4 h-4" /></button></div>
              <div className="flex-1 p-4"><textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe what you want to create..." className="w-full h-full bg-[#2a2a2a] rounded-2xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50" /></div>
            </div>
          </div>
        )}
        {showReferenceUpload && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowReferenceUpload(false)}>
            <div className="bg-[#1a1a1a] rounded-3xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4">Add References</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-500" onClick={() => fileInputRef.current?.click()}><Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" /><p className="text-sm text-gray-300">Click to upload or drag and drop</p><p className="text-xs text-gray-500 mt-1">Supports images, videos, audio (max 50MB)</p></div>
                <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={handleFileUpload} />
                {references.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-300">Uploaded ({references.length}/12)</p>
                    <div className="grid grid-cols-4 gap-2">
                      {references.map((ref, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-[#2a2a2a]">
                          {ref.type === "image" && <img src={ref.url} alt={`Ref ${idx + 1}`} className="w-full h-full object-cover" />}
                          {ref.type === "video" && <div className="w-full h-full flex items-center justify-center"><VideoIcon className="w-6 h-6 text-gray-400" /></div>}
                          {ref.type === "audio" && <div className="w-full h-full flex items-center justify-center"><AudioIcon className="w-6 h-6 text-gray-400" /></div>}
                          <button onClick={() => removeReference(idx)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"><X className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => setShowReferenceUpload(false)} className="w-full py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium">Done</button>
              </div>
            </div>
          </div>
        )}
        {result && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setResult(null)}>
            <div className="bg-[#1a1a1a] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-white/10 flex items-center justify-between"><h3 className="text-lg font-semibold">Generation Complete</h3><button onClick={() => setResult(null)} className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white"><X className="w-4 h-4" /></button></div>
              <div className="flex-1 p-4 overflow-auto">
                {result.type === "image" && result.url && <img src={result.url} alt="Generated" className="w-full rounded-2xl" />}
                {result.type === "video" && result.url && <video src={result.url} controls className="w-full rounded-2xl" />}
                {result.type === "audio" && result.url && <audio src={result.url} controls className="w-full" />}
              </div>
              {result.url && (
                <div className="p-4 border-t border-white/10 flex gap-3">
                  <a href={result.url} download className="flex-1 py-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-xl text-white font-medium text-center">Download</a>
                  <button onClick={() => setResult(null)} className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl text-white font-medium">Create More</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}