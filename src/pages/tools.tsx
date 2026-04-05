import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Image, Video, Music, Wand2, Scissors, Download, SplitSquareHorizontal,
  FileAudio, Edit3, Volume2, Mic, MonitorPlay, Film, Sparkles, RefreshCw,
  Frame, ArrowRight, Search
} from "lucide-react";
import { useState } from "react";

export default function ToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const imageTools = [
    {
      name: "FLUX.1 Pro",
      description: "State-of-the-art text-to-image generation",
      icon: Sparkles,
      link: "/images/generate",
      badge: "Premium",
      credits: "2-5 credits",
    },
    {
      name: "Nano Banana 2.0",
      description: "Best 4K image model ever",
      icon: Image,
      link: "/images/generate",
      badge: "Premium",
      credits: "4-5 credits",
    },
    {
      name: "Grok Image",
      description: "Creative AI interpretations",
      icon: Sparkles,
      link: "/images/generate",
      badge: "Premium",
      credits: "5 credits",
    },
    {
      name: "Stable Diffusion 3.5",
      description: "Industry-standard open-source models",
      icon: Image,
      link: "/images/generate",
      badge: "Premium",
      credits: "3-4 credits",
    },
    {
      name: "AI Image Generator",
      description: "Free FLUX.1-Schnell image generation",
      icon: Image,
      link: "/generate",
      badge: "Free",
    },
  ];

  const videoTools = [
    {
      name: "Kling 3.0",
      description: "Cinema-grade video generation",
      icon: Video,
      link: "/video/generate",
      badge: "Premium",
      credits: "14-20 credits",
    },
    {
      name: "Seedance 1.5 Pro",
      description: "Cinematic multi-shot videos",
      icon: Film,
      link: "/video/generate",
      badge: "Premium",
      credits: "20 credits",
    },
    {
      name: "Luma Dream Machine",
      description: "Fast, high-quality video generation",
      icon: Video,
      link: "/video/generate",
      badge: "Premium",
      credits: "15 credits",
    },
    {
      name: "Runway Gen-3",
      description: "Professional-grade video generation",
      icon: Film,
      link: "/video/generate",
      badge: "Premium",
      credits: "18 credits",
    },
    {
      name: "Frame Extractor",
      description: "Extract frames from videos",
      icon: Frame,
      link: "/extract",
      badge: "Free",
    },
    {
      name: "Video Downloader",
      description: "Download videos from YouTube & more",
      icon: Download,
      link: "/download",
      badge: "Free",
    },
    {
      name: "Video Splitter",
      description: "Split videos into segments",
      icon: SplitSquareHorizontal,
      link: "/split",
      badge: "Free",
    },
    {
      name: "Screen Recorder",
      description: "Record your screen activity",
      icon: MonitorPlay,
      link: "/record-screen",
      badge: "Free",
    },
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

  const filteredImageTools = filterTools(imageTools);
  const filteredVideoTools = filterTools(videoTools);
  const filteredAudioTools = filterTools(audioTools);
  const filteredEditTools = filterTools(editTools);

  const hasResults = filteredImageTools.length > 0 || filteredVideoTools.length > 0 || 
                     filteredAudioTools.length > 0 || filteredEditTools.length > 0;

  const toolCategories = [
    {
      name: "Image Tools",
      icon: Image,
      color: "from-indigo-500 to-purple-500",
      tools: imageTools,
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

  const filterTools = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    return toolCategories.map((category) => {
      const filteredTools = category.tools.filter((tool) => {
        const nameMatch = tool.name.toLowerCase().includes(lowerCaseQuery);
        const descriptionMatch = tool.description.toLowerCase().includes(lowerCaseQuery);
        return nameMatch || descriptionMatch;
      });
      return { ...category, tools: filteredTools };
    });
  };

  const filteredCategories = filterTools(searchQuery);

  return (
    <>
      <SEO
        title="All AI Tools - Back2Life.Studio"
        description="Explore our complete suite of AI-powered image, video, audio, and editing tools."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-500">All Tools in One Place</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl md:text-7xl bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
              Explore All Tools
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Professional AI tools for images, videos, audio, and editing
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-muted/50 border border-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* No Results Message */}
          {!hasResults && searchQuery && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No tools found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Image Tools */}
          {filteredImageTools.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-3xl font-bold">Image Tools</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredImageTools.map((tool) => (
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

          {/* Video Tools */}
          {filteredVideoTools.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
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

          {/* Bottom CTA */}
          <Card className="mt-16 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-indigo-500/20">
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold text-xl mb-2">Ready to create?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start with our free tools or unlock premium features with credits
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/free-tools" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                  Free Tools
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors font-medium">
                  Get Credits
                  <Sparkles className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}