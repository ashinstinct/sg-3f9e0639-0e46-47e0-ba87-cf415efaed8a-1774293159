import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const FEATURED_MODELS = [
  {
    id: "nana-banana",
    name: "Nana Banana 2",
    description: "Ultra HD image generation in 10 seconds",
    link: "/images/generate",
    credits: "4-5 credits",
    badges: ["Ultra HD", "10s Gen", "Premium"],
    gradient: "from-yellow-400 via-orange-400 to-amber-500",
  },
  {
    id: "kling-motion",
    name: "Motion Control",
    description: "Precise control of character movements",
    link: "/video/kling",
    credits: "12-20 credits",
    badge: "CREATIVE",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    id: "seedream",
    name: "Seedream 4.5",
    description: "Photorealistic image synthesis",
    link: "/images/generate",
    credits: "4-5 credits",
    gradient: "from-green-400 via-emerald-500 to-teal-500",
  },
  {
    id: "grok",
    name: "Grok Image",
    description: "X.AI's creative generation",
    link: "/images/generate",
    credits: "5 credits",
    gradient: "from-blue-400 via-cyan-500 to-sky-400",
  },
  {
    id: "imagen",
    name: "Google Imagen 4",
    description: "Latest from Google AI",
    link: "/images/generate",
    credits: "5-7 credits",
    badge: "PRO",
    gradient: "from-red-400 via-pink-500 to-rose-500",
  },
  {
    id: "inpaint",
    name: "Inpainting",
    description: "Edit and remove objects",
    link: "/edit/inpaint",
    credits: "3-4 credits",
    gradient: "from-indigo-500 via-purple-500 to-violet-500",
  },
];

export function FeaturedModels() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-1">
            TOP CHOICE
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Creator-recommended tools tailored for you
          </p>
        </div>
        <Link 
          href="/tools" 
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          See all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2 columns on mobile, 3 on tablet, 3 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {FEATURED_MODELS.map((model) => (
          <Link key={model.id} href={model.link}>
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer aspect-square">
              <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-80 group-hover:opacity-90 transition-opacity`} />
              
              <CardContent className="relative h-full flex flex-col justify-between p-4 text-white">
                <div className="flex items-start justify-between">
                  {model.badges ? (
                    <div className="flex flex-wrap gap-1">
                      {model.badges.map((badge) => (
                        <span key={badge} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm font-medium">
                          {badge}
                        </span>
                      ))}
                    </div>
                  ) : model.badge ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm font-medium">
                      {model.badge}
                    </span>
                  ) : (
                    <div />
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm font-medium">
                    {model.credits}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-base md:text-lg mb-1">
                    {model.name}
                  </h3>
                  <p className="text-[11px] md:text-xs text-white/90 line-clamp-2">
                    {model.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}