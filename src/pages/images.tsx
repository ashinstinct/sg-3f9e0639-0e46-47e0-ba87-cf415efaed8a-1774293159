import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Download, Loader2, AlertCircle, Wand2, ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { creditsService } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ASPECT_RATIOS: Record<AspectRatio, string> = {
  "1:1": "Square (1024×1024)",
  "16:9": "Landscape (1344×768)",
  "9:16": "Portrait (768×1344)",
  "4:3": "Standard (1152×896)",
  "3:4": "Photo (896×1152)",
};

export default function ProImageTools() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const { toast } = useToast();

  const CREDITS_COST = 5;

  // Check user credits on mount
  useState(() => {
    const checkCredits = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const credits = await creditsService.getUserCredits(session.user.id);
        if (credits) {
          setUserCredits(credits.free_credits + credits.paid_credits);
        }
      }
    };
    checkCredits();
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        variant: "destructive",
        title: "Prompt required",
        description: "Please enter a prompt to generate an image",
      });
      return;
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to use pro tools",
      });
      return;
    }

    // Check credits
    const hasCredits = await creditsService.hasEnoughCredits(session.user.id, CREDITS_COST);
    if (!hasCredits) {
      toast({
        variant: "destructive",
        title: "Insufficient credits",
        description: `You need ${CREDITS_COST} credits to generate an image. Please purchase more credits.`,
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage("");

    try {
      toast({
        title: "🎨 Generating image...",
        description: "This may take 20-40 seconds",
      });

      const response = await fetch("/api/fal/image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          negative_prompt: negativePrompt,
          aspect_ratio: aspectRatio,
          model: "fal-ai/flux-pro",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      // Deduct credits
      const success = await creditsService.deductCredits(
        session.user.id,
        CREDITS_COST,
        "Nana Banana 2 Image Generation"
      );

      if (!success) {
        throw new Error("Failed to deduct credits");
      }

      setGeneratedImage(data.image_url);
      
      // Update credits display
      const updatedCredits = await creditsService.getUserCredits(session.user.id);
      if (updatedCredits) {
        setUserCredits(updatedCredits.free_credits + updatedCredits.paid_credits);
      }

      toast({
        title: "✅ Image generated!",
        description: `${CREDITS_COST} credits used. ${userCredits ? userCredits - CREDITS_COST : 0} remaining.`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `back2life-pro-${Date.now()}.png`;
    link.click();
  };

  return (
    <>
      <SEO
        title="Pro Image Generation - Back2Life.Studio"
        description="Generate stunning images with advanced AI models including Nana Banana 2"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Professional Image Generation</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Nana Banana 2
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6">
              State-of-the-art image generation powered by FLUX Pro
            </p>

            {userCredits !== null && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">{userCredits} credits available</span>
              </div>
            )}
          </div>

          {/* Generation Interface */}
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
                <CardDescription>
                  Create professional-quality images with AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt */}
                <div className="space-y-2">
                  <Label>Image Prompt</Label>
                  <Textarea
                    placeholder="A serene mountain landscape at sunset, photorealistic, 8K quality..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {prompt.length} characters
                  </p>
                </div>

                {/* Negative Prompt */}
                <div className="space-y-2">
                  <Label>Negative Prompt (Optional)</Label>
                  <Textarea
                    placeholder="blurry, low quality, distorted..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={(value) => setAspectRatio(value as AspectRatio)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASPECT_RATIOS).map(([key, label]) => (
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
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90 h-14 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5 mr-2" />
                      Generate Image ({CREDITS_COST} credits)
                    </>
                  )}
                </Button>

                {/* Tips */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">Pro Tips:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Be specific with styles and details</li>
                    <li>Include quality keywords like "8K" or "professional"</li>
                    <li>Use negative prompts to avoid unwanted elements</li>
                    <li>FLUX Pro delivers photorealistic results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Image</CardTitle>
                <CardDescription>
                  Your professional AI artwork
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedImage && !isGenerating && (
                  <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
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
                      <p className="text-xs text-muted-foreground mt-1">This may take 20-40 seconds</p>
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
                      className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:opacity-90"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Image
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Free Alternative */}
          <div className="max-w-5xl mx-auto mt-12">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for a free option?</h3>
                    <p className="text-sm text-muted-foreground">Try our free AI Image Generator with FLUX.1-Schnell</p>
                  </div>
                  <Link href="/generate">
                    <Button variant="outline">
                      Try Free Tool
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}