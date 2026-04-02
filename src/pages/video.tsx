import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Zap, ArrowRight, Film } from "lucide-react";
import Link from "next/link";

const videoTools = [
  {
    name: "Kling 3.0",
    description: "Latest Kling model with cinematic quality, advanced camera movements, and photorealistic details.",
    icon: Video,
    credits: 20,
    maxDuration: 10,
    status: "active" as const,
    link: "/tools/kling-3",
    features: ["Cinematic", "10s Max", "Camera Control"],
  },
  {
    name: "Kling 2.6",
    description: "Standard Kling model with balanced quality and performance. Great for most use cases.",
    icon: Video,
    credits: 16,
    maxDuration: 10,
    status: "active" as const,
    link: "/tools/kling-26",
    features: ["Balanced", "10s Max", "Stable"],
  },
  {
    name: "Kling 2.5 Pro",
    description: "Pro version with enhanced detail rendering and improved motion consistency.",
    icon: Video,
    credits: 18,
    maxDuration: 8,
    status: "active" as const,
    link: "/tools/kling-25",
    features: ["Enhanced", "8s Max", "Pro Quality"],
  },
  {
    name: "Kling 2.1",
    description: "Earlier Kling model optimized for speed and efficiency. Still delivers great results.",
    icon: Video,
    credits: 14,
    maxDuration: 8,
    status: "active" as const,
    link: "/tools/kling-21",
    features: ["Fast", "8s Max", "Efficient"],
  },
  {
    name: "Kling 01",
    description: "Experimental Kling variant with unique visual style and creative interpretations.",
    icon: Sparkles,
    credits: 15,
    maxDuration: 6,
    status: "active" as const,
    link: "/tools/kling-01",
    features: ["Experimental", "6s Max", "Creative"],
  },
  {
    name: "Luma Dream Machine",
    description: "Fast, high-quality video generation. Perfect for quick turnaround and professional results.",
    icon: Zap,
    credits: 15,
    maxDuration: 5,
    status: "active" as const,
    link: "/tools/luma",
    features: ["Fast Gen", "5s Max", "High Quality"],
  },
  {
    name: "Runway Gen-3 Turbo",
    description: "Professional-grade video generation from Runway. Industry-standard quality and reliability.",
    icon: Film,
    credits: 18,
    maxDuration: 10,
    status: "active" as const,
    link: "/tools/runway",
    features: ["Pro Grade", "10s Max", "Reliable"],
  },
  {
    name: "MiniMax Video",
    description: "Cost-effective video generation with good quality. Best value for your credits.",
    icon: Sparkles,
    credits: 12,
    maxDuration: 6,
    status: "active" as const,
    link: "/tools/minimax",
    features: ["Cost-Effective", "6s Max", "Good Quality"],
  },
  {
    name: "Hunyuan Video",
    description: "Tencent's advanced video AI with strong scene understanding and realistic motion.",
    icon: Video,
    credits: 16,
    maxDuration: 8,
    status: "active" as const,
    link: "/tools/hunyuan",
    features: ["Tencent AI", "8s Max", "Realistic"],
  },
  {
    name: "Grok Video",
    description: "xAI's video generation model with creative interpretations and unique style.",
    icon: Sparkles,
    credits: 22,
    maxDuration: 10,
    status: "active" as const,
    link: "/tools/grok-video",
    features: ["xAI", "10s Max", "Creative"],
  },
  {
    name: "Seedance 1.5 Pro",
    description: "State-of-the-art video synthesis with exceptional motion quality and temporal consistency.",
    icon: Video,
    credits: 20,
    maxDuration: 12,
    status: "active" as const,
    link: "/tools/seedance-pro",
    features: ["Pro Quality", "12s Max", "Smooth Motion"],
  },
  {
    name: "Sora 2.0",
    description: "OpenAI's revolutionary video model. Generate up to 20 seconds of cinematic quality video.",
    icon: Film,
    credits: 25,
    maxDuration: 20,
    status: "coming_soon" as const,
    link: "/tools/sora",
    features: ["20s Max", "OpenAI", "Revolutionary"],
  },
  {
    name: "Veo 3.1",
    description: "Google's advanced video generation AI. State-of-the-art quality and prompt understanding.",
    icon: Sparkles,
    credits: 22,
    maxDuration: 15,
    status: "coming_soon" as const,
    link: "/tools/veo",
    features: ["Google", "15s Max", "Advanced"],
  },
  {
    name: "Veo 3.1 Fast",
    description: "Faster variant of Veo 3.1 with reduced generation time while maintaining quality.",
    icon: Zap,
    credits: 18,
    maxDuration: 10,
    status: "coming_soon" as const,
    link: "/tools/veo-fast",
    features: ["Fast", "10s Max", "Google"],
  },
  {
    name: "Seedream 2.0",
    description: "Next-gen video synthesis with breakthrough temporal consistency and realism.",
    icon: Video,
    credits: 20,
    maxDuration: 12,
    status: "coming_soon" as const,
    link: "/tools/seedream",
    features: ["Next-Gen", "12s Max", "Realistic"],
  },
];

export default function VideoHub() {
  return (
    <>
      <SEO
        title="AI Video Generation Tools - Back2Life.Studio"
        description="Professional AI video generation with 15 cutting-edge models"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
              <Video className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Professional Video Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AI Video Generation
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Create cinematic videos with 15 state-of-the-art AI models
            </p>
          </div>

          {/* Tools Grid */}
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {videoTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group relative overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {tool.credits} credits
                          </span>
                          {tool.status === "coming_soon" && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                              Soon
                            </span>
                          )}
                        </div>
                      </div>

                      <h3 className="font-heading font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {tool.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t text-primary font-medium text-sm">
                        {tool.status === "coming_soon" ? "Coming Soon" : "Open Tool"}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Free Tool Section */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-8">
                <Video className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Try Our Free Video Tools
                </h2>
                <p className="text-muted-foreground mb-6">
                  Edit, convert, and process videos — no credits needed
                </p>
                <Link href="/free-tools">
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                    View Free Tools
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}