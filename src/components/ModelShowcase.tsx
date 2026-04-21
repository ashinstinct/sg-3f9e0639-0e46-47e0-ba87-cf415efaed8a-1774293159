import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Play, ExternalLink, Crown } from "lucide-react";
import Link from "next/link";

interface ModelTrailer {
  id: string;
  name: string;
  company: string;
  description: string;
  videoId: string;
  thumbnail: string;
  category: "video" | "image";
  tier: "free" | "pro";
  href: string;
  badge?: string;
  logo?: string;
}

const videoModels: ModelTrailer[] = [
  {
    id: "seedance",
    name: "Seedance 2.0",
    company: "ByteDance",
    description: "State-of-the-art dance and motion video generation",
    videoId: "xH2QLkN3fRk",
    thumbnail: "https://img.youtube.com/vi/xH2QLkN3fRk/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    badge: "NEW",
    logo: "/logos/seedance.svg",
  },
  {
    id: "kling",
    name: "Kling 3.0",
    company: "Kuaishou",
    description: "Professional cinematic video generation with precise control",
    videoId: "jMQ3MHp6LYc",
    thumbnail: "https://img.youtube.com/vi/jMQ3MHp6LYc/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    badge: "POPULAR",
    logo: "/logos/kling.svg",
  },
  {
    id: "veo",
    name: "Veo 3",
    company: "Google DeepMind",
    description: "Google's most capable video generation model",
    videoId: "bTFXNBgKFz0",
    thumbnail: "https://img.youtube.com/vi/bTFXNBgKFz0/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    badge: "HOT",
    logo: "/logos/veo.svg",
  },
  {
    id: "runway",
    name: "Runway Gen-4",
    company: "Runway",
    description: "Next-generation creative video tools for filmmakers",
    videoId: "sPAGn6wxbHU",
    thumbnail: "https://img.youtube.com/vi/sPAGn6wxbHU/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    logo: "/logos/runway.svg",
  },
  {
    id: "wan",
    name: "Wan 2.1",
    company: "Alibaba",
    description: "Open-source video generation with impressive quality",
    videoId: "LFa5pHSi6ws",
    thumbnail: "https://img.youtube.com/vi/LFa5pHSi6ws/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    logo: "/logos/wan.svg",
  },
  {
    id: "minimax",
    name: "MiniMax Video-01",
    company: "MiniMax",
    description: "High-quality video generation with natural motion",
    videoId: "k7zMMJGDfHQ",
    thumbnail: "https://img.youtube.com/vi/k7zMMJGDfHQ/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    logo: "/logos/minimax.svg",
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    company: "Luma AI",
    description: "Fast, high-quality video generation from text and images",
    videoId: "QMVyx_GHpYg",
    thumbnail: "https://img.youtube.com/vi/QMVyx_GHpYg/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    logo: "/logos/luma.svg",
  },
  {
    id: "hunyuan",
    name: "HunyuanVideo",
    company: "Tencent",
    description: "Open-source video generation with cinematic quality",
    videoId: "4sMjlGDYaOE",
    thumbnail: "https://img.youtube.com/vi/4sMjlGDYaOE/maxresdefault.jpg",
    category: "video",
    tier: "pro",
    href: "/video/generate",
    logo: "/logos/hunyuan.svg",
  },
  {
    id: "ltx",
    name: "LTX Video",
    company: "Lightricks",
    description: "Real-time video generation with creative controls",
    videoId: "X5SaJJmYp2U",
    thumbnail: "https://img.youtube.com/vi/X5SaJJmYp2U/maxresdefault.jpg",
    category: "video",
    tier: "free",
    href: "/video/generate",
    logo: "/logos/ltx.svg",
  },
];

const imageModels: ModelTrailer[] = [
  {
    id: "seedream",
    name: "Seedream 4.0",
    company: "ByteDance",
    description: "Ultra-photorealistic image generation",
    videoId: "W0gXpwVG8BY",
    thumbnail: "https://img.youtube.com/vi/W0gXpwVG8BY/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    badge: "NEW",
    logo: "/logos/seedream.svg",
  },
  {
    id: "flux",
    name: "FLUX.1 Schnell",
    company: "Black Forest Labs",
    description: "Lightning-fast free image generation",
    videoId: "W3kVozEluro",
    thumbnail: "https://img.youtube.com/vi/W3kVozEluro/maxresdefault.jpg",
    category: "image",
    tier: "free",
    href: "/images/generate",
    badge: "FREE",
    logo: "/logos/flux.svg",
  },
  {
    id: "grok",
    name: "Grok Aurora",
    company: "xAI",
    description: "Photorealistic images with natural understanding",
    videoId: "gEXaJi-i3Eo",
    thumbnail: "https://img.youtube.com/vi/gEXaJi-i3Eo/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    badge: "HOT",
    logo: "/logos/grok.svg",
  },
  {
    id: "ideogram",
    name: "Ideogram 3.0",
    company: "Ideogram",
    description: "Best-in-class text rendering in images",
    videoId: "5X6RwGGAqAw",
    thumbnail: "https://img.youtube.com/vi/5X6RwGGAqAw/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    logo: "/logos/ideogram.svg",
  },
  {
    id: "recraft",
    name: "Recraft V3",
    company: "Recraft",
    description: "Design-focused generation with brand consistency",
    videoId: "lQBErT0Dz_Q",
    thumbnail: "https://img.youtube.com/vi/lQBErT0Dz_Q/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    logo: "/logos/recraft.svg",
  },
  {
    id: "nano-banana",
    name: "Nano Banana 2.0",
    company: "Nano Banana",
    description: "High-quality artistic image generation",
    videoId: "GNpGp3Y0nUo",
    thumbnail: "https://img.youtube.com/vi/GNpGp3Y0nUo/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    logo: "/logos/nano-banana.svg",
  },
  {
    id: "playground",
    name: "Playground V3",
    company: "Playground",
    description: "Creative image generation with artistic styles",
    videoId: "P88ZlJQXbxQ",
    thumbnail: "https://img.youtube.com/vi/P88ZlJQXbxQ/maxresdefault.jpg",
    category: "image",
    tier: "pro",
    href: "/images/generate",
    logo: "/logos/playground.svg",
  },
  {
    id: "stable-diffusion",
    name: "Stable Diffusion XL",
    company: "Stability AI",
    description: "Open-source image generation powerhouse",
    videoId: "nVhmFski3vg",
    thumbnail: "https://img.youtube.com/vi/nVhmFski3vg/maxresdefault.jpg",
    category: "image",
    tier: "free",
    href: "/images/generate",
    badge: "FREE",
    logo: "/logos/stability.svg",
  },
];

function CarouselRow({ title, models, icon }: { title: string; models: ModelTrailer[]; icon: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-10 md:mb-14">
      <div className="flex items-center gap-3 mb-4 md:mb-6 px-4 md:px-8">
        {icon}
        <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-r from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-3 md:gap-4 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {models.map((model) => (
            <div
              key={model.id}
              className="flex-none w-[280px] md:w-[340px] lg:w-[400px] snap-start group/card"
            >
              <div className="relative rounded-xl overflow-hidden bg-[#161618] border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="relative aspect-video bg-black">
                  {playingId === model.id ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${model.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <>
                      <img
                        src={model.thumbnail}
                        alt={model.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors" />
                      <button
                        onClick={() => setPlayingId(model.id)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/card:scale-110 group-hover/card:bg-white/30 transition-all">
                          <Play className="w-6 h-6 md:w-7 md:h-7 text-white ml-1" fill="white" />
                        </div>
                      </button>
                      {model.badge && (
                        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${
                          model.badge === "NEW" ? "bg-purple-500 text-white" :
                          model.badge === "FREE" ? "bg-emerald-500 text-white" :
                          model.badge === "HOT" ? "bg-orange-500 text-white" :
                          model.badge === "POPULAR" ? "bg-blue-500 text-white" :
                          "bg-white/20 text-white"
                        }`}>
                          {model.badge}
                        </span>
                      )}
                      {model.tier === "pro" && !model.badge && (
                        <span className="absolute top-3 right-3 p-1.5 rounded-md bg-amber-500/20 backdrop-blur-sm">
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    {model.logo && (
                      <img src={model.logo} alt="" className="w-5 h-5 rounded" />
                    )}
                    <h3 className="font-semibold text-white text-sm md:text-base truncate">{model.name}</h3>
                    <span className="text-[11px] text-white/40 ml-auto flex-shrink-0">{model.company}</span>
                  </div>
                  <p className="text-xs md:text-sm text-white/50 line-clamp-1">{model.description}</p>
                  <Link
                    href={model.href}
                    className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-sm text-white/70 hover:text-white transition-all"
                  >
                    Try it now
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-12 items-center justify-center bg-gradient-to-l from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ModelShowcase() {
  return (
    <section className="py-10 md:py-16">
      <CarouselRow
        title="AI Video Models"
        models={videoModels}
        icon={<Play className="w-6 h-6 text-purple-400" fill="currentColor" />}
      />
      <CarouselRow
        title="AI Image Models"
        models={imageModels}
        icon={<div className="w-6 h-6 rounded bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">AI</div>}
      />
    </section>
  );
}