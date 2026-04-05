import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Wand2, Scissors, Sparkles, Layers, Eraser, ArrowRight } from "lucide-react";

export default function EditHub() {
  const editTools = [
    {
      name: "Kling Motion Control",
      type: "Video Edit",
      description: "Advanced motion control for video editing. Precise control over movement and transitions.",
      icon: Scissors,
      credits: "8-12 credits",
      link: "/edit/kling-motion",
      features: ["Motion Control", "Frame-by-Frame", "Smooth Transitions"],
    },
    {
      name: "GPT Image Editor",
      type: "Image Edit",
      description: "AI-powered image editing with natural language instructions. Edit anything with simple text prompts.",
      icon: Wand2,
      credits: "4-6 credits",
      link: "/edit/gpt-image",
      features: ["Text Instructions", "Smart Edits", "OpenAI"],
    },
    {
      name: "Nana Banana Edit",
      type: "Image Edit",
      description: "Professional image editing with AI guidance. Enhance, modify, and transform images seamlessly.",
      icon: Sparkles,
      credits: "3-5 credits",
      link: "/edit/nana-banana",
      features: ["AI Enhancement", "Style Transfer", "Fast"],
    },
    {
      name: "Grok Image Editor",
      type: "Image Edit",
      description: "xAI's creative image editor. Unique style modifications and artistic transformations.",
      icon: Wand2,
      credits: "5 credits",
      link: "/edit/grok-image",
      features: ["Creative Edits", "xAI", "Artistic"],
    },
    {
      name: "AI Inpainting",
      type: "Image Edit",
      description: "Intelligently edit, remove, or replace parts of images with AI precision.",
      icon: Eraser,
      credits: "3 credits",
      link: "/edit/inpainting",
      features: ["Smart Fill", "Object Removal", "Restoration"],
    },
    {
      name: "Image Upscaler",
      type: "Image Edit",
      description: "Enhance image resolution up to 4x with AI-powered detail recovery and sharpening.",
      icon: Layers,
      credits: "3 credits",
      link: "/edit/upscaler",
      features: ["4x Upscale", "Detail Recovery", "Sharp"],
    },
  ];

  return (
    <>
      <SEO
        title="AI Editing Tools - Back2Life.Studio"
        description="Professional AI image and video editing tools. Motion control, image editing, and more."
      />
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Hero Section - Matching Audio Page Style */}
          <div className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 border border-indigo-500/20 mb-4">
              <Wand2 className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-cyan-500">Professional Editing Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl md:text-7xl bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
              AI Editing Tools
            </h1>
            
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto">
              Edit images and videos with precision using cutting-edge AI technology
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {editTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group h-full hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
                    <CardContent className="p-6">
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
                        {tool.type}
                      </p>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>

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
              <h3 className="font-semibold text-xl mb-2">Need creation tools instead?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Generate images and videos from scratch with our AI creation tools
              </p>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                Explore Creation Tools
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}