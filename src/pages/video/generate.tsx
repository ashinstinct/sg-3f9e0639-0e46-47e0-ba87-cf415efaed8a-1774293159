import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Send, Settings, FileUp, Zap, Video, Image as ImageIcon, Music, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ModelOption {
  id: string;
  name: string;
  description: string;
  logo?: string;
  tier: "free" | "pro";
}

interface ReferenceOption {
  id: string;
  label: string;
  icon: string;
}

const videoModels: ModelOption[] = [
  { id: "seedance-2.0", name: "Seedance 2.0-Fast", description: "Fast & smooth", logo: "/logos/seedance.svg", tier: "pro" },
  { id: "kling-3.0", name: "Kling 3.0", description: "Kling latest", logo: "/logos/kling.svg", tier: "pro" },
  { id: "kling-3.0-omni", name: "Kling 3.0 Omni", description: "Video input", logo: "/logos/kling.svg", tier: "pro" },
  { id: "kling-3.0-omni-edit", name: "Kling 3.0 Omni Edit", description: "Advanced editing", logo: "/logos/kling.svg", tier: "pro" },
  { id: "kling-motion-control", name: "Kling Motion Control", description: "Motion control", logo: "/logos/kling.svg", tier: "pro" },
  { id: "kling-2.6", name: "Kling 2.6", description: "Previous version", logo: "/logos/kling.svg", tier: "pro" },
  { id: "kling-2.5", name: "Kling 2.5", description: "Classic version", logo: "/logos/kling.svg", tier: "pro" },
  { id: "ltx-2", name: "LTX-2-19B", description: "Latest LTX", logo: "/logos/ltx.svg", tier: "pro" },
  { id: "wan-2.2", name: "Wan 2.2", description: "Latest Wan", logo: "/logos/wan.svg", tier: "pro" },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", description: "Highest quality", logo: "/logos/sora.svg", tier: "pro" },
  { id: "sora-2-pro", name: "Sora 2 Pro", description: "Premium quality", logo: "/logos/sora.svg", tier: "pro" },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", description: "Highest quality", logo: "/logos/veo.svg", tier: "pro" },
  { id: "veo-3.1-pro", name: "Veo 3.1 Pro", description: "Premium quality", logo: "/logos/veo.svg", tier: "pro" },
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", description: "Runway latest", logo: "/logos/runway.svg", tier: "pro" },
  { id: "luma-1.6", name: "Luma Dream Machine 1.6", description: "Luma latest", logo: "/logos/luma.svg", tier: "pro" },
  { id: "minimax-02", name: "MiniMax 02", description: "MiniMax latest", logo: "/logos/minimax.svg", tier: "pro" },
  { id: "hunyuan", name: "Hunyuan Video", description: "Hunyuan latest", logo: "/logos/hunyuan.svg", tier: "pro" },
  { id: "seedance-1.5", name: "Seedance 1.5 Pro", description: "Previous version", logo: "/logos/seedance.svg", tier: "pro" },
];

const modelReferences: Record<string, ReferenceOption[]> = {
  "seedance-2.0": [
    { id: "omni", label: "Omni Reference", icon: "🎬" },
    { id: "frame", label: "Start/End Frame", icon: "🖼️" },
    { id: "image", label: "Image Reference", icon: "📷" },
    { id: "character", label: "Character Reference", icon: "👤" },
  ],
  "kling-3.0-omni": [
    { id: "frame", label: "Start/End Frame", icon: "🖼️" },
    { id: "image", label: "Image Reference", icon: "📷" },
  ],
  "kling-3.0-omni-edit": [
    { id: "frame", label: "Start/End Frame", icon: "🖼️" },
    { id: "image", label: "Image Reference", icon: "📷" },
  ],
  default: [
    { id: "image", label: "Image Reference", icon: "📷" },
  ],
};

const trendingVideos = [
  { title: "Model Walk in the Wind", image: "url('linear-gradient(135deg, #1e293b 0%, #0f172a 100%)')" },
  { title: "Fast-Paced Belly Dance", image: "url('linear-gradient(135deg, #7c2d12 0%, #1f2937 100%)')" },
  { title: "Product Story: Milk to Earnings", image: "url('linear-gradient(135deg, #15803d 0%, #1f2937 100%)')" },
];

export default function VideoGeneratePage() {
  const [activeTab, setActiveTab] = useState("video");
  const [selectedModel, setSelectedModel] = useState("seedance-2.0");
  const [selectedReference, setSelectedReference] = useState("frame");
  const [prompt, setPrompt] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const [selectedRatio, setSelectedRatio] = useState("21:9");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const startFrameInputRef = useRef<HTMLInputElement>(null);
  const endFrameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  const currentModel = videoModels.find((m) => m.id === selectedModel);
  const availableReferences = modelReferences[selectedModel] || modelReferences.default;

  const ratios = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];
  const resolutions = ["480p", "720p", "1080p"];
  const durations = ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s", "13s", "14s", "15s"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
      if (settingsPanelRef.current && !settingsPanelRef.current.contains(e.target as Node)) {
        setShowSettingsPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStartFrame(file);
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEndFrame(file);
  };

  return (
    <>
      <SEO title="AI Video Generator" description="Create stunning videos with AI" />
      <Navigation />

      <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-40">
        {/* Floating Top Bar - Small & Centered */}
        <div className="fixed top-20 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10">
            <span className="text-white/60 text-sm">Create with</span>
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("video")}
                className={`p-1.5 rounded-lg transition-all ${
                  activeTab === "video"
                    ? "bg-purple-500 text-white"
                    : "bg-[#161618] text-white/60 hover:bg-[#1a1a1c]"
                }`}
                title="Video"
              >
                <Video className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`p-1.5 rounded-lg transition-all ${
                  activeTab === "image"
                    ? "bg-purple-500 text-white"
                    : "bg-[#161618] text-white/60 hover:bg-[#1a1a1c]"
                }`}
                title="Image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`p-1.5 rounded-lg transition-all ${
                  activeTab === "audio"
                    ? "bg-purple-500 text-white"
                    : "bg-[#161618] text-white/60 hover:bg-[#1a1a1c]"
                }`}
                title="Audio"
              >
                <Music className="w-4 h-4" />
              </button>
            </div>
            <span className="text-white/60 text-sm">today</span>
          </div>
        </div>

        {/* Main Content - Centered Compact Layout */}
        <div className="max-w-4xl mx-auto px-4">
          {/* Trending Videos - Compact */}
          <div className="mb-12">
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              {trendingVideos.map((video, i) => (
                <div
                  key={i}
                  className="relative h-32 rounded-xl overflow-hidden border border-white/5 group cursor-pointer"
                  style={{ backgroundImage: video.image }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 group-hover:from-black/20 transition-all" />
                  <Badge className="absolute top-2 left-2 bg-lime-500/20 text-lime-400 border-lime-500/30">Trending</Badge>
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white/80 line-clamp-2">{video.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer for bottom content */}
          <div className="h-64" />
        </div>
      </div>

      {/* Fixed Bottom Section - Connected */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-[#0a0a0a]/0 pt-8 pb-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Start/End Frame Uploaders - Compact */}
          <div className="flex gap-3 mb-4">
            {/* Start Frame */}
            <div className="flex flex-col items-center gap-2">
              <input
                ref={startFrameInputRef}
                type="file"
                accept="image/*"
                onChange={handleStartFrameUpload}
                className="hidden"
              />
              <button
                onClick={() => startFrameInputRef.current?.click()}
                className="w-16 h-16 rounded-lg bg-[#161618] border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-[#1a1a1c] transition-all flex items-center justify-center group relative overflow-hidden"
              >
                {startFrame ? (
                  <img
                    src={URL.createObjectURL(startFrame)}
                    alt="Start"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl group-hover:scale-110 transition-transform">+</span>
                )}
              </button>
              <span className="text-xs text-white/50 text-center">Start<br/>Frame</span>
            </div>

            {/* End Frame */}
            <div className="flex flex-col items-center gap-2">
              <input
                ref={endFrameInputRef}
                type="file"
                accept="image/*"
                onChange={handleEndFrameUpload}
                className="hidden"
              />
              <button
                onClick={() => endFrameInputRef.current?.click()}
                className="w-16 h-16 rounded-lg bg-[#161618] border-2 border-dashed border-white/20 hover:border-purple-500/50 hover:bg-[#1a1a1c] transition-all flex items-center justify-center group relative overflow-hidden"
              >
                {endFrame ? (
                  <img
                    src={URL.createObjectURL(endFrame)}
                    alt="End"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl group-hover:scale-110 transition-transform">+</span>
                )}
              </button>
              <span className="text-xs text-white/50 text-center">End<br/>Frame</span>
            </div>

            {/* Prompt Input */}
            <div className="flex-1 flex flex-col">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Imagine the video you want."
                className="flex-1 bg-[#161618] border-white/10 text-white placeholder:text-gray-600 resize-none rounded-lg focus:border-purple-500/50 focus:ring-purple-500/20"
                rows={3}
              />
            </div>
          </div>

          {/* Control Bar - Model Selector & Settings */}
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative flex-1" ref={dropdownRef}>
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-purple-500/50 transition-all text-white text-sm"
              >
                <span className="font-medium truncate">{currentModel?.name}</span>
                <ChevronDown className={`w-4 h-4 ml-auto flex-shrink-0 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Model Dropdown */}
              {showModelDropdown && (
                <div className="absolute bottom-12 left-0 right-0 bg-[#161618] border border-white/10 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
                  {videoModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setSelectedReference(availableReferences[0]?.id || "image");
                        setShowModelDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-purple-500/20 transition-all border-b border-white/5 last:border-0 ${
                        selectedModel === model.id ? "bg-purple-500/30 text-purple-400" : "text-white/70"
                      }`}
                    >
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-white/50">{model.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reference Selector */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161618] border border-white/10">
              <button
                onClick={() => {
                  const nextRef = availableReferences[(availableReferences.findIndex((r) => r.id === selectedReference) + 1) % availableReferences.length];
                  setSelectedReference(nextRef.id);
                }}
                className="text-white/60 hover:text-white transition-colors text-sm truncate max-w-[120px]"
                title={availableReferences.find((r) => r.id === selectedReference)?.label}
              >
                {availableReferences.find((r) => r.id === selectedReference)?.label}
              </button>
            </div>

            {/* Settings Button */}
            <div className="relative" ref={settingsPanelRef}>
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-purple-500/50 transition-all text-white text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>{selectedRatio} · {selectedResolution} · {selectedDuration}</span>
              </button>

              {/* Settings Panel */}
              {showSettingsPanel && (
                <div className="absolute bottom-12 right-0 bg-[#161618] border border-white/10 rounded-lg p-4 shadow-2xl z-50 w-72">
                  {/* Ratio */}
                  <div className="mb-4">
                    <label className="text-xs text-white/60 block mb-2">Ratio</label>
                    <div className="flex flex-wrap gap-2">
                      {ratios.map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setSelectedRatio(ratio)}
                          className={`px-2 py-1 text-xs rounded border transition-all ${
                            selectedRatio === ratio
                              ? "bg-purple-500 border-purple-500 text-white"
                              : "border-white/10 text-white/60 hover:border-white/20"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resolution */}
                  <div className="mb-4">
                    <label className="text-xs text-white/60 block mb-2">Resolution</label>
                    <div className="flex gap-2">
                      {resolutions.map((res) => (
                        <button
                          key={res}
                          onClick={() => setSelectedResolution(res)}
                          className={`flex-1 px-2 py-1 text-xs rounded border transition-all ${
                            selectedResolution === res
                              ? "bg-purple-500 border-purple-500 text-white"
                              : "border-white/10 text-white/60 hover:border-white/20"
                          }`}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="text-xs text-white/60 block mb-2">Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                      {durations.map((dur) => (
                        <button
                          key={dur}
                          onClick={() => setSelectedDuration(dur)}
                          className={`px-1.5 py-1 text-xs rounded border transition-all ${
                            selectedDuration === dur
                              ? "bg-purple-500 border-purple-500 text-white"
                              : "border-white/10 text-white/60 hover:border-white/20"
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
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 px-3 py-1 whitespace-nowrap text-xs">
              <Zap className="w-3 h-3 mr-1" />
              88 Credits
            </Badge>

            {/* Generate Button */}
            <Button className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]">
              <Send className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}