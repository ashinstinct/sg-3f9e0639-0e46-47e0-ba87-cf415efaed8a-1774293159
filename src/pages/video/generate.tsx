import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { ImageIcon, Video, Grid3x3, Clock, Monitor, Gauge, Plus, Upload, X, Check } from "lucide-react";

export default function VideoGenerate() {
  const [selectedModel, setSelectedModel] = useState("kling-3.0");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState("720p");
  
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
  
  // Audio toggle (for models that generate audio)
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  // Kling Omni specific mode
  const [klingOmniMode, setKlingOmniMode] = useState<"frames" | "elements">("frames");
  
  // Dropdown states
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);

  // Video models organized by company with all variants
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
          supportsAudioToggle: true,
          useDurationSlider: true,
          durationRange: [3, 15],
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
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
          supportsAudioToggle: true,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: false,
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
          supportsAudioToggle: true,
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
          supportsAudioToggle: true,
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
  const currentModel = videoModels.find(m => m.id === selectedModel);

  // Quality options
  const qualityOptions = ["360p", "480p", "720p", "1080p"];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("model", selectedModel);
      formData.append("prompt", prompt);
      formData.append("aspectRatio", aspectRatio);
      formData.append("duration", duration.toString());
      
      if (startFrame) {
        formData.append("startFrame", startFrame);
      }
      
      if (endFrame && currentModel?.supportsEndFrame) {
        formData.append("endFrame", endFrame);
      }

      if (selectedModel === "kling-omni-3.0" && klingOmniMode === "elements") {
        elementImages.forEach((img, index) => {
          formData.append(`element${index}`, img);
        });
      }

      if (uploadedVideo && currentModel?.supportsVideo) {
        formData.append("video", uploadedVideo);
      }

      const response = await fetch("/api/fal/video-generate", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedVideo(data.video.url);
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO
        title="Video Generation | Back2Life.Studio"
        description="Generate AI videos with Kling, Sora, Veo, and more top models"
      />
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-purple-950/10 to-cyan-950/20 pointer-events-none" />
        
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
        
        <div className="relative z-10 container mx-auto px-4 pt-32 pb-8 max-w-7xl">
          {/* Top: Model Selector & Mode Tabs */}
          <div className="flex items-center justify-between mb-8">
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setStartFrame(null);
                setEndFrame(null);
                setElementImages([]);
                setUploadedVideo(null);
              }}
              className="model-select w-full bg-[#0d0d0d] text-white border border-white/10 rounded-lg px-3 py-2.5 text-xs focus:border-cyan-500/50 focus:ring-cyan-500/20 outline-none mb-4"
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

            {/* Mode Tabs - Kling Omni & Motion Control */}
            {selectedModel === "kling-omni-3.0" && (
              <div className="flex items-center gap-2 bg-[#1a1a1c] p-1.5 rounded-full border border-white/5">
                <button
                  onClick={() => setKlingOmniMode("elements")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    klingOmniMode === "elements"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Elements
                </button>
                <button
                  onClick={() => setKlingOmniMode("frames")}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    klingOmniMode === "frames"
                      ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  Frames
                </button>
              </div>
            )}

            {selectedModel === "kling-motion-3.0" && (
              <div className="bg-[#1a1a1c] p-1.5 rounded-full border border-white/5">
                <button className="px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg">
                  Motion Control
                </button>
              </div>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Upload Boxes */}
            <div className="space-y-6">
              {/* START Frame */}
              {currentModel?.supportsStartFrame && (selectedModel !== "kling-omni-3.0" || klingOmniMode === "frames") && (
                <div className="relative w-28">
                  <label className="block text-xs text-white/60 mb-1.5 text-center">START</label>
                  <div className="aspect-square bg-[#1a1a1c] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group overflow-hidden">
                    {startFrame ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(startFrame)}
                          alt="Start frame"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setStartFrame(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full hover:bg-red-500/80 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <Plus className="w-8 h-8 text-white/40 group-hover:text-cyan-500 transition-colors" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setStartFrame(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* END Frame */}
              {currentModel?.supportsEndFrame && (selectedModel !== "kling-omni-3.0" || klingOmniMode === "frames") && (
                <div className="relative w-28">
                  <label className="block text-xs text-white/60 mb-1.5 text-center">END</label>
                  <div className="aspect-square bg-[#1a1a1c] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group">
                    {endFrame ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(endFrame)}
                          alt="End frame"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setEndFrame(null)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 rounded-full hover:bg-red-500/80 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <Plus className="w-8 h-8 text-white/40 group-hover:text-cyan-500 transition-colors" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setEndFrame(file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Elements Mode - Multiple Images */}
              {selectedModel === "kling-omni-3.0" && klingOmniMode === "elements" && (
                <>
                  {[...Array(5)].map((_, idx) => {
                    const element = elementImages[idx];
                    return (
                      <div key={idx} className="relative w-28">
                        <label className="block text-xs text-white/60 mb-1.5 text-center">EL {idx + 1}</label>
                        <div className="aspect-square bg-[#1a1a1c] border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group">
                          {element ? (
                            <div className="relative w-full h-full">
                              <img
                                src={URL.createObjectURL(element)}
                                alt={`Element ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => {
                                  const newElements = [...elementImages];
                                  newElements.splice(idx, 1);
                                  setElementImages(newElements);
                                }}
                                className="absolute top-1 right-1 p-1 bg-black/80 rounded-full hover:bg-red-500/80 transition-all"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <label className="w-full h-full flex items-center justify-center cursor-pointer">
                              <Plus className="w-5 h-5 text-white/40 group-hover:text-cyan-500 transition-colors" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const newElements = [...elementImages];
                                    newElements[idx] = file;
                                    setElementImages(newElements);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>

            {/* Main Content - Single Column */}
            <div className="space-y-3">
              {/* Upload Boxes Row */}
              <div className="flex gap-2.5 justify-center flex-wrap">
                {/* Aspect Ratio Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowRatioDropdown(!showRatioDropdown);
                      setShowDurationDropdown(false);
                      setShowQualityDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-full hover:border-cyan-500/50 transition-all"
                  >
                    <Monitor className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">{aspectRatio}</span>
                  </button>

                  {showRatioDropdown && (
                    <div className="absolute top-full mt-2 left-0 bg-[#1a1a1c] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 min-w-[160px]">
                      {currentModel?.aspectRatios.map(ratio => (
                        <button
                          key={ratio}
                          onClick={() => {
                            setAspectRatio(ratio);
                            setShowRatioDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                            aspectRatio === ratio
                              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          } flex items-center justify-between`}
                        >
                          {ratio}
                          {aspectRatio === ratio && <Check className="w-4 h-4 text-cyan-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quality Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowQualityDropdown(!showQualityDropdown);
                      setShowRatioDropdown(false);
                      setShowDurationDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-full hover:border-cyan-500/50 transition-all"
                  >
                    <Gauge className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">{quality}</span>
                  </button>

                  {showQualityDropdown && (
                    <div className="absolute top-full mt-2 left-0 bg-[#1a1a1c] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 min-w-[140px]">
                      {qualityOptions.map(q => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowQualityDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                            quality === q
                              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          } flex items-center justify-between`}
                        >
                          {q}
                          {quality === q && <Check className="w-4 h-4 text-cyan-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration Button */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowDurationDropdown(!showDurationDropdown);
                      setShowRatioDropdown(false);
                      setShowQualityDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1c] border border-white/10 rounded-full hover:border-cyan-500/50 transition-all"
                  >
                    <Clock className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">{duration}s</span>
                  </button>

                  {showDurationDropdown && (
                    <div className="absolute top-full mt-2 left-0 bg-[#1a1a1c] border border-white/10 rounded-2xl p-2 shadow-2xl z-20 min-w-[140px]">
                      {currentModel?.durations.map(d => (
                        <button
                          key={d}
                          onClick={() => {
                            setDuration(d);
                            setShowDurationDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                            duration === d
                              ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          } flex items-center justify-between`}
                        >
                          {d}s
                          {duration === d && <Check className="w-4 h-4 text-cyan-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Toggle Button - Only for models that support it */}
                {currentModel?.supportsAudioToggle && (
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      audioEnabled
                        ? "bg-white text-black"
                        : "bg-[#1a1a1c] border border-white/10 text-white hover:border-cyan-500/50"
                    }`}
                  >
                    🔊 {audioEnabled ? "On" : "Off"}
                  </button>
                )}
              </div>

              {/* Video Upload for LTX-2 */}
              {currentModel?.supportsVideo && (
                <div className="flex justify-center">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#1a1a1c] border border-white/10 rounded-full text-sm text-white/80 hover:border-cyan-500/50 transition-all">
                    <Upload className="w-4 h-4" />
                    {uploadedVideo ? uploadedVideo.name : "Upload Video"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Prompt & Generate */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2 mt-4">
              <label className="block text-sm text-white/80">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video..."
                className="w-full h-28 bg-[#1a1a1c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:border-cyan-500/50 focus:ring-cyan-500/20 outline-none resize-none"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt || isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-3"
            >
              {isGenerating ? "Generating..." : `GENERATE 🪙 ${currentModel?.credits || 0}`}
            </button>

            {/* Generated Video */}
            {generatedVideo && (
              <div className="bg-[#0d0d0d]/40 border border-white/5 rounded-3xl p-6">
                <video
                  src={generatedVideo}
                  controls
                  className="w-full rounded-2xl"
                />
              </div>
            )}
          </div>
        </div>

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
            background-color: #0d0d0d !important;
            color: #ffffff !important;
            font-size: 11px !important;
            padding: 6px 10px !important;
          }
          
          .model-select optgroup {
            background-color: #1a1a1c !important;
            color: #06b6d4 !important;
            font-weight: 600;
            font-size: 10px !important;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 6px 10px !important;
          }
          
          /* Mobile-specific: Compact dropdown */
          @media (max-width: 768px) {
            .model-select {
              font-size: 11px;
            }
          }
        `}</style>
      </div>
    </>
  );
}