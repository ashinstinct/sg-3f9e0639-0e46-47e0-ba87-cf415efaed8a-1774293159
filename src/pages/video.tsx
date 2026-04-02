import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Film, Sparkles, Video, Zap } from "lucide-react";
import Link from "next/link";

export default function VideoPage() {
  const proVideoTools = [
    {
      title: "Kling 3.0",
      description: "Next-generation video synthesis with exceptional motion quality and temporal consistency",
      icon: Film,
      href: "/video-gen?model=kling-3",
      credits: 20,
      color: "from-blue-500 to-cyan-500",
      comingSoon: true,
    },
    {
      title: "Seedream 2.0",
      description: "Create cinematic videos from text with advanced scene understanding",
      icon: Sparkles,
      href: "/video-gen?model=seedream-2",
      credits: 25,
      color: "from-violet-500 to-purple-500",
      comingSoon: true,
    },
    {
      title: "Sora 2.0",
      description: "OpenAI's cutting-edge video model for photorealistic generations",
      icon: Video,
      href: "/video-gen?model=sora-2",
      credits: 30,
      color: "from-emerald-500 to-teal-500",
      comingSoon: true,
    },
    {
      title: "Veo 3.1",
      description: "Google's advanced video generation with precise control and long-form support",
      icon: Zap,
      href: "/video-gen?model=veo-3",
      credits: 28,
      color: "from-orange-500 to-red-500",
      comingSoon: true,
    },
    {
      title: "Wan 2.2",
      description: "High-fidelity video generation optimized for commercial use",
      icon: Film,
      href: "/video-gen?model=wan-2",
      credits: 22,
      color: "from-indigo-500 to-blue-500",
      comingSoon: true,
    },
  ];

  return (
    <>
      <SEO
        title="Pro Video Tools | Back2Life.Studio"
        description="Professional AI-powered video generation tools. Create stunning videos with Kling 3.0, Seedream 2.0, Sora 2.0, and more."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                <Film className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Professional Video Tools
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                State-of-the-art AI video generation models. Create cinematic content with Kling 3.0, Seedream 2.0, Sora 2.0, and more.
              </p>
            </div>

            {/* Pro Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {proVideoTools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                            Pro
                          </Badge>
                          {tool.comingSoon && (
                            <Badge variant="outline">Coming Soon</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>{tool.credits} credits per video</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Free Alternatives */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-heading font-bold text-xl mb-2">
                  Free Video Editing
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Full-featured video editor, splitter, and frame extractor - no credits needed
                </p>
                <Link href="/free-tools#video" className="text-primary font-medium hover:underline text-sm">
                  Browse Free Video Tools →
                </Link>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-heading font-bold text-xl mb-2">
                  Basic AI Video Gen
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Try our free AI video generator with basic models
                </p>
                <Link href="/video-gen" className="text-primary font-medium hover:underline text-sm">
                  Try Free Video Generator →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}