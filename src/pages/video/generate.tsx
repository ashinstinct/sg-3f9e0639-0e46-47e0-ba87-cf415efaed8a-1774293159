import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { ImageIcon, Video, Grid3x3, Clock, Monitor, Gauge, Plus, Upload, X, Check, Loader2, Wand2, Maximize2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  
  // UI state
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showRatioDropdown, setShowRatioDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowRatioDropdown(false);
      setShowDurationDropdown(false);
      setShowQualityDropdown(false);
    };
    
    if (showRatioDropdown || showDurationDropdown || showQualityDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showRatioDropdown, showDurationDropdown, showQualityDropdown]);

  // Video models with correct configurations
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
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          maxElements: 5,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5, 10, 15],
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          qualities: ["720p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5],
          qualities: ["720p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          aspectRatios: ["16:9", "9:16", "1:1", "21:9", "9:21", "4:3", "3:4"],
          durations: [5, 10, 15, 20],
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1", "4:3", "3:4"],
          durations: [5],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [6],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 8],
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10, 15],
          qualities: ["720p", "1080p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          qualities: ["720p", "1080p"],
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
          supportsAudioToggle: false,
          aspectRatios: ["16:9", "9:16", "1:1"],
          durations: [5, 10],
          qualities: ["720p", "1080p"],
          credits: 16,
          maxBatch: 1
        }
      ]
    }
  ];

  const videoModels = videoModelGroups.flatMap(group => group.models);
  const currentModel = videoModels.find(m => m.id === selectedModel);
  const creditCost = currentModel?.credits || 0;

  const uploadToFal = async (file: File) => {
    // Basic file to base64 conversion for API submission
    // Real implementation should use a proper storage bucket or Fal's upload API
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStartFrame(file);
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEndFrame(file);
  };

  const handleElementUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newElements = [...elementImages];
      newElements[idx] = file;
      setElementImages(newElements);
    }
  };

  const handleElementImageUpload = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newElements = [...elementImages];
      newElements[idx] = file;
      setElementImages(newElements);
    }
  };

  const removeElement = (idx: number) => {
    const newElements = [...elementImages];
    newElements.splice(idx, 1);
    setElementImages(newElements);
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
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Upload images to get URLs
      let startFrameUrl = null;
      let endFrameUrl = null;
      const elementUrls: string[] = [];

      if (startFrame) {
        startFrameUrl = await uploadToFal(startFrame);
      }

      if (endFrame) {
        endFrameUrl = await uploadToFal(endFrame);
      }

      if (elementImages.length > 0) {
        for (const img of elementImages) {
          const url = await uploadToFal(img);
          elementUrls.push(url);
        }
      }

      // Call API
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
          elementUrls,
          klingMode: selectedModel === "kling-omni-3.0" ? klingOmniMode : undefined,
          audioEnabled: currentModel?.supportsAudioToggle ? audioEnabled : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");

      setGeneratedVideo(data.video.url);

      // Save to database
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
      } catch (dbError) {
        console.error("Error saving to gallery:", dbError);
        // Don't fail the whole generation if saving fails
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO 
        title="AI Video Generator - Back2Life.Studio"
        description="Generate stunning videos with AI using Kling, Sora, Veo, and more"
      />
      
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Top Floating Toggle */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10 flex items-center bg-[#1a1a1c] p-1.5 rounded-full border border-white/5 shadow-xl">
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

        {/* Main Content - EXACT COPY of Image Page Structure */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Canvas Area - Empty state or generated video */}
          <div className="flex-1 bg-[#0a0a0a] relative mt-16">
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
              {isGenerating ? (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-cyan-500 mx-auto mb-4" />
                  <p className="text-xl font-light text-gray-400 mb-2">Generating video...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
                </div>
              ) : generatedVideo ? (
                <video 
                  src={generatedVideo} 
                  controls 
                  className="max-w-full max-h-full rounded-lg shadow-2xl"
                />
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

          {/* Bottom Prompt Builder Panel - EXACT COPY */}
          <div className="bg-[#0a0a0a] border-t border-white/5 p-3 md:p-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#161618] rounded-2xl p-3 md:p-4 border border-white/5">
                {/* Main Container */}
                <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
                  {/* Model Dropdown */}
                  <div className="mb-3">
                    <select
                      value={selectedModel}
                      onChange={(e) => {
                        setSelectedModel(e.target.value);
                        setStartFrame(null);
                        setEndFrame(null);
                        setElementImages([]);
                        setUploadedVideo(null);
                      }}
                      className="model-select w-full bg-[#0d0d0d] text-white border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-cyan-500/50 focus:ring-cyan-500/20 outline-none"
                    >
                      {videoModelGroups.map(group => (
                        <optgroup key={group.company} label={group.company}>
                          {group.models.map(model => (
                            <option key={model.id} value={model.id}>
                              {model.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Credits Display */}
                  <div className="mb-3 text-xs text-white/60 text-right">
                    Cost: 🪙 {currentModel?.credits || 0} credits
                  </div>

                  {/* Prompt with Expand Button */}
                  <div className="mb-3 relative">
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the video you want to create..."
                      className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[70px] resize-none focus:border-cyan-500/50 focus:ring-cyan-500/20 pr-20"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !prompt.trim()}
                        className="h-8 w-8 p-0 text-cyan-500 hover:text-cyan-400 hover:bg-white/5"
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

                  {/* Frame Upload Boxes - Horizontal Scroll Row */}
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {/* START Frame */}
                      {currentModel?.supportsStartFrame && (selectedModel !== "kling-omni-3.0" || klingOmniMode === "frames") && (
                        <div className="w-20 h-20">
                          <div className="w-full h-full bg-[#1a1a1c] border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group relative">
                            {startFrame ? (
                              <>
                                <img src={URL.createObjectURL(startFrame)} alt="Start frame" className="w-full h-full object-cover rounded-xl" />
                                <button
                                  onClick={() => setStartFrame(null)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleStartFrameUpload}
                                  className="hidden"
                                  id="start-frame-upload"
                                />
                                <label htmlFor="start-frame-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                  <Upload className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors mb-1" />
                                  <span className="text-[9px] text-white/60 uppercase">START</span>
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* END Frame */}
                      {currentModel?.supportsEndFrame && (selectedModel !== "kling-omni-3.0" || klingOmniMode === "frames") && (
                        <div className="w-20 h-20">
                          <div className="w-full h-full bg-[#1a1a1c] border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group relative">
                            {endFrame ? (
                              <>
                                <img src={URL.createObjectURL(endFrame)} alt="End frame" className="w-full h-full object-cover rounded-xl" />
                                <button
                                  onClick={() => setEndFrame(null)}
                                  className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </>
                            ) : (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEndFrameUpload}
                                  className="hidden"
                                  id="end-frame-upload"
                                />
                                <label htmlFor="end-frame-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                  {endFrame ? (
                                    <img src={URL.createObjectURL(endFrame)} alt="End frame" className="w-full h-full object-cover rounded-xl" />
                                  ) : (
                                    <>
                                      <Upload className="w-5 h-5 text-white/40 group-hover:text-cyan-400 transition-colors mb-1" />
                                      <span className="text-[9px] text-white/60 uppercase">END</span>
                                    </>
                                  )}
                                </label>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Elements Mode */}
                      {selectedModel === "kling-omni-3.0" && klingOmniMode === "elements" && 
                        [...Array(5)].map((_, idx) => {
                          const element = elementImages[idx];
                          return (
                            <div key={idx} className="w-20 h-20">
                              <div className="w-full h-full bg-[#1a1a1c] border border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-cyan-500/50 transition-all group">
                                {element ? (
                                  <>
                                    <img src={URL.createObjectURL(element)} alt={`Element ${idx + 1}`} className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removeElement(idx)}
                                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                    <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-0.5">EL {idx + 1}</span>
                                  </>
                                ) : (
                                  <label className="w-full h-full border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500/50 hover:bg-white/5 transition-all">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleElementImageUpload(e, idx)}
                                      className="hidden"
                                      id={`element-${idx}-upload`}
                                    />
                                    <label htmlFor={`element-${idx}-upload`} className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                                      {element ? (
                                        <img src={URL.createObjectURL(element)} alt={`Element ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                                      ) : (
                                        <Plus className="w-6 h-6 text-white/40 group-hover:text-cyan-400 transition-colors" />
                                      )}
                                    </label>
                                  </label>
                                )}
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                    {currentModel?.supportsStartFrame && (
                      <p className="text-xs text-gray-500 mt-1">
                        {startFrame || endFrame || elementImages.length > 0 ? "Images uploaded" : ""}
                      </p>
                    )}
                  </div>

                  {/* Compact Control Row - Ratio, Quality, Duration, Audio */}
                  <div className="mb-3 flex items-center gap-2">
                    {/* Aspect Ratio */}
                    <div className="relative flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRatioDropdown(!showRatioDropdown);
                          setShowDurationDropdown(false);
                          setShowQualityDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-xs hover:border-cyan-500/50 transition-all"
                      >
                        <Monitor className="w-3 h-3" />
                        <span className="text-[10px]">{aspectRatio}</span>
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Aspect Ratio Dropdown Menu - POPS UP */}
                      {showRatioDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[180px] overflow-y-auto">
                          {currentModel?.aspectRatios?.map(ratio => (
                            <button
                              key={ratio}
                              onClick={() => {
                                setAspectRatio(ratio);
                                setShowRatioDropdown(false);
                              }}
                              className={`w-full px-2 py-1.5 text-left text-[10px] transition-all flex items-center justify-between ${
                                aspectRatio === ratio
                                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                                  : "text-white/70 hover:bg-white/5"
                              }`}
                            >
                              {ratio}
                              {aspectRatio === ratio && <Check className="w-2.5 h-2.5 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quality */}
                    <div className="relative flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowQualityDropdown(!showQualityDropdown);
                          setShowRatioDropdown(false);
                          setShowDurationDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-xs hover:border-cyan-500/50 transition-all"
                      >
                        <Gauge className="w-3 h-3" />
                        <span className="text-[10px]">{quality}</span>
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Quality Dropdown Menu - POPS UP */}
                      {showQualityDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-black border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[200px] overflow-y-auto">
                          {["720p", "1080p"].map(q => (
                            <button
                              key={q}
                              onClick={() => {
                                setQuality(q);
                                setShowQualityDropdown(false);
                              }}
                              className={`w-full px-3 py-2 text-left text-xs transition-all flex items-center justify-between ${
                                quality === q
                                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                                  : "text-white/70 hover:bg-white/5"
                              }`}
                            >
                              {q}
                              {quality === q && <Check className="w-3 h-3 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="relative flex-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDurationDropdown(!showDurationDropdown);
                          setShowRatioDropdown(false);
                          setShowQualityDropdown(false);
                        }}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-[#1a1a1c] border border-white/10 rounded-lg text-white text-xs hover:border-cyan-500/50 transition-all"
                      >
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{duration}s</span>
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Duration Dropdown Menu */}
                      {showDurationDropdown && (
                        <div className="absolute bottom-full mb-2 left-0 right-0 bg-black border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-[180px] overflow-y-auto">
                          {currentModel?.durations?.map(dur => (
                            <button
                              key={dur}
                              onClick={() => {
                                setDuration(dur);
                                setShowDurationDropdown(false);
                              }}
                              className={`w-full px-2 py-1.5 text-left text-[10px] transition-all flex items-center justify-between ${
                                duration === dur
                                  ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white"
                                  : "text-white/70 hover:bg-white/5"
                              }`}
                            >
                              {dur}s
                              {duration === dur && <Check className="w-2.5 h-2.5 text-cyan-400" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Audio Toggle */}
                    {currentModel?.supportsAudioToggle && (
                      <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                          audioEnabled
                            ? "bg-white text-black"
                            : "bg-[#1a1a1c] border border-white/10 text-white hover:border-cyan-500/50"
                        }`}
                      >
                        🔊 {audioEnabled ? "On" : "Off"}
                      </button>
                    )}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt || isGenerating}
                    className="w-full py-3 mb-4 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        GENERATE
                        <span className="text-white/40 mx-1">|</span>
                        <span className="text-yellow-400">🪙</span>
                        <span>{currentModel?.credits || 0}</span>
                      </>
                    )}
                  </button>

                  {/* Upload Frames Section */}
                  <div className="flex items-center gap-3 justify-center mb-4">
                    <p className="text-xs text-white/40 mb-2">Upload start/end frames</p>
                  </div>
                </div>
              </div>
              
              {/* Cost Display */}
              <div className="mt-2 text-right">
                <span className="text-sm text-white/60">Cost: <span className="text-yellow-500">🪙 {currentModel?.credits || 0} credits</span></span>
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
                    className="bg-cyan-500 text-white hover:bg-cyan-600"
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
                className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-cyan-500/50 focus:ring-cyan-500/20"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}