import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Crown, Sliders, Layers, Maximize2, Droplet, Check } from "lucide-react";

const videoModels = [
  { id: "veo-3", name: "Veo 3", category: "standard", costPerSec: 0.30 },
  { id: "kling-3-pro", name: "Kling 3.0 Pro", category: "premium", costPerSec: 0.112 },
  { id: "kling-2.5-turbo", name: "Kling 2.5 Turbo", category: "budget", costPerSec: 0.07 },
  { id: "wan-2.2", name: "Wan 2.2", category: "budget", costPerSec: 0.10 },
  { id: "seedance-2.0-fast", name: "Seedance 2.0-Fast", category: "standard", costPerSec: 0.25 },
  { id: "sora-2-pro", name: "Sora 2 Pro", category: "premium", costPerSec: 0.30 },
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

const aspectRatios = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];
const resolutions = ["480p", "720p", "1080p"];
const durations = ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s", "13s", "14s", "15s"];

const VideoIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="14" height="12" rx="2" />
    <path d="M17 10l4-2v8l-4-2z" />
  </svg>
);

const ImgIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 17l6-6 12 12" />
  </svg>
);

const AudioIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="10" x2="5" y2="14" />
    <line x1="9" y1="6" x2="9" y2="18" />
    <line x1="13" y1="9" x2="13" y2="15" />
    <line x1="17" y1="4" x2="17" y2="20" />
    <line x1="21" y1="11" x2="21" y2="13" />
  </svg>
);

export default function CreatePage() {
  const [activeTab, setActiveTab] = useState<"video" | "image" | "audio">("video");
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
      return Math.round((currentModel as { costPerSec: number }).costPerSec * durationSec * 100 * generationCount);
    }
    return Math.round((currentModel as { cost: number }).cost * 100 * generationCount);
  };

  const switchTab = (tab: "video" | "image" | "audio") => {
    setActiveTab(tab);
    if (tab === "video") setSelectedModel("seedance-2.0-fast");
    if (tab === "image") setSelectedModel("flux-dev");
    if (tab === "audio") setSelectedModel("musicgen");
  };

  const referenceOptions = activeTab === "video"
    ? ["omni-reference", "start-end-frame", "image-reference", "character-reference"]
    : activeTab === "image"
    ? ["image-reference", "character-reference", "style-reference"]
    : ["voice-reference", "music-reference"];

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-[#0e0e0e] text-white">
        {/* Main blank area */}
        <main className="pt-20 pb-72 px-4">
          {/* Intentionally blank - results will display here */}
        </main>

        {/* Static Start/End Frame buttons - Video mode only - positioned above panel top-left corner */}
        {activeTab === "video" && (
          <div className="fixed bottom-[280px] left-4 z-30 flex items-center gap-2">
            <button className="w-[88px] h-[100px] rounded-2xl bg-[#2a2a2a]/80 backdrop-blur-sm flex flex-col items-center justify-center -rotate-6 hover:bg-[#333] transition-colors">
              <div className="text-2xl text-white/70 mb-1">+</div>
              <div className="text-[11px] text-white/60 leading-tight text-center">
                Start<br/>Frame
              </div>
            </button>
            <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h14M17 8l-3-3M17 8l-3 3M21 16H7M7 16l3-3M7 16l3 3" />
            </svg>
            <button className="w-[88px] h-[100px] rounded-2xl bg-[#2a2a2a]/80 backdrop-blur-sm flex flex-col items-center justify-center rotate-6 hover:bg-[#333] transition-colors">
              <div className="text-2xl text-white/70 mb-1">+</div>
              <div className="text-[11px] text-white/60 leading-tight text-center">
                End<br/>Frame
              </div>
            </button>
          </div>
        )}

        {/* Fixed Bottom Panel */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a1a] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-5">

            {/* Compact Sliding Tab Switcher - Top Right */}
            <div className="flex justify-end mb-3">
              <div className="inline-flex items-center gap-0.5 p-1 rounded-full bg-[#0e0e0e]/60">
                {/* Video */}
                <button
                  onClick={() => switchTab("video")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all ${
                    activeTab === "video"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <VideoIcon className="w-4 h-4" />
                  {activeTab === "video" && <span className="text-sm font-medium">Video</span>}
                </button>
                {/* Image */}
                <button
                  onClick={() => switchTab("image")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all ${
                    activeTab === "image"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <ImgIcon className="w-4 h-4" />
                  {activeTab === "image" && <span className="text-sm font-medium">Image</span>}
                </button>
                {/* Audio */}
                <button
                  onClick={() => switchTab("audio")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full transition-all ${
                    activeTab === "audio"
                      ? "bg-[#2a2a2a] text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  <AudioIcon className="w-4 h-4" />
                  {activeTab === "audio" && <span className="text-sm font-medium">Audio</span>}
                </button>
              </div>
            </div>

            {/* Text Prompt Area */}
            <div className="relative mb-3">
              <div className="flex items-start gap-2 px-4 py-3 rounded-2xl bg-[#0e0e0e]/60">
                <Droplet className="w-5 h-5 text-white/40 mt-1 flex-shrink-0" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Upload images, videos or audio to freely combine characters, scenes, actions and music. e.g. @Image1"
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 resize-none focus:outline-none min-h-[56px] max-h-[120px] text-sm"
                  rows={2}
                />
                <button
                  onClick={() => setExpandedPrompt(true)}
                  className="mt-1 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Maximize2 className="w-4 h-4 text-white/40" />
                </button>
              </div>
              <button className="absolute -top-2 right-2 px-3 py-1 rounded-full bg-[#2a2a2a] text-[11px] text-white/70 hover:bg-[#333] transition-colors">
                + Refs (0/12)
              </button>
            </div>

            {/* Settings - Two Static Lines */}
            {/* Line 1: Model Selector (full width) */}
            <button
              onClick={() => setShowModelSelector(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="url(#barGrad)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="12" y1="20" x2="12" y2="10" />
                <line x1="18" y1="20" x2="18" y2="6" />
              </svg>
              <span className="text-sm font-medium flex-1 text-left">{currentModel?.name}</span>
              <Crown className="w-4 h-4 text-purple-400 fill-purple-400" />
            </button>

            {/* Line 2: Reference | Settings | Generations | Generate */}
            <div className="flex items-center gap-2">
              {/* Reference Mode Selector */}
              {activeTab === "video" ? (
                <button
                  onClick={() => setShowReferenceSelector(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors flex-1 min-w-0"
                >
                  <svg className="w-4 h-4 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="14" rx="1.5" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="3" y1="15" x2="21" y2="15" />
                    <line x1="8" y1="5" x2="8" y2="19" />
                    <line x1="16" y1="5" x2="16" y2="19" />
                  </svg>
                  <span className="text-sm truncate">
                    {referenceMode === "omni-reference" ? "Omni Reference" :
                     referenceMode === "start-end-frame" ? "Start/End Frame" :
                     referenceMode === "image-reference" ? "Image Reference" : "Character Reference"}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowReferenceSelector(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors flex-1 min-w-0"
                >
                  <span className="text-sm truncate capitalize">
                    {referenceMode.replace(/-/g, " ")}
                  </span>
                </button>
              )}

              {/* Settings Button */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors flex-shrink-0"
              >
                <Sliders className="w-4 h-4 text-white/60" />
              </button>

              {/* Generations Count - Compact */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowGenerations(!showGenerations)}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-full bg-[#0e0e0e]/60 hover:bg-[#0e0e0e] transition-colors"
                >
                  <Layers className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-medium">{generationCount}</span>
                </button>
                {/* Tiny popup - just numbers */}
                {showGenerations && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowGenerations(false)} />
                    <div className="absolute bottom-full mb-2 right-0 z-50 flex gap-1 p-1 rounded-full bg-[#2a2a2a] shadow-xl">
                      {[1, 2, 3, 4].map(n => (
                        <button
                          key={n}
                          onClick={() => {
                            setGenerationCount(n);
                            setShowGenerations(false);
                          }}
                          className={`w-7 h-7 rounded-full text-sm font-medium transition-colors ${
                            generationCount === n
                              ? "bg-[#7c3aed] text-white"
                              : "text-white/70 hover:bg-white/10"
                          }`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Generate Button */}
              <button
                onClick={() => setIsGenerating(true)}
                disabled={isGenerating || !prompt.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#9f5cf7] text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all flex-shrink-0"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span className="text-sm">{calculateCredits()}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selector Bottom Sheet */}
        {showModelSelector && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowModelSelector(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-[#1a1a1a] px-6 py-4">
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
                      selectedModel === model.id ? "bg-[#2a2a2a]" : "bg-[#0e0e0e] hover:bg-[#2a2a2a]"
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

        {/* Reference Mode Bottom Sheet */}
        {showReferenceSelector && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setShowReferenceSelector(false)}>
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl" onClick={e => e.stopPropagation()}>
              <div className="p-6 space-y-1">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4"></div>
                {referenceOptions.map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setReferenceMode(mode);
                      setShowReferenceSelector(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-colors ${
                      referenceMode === mode ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <span className="capitalize">{mode.replace(/-/g, " ")}</span>
                    {referenceMode === mode && <Check className="w-5 h-5 text-white/70" />}
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
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-2"></div>

                {/* Ratio */}
                <div>
                  <h4 className="text-sm text-white/50 mb-3">Ratio</h4>
                  <div className="grid grid-cols-6 gap-2">
                    {aspectRatios.map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                          aspectRatio === ratio ? "bg-[#2a2a2a]" : "bg-[#0e0e0e] hover:bg-[#2a2a2a]"
                        }`}
                      >
                        <div className={`border-2 border-white/60 rounded ${
                          ratio === "21:9" ? "w-7 h-3" :
                          ratio === "16:9" ? "w-6 h-3.5" :
                          ratio === "4:3" ? "w-5 h-4" :
                          ratio === "1:1" ? "w-4 h-4" :
                          ratio === "3:4" ? "w-3.5 h-4.5" :
                          "w-3 h-5"
                        }`} />
                        <span className="text-xs text-white/60">{ratio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <h4 className="text-sm text-white/50 mb-3">Resolution</h4>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#0e0e0e]">
                    {resolutions.map(res => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          resolution === res ? "bg-[#2a2a2a] text-white" : "text-white/50 hover:text-white/80"
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
                          className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            duration === dur ? "bg-[#2a2a2a] text-white" : "bg-[#0e0e0e] text-white/60 hover:bg-[#2a2a2a]"
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

        {/* Expanded Prompt Overlay */}
        {expandedPrompt && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm p-6" onClick={() => setExpandedPrompt(false)}>
            <div className="max-w-2xl mx-auto mt-20" onClick={e => e.stopPropagation()}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Upload images, videos or audio to freely combine characters, scenes, actions and music. e.g. @Image1"
                className="w-full h-96 px-6 py-4 rounded-2xl bg-[#1a1a1a] text-white placeholder:text-white/30 resize-none focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setExpandedPrompt(false)}
                className="mt-4 w-full px-6 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#9f5cf7] text-white font-medium transition-colors"
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