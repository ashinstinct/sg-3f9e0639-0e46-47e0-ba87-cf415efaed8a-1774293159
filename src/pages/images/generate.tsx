import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hasEnoughCredits, deductCredits, getCreditBalance } from "@/services/creditsService";
import { saveImageGeneration } from "@/services/libraryService";
import { Sparkles, Upload, Loader2, Wand2, ImageIcon, Layers, Plus, Minus, Copy, Check, Settings, Download } from "lucide-react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

type Version = {
  id: string;
  name: string;
  credits: number;
  speed: string;
};

type ImageModel = {
  id: string;
  name: string;
  company: string;
  description: string;
  icon: any;
  badge?: string | null;
  versions: Version[];
  maxImages?: number;
  resolutions?: string[];
};

const IMAGE_MODELS = [
  {
    id: "nana-banana-2",
    name: "Nana Banana 2",
    description: "State-of-the-art image generation with photorealistic results",
    icon: "🍌",
    color: "from-yellow-400 to-orange-500",
    versions: [
      { id: "nana-banana-2", name: "Standard", credits: 4 },
      { id: "nana-banana-2-pro", name: "Pro", credits: 6 },
    ],
  },
  {
    id: "seedream",
    name: "Seedream 4.5",
    description: "Advanced photorealistic image synthesis",
    icon: "🌱",
    color: "from-green-400 to-emerald-500",
    versions: [
      { id: "seedream-4.5", name: "Standard", credits: 4 },
      { id: "seedream-4.5-turbo", name: "Turbo", credits: 5 },
    ],
  },
  {
    id: "grok",
    name: "Grok Image 1.5",
    description: "X.AI's powerful image generation model",
    icon: "⚡",
    color: "from-blue-400 to-cyan-500",
    versions: [
      { id: "grok-1.5", name: "Standard", credits: 5 },
    ],
  },
  {
    id: "imagen",
    name: "Google Imagen 4",
    description: "Google's latest text-to-image model",
    icon: "🎨",
    color: "from-red-400 to-pink-500",
    versions: [
      { id: "imagen-4", name: "Standard", credits: 5 },
      { id: "imagen-4-pro", name: "Pro", credits: 7 },
    ],
  },
  {
    id: "flux",
    name: "FLUX.1",
    description: "High-quality, fast image generation",
    icon: "⚡",
    color: "from-purple-400 to-pink-500",
    versions: [
      { id: "flux-1-schnell", name: "Schnell (Fast)", credits: 2 },
      { id: "flux-1-dev", name: "Dev (Quality)", credits: 3 },
      { id: "flux-1-pro", name: "Pro (Best)", credits: 5 },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    description: "Popular open-source image model",
    icon: "🎨",
    color: "from-blue-400 to-purple-500",
    versions: [
      { id: "sd-3.5-large", name: "3.5 Large", credits: 3 },
      { id: "sd-3.5-medium", name: "3.5 Medium", credits: 2 },
      { id: "sd-xl", name: "XL", credits: 2 },
    ],
  },
  {
    id: "recraft",
    name: "Recraft v3",
    description: "Professional design-focused generation",
    icon: "✨",
    color: "from-indigo-400 to-blue-500",
    versions: [
      { id: "recraft-v3", name: "v3", credits: 3 },
    ],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    description: "Text rendering specialist",
    icon: "📝",
    color: "from-green-400 to-teal-500",
    versions: [
      { id: "ideogram-v2", name: "v2", credits: 3 },
      { id: "ideogram-v2-turbo", name: "v2 Turbo", credits: 4 },
    ],
  },
  {
    id: "playground",
    name: "Playground v3",
    description: "Creative and artistic generations",
    icon: "🎮",
    color: "from-pink-400 to-rose-500",
    versions: [
      { id: "playground-v3", name: "v3", credits: 3 },
    ],
  },
  {
    id: "auraflow",
    name: "AuraFlow",
    description: "Open-source quality model",
    icon: "🌊",
    color: "from-cyan-400 to-blue-500",
    versions: [
      { id: "auraflow-v0.3", name: "v0.3", credits: 2 },
    ],
  },
];

const imageModels: ImageModel[] = [
  {
    id: "flux",
    name: "FLUX.1",
    company: "Black Forest Labs",
    description: "State-of-the-art text-to-image generation",
    icon: Sparkles,
    maxImages: 1,
    resolutions: ["720p", "1080p", "2K (2048x2048)"],
    versions: [
      { id: "flux-pro-1.1", name: "Pro 1.1", credits: 5, speed: "10-15s" },
      { id: "flux-pro", name: "Pro", credits: 4, speed: "10-15s" },
      { id: "flux-dev", name: "Dev", credits: 3, speed: "10-15s" },
      { id: "flux-schnell", name: "Schnell", credits: 2, speed: "5s" },
      { id: "flux-realism", name: "Realism", credits: 3, speed: "10s" },
    ],
  },
  {
    id: "nana-banana",
    name: "Nano Banana",
    company: "fal.ai",
    description: "Ultra HD image generation in 10 seconds",
    icon: Sparkles,
    badge: "NEW",
    maxImages: 1,
    resolutions: ["720p", "1080p", "2K", "4K (3840x2160)"],
    versions: [
      { id: "nana-banana-2", name: "2.0", credits: 5, speed: "10s" },
      { id: "nana-banana-1.5-pro", name: "1.5 Pro", credits: 4, speed: "8s" },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    company: "Stability AI",
    description: "Industry-standard open-source image generation",
    icon: Layers,
    maxImages: 1,
    resolutions: ["720p", "1080p", "2K"],
    versions: [
      { id: "sd-3.5-large", name: "3.5 Large", credits: 4, speed: "12s" },
      { id: "sd-xl", name: "XL", credits: 3, speed: "10s" },
    ],
  },
  {
    id: "grok",
    name: "Grok Image",
    company: "xAI",
    description: "xAI's creative image generation",
    icon: Sparkles,
    maxImages: 0,
    resolutions: ["1080p", "2K"],
    versions: [
      { id: "grok-image", name: "Grok", credits: 5, speed: "15s" },
    ],
  },
  {
    id: "recraft",
    name: "Recraft V3",
    company: "Recraft AI",
    description: "Perfect for logos and UI elements",
    icon: Wand2,
    maxImages: 1,
    resolutions: ["1080p", "2K", "Vector (SVG)"],
    versions: [
      { id: "recraft-v3", name: "V3", credits: 4, speed: "8s" },
    ],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    company: "Ideogram AI",
    description: "Industry-leading text rendering",
    icon: ImageIcon,
    maxImages: 0,
    resolutions: ["1080p", "2K"],
    versions: [
      { id: "ideogram-v2", name: "V2", credits: 4, speed: "10s" },
      { id: "ideogram-v1", name: "V1", credits: 3, speed: "8s" },
    ],
  },
  {
    id: "playground",
    name: "Playground",
    company: "Playground AI",
    description: "Photorealistic specialist",
    icon: ImageIcon,
    maxImages: 1,
    resolutions: ["1080p", "2K"],
    versions: [
      { id: "playground-v2.5", name: "V2.5", credits: 3, speed: "8s" },
      { id: "playground-v2", name: "V2", credits: 3, speed: "8s" },
    ],
  },
  {
    id: "auraflow",
    name: "AuraFlow",
    company: "Fal AI",
    description: "Open-source FLUX alternative",
    icon: Sparkles,
    maxImages: 0,
    resolutions: ["1080p", "2K"],
    versions: [
      { id: "auraflow", name: "AuraFlow", credits: 3, speed: "8s" },
    ],
  },
  {
    id: "imagen",
    name: "Imagen",
    company: "Google",
    description: "Google's photorealistic image generation",
    icon: Sparkles,
    badge: "NEW",
    maxImages: 1,
    resolutions: ["1080p", "2K", "4K (3840x2160)"],
    versions: [
      { id: "imagen-4", name: "4.0", credits: 6, speed: "12s" },
    ],
  },
];

const ASPECT_RATIOS = [
  { id: "1:1", name: "1:1", value: "1:1" },
  { id: "16:9", name: "16:9", value: "16:9" },
  { id: "9:16", name: "9:16", value: "9:16" },
  { id: "4:3", name: "4:3", value: "4:3" },
  { id: "3:4", name: "3:4", value: "3:4" },
];

const RESOLUTIONS = [
  { id: "1k", name: "1K", value: "1024x1024" },
  { id: "2k", name: "2K", value: "2048x2048" },
];

export default function ImageGeneratePage() {
  const [selectedModel, setSelectedModel] = useState(imageModels[1]); // Nano Banana (index 1)
  const [selectedVersion, setSelectedVersion] = useState(imageModels[1].versions[0]); // Nano Banana 2.0
  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Advanced settings
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [numImages, setNumImages] = useState(1);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [numSteps, setNumSteps] = useState(50);
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [enableSafety, setEnableSafety] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Additional settings
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [batchCount, setBatchCount] = useState(1);

  // Prompt enhancer states
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [autoEnhance, setAutoEnhance] = useState(false);
  const [originalPrompt, setOriginalPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    
    setIsEnhancing(true);
    setOriginalPrompt(prompt);
    
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      
      const data = await response.json();
      
      if (data.success && data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
        if (!autoEnhance) {
          // Show enhancement immediately if not in auto mode
          setPrompt(data.enhancedPrompt);
        }
      }
    } catch (err) {
      console.error("Prompt enhancement failed:", err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    const model = imageModels.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setSelectedVersion(model.versions[0]);
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = selectedModel.versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
    }
  };

  const filteredModels = imageModels.filter((model) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      model.name.toLowerCase().includes(searchLower) ||
      model.company.toLowerCase().includes(searchLower) ||
      model.description.toLowerCase().includes(searchLower)
    );
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    // Check if user has enough credits
    const hasCredits = await hasEnoughCredits(selectedVersion.credits);
    if (!hasCredits) {
      setError(`Insufficient credits. You need ${selectedVersion.credits} credits to generate with ${selectedVersion.name}.`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let finalPrompt = prompt.trim();
      
      // Auto-enhance if enabled
      if (autoEnhance) {
        setIsEnhancing(true);
        try {
          const enhanceResponse = await fetch("/api/enhance-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: finalPrompt }),
          });
          
          const enhanceData = await enhanceResponse.json();
          
          if (enhanceData.success && enhanceData.enhancedPrompt) {
            finalPrompt = enhanceData.enhancedPrompt;
            setEnhancedPrompt(finalPrompt);
          }
        } catch (err) {
          console.error("Auto-enhancement failed, using original prompt:", err);
        } finally {
          setIsEnhancing(false);
        }
      }

      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedVersion.id,
          prompt: finalPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          width,
          height,
          numImages,
          guidanceScale,
          numInferenceSteps: numSteps,
          seed: seed || undefined,
          enableSafetyChecker: enableSafety,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      if (data.success && data.images && data.images.length > 0) {
        // Deduct credits after successful generation
        const deductResult = await deductCredits(
          selectedVersion.credits,
          `Generated image with ${selectedModel.name} ${selectedVersion.name}`,
          {
            model: selectedModel.id,
            version: selectedVersion.id,
            prompt: finalPrompt,
            imageUrl: data.images[0].url,
          }
        );

        if (!deductResult.success) {
          console.error("Failed to deduct credits:", deductResult.error);
        }

        // Save to library
        await saveImageGeneration({
          imageUrl: data.images[0].url,
          prompt: finalPrompt,
          negativePrompt: negativePrompt.trim() || undefined,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          versionName: selectedVersion.name,
          width,
          height,
          guidanceScale,
          numSteps,
          seed: seed || undefined,
          creditsUsed: selectedVersion.credits,
        });

        setGeneratedImage(data.images[0].url);
        
        // Show enhanced prompt after generation if in auto mode
        if (autoEnhance && enhancedPrompt) {
          setPrompt(enhancedPrompt);
        }
      } else {
        throw new Error("No image returned from API");
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate image");
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalCredits = selectedVersion.credits * batchCount;

  return (
    <>
      <SEO
        title="AI Image Generator - Back2Life.Studio"
        description="Generate stunning images with the latest AI models"
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-[1800px]">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="p-0 lg:p-8">
              <Link
                href="/images"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Images
              </Link>

              <div className="mb-6">
                <h1 className="font-heading font-bold text-3xl mb-2">Create Image</h1>
                <p className="text-muted-foreground">
                  Generate high-quality images using AI models
                </p>
              </div>

              <div className="space-y-6">
                {/* Image Upload Area */}
                {selectedModel.maxImages !== undefined && selectedModel.maxImages > 0 && (
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">
                          Choose images to upload <span className="text-muted-foreground/60">(up to {selectedModel.maxImages} {selectedModel.maxImages === 1 ? 'image' : 'images'})</span>
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Optional - for image-to-image generation
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Wand2 className="w-4 h-4" />
                      Prompt
                    </Label>
                    <span className="text-xs text-muted-foreground">{prompt.length}/500</span>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                    placeholder="Describe the image you want to create..."
                    className="min-h-[120px] resize-none"
                  />
                  
                  {/* Prompt Enhancer Controls */}
                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleEnhancePrompt}
                      disabled={isEnhancing || !prompt.trim()}
                      className="gap-2"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Enhance Prompt
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-2 ml-auto">
                      <Label htmlFor="auto-enhance" className="text-xs text-muted-foreground cursor-pointer">
                        Auto-enhance
                      </Label>
                      <Switch
                        id="auto-enhance"
                        checked={autoEnhance}
                        onCheckedChange={setAutoEnhance}
                      />
                    </div>
                  </div>
                  
                  {enhancedPrompt && !autoEnhance && enhancedPrompt !== originalPrompt && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-primary mb-1">Enhanced Prompt:</p>
                          <p className="text-muted-foreground">{enhancedPrompt}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Model Selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ImageIcon className="w-4 h-4" />
                    Model
                  </Label>
                  <Select value={selectedModel.id} onValueChange={handleModelChange}>
                    <SelectTrigger className="h-14">
                      <div className="flex items-center gap-3 w-full">
                        <span className="text-2xl">
                          {(() => {
                            const Icon = selectedModel.icon;
                            return <Icon className="w-6 h-6" />;
                          })()}
                        </span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold flex items-center gap-2">
                            {selectedModel.name}
                            {selectedModel.badge && (
                              <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                                {selectedModel.badge}
                              </span>
                            )}
                          </div>
                          {selectedModel.versions.length > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {selectedVersion.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[500px]">
                      <div className="sticky top-0 bg-background p-2 border-b">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      {filteredModels.map((model) => {
                        const ModelIcon = model.icon;
                        return (
                        <SelectItem key={model.id} value={model.id} className="h-auto py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xl"><ModelIcon className="w-5 h-5" /></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold flex items-center gap-2 mb-0.5">
                                {model.name}
                                {model.badge && (
                                  <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-2 py-0.5 rounded">
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {model.description}
                              </div>
                            </div>
                            {selectedModel.id === model.id && (
                              <Check className="w-5 h-5 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Version Selector */}
                {selectedModel.versions.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Version</Label>
                    <Select value={selectedVersion.id} onValueChange={handleVersionChange}>
                      <SelectTrigger className="h-12">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{selectedVersion.name}</span>
                          <span className="text-xs text-amber-500">
                            {selectedVersion.credits} credits
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModel.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id} className="h-auto py-2.5">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-medium">{version.name}</span>
                              <span className="text-xs text-amber-500">
                                {version.credits} credits
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Bottom Controls */}
                <div className="flex items-center gap-3 pt-2">
                  {/* Aspect Ratio */}
                  <Select
                    value={aspectRatio.id}
                    onValueChange={(id) => setAspectRatio(ASPECT_RATIOS.find((r) => r.id === id)!)}
                  >
                    <SelectTrigger className="w-24 h-10 bg-muted/50 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.id} value={ratio.id}>
                          {ratio.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Resolution */}
                  <Select
                    value={resolution.id}
                    onValueChange={(val) => {
                      const res = RESOLUTIONS.find((r) => r.id === val);
                      if (res) setResolution(res);
                    }}
                  >
                    <SelectTrigger className="w-32 h-10 bg-muted/50 text-foreground">
                      <SelectValue placeholder="Resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      {(selectedModel.resolutions || ["1K", "2K"]).map((res, idx) => (
                        <SelectItem key={idx} value={res}>
                          {res}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Batch Count */}
                  <Select
                    value={batchCount.toString()}
                    onValueChange={(val) => setBatchCount(parseInt(val))}
                  >
                    <SelectTrigger className="w-16 h-10 bg-muted/50 text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4].map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Settings Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium cursor-pointer" htmlFor="advanced-toggle">
                      Advanced Settings
                    </Label>
                  </div>
                  <Switch
                    id="advanced-toggle"
                    checked={showAdvanced}
                    onCheckedChange={setShowAdvanced}
                  />
                </div>

                {/* Advanced Settings Panel */}
                {showAdvanced && (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50 border border-border">
                    {/* Image Size */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Width</Label>
                        <Input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(Number(e.target.value))}
                          min={256}
                          max={2048}
                          step={64}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Height</Label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(Number(e.target.value))}
                          min={256}
                          max={2048}
                          step={64}
                        />
                      </div>
                    </div>

                    {/* Guidance Scale */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Guidance Scale: {guidanceScale}</Label>
                      <input
                        type="range"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(Number(e.target.value))}
                        min={1}
                        max={20}
                        step={0.5}
                        className="w-full"
                      />
                    </div>

                    {/* Inference Steps */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Inference Steps: {numSteps}</Label>
                      <input
                        type="range"
                        value={numSteps}
                        onChange={(e) => setNumSteps(Number(e.target.value))}
                        min={20}
                        max={150}
                        step={10}
                        className="w-full"
                      />
                    </div>

                    {/* Seed */}
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Seed (Optional)</Label>
                      <Input
                        type="number"
                        value={seed || ""}
                        onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Random"
                      />
                    </div>

                    {/* Safety Checker */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Enable Safety Checker</Label>
                      <Switch
                        checked={enableSafety}
                        onCheckedChange={setEnableSafety}
                      />
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-lg font-semibold"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image ({selectedVersion.credits} credits)
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                {/* Generated Image Preview */}
                {generatedImage && (
                  <div className="mt-6 rounded-xl overflow-hidden border-0">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full"
                    />
                    <div className="p-4 bg-muted/50 flex gap-2">
                      <Button
                        onClick={() => window.open(generatedImage, "_blank")}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Open Full Size
                      </Button>
                      <Button
                        onClick={() => {
                          const a = document.createElement("a");
                          a.href = generatedImage;
                          a.download = `generated-${Date.now()}.png`;
                          a.click();
                        }}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}