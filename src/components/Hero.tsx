import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Sparkles, Image as ImageIcon, Video } from "lucide-react";

export function Hero() {
  return (
    <section className="text-center py-6 md:py-10 mb-2">
      <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
        Bring your imagination<br />Back2Life
      </h1>
      
      {/* Create Cards Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 max-w-3xl mx-auto mb-6">
        <Link href="/images/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 cursor-pointer aspect-[4/3] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-indigo-500/5 to-indigo-500/30 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-4 left-4 p-2 bg-indigo-500/20 rounded-xl backdrop-blur-sm">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <CardContent className="relative z-10 p-4 text-left">
              <h3 className="font-heading font-bold text-lg md:text-xl text-indigo-100">
                Create Image
              </h3>
              <p className="text-xs md:text-sm text-indigo-200/70 mt-1">
                Generate AI images
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/video/generate">
          <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 cursor-pointer aspect-[4/3] flex flex-col justify-end">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-purple-500/5 to-purple-500/30 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-4 left-4 p-2 bg-purple-500/20 rounded-xl backdrop-blur-sm">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
            <CardContent className="relative z-10 p-4 text-left">
              <h3 className="font-heading font-bold text-lg md:text-xl text-purple-100">
                Create Video
              </h3>
              <p className="text-xs md:text-sm text-purple-200/70 mt-1">
                Generate AI videos
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Link href="/tools">
        <Button size="lg" className="w-full max-w-sm h-14 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white font-semibold text-lg shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
          Explore all tools
          <Sparkles className="w-5 h-5 ml-2" />
        </Button>
      </Link>
    </section>
  );
}