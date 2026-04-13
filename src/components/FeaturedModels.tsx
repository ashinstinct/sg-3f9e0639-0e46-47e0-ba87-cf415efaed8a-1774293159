import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURED_MODELS = [
  {
    id: "nano-banana",
    name: "Nano Banana 2",
    tagline: "Ultra-realistic portraits and photography",
    logo: "🍌",
    credits: "4-5 credits",
    gradient: "from-yellow-400 via-orange-400 to-amber-500",
    href: "/images/nano-banana",
  },
  {
    id: "kling-motion",
    name: "Kling Motion Control 3.0",
    tagline: "Transfer character motion",
    logo: "K",
    credits: "12-20 credits",
    gradient: "from-purple-400 via-pink-400 to-rose-400",
    href: "/video/kling",
  },
  {
    id: "seedream",
    name: "Seedream 4.5",
    tagline: "Photorealistic AI image generation",
    logo: "S",
    credits: "4-5 credits",
    gradient: "from-green-400 via-emerald-400 to-teal-400",
    href: "/images/seedream",
  },
  {
    id: "grok",
    name: "Grok Image 1.5",
    tagline: "Creative AI from X.AI",
    logo: "𝕏",
    credits: "5 credits",
    gradient: "from-blue-400 via-cyan-400 to-sky-400",
    href: "/images/grok",
  },
  {
    id: "imagen",
    name: "Imagen 4",
    tagline: "Unprecedented photorealism",
    logo: "G",
    credits: "5-7 credits",
    gradient: "from-red-400 via-pink-400 to-rose-400",
    href: "/images/generate",
  },
  {
    id: "inpainting",
    name: "AI Inpainting",
    tagline: "Remove unwanted objects instantly",
    logo: "✨",
    credits: "3-4 credits",
    gradient: "from-indigo-400 via-purple-400 to-violet-400",
    href: "/edit/inpaint",
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
        <Link href="/tools" className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          See all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURED_MODELS.map((model) => (
          <Link key={model.id} href={model.href}>
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-full aspect-square">
              <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-90`} />
              
              <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                    {model.logo}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
                    {model.credits}
                  </span>
                </div>
                
                <div className="text-white">
                  <h3 className="font-heading font-bold text-lg md:text-xl mb-1 leading-tight">
                    {model.name}
                  </h3>
                  <p className="text-sm text-white/90 leading-tight">
                    {model.tagline}
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