import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, Zap, ImageIcon, Video, Wrench } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="text-center py-8 md:py-12 mb-6">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">14 Free Tools + Premium AI Models</span>
      </div>
      
      <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
        Back2Life.Studio
      </h1>
      
      <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
        Professional AI tools for image and video generation, editing, and audio processing
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link href="/images">
          <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold gap-2 px-6">
            <ImageIcon className="w-5 h-5" />
            AI Images
          </Button>
        </Link>
        <Link href="/video">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white font-semibold gap-2 px-6">
            <Video className="w-5 h-5" />
            AI Video
          </Button>
        </Link>
        <Link href="/tools">
          <Button size="lg" variant="outline" className="border-2 border-primary/20 hover:bg-primary/5 gap-2 px-6">
            <Wrench className="w-5 h-5" />
            Free Tools
          </Button>
        </Link>
      </div>
    </section>
  );
}