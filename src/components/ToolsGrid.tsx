import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Download, 
  Scissors, 
  Music, 
  Volume2, 
  Mic, 
  MonitorPlay,
  Wand2,
  FileText,
  Camera,
  Sparkles,
  ImageIcon,
  Layers,
  Edit
} from "lucide-react";
import Link from "next/link";

const tools = [
  {
    id: "generate",
    name: "AI Generator",
    description: "Generate images & videos with 20+ AI models",
    icon: Sparkles,
    href: "/generate",
    badge: "HOT",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    preview: "linear-gradient(135deg, rgb(168, 85, 247), rgb(99, 102, 241))",
  },
  {
    id: "extract",
    name: "Frame Extractor",
    description: "Extract frames from videos instantly",
    icon: Camera,
    href: "/extract",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))",
  },
  {
    id: "download",
    name: "Video Downloader",
    description: "Download videos from YouTube & more",
    icon: Download,
    href: "/download",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(59, 130, 246), rgb(37, 99, 235))",
  },
  {
    id: "split",
    name: "Video Splitter",
    description: "Split videos into timed segments",
    icon: Scissors,
    href: "/split",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(236, 72, 153), rgb(219, 39, 119))",
  },
  {
    id: "convert",
    name: "Audio Converter",
    description: "Convert audio between formats",
    icon: Music,
    href: "/convert",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(251, 146, 60), rgb(249, 115, 22))",
  },
  {
    id: "edit",
    name: "Audio Editor",
    description: "Trim, fade, adjust volume & speed",
    icon: Edit,
    href: "/edit",
    badge: "NEW",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    preview: "linear-gradient(135deg, rgb(34, 211, 238), rgb(6, 182, 212))",
  },
  {
    id: "stems",
    name: "Stem Separator",
    description: "Extract vocals, drums, bass & more",
    icon: Layers,
    href: "/stems",
    badge: "HOT",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    preview: "linear-gradient(135deg, rgb(139, 92, 246), rgb(124, 58, 237))",
  },
  {
    id: "enhance",
    name: "Audio Enhancer",
    description: "AI-powered audio enhancement",
    icon: Volume2,
    href: "/enhance",
    badge: "NEW",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    preview: "linear-gradient(135deg, rgb(245, 158, 11), rgb(217, 119, 6))",
  },
  {
    id: "clone",
    name: "Voice Cloner",
    description: "Clone any voice with AI",
    icon: Mic,
    href: "/clone",
    badge: "HOT",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    preview: "linear-gradient(135deg, rgb(244, 63, 94), rgb(225, 29, 72))",
  },
  {
    id: "record-voice",
    name: "Voice Recorder",
    description: "Record audio in your browser",
    icon: Mic,
    href: "/record-voice",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(14, 165, 233), rgb(2, 132, 199))",
  },
  {
    id: "record-screen",
    name: "Screen Recorder",
    description: "Record your screen instantly",
    icon: MonitorPlay,
    href: "/record-screen",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(168, 85, 247), rgb(147, 51, 234))",
  },
  {
    id: "video-editor",
    name: "Video Editor",
    description: "Professional video editing",
    icon: Video,
    href: "/video-editor",
    badge: "NEW",
    badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    preview: "linear-gradient(135deg, rgb(249, 115, 22), rgb(234, 88, 12))",
  },
  {
    id: "transcriber",
    name: "Transcriber",
    description: "Convert speech to text with AI",
    icon: FileText,
    href: "/transcriber",
    badge: "FREE",
    badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    preview: "linear-gradient(135deg, rgb(52, 211, 153), rgb(16, 185, 129))",
  },
  {
    id: "image-gen",
    name: "Image Generator",
    description: "Create images with AI",
    icon: ImageIcon,
    href: "/images/generate",
    badge: "HOT",
    badgeColor: "bg-red-500/10 text-red-500 border-red-500/20",
    preview: "linear-gradient(135deg, rgb(236, 72, 153), rgb(219, 39, 119))",
  },
];

export function ToolsGrid() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link key={tool.id} href={tool.href}>
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
              {/* Visual preview */}
              <div 
                className="h-32 relative overflow-hidden"
                style={{ background: tool.preview }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                </div>
                
                {/* Badge */}
                {tool.badge && (
                  <Badge
                    className={`absolute top-2 right-2 ${tool.badgeColor} font-semibold text-xs px-2 py-0.5`}
                  >
                    {tool.badge}
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  {tool.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  {tool.description}
                </p>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}