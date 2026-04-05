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
import { ArrowLeft, Sparkles, Image as ImageIcon, Loader2, Upload, Search, Check } from "lucide-react";

const IMAGE_MODELS = [
  {
    id: "flux",
    name: "FLUX.1",
    company: "Black Forest Labs",
    icon: "⚡",
    badge: null,
    description: "State-of-the-art text-to-image generation",
    versions: [
      { id: "flux-pro", name: "Pro", credits: 5, maxRes: "2048x2048" },
      { id: "flux-dev", name: "Dev", credits: 4, maxRes: "2048x2048" },
      { id: "flux-schnell", name: "Schnell", credits: 2, maxRes: "2048x2048" },
      { id: "flux-realism", name: "Realism", credits: 4, maxRes: "2048x2048" },
      { id: "flux-lora", name: "LoRA", credits: 3, maxRes: "2048x2048" },
    ],
  },
  {
    id: "nana-banana",
    name: "Nana Banana",
    company: "fal.ai",
    icon: "🍌",
    badge: "NEW",
    description: "Pro quality at Flash speed",
    versions: [
      { id: "nana-2.0", name: "2.0", credits: 5, maxRes: "2048x2048" },
      { id: "nana-1.5-pro", name: "1.5 Pro", credits: 4, maxRes: "2048x2048" },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    company: "Stability AI",
    icon: "🎨",
    badge: null,
    description: "Industry-standard open-source model",
    versions: [
      { id: "sd-3.5-large", name: "3.5 Large", credits: 4, maxRes: "2048x2048" },
      { id: "sd-xl", name: "XL", credits: 3, maxRes: "2048x2048" },
    ],
  },
  {
    id: "grok",
    name: "Grok Image",
    company: "xAI",
    icon: "🤖",
    badge: null,
    description: "Creative interpretations and unique style",
    versions: [
      { id: "grok-image", name: "Grok Image", credits: 5, maxRes: "2048x2048" },
    ],
  },
  {
    id: "recraft",
    name: "Recraft V3",
    company: "Recraft AI",
    icon: "✨",
    badge: null,
    description: "Perfect for logos and designs with text",
    versions: [
      { id: "recraft-v3", name: "V3", credits: 4, maxRes: "2048x2048" },
    ],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    company: "Ideogram AI",
    icon: "💡",
    badge: null,
    description: "Industry-leading text rendering quality",
    versions: [
      { id: "ideogram-v2", name: "V2", credits: 4, maxRes: "2048x2048" },
      { id: "ideogram-v1", name: "V1", credits: 3, maxRes: "2048x2048" },
    ],
  },
  {
    id: "playground",
    name: "Playground",
    company: "Playground AI",
    icon: "🎮",
    badge: null,
    description: "Photorealistic specialist with vibrant colors",
    versions: [
      { id: "playground-v2.5", name: "V2.5", credits: 3, maxRes: "2048x2048" },
      { id: "playground-v2", name: "V2", credits: 3, maxRes: "2048x2048" },
    ],
  },
  {
    id: "auraflow",
    name: "AuraFlow",
    company: "Fal AI",
    icon: "🌊",
    badge: null,
    description: "Open-source alternative to FLUX",
    versions: [
      { id: "auraflow", name: "AuraFlow", credits: 3, maxRes: "2048x2048" },
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

export default function ImageGenerate() {
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(selectedModel.versions[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [resolution, setResolution] = useState(RESOLUTIONS[0]);
  const [batchCount, setBatchCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleModelChange = (modelId: string) => {
    const model = IMAGE_MODELS.find((m) => m.id === modelId);
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

  const filteredModels = IMAGE_MODELS.filter(
    (model) =>
      model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    // API call will go here
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
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

        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="border-2">
            <CardContent className="p-8">
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
                        <span className="text-2xl">{selectedModel.icon}</span>
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
                      {filteredModels.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="h-auto py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xl">{model.icon}</span>
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
                      ))}
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

                {/* Generate Button */}
                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-black"
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate
                      <Sparkles className="w-5 h-5 ml-2" />
                      {totalCredits}
                    </>
                  )}
                </Button>

                {/* Generated Image Preview */}
                {generatedImage && (
                  <div className="mt-6 rounded-xl overflow-hidden border-2">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full"
                    />
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