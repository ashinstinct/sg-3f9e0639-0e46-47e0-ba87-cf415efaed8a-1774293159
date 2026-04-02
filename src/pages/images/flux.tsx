import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { ArrowLeft, Sparkles, Download, Loader2, ChevronDown, Wand2 } from "lucide-react";

const FLUX_MODELS = [
  { id: "flux-pro-1.1-ultra", name: "FLUX.1 Pro", credits: 5, description: "Ultra HD, fastest generation" },
  { id: "flux/dev", name: "FLUX.1 Dev", credits: 4, description: "High quality, balanced" },
  { id: "flux/schnell", name: "FLUX.1 Schnell", credits: 2, description: "Ultra fast, 1-2s generation" },
  { id: "flux-realism", name: "FLUX Realism", credits: 4, description: "Photorealistic specialist" },
  { id: "flux-lora", name: "FLUX LoRA", credits: 5, description: "Custom fine-tuned styles" },
];

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (Square)" },
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:4", label: "3:4 (Portrait)" },
];

export default function FluxImageGenerator() {
  const [selectedModel, setSelectedModel] = useState(FLUX_MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const storedCredits = localStorage.getItem("userCredits");
    setCredits(storedCredits ? parseInt(storedCredits) : 0);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (credits < selectedModel.credits * numImages) {
      alert(`Not enough credits. Need ${selectedModel.credits * numImages}, have ${credits}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockImages = Array(numImages).fill("https://images.unsplash.com/photo-1518770660439-4636190af475?w=1024");
      setGeneratedImages(mockImages);
      
      const newCredits = credits - (selectedModel.credits * numImages);
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
        title="FLUX Image Generator - Back2Life.Studio"
        description="Generate stunning images with FLUX AI models. Multiple versions available."
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

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h1 className="font-heading font-bold text-3xl">FLUX Image Generator</h1>
                      <p className="text-sm text-muted-foreground mt-1">by Black Forest Labs</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Credits</div>
                      <div className="text-2xl font-bold">{credits}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select value={selectedModel.id} onValueChange={(value) => {
                      const model = FLUX_MODELS.find(m => m.id === value);
                      if (model) setSelectedModel(model);
                    }}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center justify-between w-full">
                          <span>{selectedModel.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{selectedModel.credits} credits</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {FLUX_MODELS.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs text-muted-foreground">{model.description}</div>
                              </div>
                              <span className="text-xs text-amber-500 ml-4">{model.credits} credits</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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

                <div className="space-y-2">
                  <Label>Number of Images: {numImages}</Label>
                  <Slider
                    value={[numImages]}
                    onValueChange={(value) => setNumImages(value[0])}
                    min={1}
                    max={4}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Total cost: {selectedModel.credits * numImages} credits
                  </div>
                </div>

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
                      Generate ({selectedModel.credits * numImages} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-xl mb-4">Generated Images</h2>
                
                {generatedImages.length === 0 ? (
                  <div className="aspect-square rounded-xl bg-muted/50 border-2 border-dashed flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your generated images will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedImages.map((image, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          src={image}
                          alt={`Generated ${index + 1}`}
                          className="w-full rounded-xl border-2"
                        />
                        <Button variant="outline" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          Download Image {index + 1}
                        </Button>
                      </div>
                    ))}
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
