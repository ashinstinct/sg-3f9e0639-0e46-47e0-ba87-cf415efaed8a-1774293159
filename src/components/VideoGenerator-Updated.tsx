import { useState, useRef } from "react";
import { Loader2, X, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

const videoModels = [
  { id: "seedance-2.0", name: "Seedance 2.0-Fast", tier: "pro", refs: ["omni", "frame", "image", "character"] },
  { id: "kling-3.0", name: "Kling 3.0", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-3.0-omni", name: "Kling 3.0 Omni", tier: "pro", refs: ["frame", "image"] },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", tier: "pro", refs: ["image"] },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", tier: "pro", refs: ["image"] },
  { id: "runway-gen3", name: "Runway Gen-3", tier: "pro", refs: ["image"] },
  { id: "luma-1.6", name: "Luma Dream Machine", tier: "pro", refs: ["image"] },
];

const referenceOptions = {
  omni: { label: "Omni Reference", uploads: 1 },
  frame: { label: "Start/End Frame", uploads: 2 },
  image: { label: "Image Reference", uploads: 1 },
  character: { label: "Character Reference", uploads: 1 },
};

const modelSettings = {
  "seedance-2.0": { ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p", "1080p"], durations: ["4s", "5s", "6s", "7s", "8s", "9s", "10s"] },
  "default": { ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p", "1080p"], durations: ["5s", "10s", "15s", "20s"] },
};

export default function VideoGeneratorUpdated() {
  const [selectedModel, setSelectedModel] = useState("seedance-2.0");
  const [selectedReference, setSelectedReference] = useState("frame");
  const [prompt, setPrompt] = useState("");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedRatio, setSelectedRatio] = useState("21:9");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [showSettings, setShowSettings] = useState(false);
  const [showReferenceMenu, setShowReferenceMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"video" | "image" | "audio">("video");
  const [startFrame, setStartFrame] = useState(0);
  const [endFrame, setEndFrame] = useState(240);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModel = videoModels.find(m => m.id === selectedModel);
  const currentSettings = modelSettings[selectedModel as keyof typeof modelSettings] || modelSettings.default;
  const uploadCount = referenceOptions[selectedReference as keyof typeof referenceOptions]?.uploads || 1;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      setUploads(prev => [...prev, {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
      }]);
    });
  };

  const removeUpload = (index: number) => {
    setUploads(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          ratio: selectedRatio,
          resolution: selectedResolution,
          duration: selectedDuration,
          references: uploads,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log("Generation complete:", result);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1e] to-[#1a0a2e] text-white overflow-x-hidden">
      {/* Burger Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1a2e]/80 border border-purple-500/40 hover:border-cyan-400/60 transition-all hover:shadow-[0_0_15px_rgba(34,212,238,0.3)]"
      >
        <Menu className="w-6 h-6 text-purple-400" />
      </button>

      {/* Floating 'Create with' Header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pt-4">
        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-[#0f0f1e]/90 border border-purple-500/30 backdrop-blur-xl">
          <span className="text-sm font-semibold text-white">Create with</span>
          {[
            { symbol: "▶", label: "Video", mode: "video" as const },
            { symbol: "⬜", label: "Image", mode: "image" as const },
            { symbol: "♪", label: "Audio", mode: "audio" as const },
          ].map(({ symbol, label, mode }) => (
            <button
              key={mode}
              onClick={() => setCategoryMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-semibold ${
                categoryMode === mode
                  ? "bg-gradient-to-r from-purple-600/50 to-cyan-600/50 border border-purple-400/70 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                  : "bg-white/10 border border-white/20 text-white/70 hover:text-white hover:border-purple-400/50"
              }`}
            >
              <span className="text-lg">{symbol}</span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
          <span className="text-sm font-semibold text-white">today</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="pt-28 pb-96 px-6">
        <div className="max-w-7xl mx-auto flex gap-8">
          {/* LEFT SIDEBAR */}
          <div className="w-64 flex flex-col gap-6">
            {/* Frame Controls */}
            <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="space-y-8">
                {/* Start Frame */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Start</span>
                  <span className="text-sm font-bold text-white">Frame</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStartFrame(Math.max(0, startFrame - 1))}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/40 to-indigo-500/40 border border-purple-400/50 flex items-center justify-center text-white hover:from-purple-500/60 hover:to-indigo-500/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={startFrame}
                      onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
                      className="w-20 text-center bg-[#0f0f1e]/80 border border-purple-400/40 rounded-lg text-white text-sm px-3 py-2 font-semibold focus:border-cyan-400/60 focus:ring-cyan-500/20"
                    />
                    <button
                      onClick={() => setStartFrame(startFrame + 1)}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/40 to-indigo-500/40 border border-purple-400/50 flex items-center justify-center text-white hover:from-purple-500/60 hover:to-indigo-500/60 hover:shadow-[0_0_12px_rgba(168,85,247,0.3)] transition-all font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* End Frame */}
                <div className="flex flex-col items-center gap-4">
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">End</span>
                  <span className="text-sm font-bold text-white">Frame</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEndFrame(Math.max(0, endFrame - 1))}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-cyan-400/50 flex items-center justify-center text-white hover:from-cyan-500/60 hover:to-blue-500/60 hover:shadow-[0_0_12px_rgba(34,212,238,0.3)] transition-all font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={endFrame}
                      onChange={(e) => setEndFrame(parseInt(e.target.value) || 0)}
                      className="w-20 text-center bg-[#0f0f1e]/80 border border-cyan-400/40 rounded-lg text-white text-sm px-3 py-2 font-semibold focus:border-cyan-400/60 focus:ring-cyan-500/20"
                    />
                    <button
                      onClick={() => setEndFrame(endFrame + 1)}
                      className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/40 to-blue-500/40 border border-cyan-400/50 flex items-center justify-center text-white hover:from-cyan-500/60 hover:to-blue-500/60 hover:shadow-[0_0_12px_rgba(34,212,238,0.3)] transition-all font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reference Files */}
            <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm space-y-3">
              <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Reference Files</p>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
              {[
                { symbol: "🖼️", label: "Image" },
                { symbol: "🎬", label: "Video" },
                { symbol: "🎵", label: "Audio" },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-purple-400/30 hover:border-cyan-400/50 hover:bg-purple-500/10 transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                >
                  <span className="text-lg">{item.symbol}</span>
                  <span className="text-xs font-semibold text-white/80">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Trending Videos */}
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-purple-400/30 group cursor-pointer hover:border-cyan-400/50 transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 group-hover:to-black/40 transition-all" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-cyan-500/40 border border-cyan-400/60 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    Trending
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
                    <p className="text-white font-bold text-base">Trending Video {i}</p>
                    <p className="text-white/60 text-xs mt-2">Click to use as reference</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Large Text Prompt */}
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Imagine the video you want."
              className="w-full bg-gradient-to-br from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/30 text-white placeholder:text-white/40 rounded-2xl p-6 min-h-[280px] resize-none focus:border-cyan-400/60 focus:ring-cyan-500/30 font-semibold text-base backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#1a1a2e]/95 to-transparent pt-12 pb-6 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 space-y-4">
          {/* Control Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Model Selector */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/40 hover:border-purple-400/60 transition-all text-sm text-white font-semibold"
              >
                <span>🎬</span>
                {currentModel?.name}
              </button>
              {showModelMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-80 bg-gradient-to-br from-[#1a1a2e] to-[#252545] border border-purple-500/30 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-50 backdrop-blur-sm">
                  {videoModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelMenu(false);
                        setSelectedReference(model.refs[0]);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-purple-500/20 border-b border-white/5 last:border-b-0 transition-all font-semibold"
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Selector */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowReferenceMenu(!showReferenceMenu)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/40 hover:border-purple-400/60 transition-all text-sm text-white font-semibold"
              >
                <span>📁</span>
                {referenceOptions[selectedReference as keyof typeof referenceOptions]?.label}
              </button>
              {showReferenceMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-80 bg-gradient-to-br from-[#1a1a2e] to-[#252545] border border-purple-500/30 rounded-xl overflow-hidden z-50 backdrop-blur-sm">
                  {currentModel?.refs.map(ref => (
                    <button
                      key={ref}
                      onClick={() => {
                        setSelectedReference(ref);
                        setShowReferenceMenu(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-purple-500/20 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between font-semibold"
                    >
                      <span>{referenceOptions[ref as keyof typeof referenceOptions]?.label}</span>
                      {ref === selectedReference && <span className="text-cyan-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-[#1a1a2e]/80 to-[#252545]/80 border border-purple-500/40 hover:border-purple-400/60 transition-all text-sm text-white font-semibold"
              >
                <span>⚙️</span>
                {selectedRatio} · {selectedResolution} · {selectedDuration}
              </button>
              {showSettings && (
                <div className="absolute bottom-full mb-2 right-0 w-96 bg-gradient-to-br from-[#1a1a2e] to-[#252545] border border-purple-500/30 rounded-xl p-6 z-50 space-y-6 backdrop-blur-sm">
                  <div>
                    <p className="text-xs text-white/60 mb-3 font-bold uppercase tracking-wider">Ratio</p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentSettings.ratios.map(ratio => (
                        <button
                          key={ratio}
                          onClick={() => setSelectedRatio(ratio)}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                            selectedRatio === ratio
                              ? "bg-gradient-to-r from-purple-600/60 to-cyan-600/60 border border-cyan-400/70 text-white shadow-[0_0_12px_rgba(34,212,238,0.3)]"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-400/40"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-3 font-bold uppercase tracking-wider">Resolution</p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentSettings.resolutions.map(res => (
                        <button
                          key={res}
                          onClick={() => setSelectedResolution(res)}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                            selectedResolution === res
                              ? "bg-gradient-to-r from-purple-600/60 to-cyan-600/60 border border-cyan-400/70 text-white shadow-[0_0_12px_rgba(34,212,238,0.3)]"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-400/40"
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-3 font-bold uppercase tracking-wider">Duration</p>
                    <div className="grid grid-cols-4 gap-2">
                      {currentSettings.durations.map(dur => (
                        <button
                          key={dur}
                          onClick={() => setSelectedDuration(dur)}
                          className={`px-3 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                            selectedDuration === dur
                              ? "bg-gradient-to-r from-purple-600/60 to-cyan-600/60 border border-cyan-400/70 text-white shadow-[0_0_12px_rgba(34,212,238,0.3)]"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:border-purple-400/40"
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Credits Badge */}
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600/40 to-cyan-600/40 border border-purple-400/60 font-bold">
              <span className="text-lg">💜</span>
              <span className="text-sm">88</span>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:from-purple-600/40 disabled:to-cyan-600/40 rounded-lg text-white font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(34,212,238,0.4)] transition-all uppercase tracking-wider text-sm"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}