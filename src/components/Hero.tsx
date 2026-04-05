import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, ImageIcon, Video, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="text-center py-6 md:py-8 mb-6">
      <h1 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl mb-2 leading-tight">
        Bring your imagination{" "}
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Back2Life
        </span>
      </h1>
      
      {/* Create Image & Create Video - 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-w-4xl mx-auto">
        <Link href="/images/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer aspect-[4/3]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
              <ImageIcon className="w-8 h-8 md:w-12 md:h-12 mb-2" />
              <h3 className="font-heading font-bold text-lg md:text-2xl mb-1">Create Image</h3>
              <p className="text-xs md:text-sm text-white/80">Generate AI images</p>
            </div>
          </Card>
        </Link>

        <Link href="/video/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer aspect-[4/3]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 opacity-90 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-white">
              <Video className="w-8 h-8 md:w-12 md:h-12 mb-2" />
              <h3 className="font-heading font-bold text-lg md:text-2xl mb-1">Create Video</h3>
              <p className="text-xs md:text-sm text-white/80">Generate AI videos</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Explore All Tools Button */}
      <Link href="/tools">
        <Button 
          size="lg" 
          className="w-full max-w-md bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold gap-2 px-8 py-6 text-base"
        >
          Explore all tools
          <Sparkles className="w-5 h-5" />
        </Button>
      </Link>
    </section>
  );
}