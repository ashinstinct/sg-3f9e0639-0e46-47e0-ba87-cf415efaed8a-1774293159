import { useState, useEffect, useRef } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { ImageIcon, Video, Clock, Monitor, Gauge, Upload, X, Check, Loader2, Wand2, Maximize2, Sparkles, ChevronUp, ChevronDown, Volume2, VolumeX, Layers, Image as ImageIcon2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/router";

interface VideoModelConfig {
  id: string;
  name: string;
  logo: string;
  supportsStartFrame: boolean;
  supportsEndFrame: boolean;
  supportsElements: boolean;
  supportsVideo: boolean;
  supportsAudioToggle: boolean;
  supportsOmniReference?: boolean;
  supportsImageReference?: boolean;
  supportsCharacterReference?: boolean;
  supportsCameraMovement?: boolean;
  useDurationSlider?: boolean;
  durationRange?: number[];
  maxElements?: number;
  aspectRatios: string[];
  durations: number[];
  qualities: string[];
  credits: number;
  maxBatch: number;
}

const videoModels: VideoModelConfig[] = [
  { id: "seedance-2.0", name: "Seedance 2.0", logo: "/logos/seedance.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10, 12], qualities: ["720p", "1080p"], credits: 25, maxBatch: 1 },
  { id: "kling-3.0", name: "Kling 3.0", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, useDurationSlider: true, durationRange: [3, 15], aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], qualities: ["720p", "1080p"], credits: 20, maxBatch: 1 },
  { id: "kling-3.0-omni", name: "Kling 3.0 Omni", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: true, supportsAudioToggle: true, supportsOmniReference: true, supportsImageReference: true, supportsCharacterReference: true, aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 22, maxBatch: 1 },
  { id: "kling-3.0-omni-edit", name: "Kling 3.0 Omni Edit", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: true, supportsAudioToggle: true, supportsImageReference: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 24, maxBatch: 1 },
  { id: "kling-motion-control", name: "Kling Motion Control", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, supportsCameraMovement: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 18, maxBatch: 1 },
  { id: "kling-2.6", name: "Kling 2.6", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 18, maxBatch: 1 },
  { id: "kling-2.5", name: "Kling 2.5", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "ltx-2-19b", name: "LTX Video 2", logo: "/logos/ltx.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: true, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "wan-2.2", name: "Wan 2.2", logo: "/logos/wan.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", logo: "/logos/sora.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 35, maxBatch: 1 },
  { id: "sora-2-pro", name: "Sora 2 Pro", logo: "/logos/sora.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 32, maxBatch: 1 },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", logo: "/logos/veo.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 28, maxBatch: 1 },
  { id: "veo-3.1-pro", name: "Veo 3.1 Pro", logo: "/logos/veo.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [5, 10, 15], qualities: ["720p", "1080p"], credits: 25, maxBatch: 1 },
  { id: "runway-gen3-alpha", name: "Runway Gen-3 Alpha", logo: "/logos/runway.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 18, maxBatch: 1 },
  { id: "luma-1.6", name: "Luma Dream Machine 1.6", logo: "/logos/luma.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [5], qualities: ["720p", "1080p"], credits: 15, maxBatch: 1 },
  { id: "minimax-02", name: "MiniMax 02", logo: "/logos/minimax.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [6], qualities: ["720p", "1080p"], credits: 14, maxBatch: 1 },
  { id: "hunyuan-1.0", name: "Hunyuan Video", logo: "/logos/hunyuan.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 8], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", logo: "/logos/seedance.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10, 12], qualities: ["720p", "1080p"], credits: 20, maxBatch: 1 },
];

const aspectRatioIcons: Record<string, string> = {
  "21:9": "▭",
  "16:9": "▭",
  "4:3": "▭",
  "1:1": "◻",
  "3:4": "▯",
  "9:16": "▯",
};

export default function VideoGenerate() {
  const [selectedModel, setSelectedModel] = useState("seedance-2.0");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState("720p");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // New state for the redesigned layout
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showRefDropdown, setShowRefDropdown] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.model && typeof router.query.model === "string") {
      const exists = videoModels.some(m => m.id === router.query.model);
      if (exists) setSelectedModel(router.query.model);
    }
  }, [router.isReady, router.query.model]);

  // Close panels when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsPanel(false);
        setShowModelPicker(false);
        setShowRefDropdown(false);
      }
    };
    if (showSettingsPanel || showModelPicker || showRefDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettingsPanel, showModelPicker, showRefDropdown]);

  // Reset settings when model changes
  useEffect(() => {
    const model = videoModels.find(m => m.id === selectedModel);
    if (model) {
      if (!model.aspectRatios.includes(aspectRatio)) setAspectRatio(model.aspectRatios[0]);
      if (!model.durations.includes(duration)) setDuration(model.durations[0]);
      if (!model.qualities.includes(quality)) setQuality(model.qualities[0]);
      if (!model.supportsStartFrame) setStartFrame(null);
      if (!model.supportsEndFrame) setEndFrame(null);
      if (!model.supportsAudioToggle) setAudioEnabled(true);
    }
  }, [selectedModel]);

  const currentModel = videoModels.find(m => m.id === selectedModel);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    try {
      setIsEnhancing(true);
      const res = await fetch("/api/enhance-prompt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt: prompt.trim() }) });
      const data = await res.json();
      if (data.enhancedPrompt) setPrompt(data.enhancedPrompt);
    } catch (err) { console.error(err); } finally { setIsEnhancing(false); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    try {
      setIsGenerating(true);
      setError(null);
      let startFrameUrl = null;
      let endFrameUrl = null;
      if (startFrame) startFrameUrl = await fileToBase64(startFrame);
      if (endFrame) endFrameUrl = await fileToBase64(endFrame);

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt,
          aspectRatio,
          duration,
          startFrameUrl,
          endFrameUrl,
          audioEnabled: currentModel?.supportsAudioToggle ? audioEnabled : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setGeneratedVideo(data.video.url);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("video_generations").insert({
            user_id: session.user.id,
            video_url: data.video.url,
            prompt,
            model_id: selectedModel,
            model_name: currentModel?.name || selectedModel,
            aspect_ratio: aspectRatio,
            duration,
            credits_used: currentModel?.credits || 0,
          });
        }
      } catch (dbErr) { console.error("DB save error:", dbErr); }
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  return (
    <>
      <SEO title="AI Video Generator - Back2Life.Studio" description="Generate stunning videos with AI using Kling, Sora, Veo, and more" />

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navigation />

        {/* Canvas Area */}
        <div className="flex-1 pt-14 pb-52 md:pb-48 relative">
          <div className="flex items-center justify-center min-h-[50vh] p-4">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
                <p className="text-xl font-light text-gray-400">Generating video...</p>
                <p className="text-sm text-gray-600 mt-2">This may take 30-60 seconds</p>
              </div>
            ) : generatedVideo ? (
              <video src={generatedVideo} controls autoPlay loop className="max-w-full max-h-[65vh] rounded-xl shadow-2xl" />
            ) : error ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-xl font-light text-red-400 mb-2">Generation Failed</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-600">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-light">Describe the video you want to create</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Prompt Builder */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5">
          {/* Settings Panel - Pops Up Above Bottom Bar */}
          {showSettingsPanel && (
            <div ref={settingsRef} className="absolute bottom-full left-0 right-0 bg-[#141416] border-b border-white/10 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
              <div className="max-w-4xl mx-auto p-4 space-y-4">
                {/* Ratio Row */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Ratio</p>
                  <div className="flex gap-2 flex-wrap">
                    {currentModel?.aspectRatios.map(r => (
                      <button key={r} onClick={() => setAspectRatio(r)} className={
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-sm " +
                        (aspectRatio === r ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-black/30 border-white/10 text-white/60 hover:border-white/25")
                      }>
                        <span className="text-base leading-none">{aspectRatioIcons[r] || "▭"}</span>
                        <span>{r}</span>
                        {aspectRatio === r && <Check className="w-3 h-3 ml-1 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Row */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Resolution</p>
                  <div className="flex gap-2">
                    {currentModel?.qualities.map(q => (
                      <button key={q} onClick={() => setQuality(q)} className={
                        "px-4 py-2 rounded-lg border transition-all text-sm " +
                        (quality === q ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-black/30 border-white/10 text-white/60 hover:border-white/25")
                      }>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration Row */}
                <div>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-medium">Duration</p>
                  <div className="flex gap-2 flex-wrap">
                    {currentModel?.durations.map(d => (
                      <button key={d} onClick={() => setDuration(d)} className={
                        "px-3 py-2 rounded-lg border transition-all text-sm min-w-[48px] " +
                        (duration === d ? "bg-purple-500/20 border-purple-500/50 text-white" : "bg-black/30 border-white/10 text-white/60 hover:border-white/25")
                      }>
                        {d}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Model Picker Panel - Pops Up Above Everything */}
          {showModelPicker && (
            <div ref={settingsRef} className="absolute bottom-full left-0 right-0 bg-[#141416] border-b border-white/10 shadow-2xl max-h-[55vh] overflow-y-auto">
              <div className="max-w-2xl mx-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">Model</h3>
                  <span className="text-xs text-gray-500">Selected: {currentModel?.name}</span>
                </div>
                {/* Quick filters */}
                <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                  <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30 whitespace-nowrap">Trending</span>
                  {(currentModel?.supportsAudioToggle || videoModels.some(m => m.supportsAudioToggle)) && (
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-white/60 text-xs border border-white/10 whitespace-nowrap">With Audio</span>
                  )}
                  <span className="px-2.5 py-1 rounded-md bg-white/5 text-white/60 text-xs border border-white/10 whitespace-nowrap">4K</span>
                  {currentModel?.durations.some(d => d >= 10) && (
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-white/60 text-xs border border-white/10 whitespace-nowrap">≥10s</span>
                  )}
                  {(currentModel?.supportsEndFrame || currentModel?.supportsStartFrame) && (
                    <span className="px-2.5 py-1 rounded-md bg-white/5 text-white/60 text-xs border border-white/10 whitespace-nowrap">End Frame</span>
                  )}
                </div>
                {/* Model list */}
                <div className="space-y-1">
                  {videoModels.map(model => (
                    <button key={model.id} onClick={() => { setSelectedModel(model.id); setShowModelPicker(false); }} className={
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group " +
                      (selectedModel === model.id ? "bg-purple-500/15 border border-purple-500/30" : "hover:bg-white/5 border border-transparent")
                    }>
                      <img src={model.logo} alt="" className="w-8 h-8 rounded-lg object-contain bg-white/5 p-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={"text-sm font-medium " + (selectedModel === model.id ? "text-white" : "text-white/80")}>{model.name}</span>
                          {model.credits >= 28 && <span className="px-1.5 py-0.5 rounded text-[9px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">PRO</span>}
                        </div>
                        <p className="text-xs text-white/40 truncate">{model.durations.join("/")}{model.durations.length > 1 ? "s" : "s"} · {model.aspectRatios[0]} · {model.credits} cr</p>
                      </div>
                      {selectedModel === model.id && <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Bottom Bar */}
          <div className="max-w-4xl mx-auto p-3 md:p-4">
            <div className="flex items-end gap-3">
              {/* Floating Frame Uploaders - Left Side */}
              {(currentModel?.supportsStartFrame || currentModel?.supportsEndFrame) && (
                <div className="flex-shrink-0 flex flex-col gap-2 pb-1">
                  {currentModel?.supportsStartFrame && (
                    <div className="relative group">
                      {startFrame ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 cursor-pointer relative" onClick={() => document.getElementById("start-frame-input")?.click()}>
                          <img src={URL.createObjectURL(startFrame)} alt="" className="w-full h-full object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); setStartFrame(null); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                          <Plus className="w-4 h-4 text-white/40" />
                          <span className="text-[8px] text-white/35 mt-0.5 leading-tight text-center">Start<br/>Frame</span>
                          <input id="start-frame-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setStartFrame(e.target.files[0])} className="hidden" />
                        </label>
                      )}
                    </div>
                  )}

                  {currentModel?.supportsEndFrame && (
                    <div className="relative group">
                      {endFrame ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/20 cursor-pointer relative" onClick={() => document.getElementById("end-frame-input")?.click()}>
                          <img src={URL.createObjectURL(endFrame)} alt="" className="w-full h-full object-cover" />
                          <button onClick={(e) => { e.stopPropagation(); setEndFrame(null); }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-12 h-12 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                          <Plus className="w-4 h-4 text-white/40" />
                          <span className="text-[8px] text-white/35 mt-0.5 leading-tight text-center">End<br/>Frame</span>
                          <input id="end-frame-input" type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setEndFrame(e.target.files[0])} className="hidden" />
                        </label>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Prompt Area - Center */}
              <div className="flex-1 relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Imagine the video you want..."
                  className="w-full bg-[#161618] border-white/10 text-white placeholder:text-gray-600 min-h-[48px] max-h-[160px] resize-none focus:border-purple-500/50 focus:ring-purple-500/20 pr-24 rounded-xl"
                  rows={1}
                />
                <div className="absolute right-2 top-2 flex gap-0.5">
                  <Button size="sm" variant="ghost" onClick={handleEnhancePrompt} disabled={isEnhancing || !prompt.trim()} className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-white/5" title="Enhance prompt">
                    {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setExpandedPrompt(true)} className="h-8 w-8 p-0 text-white/40 hover:text-white hover:bg-white/5" title="Expand">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="flex items-center gap-2 mt-2">
              {/* Model Selector Button */}
              <button onClick={() => { setShowModelPicker(!showModelPicker); setShowSettingsPanel(false); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 transition-all">
                <img src={currentModel?.logo} alt="" className="w-4 h-4 rounded" />
                <span className="text-xs text-white/80 font-medium truncate max-w-[120px]">{currentModel?.name}</span>
                {showModelPicker ? <ChevronDown className="w-3 h-3 text-white/50" /> : <ChevronUp className="w-3 h-3 text-white/50" />}
              </button>

              {/* Reference Type Dropdown (for models that support it) */}
              {(currentModel?.supportsOmniReference || currentModel?.supportsImageReference || currentModel?.supportsCharacterReference) && (
                <div className="relative">
                  <button onClick={(e) => { e.stopPropagation(); setShowRefDropdown(!showRefDropdown); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 transition-all text-xs text-white/70">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Start/End Frame</span>
                    <ChevronUp className="w-3 h-3 text-white/40" />
                  </button>
                  {showRefDropdown && (
                    <div className="absolute bottom-full mb-1 left-0 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 min-w-[180px]">
                        {currentModel?.supportsOmniReference && (
                          <button className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" />Omni Reference
                          </button>
                        )}
                        {currentModel?.supportsImageReference && (
                          <button className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2">
                            <ImageIcon2 className="w-3.5 h-3.5" />Image Reference
                          </button>
                        )}
                        {currentModel?.supportsCharacterReference && (
                          <button className="w-full px-3 py-2 text-left text-xs text-white/70 hover:bg-white/5 flex items-center gap-2">
                            <User className="w-3.5 h-3.5" />Character Reference
                          </button>
                        )}
                      </div>
                    )}
                </div>
              )}

              {/* Settings Toggle Button */}
              <button onClick={() => { setShowSettingsPanel(!showSettingsPanel); setShowModelPicker(false); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161618] border border-white/10 hover:border-white/20 transition-all text-xs text-white/70">
                <Monitor className="w-3.5 h-3.5" />
                <span>{aspectRatio}</span>
              </button>

              <span className="text-xs text-white/30 hidden sm:inline">{quality}</span>
              <span className="text-xs text-white/30 hidden sm:inline">{duration}s</span>

              {/* Audio Toggle */}
              {currentModel?.supportsAudioToggle && (
                <button onClick={() => setAudioEnabled(!audioEnabled)} className="ml-auto flex-shrink-0 p-1.5 rounded-lg hover:bg-white/5 transition-all" title={audioEnabled ? "Mute audio" : "Enable audio"}>
                  {audioEnabled ? <Volume2 className="w-4 h-4 text-white/50" /> : <VolumeX className="w-4 h-4 text-white/30" />}
                </button>
              )}

              {/* Generate Button */}
              <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm h-[38px] px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                ) : (
                  <>Generate <Sparkles className="w-3.5 h-3.5" /></>
                )}
              </button>

              {/* Credits Badge */}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-bold text-purple-300">{currentModel?.credits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Prompt Modal */}
        <Dialog open={expandedPrompt} onOpenChange={setExpandedPrompt}>
          <DialogContent className="max-w-3xl bg-[#161618] border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center justify-between">
                <span>Prompt Editor</span>
                <Button size="sm" onClick={handleEnhancePrompt} disabled={isEnhancing || !prompt.trim()} className="bg-purple-500 text-white hover:bg-purple-400">
                  {isEnhancing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enhancing...</> : <><Wand2 className="w-4 h-4 mr-2" />Enhance with AI</>}
                </Button>
              </DialogTitle>
            </DialogHeader>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video in detail..." className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-purple-500/50 focus:ring-purple-500/20" />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

// Plus icon component
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}