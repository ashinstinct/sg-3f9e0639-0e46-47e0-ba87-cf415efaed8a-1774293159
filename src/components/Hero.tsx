import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh animate-mesh-float opacity-40" />
      <div className="absolute inset-0 bg-gradient-hero" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 bg-surface-tint border-brand-indigo/20">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-brand-indigo" />
            14 Free Tools + Premium AI Models
          </Badge>

          <h1 className="font-heading font-bold text-5xl md:text-7xl mb-6 bg-gradient-to-r from-primary via-purple-400 to-accent bg-clip-text text-transparent">
            Back2Life.Studio
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Professional AI tools for creators. 14 free tools + premium AI models for image generation, video creation, and audio editing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90 transition-opacity text-base px-8 h-12">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Creating Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-2 text-base h-12 px-8">
              <Zap className="w-4 h-4 mr-2" />
              View Pricing
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-cyan" />
              14 free tools
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-indigo" />
              Premium AI models
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}