<![CDATA[
import { useState, useEffect } from "react";
import { Loader2, X, Menu, ChevronUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  tier: "free" | "pro";
  category: "budget" | "standard" | "premium";
  credits: number;
  aspectRatios: string[];
}

const imageModels: ModelOption[] = [
  { 
    id: "flux-schnell", 
    name: "FLUX Schnell", 
    description: "Fast, efficient generation", 
    tier: "free",
    category: "budget",
    credits: 3,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "flux-dev", 
    name: "FLUX Dev", 
    description: "Flexible & creative", 
    tier: "free",
    category: "budget", 
    credits: 5,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "playground-v2.5", 
    name: "Playground V2.5", 
    description: "Creative playground", 
    tier: "free",
    category: "budget",
    credits: 5,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "auraflow", 
    name: "AuraFlow", 
    description: "Open source quality", 
    tier: "free",
    category: "budget",
    credits: 4,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "sd-xl", 
    name: "SDXL", 
    description: "Classic quality", 
    tier: "free",
    category: "budget",
    credits: 3,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "nano-banana-2", 
    name: "Nano Banana 2", 
    description: "Improved quality", 
    tier: "pro",
    category: "standard",
    credits: 6,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "seedream-4.5", 
    name: "Seedream 4.5", 
    description: "Photorealistic", 
    tier: "pro",
    category: "standard",
    credits: 7,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "flux-pro-1.1", 
    name: "FLUX Pro 1.1", 
    description: "Professional grade", 
    tier: "pro",
    category: "premium",
    credits: 10,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
  { 
    id: "grok-aurora", 
    name: "Grok Aurora", 
    description: "xAI image model", 
    tier: "pro",
    category: "premium",
    credits: 10,
    aspectRatios: ["1:1", "16:9", "9:16"]
  },
  { 
    id: "gpt-image-2", 
    name: "GPT Image 2", 
    description: "OpenAI DALL-E 2", 
    tier: "pro",
    category: "premium",
    credits: 12,
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"]
  },
];

const categoryColors: Record<string, string> = {
  budget: "text-green-400 border-green-400/30 bg-green-400/10",
  standard: "text-[#667eea] border-[#667eea]/30 bg-[#667eea]/10",
  premium: "text-[#22d3ee] border-[#22d3ee]/30 bg-[#22d3ee]/10"
};

const categoryLabels: Record<string, string> = {
  budget: "Budget",
  standard: "Standard",
  premium: "Premium"
};

export default function ImageGenerate() {
  const [selectedModel, setSelectedModel] = useState("flux-schnell");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"video" | "image" | "audio">("image");
  const router = useRouter();

  const currentModel = imageModels.find(m => m.id === selectedModel);

  useEffect(() => {
    if (router.isReady && router.query.model && typeof router.query.model === "string") {
      const exists = imageModels.some(m => m.id === router.query.model);
      if (exists) {
        setSelectedModel(router.query.model);
      }
    }
  }, [router.isReady, router.query.model]);

  const calculateCost = () => {
    if (!currentModel) return 0;
    return currentModel.credits * numImages;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImages([]);
      // Simulate generation
      setTimeout(() => {
        setGeneratedImages(["/flux_1_pro.png"]);
        setIsGenerating(false);
      }, 3000);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image");
      setIsGenerating(false);
    }
  };

  const trendingImages = [
    { id: 1, title: "Cyberpunk City", model: "FLUX Pro", emoji: "🌃" },
    { id: 2, title: "Neon Portrait", model: "Seedream", emoji: "👤" },
    { id: 3, title: "Abstract Art", model: "Grok", emoji: "🎨" },
  ];

  return (
    <>
      <SEO
        title="AI Image Generator - Back2Life.Studio"
        description="Generate stunning images with AI using FLUX, Stable Diffusion, and more"
      />

      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] to-[#1a1a2e] text-white overflow-x-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#0f0f1e]/90 backdrop-blur-lg border-b border-white/5">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-[#667eea] to-[#22d3ee] bg-clip-text text-transparent">
            Back2Life.Studio
          </h1>
          <div className="w-10" />
        </header>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#161618] border-r border-white/10 p-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-semibold">Menu</span>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                <a href="/video/generate" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                  <span>🎬</span>
                  <span>Create Video</span>
                </a>
                <a href="/images/generate" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#667eea]/20 text-[#667eea] border border-[#667eea]/30">
                  <span>🖼️</span>
                  <span>Create Image</span>
                </a>
                <a href="/audio" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                  <span>🎵</span>
                  <span>Create Audio</span>
                </a>
                <hr className="border-white/10 my-4" />
                <a href="/free-tools" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                  <span>🛠️</span>
                  <span>Free Tools</span>
                </a>
                <a href="/library" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                  <span>📁</span>
                  <span>Library</span>
                </a>
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="pt-20 pb-72 px-4">
          {/* Create With Header */}
          <div className="text-center mb-6">
            <p className="text-white/50 text-sm mb-3">Create with</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              {[
                { icon: "🎬", label: "Video", mode: "video" as const },
                { icon: "🖼️", label: "Image", mode: "image" as const },
                { icon: "🎵", label: "Audio", mode: "audio" as const },
              ].map(({ icon, label, mode }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCategoryMode(mode);
                    if (mode === "video") router.push("/video/generate");
                    if (mode === "audio") router.push("/audio");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    categoryMode === mode
                      ? "bg-[#667eea] text-white shadow-[0_0_20px_rgba(102,126,234,0.4)]"
                      : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <p className="text-white/50 text-sm">today</p>
          </div>

          {/* Trending Images Grid */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              {trendingImages.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#667eea]/20 to-[#764ba2]/20 border border-white/10">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">
                    {img.emoji}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#22d3ee]/20 border border-[#22d3ee]/40 text-[10px] text-[#22d3ee]">
                    Trending
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-xs font-medium text-white truncate">{img.title}</p>
                    <p className="text-[10px] text-white/50 truncate">{img.model}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Result */}
          {generatedImages.length > 0 && (
            <div className="mb-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10">
                <img src={generatedImages[0]} alt="Generated" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setGeneratedImages([])}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Prompt */}
          <div className="mb-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 min-h-[100px] resize-none focus:border-[#667eea]/50 focus:ring-[#667eea]/20"
            />
          </div>
        </main>

        {/* Bottom Settings Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0f0f1e] via-[#0f0f1e] to-transparent pt-8 pb-6 px-4">
          <div className="max-w-lg mx-auto space-y-3">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${categoryColors[currentModel?.category || 'budget']}`}>
                    {categoryLabels[currentModel?.category || 'budget']}
                  </span>
                  <span className="text-sm font-medium">{currentModel?.name}</span>
                </div>
                <ChevronUp className={`w-5 h-5 text-white/50 transition-transform ${showModelMenu ? '' : 'rotate-180'}`} />
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 max-h-64 overflow-y-auto rounded-2xl bg-[#161618] border border-white/10 shadow-2xl">
                  {imageModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-all ${
                        selectedModel === model.id ? 'bg-[#667eea]/10' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{model.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] border ${categoryColors[model.category]}`}>
                          {categoryLabels[model.category]}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{model.description}</p>
                      <p className="text-xs text-[#667eea]">{model.credits} credits/image</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Settings Row */}
            <div className="flex gap-2">
              {/* Aspect Ratio */}
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[#667eea]/50"
              >
                {currentModel?.aspectRatios?.map(r => (
                  <option key={r} value={r} className="bg-[#161618]">{r}</option>
                ))}
              </select>

              {/* Batch Counter */}
              <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
                <button
                  onClick={() => setNumImages(Math.max(1, numImages - 1))}
                  disabled={numImages <= 1}
                  className="w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 text-sm"
                >
                  -
                </button>
                <span className="text-sm font-medium text-white min-w-[24px] text-center">
                  {numImages}
                </span>
                <button
                  onClick={() => setNumImages(Math.min(4, numImages + 1))}
                  disabled={numImages >= 4}
                  className="w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cost & Generate */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#667eea]/10 border border-[#667eea]/30">
                <span className="text-lg font-bold text-[#667eea]">{calculateCost()}</span>
                <span className="text-xs text-white/50 block">credits</span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#768af0] hover:to-[#865bb2] disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(102,126,234,0.4)]"
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
]]>

[Tool result trimmed: kept first 100 chars and last 100 chars of 25198 chars.]