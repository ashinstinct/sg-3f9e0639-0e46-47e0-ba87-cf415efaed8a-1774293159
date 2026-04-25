import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Check } from "lucide-react";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16 px-4">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/30 rounded-full blur-[120px] animate-pulse delay-700" />

      <div className="relative z-10 container mx-auto max-w-6xl text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          14 Free Tools + Premium AI Models
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight">
          Create Stunning AI
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Images & Videos
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Professional AI generation tools for creators, marketers, and developers.
          Start creating in seconds.
        </p>

        {/* Social Proof Stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-foreground">240K+ creations</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-foreground">40+ AI models</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-foreground">Free to start</span>
          </div>
        </div>

        {/* Primary CTA with hard shadow */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            onClick={() => router.push("/generate")}
            size="lg"
            className="text-lg px-10 py-7 bg-purple-500 hover:bg-purple-600"
          >
            <span className="flex items-center">
              Generate for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </span>
          </Button>
          
          {/* Secondary ghost link */}
          <button
            onClick={() => router.push("/tools")}
            className="text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            Browse all tools
          </button>
        </div>

        {/* Trust indicators */}
        <div className="pt-8 text-xs text-muted-foreground">
          No credit card required • Instant access • Cancel anytime
        </div>
      </div>
    </section>
  );
}