import { useState, useEffect } from "react";
import { Loader2, X, Menu, ChevronUp, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/Navigation";

const imageModels = [
  { id: "flux-1-pro", name: "FLUX.1 Pro", tier: "premium", category: "flux", emoji: "⚡" },
  { id: "flux-1-dev", name: "FLUX.1 Dev", tier: "standard", category: "flux", emoji: "🔧" },
  { id: "flux-1-schnell", name: "FLUX.1 Schnell", tier: "budget", category: "flux", emoji: "⚡" },
  { id: "nano-banana-2", name: "Nano Banana 2", tier: "premium", category: "nano", emoji: "🍌" },
  { id: "stable-diffusion-3.5", name: "Stable Diffusion 3.5", tier: "standard", category: "stability", emoji: "🎨" },
  { id: "grok-image", name: "Grok Image", tier: "premium", category: "grok", emoji: "🤖" },
  { id: "seedream-2.0", name: "Seedream 2.0", tier: "premium", category: "seedream", emoji: "🌱" },
  { id: "recraft-v3", name: "Recraft v3", tier: "standard", category: "recraft", emoji: "🎭" },
  { id: "ideogram-v2", name: "Ideogram V2", tier: "standard", category: "ideogram", emoji: "💡" },
  { id: "playground-v2.5", name: "Playground v2.5", tier: "standard", category: "playground", emoji: "🎪" },
  { id: "auraflow", name: "AuraFlow", tier: "budget", category: "auraflow", emoji: "🌊" },
];

const aspectRatios = [
  { value: "21:9", label: "21:9", icon: "🖥️" },
  { value: "16:9", label: "16:9", icon: "📺" },
  { value: "4:3", label: "4:3", icon: "📷" },
  { value: "1:1", label: "1:1", icon: "⬛" },
  { value: "3:4", label: "3:4", icon: "📱" },
  { value: "9:16", label: "9:16", icon: "📱" },
];

const trendingExamples = [
  { emoji: "🎨", title: "Abstract Art", prompt: "Colorful abstract painting with geometric shapes" },
  { emoji: "🌅", title: "Sunset Scene", prompt: "Beautiful sunset over mountains with vibrant colors" },
  { emoji: "🤖", title: "Futuristic City", prompt: "Cyberpunk city with neon lights at night" },
];

export default function ImageGeneratePage() {
  const [category, setCategory] = useState<"video" | "image" | "audio">("image");
  const [selectedModel, setSelectedModel] = useState(imageModels[0].id);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [batchCount, setBatchCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const selectedModelData = imageModels.find(m => m.id === selectedModel) || imageModels[0];
  const creditCost = batchCount * 10;

  const handleCategoryChange = (newCategory: "video" | "image" | "audio") => {
    setCategory(newCategory);
    if (newCategory === "video") {
      window.location.href = "/video/generate";
    } else if (newCategory === "audio") {
      window.location.href = "/audio";
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setResult("/placeholder-image.jpg");
      setIsLoading(false);
    }, 3000);
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e] text-white">
        <header className="sticky top-0 z-40 bg-[#0e0e10]/95 backdrop-blur-lg border-b border-white/5">
          <div className="flex items-center justify-center px-4 h-16 gap-3">
            <span className="text-sm text-white/60">Create with</span>
            <div className="flex gap-2">
              {(["video", "image", "audio"] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    category === cat
                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                  }`}
                >
                  {cat === "video" ? "🎬 Video" : cat === "image" ? "🖼️ Image" : "🎵 Audio"}
                </button>
              ))}
            </div>
            <span className="text-sm text-white/60">today</span>
          </div>
        </header>

        <main className="pb-64">
          {!result ? (
            <div className="px-4 py-6">
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">
                Trending
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {trendingExamples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(example.prompt)}
                    className="aspect-square rounded-2xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-white/10 p-4 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                  >
                    <div className="text-4xl">{example.emoji}</div>
                    <span className="text-xs text-white/60 text-center">{example.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-6">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/10">
                <img src={result} alt="Generated" className="w-full h-full object-cover" />
                <button
                  onClick={() => setResult(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          )}
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-[#0e0e10]/98 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="px-4 py-4 space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="min-h-[80px] bg-white/5 border-[#667eea]/30 focus:border-[#667eea] text-white placeholder:text-white/40 resize-none"
            />

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left text-sm text-white/80 hover:bg-white/10 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selectedModelData.emoji}</span>
                    <span>{selectedModelData.name}</span>
                  </div>
                  <ChevronUp className={`w-4 h-4 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
                </button>

                {showModelDropdown && (
                  <div className="absolute bottom-full mb-2 left-0 right-0 max-h-64 overflow-y-auto rounded-xl bg-[#1a1a2e]/98 backdrop-blur-xl border border-white/10">
                    {imageModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-b-0 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{model.emoji}</span>
                          <span className="text-sm text-white/80">{model.name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          model.tier === "budget" ? "bg-green-500/20 text-green-400" :
                          model.tier === "standard" ? "bg-indigo-500/20 text-indigo-400" :
                          "bg-purple-500/20 text-purple-400"
                        }`}>
                          {model.tier}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-3 border border-white/10">
                <button
                  onClick={() => setBatchCount(Math.max(1, batchCount - 1))}
                  className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                >
                  −
                </button>
                <span className="text-sm text-white/80 min-w-[20px] text-center">{batchCount}</span>
                <button
                  onClick={() => setBatchCount(Math.min(4, batchCount + 1))}
                  className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    aspectRatio === ratio.value
                      ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5568d3] to-[#6a4293] text-white font-medium shadow-lg shadow-[#667eea]/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate • {creditCost} credits
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}