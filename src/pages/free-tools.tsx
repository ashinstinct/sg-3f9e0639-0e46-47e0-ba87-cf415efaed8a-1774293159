import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Camera, Download, SplitSquareHorizontal, AudioLines, Settings, 
  Music, Wand2, Mic, MonitorPlay, Film, Image as ImageIcon, 
  FileText, Sparkles, Scissors
} from "lucide-react";

const audioTools = [
  {
    title: "Audio Converter",
    description: "Convert between MP3, WAV, M4A, FLAC, and more",
    icon: AudioLines,
    href: "/convert",
    free: true,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Audio Editor",
    description: "Trim, fade, adjust volume and speed for professional editing",
    icon: Scissors,
    href: "/audio-editor",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Audio Enhancer",
    description: "Clean up noisy audio and boost clarity with AI",
    icon: Wand2,
    href: "/enhance",
    free: true,
    pro: true,
    color: "from-cyan-500 to-blue-500",
  },
  {
    title: "Stem Separator",
    description: "Isolate vocals, drums, bass, and instruments",
    icon: Music,
    href: "/stems",
    free: true,
    pro: true,
    color: "from-pink-500 to-rose-500",
  },
  {
    title: "Voice Recorder",
    description: "Record high-quality audio in your browser",
    icon: Mic,
    href: "/record-voice",
    free: true,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: "Voice Cloner",
    description: "Clone voices with advanced AI voice models",
    icon: Mic,
    href: "/clone",
    pro: true,
    color: "from-indigo-500 to-purple-500",
  },
  {
    title: "Transcriber",
    description: "Turn audio and video into text with AI transcription",
    icon: FileText,
    href: "/transcriber",
    free: true,
    color: "from-cyan-500 to-blue-500",
  },
];

const videoTools = [
  {
    title: "Frame Extractor",
    description: "Extract frames from videos with precision",
    icon: Camera,
    href: "/extract",
    free: true,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Video Downloader",
    description: "Download videos from YouTube and other platforms",
    icon: Download,
    href: "/download",
    free: true,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Video Splitter",
    description: "Split long videos into perfectly sized short clips for social media",
    icon: SplitSquareHorizontal,
    href: "/split",
    free: true,
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Screen Recorder",
    description: "Capture your screen with audio",
    icon: MonitorPlay,
    href: "/record-screen",
    free: true,
    pro: true,
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Video Editor",
    description: "Full-featured video editing interface in your browser",
    icon: Film,
    href: "/video-editor",
    free: true,
    color: "from-purple-500 to-violet-500",
  },
  {
    title: "AI Video Generator",
    description: "Create short videos from text prompts with AI",
    icon: Sparkles,
    href: "/video-gen",
    free: true,
    pro: true,
    color: "from-violet-500 to-fuchsia-500",
  },
];

const imageTools = [
  {
    title: "AI Image Generator",
    description: "Generate images from text with advanced AI models",
    icon: ImageIcon,
    href: "/generate",
    free: true,
    pro: true,
    color: "from-pink-500 to-purple-500",
  },
  {
    title: "Image to Prompt",
    description: "Reverse engineer images into text prompts or JSON metadata",
    icon: ImageIcon,
    href: "/image-to-prompt",
    free: true,
    pro: true,
    color: "from-indigo-500 to-purple-500",
  },
];

export default function FreeTools() {
  return (
    <>
      <SEO
        title="Free Tools - Back2Life.Studio"
        description="14 free AI-powered tools for audio, video, and image processing. No signup required."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-300">100% Free Forever</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-emerald-400">
                12 FREE Tools
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Professional audio, video, and image tools. No credit card required. No limits.
              </p>
            </div>

            {/* Audio Tools */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-green-500 rounded-full" />
                <h2 className="font-heading font-bold text-3xl">Audio Tools</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`p-3 rounded-lg ${tool.color}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                              {tool.free && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Free
                                </Badge>
                              )}
                              {tool.pro && (
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
                  );
                })}
              </div>
            </section>

            {/* Video Tools */}
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-blue-500 rounded-full" />
                <h2 className="font-heading font-bold text-3xl">Video Tools</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videoTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`p-3 rounded-lg ${tool.color}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                              {tool.free && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Free
                                </Badge>
                              )}
                              {tool.pro && (
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
                  );
                })}
              </div>
            </section>

            {/* Image Tools */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-pink-500 rounded-full" />
                <h2 className="font-heading font-bold text-3xl">Image Tools</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className={`p-3 rounded-lg ${tool.color}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex gap-2">
                              {tool.free && (
                                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                                  Free
                                </Badge>
                              )}
                              {tool.pro && (
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
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}