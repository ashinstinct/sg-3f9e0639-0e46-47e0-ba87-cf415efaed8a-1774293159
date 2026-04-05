import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Wand2, Video, Sparkles, Image as ImageIcon, Palette, Move } from "lucide-react";
import Link from "next/link";

const FEATURED_MODELS = [
  {
    id: "nana-banana",
    name: "Nana Banana 2",
    company: "fal.ai",
    description: "Ultra HD image generation in 10 seconds",
    credits: "4-5 credits",
    gradient: "from-amber-400 via-yellow-400 to-orange-400",
    textColor: "text-amber-900",
    href: "/images/generate",
    badge: "Ultra HD",
    features: ["4K Output", "10s Gen", "Premium"],
  },
  {
    id: "kling",
    name: "Motion Control",
    company: "Kling AI",
    description: "Precise control of character movements",
    credits: "12-20 credits",
    gradient: "from-purple-500 via-pink-500 to-rose-500",
    textColor: "text-purple-100",
    href: "/video/kling",
    badge: "CREATIVE",
    features: ["Camera Pan", "Zoom", "Tilt"],
  },
  {
    id: "seedream",
    name: "Seedream 4.5",
    company: "fal.ai",
    description: "Photorealistic image synthesis",
    credits: "4-5 credits",
    gradient: "from-emerald-400 via-green-400 to-teal-400",
    textColor: "text-emerald-900",
    href: "/images/generate",
    badge: "Photorealistic",
    features: ["Natural", "Realistic", "Turbo"],
  },
  {
    id: "grok",
    name: "Grok Image",
    company: "xAI",
    description: "X.AI's creative generation",
    credits: "5 credits",
    gradient: "from-blue-500 via-cyan-500 to-sky-400",
    textColor: "text-blue-100",
    href: "/images/generate",
    badge: "Creative",
    features: ["Fast", "Creative", "Sharp"],
  },
  {
    id: "imagen",
    name: "Imagen 4",
    company: "Google",
    description: "Latest from Google AI",
    credits: "5-7 credits",
    gradient: "from-red-500 via-pink-500 to-rose-500",
    textColor: "text-red-100",
    href: "/images/generate",
    badge: "PRO",
    features: ["4K", "Premium", "Advanced"],
  },
  {
    id: "inpainting",
    name: "Inpainting",
    company: "fal.ai",
    description: "Edit and remove objects",
    credits: "3-4 credits",
    gradient: "from-indigo-500 via-purple-500 to-violet-500",
    textColor: "text-indigo-100",
    href: "/edit/inpaint",
    badge: "Editor",
    features: ["Precision", "AI Edit", "Smart"],
  },
];

const COMPANY_LOGOS: Record<string, { icon: any; color: string }> = {
  "fal.ai": { icon: Wand2, color: "text-purple-500" },
  "Kling AI": { icon: Video, color: "text-pink-500" },
  "xAI": { icon: Sparkles, color: "text-cyan-500" },
  "Google": { icon: ImageIcon, color: "text-red-500" },
};

export function FeaturedModels() {
  return (
    <section className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl">TOP CHOICE</h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
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
        {FEATURED_MODELS.map((model) => {
          const CompanyIcon = COMPANY_LOGOS[model.company]?.icon || Wand2;
          const iconColor = COMPANY_LOGOS[model.company]?.color || "text-primary";
          
          return (
          <Link key={model.id} href={model.href}>
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 cursor-pointer aspect-square">
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />
              
              {/* Content Overlay */}
              <CardContent className="relative z-10 p-4 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg bg-white/20 backdrop-blur-sm ${model.textColor}`}>
                    <CompanyIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm font-medium ${model.textColor}`}>
                    {model.credits}
                  </span>
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                  <div>
                    <h3 className={`font-heading font-bold text-lg md:text-xl ${model.textColor} mb-1 leading-tight`}>
                      {model.name}
                    </h3>
                    <p className={`text-xs ${model.textColor} opacity-90 line-clamp-2`}>
                      {model.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {model.features.map((feature) => (
                      <span
                        key={feature}
                        className={`text-[10px] px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm ${model.textColor} font-medium`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Company Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium ${model.textColor} opacity-75`}>
                    {model.company}
                  </span>
                  {model.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm ${model.textColor} font-bold`}>
                      {model.badge}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
          );
        })}
      </div>
    </section>
  );
}