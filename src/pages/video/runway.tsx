import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Film, Download, Loader2, Wand2, ArrowLeft, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";

const RUNWAY_MODELS = [
  { id: "fal-ai/runway-gen3-turbo", name: "Gen-3 Turbo", credits: 18, description: "Fast, professional quality" },
  { id: "fal-ai/runway-gen3-alpha", name: "Gen-3 Alpha", credits: 20, description: "Highest quality, slower" },
];

export default function RunwayGenerator() {
  const [selectedModel, setSelectedModel] = useState(RUNWAY_MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [duration, setDuration] = useState(5);
  const [enableAudio, setEnableAudio] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
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

    if (credits < selectedModel.credits) {
      alert(`Not enough credits. Need ${selectedModel.credits}, have ${credits}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 10000));
      setGeneratedVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      
      const newCredits = credits - selectedModel.credits;
      setCredits(newCredits);
      localStorage.setItem("userCredits", newCredits.toString());
    } catch (error) {
      console.error("Generation error:", error);
      alert("Failed to generate video");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <SEO
        title="Runway Gen-3 Video Generator - Back2Life.Studio"
        description="Generate professional videos with Runway Gen-3 AI."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardContent className="p-6 space-y-6">
                <Link href="/video" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Video
                </Link>

                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-heading font-bold text-3xl">Runway Gen-3</h1>
                    <p className="text-sm text-muted-foreground mt-1">by Runway ML</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Credits</div>
                    <div className="text-2xl font-bold">{credits}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModel.id} onValueChange={(value) => {
                    const model = RUNWAY_MODELS.find(m => m.id === value);
                    if (model) setSelectedModel(model);
                  }}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <span>{selectedModel.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{selectedModel.credits} credits</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {RUNWAY_MODELS.map((model) => (
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

                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A cinematic shot of a futuristic city at night with neon lights..."
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Duration: {duration}s</Label>
                    <span className="text-xs text-muted-foreground">Max: 10s</span>
                  </div>
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {enableAudio ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <Label htmlFor="enable-audio" className="cursor-pointer">Enable Audio</Label>
                      <p className="text-xs text-muted-foreground">Generate video with AI audio</p>
                    </div>
                  </div>
                  <Switch
                    id="enable-audio"
                    checked={enableAudio}
                    onCheckedChange={setEnableAudio}
                  />
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
                      <Film className="mr-2 h-5 w-5" />
                      Generate ({selectedModel.credits} credits)
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="font-heading font-bold text-xl mb-4">Generated Video</h2>
                
                {!generatedVideo ? (
                  <div className="aspect-video rounded-xl bg-muted/50 border-2 border-dashed flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your generated video will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video
                      src={generatedVideo}
                      controls
                      className="w-full rounded-xl border-2"
                    />
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Video
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