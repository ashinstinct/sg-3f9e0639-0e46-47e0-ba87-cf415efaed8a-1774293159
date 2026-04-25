import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { ModelShowcase } from "@/components/ModelShowcase";
import { useRouter } from "next/router";
import { ArrowRight, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <SEO
        title="Back2Life.Studio - Free AI Image & Video Generator"
        description="Create stunning images and videos with AI. 14 free tools + premium AI models. 240K+ creations made."
      />
      <Navigation />

      <main className="min-h-screen bg-[#0a0a0a]">
        {/* Hero - Compressed spacing */}
        <section className="relative pt-4 pb-2 md:pb-2 px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              40+ AI Models · 12 Free Tools
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight mb-2">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI Media Studio
              </span>
            </h1>
            <p className="text-sm md:text-lg text-white/50 max-w-2xl mx-auto mb-3">
              Generate stunning images and videos with the latest AI models. Free tools included.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                onClick={() => router.push("/create")}
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

        {/* Netflix-Style Model Showcase - Compressed top margin */}
        <ModelShowcase />

        {/* CTA Section - Compressed spacing */}
        <section className="py-8 md:py-12 border-t border-white/5">
          <div className="px-4 md:px-8 text-center">
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                <Zap className="w-4 h-4" />
                Join 5,000+ creators
              </div>

              <h2 className="text-3xl md:text-5xl font-bold text-white">
                Start Creating for Free
              </h2>

              <p className="text-base md:text-lg text-white/40 max-w-xl mx-auto">
                No credit card required. Instant access to 12 free tools and premium AI models.
              </p>

              <Button
                onClick={() => router.push("/create")}
                size="lg"
                className="text-base md:text-lg px-8 py-6 bg-purple-500 hover:bg-purple-600"
              >
                Generate Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">40+</div>
                  <div className="text-xs md:text-sm text-white/40 mt-1">AI Models</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">5,000+</div>
                  <div className="text-xs md:text-sm text-white/40 mt-1">Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-bold text-white">12</div>
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