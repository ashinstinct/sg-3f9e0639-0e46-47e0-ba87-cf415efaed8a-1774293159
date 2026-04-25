import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Video, Image as ImageIcon, Music, Wand2, Loader2 } from "lucide-react";
import VideoGenerator from "@/components/VideoGenerator";

const imageModels = [
  { id: "flux-pro", name: "FLUX.1 Pro", category: "Premium", cost: 0.055 },
  { id: "flux-1.1-pro", name: "FLUX.1.1 Pro", category: "Premium", cost: 0.04 },
  { id: "flux-dev", name: "FLUX.1 Dev", category: "Standard", cost: 0.025 },
  { id: "flux-schnell", name: "FLUX.1 Schnell", category: "Budget", cost: 0.003 },
  { id: "stable-diffusion-3.5", name: "Stable Diffusion 3.5", category: "Standard", cost: 0.03 },
  { id: "stable-diffusion-ultra", name: "SD Ultra", category: "Premium", cost: 0.05 },
  { id: "grok-image", name: "Grok Image", category: "Premium", cost: 0.05 },
  { id: "recraft-v3", name: "Recraft V3", category: "Standard", cost: 0.04 },
  { id: "ideogram-v2", name: "Ideogram V2", category: "Standard", cost: 0.08 },
  { id: "playground-v2.5", name: "Playground V2.5", category: "Standard", cost: 0.04 },
  { id: "auraflow", name: "AuraFlow", category: "Budget", cost: 0.02 },
];

const audioModels = [
  { id: "musicgen", name: "MusicGen", category: "Standard", cost: 0.02 },
  { id: "audiocraft", name: "AudioCraft", category: "Standard", cost: 0.025 },
  { id: "stable-audio", name: "Stable Audio", category: "Premium", cost: 0.04 },
];

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<"video" | "image" | "audio">("video");

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f1e] via-[#1a1a2e] to-[#0f0f1e]">
        {/* Header with tabs */}
        <div className="sticky top-0 z-40 bg-[#0e0e10]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setActiveTab("video")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === "video"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                <Video className="w-5 h-5" />
                <span className="font-medium">Video</span>
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === "image"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                <ImageIcon className="w-5 h-5" />
                <span className="font-medium">Image</span>
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === "audio"
                    ? "bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-lg shadow-[#667eea]/20"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                <Music className="w-5 h-5" />
                <span className="font-medium">Audio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "video" && <VideoGenerator />}
        {activeTab === "image" && <ImageGeneratorContent />}
        {activeTab === "audio" && <AudioGeneratorContent />}
      </div>
    </>
  );
}

function ImageGeneratorContent() {
  const [selectedModel, setSelectedModel] = useState("flux-pro");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [batchCount, setBatchCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const currentModel = imageModels.find(m => m.id === selectedModel);
  const totalCost = currentModel ? currentModel.cost * batchCount : 0;

  return (
    <main className="pb-32">
      {/* Trending Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-sm font-semibold text-white/40 mb-4">Trending</h2>
        <div className="grid grid-cols-3 gap-3">
          {["🎨", "🌟", "🔥"].map((emoji, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-white/5 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#667eea]/30 transition-all">
              <div className="text-6xl">{emoji}</div>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#667eea]/20 border border-[#667eea]/30 backdrop-blur-sm">
                <span className="text-[10px] font-medium text-white/70">Trending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="max-w-7xl mx-auto px-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="w-full h-24 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#667eea]/50 transition-colors"
        />
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0e0e10]/95 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#667eea]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-[#667eea]" />
                <span className="text-sm font-medium text-white">{currentModel?.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  currentModel?.category === "Budget" ? "bg-green-500/20 text-green-400" :
                  currentModel?.category === "Standard" ? "bg-indigo-500/20 text-indigo-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {currentModel?.category}
                </span>
              </div>
              <span className="text-xs text-white/50">{totalCost.toFixed(3)} credits</span>
            </button>

            {showModelDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 max-h-64 overflow-y-auto rounded-2xl bg-[#1a1a2e]/95 border border-white/10 backdrop-blur-xl">
                {imageModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{model.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        model.category === "Budget" ? "bg-green-500/20 text-green-400" :
                        model.category === "Standard" ? "bg-indigo-500/20 text-indigo-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        {model.category}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">{model.cost.toFixed(3)} credits</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#667eea]/50"
            >
              <option value="1:1">Square (1:1)</option>
              <option value="16:9">Landscape (16:9)</option>
              <option value="9:16">Portrait (9:16)</option>
              <option value="4:3">4:3</option>
              <option value="3:4">3:4</option>
            </select>

            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => setBatchCount(Math.max(1, batchCount - 1))}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                -
              </button>
              <span className="text-sm text-white w-4 text-center">{batchCount}</span>
              <button
                onClick={() => setBatchCount(Math.min(4, batchCount + 1))}
                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#667eea]/20 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate {batchCount > 1 ? `${batchCount} Images` : "Image"}</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

function AudioGeneratorContent() {
  const [selectedModel, setSelectedModel] = useState("musicgen");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const currentModel = audioModels.find(m => m.id === selectedModel);
  const totalCost = currentModel ? currentModel.cost * duration : 0;

  return (
    <main className="pb-32">
      {/* Trending Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-sm font-semibold text-white/40 mb-4">Trending</h2>
        <div className="grid grid-cols-3 gap-3">
          {["🎵", "🎶", "🎧"].map((emoji, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-white/5 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-[#667eea]/30 transition-all">
              <div className="text-6xl">{emoji}</div>
              <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[#667eea]/20 border border-[#667eea]/30 backdrop-blur-sm">
                <span className="text-[10px] font-medium text-white/70">Trending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="max-w-7xl mx-auto px-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the music or audio you want to create..."
          className="w-full h-24 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#667eea]/50 transition-colors"
        />
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0e0e10]/95 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#667eea]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#667eea]" />
                <span className="text-sm font-medium text-white">{currentModel?.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  currentModel?.category === "Budget" ? "bg-green-500/20 text-green-400" :
                  currentModel?.category === "Standard" ? "bg-indigo-500/20 text-indigo-400" :
                  "bg-purple-500/20 text-purple-400"
                }`}>
                  {currentModel?.category}
                </span>
              </div>
              <span className="text-xs text-white/50">{totalCost.toFixed(3)} credits</span>
            </button>

            {showModelDropdown && (
              <div className="absolute bottom-full mb-2 left-0 right-0 max-h-64 overflow-y-auto rounded-2xl bg-[#1a1a2e]/95 border border-white/10 backdrop-blur-xl">
                {audioModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{model.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        model.category === "Budget" ? "bg-green-500/20 text-green-400" :
                        model.category === "Standard" ? "bg-indigo-500/20 text-indigo-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        {model.category}
                      </span>
                    </div>
                    <span className="text-xs text-white/50">{model.cost.toFixed(3)} credits</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Duration</span>
              <span className="text-xs text-white">{duration}s</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#667eea]"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={() => setIsGenerating(true)}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#667eea]/20 transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>Generate Audio</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}