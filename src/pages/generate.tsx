import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  Eraser, 
  ChevronDown, 
  Sparkles, 
  Plus, 
  Minus, 
  Maximize, 
  MonitorPlay, 
  Clock,
  Wand2
} from "lucide-react";

export default function Generate() {
  const [activeMode, setActiveMode] = useState<"image" | "vid">("vid");
  const [batchSize, setBatchSize] = useState(1);

  const handleDecreaseBatch = () => setBatchSize(prev => Math.max(1, prev - 1));
  const handleIncreaseBatch = () => setBatchSize(prev => Math.min(4, prev + 1));

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
            <VideoIcon className="w-4 h-4" />
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

        {/* Empty State / Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 mt-16 mb-auto text-center">
          <h2 className="text-xl font-medium text-white/50 mb-2">No content yet</h2>
          <p className="text-sm text-white/30 max-w-xs mx-auto">
            Use the prompt builder below to create your first {activeMode === "image" ? "image" : "video"}
          </p>
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
                  <VideoIcon className="w-5 h-5 text-white/40 group-hover:text-[#c5f04a] transition-colors" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 group-hover:text-[#c5f04a] tracking-wider">VIDEO</span>
                </button>
                <button className="group flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-dashed border-white/15 hover:border-[#c5f04a]/50 hover:bg-[#c5f04a]/5 transition-all aspect-square">
                  <Music className="w-5 h-5 text-white/40 group-hover:text-[#c5f04a] transition-colors" />
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 group-hover:text-[#c5f04a] tracking-wider">AUDIO</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors aspect-square text-white/40 hover:text-white/80">
                  <Eraser className="w-5 h-5" />
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

                <button className="flex-1 flex items-center justify-center gap-2 bg-[#c5f04a] hover:bg-[#bcf135] hover:scale-[1.02] active:scale-[0.98] text-black font-bold text-sm h-[48px] rounded-xl transition-all shadow-[0_0_20px_rgba(197,240,74,0.15)]">
                  GENERATE <Sparkles className="w-4 h-4" /> 
                  <span className="opacity-70 font-medium ml-1 tracking-wide">🪙 {125 * batchSize}</span>
                </button>
              </div>
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}