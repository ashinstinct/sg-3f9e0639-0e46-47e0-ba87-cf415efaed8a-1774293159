import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Image as ImageIcon, Video, Grid3x3, Sparkles, Upload, X, Loader2, Download, Maximize2, Wand2, Mic } from "lucide-react";

type VideoModel = {
  id: string;
  name: string;
  logo: string;
  supportsStartFrame: boolean;
  supportsEndFrame: boolean;
  supportsElements: boolean;
  supportsVideo: boolean;
  supportsAudio: boolean;
  maxElements?: number;
  aspectRatios: string[];
  durations: number[];
  credits: number;
  maxBatch: number;
};

export default function VideoGeneratePage() {
  const [mode, setMode] = useState<"image" | "video">("video");
  const [selectedModel, setSelectedModel] = useState("kling-3.0");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  
  // Generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Media uploads
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const [elementImages, setElementImages] = useState<File[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  
  // Kling Omni specific mode
  const [klingOmniMode, setKlingOmniMode] = useState<"frames" | "elements">("frames");
  
  // UI state
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Video models organized by company with correct frame support flags
  const videoModelGroups = [
    {
      company: "Kling",
      models: [
        {
          id: "kling-3.0",
          name: "Kling 3.0",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "kling-omni-3.0",
          name: "Kling Omni 3.0",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: true,
          supportsVideo: false,
          supportsAudio: false,
          maxElements: 5,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 25,
          maxBatch: 1
        },
        {
          id: "kling-motion-3.0",
          name: "Kling Motion Control 3.0",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 25,
          maxBatch: 1
        },
        {
          id: "kling-2.6",
          name: "Kling 2.6",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        },
        {
          id: "kling-2.5",
          name: "Kling 2.5",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        },
        {
          id: "kling-2.1",
          name: "Kling 2.1",
          logo: "/logos/kling.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5],
          credits: 12,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Sora",
      models: [
        {
          id: "sora-2-pro-max",
          name: "Sora 2 Pro Max",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
          durations: [5, 10, 15, 20],
          credits: 35,
          maxBatch: 1
        },
        {
          id: "sora-2-pro",
          name: "Sora 2 Pro",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
          durations: [5, 10, 15, 20],
          credits: 32,
          maxBatch: 1
        },
        {
          id: "sora-2-max",
          name: "Sora 2 Max",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21"],
          durations: [5, 10, 15, 20],
          credits: 30,
          maxBatch: 1
        },
        {
          id: "sora-2-fast",
          name: "Sora 2 Fast",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21"],
          durations: [5, 10, 15],
          credits: 25,
          maxBatch: 1
        },
        {
          id: "sora-1-turbo",
          name: "Sora 1 Turbo",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "sora-1-pro",
          name: "Sora 1 Pro",
          logo: "/logos/sora.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Veo",
      models: [
        {
          id: "veo-3.1-pro-max",
          name: "Veo 3.1 Pro Max",
          logo: "/logos/veo.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4", "21:9", "9:21"],
          durations: [5, 10, 15, 20],
          credits: 28,
          maxBatch: 1
        },
        {
          id: "veo-3.1-pro",
          name: "Veo 3.1 Pro",
          logo: "/logos/veo.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 25,
          maxBatch: 1
        },
        {
          id: "veo-3.1-fast",
          name: "Veo 3.1 Fast",
          logo: "/logos/veo.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10],
          credits: 20,
          maxBatch: 1
        },
        {
          id: "veo-3.0-pro",
          name: "Veo 3.0 Pro",
          logo: "/logos/veo.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        },
        {
          id: "veo-3.0-fast",
          name: "Veo 3.0 Fast",
          logo: "/logos/veo.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Runway",
      models: [
        {
          id: "runway-gen3-alpha",
          name: "Runway Gen-3 Alpha",
          logo: "/logos/runway.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 18,
          maxBatch: 1
        },
        {
          id: "runway-gen3-turbo",
          name: "Runway Gen-3 Turbo",
          logo: "/logos/runway.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Luma",
      models: [
        {
          id: "luma-1.6",
          name: "Luma Dream Machine 1.6",
          logo: "/logos/luma.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5],
          credits: 15,
          maxBatch: 1
        }
      ]
    },
    {
      company: "MiniMax",
      models: [
        {
          id: "minimax-02",
          name: "MiniMax 02",
          logo: "/logos/minimax.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          credits: 14,
          maxBatch: 1
        },
        {
          id: "minimax-02-fast",
          name: "MiniMax 02 Fast",
          logo: "/logos/minimax.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          credits: 12,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Hunyuan",
      models: [
        {
          id: "hunyuan-1.0",
          name: "Hunyuan Video",
          logo: "/logos/hunyuan.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 8],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Grok",
      models: [
        {
          id: "grok-1.0",
          name: "Grok Imagine Video",
          logo: "/logos/grok.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 15],
          credits: 22,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Seedance",
      models: [
        {
          id: "seedance-1.5-pro",
          name: "Seedance 1.5 Pro",
          logo: "/logos/seedance.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 12],
          credits: 20,
          maxBatch: 1
        }
      ]
    },
    {
      company: "LTX",
      models: [
        {
          id: "ltx-2-19b",
          name: "LTX-2-19B",
          logo: "/logos/ltx.svg",
          supportsStartFrame: true,
          supportsEndFrame: false,
          supportsElements: false,
          supportsVideo: true,
          supportsAudio: true,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    },
    {
      company: "Wan",
      models: [
        {
          id: "wan-2.2",
          name: "Wan 2.2",
          logo: "/logos/wan.svg",
          supportsStartFrame: true,
          supportsEndFrame: true,
          supportsElements: false,
          supportsVideo: false,
          supportsAudio: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          credits: 16,
          maxBatch: 1
        }
      ]
    }
  ];

  // Flatten for easy lookup
  const videoModels = videoModelGroups.flatMap(group => group.models);
  const currentModel = videoModels.find(m => m.id === selectedModel) || videoModels[0];
  const creditCost = currentModel.credits;

  // Auto-adjust duration if current is not available in new model
  useEffect(() => {
    if (!currentModel.durations.includes(duration)) {
      setDuration(currentModel.durations[0]);
    }
  }, [selectedModel, currentModel, duration]);

  // Reset uploads when changing models
  useEffect(() => {
    setStartFrame(null);
    setEndFrame(null);
    setElementImages([]);
    setUploadedVideo(null);
    setUploadedAudio(null);
    setKlingOmniMode("frames");
  }, [selectedModel]);

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStartFrame(file);
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEndFrame(file);
  };

  const handleElementUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxElements = currentModel.maxElements || 5;
    const remainingSlots = maxElements - elementImages.length;
    const newElements = files.slice(0, remainingSlots);
    setElementImages([...elementImages, ...newElements]);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedVideo(file);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedAudio(file);
  };

  const removeElement = (index: number) => {
    setElementImages(elementImages.filter((_, i) => i !== index));
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    try {
      setIsEnhancing(true);
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() })
      });

      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err) {
      console.error("Failed to enhance prompt:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);
      setGeneratedVideo(null);

      const formData = new FormData();
      formData.append("model", selectedModel);
      formData.append("prompt", prompt.trim());
      formData.append("aspect_ratio", aspectRatio);
      formData.append("duration", duration.toString());
      
      // Kling Omni mode
      if (selectedModel === "kling-omni-3.0") {
        formData.append("mode", klingOmniMode);
        if (klingOmniMode === "elements") {
          elementImages.forEach((img, idx) => {
            formData.append(`element_${idx}`, img);
          });
        } else {
          if (startFrame) formData.append("start_frame", startFrame);
          if (endFrame) formData.append("end_frame", endFrame);
        }
      } else {
        if (startFrame) formData.append("start_frame", startFrame);
        if (endFrame) formData.append("end_frame", endFrame);
      }
      
      if (uploadedVideo) formData.append("video", uploadedVideo);
      if (uploadedAudio) formData.append("audio", uploadedAudio);

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video");
      }

      if (data.video?.url) {
        setGeneratedVideo(data.video.url);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO title="AI Video Generator - Back2Life.Studio" description="Generate videos with AI using Kling, Luma, Runway, Sora, and more" />
      
      <div className="min-h-screen bg-background flex">
        <Navigation />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Floating Toggle */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center bg-[#1a1a1c] p-1.5 rounded-full border border-white/5 shadow-xl">
            <button 
              onClick={() => window.location.href = '/images/generate'}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all text-white/50 hover:text-white/80"
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
            <button 
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all bg-white/10 text-white shadow-sm"
            >
              <Video className="w-4 h-4" />
              Vid
            </button>
            <button className="ml-1 p-2 rounded-full text-white/50 hover:text-white/80 hover:bg-white/5">
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-[#0a0a0a] relative mt-16">
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
              {isGenerating ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-[#c5f04a] mx-auto mb-4" />
                  <p className="text-xl font-light text-gray-400">Generating video...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 30-90 seconds</p>
                </div>
              ) : generatedVideo ? (
                <div className="w-full h-full max-w-4xl">
                  <div className="relative group rounded-lg overflow-hidden bg-black/20 h-full">
                    <video 
                      src={generatedVideo} 
                      controls 
                      autoPlay 
                      loop
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = generatedVideo;
                          a.download = `generated-video-${Date.now()}.mp4`;
                          a.click();
                        }}
                        className="bg-[#c5f04a] text-black hover:bg-[#b5e03a]"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
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
                  <p className="text-sm">Use the prompt builder below to create your first video</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Prompt Builder Panel */}
          <div className="bg-[#0a0a0a] border-t border-white/5 p-3 md:p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#161618] rounded-2xl p-3 md:p-4 border border-white/5">
                
                {/* Model Selector */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="model-select flex-1 bg-[#0d0d0d] text-white border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20 outline-none"
                  >
                    {videoModelGroups.map(group => (
                      <optgroup key={group.company} label={group.company} className="optgroup-label">
                        {group.models.map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name} - 🪙{model.credits}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Kling Omni Mode Switcher */}
                {selectedModel === "kling-omni-3.0" && (
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => setKlingOmniMode("frames")}
                      className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        klingOmniMode === "frames"
                          ? "bg-[#c5f04a] text-black"
                          : "bg-black/40 text-white/50 hover:text-white border border-white/10"
                      }`}
                    >
                      Frames Mode
                    </button>
                    <button
                      onClick={() => setKlingOmniMode("elements")}
                      className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                        klingOmniMode === "elements"
                          ? "bg-[#c5f04a] text-black"
                          : "bg-black/40 text-white/50 hover:text-white border border-white/10"
                      }`}
                    >
                      Elements Mode
                    </button>
                  </div>
                )}

                {/* Prompt with Expand Button */}
                <div className="mb-3 relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the video you want to create..."
                    className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[70px] resize-none focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20 pr-20"
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className="h-8 w-8 p-0 text-[#c5f04a] hover:text-[#b5e03a] hover:bg-white/5"
                      title="Enhance prompt with AI"
                    >
                      {isEnhancing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedPrompt(true)}
                      className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5"
                      title="Expand prompt window"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Media Upload Boxes (dynamic based on model and mode) */}
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {/* Kling Omni Elements Mode */}
                    {selectedModel === "kling-omni-3.0" && klingOmniMode === "elements" && (
                      <>
                        {elementImages.map((img, idx) => (
                          <div key={`elem-${idx}`} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                            <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={() => removeElement(idx)}
                              className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {elementImages.length < (currentModel.maxElements || 5) && (
                          <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                            <Upload className="w-5 h-5 text-white/40" />
                            <span className="text-[10px] text-white/40 mt-1">ELEMENT</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleElementUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </>
                    )}

                    {/* Standard Frame Mode (for all models that support frames) */}
                    {(selectedModel !== "kling-omni-3.0" || klingOmniMode === "frames") && (
                      <>
                        {/* Start Frame */}
                        {currentModel.supportsStartFrame && (
                          startFrame ? (
                            <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                              <img src={URL.createObjectURL(startFrame)} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setStartFrame(null)}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-white/80 text-center py-0.5">
                                START
                              </div>
                            </div>
                          ) : (
                            <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                              <Upload className="w-5 h-5 text-white/40" />
                              <span className="text-[10px] text-white/40 mt-1">START</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleStartFrameUpload}
                                className="hidden"
                              />
                            </label>
                          )
                        )}

                        {/* End Frame (only if model supports it) */}
                        {currentModel.supportsEndFrame && (
                          endFrame ? (
                            <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                              <img src={URL.createObjectURL(endFrame)} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setEndFrame(null)}
                                className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[8px] text-white/80 text-center py-0.5">
                                END
                              </div>
                            </div>
                          ) : (
                            <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                              <Upload className="w-5 h-5 text-white/40" />
                              <span className="text-[10px] text-white/40 mt-1">END</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEndFrameUpload}
                                className="hidden"
                              />
                            </label>
                          )
                        )}
                      </>
                    )}

                    {/* Video upload (LTX-2 only) */}
                    {currentModel.supportsVideo && (
                      uploadedVideo ? (
                        <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                          <video src={URL.createObjectURL(uploadedVideo)} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setUploadedVideo(null)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                          <Video className="w-5 h-5 text-white/40" />
                          <span className="text-[10px] text-white/40 mt-1">VIDEO</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                        </label>
                      )
                    )}

                    {/* Audio upload (Sora, Veo, LTX-2) */}
                    {currentModel.supportsAudio && (
                      uploadedAudio ? (
                        <div className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-black/40 flex flex-col items-center justify-center">
                          <Mic className="w-6 h-6 text-[#c5f04a]" />
                          <span className="text-[8px] text-white/60 mt-1 truncate w-full px-1 text-center">{uploadedAudio.name}</span>
                          <button
                            onClick={() => setUploadedAudio(null)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                          <Mic className="w-5 h-5 text-white/40" />
                          <span className="text-[10px] text-white/40 mt-1">AUDIO</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioUpload}
                            className="hidden"
                          />
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Settings Pills (Aspect Ratio + Duration) */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                  {currentModel.aspectRatios.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        aspectRatio === ratio
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/5"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                  {currentModel.durations.map(dur => (
                    <button
                      key={dur}
                      onClick={() => setDuration(dur)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        duration === dur
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-black/20 text-white/50 border border-white/5 hover:bg-white/5"
                      }`}
                    >
                      {dur}s
                    </button>
                  ))}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#c5f04a] hover:bg-[#bcf135] disabled:bg-[#c5f04a]/50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] text-black font-bold text-sm h-[48px] rounded-xl transition-all shadow-[0_0_20px_rgba(197,240,74,0.15)]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        GENERATING...
                      </>
                    ) : (
                      <>
                        GENERATE <Sparkles className="w-4 h-4" /> 
                        <span className="opacity-70 font-medium tracking-wide">🪙 {creditCost}</span>
                      </>
                    )}
                  </button>
                </div>
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
                <Button
                  size="sm"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="bg-[#c5f04a] text-black hover:bg-[#b5e03a]"
                >
                  {isEnhancing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enhancing...</>
                  ) : (
                    <><Wand2 className="w-4 h-4 mr-2" />Enhance with AI</>
                  )}
                </Button>
              </DialogTitle>
            </DialogHeader>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your video in detail..."
              className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20"
            />
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Dark mode select dropdown styling */
          .model-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            padding-right: 2.5rem;
          }
          
          .model-select option {
            background-color: #0d0d0d;
            color: #ffffff;
            font-size: 12px;
            padding: 8px 12px;
          }
          
          .model-select optgroup {
            background-color: #1a1a1c;
            color: #c5f04a;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 8px 12px;
          }
          
          /* Mobile-specific: Limit dropdown height to 40vh max */
          @media (max-width: 768px) {
            .model-select {
              max-height: 40vh;
            }
          }
        `}</style>
      </div>
    </>
  );
}