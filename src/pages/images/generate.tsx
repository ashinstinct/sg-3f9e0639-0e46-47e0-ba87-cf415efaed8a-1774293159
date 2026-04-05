import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image, Loader2, Wand2, ArrowLeft, Download, Sparkles } from "lucide-react";
import Link from "next/link";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ASPECT_RATIOS: Array<{ value: AspectRatio; label: string }> = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:4", label: "3:4 (Portrait)" },
];

const IMAGE_MODELS = [
  {
    id: "flux",
    name: "FLUX.1",
    company: "Black Forest Labs",
    latestVersion: "Pro",
    versions: [
      { id: "flux-pro", name: "FLUX.1 Pro", credits: 5, description: "Highest quality, best details" },
      { id: "flux-dev", name: "FLUX.1 Dev", credits: 4, description: "Great balance of speed/quality" },
      { id: "flux-schnell", name: "FLUX.1 Schnell", credits: 2, description: "Fastest generation" },
      { id: "flux-realism", name: "FLUX.1 Realism", credits: 4, description: "Photorealistic images" },
      { id: "flux-lora", name: "FLUX.1 LoRA", credits: 3, description: "Fine-tuned variants" },
    ],
  },
  {
    id: "nana-banana",
    name: "Nana Banana",
    company: "fal.ai",
    latestVersion: "2.0",
    versions: [
      { id: "nana-2.0", name: "Nana Banana 2.0", credits: 5, description: "Ultra HD, fastest generation" },
      { id: "nana-1.5-pro", name: "Nana Banana 1.5 Pro", credits: 4, description: "Artistic, creative styles" },
    ],
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion",
    company: "Stability AI",
    latestVersion: "3.5",
    versions: [
      { id: "sd-3.5-large", name: "SD 3.5 Large", credits: 4, description: "Most capable, best quality" },
      { id: "sd-xl", name: "SD XL", credits: 3, description: "Fast, reliable, proven" },
    ],
  },
  {
    id: "grok",
    name: "Grok Image",
    company: "xAI",
    latestVersion: null,
    versions: [
      { id: "grok-image", name: "Grok Image", credits: 5, description: "Creative, unique style" },
    ],
  },
  {
    id: "recraft",
    name: "Recraft",
    company: "Recraft AI",
    latestVersion: "V3",
    versions: [
      { id: "recraft-v3", name: "Recraft V3", credits: 4, description: "Perfect text rendering" },
    ],
  },
  {
    id: "ideogram",
    name: "Ideogram",
    company: "Ideogram AI",
    latestVersion: "V2",
    versions: [
      { id: "ideogram-v2", name: "Ideogram V2", credits: 4, description: "Industry-leading text quality" },
      { id: "ideogram-v1", name: "Ideogram V1", credits: 3, description: "Original version" },
    ],
  },
  {
    id: "playground",
    name: "Playground",
    company: "Playground AI",
    latestVersion: "V2.5",
    versions: [
      { id: "playground-v2.5", name: "Playground V2.5", credits: 3, description: "Photorealistic specialist" },
      { id: "playground-v2", name: "Playground V2", credits: 3, description: "Previous version" },
    ],
  },
  {
    id: "auraflow",
    name: "AuraFlow",
    company: "Fal AI",
    latestVersion: null,
    versions: [
      { id: "auraflow", name: "AuraFlow", credits: 3, description: "Open-source FLUX alternative" },
    ],
  },
];

export default function ImageGenerator() {
  const [selectedModelFamily, setSelectedModelFamily] = useState(IMAGE_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(IMAGE_MODELS[0].versions[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const storedCredits = localStorage.getItem("userCredits");
    setCredits(storedCredits ? parseInt(storedCredits) : 0);
  }, []);

  const handleModelFamilyChange = (modelId: string) => {
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    if (model) {
      setSelectedModelFamily(model);
      setSelectedVersion(model.versions[0]);
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = selectedModelFamily.versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (credits < selectedVersion.credits) {
      alert(`Not enough credits. Need ${selectedVersion.credits}, have ${credits}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGeneratedImage("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024");
      
      const newCredits = credits - selectedVersion.credits;
      setCredits(newCredits);
      localStorage.setItem("userCredits", newCredits.toString());
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO
        title="AI Image Generator - Back2Life.Studio"
        description="Generate stunning images with the latest AI models from FLUX, Stable Diffusion, and more."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <Link href="/images" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Images
                </Link>

                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-heading font-bold text-3xl">AI Image Generator</h1>
                    <p className="text-sm text-muted-foreground mt-1">Choose from 8 professional models</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Credits</div>
                    <div className="text-2xl font-bold">{credits}</div>
                  </div>
                </div>

                {/* Model Family Selector */}
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModelFamily.id} onValueChange={handleModelFamilyChange}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{selectedModelFamily.name}</span>
                          {selectedModelFamily.latestVersion && (
                            <span className="text-xs text-muted-foreground ml-2">{selectedModelFamily.latestVersion}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">{selectedModelFamily.company}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                {model.name}
                                {model.latestVersion && (
                                  <span className="text-xs text-muted-foreground">{model.latestVersion}</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{model.company}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Version Selector (if model has multiple versions) */}
                {selectedModelFamily.versions.length > 1 && (
                  <div className="space-y-2">
                    <Label>Version</Label>
                    <Select value={selectedVersion.id} onValueChange={handleVersionChange}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center justify-between w-full">
                          <span>{selectedVersion.name}</span>
                          <span className="text-xs text-amber-500 ml-2">{selectedVersion.credits} credits</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModelFamily.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{version.name}</div>
                                <div className="text-xs text-muted-foreground">{version.description}</div>
                              </div>
                              <span className="text-xs text-amber-500 ml-4">{version.credits} credits</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A serene landscape with mountains and a lake at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{prompt.length} characters</div>
                    
                    {/* Enhance Prompt Toggle */}
                    <div className="flex items-center gap-2">
                      <Switch
                        id="enhance-prompt"
                        checked={enhancePrompt}
                        onCheckedChange={setEnhancePrompt}
                      />
                      <Label htmlFor="enhance-prompt" className="text-sm cursor-pointer flex items-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        Enhance Prompt
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="blurry, low quality, distorted..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {ASPECT_RATIOS.map((ratio) => (
                      <Button
                        key={ratio.value}
                        variant={aspectRatio === ratio.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAspectRatio(ratio.value)}
                        className="text-xs"
                      >
                        {ratio.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate ({selectedVersion.credits} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-xl mb-4">Generated Image</h2>
                
                {!generatedImage ? (
                  <div className="aspect-square rounded-xl bg-muted/50 border-2 border-dashed flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your generated image will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full rounded-xl border-2"
                    />
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}