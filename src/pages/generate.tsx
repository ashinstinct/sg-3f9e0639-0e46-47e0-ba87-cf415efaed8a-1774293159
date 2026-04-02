import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Download, Loader2, AlertCircle, Wand2 } from "lucide-react";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ASPECT_RATIOS: Record<AspectRatio, { width: number; height: number; label: string }> = {
  "1:1": { width: 1024, height: 1024, label: "Square (1024×1024)" },
  "16:9": { width: 1344, height: 768, label: "Landscape (1344×768)" },
  "9:16": { width: 768, height: 1344, label: "Portrait (768×1344)" },
  "4:3": { width: 1152, height: 896, label: "Standard (1152×896)" },
  "3:4": { width: 896, height: 1152, label: "Photo (896×1152)" },
};

const HUGGINGFACE_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || "";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first");
      return;
    }

    if (!OPENAI_API_KEY) {
      setError("OpenAI API key not configured. Add NEXT_PUBLIC_OPENAI_API_KEY to your .env.local file");
      return;
    }

    setIsEnhancing(true);
    setError("");

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert AI image prompt engineer. Enhance the user's prompt to create stunning, detailed images. Add artistic style, lighting, composition details, and quality modifiers. Keep it concise but vivid. Return ONLY the enhanced prompt, no explanations."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 200,
          temperature: 0.8,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance prompt");
      }

      const data = await response.json();
      const enhancedPrompt = data.choices[0]?.message?.content || prompt;
      setPrompt(enhancedPrompt);
      setSuccess("Prompt enhanced successfully!");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Enhance error:", err);
      setError("Failed to enhance prompt. Please try again.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
    if (!HF_TOKEN) {
      setError("Image generation API token not configured. Please add NEXT_PUBLIC_HF_TOKEN to your environment variables.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImage("");

    try {
      const { width, height } = ASPECT_RATIOS[aspectRatio];
      
      const response = await fetch(
        "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              negative_prompt: negativePrompt || undefined,
              width,
              height,
              num_inference_steps: 4, // FLUX.1-schnell optimized for 4 steps
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Generation failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `back2life-${Date.now()}.png`;
    link.click();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <>
      <SEO
        title="AI Image Generator - Back2Life.Studio"
        description="Generate stunning images from text with advanced AI. Fast, free, and high-quality."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="font-heading font-bold text-4xl">AI Image Generator</h1>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  Free
                </Badge>
              </div>
              <p className="text-muted-foreground text-lg">
                Generate stunning images from text using advanced AI. Fast, free, and high-quality.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generation Settings</CardTitle>
                  <CardDescription>
                    Describe what you want to create
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prompt */}
                  <div className="space-y-2">
                    <Label>Image Prompt</Label>
                    <Textarea
                      placeholder="Describe the image you want to generate..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {prompt.length} characters
                      </p>
                      <Button
                        onClick={handleEnhancePrompt}
                        disabled={isEnhancing || !prompt.trim()}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {isEnhancing ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Enhancing...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-3 h-3" /> Enhance Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Negative Prompt */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Negative Prompt (Optional)</label>
                    <Textarea
                      placeholder="blurry, low quality, distorted, ugly..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[80px] resize-none"
                      disabled={isGenerating}
                    />
                  </div>

                  {/* Aspect Ratio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aspect Ratio</label>
                    <Select
                      value={aspectRatio}
                      onValueChange={(value) => setAspectRatio(value as AspectRatio)}
                      disabled={isGenerating}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASPECT_RATIOS).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 h-14 text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-destructive">Error</p>
                        <p className="text-sm text-destructive/80 mt-1">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <Wand2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-600">Success</p>
                        <p className="text-sm text-green-600/80 mt-1">{success}</p>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <p className="text-sm font-medium">Tips for Better Results:</p>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Be specific and descriptive in your prompts</li>
                      <li>Include style keywords like "photorealistic" or "artistic"</li>
                      <li>Use negative prompts to avoid unwanted elements</li>
                      <li>This model is optimized for speed (4 steps)</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Generated Image</CardTitle>
                  <CardDescription>
                    Your AI-generated artwork will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!generatedImage && !isGenerating && (
                    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">No image generated yet</p>
                        <p className="text-xs mt-1">Enter a prompt and click generate</p>
                      </div>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin text-primary" />
                        <p className="text-sm font-medium">Generating your image...</p>
                        <p className="text-xs text-muted-foreground mt-1">This may take 10-30 seconds</p>
                      </div>
                    </div>
                  )}

                  {generatedImage && (
                    <div className="space-y-4">
                      <div className="relative rounded-lg overflow-hidden border">
                        <img
                          src={generatedImage}
                          alt="Generated"
                          className="w-full h-auto"
                        />
                      </div>
                      
                      <Button
                        onClick={downloadImage}
                        size="lg"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Image
                      </Button>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Prompt Used:</p>
                        <p className="text-sm text-muted-foreground">{prompt}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}