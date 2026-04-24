import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Video, Image as ImageIcon, Volume2, ChevronDown, Settings, Send, Plus, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface ModelOption {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  tier: "free" | "pro";
}

interface ReferenceOption {
  id: string;
  name: string;
  icon: string;
}

const videoModels: ModelOption[] = [
  { id: "seedance-2.0", name: "Seedance 2.0-Fast", tier: "pro" },
  { id: "kling-3.0", name: "Kling 3.0", tier: "pro" },
  { id: "kling-3.0-omni", name: "Kling 3.0 Omni", tier: "pro" },
  { id: "kling-3.0-omni-edit", name: "Kling 3.0 Omni Edit", tier: "pro" },
  { id: "kling-motion", name: "Kling Motion Control", tier: "pro" },
  { id: "kling-2.6", name: "Kling 2.6", tier: "pro" },
  { id: "kling-2.5", name: "Kling 2.5", tier: "pro" },
  { id: "ltx-2", name: "LTX-2-19B", tier: "pro" },
  { id: "wan-2.2", name: "Wan 2.2", tier: "pro" },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", tier: "pro" },
  { id: "sora-2-pro", name: "Sora 2 Pro", tier: "pro" },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", tier: "pro" },
  { id: "veo-3.1-pro", name: "Veo 3.1 Pro", tier: "pro" },
  { id: "runway-gen3", name: "Runway Gen-3 Alpha", tier: "pro" },
  { id: "luma-1.6", name: "Luma Dream Machine 1.6", tier: "pro" },
  { id: "minimax-02", name: "MiniMax 02", tier: "pro" },
  { id: "hunyuan", name: "Hunyuan Video", tier: "pro" },
  { id: "seedance-1.5", name: "Seedance 1.5 Pro", tier: "pro" },
];

const modelReferences: Record<string, ReferenceOption[]> = {
  "seedance-2.0": [
    { id: "omni", name: "Omni Reference", icon: "🎬" },
    { id: "start-end", name: "Start/End Frame", icon: "📹" },
    { id: "image", name: "Image Reference", icon: "🖼️" },
    { id: "character", name: "Character Reference", icon: "👤" },
  ],
  "kling-3.0": [
    { id: "start-end", name: "Start/End Frame", icon: "📹" },
    { id: "image", name: "Image Reference", icon: "🖼️" },
  ],
  "kling-3.0-omni": [
    { id: "omni", name: "Omni Reference", icon: "🎬" },
    { id: "start-end", name: "Start/End Frame", icon: "📹" },
    { id: "image", name: "Image Reference", icon: "🖼️" },
  ],
  "kling-3.0-omni-edit": [
    { id: "omni", name: "Omni Reference", icon: "🎬" },
    { id: "start-end", name: "Start/End Frame", icon: "📹" },
    { id: "image", name: "Image Reference", icon: "🖼️" },
  ],
  "kling-motion": [
    { id: "start-end", name: "Start/End Frame", icon: "📹" },
    { id: "image", name: "Image Reference", icon: "🖼️" },
  ],
  "default": [
    { id: "image", name: "Image Reference", icon: "🖼️" },
  ],
};

const trendingVideos = [
  {
    title: "Model Walk in the Wind",
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
  const [mode, setMode] = useState<"video" | "image" | "audio">("video");
  const [selectedModel, setSelectedModel] = useState("seedance-2.0");
  const [selectedReference, setSelectedReference] = useState("start-end");
  const [prompt, setPrompt] = useState("");
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showRefDropdown, setShowRefDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const startFrameRef = useRef<HTMLInputElement>(null);
  const endFrameRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState({
    ratio: "21:9",
    quality: "720p",
    duration: "5s",
  });

  const currentModel = videoModels.find((m) => m.id === selectedModel);
  const references = modelReferences[selectedModel] || modelReferences["default"];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowModelDropdown(false);
        setShowRefDropdown(false);
      }
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node)
      ) {
        setShowSettings(false);
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
      <SEO
        title="Video Generation - Back2Life.Studio"
        description="Create stunning AI videos with Seedance 2.0, Kling, LTX-2, and more"
      />
      <Navigation />

      <div className="min-h-screen bg-[#0a0a0a]">
        {/* Top Create With Section */}
        <div className="sticky top-16 z-30 bg-[#0a0a0a]/95 backdrop-blur border-b border-white/5 px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-light text-white">Create with</span>
              <div className="flex gap-2">
                <Button
                  onClick={() => setMode("video")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    mode === "video"
                      ? "bg-purple-500/20 border-purple-500/50 text-white"
                      : "bg-[#161618] border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Video className="w-5 h-5" />
                  Video
                </Button>
                <Button
                  onClick={() => setMode("image")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    mode === "image"
                      ? "bg-purple-500/20 border-purple-500/50 text-white"
                      : "bg-[#161618] border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <ImageIcon className="w-5 h-5" />
                  Image
                </Button>
                <Button
                  onClick={() => setMode("audio")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                    mode === "audio"
                      ? "bg-purple-500/20 border-purple-500/50 text-white"
                      : "bg-[#161618] border-white/10 text-white/60 hover:border-white/20"
                  }`}
                >
                  <Volume2 className="w-5 h-5" />
                  Audio
                </Button>
              </div>
              <span className="text-2xl font-light text-white">today</span>
            </div>
          </div>
        </div>

        {/* Trending Videos */}
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-12">
              {trendingVideos.map((video, i) => (
                <div
                  key={i}
                  className="relative h-48 rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                  style={{
                    background: video.image,
                  }}
                >
                  <div className="absolute top-3 left-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 border border-yellow-500/30 text-yellow-200">
                      Trending
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all flex items-center justify-center">
                    <p className="text-white font-medium text-center px-4">
                      {video.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="space-y-6">
              {/* Start/End Frame Uploaders - Floating Above Text */}
              <div className="flex gap-4 max-w-xs">
                <button
                  onClick={() => startFrameRef.current?.click()}
                  className="relative w-24 h-24 rounded-xl bg-[#161618] border-2 border-dashed border-white/20 hover:border-white/40 transition-all flex flex-col items-center justify-center text-white/60 hover:text-white group"
                >
                  <input
                    ref={startFrameRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleStartFrameUpload}
                    className="hidden"
                  />
                  {startFrame ? (
                    <>
                      <img
                        src={URL.createObjectURL(startFrame)}
                        alt="Start"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs">Start</span>
                      <span className="text-xs">Frame</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => endFrameRef.current?.click()}
                  className="relative w-24 h-24 rounded-xl bg-[#161618] border-2 border-dashed border-white/20 hover:border-white/40 transition-all flex flex-col items-center justify-center text-white/60 hover:text-white group"
                >
                  <input
                    ref={endFrameRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleEndFrameUpload}
                    className="hidden"
                  />
                  {endFrame ? (
                    <>
                      <img
                        src={URL.createObjectURL(endFrame)}
                        alt="End"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs">End</span>
                      <span className="text-xs">Frame</span>
                    </>
                  )}
                </button>
              </div>

              {/* Text Input */}
              <div>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Imagine the video you want."
                  className="w-full min-h-32 bg-[#161618] border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-purple-500/50 resize-none"
                />
              </div>

              {/* Bottom Control Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                  {/* Model Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 text-white text-sm transition-all"
                    >
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />
                      <span>{currentModel?.name}</span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>

                    {showModelDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden shadow-2xl max-h-96 overflow-y-auto z-50">
                        {videoModels.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => {
                              setSelectedModel(model.id);
                              setSelectedReference(
                                (modelReferences[model.id] ||
                                  modelReferences["default"])[0].id
                              );
                              setShowModelDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-purple-500/20 border-b border-white/5 last:border-b-0 transition-all flex items-center justify-between"
                          >
                            <span>{model.name}</span>
                            {model.tier === "pro" && (
                              <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-300">
                                Pro
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reference Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowRefDropdown(!showRefDropdown)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 text-white text-sm transition-all"
                    >
                      <span>
                        {references.find((r) => r.id === selectedReference)?.icon}{" "}
                        {references.find((r) => r.id === selectedReference)?.name}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>

                    {showRefDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#1a1a1c] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                        {references.map((ref) => (
                          <button
                            key={ref.id}
                            onClick={() => {
                              setSelectedReference(ref.id);
                              setShowRefDropdown(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-all flex items-center justify-between border-b border-white/5 last:border-b-0 ${
                              selectedReference === ref.id
                                ? "bg-purple-500/20 text-white"
                                : "text-white/70 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span>
                              {ref.icon} {ref.name}
                            </span>
                            {selectedReference === ref.id && (
                              <span className="text-xs">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Settings Button */}
                  <div className="relative" ref={settingsRef}>
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 text-white text-sm transition-all"
                    >
                      <Settings className="w-4 h-4" />
                      <span>
                        {settings.ratio} · {settings.quality} · {settings.duration}
                      </span>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 w-96 bg-[#1a1a1c] border border-white/10 rounded-xl p-4 shadow-2xl z-50 space-y-4">
                        {/* Ratio */}
                        <div>
                          <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">
                            Ratio
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {["21:9", "16:9", "4:3", "1:1", "3:4", "9:16"].map(
                              (r) => (
                                <button
                                  key={r}
                                  onClick={() =>
                                    setSettings({ ...settings, ratio: r })
                                  }
                                  className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                                    settings.ratio === r
                                      ? "bg-purple-500/30 border-purple-500/50 text-white"
                                      : "bg-[#161618] border-white/10 text-white/70 hover:border-white/20"
                                  }`}
                                >
                                  {r}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {/* Resolution */}
                        <div>
                          <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">
                            Resolution
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {["480p", "720p", "1080p"].map((q) => (
                              <button
                                key={q}
                                onClick={() =>
                                  setSettings({ ...settings, quality: q })
                                }
                                className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                                  settings.quality === q
                                    ? "bg-purple-500/30 border-purple-500/50 text-white"
                                    : "bg-[#161618] border-white/10 text-white/70 hover:border-white/20"
                                }`}
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Duration */}
                        <div>
                          <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">
                            Duration
                          </p>
                          <div className="grid grid-cols-6 gap-2">
                            {[
                              "4s",
                              "5s",
                              "6s",
                              "7s",
                              "8s",
                              "9s",
                              "10s",
                              "11s",
                              "12s",
                              "13s",
                              "14s",
                              "15s",
                            ].map((d) => (
                              <button
                                key={d}
                                onClick={() =>
                                  setSettings({ ...settings, duration: d })
                                }
                                className={`p-2 rounded-lg text-xs font-medium border transition-all ${
                                  settings.duration === d
                                    ? "bg-purple-500/30 border-purple-500/50 text-white"
                                    : "bg-[#161618] border-white/10 text-white/70 hover:border-white/20"
                                }`}
                              >
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* Credit Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">50% Off</span>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white px-4 py-2 rounded-lg text-sm font-medium">
                      ✨ 88
                    </Button>
                  </div>

                  {/* Generate Button */}
                  <Button className="bg-purple-500 hover:bg-purple-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer for bottom bar */}
        <div className="h-24" />
      </div>
    </>
  );
}