import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { ModelSelector, ModelOption } from "@/components/ModelSelector";
import { ImageIcon, Video, Clock, Monitor, Gauge, Upload, X, Check, Loader2, Wand2, Maximize2, Sparkles } from "lucide-react";
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
  { id: "kling-3.0", name: "Kling 3.0", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, useDurationSlider: true, durationRange: [3, 15], aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], qualities: ["720p", "1080p"], credits: 20, maxBatch: 1 },
  { id: "kling-2.6", name: "Kling 2.6", logo: "/logos/kling.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 18, maxBatch: 1 },
  { id: "sora-2-pro-max", name: "Sora 2 Pro Max", logo: "/logos/sora.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 35, maxBatch: 1 },
  { id: "sora-2-pro", name: "Sora 2 Pro", logo: "/logos/sora.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 32, maxBatch: 1 },
  { id: "veo-3.1-pro-max", name: "Veo 3.1 Pro Max", logo: "/logos/veo.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "21:9", "4:3", "3:4"], durations: [5, 10, 15, 20], qualities: ["720p", "1080p"], credits: 28, maxBatch: 1 },
  { id: "veo-3.1-pro", name: "Veo 3.1 Pro", logo: "/logos/veo.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [5, 10, 15], qualities: ["720p", "1080p"], credits: 25, maxBatch: 1 },
  { id: "runway-gen3-alpha", name: "Runway Gen-3 Alpha", logo: "/logos/runway.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 18, maxBatch: 1 },
  { id: "luma-1.6", name: "Luma Dream Machine 1.6", logo: "/logos/luma.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"], durations: [5], qualities: ["720p", "1080p"], credits: 15, maxBatch: 1 },
  { id: "minimax-02", name: "MiniMax 02", logo: "/logos/minimax.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [6], qualities: ["720p", "1080p"], credits: 14, maxBatch: 1 },
  { id: "hunyuan-1.0", name: "Hunyuan Video", logo: "/logos/hunyuan.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 8], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", logo: "/logos/seedance.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: false, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10, 12], qualities: ["720p", "1080p"], credits: 20, maxBatch: 1 },
  { id: "wan-2.2", name: "Wan 2.2", logo: "/logos/wan.svg", supportsStartFrame: true, supportsEndFrame: true, supportsElements: false, supportsVideo: false, supportsAudioToggle: false, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
  { id: "ltx-2-19b", name: "LTX-2-19B", logo: "/logos/ltx.svg", supportsStartFrame: true, supportsEndFrame: false, supportsElements: false, supportsVideo: true, supportsAudioToggle: true, aspectRatios: ["16:9", "9:16", "1:1"], durations: [5, 10], qualities: ["720p", "1080p"], credits: 16, maxBatch: 1 },
];

export default function VideoGenerate() {
  const [selectedModel, setSelectedModel] = useState("kling-3.0");
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
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.model && typeof router.query.model === "string") {
      const exists = videoModels.some(m => m.id === router.query.model);
      if (exists) {
        setSelectedModel(router.query.model);
      }
    }
  }, [router.isReady, router.query.model]);

  useEffect(() => {
    const close = () => { setShowRatioDropdown(false); setShowDurationDropdown(false); setShowQualityDropdown(false); };
    if (showRatioDropdown || showDurationDropdown || showQualityDropdown) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [showRatioDropdown, showDurationDropdown, showQualityDropdown]);

  const modelOptions: ModelOption[] = videoModels.map(m => ({
    id: m.id,
    name: m.name,
    description: m.credits + " credits · " + m.durations.join("/") + "s",
    logo: m.logo,
    tier: m.credits >= 25 ? "pro" as const : "free" as const,
  }));

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
      if (startFrame) { startFrameUrl = await fileToBase64(startFrame); }
      if (endFrame) { endFrameUrl = await fileToBase64(endFrame); }

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel, prompt, aspectRatio, duration, startFrameUrl, endFrameUrl, audioEnabled: currentModel?.supportsAudioToggle ? audioEnabled : undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setGeneratedVideo(data.video.url);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.from("video_generations").insert({ user_id: session.user.id, video_url: data.video.url, prompt, model_id: selectedModel, model_name: currentModel?.name || selectedModel, aspect_ratio: aspectRatio, duration, credits_used: currentModel?.credits || 0 });
        }
      } catch (dbErr) { console.error("DB save error:", dbErr); }
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  const DropdownButton = ({ label, icon: Icon, value, isOpen, onToggle, children }: { label: string; icon: any; value: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode }) => (
    <div className="relative flex-1">
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-white text-xs hover:border-white/20 transition-all">
        <Icon className="w-3 h-3 text-white/50" />
        <span>{value}</span>
      </button>
      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 right-0 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[200px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <>
      <SEO title="AI Video Generator - Back2Life.Studio" description="Generate stunning videos with AI using Kling, Sora, Veo, and more" />

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navigation />

        {/* Top Bar: Model Selector - standardized spacing */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 pt-14">
          <div className="flex items-center justify-center px-4 py-2">
            <ModelSelector
              models={modelOptions}
              selected={selectedModel}
              onSelect={(id) => { setSelectedModel(id); setStartFrame(null); setEndFrame(null); }}
            />
          </div>
        </div>

        {/* Canvas Area - standardized padding */}
        <div className="flex-1 pt-28 pb-64 md:pb-52 relative">
          <div className="flex items-center justify-center min-h-[40vh] p-4">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
                <p className="text-xl font-light text-gray-400">Generating video...</p>
                <p className="text-sm text-gray-600 mt-2">This may take 30-60 seconds</p>
              </div>
            ) : generatedVideo ? (
              <video src={generatedVideo} controls className="max-w-full max-h-[60vh] rounded-lg shadow-2xl" />
            ) : error ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">&#9888;&#65039;</span>
                </div>
                <p className="text-xl font-light text-red-400 mb-2">Generation Failed</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-2xl font-light mb-2">Describe the video you want to create</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Prompt Builder — identical structure to image page */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/5 p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#161618] rounded-2xl p-3 border border-white/5">
              {/* Prompt */}
              <div className="mb-3 relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the video you want to create..."
                  className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[60px] resize-none focus:border-cyan-500/50 focus:ring-cyan-500/20 pr-20"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button size="sm" variant="ghost" onClick={handleEnhancePrompt} disabled={isEnhancing || !prompt.trim()} className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-400 hover:bg-white/5" title="Enhance prompt">
                    {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setExpandedPrompt(true)} className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5" title="Expand prompt">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Frame Uploads */}
              {(currentModel?.supportsStartFrame || currentModel?.supportsEndFrame) && (
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {currentModel?.supportsStartFrame && (
                      <div className="flex-shrink-0 w-16 h-16 relative">
                        {startFrame ? (
                          <div className="w-full h-full rounded-lg overflow-hidden border border-white/10 relative">
                            <img src={URL.createObjectURL(startFrame)} alt="Start" className="w-full h-full object-cover" />
                            <button onClick={() => setStartFrame(null)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all">
                            <Upload className="w-4 h-4 text-white/40" />
                            <span className="text-[9px] text-white/40 mt-0.5">START</span>
                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setStartFrame(e.target.files[0]); }} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}
                    {currentModel?.supportsEndFrame && (
                      <div className="flex-shrink-0 w-16 h-16 relative">
                        {endFrame ? (
                          <div className="w-full h-full rounded-lg overflow-hidden border border-white/10 relative">
                            <img src={URL.createObjectURL(endFrame)} alt="End" className="w-full h-full object-cover" />
                            <button onClick={() => setEndFrame(null)} className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70">
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="w-full h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all">
                            <Upload className="w-4 h-4 text-white/40" />
                            <span className="text-[9px] text-white/40 mt-0.5">END</span>
                            <input type="file" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) setEndFrame(e.target.files[0]); }} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Row: Ratio + Quality + Duration + Audio + Generate */}
              <div className="flex items-center gap-2 flex-wrap">
                <DropdownButton label="Ratio" icon={Monitor} value={aspectRatio} isOpen={showRatioDropdown} onToggle={() => { setShowRatioDropdown(!showRatioDropdown); setShowDurationDropdown(false); setShowQualityDropdown(false); }}>
                  {currentModel?.aspectRatios.map(r => (
                    <button key={r} onClick={() => { setAspectRatio(r); setShowRatioDropdown(false); }} className={"w-full px-3 py-1.5 text-left text-xs flex items-center justify-between " + (aspectRatio === r ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5")}>
                      {r} {aspectRatio === r && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </DropdownButton>

                <DropdownButton label="Quality" icon={Gauge} value={quality} isOpen={showQualityDropdown} onToggle={() => { setShowQualityDropdown(!showQualityDropdown); setShowRatioDropdown(false); setShowDurationDropdown(false); }}>
                  {currentModel?.qualities.map(q => (
                    <button key={q} onClick={() => { setQuality(q); setShowQualityDropdown(false); }} className={"w-full px-3 py-1.5 text-left text-xs flex items-center justify-between " + (quality === q ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5")}>
                      {q} {quality === q && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </DropdownButton>

                <DropdownButton label="Duration" icon={Clock} value={duration + "s"} isOpen={showDurationDropdown} onToggle={() => { setShowDurationDropdown(!showDurationDropdown); setShowRatioDropdown(false); setShowQualityDropdown(false); }}>
                  {currentModel?.durations.map(d => (
                    <button key={d} onClick={() => { setDuration(d); setShowDurationDropdown(false); }} className={"w-full px-3 py-1.5 text-left text-xs flex items-center justify-between " + (duration === d ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5")}>
                      {d}s {duration === d && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </DropdownButton>

                {currentModel?.supportsAudioToggle && (
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={"flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border " + (audioEnabled ? "bg-white/10 text-white border-white/20" : "bg-black/40 text-white/50 border-white/10")}
                  >
                    {audioEnabled ? "🔊" : "🔇"}
                  </button>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-white font-bold text-sm h-[40px] px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                  ) : (
                    <>Generate <Sparkles className="w-3.5 h-3.5" /></>
                  )}
                </button>
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
                <Button size="sm" onClick={handleEnhancePrompt} disabled={isEnhancing || !prompt.trim()} className="bg-cyan-500 text-white hover:bg-cyan-600">
                  {isEnhancing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enhancing...</> : <><Wand2 className="w-4 h-4 mr-2" />Enhance with AI</>}
                </Button>
              </DialogTitle>
            </DialogHeader>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your video in detail..." className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-cyan-500/50 focus:ring-cyan-500/20" />
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    </>
  );
}