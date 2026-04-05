import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ImageIcon, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="text-center py-8 md:py-12 mb-8">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-primary">Professional AI Generation Platform</span>
      </div>
      
      <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
        Back2Life.Studio
      </h1>
      
      <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto mb-12 font-medium">
        Bring your imagination back to life
      </p>
      
      {/* Create Image & Create Video Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-6">
        {/* Create Image Card */}
        <Link href="/images/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative p-6">
              {/* Preview Image Area */}
              <div className="aspect-[16/10] mb-4 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center border border-border/30 overflow-hidden">
                <div className="text-6xl">🎨</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-heading font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    Create Images
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate AI images
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Card>
        </Link>

        {/* Create Video Card */}
        <Link href="/video/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 cursor-pointer h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-cyan-500 to-blue-500 opacity-10 group-hover:opacity-20 transition-opacity" />
            
            <div className="relative p-6">
              {/* Preview Image Area */}
              <div className="aspect-[16/10] mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 via-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-border/30 overflow-hidden">
                <div className="text-6xl">🎬</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="font-heading font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    Create Video
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Generate AI videos
                  </p>
                </div>
                <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Explore All Tools Button */}
      <Link href="/tools">
        <Button 
          size="lg" 
          className="w-full max-w-4xl mx-auto h-14 text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white shadow-lg shadow-primary/30 gap-2"
        >
          Explore all tools
          <Sparkles className="w-5 h-5" />
        </Button>
      </Link>
    </section>
  );
}