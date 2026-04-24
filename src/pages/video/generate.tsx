import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Plus, ChevronUp, ChevronDown, Upload, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface VideoModel {
  id: string;
  name: string;
  logo?: string;
  tier: "free" | "pro";
  ratios?: string[];
  resolutions?: string[];
  durations?: { min: number; max: number; step: number };
  hasAudio?: boolean;
  references?: string[];
}

interface ReferenceOption {
  id: string;
  name: string;
  icon: string;
  uploadFields: { label: string; key: string }[];
}

const videoModels: VideoModel[] = [
  {
    id: "seedance-2.0-fast",
    name: "Seedance 2.0-Fast",
    tier: "pro",
    ratios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
    resolutions: ["480p", "720p", "1080p"],
    durations: { min: 4, max: 15, step: 1 },
    references: ["omni", "start_end", "image", "character"],
  },
  {
    id: "kling-3.0",
    name: "Kling 3.0",
    tier: "pro",
    ratios: ["21:9", "16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["start_end", "image"],
  },
  {
    id: "kling-3.0-omni",
    name: "Kling 3.0 Omni",
    tier: "pro",
    ratios: ["21:9", "16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p", "1080p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["start_end", "image"],
  },
  {
    id: "kling-3.0-omni-edit",
    name: "Kling 3.0 Omni Edit",
    tier: "pro",
    ratios: ["21:9", "16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p", "1080p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["start_end", "image"],
  },
  {
    id: "kling-motion-control",
    name: "Kling Motion Control",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 4, max: 8, step: 1 },
    references: ["image"],
  },
  {
    id: "kling-2.6",
    name: "Kling 2.6",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["start_end", "image"],
  },
  {
    id: "kling-2.5",
    name: "Kling 2.5",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["image"],
  },
  {
    id: "ltx-2-19b",
    name: "LTX-2-19B",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p", "1080p"],
    durations: { min: 4, max: 20, step: 1 },
    references: ["image"],
  },
  {
    id: "wan-2.2",
    name: "Wan 2.2",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 4, max: 8, step: 1 },
    references: ["start_end", "image"],
  },
  {
    id: "sora-2-pro-max",
    name: "Sora 2 Pro Max",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["1080p"],
    durations: { min: 5, max: 60, step: 5 },
    references: ["image"],
  },
  {
    id: "sora-2-pro",
    name: "Sora 2 Pro",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["1080p"],
    durations: { min: 5, max: 60, step: 5 },
    references: ["image"],
  },
  {
    id: "veo-3.1-pro-max",
    name: "Veo 3.1 Pro Max",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["1080p"],
    durations: { min: 4, max: 30, step: 1 },
    references: ["image"],
  },
  {
    id: "veo-3.1-pro",
    name: "Veo 3.1 Pro",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    durations: { min: 4, max: 30, step: 1 },
    references: ["image"],
  },
  {
    id: "runway-gen3-alpha",
    name: "Runway Gen-3 Alpha",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    durations: { min: 5, max: 30, step: 5 },
    references: ["image"],
  },
  {
    id: "luma-dream-machine",
    name: "Luma Dream Machine 1.6",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p"],
    durations: { min: 5, max: 5, step: 1 },
    references: ["image"],
  },
  {
    id: "minimax-02",
    name: "MiniMax 02",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["image"],
  },
  {
    id: "hunyuan-video",
    name: "Hunyuan Video",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["720p", "1080p"],
    durations: { min: 5, max: 10, step: 1 },
    references: ["image"],
  },
  {
    id: "seedance-1.5-pro",
    name: "Seedance 1.5 Pro",
    tier: "pro",
    ratios: ["16:9", "9:16", "1:1"],
    resolutions: ["480p", "720p"],
    durations: { min: 4, max: 10, step: 1 },
    references: ["start_end", "image"],
  },
];

const referenceOptions: Record<string, ReferenceOption> = {
  omni: {
    id: "omni",
    name: "Omni Reference",
    icon: "🎬",
    uploadFields: [{ label: "Video Reference", key: "omni_video" }],
  },
  start_end: {
    id: "start_end",
    name: "Start/End Frame",
    icon: "📹",
    uploadFields: [
      { label: "Start Frame", key: "start_frame" },
      { label: "End Frame", key: "end_frame" },
    ],
  },
  image: {
    id: "image",
    name: "Image Reference",
    icon: "🖼️",
    uploadFields: [{ label: "Image Reference", key: "image_ref" }],
  },
  character: {
    id: "character",
    name: "Character Reference",
    icon: "👤",
    uploadFields: [{ label: "Character Image", key: "character_ref" }],
  },
};

const trendingVideos = [
  {
    title: "Walk in the Wind",
    image: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    title: "Fast-Paced Belly Dance",
    image: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    title: "Product Story: Milk to Earnings",
    image: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
];

export default function VideoGeneratePage() {
  const [selectedModel, setSelectedModel] = useState("seedance-2.0-fast");
  const [selectedReference, setSelectedReference] = useState("start_end");
  const [prompt, setPrompt] = useState("");
  const [showRefDropdown, setShowRefDropdown] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [uploads, setUploads] = useState<Record<string, File | null>>({});
  const [ratio, setRatio] = useState("21:9");
  const [resolution, setResolution] = useState("720p");
  const [duration, setDuration] = useState("5");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentModel = videoModels.find((m) => m.id === selectedModel)!;
  const currentReference = referenceOptions[selectedReference]!;

  const availableReferences = currentModel.references
    ?.map((r) => referenceOptions[r])
    .filter(Boolean) || [];

  // Update selected reference if not available in new model
  useEffect(() => {
    if (!currentModel.references?.includes(selectedReference)) {
      const firstRef = currentModel.references?.[0] || "image";
      setSelectedReference(firstRef);
    }
  }, [selectedModel, currentModel]);

  // Reset uploads when reference changes
  useEffect(() => {
    setUploads({});
  }, [selectedReference]);

  const handleFileUpload = (key: string, file: File | null) => {
    setUploads((prev) => ({ ...prev, [key]: file }));
  };

  const handleRemoveFile = (key: string) => {
    setUploads((prev) => ({ ...prev, [key]: null }));
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = "";
    }
  };

  return (
    <>
      <SEO
        title="AI Video Generator - Back2Life.Studio"
        description="Create stunning videos with AI models like Seedance 2.0, Kling 3.0, and more"
      />
      <Navigation />

      <div className="min-h-screen bg-[#0a0a0a] pt-24 pb-48">
        {/* Floating Top Bar - Centered & Small */}
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-[#161618] border border-white/10 rounded-2xl px-6 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <span className="text-white font-light text-lg">Create with</span>
              <div className="flex gap-2">
                <button className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl hover:bg-purple-500/30 transition-all">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                  </svg>
                </button>
                <button className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                </button>
                <button className="p-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all">
                  <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z" />
                  </svg>
                </button>
              </div>
              <span className="text-white font-light text-lg">today</span>
            </div>
          </div>
        </div>

        {/* Main Content - Centered */}
        <div className="max-w-2xl mx-auto px-4 pt-12">
          {/* Trending Videos - Compact */}
          <div className="grid grid-cols-3 gap-3 mb-12">
            {trendingVideos.map((video) => (
              <div
                key={video.title}
                className="aspect-video rounded-xl overflow-hidden relative cursor-pointer group"
                style={{ background: video.image }}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-yellow-500/80 text-black px-2 py-1 rounded font-semibold">
                    Trending
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Areas - Above Prompt */}
          {Object.keys(uploads).length > 0 || currentReference ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {currentReference.uploadFields.map((field) => (
                <div
                  key={field.key}
                  className="relative w-20 h-20 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-all flex items-center justify-center cursor-pointer overflow-hidden group"
                  onClick={() => fileInputRefs.current[field.key]?.click()}
                >
                  {uploads[field.key] ? (
                    <>
                      <img
                        src={URL.createObjectURL(uploads[field.key]!)}
                        alt={field.label}
                        className="w-full h-full object-cover"
                      />
                      <button
                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(field.key);
                        }}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </>
                  ) : (
                    <Plus className="w-6 h-6 text-white/40 group-hover:text-white/60 transition-colors" />
                  )}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[field.key] = el;
                    }}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) =>
                      handleFileUpload(field.key, e.target.files?.[0] || null)
                    }
                    className="hidden"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-1 text-center">
                    <p className="text-xs text-white/60 truncate">{field.label}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Prompt Textarea - Above Bottom Bar */}
          <div className="mb-4">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Imagine the video you want."
              className="w-full bg-[#161618] border border-white/10 text-white placeholder:text-white/40 min-h-[120px] resize-none rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {/* Settings Popup - Above Bar */}
          {showSettingsPopup && (
            <div className="absolute bottom-24 left-0 right-0 max-w-2xl mx-auto px-4">
              <div className="bg-[#161618] border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-4">
                {/* Ratio Selection */}
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {currentModel.ratios?.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRatio(r)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          ratio === r
                            ? "bg-purple-500 text-white border border-purple-400"
                            : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Selection */}
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">
                    Resolution
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {currentModel.resolutions?.map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          resolution === res
                            ? "bg-purple-500 text-white border border-purple-400"
                            : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Selection */}
                <div>
                  <label className="text-xs text-white/60 uppercase tracking-wider mb-2 block">
                    Duration
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Array.from(
                      {
                        length: Math.floor(
                          (currentModel.durations!.max -
                            currentModel.durations!.min) /
                            currentModel.durations!.step
                        ) + 1,
                      },
                      (_, i) =>
                        currentModel.durations!.min +
                        i * currentModel.durations!.step
                    ).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDuration(d.toString())}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          duration === d.toString()
                            ? "bg-purple-500 text-white border border-purple-400"
                            : "bg-white/5 border border-white/10 text-white/60 hover:border-white/20"
                        }`}
                      >
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Control Bar - Bottom */}
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative flex-1">
              <button
                onClick={() => setShowRefDropdown(!showRefDropdown)}
                className="w-full px-4 py-3 bg-[#161618] border border-white/10 hover:border-white/20 rounded-xl text-left text-white text-sm flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>{currentModel.name}</span>
                </div>
                <ChevronUp
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    showRefDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Model Dropdown */}
              {showRefDropdown && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#161618] border border-white/10 rounded-xl max-h-96 overflow-y-auto z-50">
                  {videoModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowRefDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all flex items-center gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <p className="text-xs text-white/40">
                          {model.tier === "pro" ? "Pro" : "Free"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRefDropdown(!showRefDropdown)}
                className="px-4 py-3 bg-[#161618] border border-white/10 hover:border-white/20 rounded-xl text-white text-sm flex items-center gap-2 transition-all"
              >
                <span>{currentReference.icon}</span>
                <span className="hidden sm:inline">{currentReference.name}</span>
                <ChevronUp
                  className={`w-4 h-4 text-white/40 transition-transform ${
                    showRefDropdown ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Reference Dropdown */}
              {showRefDropdown && (
                <div className="absolute bottom-full mb-2 right-0 bg-[#161618] border border-white/10 rounded-xl min-w-max overflow-hidden z-50">
                  {availableReferences.map((ref) => (
                    <button
                      key={ref.id}
                      onClick={() => {
                        setSelectedReference(ref.id);
                        setShowRefDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-all flex items-center gap-2"
                    >
                      {selectedReference === ref.id && (
                        <span className="text-purple-400">✓</span>
                      )}
                      <span>{ref.icon}</span>
                      <span>{ref.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettingsPopup(!showSettingsPopup)}
              className="px-4 py-3 bg-[#161618] border border-white/10 hover:border-white/20 rounded-xl text-white text-sm flex items-center gap-2 transition-all"
            >
              <span>⚙️</span>
              <span className="text-xs text-white/60">
                {ratio} · {resolution} · {duration}s
              </span>
            </button>

            {/* Credits Badge */}
            <div className="px-4 py-3 bg-purple-500/20 border border-purple-500/30 rounded-xl text-white text-sm font-medium">
              <span className="text-xs text-purple-300">50% Off</span>
              <br />
              <Zap className="w-4 h-4 inline mr-1" />
              88
            </div>

            {/* Generate Button */}
            <button className="px-6 py-3 bg-purple-500 hover:bg-purple-400 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-purple-500/50">
              Generate
            </button>
          </div>
        </div>
      </div>
    </>
  );
}