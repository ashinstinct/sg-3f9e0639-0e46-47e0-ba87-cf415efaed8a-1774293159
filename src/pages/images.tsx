import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Sparkles, 
  Image as ImageIcon, 
  Wand2, 
  Zap, 
  Palette, 
  Layers,
  ArrowRight,
  Rocket,
  Crown,
  TrendingUp
} from "lucide-react";

export default function ImagesPage() {
  const imageTools = [
    {
      name: "FLUX.1 Pro (Nana Banana 2)",
      description: "Bleeding-edge FLUX Pro model with ultra-high detail, photorealism, and lightning-fast 10-second generation.",
      icon: Crown,
      credits: 5,
      link: "/tools/nana-banana",
      features: ["Ultra HD", "Photorealistic", "Fast 10s"],
    },
    {
      name: "Nana Banana 1.5 Pro",
      description: "Earlier FLUX Pro variant optimized for artistic styles and creative interpretations with excellent prompt adherence.",
      icon: Palette,
      credits: 4,
      link: "/tools/nana-banana-15",
      features: ["Artistic", "Creative", "Pro Quality"],
    },
    {
      name: "Grok Image",
      description: "xAI's powerful image generation model with unique creative style and exceptional prompt understanding.",
      icon: Sparkles,
      credits: 5,
      link: "/tools/grok-image",
      features: ["xAI", "Creative", "Unique Style"],
    },
    {
      name: "FLUX.1 Dev",
      description: "High-quality open-weight developer model. Perfect balance of speed, quality, and prompt adherence.",
      icon: Wand2,
      credits: 4,
      link: "/tools/flux-dev",
      features: ["High Quality", "Fast", "Versatile"],
    },
    {
      name: "FLUX.1 Schnell",
      description: "Ultra-fast generation (1-2 seconds). Ideal for rapid iterations and quick prototyping.",
      icon: Zap,
      credits: 2,
      link: "/tools/flux-schnell",
      features: ["Ultra Fast", "1-2s Gen", "Good Quality"],
    },
    {
      name: "FLUX Realism",
      description: "Specialized FLUX variant trained specifically for photorealistic images with natural lighting and textures.",
      icon: ImageIcon,
      credits: 4,
      link: "/tools/flux-realism",
      features: ["Photorealistic", "Natural", "Pro Photos"],
    },
    {
      name: "Stable Diffusion 3.5 Large",
      description: "Latest SD3.5 with 8 billion parameters. Advanced prompt understanding and flexible output control.",
      icon: TrendingUp,
      credits: 4,
      link: "/tools/sd35-large",
      features: ["8B Params", "Advanced", "Flexible"],
    },
    {
      name: "Stable Diffusion XL",
      description: "High-resolution 1024x1024 generation with detailed textures and realistic lighting.",
      icon: ImageIcon,
      credits: 3,
      link: "/tools/sdxl",
      features: ["1024x1024", "Detailed", "Stable"],
    },
    {
      name: "Recraft V3",
      description: "Design-first model with exceptional text rendering and vector-style graphics. Perfect for logos and UI.",
      icon: Layers,
      credits: 4,
      link: "/tools/recraft-v3",
      features: ["Text Perfect", "Design-First", "Vector Style"],
    },
    {
      name: "Ideogram v2",
      description: "Industry-leading text rendering quality. Generates clear, readable text within images every time.",
      icon: Wand2,
      credits: 4,
      link: "/tools/ideogram",
      features: ["Perfect Text", "Reliable", "Clean"],
    },
    {
      name: "Playground v2.5",
      description: "Photorealistic specialist with vibrant colors and cinematic composition. Great for product shots.",
      icon: ImageIcon,
      credits: 3,
      link: "/tools/playground",
      features: ["Photorealistic", "Vibrant", "Product Shots"],
    },
    {
      name: "AuraFlow",
      description: "Open-source alternative to FLUX with competitive quality and unique artistic interpretation.",
      icon: Sparkles,
      credits: 3,
      link: "/tools/auraflow",
      features: ["Open Source", "Artistic", "Fast"],
    },
    {
      name: "FLUX LoRA",
      description: "Custom-trained FLUX models for specific artistic styles. Unique looks not available in base models.",
      icon: Palette,
      credits: 5,
      link: "/tools/flux-lora",
      features: ["Custom Styles", "Fine-tuned", "Unique"],
    },
    {
      name: "Face to Sticker",
      description: "Transform any face photo into a fun cartoon sticker. Perfect for avatars and social media.",
      icon: Sparkles,
      credits: 3,
      link: "/tools/face-sticker",
      features: ["Fun", "Instant", "Cartoon Style"],
    },
    {
      name: "Image to Image",
      description: "Transform existing images with AI guidance. Style transfer, variations, and controlled edits.",
      icon: Wand2,
      credits: 4,
      link: "/tools/img2img",
      features: ["Style Transfer", "Guided", "Controlled"],
    },
    {
      name: "AI Inpainting",
      description: "Intelligently fill, remove, or replace parts of images. Object removal and content-aware restoration.",
      icon: Layers,
      credits: 3,
      link: "/tools/inpainting",
      features: ["Smart Fill", "Object Removal", "Restoration"],
    },
    {
      name: "AI Image Upscaler",
      description: "Enhance image resolution up to 4x with AI detail recovery. Crystal-clear upscaling without artifacts.",
      icon: TrendingUp,
      credits: 3,
      link: "/tools/upscaler",
      features: ["4x Upscale", "Detail Recovery", "Sharp"],
    },
    {
      name: "Background Removal",
      description: "Instant, pixel-perfect background removal. Extract subjects with clean edges and transparency.",
      icon: Layers,
      credits: 2,
      link: "/tools/bg-remove",
      features: ["Instant", "Precise", "Transparent"],
    },
  ];

  return (
    <>
      <SEO
        title="Pro Image Tools - Back2Life.Studio"
        description="Professional AI image generation tools powered by fal.ai. FLUX Pro, Stable Diffusion, Grok Image, and specialized image editing tools."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
              <Crown className="w-4 h-4" />
              Pro Image Tools
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Professional Image Generation
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Access 18 powerful AI image generation models from fal.ai. From photorealistic renders to artistic masterpieces.
            </p>
            <Link href="/free-tools">
              <Button variant="outline" size="lg">
                <Rocket className="mr-2 w-5 h-5" />
                View Free Image Tools
              </Button>
            </Link>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group h-full bg-gradient-to-br from-background to-muted/30 border-2 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            {tool.credits} credits
                          </span>
                        </div>

                        <h3 className="font-heading font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                          {tool.name}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {tool.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {tool.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>

                        <Button 
                          size="sm" 
                          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90"
                        >
                          Generate Now
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border-primary/20">
            <CardContent className="p-8 text-center">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h2 className="font-heading font-bold text-2xl mb-2">
                Need Free Tools?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Try our free AI image generator powered by FLUX.1-Schnell. Perfect for experimenting and learning.
              </p>
              <Link href="/free-tools">
                <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
                  Explore Free Tools
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}