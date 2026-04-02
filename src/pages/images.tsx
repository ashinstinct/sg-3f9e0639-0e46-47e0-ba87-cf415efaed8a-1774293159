import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Image as ImageIcon, Wand2, ArrowUpRight, Palette, Brush, Eraser, ZoomIn, Frame } from "lucide-react";
import Link from "next/link";

export default function ImagesPage() {
  const imageTools = [
    {
      name: "FLUX.1 Pro (Nana Banana 2)",
      description: "State-of-the-art image generation with unmatched quality and detail. The most advanced FLUX model.",
      icon: Sparkles,
      credits: 5,
      status: "active" as const,
      link: "/tools/nana-banana",
      features: ["Ultra HD", "Photorealistic", "Fast 10s"],
    },
    {
      name: "FLUX.1 Dev",
      description: "Open-weight developer model with excellent prompt following and high-quality outputs.",
      icon: Wand2,
      credits: 4,
      status: "active" as const,
      link: "/tools/flux-dev",
      features: ["High Quality", "Fast", "Versatile"],
    },
    {
      name: "FLUX.1 Schnell",
      description: "Lightning-fast image generation in under 2 seconds. Perfect for rapid iterations.",
      icon: Sparkles,
      credits: 2,
      status: "active" as const,
      link: "/tools/flux-schnell",
      features: ["Ultra Fast", "Good Quality", "1-2s"],
    },
    {
      name: "Stable Diffusion 3.5 Large",
      description: "Latest SD3.5 with improved prompt understanding and image quality. 8B parameter model.",
      icon: ImageIcon,
      credits: 4,
      status: "active" as const,
      link: "/tools/sd-35-large",
      features: ["8B Params", "Advanced", "Flexible"],
    },
    {
      name: "Stable Diffusion XL",
      description: "High-resolution image generation with excellent composition and realistic details.",
      icon: ImageIcon,
      credits: 3,
      status: "active" as const,
      link: "/tools/sdxl",
      features: ["1024x1024", "Detailed", "Stable"],
    },
    {
      name: "Recraft V3",
      description: "Design-focused AI with exceptional text rendering and graphic design capabilities.",
      icon: Palette,
      credits: 4,
      status: "active" as const,
      link: "/tools/recraft-v3",
      features: ["Text Perfect", "Design-First", "Vector Style"],
    },
    {
      name: "FLUX LoRA",
      description: "Custom-trained FLUX models for specific styles. Apply artistic styles to your generations.",
      icon: Brush,
      credits: 5,
      status: "active" as const,
      link: "/tools/flux-lora",
      features: ["Custom Styles", "Fine-tuned", "Unique"],
    },
    {
      name: "Face to Sticker",
      description: "Transform any face photo into a fun cartoon sticker with AI. Perfect for avatars.",
      icon: Sparkles,
      credits: 3,
      status: "active" as const,
      link: "/tools/face-sticker",
      features: ["Fun", "Instant", "Cartoon Style"],
    },
    {
      name: "Image to Image",
      description: "Transform existing images with AI guidance. Preserve structure while changing style.",
      icon: Wand2,
      credits: 4,
      status: "active" as const,
      link: "/tools/image-to-image",
      features: ["Style Transfer", "Guided", "Controlled"],
    },
    {
      name: "AI Inpainting",
      description: "Intelligently fill, remove, or replace parts of images. Perfect for editing and restoration.",
      icon: Eraser,
      credits: 3,
      status: "active" as const,
      link: "/tools/inpainting",
      features: ["Smart Fill", "Object Removal", "Restoration"],
    },
    {
      name: "AI Image Upscaler",
      description: "Enhance image resolution up to 4x with AI. Recover details and sharpen blurry photos.",
      icon: ZoomIn,
      credits: 3,
      status: "active" as const,
      link: "/tools/upscaler",
      features: ["4x Upscale", "Detail Recovery", "Sharp"],
    },
    {
      name: "Background Removal",
      description: "Instantly remove backgrounds with pixel-perfect precision. Export with transparency.",
      icon: Frame,
      credits: 2,
      status: "active" as const,
      link: "/tools/background-removal",
      features: ["Instant", "Precise", "Transparent"],
    },
  ];

  return (
    <>
      <SEO
        title="Pro Image Tools - AI Image Generators | Back2Life.Studio"
        description="Access 12+ professional AI image generation tools. FLUX Pro, Stable Diffusion, Recraft V3, and specialized image editing tools."
        image="/og-image.png"
      />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Pro Image Tools</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              AI Image Generation & Editing
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from 12+ professional AI image tools powered by FLUX, Stable Diffusion, and specialized models
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {imageTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group relative overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
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

                      <div className="flex flex-wrap gap-2">
                        {tool.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground font-medium"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-4 border-t text-primary font-medium text-sm">
                        Open Tool
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="font-heading text-2xl font-bold mb-2">
                  Try Our Free AI Image Generator
                </h2>
                <p className="text-muted-foreground mb-6">
                  Generate unlimited images with FLUX.1-Schnell — no credits needed
                </p>
                <Link href="/generate">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90">
                    Generate Free Images
                    <ArrowUpRight className="ml-2 w-4 h-4" />
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