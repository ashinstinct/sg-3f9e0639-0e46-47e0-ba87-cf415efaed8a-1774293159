import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const FEATURED_MODELS = [
  {
    name: "Nana Banana 2",
    tagline: "Ultra HD image generation in 10 seconds",
    credits: "4-5 credits",
    color: "from-yellow-400 to-orange-500",
    href: "/images/nana-banana",
    logo: "🍌", // Temporary - will be replaced with actual logo
  },
  {
    name: "Motion Control",
    tagline: "Precise control of character movements",
    credits: "12-20 credits",
    color: "from-purple-400 to-pink-500",
    href: "/video/kling",
    logo: "K", // Kling logo placeholder
  },
  {
    name: "Seedream 4.5",
    tagline: "Photorealistic image synthesis",
    credits: "4-5 credits",
    color: "from-green-400 to-emerald-500",
    href: "/images/generate",
    logo: "S",
  },
  {
    name: "Grok Image",
    tagline: "X.AI's creative generation",
    credits: "5 credits",
    color: "from-blue-400 to-cyan-500",
    href: "/images/grok",
    logo: "𝕏", // X.AI logo
  },
  {
    name: "Imagen 4",
    tagline: "Latest from Google AI",
    credits: "5-7 credits",
    color: "from-red-400 to-pink-500",
    href: "/images/generate",
    logo: "G", // Google logo placeholder
  },
  {
    name: "Inpainting",
    tagline: "Edit and remove objects",
    credits: "3-4 credits",
    color: "from-indigo-500 to-purple-500",
    href: "/edit/inpaint",
    logo: "✨",
  },
];

export function FeaturedModels() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl mb-1">TOP CHOICE</h2>
          <p className="text-sm text-muted-foreground">
            Creator-recommended tools tailored for you
          </p>
        </div>
        <Link 
          href="/tools" 
          className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          See all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {FEATURED_MODELS.map((model) => (
          <Link key={model.name} href={model.href}>
            <Card className="group relative overflow-hidden border-0 h-full aspect-square">
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
              
              <CardContent className="relative h-full p-4 flex flex-col justify-between text-white">
                {/* Top section - Logo and Credits */}
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold">
                    {model.logo}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-sm text-xs font-medium">
                    {model.credits}
                  </span>
                </div>

                {/* Bottom section - Name and Tagline */}
                <div>
                  <h3 className="font-heading font-bold text-xl mb-1 leading-tight">
                    {model.name}
                  </h3>
                  <p className="text-sm text-white/90 leading-snug">
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