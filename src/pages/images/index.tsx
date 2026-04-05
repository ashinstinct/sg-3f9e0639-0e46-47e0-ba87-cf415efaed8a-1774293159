import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Image as ImageIcon, Wand2, Layers, Maximize2, Eraser, ArrowRight } from "lucide-react";

export default function ImagesHub() {
  const imageTools = [
    {
      name: "FLUX.1 Pro",
      company: "Black Forest Labs",
      description: "State-of-the-art text-to-image models. Multiple variants for different use cases.",
      icon: Sparkles,
      credits: "2-5 credits",
      link: "/images/generate",
      versions: ["Pro", "Dev", "Schnell", "Realism", "LoRA"],
      features: ["Multiple Versions", "Fast", "High Quality"],
    },
    {
      name: "Nana Banana 2.0",
      company: "fal.ai",
      description: "Premium image generation with exceptional quality and speed. Pro and standard versions available.",
      icon: ImageIcon,
      credits: "4-5 credits",
      link: "/images/generate",
      versions: ["2.0", "1.5 Pro"],
      features: ["2 Versions", "Ultra HD", "10s Gen"],
    },
    {
      name: "Stable Diffusion 3.5",
      company: "Stability AI",
      description: "Industry-standard open-source models. Reliable and versatile image generation.",
      icon: Layers,
      credits: "3-4 credits",
      link: "/images/generate",
      versions: ["3.5 Large", "XL"],
      features: ["Open Source", "Reliable", "Flexible"],
    },
    {
      name: "Grok Image",
      company: "xAI",
      description: "xAI's powerful image generation with creative interpretations and unique style.",
      icon: Sparkles,
      credits: "5 credits",
      link: "/images/generate",
      versions: null,
      features: ["Creative", "Unique Style", "xAI"],
    },
    {
      name: "Recraft V3",
      company: "Recraft AI",
      description: "Perfect for logos, UI elements, and designs. Exceptional text rendering in images.",
      icon: Wand2,
      credits: "4 credits",
      link: "/images/generate",
      versions: null,
      features: ["Text Perfect", "Design-First", "Vector Style"],
    },
    {
      name: "Ideogram V2",
      company: "Ideogram AI",
      description: "Industry-leading text rendering quality. Perfect for posters, ads, and text-heavy designs.",
      icon: ImageIcon,
      credits: "4 credits",
      link: "/images/generate",
      versions: ["v2", "v1"],
      features: ["Perfect Text", "Reliable", "Clean"],
    },
    {
      name: "Playground V2.5",
      company: "Playground AI",
      description: "Photorealistic specialist with vibrant colors. Perfect for product shots and marketing.",
      icon: ImageIcon,
      credits: "3 credits",
      link: "/images/generate",
      versions: ["v2.5", "v2"],
      features: ["Photorealistic", "Vibrant", "Product Shots"],
    },
    {
      name: "AuraFlow",
      company: "Fal AI",
      description: "Open-source alternative to FLUX. Fast generation with competitive quality.",
      icon: Sparkles,
      credits: "3 credits",
      link: "/images/generate",
      versions: null,
      features: ["Open Source", "Artistic", "Fast"],
    },
    {
      name: "Image to Image",
      company: "Various",
      description: "Transform existing images with AI guidance. Style transfer and guided generation.",
      icon: Layers,
      credits: "4 credits",
      link: "/images/img2img",
      versions: null,
      features: ["Style Transfer", "Guided", "Controlled"],
    },
    {
      name: "AI Inpainting",
      company: "Various",
      description: "Intelligently edit, remove, or replace parts of images with AI.",
      icon: Wand2,
      credits: "3 credits",
      link: "/images/inpainting",
      versions: null,
      features: ["Smart Fill", "Object Removal", "Restoration"],
    },
    {
      name: "Image Upscaler",
      company: "Various",
      description: "Enhance image resolution up to 4x with AI-powered detail recovery.",
      icon: Maximize2,
      credits: "3 credits",
      link: "/images/upscaler",
      versions: null,
      features: ["4x Upscale", "Detail Recovery", "Sharp"],
    },
    {
      name: "Background Removal",
      company: "Various",
      description: "Pixel-perfect background removal. Instant transparent backgrounds.",
      icon: Eraser,
      credits: "2 credits",
      link: "/images/bg-remove",
      versions: null,
      features: ["Instant", "Precise", "Transparent"],
    },
  ];

  return (
    <>
      <SEO
        title="AI Image Generators - Back2Life.Studio"
        description="Professional AI image generation tools. FLUX, Stable Diffusion, Grok, and more."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="text-center space-y-3 mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <ImageIcon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Professional Image Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-4xl md:text-5xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Image Tools
            </h1>
            
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Generate, edit, and enhance images with cutting-edge AI models from industry leaders
            </p>
          </div>

          <div className="mb-4">
            <div className="flex justify-center">
              <Link href="/images/generate" className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all cursor-pointer border border-white/20">
                  <Sparkles className="w-5 h-5" />
                  Create Images
                </div>
              </Link>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {imageTools.map((tool) => {
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
                Check out our free AI Image Generator - no credits required!
              </p>
              <Link href="/generate" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                Try Free Image Generator
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}