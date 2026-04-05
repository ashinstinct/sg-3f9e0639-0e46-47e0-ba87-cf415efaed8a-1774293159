import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Video, Loader2, Wand2, ArrowLeft, Volume2, VolumeX, Plus, Sparkles } from "lucide-react";
import Link from "next/link";

type AspectRatio = "16:9" | "9:16" | "1:1" | "4:3" | "3:4";

const ASPECT_RATIOS: Array<{ value: AspectRatio; label: string }> = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:3", label: "4:3 (Standard)" },
  { value: "3:4", label: "3:4 (Portrait)" },
];

const VIDEO_MODELS = [
  {
    id: "kling",
    name: "Kling",
    company: "Kuaishou AI",
    latestVersion: "3.0",
    versions: [
      { id: "kling-3.0", name: "Kling 3.0", credits: 20, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-2.6", name: "Kling 2.6", credits: 18, duration: 10, hasAudio: true, hasElements: false },
      { id: "kling-2.5-pro", name: "Kling 2.5 Pro", credits: 16, duration: 8, hasAudio: true, hasElements: false },
      { id: "kling-2.1", name: "Kling 2.1", credits: 14, duration: 5, hasAudio: false, hasElements: false },
      { id: "kling-01", name: "Kling 01", credits: 18, duration: 10, hasAudio: true, hasElements: true },
      { id: "kling-omni", name: "Kling Omni", credits: 20, duration: 10, hasAudio: true, hasElements: true },
    ],
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    company: "Luma AI",
    latestVersion: null,
    versions: [
      { id: "luma-dream", name: "Luma Dream Machine", credits: 15, duration: 5, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "runway",
    name: "Runway",
    company: "Runway ML",
    latestVersion: "Gen-3",
    versions: [
      { id: "runway-gen3", name: "Gen-3 Alpha", credits: 18, duration: 10, hasAudio: false, hasElements: false },
      { id: "runway-gen3-turbo", name: "Gen-3 Turbo", credits: 15, duration: 10, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "minimax",
    name: "MiniMax Video",
    company: "Hailuo AI",
    latestVersion: null,
    versions: [
      { id: "minimax-video", name: "MiniMax Video", credits: 12, duration: 6, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "hunyuan",
    name: "Hunyuan Video",
    company: "Tencent",
    latestVersion: null,
    versions: [
      { id: "hunyuan-video", name: "Hunyuan Video", credits: 16, duration: 8, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "grok",
    name: "Grok Video",
    company: "xAI",
    latestVersion: null,
    versions: [
      { id: "grok-video", name: "Grok Video", credits: 22, duration: 10, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "seedance",
    name: "Seedance",
    company: "Bytedance",
    latestVersion: "1.5 Pro",
    versions: [
      { id: "seedance-1.5-pro", name: "Seedance 1.5 Pro", credits: 20, duration: 12, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "sora",
    name: "Sora",
    company: "OpenAI",
    latestVersion: "2.0",
    versions: [
      { id: "sora-2.0", name: "Sora 2.0", credits: 25, duration: 20, hasAudio: true, hasElements: false },
    ],
  },
  {
    id: "veo",
    name: "Veo",
    company: "Google",
    latestVersion: "3.1",
    comingSoon: true,
    versions: [
      { id: "veo-3.1", name: "Veo 3.1", credits: 22, duration: 15, hasAudio: false, hasElements: false },
      { id: "veo-3.1-fast", name: "Veo 3.1 Fast", credits: 18, duration: 15, hasAudio: false, hasElements: false },
    ],
  },
  {
    id: "seedream",
    name: "Seedream",
    company: "Bytedance",
    latestVersion: "2.0",
    comingSoon: true,
    versions: [
      { id: "seedream-2.0", name: "Seedream 2.0", credits: 20, duration: 12, hasAudio: false, hasElements: false },
    ],
  },
];

export default function VideoGenerator() {
  const [selectedModelFamily, setSelectedModelFamily] = useState(VIDEO_MODELS[0]);
  const [selectedVersion, setSelectedVersion] = useState(VIDEO_MODELS[0].versions[0]);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState("");
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const storedCredits = localStorage.getItem("userCredits");
    setCredits(storedCredits ? parseInt(storedCredits) : 0);
  }, []);

  const handleModelFamilyChange = (modelId: string) => {
    const model = VIDEO_MODELS.find(m => m.id === modelId);
    if (model) {
      setSelectedModelFamily(model);
      setSelectedVersion(model.versions[0]);
      // Reset toggles based on new model capabilities
      setAudioEnabled(false);
      setShowElements(false);
    }
  };

  const handleVersionChange = (versionId: string) => {
    const version = selectedModelFamily.versions.find(v => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      // Reset toggles if new version doesn't support them
      if (!version.hasAudio) setAudioEnabled(false);
      if (!version.hasElements) setShowElements(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (selectedModelFamily.comingSoon) {
      alert(`${selectedModelFamily.name} is coming soon!`);
      return;
    }

    if (credits < selectedVersion.credits) {
      alert(`Not enough credits. Need ${selectedVersion.credits}, have ${credits}`);
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      setGeneratedVideo("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
      
      const newCredits = credits - selectedVersion.credits;
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
        title="AI Video Generator - Back2Life.Studio"
        description="Generate stunning videos with the latest AI models from Kling, Luma, Runway, Sora, Veo, and more."
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
                    <h1 className="font-heading font-bold text-3xl">AI Video Generator</h1>
                    <p className="text-sm text-muted-foreground mt-1">Choose from 10 professional models</p>
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
                    <SelectTrigger className="w-full h-14">
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <div className="font-semibold text-base">{selectedModelFamily.name}</div>
                          <div className="text-xs text-muted-foreground">{selectedModelFamily.company}</div>
                        </div>
                        {selectedModelFamily.comingSoon && (
                          <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded-full">Coming Soon</span>
                        )}
                      </div>
                    </SelectTrigger>
                    <SelectContent className="max-h-[400px]">
                      {VIDEO_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="h-auto py-3">
                          <div className="flex items-start justify-between w-full gap-4">
                            <div className="flex-1">
                              <div className="font-semibold text-base mb-0.5 flex items-center gap-2">
                                {model.name}
                                {model.comingSoon && (
                                  <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Soon</span>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">{model.company}</div>
                              <div className="text-xs text-muted-foreground/80">
                                Max {model.versions[0].duration}s
                                {model.versions.length > 1 && ` • ${model.versions.length} versions`}
                                {model.versions[0].hasAudio && " • Audio"}
                                {model.versions[0].hasElements && " • Elements"}
                              </div>
                            </div>
                            <div className="text-xs text-amber-500 font-semibold whitespace-nowrap">
                              {model.versions[0].credits} credits
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
                      <SelectTrigger className="w-full h-12">
                        <div className="flex items-center justify-between w-full">
                          <span className="font-medium">{selectedVersion.name}</span>
                          <span className="text-xs text-amber-500">{selectedVersion.credits} credits</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {selectedModelFamily.versions.map((version) => (
                          <SelectItem key={version.id} value={version.id} className="h-auto py-2.5">
                            <div className="flex items-center justify-between w-full gap-4">
                              <div className="flex-1">
                                <div className="font-medium text-sm mb-0.5">{version.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  Max {version.duration}s
                                  {version.hasAudio && " • Audio"}
                                  {version.hasElements && " • Elements"}
                                </div>
                              </div>
                              <span className="text-xs text-amber-500 font-semibold">{version.credits} credits</span>
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
                    placeholder="A serene ocean sunset with waves gently rolling onto a sandy beach..."
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

                {/* Audio Toggle (only if model supports it) */}
                {selectedVersion.hasAudio && (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      <Label htmlFor="audio-toggle" className="cursor-pointer">Generate with Audio</Label>
                    </div>
                    <Switch
                      id="audio-toggle"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                    />
                  </div>
                )}

                {/* Elements Button (only for Kling 01 & Omni) */}
                {selectedVersion.hasElements && (
                  <Button
                    variant="outline"
                    onClick={() => setShowElements(!showElements)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showElements ? "Hide" : "Add"} Elements
                  </Button>
                )}

                {/* Elements Panel (Kling 01 & Omni only) */}
                {selectedVersion.hasElements && showElements && (
                  <div className="p-4 bg-muted/30 rounded-lg border-2 border-dashed space-y-3">
                    <h3 className="font-medium text-sm">Scene Elements</h3>
                    <p className="text-xs text-muted-foreground">
                      Add specific elements to your video (camera movement, lighting, objects, etc.)
                    </p>
                    <Textarea
                      placeholder="Example: Camera: Slow zoom in, Lighting: Golden hour, Objects: Flying birds..."
                      rows={3}
                      className="resize-none text-sm"
                    />
                  </div>
                )}

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

                {/* Duration Info */}
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <strong>Max Duration:</strong> {selectedVersion.duration} seconds
                  {selectedModelFamily.comingSoon && (
                    <span className="ml-2 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">Coming Soon</span>
                  )}
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || selectedModelFamily.comingSoon}
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
                      src={generatedVideo}
                      controls
                      className="w-full rounded-xl border-2"
                    />
                    <Button variant="outline" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4 rotate-90" />
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