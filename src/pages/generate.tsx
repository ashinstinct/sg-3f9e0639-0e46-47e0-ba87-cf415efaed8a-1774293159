import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Image as ImageIcon, Video, Grid3x3, Sparkles, Upload, Mic, Eraser, Coins, ChevronDown, Loader2, Download, Plus, Minus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function Generate() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [selectedModel, setSelectedModel] = useState("flux-pro");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("720p");
  const [duration, setDuration] = useState("6s");
  const [speed, setSpeed] = useState("Fast");
  const [plan, setPlan] = useState("Pro");
  const [batchSize, setBatchSize] = useState(1);
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

      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt.trim(),
          image_size: aspectRatio === "1:1" ? "square_hd" : 
                      aspectRatio === "16:9" ? "landscape_16_9" :
                      aspectRatio === "9:16" ? "portrait_16_9" : "landscape_4_3",
          num_images: batchSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images.map((img: any) => img.url));
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const imageModels = [
    { id: "flux-pro", name: "FLUX Pro", icon: "⚡" },
    { id: "flux-dev", name: "FLUX Dev", icon: "⚡" },
    { id: "flux-schnell", name: "FLUX Schnell", icon: "⚡" },
  ];

  const videoModels = [
    { id: "kling-3", name: "Kling 3.0", icon: "🎬" },
    { id: "luma", name: "Luma Dream", icon: "✨" },
    { id: "runway", name: "Runway Gen-3", icon: "🎥" },
  ];

  const currentModels = mode === "image" ? imageModels : videoModels;
  const selectedModelObj = currentModels.find(m => m.id === selectedModel) || currentModels[0];

  return (
    <>
      <SEO title="Generate - Back2Life.Studio" />
      <Navigation />
      
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Main Container - Fixed Height for Mobile */}
        <div className="h-screen flex flex-col pt-16">
          
          {/* Top Floating Toggle - Compact */}
          <div className="flex-none px-4 py-3 flex justify-center">
            <div className="inline-flex items-center bg-[#1a1a1c] p-1 rounded-full border border-white/5 shadow-xl">
              <button 
                onClick={() => setMode("image")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mode === "image" 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Image
              </button>
              <button 
                onClick={() => setMode("video")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mode === "video" 
                    ? "bg-white/10 text-white" 
                    : "text-white/50 hover:text-white/80"
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                Vid
              </button>
              <button className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/5">
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Area - Flexible */}
          <div className="flex-1 relative min-h-0 overflow-auto">
            {isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-[#c5f04a] mx-auto mb-3" />
                  <p className="text-lg font-light text-gray-400">Generating {mode}...</p>
                  <p className="text-xs text-gray-600 mt-1">10-30 seconds</p>
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
                {generatedImages.map((imageUrl, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden bg-black/20">
                    <img 
                      src={imageUrl} 
                      alt={`Generated ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = imageUrl;
                          a.download = `generated-${Date.now()}.png`;
                          a.click();
                        }}
                        className="bg-[#c5f04a] text-black hover:bg-[#b5e03a]"
                        size="sm"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <p className="text-lg font-light text-red-400">{error}</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center px-4">
                  <p className="text-xl md:text-2xl font-light mb-2 text-gray-500">No content yet</p>
                  <p className="text-xs md:text-sm text-gray-600">Use the prompt builder below to create your first {mode}</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Prompt Builder Panel - Compact & Fixed */}
          <div className="flex-none p-3 md:p-4">
            <div className="bg-[#161618] rounded-2xl p-3 md:p-4 border border-white/5 max-w-4xl mx-auto">
              
              {/* Model Selector + Tabs - Single Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="relative">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg text-sm font-medium border border-white/10 hover:border-white/20">
                    <span className="text-base">{selectedModelObj.icon}</span>
                    <span className="hidden sm:inline">{selectedModelObj.name}</span>
                    <span className="sm:hidden">{selectedModelObj.name.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                </div>
                
                <div className="flex gap-1.5">
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:bg-white/5">
                    Frames
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#c5f04a] text-black">
                    Elements
                  </button>
                </div>
              </div>

              {/* Compact Prompt Input */}
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Describe the ${mode} you want to create...`}
                className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 text-sm mb-3 min-h-[60px] max-h-[80px] resize-none focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20"
              />

              {/* Media Upload Boxes - Compact Grid */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-400 bg-black/20">
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px]">IMAGE</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-400 bg-black/20">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px]">VIDEO</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-400 bg-black/20">
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px]">AUDIO</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-400 bg-black/20">
                  <Eraser className="w-4 h-4" />
                  <span className="hidden sm:inline text-[10px]">ERASE</span>
                </button>
                <button className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-400 bg-black/20">
                  <Upload className="w-4 h-4" />
                </button>
              </div>

              {/* Settings Pills - Compact Horizontal Scroll */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                {["1:1", "16:9", "4:3", "9:16"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-none px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      aspectRatio === ratio
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-black/40 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
                <button className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 border border-white/10 text-gray-400">
                  720p
                </button>
                <button className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 border border-white/10 text-gray-400">
                  6s
                </button>
                <button className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 border border-white/10 text-gray-400">
                  Fast
                </button>
                <button className="flex-none px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 border border-white/10 text-gray-400">
                  Pro
                </button>
              </div>

              {/* Bottom Row: Batch Counter + Generate Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1 border border-white/10">
                  <button
                    onClick={() => setBatchSize(Math.max(1, batchSize - 1))}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-gray-400"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-medium text-gray-300 min-w-[24px] text-center">
                    {batchSize}/4
                  </span>
                  <button
                    onClick={() => setBatchSize(Math.min(4, batchSize + 1))}
                    className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 text-gray-400"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-[#c5f04a] hover:bg-[#b5e03a] disabled:bg-[#c5f04a]/50 disabled:cursor-not-allowed text-black font-bold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-[#c5f04a]/20 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="hidden sm:inline">GENERATING...</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <span>GENERATE</span>
                      <Sparkles className="w-4 h-4" />
                      <div className="flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">{creditCost}</span>
                      </div>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </>
  );
}