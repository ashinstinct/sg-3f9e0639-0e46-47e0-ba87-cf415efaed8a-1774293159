import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Hero } from "@/components/Hero";
import { ToolsGrid } from "@/components/ToolsGrid";
import { FeaturedModels } from "@/components/FeaturedModels";
import { useRouter } from "next/router";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  const models = [
    "FLUX.1-Schnell",
    "Nano Banana 2.0",
    "Grok Image 1.5",
    "Seedream 4.5",
    "Kling Motion 3.0",
    "Luma Dream",
    "Runway Gen-3",
    "MiniMax Video",
    "Imagen 4",
    "Recraft v3",
    "Ideogram 2.0",
    "Playground v3",
    "AuraFlow",
    "Stable Diffusion XL",
  ];

  return (
    <>
      <SEO
        title="Back2Life.Studio - Free AI Image & Video Generator"
        description="Create stunning AI images and videos for free. 14 free tools + premium AI models. 240K+ creations made."
      />
      <Navigation />
      
      {/* Custom cursor styles */}
      <style jsx global>{`
        @media (min-width: 768px) {
          * {
            cursor: none !important;
          }
          
          body::before {
            content: '';
            position: fixed;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, rgb(168, 85, 247), rgb(99, 102, 241));
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: transform 0.15s ease-out, opacity 0.15s ease-out;
            opacity: 0.8;
            mix-blend-mode: difference;
          }
          
          a:hover ~ body::before,
          button:hover ~ body::before {
            transform: scale(2);
            opacity: 0.6;
          }
        }
      `}</style>

      <main className="min-h-screen bg-slate-950">
        <Hero />

        {/* Scrolling Model Ticker */}
        <div className="py-4 bg-muted/30 border-y border-border/40 overflow-hidden">
          <div className="flex gap-8 animate-scroll whitespace-nowrap">
            {/* Duplicate for seamless loop */}
            {[...models, ...models, ...models].map((model, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-border/50 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                {model}
              </div>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-purple-400">
                AI-Powered Media Studio
              </span>
              <br />
              <span className="text-white">+ Premium AI Models</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Create stunning AI content with industry-leading models. Free tools included, premium features available.
            </p>
          </div>
          
          <ToolsGrid />
        </div>

        {/* Featured Models */}
        <div className="container mx-auto px-4 py-12">
          <FeaturedModels />
        </div>

        {/* Dark CTA Section */}
        <section className="py-24 bg-slate-950 border-t border-border/40">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Join 240,000+ creators
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Start Creating for Free
              </h2>
              
              <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
                No credit card required. Get instant access to 14 free tools and premium AI models.
              </p>

              <Button
                onClick={() => router.push("/generate")}
                size="lg"
                className="text-lg px-8 py-6 bg-purple-500 hover:bg-purple-600"
              >
                <span className="flex items-center">
                  Generate Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-purple-400">
                    12
                  </div>
                  <div className="text-slate-400 mt-2">Free Tools</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">240K+</div>
                  <div className="text-sm text-slate-400">Creations Made</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">20+</div>
                  <div className="text-sm text-slate-400">AI Models</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white mb-2">14</div>
                  <div className="text-sm text-slate-400">Free Tools</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  );
}