import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, Video, Scissors, Music, Wand2, Mic, 
  MonitorPlay, Film, Sparkles, Download, SplitSquareHorizontal,
  AudioLines, Settings, FileText, ImageIcon, Camera
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    title: "Frame Extractor",
    description: "Extract frames from videos with precision",
    icon: Camera,
    href: "/extract",
    badge: "Free",
    badgeVariant: "success" as const,
  },
  {
    title: "Video Downloader",
    description: "Download videos from YouTube and other platforms",
    icon: Download,
    href: "/download",
    badge: "Free",
    badgeVariant: "success" as const,
  },
  {
    title: "Video Splitter",
    description: "Split videos into timed segments with FFmpeg",
    icon: SplitSquareHorizontal,
    href: "/split",
    category: "Video",
    free: true,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Audio Converter",
    description: "Convert between MP3, WAV, M4A, FLAC, and more",
    icon: AudioLines,
    href: "/convert",
    category: "Audio",
    free: true,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Audio Editor",
    description: "Trim, fade, adjust volume and speed like CapCut",
    icon: Settings,
    href: "/edit",
    category: "Audio",
    free: true,
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Stem Separator",
    description: "Isolate vocals, drums, bass, and instruments",
    icon: Music,
    href: "/stems",
    category: "Audio",
    free: true,
    pro: true,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Audio Enhancer",
    description: "AI-powered noise reduction and audio enhancement",
    icon: Wand2,
    href: "/enhance",
    category: "Audio",
    free: true,
    pro: true,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Voice Cloner",
    description: "Clone voices with E2-F5-TTS and Fish Audio",
    icon: Mic,
    href: "/clone",
    category: "Audio",
    pro: true,
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Voice Recorder",
    description: "Record high-quality audio in your browser",
    icon: Mic,
    href: "/record-voice",
    category: "Audio",
    free: true,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Screen Recorder",
    description: "Capture your screen with audio",
    icon: MonitorPlay,
    href: "/record-screen",
    category: "Video",
    free: true,
    pro: true,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Video Editor",
    description: "Full-featured video editing suite",
    icon: Film,
    href: "/video-editor",
    category: "Video",
    free: true,
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "AI Image Generator",
    description: "Generate images with FLUX, Midjourney, and more",
    icon: Image,
    href: "/generate",
    category: "AI",
    free: true,
    pro: true,
    color: "from-pink-500 to-purple-500",
  },
  {
    title: "Transcriber",
    description: "Transcribe audio and video with Whisper AI",
    icon: FileText,
    href: "/transcriber",
    category: "AI",
    free: true,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "AI Video Generator",
    description: "Create videos with Sora, Veo, Kling, and more",
    icon: Sparkles,
    href: "/video-gen",
    category: "AI",
    free: true,
    pro: true,
    color: "from-violet-500 to-fuchsia-500",
  },
  {
    title: "Image to Prompt",
    description: "Reverse engineer images into text prompts or JSON metadata",
    icon: ImageIcon,
    href: "/image-to-prompt",
    category: "AI",
    free: true,
    pro: true,
    color: "from-indigo-500 to-purple-500",
  },
];

interface ToolsGridProps {
  showAuthenticatedView?: boolean;
}

export function ToolsGrid({ showAuthenticatedView = false }: ToolsGridProps) {
  return (
    <section id="tools" className={showAuthenticatedView ? "py-2" : "py-20 bg-surface-tint"}>
      <div className="container mx-auto px-4">
        {!showAuthenticatedView && (
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-heading font-bold text-4xl md:text-5xl mb-4">
              All Tools in One Place
            </h2>
            <p className="text-lg text-muted-foreground">
              Professional media tools that work in your browser or powered by cutting-edge AI
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white drop-shadow-sm" />
                      </div>
                      <div className="flex gap-2">
                        {tool.free && (
                          <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                            Free
                          </Badge>
                        )}
                        {tool.pro && (
                          <Badge variant="secondary" className="text-xs bg-brand-purple/10 text-brand-purple dark:text-purple-400 border-brand-purple/20">
                            Pro
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="font-heading text-xl group-hover:text-primary transition-colors">
                      {tool.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}