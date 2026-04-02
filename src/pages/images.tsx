import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Wand2, Image as ImageIcon, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const IMAGE_TOOLS = [
  {
    id: "nana-banana",
    name: "Nana Banana 2",
    description: "State-of-the-art image generation powered by FLUX Pro. Create photorealistic, artistic, and creative images.",
    icon: Wand2,
    credits: 5,
    route: "/tools/nana-banana",
    features: ["Photorealistic", "8K Quality", "Fast Generation"],
    gradient: "from-pink-500 via-purple-500 to-cyan-500",
  },
  {
    id: "style-transfer",
    name: "AI Style Transfer",
    description: "Transform your images with artistic styles. Apply famous painting styles or custom artistic effects.",
    icon: ImageIcon,
    credits: 4,
    route: "/tools/style-transfer",
    features: ["Artistic Styles", "Custom Effects", "High Resolution"],
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    comingSoon: true,
  },
  {
    id: "upscaler",
    name: "AI Image Upscaler",
    description: "Enhance image resolution up to 4K with AI. Restore details and improve quality without losing clarity.",
    icon: Sparkles,
    credits: 3,
    route: "/tools/upscaler",
    features: ["4K Enhancement", "Detail Restoration", "No Quality Loss"],
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    comingSoon: true,
  },
];

export default function ImagesHub() {
  return (
    <>
      <SEO
        title="AI Image Generation Tools - Back2Life.Studio"
        description="Professional AI image generation tools powered by the latest models"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-4">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span className="text-sm font-medium">Professional Image Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Image Generation
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Create stunning images with state-of-the-art AI models
            </p>
          </div>

          {/* Tools Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          Pro
                        </Badge>
                        {tool.comingSoon && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-xl mb-2">
                      {tool.name}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold">{tool.credits} credits</span>
                      </div>
                      <Link href={tool.route}>
                        <Button 
                          disabled={tool.comingSoon}
                          size="sm" 
                          className={`bg-gradient-to-r ${tool.gradient} hover:opacity-90`}
                        >
                          {tool.comingSoon ? "Coming Soon" : (
                            <>
                              Try Now
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Free Alternative */}
          <div className="max-w-6xl mx-auto mt-12">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for a free option?</h3>
                    <p className="text-sm text-muted-foreground">Try our free AI Image Generator with FLUX.1-Schnell</p>
                  </div>
                  <Link href="/generate">
                    <Button variant="outline">
                      Try Free Tool
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}