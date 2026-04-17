import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Wand2, FileAudio, Scissors, Volume2, Eraser, Layers, Repeat, Music } from "lucide-react";
import Link from "next/link";

const FREE_TOOLS = [
  {
    title: "Audio Converter",
    description: "Convert between MP3, WAV, M4A, FLAC, OGG formats",
    icon: Repeat,
    href: "/convert",
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Audio Editor",
    description: "Trim, fade, adjust volume and speed",
    icon: Scissors,
    href: "/audio-editor",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Stem Separator",
    description: "Split vocals, drums, bass and instruments",
    icon: Layers,
    href: "/stems",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Voice Recorder",
    description: "Record high-quality voice memos instantly",
    icon: Mic,
    href: "/record-voice",
    color: "from-pink-500 to-rose-500",
  },
];

const PREMIUM_TOOLS = [
  {
    title: "AI Audio Enhancer",
    description: "Remove noise and improve audio quality with AI",
    icon: Wand2,
    href: "/enhance",
    color: "from-purple-500 to-pink-500",
    pricing: "Premium"
  },
  {
    title: "AI Music Generator",
    description: "Generate original music from text prompts",
    icon: Music,
    href: "/music",
    color: "from-green-500 to-emerald-500",
    pricing: "Premium"
  },
  {
    title: "AI Transcriber",
    description: "Convert speech to text with AI precision",
    icon: FileAudio,
    href: "/transcriber",
    color: "from-indigo-500 to-purple-500",
    pricing: "Premium"
  },
  {
    title: "AI Voice Clone",
    description: "Clone any voice with AI technology",
    icon: Volume2,
    href: "/clone",
    color: "from-red-500 to-pink-500",
    pricing: "Premium"
  },
];

export default function AudioPage() {
  return (
    <>
      <SEO 
        title="Audio Tools - Back2Life.Studio"
        description="Professional audio tools for editing, conversion, enhancement, and AI-powered features"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header - Centered */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Mic className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Audio Tools</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Audio Tools
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Professional audio editing, conversion, and AI-powered enhancement tools
              </p>
            </div>

            {/* Free Tools Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <h2 className="text-2xl font-bold text-emerald-400">Free Tools</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {FREE_TOOLS.map((tool) => (
                  <Link key={tool.title} href={tool.href}>
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50 transition-all h-full group cursor-pointer">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}>
                            <tool.icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-emerald-500/50 text-emerald-300">
                            Free
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-slate-400">{tool.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Premium Tools Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                <h2 className="text-2xl font-bold text-purple-400">Premium Tools</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {PREMIUM_TOOLS.map((tool) => (
                  <Link key={tool.title} href={tool.href}>
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all h-full group cursor-pointer">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} group-hover:scale-110 transition-transform`}>
                            <tool.icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                            {tool.pricing}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-sm text-slate-400">{tool.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}