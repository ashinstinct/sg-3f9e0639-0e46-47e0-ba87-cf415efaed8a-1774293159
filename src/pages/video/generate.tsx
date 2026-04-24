import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { ChevronDown, Play, Image as ImageIcon, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface VideoModel {
  id: string;
  name: string;
  logo: string;
  tier: "free" | "pro";
  features: {
    audioSupport?: boolean;
    cameraMovement?: boolean;
    supports4k?: boolean;
    hasEndFrame?: boolean;
    durationRange?: [number, number];
    minDuration?: number;
    maxDuration?: number;
    aspectRatios: string[];
    resolutions: string[];
  };
  references: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
}

const videoModels: VideoModel[] = [
  {
    id: "seedance-2.0-fast",
    name: "Seedance 2.0-Fast",
    logo: "/logos/seedance.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [4, 15],
    },
    references: [
      { id: "omni", name: "Omni Reference", icon: "⚡" },
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
      { id: "character", name: "Character Reference", icon: "👤" },
    ],
  },
  {
    id: "kling-3.0",
    name: "Kling 3.0",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      cameraMovement: true,
      aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [3, 15],
    },
    references: [
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "kling-3.0-omni",
    name: "Kling 3.0 Omni",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      cameraMovement: true,
      aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [3, 15],
    },
    references: [
      { id: "omni", name: "Omni Reference", icon: "⚡" },
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "kling-3.0-omni-edit",
    name: "Kling 3.0 Omni Edit",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      cameraMovement: true,
      aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [3, 15],
    },
    references: [
      { id: "omni", name: "Omni Reference", icon: "⚡" },
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "kling-motion-control",
    name: "Kling Motion Control",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      cameraMovement: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [3, 15],
    },
    references: [
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "kling-2.6",
    name: "Kling 2.6",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p"],
      durationRange: [4, 12],
    },
    references: [
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
    ],
  },
  {
    id: "kling-2.5",
    name: "Kling 2.5",
    logo: "/logos/kling.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p"],
      durationRange: [4, 12],
    },
    references: [
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
    ],
  },
  {
    id: "ltx-2-19b",
    name: "LTX-2-19B",
    logo: "/logos/ltx.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["21:9", "16:9", "1:1", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "wan-2.2",
    name: "Wan 2.2",
    logo: "/logos/wan.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [4, 16],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "sora-2-pro-max",
    name: "Sora 2 Pro Max",
    logo: "/logos/sora.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["720p", "1080p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "sora-2-pro",
    name: "Sora 2 Pro",
    logo: "/logos/sora.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["720p", "1080p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "veo-3.1-pro-max",
    name: "Veo 3.1 Pro Max",
    logo: "/logos/veo.svg",
    tier: "pro",
    features: {
      aspectRatios: ["21:9", "16:9", "1:1", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [5, 15],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "veo-3.1-pro",
    name: "Veo 3.1 Pro",
    logo: "/logos/veo.svg",
    tier: "pro",
    features: {
      aspectRatios: ["16:9", "1:1", "9:16"],
      resolutions: ["480p", "720p"],
      durationRange: [5, 15],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "runway-gen3-alpha",
    name: "Runway Gen-3 Alpha",
    logo: "/logos/runway.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "1:1", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "luma-dream-1.6",
    name: "Luma Dream Machine 1.6",
    logo: "/logos/luma.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [5, 16],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "minimax-02",
    name: "MiniMax 02",
    logo: "/logos/minimax.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "hunyuan-video",
    name: "Hunyuan Video",
    logo: "/logos/hunyuan.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["16:9", "1:1", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [5, 20],
    },
    references: [
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
  {
    id: "seedance-1.5-pro",
    name: "Seedance 1.5 Pro",
    logo: "/logos/seedance.svg",
    tier: "pro",
    features: {
      audioSupport: true,
      aspectRatios: ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"],
      resolutions: ["480p", "720p", "1080p"],
      durationRange: [4, 15],
    },
    references: [
      { id: "omni", name: "Omni Reference", icon: "⚡" },
      { id: "frame", name: "Start/End Frame", icon: "📽️" },
      { id: "image", name: "Image Reference", icon: "🖼️" },
    ],
  },
];

const aspectRatios = ["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"];
const resolutions = ["480p", "720p", "1080p"];
const durations = ["4s", "5s", "6s", "7s", "8s", "9s", "10s", "11s", "12s", "13s", "14s", "15s"];

export default function VideoGeneratePage() {
  const [selectedModel, setSelectedModel] = useState("seedance-2.0-fast");
  const [prompt, setPrompt] = useState("");
  const [selectedRatio, setSelectedRatio] = useState("21:9");
  const [selectedResolution, setSelectedResolution] = useState("720p");
  const [selectedDuration, setSelectedDuration] = useState("5s");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showRefDropdown, setShowRefDropdown] = useState(false);
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const startFrameRef = useRef<HTMLInputElement>(null);
  const endFrameRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const currentModel = videoModels.find((m) => m.id === selectedModel);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowModelDropdown(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setStartFrame(e.target.files[0]);
    }
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setEndFrame(e.target.files[0]);
    }
  };

  return (
    <>
      <SEO title="Video Generator | Back2Life.Studio" description="Create stunning AI videos with advanced models" />
      <Navigation />
      
      <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-40">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-white mb-1">
            Create with <span className="inline-flex items-center gap-2"><Play className="w-6 h-6 fill-white" /> Video</span> today
          </h1>
        </div>

        {/* Trending Gallery */}
        <div className="max-w-6xl mx-auto px-4 mb-12">
          <div className="grid grid-cols-3 gap-4">
            {[
              { title: "Model Walk in the Wind", img: "/public/Screenshot_2026-04-24_at_11.14.33.png" },
              { title: "Fast-Paced Belly Dance", img: "/public/Screenshot_2026-04-24_at_11.14.46.png" },
              { title: "Product Story: Milk to Earnings", img: "/public/Screenshot_2026-04-24_at_11.15.06.png" },
            ].map((item, i) => (
              <div key={i} className="relative group cursor-pointer">
                <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/40" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Trending</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-sm font-light text-white">{item.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto px-4">
          {/* Start/End Frame Uploaders - Small Floating */}
          <div className="flex gap-4 mb-6">
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => startFrameRef.current?.click()}
                className="w-16 h-16 rounded-xl bg-[#161618] border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-2xl text-white/60 hover:text-white transition-all"
              >
                +
              </button>
              <span className="text-xs text-white/60">Start<br />Frame</span>
              {startFrame && <span className="text-xs text-purple-400">✓</span>}
            </div>

            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => endFrameRef.current?.click()}
                className="w-16 h-16 rounded-xl bg-[#161618] border-2 border-dashed border-white/20 hover:border-white/40 flex items-center justify-center text-2xl text-white/60 hover:text-white transition-all"
              >
                +
              </button>
              <span className="text-xs text-white/60">End<br />Frame</span>
              {endFrame && <span className="text-xs text-purple-400">✓</span>}
            </div>

            <input
              ref={startFrameRef}
              type="file"
              accept="image/*"
              onChange={handleStartFrameUpload}
              className="hidden"
            />
            <input
              ref={endFrameRef}
              type="file"
              accept="image/*"
              onChange={handleEndFrameUpload}
              className="hidden"
            />

            {/* Prompt Area */}
            <div className="flex-1">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Imagine the video you want."
                className="w-full h-32 bg-[#161618] border border-white/10 text-white placeholder:text-white/40 resize-none rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {/* Model Selector */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              onClick={() => setShowModelDropdown(!showModelDropdown)}
              className="w-full px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 flex items-center justify-between text-sm text-white"
            >
              <span className="flex items-center gap-2">
                {currentModel?.logo && <img src={currentModel.logo} alt="" className="w-4 h-4" />}
                {currentModel?.name}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showModelDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 max-h-80 overflow-y-auto bg-[#161618] border border-white/10 rounded-lg shadow-lg z-50">
                {videoModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-white hover:bg-white/5 border-b border-white/5 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      {model.logo && <img src={model.logo} alt="" className="w-4 h-4" />}
                      {model.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reference Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRefDropdown(!showRefDropdown)}
              className="px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 flex items-center gap-2 text-xs text-white"
            >
              📋 Start/End
              <ChevronDown className="w-3 h-3" />
            </button>

            {showRefDropdown && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#161618] border border-white/10 rounded-lg shadow-lg z-50">
                {currentModel?.references.map((ref) => (
                  <button
                    key={ref.id}
                    onClick={() => {
                      setShowRefDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-white hover:bg-white/5 border-b border-white/5 last:border-b-0 flex items-center gap-2"
                  >
                    <span>{ref.icon}</span>
                    {ref.name}
                    {ref.id === "frame" && <span className="ml-auto text-purple-400">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setShowSettingsPanel(!showSettingsPanel)}
              className="px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 text-xs text-white font-medium"
            >
              ⚙️ {selectedRatio} · {selectedResolution} · {selectedDuration}
            </button>

            {showSettingsPanel && (
              <div className="absolute bottom-full right-0 mb-2 w-96 bg-[#161618] border border-white/10 rounded-lg p-6 shadow-lg z-50 space-y-6">
                {/* Ratio */}
                <div>
                  <p className="text-xs text-white/60 mb-3 font-medium">Ratio</p>
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setSelectedRatio(ratio)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedRatio === ratio
                            ? "bg-purple-500 text-white"
                            : "bg-[#0a0a0a] border border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <p className="text-xs text-white/60 mb-3 font-medium">Resolution</p>
                  <div className="grid grid-cols-3 gap-2">
                    {resolutions.map((res) => (
                      <button
                        key={res}
                        onClick={() => setSelectedResolution(res)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedResolution === res
                            ? "bg-purple-500 text-white"
                            : "bg-[#0a0a0a] border border-white/10 text-white/60 hover:text-white"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-xs text-white/60 mb-3 font-medium">Duration</p>
                  <div className="grid grid-cols-4 gap-2">
                    {durations.map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setSelectedDuration(dur)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          selectedDuration === dur
                            ? "bg-purple-500 text-white"
                            : "bg-[#0a0a0a] border border-white/10 text-white/60 hover:text-white"
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

          {/* Generate Button */}
          <Button className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg font-medium shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <Sparkles className="w-4 h-4 mr-2" />
            88 Credits
          </Button>
        </div>
      </div>
    </>
  );
}