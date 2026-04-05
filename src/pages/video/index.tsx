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
        
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Hero Section - Matching Audio Page Style */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 mb-4">
              <Video className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-500">Professional Video Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl md:text-7xl bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
              AI Video Tools
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Create stunning videos with state-of-the-art AI models from industry leaders
            </p>
          </div>

          <div className="mb-6">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {videoTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {tool.credits}
                          </span>
                          {tool.comingSoon && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                              Soon
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-heading font-bold text-xl mb-1">
                        {tool.name}
                      </h3>
                      
                      <p className="text-xs text-muted-foreground mb-3 font-medium">
                        by {tool.company}
                      </p>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>

                      {tool.versions && (
                        <div className="mb-3">
                          <span className="text-xs font-medium text-primary">
                            {tool.versions.length} versions available
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <span key={feature} className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                            {feature}
                          </span>
                        ))}
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
        </div>
      </div>
    </>
  );
}