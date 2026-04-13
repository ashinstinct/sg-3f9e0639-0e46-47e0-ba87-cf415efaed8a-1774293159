import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Download, Wand2, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NanoBanana() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <>
      <SEO title="Nano Banana 2 - AI Image Generator" />
      <Navigation />
      
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold">Nano Banana 2</h1>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                Pro Model
              </Badge>
            </div>
            <p className="text-muted-foreground text-lg">
              Ultra-realistic portraits and photography with stunning detail
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left: Input */}
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Create Image</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Prompt</label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="A professional portrait of a woman in a studio setting..."
                      className="min-h-32"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Model Info */}
              <Card className="p-6">
                <h3 className="font-semibold mb-3">About Nano Banana 2</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Ultra-realistic portrait generation</li>
                  <li>✓ Professional photography quality</li>
                  <li>✓ Advanced skin texture rendering</li>
                  <li>✓ Perfect lighting simulation</li>
                  <li>✓ High-resolution outputs</li>
                </ul>
              </Card>
            </div>

            {/* Right: Output */}
            <div>
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Generated Image</h2>
                
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      <img
                        src={generatedImage}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Image
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Your generated image will appear here</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}