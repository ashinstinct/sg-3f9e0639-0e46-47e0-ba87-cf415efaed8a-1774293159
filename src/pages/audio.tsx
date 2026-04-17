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
    href: "/edit",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Audio Enhancer",
    description: "Remove background noise and improve clarity",
    icon: Wand2,
    href: "/enhance",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Stem Separator",
    description: "Split vocals, drums, bass and instruments",
    icon: Layers,
    href: "/stems",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Voice Cloner",
    description: "Clone any voice with AI technology",
    icon: FileAudio,
    href: "/clone",
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Voice Recorder",
    description: "Record high-quality audio directly in browser",
    icon: Mic,
    href: "/record-voice",
    color: "from-green-500 to-emerald-500",
  },
];

const PREMIUM_TOOLS = [
  {
    title: "Audio Enhancer Pro",
    description: "Professional AI denoising with Adobe Podcast API",
    icon: Wand2,
    href: "/enhance",
    color: "from-purple-500 to-pink-500",
    credits: 50,
  },
  {
    title: "Stem Separator Pro",
    description: "Studio-quality stem separation with lalal.ai",
    icon: Layers,
    href: "/stems",
    color: "from-orange-500 to-red-500",
    credits: 75,
  },
  {
    title: "Voice Cloner Pro",
    description: "Premium voice cloning with Fish Audio",
    icon: FileAudio,
    href: "/clone",
    color: "from-pink-500 to-rose-500",
    credits: 100,
  },
];

export default function AudioPage() {
  return (
    <>
      <SEO 
        title="Audio Tools - Back2Life.Studio"
        description="Professional audio editing, enhancement, and AI voice tools"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Centered Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Audio Tools</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Audio Tools
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Professional audio editing, enhancement, and AI voice cloning tools
              </p>
            </div>

            {/* Free Tools Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Free Tools</h2>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-300">
                  Always Free
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FREE_TOOLS.map((tool) => (
                  <Link key={tool.title} href={tool.href}>
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all h-full cursor-pointer group">
                      <CardContent className="p-6 space-y-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} w-fit`}>
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-slate-400 text-sm">{tool.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Premium Tools Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Premium Tools</h2>
                <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                  Credits Required
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PREMIUM_TOOLS.map((tool) => (
                  <Link key={tool.title} href={tool.href}>
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all h-full cursor-pointer group">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color}`}>
                            <tool.icon className="w-6 h-6 text-white" />
                          </div>
                          <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                            {tool.credits} credits
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-slate-400 text-sm">{tool.description}</p>
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