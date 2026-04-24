import { useState, useRef } from "react";
import { Loader2, X, Film, Image as ImageIcon, Music, Settings2, Check } from "lucide-react";
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
  { id: "sora-2-pro", name: "Sora 2 Pro", tier: "pro", refs: ["image"] },
  { id: "veo-3.1", name: "Veo 3.1", tier: "pro", refs: ["image"] },
  { id: "runway-gen3", name: "Runway Gen-3", tier: "pro", refs: ["image"] },
  { id: "luma-1.6", name: "Luma Dream Machine", tier: "pro", refs: ["image"] },
];

const referenceOptions = {
  omni: { label: "Omni Reference", icon: "🎬", uploads: 1 },
  frame: { label: "Start/End Frame", icon: "📹", uploads: 2 },
  image: { label: "Image Reference", icon: "🖼️", uploads: 1 },
  character: { label: "Character Reference", icon: "👤", uploads: 1 },
};

const trendingVideos = [
  { title: "Model Walk in the Wind", image: "linear-gradient(135deg, from-blue-600 to-blue-400)" },
  { title: "Fast-Paced Belly Dance", image: "linear-gradient(135deg, from-amber-600 to-amber-400)" },
  { title: "Product Story: Milk to Earnings", image: "linear-gradient(135deg, from-green-600 to-green-400)" },
];

export default function VideoGenerator({ category = "video", onGenerationComplete }: VideoGeneratorProps) {
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Floating 'Create with' Header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4">
        <div className="flex items-center gap-4 px-6 py-3 rounded-full bg-[#0f0f12]/90 border border-indigo-500/20 backdrop-blur-xl">
          <span className="text-sm font-medium text-white">Create with</span>
          
          <div className="flex gap-2">
            {[
              { icon: "▶", label: "Video", mode: "video" as const },
              { icon: "⬜", label: "Image", mode: "image" as const },
              { icon: "♪", label: "Audio", mode: "audio" as const },
            ].map(({ icon, label, mode }) => (
              <button
                key={mode}
                onClick={() => setCategoryMode(mode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                  categoryMode === mode
                    ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/20 border border-indigo-400/60 text-white shadow-lg shadow-indigo-500/20"
                    : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90"
                }`}
              >
                <span className="text-lg font-bold">{icon}</span>
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>

          <span className="text-sm font-medium text-white">today</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="pt-24 pb-40 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Trending Videos Grid */}
          <div className="mb-16">
            <div className="grid grid-cols-3 gap-6">
              {trendingVideos.map((video, i) => (
                <div
                  key={i}
                  className="relative h-56 rounded-3xl overflow-hidden border border-indigo-500/20 hover:border-indigo-400/40 transition-all group cursor-pointer"
                  style={{ background: video.image }}
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all" />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-cyan-400/20 border border-cyan-400/40 text-xs font-semibold text-cyan-300">
                    Trending
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold text-sm">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Layout - Two Columns */}
          <div className="flex gap-8">
            {/* Left Column - Uploads and Prompt */}
            <div className="flex-1">
              {/* Upload Boxes */}
              <div className="mb-8">
                <div className="flex gap-4 mb-3">
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
                        className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400/60 hover:bg-indigo-500/15 transition-all flex items-center justify-center text-white/50 hover:text-white text-3xl font-light"
                      >
                        +
                      </button>
                      {uploads[i] && (
                        <div className="absolute -bottom-8 left-0 flex items-center gap-2 px-2 py-1 bg-indigo-500/20 rounded-lg border border-indigo-400/30 text-xs text-indigo-300 whitespace-nowrap">
                          <span className="truncate w-20">{uploads[i].name}</span>
                          <button onClick={() => removeUpload(i)} className="hover:text-indigo-100">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-white/50 mt-2">
                  {uploadCount === 1 ? "Start Frame" : "Start Frame + End Frame"}
                </p>
              </div>

              {/* Text Prompt */}
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Imagine the video you want."
                className="w-full bg-[#0f0f12] border border-indigo-500/20 text-white placeholder:text-white/30 rounded-2xl p-4 min-h-[140px] resize-none focus:border-indigo-400/50 focus:ring-indigo-500/20"
              />
            </div>

            {/* Right Column - Category Selector & Reference Menu */}
            <div className="w-64 flex flex-col gap-6">
              {/* Category Buttons */}
              <div className="flex flex-col gap-2">
                {[
                  { icon: "▶", label: "Video", mode: "video" as const },
                  { icon: "⬜", label: "Image", mode: "image" as const },
                  { icon: "♪", label: "Audio", mode: "audio" as const },
                ].map(({ icon, label, mode }) => (
                  <button
                    key={mode}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                      categoryMode === mode
                        ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/20 border border-indigo-400/60 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/5 border border-white/10 text-white/60 hover:text-white/90"
                    }`}
                  >
                    <span className="text-xl font-bold">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>

              {/* Reference Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowReferenceMenu(!showReferenceMenu)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0f0f12] border border-indigo-500/20 hover:border-indigo-400/40 transition-all text-left text-sm text-white flex items-center justify-between"
                >
                  <span>Reference</span>
                  <span className="text-xs">⬇</span>
                </button>
                {showReferenceMenu && (
                  <div className="absolute top-full mt-2 w-full bg-[#0f0f12] border border-indigo-500/20 rounded-xl overflow-hidden z-50 shadow-lg shadow-indigo-500/10">
                    {currentModel?.refs.map(ref => (
                      <button
                        key={ref}
                        onClick={() => {
                          setSelectedReference(ref);
                          setShowReferenceMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-white/70 hover:text-white hover:bg-indigo-500/10 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between group"
                      >
                        <span>{referenceOptions[ref as keyof typeof referenceOptions]?.label}</span>
                        {ref === selectedReference && (
                          <Check className="w-4 h-4 text-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8 pb-4 border-t border-indigo-500/10">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-3">
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f0f12] border border-indigo-500/20 hover:border-indigo-400/40 transition-all text-xs text-white font-medium"
            >
              <Film className="w-4 h-4" />
              {currentModel?.name}
            </button>
            {showModelMenu && (
              <div className="absolute bottom-full mb-2 left-0 w-56 bg-[#0f0f12] border border-indigo-500/20 rounded-xl overflow-hidden max-h-64 overflow-y-auto z-50">
                {videoModels.map(model => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelMenu(false);
                      setSelectedReference(model.refs[0]);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-white/70 hover:text-white hover:bg-indigo-500/10 border-b border-white/5 last:border-b-0 transition-all"
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reference Display */}
          <div className="px-3 py-2 rounded-lg bg-[#0f0f12] border border-indigo-500/20 text-xs text-white/70">
            {referenceOptions[selectedReference as keyof typeof referenceOptions]?.label}
          </div>

          {/* Settings Button */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0f0f12] border border-indigo-500/20 hover:border-indigo-400/40 transition-all text-xs text-white font-medium"
            >
              <Settings2 className="w-4 h-4" />
              {selectedRatio} · {selectedResolution} · {selectedDuration}
            </button>
            {showSettings && (
              <div className="absolute bottom-full mb-2 right-0 w-96 bg-[#0f0f12] border border-indigo-500/20 rounded-xl p-4 z-50 space-y-4 shadow-lg shadow-indigo-500/10">
                <div>
                  <p className="text-xs text-white/50 mb-3 font-medium">Aspect Ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"].map(ratio => (
                      <button
                        key={ratio}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-3 py-2 rounded-lg text-xs transition-all font-medium ${
                          selectedRatio === ratio
                            ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/20 border border-indigo-400/60 text-white"
                            : "bg-[#151519] border border-white/10 text-white/60 hover:bg-[#1a1a20]"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-3 font-medium">Resolution</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["480p", "720p", "1080p"].map(res => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`px-3 py-2 rounded-lg text-xs transition-all font-medium ${
                          selectedResolution === res
                            ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/20 border border-indigo-400/60 text-white"
                            : "bg-[#151519] border border-white/10 text-white/60 hover:bg-[#1a1a20]"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-white/50 mb-3 font-medium">Duration</p>
                  <div className="grid grid-cols-4 gap-2">
                    {["5s", "10s", "15s", "20s"].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-3 py-2 rounded-lg text-xs transition-all font-medium ${
                          selectedDuration === dur
                            ? "bg-gradient-to-r from-indigo-500/40 to-cyan-500/20 border border-indigo-400/60 text-white"
                            : "bg-[#151519] border border-white/10 text-white/60 hover:bg-[#1a1a20]"
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
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 border border-indigo-400/30">
            <span className="text-sm font-bold">💜</span>
            <span className="text-sm font-semibold text-white">88</span>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-8 py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:from-indigo-500/30 disabled:to-cyan-500/30 rounded-lg text-white font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
          </Button>
        </div>
      </div>
    </div>
  );
}