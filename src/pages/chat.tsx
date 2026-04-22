import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { useRouter } from "next/router";
import { ArrowRight, Sparkles, PenLine, ImageIcon, Video, Music, Mic, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StartNew() {
  const router = useRouter();

  const quickActions = [
    { icon: PenLine, label: "Start New", href: "/images/generate", color: "from-purple-500 to-purple-600", neon: "neon-purple" },
    { icon: ImageIcon, label: "Generate Image", href: "/images/generate", color: "from-pink-500 to-rose-600", neon: "neon-pink" },
    { icon: Video, label: "Generate Video", href: "/video/generate", color: "from-cyan-500 to-cyan-600", neon: "neon-cyan" },
    { icon: Music, label: "Generate Music", href: "/music", color: "from-emerald-500 to-emerald-600", neon: "neon-green" },
    { icon: Mic, label: "Clone Voice", href: "/clone", color: "from-blue-500 to-blue-600", neon: "neon-blue" },
    { icon: Wand2, label: "Edit Image", href: "/edit/inpaint", color: "from-orange-500 to-orange-600", neon: "neon-orange" },
  ];

  return (
    <>
      <SEO
        title="Start New - Back2Life.Studio"
        description="Choose what you want to create with AI"
      />
      <Navigation />

      <main className="min-h-screen bg-[#0a0a0a] flex flex-col">
        {/* Reduced padding to align with burger menu */}
        <section className="flex-1 flex items-center justify-center px-4 py-8 pt-12 md:pt-20">
          <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Start Creating
              </h1>
              <p className="text-base md:text-lg text-white/50 max-w-xl mx-auto">
                Choose a tool to get started with AI-powered content creation
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => router.push(action.href)}
                    className="relative group overflow-hidden rounded-2xl bg-[#161618] border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.02]"
                  >
                    {/* Neon gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    
                    <div className="relative p-6 md:p-8">
                      <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-${action.neon}/10 border border-${action.neon}/30 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-[0_0_30px_var(--${action.neon})] transition-all`}>
                        <Icon className={`w-7 h-7 md:w-8 md:h-8 text-${action.neon}`} />
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-semibold text-white mb-2 text-left">
                        {action.label}
                      </h3>
                      
                      <div className="flex items-center text-sm text-white/50 group-hover:text-white/70 transition-colors">
                        <span className="flex-1 text-left">Get started</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <Button
                variant="outline"
                onClick={() => router.push("/tools")}
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-base"
              >
                Browse All Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}