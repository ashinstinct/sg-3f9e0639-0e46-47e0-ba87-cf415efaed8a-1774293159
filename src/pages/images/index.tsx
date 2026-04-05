import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, Image, Wand2, Layers, Maximize2, Eraser, ArrowLeft } from "lucide-react";

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
      icon: Image,
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
      icon: Image,
      credits: "4 credits",
      link: "/images/generate",
      versions: ["v2", "v1"],
      features: ["Perfect Text", "Reliable", "Clean"],
    },
    {
      name: "Playground V2.5",
      company: "Playground AI",
      description: "Photorealistic specialist with vibrant colors. Perfect for product shots and marketing.",
      icon: Image,
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
        
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Card className="border-2">
            <CardContent className="p-8">
              <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Image className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="font-heading font-bold text-4xl">AI Image Generators</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                  Professional AI image generation tools powered by the latest models from industry leaders.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {imageTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.name} href={tool.link}>
                      <div className="group relative bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 h-full">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                              {tool.credits}
                            </span>
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
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 p-6 bg-muted/50 rounded-xl">
                <h3 className="font-semibold mb-2">Looking for free tools?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out our free AI Image Generator - no credits required!
                </p>
                <Link href="/generate" className="text-sm text-primary hover:underline font-medium">
                  Try Free Image Generator →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}