import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Image as ImageIcon, Video, Grid3x3, Sparkles, Upload, X, Loader2, Download, Maximize2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ImageGenerate() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [selectedModel, setSelectedModel] = useState("nano-banana-2");
  const [aspectRatio, setAspectRatio] = useState("landscape_16_9");
  const [numImages, setNumImages] = useState(1);
  
  // Generation state
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  // UI state
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Image models organized by company
  const imageModelGroups = [
    {
      company: "FLUX",
      models: [
        {
          id: "flux-pro-1.1",
          name: "FLUX Pro 1.1",
          logo: "/logos/flux.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
          credits: 10,
          maxBatch: 4
        },
        {
          id: "flux-pro",
          name: "FLUX Pro",
          logo: "/logos/flux.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
          credits: 8,
          maxBatch: 4
        },
        {
          id: "flux-dev",
          name: "FLUX Dev",
          logo: "/logos/flux.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
          credits: 5,
          maxBatch: 4
        },
        {
          id: "flux-schnell",
          name: "FLUX Schnell",
          logo: "/logos/flux.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
          credits: 3,
          maxBatch: 4
        },
        {
          id: "flux-realism",
          name: "FLUX Realism",
          logo: "/logos/flux.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 8,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Nano Banana",
      models: [
        {
          id: "nano-banana-2",
          name: "Nano Banana 2",
          logo: "/logos/nano-banana.svg",
          maxImages: 14,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"],
          credits: 6,
          maxBatch: 4
        },
        {
          id: "nano-banana-1.5-pro",
          name: "Nano Banana 1.5 Pro",
          logo: "/logos/nano-banana.svg",
          maxImages: 8,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 5,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Stable Diffusion",
      models: [
        {
          id: "sd-3.5-large",
          name: "SD 3.5 Large",
          logo: "/logos/stability.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
          credits: 5,
          maxBatch: 4
        },
        {
          id: "sd-xl",
          name: "SDXL",
          logo: "/logos/stability.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 3,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Google",
      models: [
        {
          id: "imagen-4",
          name: "Imagen 4",
          logo: "/logos/google.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 12,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Grok",
      models: [
        {
          id: "grok-1.5-image",
          name: "Grok 1.5 Image",
          logo: "/logos/grok.svg",
          maxImages: 2,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 10,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Seedream",
      models: [
        {
          id: "seedream-4.5",
          name: "Seedream 4.5",
          logo: "/logos/seedream.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 7,
          maxBatch: 4
        },
        {
          id: "seedream-4.5-turbo",
          name: "Seedream 4.5 Turbo",
          logo: "/logos/seedream.svg",
          maxImages: 3,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 5,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Recraft",
      models: [
        {
          id: "recraft-v3",
          name: "Recraft V3",
          logo: "/logos/recraft.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"],
          credits: 6,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Ideogram",
      models: [
        {
          id: "ideogram-v2",
          name: "Ideogram V2",
          logo: "/logos/ideogram.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "10:16", "16:10", "3:2", "2:3"],
          credits: 7,
          maxBatch: 4
        },
        {
          id: "ideogram-v1",
          name: "Ideogram V1",
          logo: "/logos/ideogram.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "10:16", "16:10"],
          credits: 5,
          maxBatch: 4
        }
      ]
    },
    {
      company: "Playground",
      models: [
        {
          id: "playground-v2.5",
          name: "Playground V2.5",
          logo: "/logos/playground.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 5,
          maxBatch: 4
        }
      ]
    },
    {
      company: "AuraFlow",
      models: [
        {
          id: "auraflow",
          name: "AuraFlow",
          logo: "/logos/auraflow.svg",
          maxImages: 0,
          aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
          credits: 4,
          maxBatch: 4
        }
      ]
    }
  ];

  // Flatten for easy lookup
  const imageModels = imageModelGroups.flatMap(group => group.models);

  const currentModel = imageModels.find(m => m.id === selectedModel) || imageModels[0];
  const creditCost = currentModel.credits * numImages;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = currentModel.maxImages - uploadedImages.length;
    const newImages = files.slice(0, remainingSlots);
    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
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
      setGeneratedImages([]);

      const formData = new FormData();
      formData.append("model", selectedModel);
      formData.append("prompt", prompt.trim());
      formData.append("image_size", aspectRatio);
      formData.append("num_images", numImages.toString());
      
      uploadedImages.forEach((img, idx) => {
        formData.append(`image_${idx}`, img);
      });

      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        body: formData,
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

  const aspectRatioLabels: Record<string, string> = {
    "square": "1:1",
    "square_hd": "1:1 HD",
    "portrait_4_3": "3:4",
    "portrait_16_9": "9:16",
    "landscape_4_3": "4:3",
    "landscape_16_9": "16:9",
    "21:9": "21:9",
    "16:9": "16:9",
    "4:3": "4:3",
    "1:1": "1:1",
    "3:4": "3:4",
    "9:16": "9:16",
    "9:21": "9:21",
    "3:2": "3:2",
    "2:3": "2:3",
    "16:10": "16:10",
    "10:16": "10:16"
  };

  return (
    <>
      <SEO 
        title="AI Image & Video Generator - Back2Life.Studio"
        description="Generate stunning images and videos with AI using FLUX, Stable Diffusion, Recraft, and more"
      />
      
      <div className="min-h-screen bg-background flex">
        <Navigation />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Top Floating Toggle */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 flex items-center bg-[#1a1a1c] p-1.5 rounded-full border border-white/5 shadow-xl">
            <button 
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all bg-white/10 text-white shadow-sm"
            >
              <ImageIcon className="w-4 h-4" />
              Image
            </button>
            <button 
              onClick={() => window.location.href = '/video/generate'}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all text-white/50 hover:text-white/80"
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
                  <p className="text-xl font-light text-gray-400">Generating images...</p>
                  <p className="text-sm text-gray-600 mt-2">This may take 10-30 seconds</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="w-full h-full max-w-6xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
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
                  <p className="text-sm">Use the prompt builder below to create your first image</p>
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
                    onChange={(e) => {
                      setSelectedModel(e.target.value);
                      setUploadedImages([]);
                    }}
                    className="model-select flex-1 bg-[#0d0d0d] text-white border border-white/10 rounded-lg px-3 py-2 text-xs focus:border-[#c5f04a]/50 focus:ring-[#c5f04a]/20 outline-none"
                  >
                    {imageModelGroups.map(group => (
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

                {/* Prompt with Expand Button */}
                <div className="mb-3 relative">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
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

                {/* Image Upload Boxes (only if model supports it) */}
                {currentModel.maxImages > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                          <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {uploadedImages.length < currentModel.maxImages && (
                        <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#c5f04a]/50 hover:bg-white/5 transition-all">
                          <Upload className="w-5 h-5 text-white/40" />
                          <span className="text-[10px] text-white/40 mt-1">IMAGE</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {uploadedImages.length}/{currentModel.maxImages} images uploaded
                    </p>
                  </div>
                )}

                {/* Settings Pills (Aspect Ratio) */}
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
                      {aspectRatioLabels[ratio] || ratio}
                    </button>
                  ))}
                </div>

                {/* Bottom Controls */}
                <div className="flex items-center gap-2">
                  {/* Batch Counter */}
                  <div className="flex items-center gap-2 bg-black/40 rounded-lg px-2 py-1.5 border border-white/10">
                    <button
                      onClick={() => setNumImages(Math.max(1, numImages - 1))}
                      disabled={numImages <= 1}
                      className="w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="text-sm font-medium text-white min-w-[30px] text-center">
                      {numImages}/{currentModel.maxBatch}
                    </span>
                    <button
                      onClick={() => setNumImages(Math.min(currentModel.maxBatch, numImages + 1))}
                      disabled={numImages >= currentModel.maxBatch}
                      className="w-6 h-6 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  {/* Generate Button */}
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
              placeholder="Describe your image in detail..."
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