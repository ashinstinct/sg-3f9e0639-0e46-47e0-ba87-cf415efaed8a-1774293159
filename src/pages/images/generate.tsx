import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, Sparkles, Image as ImageIcon, Loader2, Upload, Search, Check, Layers, Wand2 } from "lucide-react";

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
};

const imageModels: ImageModel[] = [
  {
    id: "flux",
    name: "FLUX.1",
    company: "Black Forest Labs",
    description: "State-of-the-art text-to-image generation",
    icon: Sparkles,
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

    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedVersion.id,
          prompt: prompt.trim(),
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
        setGeneratedImage(data.images[0].url);
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
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">
                        Choose images to upload <span className="text-muted-foreground/60">(up to 14)</span>
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        Optional - for image-to-image generation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Prompt */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your concept, scene, or idea"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none text-base"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        id="enhance"
                        checked={enhancePrompt}
                        onCheckedChange={setEnhancePrompt}
                      />
                      <Label htmlFor="enhance" className="text-sm cursor-pointer">
                        Enhance prompt with AI
                      </Label>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {prompt.length}/2000
                    </span>
                  </div>
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
                    <SelectTrigger className="w-24 h-10 bg-muted/50">
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
                    onValueChange={(id) => setResolution(RESOLUTIONS.find((r) => r.id === id)!)}
                  >
                    <SelectTrigger className="w-20 h-10 bg-muted/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOLUTIONS.map((res) => (
                        <SelectItem key={res.id} value={res.id}>
                          {res.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Batch Count */}
                  <Select
                    value={batchCount.toString()}
                    onValueChange={(val) => setBatchCount(parseInt(val))}
                  >
                    <SelectTrigger className="w-16 h-10 bg-muted/50">
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