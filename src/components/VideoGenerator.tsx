import { useState, useRef, useEffect } from "react";
import { Loader2, X, Menu, ChevronUp, ChevronDown, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

// Fal.ai Video Models with pricing and parameters
const videoModels = [
  { 
    id: "kling-2.5-turbo", 
    name: "Kling 2.5 Turbo", 
    category: "budget",
    costPerSec: 0.07,
    description: "Best value, image-to-video",
    requiresImage: true,
    durations: ["5s", "10s"],
    aspectRatios: ["9:16", "16:9"],
    resolutions: ["1080p"]
  },
  { 
    id: "wan-2.2", 
    name: "Wan 2.2", 
    category: "budget",
    costPerSec: 0.10,
    description: "Most customizable",
    requiresImage: true,
    durations: ["custom"],
    aspectRatios: ["16:9", "9:16", "1:1", "auto"],
    resolutions: ["480p", "580p", "720p"],
    hasFrameControl: true
  },
  { 
    id: "veo-3", 
    name: "Veo 3", 
    category: "standard",
    costPerSec: 0.30,
    description: "Best quality, text-to-video",
    requiresImage: false,
    durations: ["4s", "6s", "8s"],
    aspectRatios: ["16:9", "9:16", "1:1", "auto"],
    resolutions: ["720p", "1080p"],
    hasEnhance: true,
    hasAudio: true,
    hasSafety: true
  },
  { 
    id: "veo-2", 
    name: "Veo 2", 
    category: "standard",
    costPerSec: 0.50,
    description: "Image-to-video premium",
    requiresImage: true,
    durations: ["5s", "10s"],
    aspectRatios: ["16:9", "9:16", "1:1", "auto"],
    resolutions: ["720p", "1080p"]
  },
  { 
    id: "sora-2", 
    name: "Sora 2 Pro", 
    category: "standard",
    costPerSec: 0.30,
    description: "Longest videos (25s)",
    requiresImage: false,
    durations: ["4s", "8s", "12s", "25s"],
    aspectRatios: ["9:16", "16:9"],
    resolutions: ["720p", "1080p"]
  },
  { 
    id: "kling-3-pro", 
    name: "Kling 3.0 Pro", 
    category: "premium",
    costPerSec: 0.112,
    description: "Character consistency",
    requiresImage: false,
    durations: ["custom"],
    aspectRatios: ["9:16", "16:9"],
    resolutions: ["1080p"],
    hasVoice: true,
    hasMultiPrompt: true
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

export default function VideoGenerator() {
  const [selectedModel, setSelectedModel] = useState("veo-3");
  const [prompt, setPrompt] = useState("");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedDuration, setSelectedDuration] = useState("8s");
  const [selectedRatio, setSelectedRatio] = useState("16:9");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [showSettings, setShowSettings] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"video" | "image" | "audio">("video");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Advanced settings
  const [frames, setFrames] = useState(81);
  const [fps, setFps] = useState(16);
  const [safetyTolerance, setSafetyTolerance] = useState(3);
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [generateAudio, setGenerateAudio] = useState(false);
  const [voiceId, setVoiceId] = useState("");
  const [multiPrompt, setMultiPrompt] = useState("");
  const [customDuration, setCustomDuration] = useState(8);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const currentModel = videoModels.find(m => m.id === selectedModel);

  // Calculate cost
  const calculateCost = () => {
    if (!currentModel) return 0;
    const duration = currentModel.id === "kling-3-pro" || currentModel.id === "wan-2.2" 
      ? customDuration 
      : parseInt(selectedDuration);
    let cost = duration * currentModel.costPerSec;
    if (currentModel.id === "kling-3-pro" && generateAudio) cost += duration * 0.056;
    if (selectedResolution === "1080p" && currentModel.costPerSec === 0.30) cost *= 1.67;
    return cost;
  };

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (uploads.length < 3) {
        setUploads(prev => [...prev, {
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type,
        }]);
      }
    });
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  const getDurationSeconds = () => {
    if (currentModel?.id === "kling-3-pro" || currentModel?.id === "wan-2.2") {
      return customDuration;
    }
    return parseInt(selectedDuration);
  };

  return (
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
        <div className="w-10" /> {/* Spacer */}
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
              <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#667eea]/20 text-[#667eea] border border-[#667eea]/30">
                <span>🎬</span>
                <span>Create Video</span>
              </a>
              <a href="/images/generate" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
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
      <main className="pt-20 pb-80 px-4">
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
                onClick={() => setCategoryMode(mode)}
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

        {/* Trending Videos Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-[#667eea]/20 to-[#22d3ee]/20 border border-white/10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#22d3ee]/20 border border-[#22d3ee]/40 text-[10px] text-[#22d3ee]">
                  Trending
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-xs font-medium text-white truncate">Video {i}</p>
                  <p className="text-[10px] text-white/50 truncate">Veo 3</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-6">
          {currentModel?.requiresImage && (
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-[#667eea]/50 hover:bg-[#667eea]/5 transition-all flex flex-col items-center justify-center cursor-pointer"
              >
                <span className="text-2xl mb-1">🖼️</span>
                <span className="text-xs text-white/50">Reference Image</span>
              </div>
              {currentModel.id === "kling-2.5-turbo" && (
                <div className="aspect-square rounded-2xl bg-white/5 border-2 border-dashed border-white/20 hover:border-[#667eea]/50 hover:bg-[#667eea]/5 transition-all flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-2xl mb-1">🎬</span>
                  <span className="text-xs text-white/50">End Frame</span>
                </div>
              )}
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,video/*"
            className="hidden"
            multiple
          />
          
          {uploads.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {uploads.map((upload, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                  {upload.type.startsWith('image/') ? (
                    <img src={upload.url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#667eea]/20 flex items-center justify-center">
                      <span className="text-2xl">🎬</span>
                    </div>
                  )}
                  <button 
                    onClick={() => removeUpload(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Imagine the video you want..."
            className="w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-2xl p-4 min-h-[100px] resize-none focus:border-[#667eea]/50 focus:ring-[#667eea]/20"
          />
        </div>

        {/* Bottom Settings Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0f0f1e] via-[#0f0f1e] to-transparent pt-8 pb-6 px-4">
          <div className="max-w-lg mx-auto space-y-3">
            {/* Model Selector */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border ${categoryColors[currentModel?.category || 'standard']}`}>
                    {categoryLabels[currentModel?.category || 'standard']}
                  </span>
                  <span className="text-sm font-medium">{currentModel?.name}</span>
                </div>
                <ChevronUp className={`w-5 h-5 text-white/50 transition-transform ${showModelMenu ? '' : 'rotate-180'}`} />
              </button>

              {/* Model Dropdown */}
              {showModelMenu && (
                <div className="absolute bottom-full mb-2 left-0 right-0 max-h-64 overflow-y-auto rounded-2xl bg-[#161618] border border-white/10 shadow-2xl">
                  {videoModels.map(model => (
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
                      <p className="text-xs text-[#667eea]">${model.costPerSec}/sec</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Settings Row */}
            <div className="flex gap-2">
              {/* Duration */}
              {currentModel?.durations && currentModel.durations[0] !== "custom" && (
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[#667eea]/50"
                >
                  {currentModel.durations.map(d => (
                    <option key={d} value={d} className="bg-[#161618]">{d}</option>
                  ))}
                </select>
              )}
              
              {/* Aspect Ratio */}
              <select
                value={selectedRatio}
                onChange={(e) => setSelectedRatio(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[#667eea]/50"
              >
                {currentModel?.aspectRatios?.map(r => (
                  <option key={r} value={r} className="bg-[#161618]">{r}</option>
                ))}
              </select>

              {/* Resolution */}
              <select
                value={selectedResolution}
                onChange={(e) => setSelectedResolution(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-[#667eea]/50"
              >
                {currentModel?.resolutions?.map(r => (
                  <option key={r} value={r} className="bg-[#161618]">{r}</option>
                ))}
              </select>
            </div>

            {/* Advanced Settings Toggle */}
            {(currentModel?.hasEnhance || currentModel?.hasAudio || currentModel?.hasSafety || currentModel?.hasVoice || currentModel?.hasFrameControl) && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 transition-all"
              >
                <span>Advanced Settings</span>
                <ChevronUp className={`w-4 h-4 transition-transform ${showSettings ? '' : 'rotate-180'}`} />
              </button>
            )}

            {/* Advanced Settings Panel */}
            {showSettings && (
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                {/* Frame Control for Wan */}
                {currentModel?.hasFrameControl && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Frames</label>
                    <input
                      type="range"
                      min={81}
                      max={100}
                      value={frames}
                      onChange={(e) => setFrames(parseInt(e.target.value))}
                      className="w-full accent-[#667eea]"
                    />
                    <div className="flex justify-between text-xs text-white/30">
                      <span>81</span>
                      <span className="text-[#667eea]">{frames}</span>
                      <span>100</span>
                    </div>
                  </div>
                )}

                {/* FPS for Wan */}
                {currentModel?.hasFrameControl && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">FPS</label>
                    <input
                      type="range"
                      min={5}
                      max={24}
                      value={fps}
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      className="w-full accent-[#667eea]"
                    />
                    <div className="flex justify-between text-xs text-white/30">
                      <span>5</span>
                      <span className="text-[#667eea]">{fps}</span>
                      <span>24</span>
                    </div>
                  </div>
                )}

                {/* Safety Tolerance for Veo 3 */}
                {currentModel?.hasSafety && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Safety Tolerance (1-6)</label>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={safetyTolerance}
                      onChange={(e) => setSafetyTolerance(parseInt(e.target.value))}
                      className="w-full accent-[#667eea]"
                    />
                    <div className="flex justify-between text-xs text-white/30">
                      <span>1</span>
                      <span className="text-[#667eea]">{safetyTolerance}</span>
                      <span>6</span>
                    </div>
                  </div>
                )}

                {/* Toggles */}
                <div className="space-y-2">
                  {currentModel?.hasEnhance && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enhancePrompt}
                        onChange={(e) => setEnhancePrompt(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#667eea]"
                      />
                      <span className="text-sm text-white/70">Enhance Prompt</span>
                    </label>
                  )}
                  {currentModel?.hasAudio && (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={generateAudio}
                        onChange={(e) => setGenerateAudio(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 accent-[#667eea]"
                      />
                      <span className="text-sm text-white/70">Generate Audio (+$0.056/s)</span>
                    </label>
                  )}
                </div>

                {/* Voice ID for Kling 3.0 */}
                {currentModel?.hasVoice && generateAudio && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Voice ID (optional)</label>
                    <input
                      type="text"
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      placeholder="Enter voice ID"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:border-[#667eea]/50"
                    />
                  </div>
                )}

                {/* Multi-prompt for Kling 3.0 */}
                {currentModel?.hasMultiPrompt && (
                  <div className="space-y-2">
                    <label className="text-xs text-white/50">Multi-Prompt (Scene Sequencing)</label>
                    <textarea
                      value={multiPrompt}
                      onChange={(e) => setMultiPrompt(e.target.value)}
                      placeholder="Scene 1: description&#10;Scene 2: description..."
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:border-[#667eea]/50 min-h-[80px] resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Cost & Generate */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#667eea]/10 border border-[#667eea]/30">
                <span className="text-lg font-bold text-[#667eea]">${calculateCost().toFixed(2)}</span>
                <span className="text-xs text-white/50 block">estimated cost</span>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex-1 h-12 bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#768af0] hover:to-[#865bb2] disabled:opacity-50 text-white font-semibold rounded-xl shadow-[0_0_30px_rgba(102,126,234,0.4)]"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}