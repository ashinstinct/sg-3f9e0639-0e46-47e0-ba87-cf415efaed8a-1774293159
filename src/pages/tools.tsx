import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useState } from "react";
import { 
  ImageIcon, Video, Music, Wand2, Scissors, Download, SplitSquareHorizontal,
  FileAudio, Edit3, Volume2, Mic, MonitorPlay, Film, Sparkles, RefreshCw,
  Frame, ArrowRight, Search
} from "lucide-react";

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const imageGenerators = [
    { title: "FLUX.1 Schnell", description: "State-of-the-art text-to-image with multiple variants", href: "/images/generate", free: false, color: "from-purple-500 to-pink-500" },
    { title: "Nano Banana 2.0", description: "Ultra HD image generation in 10 seconds", href: "/images/generate", free: false, color: "from-indigo-500 to-purple-500" },
    { title: "Stable Diffusion 3.5", description: "Industry-standard open-source generation", href: "/images/generate", free: false, color: "from-purple-500 to-blue-500" },
    { title: "Grok Aurora", description: "xAI's creative image generation", href: "/images/generate", free: false, color: "from-cyan-500 to-indigo-500" },
    { title: "Recraft V3", description: "Perfect for logos and UI elements with text rendering", href: "/images/generate", free: false, color: "from-pink-500 to-rose-500" },
    { title: "Ideogram V2", description: "Industry-leading text rendering quality", href: "/images/generate", free: false, color: "from-violet-500 to-purple-500" },
    { title: "Playground V2.5", description: "Photorealistic specialist with vibrant colors", href: "/images/generate", free: false, color: "from-indigo-500 to-blue-500" },
    { title: "AuraFlow", description: "Open-source alternative to FLUX", href: "/images/generate", free: false, color: "from-blue-500 to-cyan-500" },
  ];

  const imageEditingTools = [
    { title: "Image to Image", description: "Transform images with AI guidance", href: "/images/img2img", free: false, color: "from-purple-500 to-pink-500" },
    { title: "AI Inpainting", description: "Edit, remove, or replace parts of images", href: "/images/inpainting", free: false, color: "from-pink-500 to-rose-500" },
    { title: "Image Upscaler", description: "Enhance resolution up to 4x with AI", href: "/images/upscaler", free: false, color: "from-indigo-500 to-purple-500" },
    { title: "Background Removal", description: "Pixel-perfect background removal", href: "/images/bg-remove", free: false, color: "from-blue-500 to-cyan-500" },
  ];

  const videoGenerators = [
    { title: "Kling 3.0", description: "Advanced video generation with 6 versions", href: "/video/generate", free: false, color: "from-purple-500 to-pink-500" },
    { title: "Luma Dream Machine", description: "Fast, high-quality video generation", href: "/video/generate", free: false, color: "from-indigo-500 to-blue-500" },
    { title: "Runway Gen-3", description: "Professional-grade video generation", href: "/video/generate", free: false, color: "from-blue-500 to-cyan-500" },
    { title: "MiniMax Video", description: "Cost-effective video generation", href: "/video/generate", free: false, color: "from-cyan-500 to-emerald-500" },
    { title: "Hunyuan Video", description: "Tencent's advanced video AI", href: "/video/generate", free: false, color: "from-pink-500 to-rose-500" },
    { title: "Grok Video", description: "xAI's video generation model", href: "/video/generate", free: false, color: "from-purple-500 to-indigo-500" },
    { title: "Seedance 1.5 Pro", description: "State-of-the-art video synthesis", href: "/video/generate", free: false, color: "from-violet-500 to-purple-500" },
    { title: "Sora 2.0", description: "OpenAI's revolutionary 20-second video model", href: "/video/generate", free: false, color: "from-emerald-500 to-teal-500" },
    { title: "Veo 3.1", description: "Google's advanced video generation AI", href: "/video/generate", free: false, color: "from-blue-500 to-indigo-500" },
    { title: "LTX-2-19B", description: "Multimodal video lab: text, image, video, audio", href: "/video/generate", free: false, color: "from-rose-500 to-pink-500" },
    { title: "Seedream 2.0", description: "Next-gen video synthesis from Bytedance", href: "/video/generate", free: false, color: "from-indigo-500 to-violet-500" },
  ];

  const videoTools = [
    { title: "Frame Extractor", description: "Extract frames from videos", href: "/extract", free: true, color: "from-purple-500 to-pink-500", icon: Frame },
    { title: "Video Downloader", description: "Download videos from YouTube and more", href: "/download", free: true, color: "from-blue-500 to-cyan-500", icon: Download },
    { title: "Video Splitter", description: "Split videos into segments", href: "/split", free: true, color: "from-indigo-500 to-purple-500", icon: SplitSquareHorizontal },
    { title: "Screen Recorder", description: "Record your screen activity", href: "/record-screen", free: true, color: "from-pink-500 to-rose-500", icon: MonitorPlay },
  ];

  const audioTools = [
    { title: "Audio Converter", description: "Convert between audio formats", href: "/convert", free: true, color: "from-green-500 to-emerald-500", icon: RefreshCw },
    { title: "Audio Editor", description: "Trim, fade, adjust volume & speed", href: "/edit", free: true, color: "from-blue-500 to-indigo-500", icon: Edit3 },
    { title: "Stem Separator", description: "Split vocals, drums, bass & instruments", href: "/stems", free: true, color: "from-pink-500 to-rose-500", icon: Music },
    { title: "Audio Enhancer", description: "AI-powered audio denoising", href: "/enhance", free: true, color: "from-cyan-500 to-blue-500", icon: Volume2 },
    { title: "Voice Cloner", description: "Clone any voice with AI", href: "/clone", free: false, color: "from-indigo-500 to-purple-500", icon: Mic },
    { title: "Voice Recorder", description: "Record high-quality audio", href: "/record-voice", free: true, color: "from-emerald-500 to-teal-500", icon: Mic },
    { title: "Transcriber", description: "Convert speech to text with Whisper AI", href: "/transcriber", free: true, color: "from-cyan-500 to-blue-500", icon: FileAudio },
  ];

  const editTools = [
    { title: "Video Editor", description: "Professional video editing suite", href: "/video-editor", free: true, color: "from-purple-500 to-violet-500", icon: Film },
    { title: "Image Editor", description: "Advanced image editing tools", href: "/edit?type=image", free: true, color: "from-pink-500 to-rose-500", icon: Wand2 },
  ];

  // Filter function
  const filterTools = (tools: any[]) => {
    if (!searchQuery.trim()) return tools;
    return tools.filter(tool => 
      tool.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase())
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

  return (
    <>
      <SEO
        title="All AI Tools - Back2Life.Studio"
        description="Explore our complete suite of AI-powered image, video, audio, and editing tools."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-20 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4 mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">All AI Tools</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                39 Tools & Features
              </h1>
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                Professional audio, video, and image tools. Free forever for basic tools, Pro for advanced AI models.
              </p>
            </div>

            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {!hasResults ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No tools found matching your search.</p>
              </div>
            ) : (
              <>
                {/* Image Generators */}
                {filteredImageGenerators.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-purple-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Image Generators</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredImageGenerators.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  <ImageIcon className="w-6 h-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                  Pro
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Image Editing Tools */}
                {filteredImageEditingTools.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-pink-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Image Editing</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredImageEditingTools.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  <Wand2 className="w-6 h-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                  Pro
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Video Generators */}
                {filteredVideoGenerators.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-indigo-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Video Generators</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredVideoGenerators.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  <Video className="w-6 h-6 text-white" />
                                </div>
                                <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                  Pro
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Video Tools */}
                {filteredVideoTools.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-cyan-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Video Tools</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredVideoTools.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  {tool.icon && <tool.icon className="w-6 h-6 text-white" />}
                                </div>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Free
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Audio Tools */}
                {filteredAudioTools.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-pink-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Audio Tools</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredAudioTools.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  {tool.icon && <tool.icon className="w-6 h-6 text-white" />}
                                </div>
                                <div className="flex gap-2">
                                  {tool.free ? (
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                      Free
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                                      Pro
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Edit Tools */}
                {filteredEditTools.length > 0 && (
                  <section className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-violet-500 rounded-full" />
                      <h2 className="text-2xl font-bold">Edit Tools</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredEditTools.map((tool, index) => (
                        <Link key={index} href={tool.href}>
                          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                <div className={`p-3 rounded-lg ${tool.color}`}>
                                  {tool.icon && <tool.icon className="w-6 h-6 text-white" />}
                                </div>
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Free
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary transition-colors">
                                {tool.title}
                              </CardTitle>
                              <CardDescription>{tool.description}</CardDescription>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}