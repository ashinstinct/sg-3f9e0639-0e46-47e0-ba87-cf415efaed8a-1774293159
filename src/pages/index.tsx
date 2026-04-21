import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { ModelShowcase } from "@/components/ModelShowcase";
import { ToolsGrid } from "@/components/ToolsGrid";
import { useRouter } from "next/router";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <SEO
        title="Back2Life.Studio - Free AI Image & Video Generator"
        description="Create stunning AI images and videos for free. 14 free tools + premium AI models. 240K+ creations made."
      />
      <Navigation />

      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero - Centered, aligned with burger menu */}
        <section className="relative pt-14 pb-8 md:pt-16 md:pb-12 px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              20+ AI Models · 14 Free Tools
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <span className="text-white"> Media Studio</span>
            </h1>
            <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto mb-6">
              Generate stunning images and videos with the latest AI models. Free tools included.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => router.push("/images/generate")}
                className="bg-purple-500 hover:bg-purple-600 text-sm md:text-base px-5 py-2.5"
              >
                <Play className="w-4 h-4 mr-2" fill="white" />
                Start Creating
              </Button>
              <Button
                onClick={() => router.push("/free-tools")}
                variant="outline"
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm md:text-base px-5 py-2.5"
              >
                Free Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Netflix-Style Model Showcase */}
        <ModelShowcase />

        {/* Tools Grid */}
        <div className="px-4 md:px-8 py-12 md:py-20">
          <div className="mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2">All Tools</h2>
            <p className="text-sm md:text-base text-white/50">Everything you need to create AI content</p>
          </div>
          <ToolsGrid />
        </div>

        {/* CTA Section */}
        <section className="py-16 md:py-24 border-t border-white/5">
          <div className="px-4 md:px-8 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                <Zap className="w-4 h-4" />
                Join 240,000+ creators
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Start Creating for Free
              </h2>

              <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto">
                No credit card required. Instant access to 14 free tools and premium AI models.
              </p>

              <Button
                onClick={() => router.push("/images/generate")}
                size="lg"
                className="text-base md:text-lg px-8 py-6 bg-purple-500 hover:bg-purple-600"
              >
                Generate Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto pt-8">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">20+</div>
                  <div className="text-xs md:text-sm text-white/40 mt-1">AI Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">240K+</div>
                  <div className="text-xs md:text-sm text-white/40 mt-1">Creations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">14</div>
                  <div className="text-xs md:text-sm text-white/40 mt-1">Free Tools</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}