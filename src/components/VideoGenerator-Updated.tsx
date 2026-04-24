import { useState, useRef } from "react";
import { Loader2, X, Film, Image as ImageIcon, Music, Menu } from "lucide-react";
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
  omni: { label: "Omni Reference", icon: "🎬", uploads: 1 },
  frame: { label: "Start/End Frame", icon: "📹", uploads: 2 },
  image: { label: "Image Reference", icon: "🖼️", uploads: 1 },
  character: { label: "Character Reference", icon: "👤", uploads: 1 },
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f1e] to-[#1a0a2e] text-white">
      {/* Burger Menu Button */}
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#1a1a2e]/80 border border-indigo-500/30 hover:border-cyan-400/50 transition-all"
      >
        <Menu className="w-6 h-6 text-indigo-400" />
      </button>

      {/* Floating 'Create with' Header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-40 pt-4">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-[#0f0f1e]/90 border border-indigo-500/20 backdrop-blur-xl">
          <span className="text-sm font-medium text-white">Create with</span>
          {[
            { icon: "▶", label: "Video", mode: "video" as const },
            { icon: "⬜", label: "Image", mode: "image" as const },
            { icon: "♪", label: "Audio", mode: "audio" as const },
          ].map(({ icon, label, mode }) => (
            <button
              key={mode}
              onClick={() => setCategoryMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                categoryMode === mode
                  ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/40 border border-indigo-400/60 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90"
              }`}
            >
              <span className="text-lg">{icon}</span>
            </button>
          ))}
          <span className="text-sm font-medium text-white">today</span>
        </div>
      </div>

      {/* Main Layout - Sidebar + Content */}
      <div className="pt-24 pb-48 px-4 flex gap-6 max-w-7xl mx-auto">
        {/* LEFT SIDEBAR */}
        <div className="w-56 flex flex-col gap-6">
          {/* Frame Controls */}
          <div className="bg-[#1a1a2e]/60 border border-indigo-500/20 rounded-2xl p-6">
            <div className="space-y-6">
              {/* Start Frame */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-medium text-white/60">Start</span>
                <span className="text-xs font-medium text-white">Frame</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStartFrame(Math.max(0, startFrame - 1))}
                    className="w-6 h-6 rounded bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-white hover:bg-indigo-500/50 transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={startFrame}
                    onChange={(e) => setStartFrame(parseInt(e.target.value) || 0)}
                    className="w-16 text-center bg-[#0f0f1e] border border-indigo-400/30 rounded text-white text-sm px-2 py-1"
                  />
                  <button
                    onClick={() => setStartFrame(startFrame + 1)}
                    className="w-6 h-6 rounded bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center text-white hover:bg-indigo-500/50 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* End Frame */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-medium text-white/60">End</span>
                <span className="text-xs font-medium text-white">Frame</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEndFrame(Math.max(0, endFrame - 1))}
                    className="w-6 h-6 rounded bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-white hover:bg-cyan-500/50 transition-all"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={endFrame}
                    onChange={(e) => setEndFrame(parseInt(e.target.value) || 0)}
                    className="w-16 text-center bg-[#0f0f1e] border border-cyan-400/30 rounded text-white text-sm px-2 py-1"
                  />
                  <button
                    onClick={() => setEndFrame(endFrame + 1)}
                    className="w-6 h-6 rounded bg-cyan-500/30 border border-cyan-400/50 flex items-center justify-center text-white hover:bg-cyan-500/50 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Files */}
          <div className="bg-[#1a1a2e]/60 border border-indigo-500/20 rounded-2xl p-6 space-y-3">
            <p className="text-xs font-medium text-white/60 uppercase">Reference Files</p>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
            {[
              { icon: "🖼️", label: "Reference Image" },
              { icon: "🎬", label: "Reference Video" },
              { icon: "🎵", label: "Reference Audio" },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:bg-indigo-500/10 transition-all"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium text-white/70">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER CONTENT */}
        <div className="flex-1">
          {/* Trending Videos */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 group-hover:to-black/40 transition-all" />
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-cyan-500/30 border border-cyan-400/50 text-xs font-semibold text-cyan-300">
                  Trending
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-white font-semibold text-sm">Trending Video {i}</p>
                  <p className="text-white/50 text-xs mt-1">Click to use as reference</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#1a1a2e]/95 to-transparent pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          {/* Text Prompt */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Imagine the video you want."
            className="w-full bg-[#1a1a2e]/80 border border-indigo-500/30 text-white placeholder:text-white/30 rounded-xl p-4 min-h-[100px] resize-none focus:border-indigo-400/60 focus:ring-indigo-500/20"
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelMenu(!showModelMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a2e] border border-indigo-500/30 hover:border-indigo-400/60 transition-all text-sm text-white"
              >
                <span>🎬</span>
                {currentModel?.name}
              </button>
              {showModelMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#1a1a2e] border border-indigo-500/30 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-50">
                  {videoModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelMenu(false);
                        setSelectedReference(model.refs[0]);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-indigo-500/20 border-b border-white/5 last:border-b-0 transition-all"
                    >
                      {model.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Selector */}
            <div className="relative">
              <button
                onClick={() => setShowReferenceMenu(!showReferenceMenu)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a2e] border border-indigo-500/30 hover:border-indigo-400/60 transition-all text-sm text-white"
              >
                <span>📁</span>
                {referenceOptions[selectedReference as keyof typeof referenceOptions]?.label}
              </button>
              {showReferenceMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#1a1a2e] border border-indigo-500/30 rounded-xl overflow-hidden z-50">
                  {currentModel?.refs.map(ref => (
                    <button
                      key={ref}
                      onClick={() => {
                        setSelectedReference(ref);
                        setShowReferenceMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-indigo-500/20 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between"
                    >
                      <span>{referenceOptions[ref as keyof typeof referenceOptions]?.label}</span>
                      {ref === selectedReference && <span className="text-cyan-400">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a2e] border border-indigo-500/30 hover:border-indigo-400/60 transition-all text-sm text-white"
              >
                <span>⚙️</span>
                {selectedRatio} · {selectedResolution} · {selectedDuration}
              </button>
              {showSettings && (
                <div className="absolute bottom-full mb-2 right-0 w-96 bg-[#1a1a2e] border border-indigo-500/30 rounded-xl p-4 z-50 space-y-4">
                  <div>
                    <p className="text-xs text-white/50 mb-2">Ratio</p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentSettings.ratios.map(ratio => (
                        <button
                          key={ratio}
                          onClick={() => setSelectedRatio(ratio)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                            selectedRatio === ratio
                              ? "bg-gradient-to-r from-indigo-500/50 to-cyan-500/50 border border-indigo-400 text-white"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-2">Resolution</p>
                    <div className="grid grid-cols-3 gap-2">
                      {currentSettings.resolutions.map(res => (
                        <button
                          key={res}
                          onClick={() => setSelectedResolution(res)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                            selectedResolution === res
                              ? "bg-gradient-to-r from-indigo-500/50 to-cyan-500/50 border border-indigo-400 text-white"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/50 mb-2">Duration</p>
                    <div className="grid grid-cols-4 gap-2">
                      {currentSettings.durations.map(dur => (
                        <button
                          key={dur}
                          onClick={() => setSelectedDuration(dur)}
                          className={`px-2 py-1.5 rounded-lg text-xs transition-all ${
                            selectedDuration === dur
                              ? "bg-gradient-to-r from-indigo-500/50 to-cyan-500/50 border border-indigo-400 text-white"
                              : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
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
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 border border-indigo-400/30">
              <span className="text-sm font-semibold text-indigo-300">💜 88</span>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:from-indigo-500/30 disabled:to-cyan-500/30 rounded-lg text-white font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}