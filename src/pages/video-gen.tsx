import { useState, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Download, Play, Film, Wand2, Loader2 } from "lucide-react";

const HUGGINGFACE_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN || "";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";

interface VideoGeneration {
  id: string;
  prompt: string;
  model: string;
  duration: number;
  style: string;
  videoUrl: string | null;
  status: "pending" | "processing" | "complete" | "error";
  progress: number;
  createdAt: Date;
}

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [model, setModel] = useState("sdk");
  const [duration, setDuration] = useState("5");
  const [style, setStyle] = useState("realistic");
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
              content: "You are an expert AI video prompt engineer. Enhance the user's prompt to create stunning, cinematic videos. Add camera movements, scene descriptions, mood, lighting, and quality modifiers. Keep it concise but vivid. Return ONLY the enhanced prompt, no explanations."
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

  const models = [
    { value: "sdk", label: "SDK (Free)", tier: "free", description: "Fast, good quality" },
    { value: "sora2", label: "Sora 2", tier: "pro", description: "OpenAI's latest" },
    { value: "veo31", label: "Veo 3.1", tier: "pro", description: "Google's best" },
    { value: "kling31", label: "Kling 3.1", tier: "pro", description: "Chinese excellence" },
    { value: "seedance15", label: "Seedance 1.5", tier: "pro", description: "High quality" },
    { value: "wan22", label: "Wan 2.2", tier: "pro", description: "Fast & detailed" }
  ];

  const styles = [
    { value: "realistic", label: "Realistic", emoji: "🎬" },
    { value: "anime", label: "Anime", emoji: "🎨" },
    { value: "cinematic", label: "Cinematic", emoji: "🎥" },
    { value: "3d", label: "3D Render", emoji: "🎮" },
    { value: "cartoon", label: "Cartoon", emoji: "🎭" },
    { value: "abstract", label: "Abstract", emoji: "🌈" }
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setImageFile(file);
      setError("");
    }
  };

  const generateVideo = async () => {
    if (!prompt.trim() && !imageFile) {
      setError("Please enter a prompt or upload an image");
      return;
    }

    if (prompt.length < 10) {
      setError("Prompt should be at least 10 characters");
      return;
    }

    setProcessing(true);
    setError("");

    const newGeneration: VideoGeneration = {
      id: Math.random().toString(36).substr(2, 9),
      prompt: prompt || "Image-to-video",
      model,
      duration: parseInt(duration),
      style,
      videoUrl: null,
      status: "processing",
      progress: 0,
      createdAt: new Date()
    };

    setGenerations(prev => [newGeneration, ...prev]);

    try {
      // Simulate processing
      const progressInterval = setInterval(() => {
        setGenerations(prev => prev.map(gen => {
          if (gen.id === newGeneration.id && gen.progress < 95) {
            return { ...gen, progress: gen.progress + 5 };
          }
          return gen;
        }));
      }, 1000);

      // TODO: Implement actual API calls to video generation models
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      clearInterval(progressInterval);
      
      setGenerations(prev => prev.map(gen => 
        gen.id === newGeneration.id 
          ? { ...gen, status: "error" as const, progress: 100 }
          : gen
      ));
      
      setError("Backend API not yet configured. Free version requires SDK integration. Pro models (Sora 2, Veo 3.1, Kling 3.1, Seedance 1.5, Wan 2.2) require API keys and payment setup.");
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video generation failed");
      setGenerations(prev => prev.map(gen => 
        gen.id === newGeneration.id 
          ? { ...gen, status: "error" as const }
          : gen
      ));
    } finally {
      setProcessing(false);
    }
  };

  const downloadVideo = (generation: VideoGeneration) => {
    if (!generation.videoUrl) return;
    const a = document.createElement("a");
    a.href = generation.videoUrl;
    a.download = `video-${generation.id}.mp4`;
    a.click();
  };

  const selectedModel = models.find(m => m.value === model);

  return (
    <>
      <SEO 
        title="AI Video Generator - Back2Life.Studio"
        description="Generate videos from text prompts or images using cutting-edge AI models"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-pink-500/5">
        <Navigation />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 bg-clip-text text-transparent">
                AI Video Generator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform text prompts or images into stunning videos using state-of-the-art AI models
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              {/* Input Panel */}
              <Card className="border-pink-500/20">
                <CardHeader>
                  <CardTitle>Create Video</CardTitle>
                  <CardDescription>
                    Generate videos from text descriptions or animate images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="text">Text to Video</TabsTrigger>
                      <TabsTrigger value="image">Image to Video</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Video Prompt</Label>
                        <Textarea
                          placeholder="Describe the video you want to generate..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[120px] resize-none"
                        />
                        <p className="text-xs text-muted-foreground">
                          {prompt.length} characters
                        </p>
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
                              <><Loader2 className="w-3 h-3 animate-spin" /> Enhancing...</>
                            ) : (
                              <><Wand2 className="w-3 h-3" /> Enhance Prompt</>
                            )}
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="image" className="space-y-4">
                      <div className="space-y-2">
                        <Label>Upload Image</Label>
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-pink-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-pink-500/50 transition-colors"
                        >
                          <Upload className="w-8 h-8 mx-auto mb-3 text-pink-500" />
                          <p className="text-sm font-medium mb-1">
                            {imageFile ? imageFile.name : "Click to upload image"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, WebP (max 10MB)
                          </p>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </div>

                        {imageFile && (
                          <div className="aspect-video bg-black rounded-lg overflow-hidden">
                            <img
                              src={URL.createObjectURL(imageFile)}
                              alt="Input"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="image-prompt">Animation Description (Optional)</Label>
                        <Textarea
                          id="image-prompt"
                          placeholder="Describe how you want the image to animate... (e.g., 'Camera slowly zooms in with gentle parallax effect')"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-24 resize-none"
                          maxLength={200}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="model">AI Model</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger id="model">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {models.map(m => (
                            <SelectItem key={m.value} value={m.value}>
                              <div className="flex items-center gap-2">
                                <span>{m.label}</span>
                                <Badge variant={m.tier === "free" ? "secondary" : "default"} className="text-xs">
                                  {m.tier === "free" ? "Free" : "Pro"}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedModel && (
                        <p className="text-xs text-muted-foreground">
                          {selectedModel.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger id="duration">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 seconds</SelectItem>
                          <SelectItem value="3">3 seconds</SelectItem>
                          <SelectItem value="5">5 seconds</SelectItem>
                          <SelectItem value="8">8 seconds</SelectItem>
                          <SelectItem value="10">10 seconds (Pro)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="style">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger id="style">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map(s => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.emoji} {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <Button
                    onClick={generateVideo}
                    disabled={processing || (!prompt.trim() && !imageFile)}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Wand2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Video
                      </>
                    )}
                  </Button>

                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-sm">💡 Tips for Best Results</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Be specific and descriptive in your prompts</li>
                      <li>• Include camera movements (pan, zoom, dolly)</li>
                      <li>• Mention lighting and atmosphere details</li>
                      <li>• Keep prompts focused on one main subject</li>
                      <li>• Pro models generate higher quality and longer videos</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* History Panel */}
              <div className="space-y-6">
                <Card className="border-pink-500/20">
                  <CardHeader>
                    <CardTitle>Generation History</CardTitle>
                    <CardDescription>
                      Your recent video generations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {generations.length === 0 ? (
                      <div className="text-center py-12">
                        <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No videos generated yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto">
                        {generations.map(gen => (
                          <Card key={gen.id} className="bg-muted/30">
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 space-y-1">
                                  <p className="text-sm font-medium line-clamp-2">
                                    {gen.prompt}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="outline" className="text-xs">
                                      {models.find(m => m.value === gen.model)?.label}
                                    </Badge>
                                    <span>•</span>
                                    <span>{gen.duration}s</span>
                                    <span>•</span>
                                    <span>{styles.find(s => s.value === gen.style)?.label}</span>
                                  </div>
                                </div>
                                <Badge 
                                  variant={
                                    gen.status === "complete" ? "default" :
                                    gen.status === "error" ? "destructive" :
                                    "secondary"
                                  }
                                >
                                  {gen.status}
                                </Badge>
                              </div>

                              {gen.status === "processing" && (
                                <div className="space-y-2">
                                  <Progress value={gen.progress} className="h-1" />
                                  <p className="text-xs text-muted-foreground text-center">
                                    {gen.progress}% complete
                                  </p>
                                </div>
                              )}

                              {gen.status === "complete" && gen.videoUrl && (
                                <div className="space-y-2">
                                  <div className="aspect-video bg-black rounded overflow-hidden">
                                    <video
                                      src={gen.videoUrl}
                                      controls
                                      className="w-full h-full"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => downloadVideo(gen)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </Button>
                                </div>
                              )}

                              {gen.status === "error" && (
                                <p className="text-xs text-destructive">
                                  Generation failed. Please try again.
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">📊 Model Comparison</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• <strong>SDK (Free):</strong> 2-5s, good quality, 30s gen time</li>
                    <li>• <strong>Sora 2 (Pro):</strong> Up to 20s, photorealistic, 2-5min</li>
                    <li>• <strong>Veo 3.1 (Pro):</strong> Up to 10s, cinematic, 1-3min</li>
                    <li>• <strong>Kling 3.1 (Pro):</strong> Up to 10s, fast, 1-2min</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}