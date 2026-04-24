import { useState, useRef, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VideoGeneratorProps {
  category?: "video" | "image" | "audio";
  onGenerationComplete?: (result: any) => void;
}

interface UploadedFile {
  name: string;
  url: string;
  type: string;
}

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="17" x2="22" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const AudioIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a11 11 0 0 1 0 22 11 11 0 0 1 0-22z" />
    <polyline points="8 12 12 9 12 15 8 12" />
    <path d="M12 9v6" />
    <path d="M15 10.7a4 4 0 0 1 0 2.6" />
    <path d="M9 10.7a4 4 0 0 0 0 2.6" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.98 2.98l4.24 4.24M1 12h6m6 0h6m-15.78 7.78l4.24-4.24m2.98-2.98l4.24-4.24" />
  </svg>
);

const videoModels = [
  { id: "seedance-2.0", name: "Seedance 2.0-Fast", tier: "pro", refs: ["omni", "frame", "image", "character"] },
  { id: "kling-3.0", name: "Kling 3.0", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-3.0-omni", name: "Kling 3.0 Omni", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-3.0-omni-edit", name: "Kling 3.0 Omni Edit", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-motion", name: "Kling Motion Control", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-2.6", name: "Kling 2.6", tier: "pro", refs: ["frame", "image"] },
  { id: "kling-2.5", name: "Kling 2.5", tier: "pro", refs: ["frame", "image"] },
  { id: "ltx-2", name: "LTX-2-19B", tier: "pro", refs: ["image"] },
  { id: "wan-2.2", name: "Wan 2.2", tier: "pro", refs: ["image"] },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", tier: "pro", refs: ["image"] },
  { id: "sora-2-pro", name: "Sora 2 Pro", tier: "pro", refs: ["image"] },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", tier: "pro", refs: ["image"] },
  { id: "veo-3.1-pro", name: "Veo 3.1 Pro", tier: "pro", refs: ["image"] },
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", tier: "pro", refs: ["image"] },
  { id: "luma-1.6", name: "Luma Dream Machine 1.6", tier: "pro", refs: ["image"] },
  { id: "minimax-02", name: "MiniMax 02", tier: "pro", refs: ["image"] },
  { id: "hunyuan", name: "Hunyuan Video", tier: "pro", refs: ["image"] },
  { id: "seedance-1.5", name: "Seedance 1.5 Pro", tier: "pro", refs: ["frame", "image"] },
];

const referenceOptions = {
  omni: { label: "Omni Reference", uploads: 1 },
  frame: { label: "Start/End Frame", uploads: 2 },
  image: { label: "Image Reference", uploads: 1 },
  character: { label: "Character Reference", uploads: 1 },
};

const modelSettings = {
  "seedance-2.0": { ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p", "1080p"], durations: ["4s", "5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-3.0": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-3.0-omni": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-3.0-omni-edit": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-motion": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-2.6": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "kling-2.5": { ratios: ["21:9", "16:9", "9:16", "1:1"], resolutions: ["480p", "720p"], durations: ["5s", "6s", "7s", "8s", "9s", "10s"] },
  "ltx-2": { ratios: ["21:9", "16:9", "1:1", "9:16"], resolutions: ["720p", "1080p"], durations: ["5s", "10s", "15s", "20s"] },
  "wan-2.2": { ratios: ["16:9", "9:16", "1:1"], resolutions: ["720p"], durations: ["5s", "10s"] },
  "default": { ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"], resolutions: ["480p", "720p", "1080p"], durations: ["5s", "10s", "15s", "20s"] },
};

export default function VideoGeneratorUpdated({ category = "video", onGenerationComplete }: VideoGeneratorProps) {
  const [selectedModel, setSelectedModel] = useState("seedance-2.0");
  const [selectedReference, setSelectedReference] = useState<string>("frame");
  const [prompt, setPrompt] = useState("");
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [selectedRatio, setSelectedRatio] = useState("21:9");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [showSettings, setShowSettings] = useState(false);
  const [showReferenceMenu, setShowReferenceMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categoryMode, setCategoryMode] = useState<"video" | "image" | "audio">(category);
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
        onGenerationComplete?.(result);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f12] to-[#0a0a0a] text-white">
      {/* Floating 'Create with' Header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-full bg-[#0f0f12]/90 border border-white/10 backdrop-blur-xl shadow-lg">
          <span className="text-sm font-medium text-white/80">Create with</span>
          
          <div className="flex gap-2">
            {[
              { Icon: VideoIcon, label: "Video", mode: "video" as const },
              { Icon: ImageIcon, label: "Image", mode: "image" as const },
              { Icon: AudioIcon, label: "Audio", mode: "audio" as const },
            ].map(({ Icon, label, mode }) => (
              <button
                key={mode}
                onClick={() => setCategoryMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  categoryMode === mode
                    ? "bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
                }`}
              >
                <Icon />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <span className="text-sm font-medium text-white/80">today</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-48 px-4 flex flex-col items-center">
        {/* Trending Videos */}
        <div className="w-full max-w-2xl mb-12">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 group cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-yellow-500/20 border border-yellow-400/30 text-xs text-yellow-300">
                  Trending
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-white font-light">Trending Video {i}</p>
                    <p className="text-white/50 text-xs mt-1">Click to use as reference</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Areas - Dynamic based on reference type */}
        <div className="w-full max-w-2xl mb-6 flex justify-center gap-4">
          {Array.from({ length: uploadCount }).map((_, i) => (
            <div key={i} className="relative">
              <input
                type="file"
                ref={i === 0 ? fileInputRef : undefined}
                onChange={handleFileUpload}
                accept="image/*,video/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl bg-[#161618] border-2 border-dashed border-white/20 hover:border-purple-400/50 hover:bg-[#1a1a1c] transition-all flex items-center justify-center text-white/50 hover:text-white"
              >
                <span className="text-2xl">+</span>
              </button>
              {uploads[i] && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 mt-2 flex items-center gap-2 px-2 py-1 bg-purple-500/20 rounded-lg border border-purple-400/30 text-xs text-purple-300">
                  <span className="truncate w-16">{uploads[i].name}</span>
                  <button onClick={() => removeUpload(i)} className="hover:text-purple-100">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Text Prompt + Page Indicator */}
        <div className="w-full max-w-2xl flex gap-4 items-start">
          {/* Text Prompt */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Imagine the video you want."
            className="flex-1 bg-[#161618] border border-white/10 text-white placeholder:text-white/30 rounded-xl p-4 min-h-[120px] resize-none focus:border-purple-400/50 focus:ring-purple-500/20"
          />
          
          {/* Page Indicator - Right Side */}
          <div className="flex flex-col gap-2">
            {[
              { Icon: VideoIcon, label: "Video", mode: "video" as const },
              { Icon: ImageIcon, label: "Image", mode: "image" as const },
              { Icon: AudioIcon, label: "Audio", mode: "audio" as const },
            ].map(({ Icon, label, mode }) => (
              <button
                key={mode}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                  categoryMode === mode
                    ? "bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-400/50 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
                }`}
              >
                <Icon />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8 pb-4">
        <div className="flex items-center justify-center gap-3 px-4 max-w-2xl mx-auto">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-xs text-white"
            >
              <VideoIcon />
              {currentModel?.name}
            </button>
            {showModelMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-[#161618] border border-white/10 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-50">
                {videoModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelMenu(false);
                      setSelectedReference(model.refs[0]);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all"
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-xs text-white"
            >
              <span>📁</span>
              {referenceOptions[selectedReference as keyof typeof referenceOptions]?.label}
            </button>
            {showReferenceMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-[#161618] border border-white/10 rounded-xl overflow-hidden z-50">
                {currentModel?.refs.map(ref => (
                  <button
                    key={ref}
                    onClick={() => {
                      setSelectedReference(ref);
                      setShowReferenceMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between"
                  >
                    <span>{referenceOptions[ref as keyof typeof referenceOptions]?.label}</span>
                    {ref === selectedReference && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 text-xs text-white"
            >
              <SettingsIcon />
              {selectedRatio} · {selectedResolution} · {selectedDuration}
            </button>
            {showSettings && (
              <div className="absolute bottom-full mb-2 right-0 w-80 bg-[#161618] border border-white/10 rounded-xl p-4 z-50 space-y-4">
                <div>
                  <p className="text-xs text-white/50 mb-2">Ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {currentSettings.ratios.map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-2 py-1 rounded-lg text-xs transition-all duration-300 ${
                          selectedRatio === ratio
                            ? "bg-gradient-to-r from-purple-500/40 to-indigo-500/40 text-white border border-purple-400/50"
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
                        className={`px-2 py-1 rounded-lg text-xs transition-all duration-300 ${
                          selectedResolution === res
                            ? "bg-gradient-to-r from-purple-500/40 to-indigo-500/40 text-white border border-purple-400/50"
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
                        className={`px-2 py-1 rounded-lg text-xs transition-all duration-300 ${
                          selectedDuration === dur
                            ? "bg-gradient-to-r from-purple-500/40 to-indigo-500/40 text-white border border-purple-400/50"
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
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-400/30">
            <span className="text-sm font-semibold text-purple-300">💜 88</span>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 disabled:from-purple-500/30 disabled:to-indigo-500/30 rounded-lg text-white font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}