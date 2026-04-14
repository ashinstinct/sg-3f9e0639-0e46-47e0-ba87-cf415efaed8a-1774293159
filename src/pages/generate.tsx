import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { 
  Image as ImageIcon, 
  Video, 
  Grid3x3, 
  Sparkles, 
  Upload, 
  Mic, 
  Eraser, 
  Coins, 
  ChevronDown, 
  Loader2, 
  Download, 
  Plus, 
  Minus, 
  Maximize, 
  MonitorPlay, 
  Clock,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Generate() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [selectedModel, setSelectedModel] = useState("flux-pro");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [quality, setQuality] = useState("720p");
  const [duration, setDuration] = useState("6s");
  const [speed, setSpeed] = useState("Fast");
  const [plan, setPlan] = useState("Pro");
  const [batchSize, setBatchSize] = useState(1);
  
  const imageModels = [
    { id: "flux-pro", name: "FLUX Pro", icon: "⚡" },
    { id: "flux-dev", name: "FLUX Dev", icon: "⚡" },
    { id: "flux-schnell", name: "FLUX Schnell", icon: "⚡" },
    { id: "nano-banana-2", name: "Nano Banana 2", icon: "🍌" },
    { id: "stable-diffusion-3", name: "Stable Diffusion 3", icon: "🎨" },
  ];
  
  // Generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDecreaseBatch = () => setBatchSize(prev => Math.max(1, prev - 1));
  const handleIncreaseBatch = () => setBatchSize(prev => Math.min(4, prev + 1));

  const creditCost = batchSize * 125;

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
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#c5f04a]/30">
      <SEO title="Generate - Create Image & Video" />
      
      {/* Navigation overlay */}
      <div className="relative z-50">
        <Navigation />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pt-24 sm:pt-28">
        
        {/* Top Floating Toggle */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 flex items-center bg-[#1a1a1c] p-1.5 rounded-full border border-white/5 shadow-xl">
          <button 
            onClick={() => setActiveMode("image")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeMode === "image" 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Image
          </button>
          <button 
            onClick={() => setActiveMode("vid")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
              activeMode === "vid" 
                ? "bg-white/10 text-white shadow-sm" 
                : "text-white/50 hover:text-white/80"
            }`}
          >
            <Video className="w-4 h-4" />
            Vid
          </button>
          
          {/* Circular slider dot - decorative element from the screenshot */}
          <div className="w-8 h-8 rounded-full bg-[#c5f04a] ml-3 flex items-center justify-center shadow-[0_0_15px_rgba(197,240,74,0.3)] cursor-pointer hover:scale-105 transition-transform">
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-1.5 h-1.5 rounded-sm bg-black/80"></div>
              <div className="w-1.5 h-1.5 rounded-sm bg-black/80"></div>
              <div className="w-1.5 h-1.5 rounded-sm bg-black/80"></div>
              <div className="w-1.5 h-1.5 rounded-sm bg-black/80"></div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
          {isGenerating ? (
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#c5f04a] mx-auto mb-4" />
              <p className="text-xl font-light text-gray-400">Generating {mode === "image" ? "image" : "video"}...</p>
              <p className="text-sm text-gray-600 mt-2">This may take 10-30 seconds</p>
            </div>
          ) : generatedImages.length > 0 ? (
            <div className="w-full h-full flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <p className="text-xl font-light text-red-400 mb-2">Generation Failed</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-2xl font-light mb-2">No content yet</p>
              <p className="text-sm">Use the prompt builder below to create your first {mode === "image" ? "image" : "video"}</p>
            </div>
          )}
        </div>

        {/* Prompt Builder Bottom Panel */}
        <div className="w-full max-w-2xl mx-auto mt-auto pb-0 sm:pb-6 px-0 sm:px-4">
          <div className="bg-[#161618] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 flex flex-col gap-5 shadow-2xl relative overflow-hidden">
            
            {/* Header: Model & Tabs */}
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm font-medium text-white hover:text-white bg-white/5 hover:bg-white/10 transition-colors px-3 py-1.5 rounded-lg border border-white/5">
                <Wand2 className="w-4 h-4 text-[#8a8a93]" />
                Seedance 2.0
                <ChevronDown className="w-4 h-4 text-white/40 ml-1" />
              </button>

              <div className="flex bg-[#0a0a0a] rounded-full p-1 border border-white/5">
                <button className="px-4 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition-colors rounded-full">
                  Frames
                </button>
                <button className="px-4 py-1.5 text-xs font-medium bg-[#c5f04a] text-black rounded-full shadow-sm">
                  Elements
                </button>
              </div>
            </div>

            <div className="bg-[#1a1a1c] rounded-2xl p-4 border border-white/5">
              
              {/* Media Inputs Row */}
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                <button className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-dashed border-white/15 hover:border-[#c5f04a]/50 hover:bg-[#c5f04a]/5 transition-all aspect-square">
                  <ImageIcon className="w-5 h-5 text-white/40 group-hover:text-[#c5f04a] transition-colors" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 group-hover:text-[#c5f04a] tracking-wider">IMAGE</span>
                </button>
                <button className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-dashed border-white/15 hover:border-[#c5f04a]/50 hover:bg-[#c5f04a]/5 transition-all aspect-square">
                  <Video className="w-5 h-5 text-white/40 group-hover:text-[#c5f04a] transition-colors" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 group-hover:text-[#c5f04a] tracking-wider">VIDEO</span>
                </button>
                <button className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-dashed border-white/15 hover:border-[#c5f04a]/50 hover:bg-[#c5f04a]/5 transition-all aspect-square">
                  <Mic className="w-5 h-5 text-white/40 group-hover:text-[#c5f04a] transition-colors" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 group-hover:text-[#c5f04a] tracking-wider">AUDIO</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors aspect-square text-white/40 hover:text-white/80">
                  <Eraser className="w-5 h-5" />
                </button>
              </div>

              {/* Prompt Input */}
              <div className="mb-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === "image" ? "Describe the image you want to create..." : "Describe the video you want to create..."}
                  className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[100px] resize-none focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5">
                  Frames
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-[#c5f04a] text-black">
                  Elements
                </button>
              </div>

              {/* Settings Pills Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-1 px-1">
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-white/70 whitespace-nowrap">
                  <Maximize className="w-3.5 h-3.5 opacity-60" /> 16:9
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-white/70 whitespace-nowrap">
                  <MonitorPlay className="w-3.5 h-3.5 opacity-60" /> 720p
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-white/70 whitespace-nowrap">
                  <Clock className="w-3.5 h-3.5 opacity-60" /> 6s
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-white/70 whitespace-nowrap">
                  Fast
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium text-white/70 whitespace-nowrap">
                  Pro
                </button>
              </div>

              {/* Bottom Controls Row */}
              <div className="flex items-center justify-between gap-3 mt-1">
                <div className="flex items-center bg-white/5 rounded-xl border border-white/5 h-[48px]">
                  <button 
                    onClick={handleDecreaseBatch}
                    className="h-full px-3.5 flex items-center text-white/40 hover:text-white hover:bg-white/5 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium w-8 text-center text-white/80">{batchSize}/4</span>
                  <button 
                    onClick={handleIncreaseBatch}
                    className="h-full px-3.5 flex items-center text-white/40 hover:text-white hover:bg-white/5 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex-1 bg-[#c5f04a] text-black rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-3 hover:bg-[#b5e03a] transition-all shadow-lg shadow-[#c5f04a]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>GENERATING...</span>
                    </>
                  ) : (
                    <>
                      <span>GENERATE</span>
                      <Sparkles className="w-5 h-5" />
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        <span className="text-sm">{creditCost}</span>
                      </div>
                    </>
                  )}
                </button>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}