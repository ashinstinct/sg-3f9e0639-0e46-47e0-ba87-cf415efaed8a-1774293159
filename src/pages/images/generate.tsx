import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ModelSelector, ModelOption } from "@/components/ModelSelector";
import { SEO } from "@/components/SEO";
import { Image as ImageIcon, Video, Sparkles, Upload, X, Loader2, Download, Maximize2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/router";

const imageModels: ModelOption[] = [
  { id: "nano-banana-2", name: "Nano Banana 2", description: "Improved quality", logo: "/logos/nano-banana.svg", tier: "pro" },
  { id: "nano-banana-1.5-pro", name: "Nano Banana Pro", description: "Best quality", logo: "/logos/nano-banana.svg", tier: "pro" },
  { id: "seedream-4.5", name: "Seedream 4.5", description: "Photorealistic", logo: "/logos/seedream.svg", tier: "pro" },
  { id: "seedream-4.5-turbo", name: "Seedream 4.5 Turbo", description: "Fast photorealistic", logo: "/logos/seedream.svg", tier: "pro" },
  { id: "flux-pro-1.1", name: "FLUX Pro 1.1", description: "Professional grade", logo: "/logos/flux.svg", tier: "pro" },
  { id: "flux-pro", name: "FLUX Pro", description: "High quality", logo: "/logos/flux.svg", tier: "pro" },
  { id: "flux-dev", name: "FLUX Dev", description: "Flexible & creative", logo: "/logos/flux.svg", tier: "free" },
  { id: "flux-schnell", name: "FLUX Schnell", description: "Fast generation", logo: "/logos/flux.svg", tier: "free" },
  { id: "flux-realism", name: "FLUX Realism", description: "Realistic photos", logo: "/logos/flux.svg", tier: "pro" },
  { id: "sd-3.5-large", name: "SD 3.5 Large", description: "Stable Diffusion latest", logo: "/logos/stability.svg", tier: "pro" },
  { id: "sd-xl", name: "SDXL", description: "Classic quality", logo: "/logos/stability.svg", tier: "free" },
  { id: "imagen-4", name: "Imagen 4", description: "Google flagship", logo: "/logos/google.svg", tier: "pro" },
  { id: "grok-1.5-image", name: "Grok 1.5 Image", description: "xAI image model", logo: "/logos/grok.svg", tier: "pro" },
  { id: "recraft-v3", name: "Recraft V3", description: "Design-focused", logo: "/logos/recraft.svg", tier: "pro" },
  { id: "ideogram-v2", name: "Ideogram V2", description: "Great with text", logo: "/logos/ideogram.svg", tier: "pro" },
  { id: "playground-v2.5", name: "Playground V2.5", description: "Creative playground", logo: "/logos/playground.svg", tier: "free" },
  { id: "auraflow", name: "AuraFlow", description: "Open source quality", logo: "/logos/auraflow.svg", tier: "free" },
];

const modelConfig: Record<string, { maxImages: number; aspectRatios: string[]; credits: number; maxBatch: number }> = {
  "nano-banana-2": { maxImages: 14, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], credits: 6, maxBatch: 4 },
  "nano-banana-1.5-pro": { maxImages: 8, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 5, maxBatch: 4 },
  "seedream-4.5": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 7, maxBatch: 4 },
  "seedream-4.5-turbo": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 5, maxBatch: 4 },
  "flux-pro-1.1": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], credits: 10, maxBatch: 4 },
  "flux-pro": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], credits: 8, maxBatch: 4 },
  "flux-dev": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], credits: 5, maxBatch: 4 },
  "flux-schnell": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"], credits: 3, maxBatch: 4 },
  "flux-realism": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 8, maxBatch: 4 },
  "sd-3.5-large": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], credits: 5, maxBatch: 4 },
  "sd-xl": { maxImages: 3, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 3, maxBatch: 4 },
  "imagen-4": { maxImages: 0, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 12, maxBatch: 4 },
  "grok-1.5-image": { maxImages: 2, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 10, maxBatch: 4 },
  "recraft-v3": { maxImages: 0, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "21:9", "9:21"], credits: 6, maxBatch: 4 },
  "ideogram-v2": { maxImages: 0, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4", "10:16", "16:10", "3:2", "2:3"], credits: 7, maxBatch: 4 },
  "playground-v2.5": { maxImages: 0, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 5, maxBatch: 4 },
  "auraflow": { maxImages: 0, aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"], credits: 4, maxBatch: 4 },
};

export default function ImageGenerate() {
  const [selectedModel, setSelectedModel] = useState("nano-banana-2");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [expandedPrompt, setExpandedPrompt] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.isReady && router.query.model && typeof router.query.model === "string") {
      const exists = imageModels.some(m => m.id === router.query.model);
      if (exists) {
        setSelectedModel(router.query.model);
      }
    }
  }, [router.isReady, router.query.model]);

  const config = modelConfig[selectedModel] || modelConfig["nano-banana-2"];
  const creditCost = config.credits * numImages;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = config.maxImages - uploadedImages.length;
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
      if (data.enhancedPrompt) setPrompt(data.enhancedPrompt);
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
        formData.append("image_" + idx, img);
      });

      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate image");
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
    <>
      <SEO
        title="AI Image Generator - Back2Life.Studio"
        description="Generate stunning images with AI using FLUX, Stable Diffusion, Recraft, and more"
      />

      <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
        <Navigation />

        {/* Top Bar: Model Selector - standardized spacing */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 pt-14">
          <div className="flex items-center justify-center px-4 py-2">
            <ModelSelector
              models={imageModels}
              selected={selectedModel}
              onSelect={(id) => {
                setSelectedModel(id);
                setUploadedImages([]);
              }}
            />
          </div>
        </div>

        {/* Canvas Area - standardized padding */}
        <div className="flex-1 pt-28 pb-64 md:pb-52 relative">
          <div className="flex items-center justify-center min-h-[40vh] p-4">
            {isGenerating ? (
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-xl font-light text-gray-400">Generating images...</p>
                <p className="text-sm text-gray-600 mt-2">This may take 10-30 seconds</p>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="w-full max-w-4xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedImages.map((imageUrl, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden bg-black/20">
                      <img
                        src={imageUrl}
                        alt={"Generated " + (idx + 1)}
                        className="w-full h-auto object-contain"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = imageUrl;
                            a.download = "generated-" + Date.now() + ".png";
                            a.click();
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white"
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
                  <span className="text-3xl">&#9888;&#65039;</span>
                </div>
                <p className="text-xl font-light text-red-400 mb-2">Generation Failed</p>
                <p className="text-sm text-gray-500">{error}</p>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-2xl font-light mb-2">Describe the image you want to generate or upload a photo and edit it with AI</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Prompt Builder */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a] border-t border-white/5 p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#161618] rounded-2xl p-3 border border-white/5">
              {/* Prompt Input */}
              <div className="mb-3 relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Type a description for the image..."
                  className="w-full bg-black/40 border-white/10 text-white placeholder:text-gray-600 min-h-[60px] resize-none focus:border-purple-500/50 focus:ring-purple-500/20 pr-20"
                />
                <div className="absolute right-2 top-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing || !prompt.trim()}
                    className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-white/5"
                    title="Enhance prompt with AI"
                  >
                    {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setExpandedPrompt(true)}
                    className="h-8 w-8 p-0 text-white/50 hover:text-white hover:bg-white/5"
                    title="Expand prompt"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image Upload */}
              {config.maxImages > 0 && (
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-white/10">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 rounded-full flex items-center justify-center hover:bg-red-500/70"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {uploadedImages.length < config.maxImages && (
                      <label className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-purple-500/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                        <Upload className="w-4 h-4 text-purple-400/50" />
                        <span className="text-[9px] text-purple-400/50 mt-0.5">IMAGE</span>
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Row: Aspect Ratio + Batch + Generate */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Aspect Ratio Pills */}
                <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0 scrollbar-hide">
                  {config.aspectRatios.map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={"flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all border " + (
                        aspectRatio === ratio
                          ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                          : "bg-black/40 text-white/50 border-white/10 hover:bg-white/5"
                      )}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>

                {/* Batch Counter */}
                <div className="flex items-center gap-1.5 bg-black/40 rounded-lg px-2 py-1 border border-white/10">
                  <button
                    onClick={() => setNumImages(Math.max(1, numImages - 1))}
                    disabled={numImages <= 1}
                    className="w-5 h-5 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 text-xs"
                  >
                    -
                  </button>
                  <span className="text-xs font-medium text-white min-w-[24px] text-center">
                    {numImages}/{config.maxBatch}
                  </span>
                  <button
                    onClick={() => setNumImages(Math.min(config.maxBatch, numImages + 1))}
                    disabled={numImages >= config.maxBatch}
                    className="w-5 h-5 rounded text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 text-xs"
                  >
                    +
                  </button>
                </div>

                {/* Generate Button - Neon Purple */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-400 disabled:bg-purple-500/30 disabled:cursor-not-allowed text-white font-bold text-sm h-[40px] px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)]"
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
                <Button
                  size="sm"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
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
              className="min-h-[300px] bg-black/40 border-white/10 text-white placeholder:text-gray-600 resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
            />
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