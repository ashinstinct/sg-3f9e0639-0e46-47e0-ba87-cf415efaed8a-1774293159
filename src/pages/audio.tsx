import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Wand2, FileAudio, Scissors, Volume2, Eraser, Layers, Repeat, Music } from "lucide-react";
import Link from "next/link";

const FREE_TOOLS = [
  {
    title: "Voice Recorder",
    description: "Record audio directly in your browser",
    icon: Mic,
    href: "/record-voice",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Audio Converter",
    description: "Convert between MP3, WAV, M4A and more",
    icon: Repeat,
    href: "/convert",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Audio Editor",
    description: "Trim, fade, and adjust your audio files",
    icon: Scissors,
    href: "/edit",
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Stem Separator",
    description: "Split vocals, drums, bass and instruments",
    icon: Layers,
    href: "/stems",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Audio Enhancer",
    description: "Remove noise and improve audio quality",
    icon: Volume2,
    href: "/enhance",
    color: "from-emerald-500 to-green-500",
  },
  {
    title: "Transcriber",
    description: "Convert speech to text with AI",
    icon: FileAudio,
    href: "/transcriber",
    color: "from-pink-500 to-rose-500",
  },
];

const PAID_TOOLS = [
  {
    title: "AI Music Generator",
    description: "Create original music with SUNO AI",
    icon: Music,
    href: "/music",
    color: "from-violet-500 to-purple-500",
    credits: 20,
  },
  {
    title: "Voice Cloner",
    description: "Clone any voice with AI",
    icon: Wand2,
    href: "/clone",
    color: "from-cyan-500 to-blue-500",
    credits: 15,
  },
];

export default function AudioPage() {
  return (
    <>
      <SEO
        title="Audio Tools - Free & Premium"
        description="Professional audio tools for recording, editing, and AI generation"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-8 pt-20 max-w-7xl">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Audio Tools
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Professional audio tools for every need
            </p>
          </div>

          {/* Free Tools Section */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-heading font-bold text-2xl">Free Tools</h2>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-0">
                No Credits Required
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {FREE_TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="group h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-4 sm:p-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                      <div className="mt-4">
                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/50">
                          Free
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Premium Tools Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="font-heading font-bold text-2xl">Premium Tools</h2>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                Credits Required
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {PAID_TOOLS.map((tool) => (
                <Link key={tool.href} href={tool.href}>
                  <Card className="group h-full bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-4 sm:p-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {tool.description}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0">
                          {tool.credits} credits
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}