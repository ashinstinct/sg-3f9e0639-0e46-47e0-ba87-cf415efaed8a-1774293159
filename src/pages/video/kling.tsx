import { useState, useEffect, useRef } from "react";
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
import { ArrowLeft, Video, Download, Loader2, Upload, X, Wand2, Volume2, AtSign, RotateCw, ZoomIn, ArrowUp, ArrowDown, ArrowRight } from "lucide-react";

const KLING_MODELS = [
  { id: "kling-v1-6", name: "Kling 3.0", credits: 20, maxDuration: 10, hasAudio: true, hasElements: false },
  { id: "kling-v1-5", name: "Kling 2.6", credits: 16, maxDuration: 10, hasAudio: true, hasElements: false },
  { id: "kling-v1-5-pro", name: "Kling 2.5 Pro", credits: 18, maxDuration: 8, hasAudio: true, hasElements: false },
  { id: "kling-v1", name: "Kling 2.1", credits: 14, maxDuration: 8, hasAudio: false, hasElements: false },
  { id: "kling-v1-01", name: "Kling 01", credits: 15, maxDuration: 6, hasAudio: false, hasElements: true },
  { id: "kling-omni", name: "Kling Omni", credits: 22, maxDuration: 10, hasAudio: true, hasElements: true },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "1:1", label: "1:1" },
];

export default function KlingVideoGenerator() {
  const [selectedModel, setSelectedModel] = useState(KLING_MODELS[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [enableAudio, setEnableAudio] = useState(true);
  const [showElements, setShowElements] = useState(false);
  const [elements, setElements] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [startFrame, setStartFrame] = useState<File | null>(null);
  const [endFrame, setEndFrame] = useState<File | null>(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [credits, setCredits] = useState(0);
  
  const startFrameRef = useRef<HTMLInputElement>(null);
  const endFrameRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera motion controls
  const [horizontalPan, setHorizontalPan] = useState(0); // -10 to 10
  const [verticalTilt, setVerticalTilt] = useState(0); // -10 to 10
  const [zoom, setZoom] = useState(0); // -10 to 10
  const [roll, setRoll] = useState(0); // -10 to 10

  useEffect(() => {
    const storedCredits = localStorage.getItem("userCredits");
    setCredits(storedCredits ? parseInt(storedCredits) : 0);
  }, []);

  useEffect(() => {
    if (duration > selectedModel.maxDuration) {
      setDuration(selectedModel.maxDuration);
    }
  }, [selectedModel, duration]);

  const handleStartFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStartFrame(file);
  };

  const handleEndFrameUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEndFrame(file);
  };

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
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      setGeneratedVideo("https://www.w3schools.com/html/mov_bbb.mp4");
      
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

  const resetMotionControls = () => {
    setHorizontalPan(0);
    setVerticalTilt(0);
    setZoom(0);
    setRoll(0);
  };

  const applyPresetMotion = (preset: string) => {
    resetMotionControls();
    switch (preset) {
      case "left":
        setHorizontalPan(-10);
        break;
      case "right":
        setHorizontalPan(10);
        break;
      case "up":
        setVerticalTilt(10);
        break;
      case "down":
        setVerticalTilt(-10);
        break;
      case "in":
        setZoom(10);
        break;
      case "out":
        setZoom(-10);
        break;
      case "clockwise":
        setRoll(10);
        break;
      case "counter":
        setRoll(-10);
        break;
    }
  };

  return (
    <>
      <SEO
        title="Kling Video Generator - Back2Life.Studio"
        description="Generate stunning AI videos with Kling models. Multiple versions available."
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
                    <h1 className="font-heading font-bold text-3xl">Kling Video</h1>
                    <p className="text-sm text-muted-foreground mt-1">by Kuaishou AI</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Credits</div>
                    <div className="text-2xl font-bold">{credits}</div>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-full" />

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModel.id} onValueChange={(value) => {
                    const model = KLING_MODELS.find(m => m.id === value);
                    if (model) setSelectedModel(model);
                  }}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <span>{selectedModel.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {selectedModel.credits} credits • {selectedModel.maxDuration}s max
                        </span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {KLING_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs text-muted-foreground">{model.maxDuration}s max</div>
                            </div>
                            <span className="text-xs text-amber-500 ml-4">{model.credits} credits</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Start frame (Optional)</Label>
                    <div
                      onClick={() => startFrameRef.current?.click()}
                      className="relative aspect-video rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {startFrame ? (
                        <>
                          <img
                            src={URL.createObjectURL(startFrame)}
                            alt="Start frame"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStartFrame(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      ref={startFrameRef}
                      type="file"
                      accept="image/*"
                      onChange={handleStartFrameUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">End frame (Optional)</Label>
                    <div
                      onClick={() => endFrameRef.current?.click()}
                      className="relative aspect-video rounded-xl border-2 border-dashed bg-muted/30 hover:bg-muted/50 cursor-pointer flex items-center justify-center transition-colors"
                    >
                      {endFrame ? (
                        <>
                          <img
                            src={URL.createObjectURL(endFrame)}
                            alt="End frame"
                            className="absolute inset-0 w-full h-full object-cover rounded-xl"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEndFrame(null);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      ref={endFrameRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEndFrameUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A woman walking through a neon-lit city at night..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">{prompt.length} characters</div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="enhance-prompt"
                          checked={enhancePrompt}
                          onCheckedChange={setEnhancePrompt}
                        />
                        <Label htmlFor="enhance-prompt" className="text-sm cursor-pointer flex items-center gap-1">
                          <Wand2 className="w-3 h-3" />
                          Enhance
                        </Label>
                      </div>

                      {selectedModel.hasAudio && (
                        <div className="flex items-center gap-2">
                          <Switch
                            id="enable-audio"
                            checked={enableAudio}
                            onCheckedChange={setEnableAudio}
                          />
                          <Label htmlFor="enable-audio" className="text-sm cursor-pointer flex items-center gap-1">
                            <Volume2 className="w-3 h-3" />
                            Audio
                          </Label>
                        </div>
                      )}

                      {selectedModel.hasElements && (
                        <Button
                          size="sm"
                          variant={showElements ? "default" : "outline"}
                          onClick={() => setShowElements(!showElements)}
                          className="h-8"
                        >
                          <AtSign className="w-3 h-3 mr-1" />
                          Elements
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedModel.hasElements && showElements && (
                  <div className="space-y-2">
                    <Label htmlFor="elements">Elements</Label>
                    <Textarea
                      id="elements"
                      placeholder="Add elements like @sky, @sunset, @mountains..."
                      value={elements}
                      onChange={(e) => setElements(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      Use @ to reference specific elements like @sky, @water, @person
                    </p>
                  </div>
                )}

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

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      <span>Duration</span>
                    </Label>
                    <div className="text-center py-3 px-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">{duration}s</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Aspect Ratio</Label>
                    <div className="text-center py-3 px-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">{aspectRatio}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Quality</Label>
                    <div className="text-center py-3 px-4 rounded-lg bg-muted">
                      <div className="text-2xl font-bold">1080p</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Slider
                    value={[duration]}
                    onValueChange={(value) => setDuration(value[0])}
                    min={3}
                    max={selectedModel.maxDuration}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>3s</span>
                    <span>{selectedModel.maxDuration}s max</span>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-16 text-lg font-bold bg-gradient-to-r from-lime-400 to-green-500 hover:opacity-90 text-black"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate ✨ {selectedModel.credits}
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
                      <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Your generated video will appear here</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <video
                      ref={videoRef}
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
