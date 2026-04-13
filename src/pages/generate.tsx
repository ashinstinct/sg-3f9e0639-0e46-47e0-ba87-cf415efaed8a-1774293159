import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
  Loader2, 
  Download, 
  Wand2, 
  Image as ImageIcon, 
  Video,
  Sparkles,
  Grid3x3,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type GenerateMode = "image" | "video";

export default function Generate() {
  const [mode, setMode] = useState<GenerateMode>("image");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
  // Image settings
  const [imageModel, setImageModel] = useState("flux");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSteps, setImageSteps] = useState([28]);
  
  // Video settings
  const [videoModel, setVideoModel] = useState("kling");
  const [videoDuration, setVideoDuration] = useState("6s");
  const [videoQuality, setVideoQuality] = useState("720p");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      if (mode === "image") {
        setGeneratedContent("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800");
      } else {
        setGeneratedContent("https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_30fps.mp4");
      }
      setIsGenerating(false);
    }, 3000);
  };

  const imageModels = [
    { value: "flux", label: "FLUX.1 Schnell", credits: 5 },
    { value: "nano-banana", label: "Nano Banana 2", credits: 8 },
    { value: "grok", label: "Grok 2", credits: 10 },
    { value: "stable-diffusion", label: "Stable Diffusion XL", credits: 6 },
    { value: "playground", label: "Playground v3", credits: 7 },
  ];

  const videoModels = [
    { value: "kling", label: "Kling 1.5", credits: 125 },
    { value: "luma", label: "Luma Dream Machine", credits: 100 },
    { value: "runway", label: "Runway Gen-3", credits: 150 },
    { value: "minimax", label: "MiniMax Video-01", credits: 90 },
  ];

  const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  return (
    <>
      <SEO title="Generate - AI Image & Video Creator" />
      <Navigation />
      
      <main className="min-h-screen pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Mode Toggle */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 p-1.5 bg-muted/50 rounded-lg">
              <button
                onClick={() => setMode("image")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                  mode === "image"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="font-medium">Image</span>
              </button>
              <button
                onClick={() => setMode("video")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md transition-all",
                  mode === "video"
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Video className="w-4 h-4" />
                <span className="font-medium">Video</span>
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-8">
            {/* Left: Preview */}
            <div>
              <Card className="p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Preview</h2>
                  {generatedContent && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
                
                {generatedContent ? (
                  <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                    {mode === "image" ? (
                      <img
                        src={generatedContent}
                        alt="Generated"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={generatedContent}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      {mode === "image" ? (
                        <>
                          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No content yet</p>
                          <p className="text-sm mt-2">Use the prompt builder to create your first image</p>
                        </>
                      ) : (
                        <>
                          <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No content yet</p>
                          <p className="text-sm mt-2">Use the prompt builder to create your first video</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right: Controls */}
            <div className="space-y-6">
              {/* Model Selection */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Model</h3>
                </div>
                
                <Select 
                  value={mode === "image" ? imageModel : videoModel}
                  onValueChange={mode === "image" ? setImageModel : setVideoModel}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(mode === "image" ? imageModels : videoModels).map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.label}</span>
                          <span className="text-xs text-muted-foreground ml-4">
                            {model.credits} credits
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Prompt */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Prompt</h3>
                </div>
                
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    mode === "image"
                      ? "A professional portrait of a woman in a studio setting..."
                      : "A cinematic shot of a person walking through a futuristic city..."
                  }
                  className="min-h-32 mb-4"
                />

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
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
                      Generate {mode === "image" ? "Image" : "Video"}
                    </>
                  )}
                </Button>
              </Card>

              {/* Settings */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Settings</h3>
                </div>
                
                {mode === "image" ? (
                  <div className="space-y-6">
                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Aspect Ratio</label>
                      <div className="flex gap-2">
                        {aspectRatios.map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={cn(
                              "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                              aspectRatio === ratio
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-border"
                            )}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        Quality Steps: {imageSteps[0]}
                      </label>
                      <Slider
                        value={imageSteps}
                        onValueChange={setImageSteps}
                        min={4}
                        max={50}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Fast</span>
                        <span>High Quality</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Duration */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Duration</label>
                      <div className="flex gap-2">
                        {["3s", "6s", "10s"].map((duration) => (
                          <button
                            key={duration}
                            onClick={() => setVideoDuration(duration)}
                            className={cn(
                              "flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors",
                              videoDuration === duration
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-border"
                            )}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Quality */}
                    <div>
                      <label className="text-sm font-medium mb-3 block">Quality</label>
                      <Select value={videoQuality} onValueChange={setVideoQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="480p">480p (Fast)</SelectItem>
                          <SelectItem value="720p">720p (Standard)</SelectItem>
                          <SelectItem value="1080p">1080p (High)</SelectItem>
                        </SelectContent>
                      </Select>
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