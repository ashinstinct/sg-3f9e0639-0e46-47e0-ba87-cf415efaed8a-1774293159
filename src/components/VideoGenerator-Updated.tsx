import { useState, useRef } from "react";
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
      {/* Floating "Create with" Header - Top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-3">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl">
          <span className="text-xs font-medium text-white/70">Create with</span>
          
          <div className="flex gap-1.5">
            {[
              { symbol: "▶", label: "Video", mode: "video" as const },
              { symbol: "⬜", label: "Image", mode: "image" as const },
              { symbol: "♪", label: "Audio", mode: "audio" as const },
            ].map(({ symbol, label, mode }) => (
              <button
                key={mode}
                onClick={() => setCategoryMode(mode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-300 ${
                  categoryMode === mode
                    ? "bg-indigo-500/40 border border-indigo-400/60 text-white"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
                }`}
              >
                <span className="text-sm">{symbol}</span>
                {label}
              </button>
            ))}
          </div>

          <span className="text-xs font-medium text-white/70">today</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-48 px-4">
        {/* Trending Videos - Compact */}
        <div className="flex justify-center mb-10">
          <div className="max-w-3xl w-full">
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative h-32 rounded-lg overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 group cursor-pointer">
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs bg-yellow-500/20 border border-yellow-400/30 text-yellow-300">
                    Trending
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-center px-2">
                    <p className="text-white text-xs font-light">Video {i}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Areas - Above Prompt */}
        <div className="flex justify-center mb-4">
          <div className="max-w-3xl w-full">
            <div className="flex gap-2 justify-center">
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
                    className="w-16 h-16 rounded-md bg-white/5 border-2 border-dashed border-white/20 hover:border-indigo-400/50 hover:bg-white/10 transition-all flex items-center justify-center text-white/50 hover:text-white"
                  >
                    <span className="text-xl">+</span>
                  </button>
                  {uploads[i] && (
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 mt-1 text-xs text-indigo-300 truncate max-w-12">
                      {uploads[i].name.substring(0, 10)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Text Prompt + Category Buttons */}
        <div className="flex justify-center">
          <div className="max-w-3xl w-full">
            <div className="flex gap-3">
              {/* Text Prompt - Wide */}
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Imagine the video you want..."
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder:text-white/30 rounded-lg p-3 min-h-[100px] resize-none focus:border-indigo-400/50 focus:ring-indigo-500/20 text-sm"
              />
              
              {/* Category Buttons - Right Side */}
              <div className="flex flex-col gap-2">
                {[
                  { symbol: "▶", label: "Video", mode: "video" as const },
                  { symbol: "⬜", label: "Image", mode: "image" as const },
                  { symbol: "♪", label: "Audio", mode: "audio" as const },
                ].map(({ symbol, label, mode }) => (
                  <button
                    key={mode}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                      categoryMode === mode
                        ? "bg-indigo-500/40 border border-indigo-400/60 text-white"
                        : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90 hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm">{symbol}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6 pb-3">
        <div className="flex items-center justify-center gap-2 px-4 max-w-3xl mx-auto">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white"
            >
              {currentModel?.name}
            </button>
            {showModelMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-52 bg-[#161618] border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto z-50">
                {videoModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelMenu(false);
                      setSelectedReference(model.refs[0]);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white"
            >
              {referenceOptions[selectedReference as keyof typeof referenceOptions]?.label}
            </button>
            {showReferenceMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-52 bg-[#161618] border border-white/10 rounded-lg overflow-hidden z-50">
                {currentModel?.refs.map(ref => (
                  <button
                    key={ref}
                    onClick={() => {
                      setSelectedReference(ref);
                      setShowReferenceMenu(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-white/70 hover:text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between"
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
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-white"
            >
              {selectedRatio} · {selectedResolution} · {selectedDuration}
            </button>
            {showSettings && (
              <div className="absolute bottom-full mb-2 right-0 w-72 bg-[#161618] border border-white/10 rounded-lg p-3 z-50 space-y-3">
                <div>
                  <p className="text-xs text-white/50 mb-1.5">Ratio</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {currentSettings.ratios.map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          selectedRatio === ratio
                            ? "bg-indigo-500/40 text-white border border-indigo-400/60"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1.5">Resolution</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {currentSettings.resolutions.map(res => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          selectedResolution === res
                            ? "bg-indigo-500/40 text-white border border-indigo-400/60"
                            : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-1.5">Duration</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {currentSettings.durations.map(dur => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-2 py-1 rounded text-xs transition-all ${
                          selectedDuration === dur
                            ? "bg-indigo-500/40 text-white border border-indigo-400/60"
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
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-indigo-500/20 border border-indigo-400/30 text-sm font-semibold text-indigo-300">
            💜 88
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-5 py-1.5 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/30 rounded text-white text-sm font-medium"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}