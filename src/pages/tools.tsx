import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  Image, Video, Music, Wand2, Scissors, Download, SplitSquareHorizontal,
  FileAudio, Edit3, Volume2, Mic, MonitorPlay, Film, Sparkles, RefreshCw,
  Frame, ArrowRight
} from "lucide-react";

export default function AllToolsPage() {
  const toolCategories = [
    {
      name: "Image Tools",
      icon: Image,
      color: "from-indigo-500 to-purple-500",
      tools: [
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
      ],
    },
    {
      name: "Video Tools",
      icon: Video,
      color: "from-purple-500 to-cyan-500",
      tools: [
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
      ],
    },
    {
      name: "Audio Tools",
      icon: Music,
      color: "from-cyan-500 to-indigo-500",
      tools: [
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
      ],
    },
    {
      name: "Edit Tools",
      icon: Wand2,
      color: "from-purple-500 to-pink-500",
      tools: [
        {
          name: "Video Editor",
          description: "Full-featured video editing suite",
          icon: Scissors,
          link: "/video-editor",
          badge: "Free",
        },
        {
          name: "Image Editor",
          description: "Professional image editing tools",
          icon: Wand2,
          link: "/edit?type=image",
          badge: "Premium",
          credits: "Variable",
        },
      ],
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
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="font-heading font-bold text-5xl md:text-6xl bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
              All Tools
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our complete suite of AI-powered tools for image, video, audio, and editing
            </p>
          </div>

          {/* Tool Categories */}
          <div className="space-y-16">
            {toolCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.name}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                      <CategoryIcon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="font-heading font-bold text-3xl">{category.name}</h2>
                  </div>

                  {/* Tools Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <Link key={tool.name} href={tool.link}>
                          <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                                  <ToolIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex gap-2">
                                  {tool.badge === "Free" ? (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                      Free
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      Premium
                                    </span>
                                  )}
                                </div>
                              </div>

                              <h3 className="font-heading font-bold text-xl mb-2">
                                {tool.name}
                              </h3>
                              
                              <p className="text-sm text-muted-foreground mb-4">
                                {tool.description}
                              </p>

                              {tool.credits && (
                                <div className="text-xs text-muted-foreground">
                                  {tool.credits}
                                </div>
                              )}

                              <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                Try it now
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

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