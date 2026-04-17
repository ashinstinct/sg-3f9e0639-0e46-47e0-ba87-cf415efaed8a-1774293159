import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Wand2, 
  Mic,
  Grid3x3,
  UserCircle,
  Wrench
} from "lucide-react";

const tools = [
  {
    name: "AI Image Generation",
    description: "Create stunning images from text with FLUX.1",
    icon: ImageIcon,
    href: "/images/generate",
    color: "from-pink-500 to-purple-500",
    badge: "Popular"
  },
  {
    name: "AI Video Generation",
    description: "Generate videos from text prompts",
    icon: Video,
    href: "/video/generate",
    color: "from-purple-500 to-indigo-500",
    badge: "New"
  },
  {
    name: "AI Avatar Videos",
    description: "Create talking avatars from photos",
    icon: UserCircle,
    href: "/avatar",
    color: "from-indigo-500 to-cyan-500",
    badge: "Hot"
  },
  {
    name: "AI Music Generator",
    description: "Compose original music with AI",
    icon: Music,
    href: "/music",
    color: "from-cyan-500 to-blue-500",
    badge: "Popular"
  },
  {
    name: "Voice Cloning",
    description: "Clone any voice with AI",
    icon: Mic,
    href: "/clone",
    color: "from-blue-500 to-purple-500",
    badge: "New"
  },
  {
    name: "Image Enhancement",
    description: "Upscale and enhance images",
    icon: Wand2,
    href: "/edit/inpaint",
    color: "from-purple-500 to-pink-500"
  },
  {
    name: "Free Tools",
    description: "14 free audio, video & image tools",
    icon: Wrench,
    href: "/free-tools",
    color: "from-emerald-500 to-green-500",
    badge: "Free"
  },
  {
    name: "All Tools",
    description: "Browse all AI tools",
    icon: Grid3x3,
    href: "/tools",
    color: "from-slate-500 to-slate-600"
  },
];

export function ToolsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Link key={tool.name} href={tool.href}>
            <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer group bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {tool.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {tool.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {tool.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}