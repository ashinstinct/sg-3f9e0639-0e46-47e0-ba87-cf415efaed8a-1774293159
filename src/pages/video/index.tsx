import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Video, Film, Zap, Sparkles, ArrowRight } from "lucide-react";

export default function VideoHub() {
  const videoTools = [
    {
      name: "Kling 3.0",
      company: "Kuaishou AI",
      description: "Advanced video generation with multiple versions. From fast iterations to cinematic quality.",
      icon: Video,
      credits: "14-20 credits",
      link: "/video/generate",
      versions: ["3.0", "2.6", "2.5 Pro", "2.1", "01", "Omni"],
      features: ["6 Versions", "Cinematic", "Elements"],
      maxDuration: "10s",
    },
    {
      name: "Luma Dream Machine",
      company: "Luma AI",
      description: "Fast, high-quality video generation. Perfect for quick turnaround and professional results.",
      icon: Zap,
      credits: "15 credits",
      link: "/video/generate",
      versions: null,
      features: ["Fast Gen", "5s Max", "High Quality"],
      maxDuration: "5s",
    },
    {
      name: "Runway Gen-3",
      company: "Runway ML",
      description: "Professional-grade video generation. Industry-standard quality and reliability.",
      icon: Film,
      credits: "18 credits",
      link: "/video/generate",
      versions: ["Gen-3 Turbo", "Gen-3 Alpha"],
      features: ["Pro Grade", "10s Max", "Reliable"],
      maxDuration: "10s",
    },
    {
      name: "MiniMax Video",
      company: "Hailuo AI",
      description: "Cost-effective video generation with good quality. Best value for your credits.",
      icon: Sparkles,
      credits: "12 credits",
      link: "/video/generate",
      versions: null,
      features: ["Cost-Effective", "6s Max", "Good Quality"],
      maxDuration: "6s",
    },
    {
      name: "Hunyuan Video",
      company: "Tencent",
      description: "Tencent's advanced video AI with strong scene understanding and realistic motion.",
      icon: Video,
      credits: "16 credits",
      link: "/video/generate",
      versions: null,
      features: ["Tencent AI", "8s Max", "Realistic"],
      maxDuration: "8s",
    },
    {
      name: "Grok Video",
      company: "xAI",
      description: "xAI's video generation model with creative interpretations and unique style.",
      icon: Sparkles,
      credits: "22 credits",
      link: "/video/generate",
      versions: null,
      features: ["xAI", "10s Max", "Creative"],
      maxDuration: "10s",
    },
    {
      name: "Seedance 1.5 Pro",
      company: "Bytedance",
      description: "State-of-the-art video synthesis with exceptional motion quality and temporal consistency.",
      icon: Video,
      credits: "20 credits",
      link: "/video/generate",
      versions: ["1.5 Pro"],
      features: ["Pro Quality", "12s Max", "Smooth Motion"],
      maxDuration: "12s",
    },
    {
      name: "Sora 2.0",
      company: "OpenAI",
      description: "OpenAI's revolutionary video model. Generate up to 20 seconds of cinematic quality video.",
      icon: Film,
      credits: "25 credits",
      link: "/video/generate",
      versions: ["2.0"],
      features: ["20s Max", "OpenAI", "Revolutionary"],
      maxDuration: "20s",
    },
    {
      name: "Veo 3.1",
      company: "Google",
      description: "Google's advanced video generation AI. State-of-the-art quality and prompt understanding.",
      icon: Sparkles,
      credits: "18-22 credits",
      link: "/video/generate",
      versions: ["3.1", "3.1 Fast"],
      features: ["Google", "15s Max", "Advanced"],
      maxDuration: "15s",
      comingSoon: true,
    },
    {
      name: "Seedream 2.0",
      company: "Bytedance",
      description: "Next-gen video synthesis with breakthrough temporal consistency and realism.",
      icon: Video,
      credits: "20 credits",
      link: "/video/generate",
      versions: ["2.0"],
      features: ["Next-Gen", "12s Max", "Realistic"],
      maxDuration: "12s",
      comingSoon: true,
    },
  ];

  return (
    <>
      <SEO
        title="AI Video Generators - Back2Life.Studio"
        description="Professional AI video generation tools. Kling, Luma, Runway, and more."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="text-center space-y-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Video className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Video Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Video Tools
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Create stunning videos with state-of-the-art AI models from industry leaders
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-center">
              <Link href="/video/generate" className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer border border-white/20">
                  <Video className="w-5 h-5" />
                  Create Video
                </div>
              </Link>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {videoTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-4 relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-heading font-bold text-base group-hover:text-primary transition-colors">
                              {tool.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <div className="flex flex-wrap gap-1">
                          {tool.versions?.map((version) => (
                            <span key={version} className="text-xs px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                              {version}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-medium text-amber-500 whitespace-nowrap">
                          {tool.credits}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-indigo-500/20">
            <CardContent className="p-8 text-center">
              <h3 className="font-semibold text-xl mb-2">Looking for free tools?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Check out our free video tools - no credits required!
              </p>
              <Link href="/free-tools" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                Try Free Video Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}