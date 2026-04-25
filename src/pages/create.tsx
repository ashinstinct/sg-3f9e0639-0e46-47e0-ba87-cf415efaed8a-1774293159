import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Video, Image as ImageIcon, Music, Wand2, Loader2, Menu, Crown, Sliders, Layers, Maximize2, Droplet } from "lucide-react";

const videoModels = [
  { id: "veo-3", name: "Veo 3", category: "standard", costPerSec: 0.30, durations: ["4s", "6s", "8s"] },
  { id: "kling-3-pro", name: "Kling 3.0 Pro", category: "premium", costPerSec: 0.112, durations: ["3s", "5s", "10s", "15s"] },
  { id: "kling-2.5-turbo", name: "Kling 2.5 Turbo", category: "budget", costPerSec: 0.07, durations: ["5s", "10s"] },
  { id: "wan-2.2", name: "Wan 2.2", category: "budget", costPerSec: 0.10, durations: ["5s", "10s"] },
  { id: "seedance-2.0-fast", name: "Seedance 2.0-Fast", category: "standard", costPerSec: 0.25, durations: ["5s", "10s"] },
  { id: "sora-2-pro", name: "Sora 2 Pro", category: "premium", costPerSec: 0.30, durations: ["4s", "8s", "12s", "25s"] },
];

const imageModels = [
  { id: "flux-pro", name: "FLUX.1 Pro", category: "premium", cost: 0.055 },
  { id: "flux-dev", name: "FLUX.1 Dev", category: "standard", cost: 0.025 },
  { id: "flux-schnell", name: "FLUX.1 Schnell", category: "budget", cost: 0.003 },
  { id: "stable-diffusion-3.5", name: "Stable Diffusion 3.5", category: "standard", cost: 0.03 },
  { id: "grok-image", name: "Grok Image", category: "premium", cost: 0.05 },
  { id: "recraft-v3", name: "Recraft V3", category: "standard", cost: 0.04 },
];

const audioModels = [
  { id: "musicgen", name: "MusicGen", category: "standard", cost: 0.02 },
  { id: "audiocraft", name: "AudioCraft", category: "standard", cost: 0.025 },
  { id: "stable-audio", name: "Stable Audio", category: "premium", cost: 0.04 },
];

const aspectRatios = [
  { id: "21:9", icon: "▭", label: "21:9" },
  { id: "16:9", icon: "▭", label: "16:9" },
  { id: "4:3", icon: "▭", label: "4:3" },
  { id: "1:1", icon: "□", label: "1:1" },
  { id: "3:4", icon: "▯", label: "3:4" },
  { id: "9:16", icon: "▯", label: "9:16" },
];

const resolutions = ["480p", "720p", "1080p"];
const durations = ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s", "13s", "14s", "15s"];

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<"video" | "image" | "audio">("video");
  const [showMenu, setShowMenu] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showReferenceSelector, setShowReferenceSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGenerations, setShowGenerations] = useState(false);
  
  const [selectedModel, setSelectedModel] = useState("seedance-2.0-fast");
  const [prompt, setPrompt] = useState("");
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [referenceMode, setReferenceMode] = useState("start-end-frame");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("720p");
  const [duration, setDuration] = useState("5s");
  const [generationCount, setGenerationCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const getCurrentModels = () => {
    if (activeTab === "video") return videoModels;
    if (activeTab === "image") return imageModels;
    return audioModels;
  };

  const currentModel = getCurrentModels().find(m => m.id === selectedModel) || getCurrentModels()[0];

  const calculateCredits = () => {
    if (activeTab === "video") {
      const durationSec = parseInt(duration);
      return Math.round((currentModel as any).costPerSec * durationSec * 100 * generationCount);
    }
    if (activeTab === "image") {
      return Math.round((currentModel as any).cost * 100 * generationCount);
    }
    return Math.round((currentModel as any).cost * 100 * generationCount);
  };

  return (
    <>
      <Navigation />
      
      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" onClick={() => setShowMenu(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-[#0e0e0e] border-r border-white/10 p-4" onClick={e => e.stopPropagation()}>
            {/* Menu content here - reuse Navigation component */}
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#0e0e0e] text-white">
        {/* Floating Burger Menu - Top Left Only */}
        <button 
          onClick={() => setShowMenu(true)}
          className="fixed top-4 left-4 z-50 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Start/End Frame Buttons - Video Mode Only */}
        {activeTab === "video" && (
          <div className="fixed top-20 left-6 z-40 flex items-center gap-3">
            <button className="px-6 py-8 rounded-3xl bg-[#2a2a2a] border border-white/10 transform -rotate-6 hover:rotate-0 transition-all">
              <div className="text-2xl mb-1">+</div>
              <div className="text-sm text-white/60">Start</div>
              <div className="text-sm text-white/60">Frame</div>
            </button>
            <div className="text-white/40 text-2xl">⇄</div>
            <button className="px-6 py-8 rounded-3xl bg-[#2a2a2a] border border-white/10 transform rotate-6 hover:rotate-0 transition-all">
              <div className="text-2xl mb-1">+</div>
              <div className="text-sm text-white/60">End</div>
              <div className="text-sm text-white/60">Frame</div>
            </button>
          </div>
        )}

        {/* Main Content Area - Blank except for floating elements */}
        <main className="pt-32 pb-80">
          {/* Intentionally blank - no trending grid */}
        </main>

        {/* Fixed Bottom Panel */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            
            {/* Mode Tab Switcher - Top Right */}
            <div className="flex items-center justify-end gap-2 mb-2">
              <button
                onClick={() => {
                  setActiveTab("video");
                  setSelectedModel("seedance-2.0-fast");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === "video"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <path d="M10 12l5-3v6l-5-3z" />
                </svg>
                <span className="text-sm font-medium">Video</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("image");
                  setSelectedModel("flux-dev");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === "image"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 16l5-5 13 13" />
                </svg>
                <span className="text-sm font-medium">Image</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("audio");
                  setSelectedModel("musicgen");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  activeTab === "audio"
                    ? "bg-[#2a2a2a] text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="2" height="16" />
                  <rect x="10" y="8" width="2" height="12" />
                  <rect x="14" y="6" width="2" height="14" />
                  <rect x="18" y="10" width="2" height="10" />
                </svg>
                <span className="text-sm font-medium">Audio</span>
              </button>
            </div>

            {/* Text Prompt Area */}
            <div className="relative">
              <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-[#0e0e0e] border border-white/10">
                <Droplet className="w-5 h-5 text-white/40 mt-1 flex-shrink-0" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Upload images, videos or audio to freely combine characters, scenes, actions and music. e.g. @Image1"
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none min-h-[60px] max-h-[120px]"
                  rows={2}
                />
                <button 
                  onClick={() => setExpandedPrompt(true)}
                  className="mt-1 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <button className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-[#2a2a2a] border border-white/10 text-xs text-white/60 hover:bg-white/10 transition-colors">
                + Refs (0/12)
              </button>
            </div>

            {/* Settings Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* Model Selector */}
              <button
                onClick={() => setShowModelSelector(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2a2a2a] border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                </svg>
                <span className="text-sm font-medium">{currentModel?.name}</span>
                <Crown className="w-4 h-4 text-purple-400" />
              </button>

              {/* Reference Mode Selector */}
              {activeTab === "video" && (
                <button
                  onClick={() => setShowReferenceSelector(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#2a2a2a] border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap"
                >
                  <span className="text-sm">
                    {referenceMode === "omni-reference" ? "Omni Reference" : 
                     referenceMode === "start-end-frame" ? "Start/End Frame" :
                     referenceMode === "image-reference" ? "Image Reference" : "Character Reference"}
                  </span>
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-full bg-[#2a2a2a] border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Sliders className="w-4 h-4 text-white/60" />
              </button>

              {/* Generations Count */}
              <button
                onClick={() => setShowGenerations(true)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-[#2a2a2a] border border-white/10 hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                <Layers className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium">{generationCount}</span>
              </button>

              {/* Generate Button */}
              <button
                onClick={() => setIsGenerating(true)}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#9f5cf7] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/20 transition-all ml-auto whitespace-nowrap"
              >
                <Crown className="w-4 h-4" />
                <span className="text-sm font-bold">{calculateCredits()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selector Modal */}
        {showModelSelector && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowModelSelector(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/5 px-6 py-4">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold">Select Model</h3>
              </div>
              <div className="p-4 space-y-2">
                {getCurrentModels().map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelector(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                      selectedModel === model.id
                        ? "bg-[#2a2a2a] border border-purple-500/50"
                        : "bg-[#0e0e0e] border border-white/5 hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{model.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        model.category === "budget" ? "bg-green-500/20 text-green-400" :
                        model.category === "standard" ? "bg-blue-500/20 text-blue-400" :
                        "bg-purple-500/20 text-purple-400"
                      }`}>
                        {model.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reference Mode Selector */}
        {showReferenceSelector && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowReferenceSelector(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-2">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                {["omni-reference", "start-end-frame", "image-reference", "character-reference"].map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setReferenceMode(mode);
                      setShowReferenceSelector(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between ${
                      referenceMode === mode ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <span className="capitalize">{mode.replace(/-/g, " ")}</span>
                    {referenceMode === mode && <span className="text-purple-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Bottom Sheet */}
        {showSettings && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-6">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                
                {/* Ratio */}
                <div>
                  <h4 className="text-sm text-white/50 mb-3">Ratio</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {aspectRatios.map(ratio => (
                      <button
                        key={ratio.id}
                        onClick={() => setAspectRatio(ratio.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                          aspectRatio === ratio.id
                            ? "bg-[#2a2a2a] border border-purple-500/50"
                            : "bg-[#0e0e0e] border border-white/5 hover:bg-[#2a2a2a]"
                        }`}
                      >
                        <span className="text-2xl">{ratio.icon}</span>
                        <span className="text-xs text-white/60">{ratio.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <h4 className="text-sm text-white/50 mb-3">Resolution</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {resolutions.map(res => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          resolution === res
                            ? "bg-[#2a2a2a] text-white border border-purple-500/50"
                            : "bg-[#0e0e0e] text-white/60 border border-white/5 hover:bg-[#2a2a2a]"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration - Video/Audio only */}
                {(activeTab === "video" || activeTab === "audio") && (
                  <div>
                    <h4 className="text-sm text-white/50 mb-3">Duration</h4>
                    <div className="grid grid-cols-6 gap-2">
                      {durations.map(dur => (
                        <button
                          key={dur}
                          onClick={() => setDuration(dur)}
                          className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                            duration === dur
                              ? "bg-[#2a2a2a] text-white border border-purple-500/50"
                              : "bg-[#0e0e0e] text-white/60 border border-white/5 hover:bg-[#2a2a2a]"
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generations Selector */}
        {showGenerations && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowGenerations(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl" onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map(count => (
                    <button
                      key={count}
                      onClick={() => {
                        setGenerationCount(count);
                        setShowGenerations(false);
                      }}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        generationCount === count
                          ? "bg-[#2a2a2a] text-white border border-purple-500/50"
                          : "bg-[#0e0e0e] text-white/60 border border-white/5 hover:bg-[#2a2a2a]"
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Prompt Overlay */}
        {expandedPrompt && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-6" onClick={() => setExpandedPrompt(false)}>
            <div className="max-w-2xl mx-auto mt-20" onClick={e => e.stopPropagation()}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Upload images, videos or audio to freely combine characters, scenes, actions and music. e.g. @Image1"
                className="w-full h-96 px-6 py-4 rounded-2xl bg-[#1a1a1a] border border-white/10 text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-purple-500/50"
                autoFocus
              />
              <button
                onClick={() => setExpandedPrompt(false)}
                className="mt-4 w-full px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}