import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Image as ImageIcon, Video as VideoIcon, Grid3x3, Sparkles, Upload, Mic, Eraser, Coins, ChevronDown, Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function GeneratePage() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [selectedModel, setSelectedModel] = useState("flux-pro");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("720p");
  const [duration, setDuration] = useState("6s");
  const [speed, setSpeed] = useState("Fast");
  const [plan, setPlan] = useState("Pro");
  const [batchSize, setBatchSize] = useState(1);
  
  // Generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const creditCost = batchSize * 5;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedImages([]);

      const response = await fetch(mode === "image" ? "/api/fal/image-generate" : "/api/fal/video-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
          image_size: aspectRatio === "1:1" ? "square_hd" : 
                      aspectRatio === "16:9" ? "landscape_16_9" :
                      aspectRatio === "9:16" ? "portrait_16_9" : "landscape_4_3",
          num_images: mode === "image" ? batchSize : 1,
          aspectRatio: mode === "video" ? aspectRatio : undefined,
          duration: mode === "video" ? parseInt(duration) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to generate ${mode}`);
      }

      if (mode === "image" && data.images && data.images.length > 0) {
        setGeneratedImages(data.images.map((img: any) => img.url));
      } else if (mode === "video" && data.video) {
        setGeneratedImages([data.video.url]);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || `Failed to generate ${mode}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const imageModels = [
    { id: "flux-pro", name: "FLUX Pro", icon: "⚡" },
    { id: "flux-dev", name: "FLUX Dev", icon: "⚡" },
    { id: "nano-banana-2", name: "Nano Banana", icon: "🍌" },
    { id: "stable-diffusion-3", name: "SD 3.5", icon: "🎨" },
  ];

  const videoModels = [
    { id: "kling-3.0", name: "Kling 3.0", icon: "🎬" },
    { id: "seedance-2", name: "Seedance 2.0", icon: "🌱" },
    { id: "luma-1.6", name: "Luma Dream", icon: "⚡" },
    { id: "runway-gen3", name: "Runway Gen-3", icon: "🎥" },
  ];

  const models = mode === "image" ? imageModels : videoModels;
  const currentModel = models.find(m => m.id === selectedModel) || models[0];

  return (
    <>
      <SEO title="Generate - Back2Life.Studio" description="Create AI images and videos" />
      
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
        <Navigation />
        
        {/* Main Container - Fixed Height */}
        <div className="flex-1 flex flex-col pt-16 max-w-4xl mx-auto w-full">
          
          {/* Top Toggle */}
          <div className="flex items-center justify-center py-3 px-4">
            <div className="flex items-center bg-[#1a1a1c] p-1 rounded-full border border-white/5 shadow-xl">
              <button 
                onClick={() => {
                  setMode("image");
                  setSelectedModel(imageModels[0].id);
                }}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  mode === "image" 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Image</span>
              </button>
              <button 
                onClick={() => {
                  setMode("video");
                  setSelectedModel(videoModels[0].id);
                }}
                className={`flex items-center gap-1.5 px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  mode === "video" 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <VideoIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Vid</span>
              </button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <button className="p-2 rounded-full hover:bg-white/5">
                <Grid3x3 className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Canvas Area - Flexible Height */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-[#c5f04a] mx-auto mb-3" />
                <p className="text-lg sm:text-xl font-light text-gray-400">Generating {mode}...</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-2">10-30 seconds</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="w-full h-full flex flex-col gap-3">
                <div className={`grid gap-3 flex-1 ${generatedImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {generatedImages.map((url, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-black/20">
                      {mode === "image" ? (
                        <img src={url} alt={`Generated ${idx + 1}`} className="w-full h-full object-contain" />
                      ) : (
                        <video src={url} controls className="w-full h-full object-contain" autoPlay loop />
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `generated-${Date.now()}.${mode === 'image' ? 'png' : 'mp4'}`;
                            a.click();
                          }}
                          className="bg-[#c5f04a] text-black hover:bg-[#b5e03a]"
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl sm:text-3xl">⚠️</span>
                </div>
                <p className="text-lg sm:text-xl font-light text-red-400 mb-2">Failed</p>
                <p className="text-xs sm:text-sm text-gray-500">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-xl sm:text-2xl font-light mb-2">No content yet</p>
                <p className="text-xs sm:text-sm">Use the prompt builder below to create your first {mode}</p>
              </div>
            )}
          </div>

          {/* Bottom Controls - Fixed Height, Compact */}
          <div className="p-3 sm:p-4">
            <div className="bg-[#161618] rounded-2xl p-3 sm:p-4 border border-white/5 space-y-3">
              
              {/* Model Selector + Tabs */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10 hover:bg-black/60 transition-colors flex-1 max-w-[180px]">
                  <span className="text-lg">{currentModel.icon}</span>
                  <span className="text-xs sm:text-sm font-medium truncate">{currentModel.name}</span>
                  <ChevronDown className="w-3 h-3 ml-auto flex-shrink-0" />
                </button>
                <div className="flex gap-2 ml-auto">
                  <button className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-400 hover:bg-white/5">
                    Frames
                  </button>
                  <button className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-[#c5f04a] text-black">
                    Elements
                  </button>
                </div>
              </div>

              {/* Compact Prompt */}
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe the ${mode} you want to create...`}
                className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20 text-xs sm:text-sm h-[60px] sm:h-[80px]"
              />

              {/* Media Upload Boxes */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { icon: ImageIcon, label: "IMAGE" },
                  { icon: VideoIcon, label: "VIDEO" },
                  { icon: Mic, label: "AUDIO" },
                  { icon: Eraser, label: "ERASE" },
                  { icon: Upload, label: "" },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 bg-black/20 hover:bg-black/40 transition-all flex flex-col items-center justify-center gap-1"
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white/50" />
                    {item.label && <span className="text-[8px] sm:text-[10px] text-white/30 uppercase font-medium hidden sm:block">{item.label}</span>}
                  </button>
                ))}
              </div>

              {/* Settings Pills - Horizontal Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["1:1", "16:9", "9:16", "720p", "1080p", "6s", "10s", "Fast", "Pro"].map((setting) => (
                  <button
                    key={setting}
                    onClick={() => {
                      if (["1:1", "16:9", "9:16"].includes(setting)) setAspectRatio(setting);
                      else if (["720p", "1080p"].includes(setting)) setQuality(setting);
                      else if (["6s", "10s"].includes(setting)) setDuration(setting);
                      else if (setting === "Fast") setSpeed(setting);
                      else if (setting === "Pro") setPlan(setting);
                    }}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 transition-all ${
                      (aspectRatio === setting || quality === setting || duration === setting || speed === setting || plan === setting)
                        ? "bg-white/10 text-white border border-white/20"
                        : "bg-black/40 text-white/50 border border-white/5 hover:bg-black/60"
                    }`}
                  >
                    {setting}
                  </button>
                ))}
              </div>

              {/* Generate Button + Batch */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-white/10">
                  <button
                    onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
                  >
                    −
                  </button>
                  <span className="text-xs sm:text-sm font-medium min-w-[30px] text-center">{batchSize}/4</span>
                  <button
                    onClick={() => setBatchSize(Math.min(4, batchSize + 1))}
                    className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70"
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-[#c5f04a] hover:bg-[#bcf135] disabled:bg-[#c5f04a]/50 disabled:cursor-not-allowed text-black font-bold text-sm sm:text-base py-3 sm:py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(197,240,74,0.15)] flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span className="hidden xs:inline">GENERATING...</span>
                    </>
                  ) : (
                    <>
                      <span>GENERATE</span>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="flex items-center gap-1 opacity-70">
                        <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                        {creditCost}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
}