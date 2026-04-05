import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const FEATURED_MODELS = [
  {
    id: "nana-banana",
    name: "Nana Banana 2",
    description: "Best 4K image model ever",
    icon: "🍌",
    color: "from-yellow-400 to-orange-500",
    type: "image",
    href: "/images/generate",
    isPro: true,
  },
  {
    id: "kling-motion",
    name: "Motion Control",
    description: "Precise control of character movements",
    icon: "🎬",
    color: "from-purple-500 to-cyan-500",
    type: "video",
    href: "/video/kling",
    isPro: true,
  },
  {
    id: "seedream",
    name: "Seedream 4.5",
    description: "Photorealistic image synthesis",
    icon: "🌱",
    color: "from-green-400 to-emerald-500",
    type: "image",
    href: "/images/generate",
  },
  {
    id: "grok",
    name: "Grok Image",
    description: "X.AI's creative generation",
    icon: "⚡",
    color: "from-blue-400 to-cyan-500",
    type: "image",
    href: "/images/generate",
  },
  {
    id: "imagen",
    name: "Google Imagen 4",
    description: "Latest from Google AI",
    icon: "🎨",
    color: "from-red-400 to-pink-500",
    type: "image",
    href: "/images/generate",
    isPro: true,
  },
  {
    id: "inpaint",
    name: "Inpainting",
    description: "Edit and remove objects",
    icon: "✨",
    color: "from-indigo-400 to-purple-500",
    type: "edit",
    href: "/edit/inpaint",
  },
];

export function FeaturedModels() {
  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading font-bold text-2xl md:text-3xl mb-1">
            TOP CHOICE
          </h2>
          <p className="text-sm text-muted-foreground">
            Creator-recommended tools tailored for professionals
          </p>
        </div>
        <Link href="/tools">
          <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            See all
            <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_MODELS.map((model) => (
          <Link key={model.id} href={model.href}>
            <Card className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 cursor-pointer h-full">
              <div className={`absolute inset-0 bg-gradient-to-br ${model.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <CardContent className="p-0 relative">
                {/* Preview Area */}
                <div className={`aspect-square flex items-center justify-center bg-gradient-to-br ${model.color} relative`}>
                  <div className="text-8xl">{model.icon}</div>
                  
                  {/* Pro Badge */}
                  {model.isPro && (
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1 rounded-full bg-purple-500 text-white text-xs font-bold uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Pro
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-heading font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
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