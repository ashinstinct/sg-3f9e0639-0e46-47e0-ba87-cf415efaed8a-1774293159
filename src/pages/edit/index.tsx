import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eraser,
  Maximize2,
  ImageIcon,
  Sparkles,
  Layers,
  Wand2,
  Scissors,
  Palette,
  ArrowRight,
} from "lucide-react";

const EDIT_TOOLS = [
  {
    id: "inpaint",
    name: "Inpainting",
    description: "Remove or replace objects in images with AI",
    icon: Eraser,
    href: "/edit/inpaint",
    color: "from-red-500 to-orange-500",
    credits: 3,
  },
  {
    id: "outpaint",
    name: "Outpainting",
    description: "Extend images beyond their borders",
    icon: Maximize2,
    href: "/edit/outpaint",
    color: "from-blue-500 to-cyan-500",
    credits: 4,
  },
  {
    id: "upscale",
    name: "AI Upscaler",
    description: "Enhance image resolution up to 4x",
    icon: Sparkles,
    href: "/edit/upscale",
    color: "from-purple-500 to-pink-500",
    credits: 2,
  },
  {
    id: "background-remove",
    name: "Background Removal",
    description: "Remove backgrounds with precision",
    icon: Scissors,
    href: "/edit/background-remove",
    color: "from-green-500 to-emerald-500",
    credits: 1,
  },
  {
    id: "relight",
    name: "AI Relighting",
    description: "Change lighting and atmosphere",
    icon: Palette,
    href: "/edit/relight",
    color: "from-yellow-500 to-amber-500",
    credits: 3,
  },
  {
    id: "enhance",
    name: "Smart Enhance",
    description: "Auto-enhance quality and details",
    icon: Wand2,
    href: "/edit/enhance",
    color: "from-indigo-500 to-purple-500",
    credits: 2,
  },
];

export default function EditIndexPage() {
  return (
    <>
      <SEO
        title="AI Image Editing Tools - Back2Life.Studio"
        description="Professional AI-powered image editing with inpainting, outpainting, upscaling, background removal, and more"
      />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-5xl md:text-6xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              AI Image Editing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Professional image editing powered by cutting-edge AI models
            </p>
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {EDIT_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.id} href={tool.href}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {tool.credits} credits
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {tool.description}
                      </p>
                      
                      <div className="flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Try it now
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Features List */}
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-center">Why Choose Our AI Editors?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h3 className="font-semibold mb-1">State-of-the-Art Models</h3>
                  <p className="text-sm text-muted-foreground">Powered by FAL.ai's latest AI technology</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h3 className="font-semibold mb-1">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">Process images in seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h3 className="font-semibold mb-1">Professional Results</h3>
                  <p className="text-sm text-muted-foreground">Studio-quality output every time</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-card/30">
                <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                <div>
                  <h3 className="font-semibold mb-1">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">Intuitive interface for all skill levels</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}