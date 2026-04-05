import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Image as ImageIcon, Video, Music, Wand2, Scissors, Download, SplitSquareHorizontal,
  FileAudio, Edit3, Volume2, Mic, MonitorPlay, Film, Sparkles, RefreshCw,
  Frame, ArrowRight, Search, Wrench
} from "lucide-react";
import { useState } from "react";

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const imageGenerators = [
    { name: "FLUX.1 Pro", description: "State-of-the-art text-to-image with multiple variants", link: "/images/generate", credits: "2-5 credits", free: false },
    { name: "Nano Banana 2.0", description: "Ultra HD image generation in 10 seconds", link: "/images/generate", credits: "4-5 credits", free: false },
    { name: "Stable Diffusion 3.5", description: "Industry-standard open-source generation", link: "/images/generate", credits: "3-4 credits", free: false },
    { name: "Grok Image", description: "xAI's creative image generation", link: "/images/generate", credits: "5 credits", free: false },
    { name: "Recraft V3", description: "Perfect for logos and UI elements with text rendering", link: "/images/generate", credits: "4 credits", free: false },
    { name: "Ideogram V2", description: "Industry-leading text rendering quality", link: "/images/generate", credits: "4 credits", free: false },
    { name: "Playground V2.5", description: "Photorealistic specialist with vibrant colors", link: "/images/generate", credits: "3 credits", free: false },
    { name: "AuraFlow", description: "Open-source alternative to FLUX", link: "/images/generate", credits: "3 credits", free: false },
  ];

  const imageEditingTools = [
    { name: "Image to Image", description: "Transform images with AI guidance", link: "/images/img2img", credits: "4 credits", free: false },
    { name: "AI Inpainting", description: "Edit, remove, or replace parts of images", link: "/images/inpainting", credits: "3 credits", free: false },
    { name: "Image Upscaler", description: "Enhance resolution up to 4x with AI", link: "/images/upscaler", credits: "3 credits", free: false },
    { name: "Background Removal", description: "Pixel-perfect background removal", link: "/images/bg-remove", credits: "2 credits", free: false },
  ];

  const videoGenerators = [
    { name: "Kling 3.0", description: "Advanced video generation with 6 versions", link: "/video/generate", credits: "14-20 credits", free: false },
    { name: "Luma Dream Machine", description: "Fast, high-quality video generation", link: "/video/generate", credits: "15 credits", free: false },
    { name: "Runway Gen-3", description: "Professional-grade video generation", link: "/video/generate", credits: "18 credits", free: false },
    { name: "MiniMax Video", description: "Cost-effective video generation", link: "/video/generate", credits: "12 credits", free: false },
    { name: "Hunyuan Video", description: "Tencent's advanced video AI", link: "/video/generate", credits: "16 credits", free: false },
    { name: "Grok Video", description: "xAI's video generation model", link: "/video/generate", credits: "22 credits", free: false },
    { name: "Seedance 1.5 Pro", description: "State-of-the-art video synthesis", link: "/video/generate", credits: "20 credits", free: false },
    { name: "Sora 2.0", description: "OpenAI's revolutionary 20-second video model", link: "/video/generate", credits: "25 credits", free: false },
    { name: "Veo 3.1", description: "Google's advanced video generation AI", link: "/video/generate", credits: "18-22 credits", free: false },
    { name: "LTX-2-19B", description: "Multimodal video lab: text, image, video, audio inputs", link: "/video/generate", credits: "16 credits", free: false },
    { name: "Seedream 2.0", description: "Next-gen video synthesis from Bytedance", link: "/video/generate", credits: "20 credits", free: false, comingSoon: true },
  ];

  const videoTools = [
    { name: "Frame Extractor", description: "Extract frames from videos", link: "/extract", credits: null, free: true },
    { name: "Video Downloader", description: "Download videos from YouTube and more", link: "/download", credits: null, free: true },
    { name: "Video Splitter", description: "Split videos into segments", link: "/split", credits: null, free: true },
    { name: "Screen Recorder", description: "Record your screen activity", link: "/record-screen", credits: null, free: true },
  ];

  const audioTools = [
    {
      name: "Audio Converter",
      description: "Convert between audio formats",
      icon: RefreshCw,
      link: "/convert",
      badge: "Free",
    },
    {
      name: "Audio Editor",
      description: "Trim, fade, adjust volume & speed",
      icon: Edit3,
      link: "/edit",
      badge: "Free",
    },
    {
      name: "Stem Separator",
      description: "Split vocals, drums, bass & instruments",
      icon: Music,
      link: "/stems",
      badge: "Free",
    },
    {
      name: "Audio Enhancer",
      description: "AI-powered audio denoising",
      icon: Volume2,
      link: "/enhance",
      badge: "Free",
    },
    {
      name: "Voice Cloner",
      description: "Clone any voice with AI",
      icon: Mic,
      link: "/clone",
      badge: "Premium",
      credits: "Variable",
    },
    {
      name: "Voice Recorder",
      description: "Record high-quality audio",
      icon: Mic,
      link: "/record-voice",
      badge: "Free",
    },
    {
      name: "Transcriber",
      description: "Convert speech to text with Whisper AI",
      icon: FileAudio,
      link: "/transcriber",
      badge: "Free",
    },
  ];

  const editTools = [
    { name: "Video Editor", description: "Professional video editing suite", link: "/video-editor", credits: null, free: true },
    { name: "Image Editor", description: "Advanced image editing tools", link: "/edit?type=image", credits: null, free: true },
  ];

  // Filter function
  const filterTools = (tools: any[]) => {
    if (!searchQuery.trim()) return tools;
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredImageGenerators = filterTools(imageGenerators);
  const filteredImageEditingTools = filterTools(imageEditingTools);
  const filteredVideoGenerators = filterTools(videoGenerators);
  const filteredVideoTools = filterTools(videoTools);
  const filteredAudioTools = filterTools(audioTools);
  const filteredEditTools = filterTools(editTools);

  const hasResults = filteredImageGenerators.length > 0 || filteredImageEditingTools.length > 0 ||
                     filteredVideoGenerators.length > 0 || filteredVideoTools.length > 0 || 
                     filteredAudioTools.length > 0 || filteredEditTools.length > 0;

  const toolCategories = [
    {
      name: "Image Generators",
      icon: ImageIcon,
      color: "from-indigo-500 to-purple-500",
      tools: imageGenerators,
    },
    {
      name: "Video Generators",
      icon: Video,
      color: "from-purple-500 to-cyan-500",
      tools: videoGenerators,
    },
    {
      name: "Video Tools",
      icon: Video,
      color: "from-purple-500 to-cyan-500",
      tools: videoTools,
    },
    {
      name: "Audio Tools",
      icon: Music,
      color: "from-cyan-500 to-indigo-500",
      tools: audioTools,
    },
    {
      name: "Edit Tools",
      icon: Wand2,
      color: "from-purple-500 to-pink-500",
      tools: editTools,
    },
  ];

  return (
    <>
      <SEO
        title="All AI Tools - Back2Life.Studio"
        description="Explore our complete suite of AI-powered image, video, audio, and editing tools."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="text-center space-y-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
              <Wrench className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">100% Free Forever</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              ALL TOOLS
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              14 powerful tools that run in your browser or use free open-source models
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Image Generators */}
            {filteredImageGenerators.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Image Generators</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredImageGenerators.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {tool.credits}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Image Editing Tools */}
            {filteredImageEditingTools.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Wand2 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Image Editing</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredImageEditingTools.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {tool.credits}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Video Generators */}
            {filteredVideoGenerators.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Video Generators</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideoGenerators.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            <div className="flex gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {tool.credits}
                              </span>
                              {tool.comingSoon && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                                  Soon
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Video Tools (Non-Generators) */}
            {filteredVideoTools.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                    <Film className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Video Tools</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredVideoTools.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            {tool.free ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                Free
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {tool.credits}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Audio Tools */}
            {filteredAudioTools.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-500 flex items-center justify-center">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Audio Tools</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAudioTools.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            {tool.free ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                Free
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {tool.credits}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Edit Tools */}
            {filteredEditTools.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold">Edit Tools</h2>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEditTools.map((tool) => (
                    <Link key={tool.name} href={tool.link}>
                      <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-heading font-bold text-xl">{tool.name}</h3>
                            {tool.free ? (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                Free
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                {tool.credits}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tool.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}