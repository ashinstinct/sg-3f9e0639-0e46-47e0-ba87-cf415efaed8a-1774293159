import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Sparkles, Wand2, Palette } from "lucide-react";
import Link from "next/link";

export default function ImagesPage() {
  const proImageTools = [
    {
      title: "Nana Banana 2",
      description: "State-of-the-art image generation with unparalleled detail and creativity",
      icon: Sparkles,
      href: "/generate?model=nana-banana-2",
      credits: 5,
      color: "from-pink-500 to-purple-500",
      comingSoon: true,
    },
    {
      title: "Advanced Style Transfer",
      description: "Transform images with artistic styles using cutting-edge AI models",
      icon: Palette,
      href: "/style-transfer",
      credits: 3,
      color: "from-violet-500 to-indigo-500",
      comingSoon: true,
    },
    {
      title: "AI Upscaler Pro",
      description: "Enhance image resolution up to 8K with advanced AI upscaling",
      icon: Wand2,
      href: "/upscale",
      credits: 4,
      color: "from-cyan-500 to-blue-500",
      comingSoon: true,
    },
  ];

  return (
    <>
      <SEO
        title="Pro Image Tools | Back2Life.Studio"
        description="Professional AI-powered image generation and editing tools. Create stunning visuals with Nana Banana 2 and more."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 mb-4">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Professional Image Tools
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Advanced AI models for professional image generation, editing, and enhancement. Powered by fal.ai and cutting-edge providers.
              </p>
            </div>

            {/* Pro Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {proImageTools.map((tool) => (
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
                        <span>{tool.credits} credits per generation</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Free Alternative */}
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="font-heading font-bold text-2xl mb-2">
                Looking for free image generation?
              </h3>
              <p className="text-muted-foreground mb-4">
                Try our free AI Image Generator - no credits required
              </p>
              <Link href="/generate" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                Go to Free Image Generator →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}