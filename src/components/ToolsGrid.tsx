import { Card, CardContent } from "@/components/ui/card";
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
    category: "Video",
    free: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Video Downloader",
    description: "Download videos from YouTube and other platforms",
    icon: Download,
    href: "/download",
    badge: "Free",
    badgeVariant: "success" as const,
    category: "Video",
    free: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Video Splitter",
    description: "Split long videos into perfectly sized short clips for social media",
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
    description: "Trim, fade, adjust volume and speed like a pro editor",
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
    description: "Clean up noisy audio and boost clarity with AI",
    icon: Wand2,
    href: "/enhance",
    category: "Audio",
    free: true,
    pro: true,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Voice Cloner",
    description: "Clone voices with advanced AI voice models",
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
    description: "Full-featured video editing interface in your browser",
    icon: Film,
    href: "/video-editor",
    category: "Video",
    free: true,
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "AI Image Generator",
    description: "Generate images from text with advanced AI models",
    icon: Image,
    href: "/generate",
    category: "AI",
    free: true,
    pro: true,
    color: "from-pink-500 to-purple-500",
  },
  {
    title: "Transcriber",
    description: "Turn audio and video into text with AI transcription",
    icon: FileText,
    href: "/transcriber",
    category: "AI",
    free: true,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "AI Video Generator",
    description: "Create short videos from text prompts with AI",
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

export function ToolsGrid({ showAuthenticatedView }: ToolsGridProps = {}) {
  return (
    <section className="py-6">
      <div className="text-center mb-6">
        <h2 className="font-heading font-bold text-3xl md:text-4xl mb-2">
          All Tools
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          14 free tools + premium AI generation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    {tool.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tool.badge === "Free" 
                          ? "bg-green-500/10 text-green-500" 
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {tool.badge}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}