import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Play, Crown, Clock, Mic, Layers, Image as ImageIcon, Download, Scissors, Repeat, SlidersHorizontal, Wand2, UserRound, Sparkles, Film, Brush, Music, Volume2, Palette, type LucideIcon, ArrowRight, Video, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";

/* ─── Types ─── */
interface ModelCard {
  id: string;
  name: string;
  company?: string;
  description: string;
  thumbnail: string;
  tier: "free" | "pro";
  href: string;
  badge?: string;
  logo?: string;
  icon?: string;
}

/* ─── Data ─── */

const IMAGE_GENERATORS: ModelCard[] = [
  { id: "seedream", name: "Seedream 4.5", company: "ByteDance", description: "Ultra-photorealistic images", thumbnail: "https://images.unsplash.com/photo-1682686581030-7fa4ea2b96c3?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=seedream-4.5", badge: "NEW", logo: "/logos/seedream.svg" },
  { id: "flux", name: "FLUX.1 Schnell", company: "Black Forest Labs", description: "Lightning-fast free generation", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=340&fit=crop&q=80", tier: "free", href: "/images/generate?model=flux-schnell", badge: "FREE", logo: "/logos/flux.svg" },
  { id: "grok", name: "Grok Aurora", company: "xAI", description: "Photorealistic with natural understanding", thumbnail: "https://images.unsplash.com/photo-1635776062360-af423602aff3?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=grok-1.5-image", badge: "HOT", logo: "/logos/grok.svg" },
  { id: "ideogram", name: "Ideogram 3.0", company: "Ideogram", description: "Best text rendering in images", thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=ideogram-v2", logo: "/logos/ideogram.svg" },
  { id: "recraft", name: "Recraft V3", company: "Recraft", description: "Design-focused brand consistency", thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=recraft-v3", logo: "/logos/recraft.svg" },
  { id: "nano-banana", name: "Nano Banana 2.0", company: "Nano Banana", description: "High-quality artistic generation", thumbnail: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=nano-banana-2", logo: "/logos/nano-banana.svg" },
  { id: "playground", name: "Playground V3", company: "Playground", description: "Creative artistic styles", thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/images/generate?model=playground-v2.5", logo: "/logos/playground.svg" },
  { id: "stable-diffusion", name: "Stable Diffusion XL", company: "Stability AI", description: "Open-source powerhouse", thumbnail: "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=600&h=340&fit=crop&q=80", tier: "free", href: "/images/generate?model=sd-xl", badge: "FREE", logo: "/logos/stability.svg" },
];

const VIDEO_GENERATORS: ModelCard[] = [
  { id: "seedance", name: "Seedance 1.5 Pro", company: "ByteDance", description: "State-of-the-art dance and motion generation", thumbnail: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=seedance-1.5-pro", badge: "NEW", logo: "/logos/seedance.svg" },
  { id: "kling", name: "Kling 3.0", company: "Kuaishou", description: "Professional cinematic video generation", thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=kling-3.0", badge: "POPULAR", logo: "/logos/kling.svg" },
  { id: "veo", name: "Veo 3.1 Pro", company: "Google DeepMind", description: "Google's most capable video model", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=veo-3.1-pro", badge: "HOT", logo: "/logos/veo.svg" },
  { id: "runway", name: "Runway Gen-3", company: "Runway", description: "Next-gen creative video tools", thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=runway-gen3-alpha", logo: "/logos/runway.svg" },
  { id: "wan", name: "Wan 2.2", company: "Alibaba", description: "Open-source video generation", thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=wan-2.2", logo: "/logos/wan.svg" },
  { id: "minimax", name: "MiniMax 02", company: "MiniMax", description: "High-quality natural motion video", thumbnail: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=minimax-02", logo: "/logos/minimax.svg" },
  { id: "luma", name: "Luma Dream Machine", company: "Luma AI", description: "Fast text-to-video generation", thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=luma-1.6", logo: "/logos/luma.svg" },
  { id: "hunyuan", name: "HunyuanVideo", company: "Tencent", description: "Open-source cinematic quality", thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/generate?model=hunyuan-1.0", logo: "/logos/hunyuan.svg" },
  { id: "ltx", name: "LTX-2-19B", company: "Lightricks", description: "Real-time video generation", thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop&q=80", tier: "free", href: "/video/generate?model=ltx-2-19b", logo: "/logos/ltx.svg" },
  { id: "heygen", name: "HeyGen AI Avatar", company: "HeyGen", description: "AI-powered talking avatars", thumbnail: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/avatar", badge: "NEW", logo: "/logos/heygen.svg" },
];

const IMAGE_TOOLS: ModelCard[] = [
  { id: "inpaint", name: "Inpaint Editor", description: "Remove or replace objects", thumbnail: "https://images.unsplash.com/photo-1552168324-d612d77725e3?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/edit/inpaint", icon: "Brush", badge: "AI" },
  { id: "upscale", name: "Image Upscaler", description: "Enhance resolution with AI", thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/edit/inpaint", icon: "Palette" },
  { id: "bg-remove", name: "Background Remover", description: "Instant background removal", thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/edit/inpaint", icon: "Brush" },
  { id: "image-to-prompt", name: "Image to Prompt", description: "Describe any image with AI", thumbnail: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=340&fit=crop&q=80", tier: "free", href: "/image-to-prompt", icon: "Sparkles" },
];

const VIDEO_TOOLS: ModelCard[] = [
  { id: "kling-edit", name: "Kling Omni Edit", description: "Edit videos with AI prompts", thumbnail: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/kling", icon: "Film", badge: "NEW" },
  { id: "kling-motion", name: "Kling Motion Control", description: "Control movement in videos", thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/video/kling", icon: "Film" },
  { id: "extract", name: "Frame Extractor", description: "Pull frames from video", thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=340&fit=crop&q=80", tier: "free", href: "/extract", icon: "ImageIcon" },
  { id: "download", name: "Video Downloader", description: "Save from any platform", thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=340&fit=crop&q=80", tier: "free", href: "/download", icon: "Download" },
  { id: "split", name: "Video Splitter", description: "Cut & segment videos", thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=340&fit=crop&q=80", tier: "free", href: "/split", icon: "Scissors" },
  { id: "screen-record", name: "Screen Recorder", description: "Record your screen", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop&q=80", tier: "free", href: "/record-screen", icon: "Film" },
  { id: "video-gen-free", name: "AI Video Gen (Free)", description: "Free video generation", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop&q=80", tier: "free", href: "/video-gen", icon: "Film" },
];

const AUDIO_TOOLS: ModelCard[] = [
  { id: "clone", name: "Voice Cloner", description: "Clone any voice with AI", thumbnail: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/clone", icon: "UserRound", badge: "PRO" },
  { id: "tts", name: "Text-to-Speech", description: "Natural voice synthesis", thumbnail: "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/clone", icon: "Volume2" },
  { id: "music", name: "Music Generator", description: "AI music composition", thumbnail: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/music", icon: "Music" },
  { id: "sfx", name: "Sound FX for Video", description: "Cinematic sound effects", thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=600&h=340&fit=crop&q=80", tier: "pro", href: "/enhance", icon: "Volume2" },
  { id: "record-voice", name: "Voice Recorder", description: "Record in browser", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=340&fit=crop&q=80", tier: "free", href: "/record-voice", icon: "Mic", badge: "FREE" },
  { id: "transcriber", name: "Transcriber", description: "Audio/video to text", thumbnail: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=600&h=340&fit=crop&q=80", tier: "free", href: "/transcriber", icon: "Mic" },
  { id: "audio-editor", name: "Audio Editor", description: "Trim, fade, adjust audio", thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=340&fit=crop&q=80", tier: "free", href: "/audio-editor", icon: "SlidersHorizontal" },
  { id: "stems", name: "Stem Separator", description: "Split vocals, drums, bass", thumbnail: "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=600&h=340&fit=crop&q=80", tier: "free", href: "/stems", icon: "Layers" },
  { id: "convert", name: "Audio Converter", description: "Convert any audio format", thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=340&fit=crop&q=80", tier: "free", href: "/convert", icon: "Repeat" },
  { id: "enhance", name: "Audio Enhancer", description: "Denoise & enhance quality", thumbnail: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=340&fit=crop&q=80", tier: "free", href: "/enhance", icon: "Wand2" },
];

const FREE_TOOLS: ModelCard[] = [
  { id: "extract", name: "Frame Extractor", description: "Pull frames from video", thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=600&h=340&fit=crop&q=80", tier: "free", href: "/extract", icon: "ImageIcon" },
  { id: "download", name: "Video Downloader", description: "Save from any platform", thumbnail: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&h=340&fit=crop&q=80", tier: "free", href: "/download", icon: "Download" },
  { id: "split", name: "Video Splitter", description: "Cut & segment videos", thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&h=340&fit=crop&q=80", tier: "free", href: "/split", icon: "Scissors" },
  { id: "screen-record", name: "Screen Recorder", description: "Record your screen", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=340&fit=crop&q=80", tier: "free", href: "/record-screen", icon: "Film" },
  { id: "image-to-prompt", name: "Image to Prompt", description: "Describe any image with AI", thumbnail: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=340&fit=crop&q=80", tier: "free", href: "/image-to-prompt", icon: "Sparkles" },
  { id: "video-gen-free", name: "AI Video Gen (Free)", description: "Free video generation", thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop&q=80", tier: "free", href: "/video-gen", icon: "Film" },
  { id: "record-voice", name: "Voice Recorder", description: "Record in browser", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=340&fit=crop&q=80", tier: "free", href: "/record-voice", icon: "Mic" },
  { id: "transcriber", name: "Transcriber", description: "Audio/video to text", thumbnail: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=600&h=340&fit=crop&q=80", tier: "free", href: "/transcriber", icon: "Mic" },
  { id: "audio-editor", name: "Audio Editor", description: "Trim, fade, adjust audio", thumbnail: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=340&fit=crop&q=80", tier: "free", href: "/audio-editor", icon: "SlidersHorizontal" },
  { id: "stems", name: "Stem Separator", description: "Split vocals, drums, bass", thumbnail: "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=600&h=340&fit=crop&q=80", tier: "free", href: "/stems", icon: "Layers" },
  { id: "convert", name: "Audio Converter", description: "Convert any audio format", thumbnail: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=340&fit=crop&q=80", tier: "free", href: "/convert", icon: "Repeat" },
  { id: "enhance", name: "Audio Enhancer", description: "Denoise & enhance quality", thumbnail: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&h=340&fit=crop&q=80", tier: "free", href: "/enhance", icon: "Wand2" },
];

/* ─── Recently Used ─── */

const ALL_RECENT_TOOLS = [
  { id: "flux", name: "FLUX.1", category: "image", href: "/images/generate", logo: "/logos/flux.svg" },
  { id: "kling", name: "Kling 3.0", category: "video", href: "/video/generate", logo: "/logos/kling.svg" },
  { id: "whisper", name: "Transcriber", category: "audio", href: "/transcriber", icon: "Mic" as const },
  { id: "spleeter", name: "Stem Separator", category: "audio", href: "/stems", icon: "Layers" as const },
  { id: "extractor", name: "Frame Extractor", category: "free", href: "/extract", icon: "ImageIcon" as const },
  { id: "downloader", name: "Video Downloader", category: "free", href: "/download", icon: "Download" as const },
  { id: "splitter", name: "Video Splitter", category: "free", href: "/split", icon: "Scissors" as const },
  { id: "converter", name: "Audio Converter", category: "free", href: "/convert", icon: "Repeat" as const },
  { id: "editor", name: "Audio Editor", category: "free", href: "/audio-editor", icon: "SlidersHorizontal" as const },
  { id: "enhancer", name: "Audio Enhancer", category: "audio", href: "/enhance", icon: "Wand2" as const },
  { id: "clone", name: "Voice Cloner", category: "audio", href: "/clone", icon: "UserRound" as const },
  { id: "recorder", name: "Voice Recorder", category: "free", href: "/record-voice", icon: "Mic" as const },
  { id: "image-gen", name: "AI Image Gen", category: "image", href: "/images/generate", icon: "Sparkles" as const },
  { id: "video-gen", name: "AI Video Gen", category: "video", href: "/video-gen", icon: "Film" as const },
  { id: "inpaint", name: "Inpaint Editor", category: "edit-image", href: "/edit/inpaint", icon: "Brush" as const },
  { id: "seedream", name: "Seedream 4.0", category: "image", href: "/images/generate", logo: "/logos/seedream.svg" },
  { id: "grok", name: "Grok Aurora", category: "image", href: "/images/generate", logo: "/logos/grok.svg" },
  { id: "luma", name: "Luma Dream Machine", category: "video", href: "/video/generate", logo: "/logos/luma.svg" },
  { id: "runway", name: "Runway Gen-4", category: "video", href: "/video/generate", logo: "/logos/runway.svg" },
  { id: "ideogram", name: "Ideogram 3.0", category: "image", href: "/images/generate", logo: "/logos/ideogram.svg" },
];

const RECENT_STORAGE_KEY = "b2l_recent_tools";
const MAX_RECENT = 12;

function getRecentTools(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || "[]"); }
  catch { return []; }
}

export function addRecentTool(toolId: string) {
  if (typeof window === "undefined") return;
  const recent = getRecentTools().filter(id => id !== toolId);
  recent.unshift(toolId);
  localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

const ICON_MAP: Record<string, LucideIcon> = {
  Mic, Layers, ImageIcon, Download, Scissors, Repeat, SlidersHorizontal,
  Wand2, UserRound, Sparkles, Film, Brush, Music, Volume2, Palette,
};

function IconOrLogo({ tool }: { tool: typeof ALL_RECENT_TOOLS[number] }) {
  if (tool.logo) return <img src={tool.logo} alt="" className="w-10 h-10 md:w-12 md:h-12 object-contain" />;
  const Icon = ICON_MAP[tool.icon || ""];
  return Icon ? <Icon className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" /> : null;
}

function RecentToolCard({ tool }: { tool: typeof ALL_RECENT_TOOLS[number] }) {
  const router = useRouter();
  
  const handleClick = () => {
    addRecentTool(tool.id);
    router.push(tool.href);
  };

  return (
    <button onClick={handleClick} className="flex-none w-[150px] md:w-[170px] snap-start group text-left">
      <div className="relative rounded-xl overflow-hidden bg-[#161618] border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-emerald-500/10">
        <div className="aspect-[4/3] bg-gradient-to-br from-[#1a1a1e] to-[#0e0e10] flex items-center justify-center relative">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
            <IconOrLogo tool={tool} />
          </div>
          <button onClick={(e) => { e.stopPropagation(); handleClick(); }}
            className="absolute bottom-2 right-2 w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-emerald-400 hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" fill="white" />
          </button>
        </div>
        <div className="p-2.5">
          <p className="text-xs font-medium text-white truncate">{tool.name}</p>
        </div>
      </div>
    </button>
  );
}

/* ─── Generic Carousel Row ─── */

function SectionHeader({ number, title, icon }: { number: string; title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-2 md:mb-3 px-4 md:px-8">
      <span className="text-xs font-bold text-white/25 tabular-nums w-5">{number}</span>
      {icon}
      <h2 className="text-base md:text-lg font-bold text-white tracking-tight">{title}</h2>
    </div>
  );
}

function ModelCarousel({ models }: { models: ModelCard[] }) {
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

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -1 : 1, behavior: "smooth" });
    setTimeout(() => {
      if (!scrollRef.current) return;
      const amount = scrollRef.current.clientWidth * 0.75;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }, 0);
  };

  return (
    <div className="relative group">
      {canScrollLeft && (
        <button onClick={() => scroll("left")} className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-r from-[#0a0a0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
      )}

      <div ref={scrollRef} onScroll={checkScroll}
        className="flex gap-2.5 md:gap-3 overflow-x-auto px-4 md:px-8 pb-3 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {models.map((m) => (
          <ModelCardComponent key={m.id} card={m} playingId={playingId} setPlayingId={setPlayingId} rowGradient="from-purple-500/20" />
        ))}
      </div>

      {canScrollRight && (
        <button onClick={() => scroll("right")} className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-l from-[#0a0a0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
}

function CardBadge({ card }: { card: ModelCard }) {
  if (!card.badge) {
    if (card.tier === "pro") return (
      <span className="absolute top-2 right-2 p-1 rounded-md bg-amber-500/20 backdrop-blur-sm">
        <Crown className="w-3 h-3 text-amber-400" />
      </span>
    );
    return null;
  }
  const colors: Record<string, string> = {
    NEW: "bg-purple-500 text-white",
    FREE: "bg-emerald-500 text-white",
    HOT: "bg-orange-500 text-white",
    POPULAR: "bg-blue-500 text-white",
    PRO: "bg-purple-500/80 text-white",
    AI: "bg-cyan-500 text-black",
  };
  return (
    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider ${colors[card.badge] || "bg-white/20 text-white"}`}>
      {card.badge}
    </span>
  );
}

function GenerateButton({ href, neonColor }: { href: string; neonColor: "purple" | "cyan" | "pink" | "green" | "orange" }) {
  const router = useRouter();
  const colors = {
    purple: "bg-purple-500 hover:bg-purple-400 shadow-purple-500/30",
    cyan: "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/30",
    pink: "bg-pink-500 hover:bg-pink-400 shadow-pink-500/30",
    green: "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",
    orange: "bg-orange-500 hover:bg-orange-400 shadow-orange-500/30",
  };
  
  return (
    <button onClick={() => router.push(href)} className={`absolute bottom-2 right-2 w-9 h-9 rounded-xl ${colors[neonColor]} flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100 transition-all duration-200 hover:scale-105`}>
      <Sparkles className="w-4.5 h-4.5 text-white" fill="white" />
    </button>
  );
}

function VideoCardContent({ card, playingId, setPlayingId }: { card: ModelCard; playingId: string | null; setPlayingId: (id: string | null) => void }) {
  const isVideo = card.thumbnail.includes("youtube");
  if (!isVideo) return null;

  if (playingId === card.id) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${card.thumbnail.match(/vi\/([^/]+)/)?.[1]}?autoplay=1&rel=0&modestbranding=1`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media" allowFullScreen
      />
    );
  }

  return (
    <>
      <img src={card.thumbnail} alt={card.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-black/30 group-hover/card:bg-black/10 transition-colors" />
      <button onClick={() => setPlayingId(card.id)} className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover/card:scale-110 group-hover/card:bg-white/30 transition-all">
          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
        </div>
      </button>
    </>
  );
}

function ImageCardContent({ card }: { card: ModelCard }) {
  const isVideo = card.thumbnail.includes("youtube");
  if (isVideo) return null;

  const Icon = card.icon ? ICON_MAP[card.icon] : null;

  return (
    <>
      <img src={card.thumbnail} alt={card.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      {card.logo && (
        <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <img src={card.logo} alt="" className="w-5 h-5 object-contain" />
        </div>
      )}
      {!card.logo && Icon && (
        <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
          <Icon className="w-4 h-4 text-white/80" />
        </div>
      )}
    </>
  );
}

function ModelCardComponent({ card, playingId, setPlayingId, rowGradient }: { card: ModelCard; playingId: string | null; setPlayingId: (id: string | null) => void; rowGradient: string }) {
  const isVideo = card.thumbnail.includes("youtube");

  return (
    <Link key={card.id} href={card.href} className="flex-none w-[240px] md:w-[280px] lg:w-[320px] snap-start group/card">
      <div className="relative rounded-xl overflow-hidden bg-[#161618] border border-white/5 hover:border-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/5">
        {/* Thumbnail area */}
        <div className={`relative ${isVideo ? "aspect-video" : "aspect-[16/10]"} bg-black`}>
          {/* Neon gradient overlay for non-video rows */}
          {!isVideo && (
            <div className={`absolute inset-0 ${rowGradient} opacity-20 group-hover/card:opacity-30 transition-opacity`} />
          )}
          
          <VideoCardContent card={card} playingId={playingId} setPlayingId={setPlayingId} />
          <ImageCardContent card={card} />
          <CardBadge card={card} />
          <GenerateButton href={card.href} neonColor="purple" />
        </div>

        {/* Info */}
        <div className="p-2.5 md:p-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            {card.logo && !isVideo && (
              <img src={card.logo} alt="" className="w-4 h-4 rounded hidden" />
            )}
            <h3 className="font-semibold text-white text-xs md:text-sm truncate">{card.name}</h3>
            {card.company && <span className="text-[10px] text-white/30 ml-auto flex-shrink-0">{card.company}</span>}
          </div>
          <p className="text-[11px] md:text-xs text-white/40 line-clamp-1">{card.description}</p>
        </div>
      </div>
    </Link>
  );
}

/* ─── Recently Used Carousel ─── */

function RecentCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => { setRecentIds(getRecentTools()); }, []);

  const recentTools = recentIds.map(id => ALL_RECENT_TOOLS.find(t => t.id === id)).filter(Boolean) as typeof ALL_RECENT_TOOLS;
  if (recentTools.length === 0) return null;

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="mb-6 md:mb-9">
      <div className="flex items-center gap-2.5 mb-3 px-4 md:px-8">
        <Clock className="w-4.5 h-4.5 text-emerald-400" />
        <h2 className="text-sm md:text-base font-bold text-white">Recently Used</h2>
        <span className="text-[10px] text-white/25 ml-auto">{recentTools.length} tools</span>
      </div>

      <div className="relative group">
        {canScrollLeft && (
          <button onClick={() => scroll("left")} className="hidden md:flex absolute left-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-r from-[#0a0a0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        <div ref={scrollRef} onScroll={checkScroll}
          className="flex gap-2.5 md:gap-3 overflow-x-auto px-4 md:px-8 pb-3 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {recentTools.map(t => <RecentToolCard key={t.id} tool={t} />)}
        </div>

        {canScrollRight && (
          <button onClick={() => scroll("right")} className="hidden md:flex absolute right-0 top-0 bottom-0 z-10 w-10 items-center justify-center bg-gradient-to-l from-[#0a0a0a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */

export function ModelShowcase() {
  return (
    <section className="py-2">
      <RecentCarousel />
      
      {/* Image Generators */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            Image Generators
          </h2>
          <Link href="/images" className="text-cyan-400 hover:text-cyan-300 text-xs md:text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ModelCarousel models={IMAGE_GENERATORS} />
      </section>

      {/* Video Generators */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            Video Generators
          </h2>
          <Link href="/video" className="text-purple-400 hover:text-purple-300 text-xs md:text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ModelCarousel models={VIDEO_GENERATORS} />
      </section>

      {/* Image Tools */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Brush className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            Image Tools
          </h2>
        </div>
        <ModelCarousel models={IMAGE_TOOLS} />
      </section>

      {/* Video Tools */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Scissors className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
            Video Tools
          </h2>
        </div>
        <ModelCarousel models={VIDEO_TOOLS} />
      </section>

      {/* Audio Tools */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 md:w-6 md:h-6 text-pink-400" />
            Audio Tools
          </h2>
          <Link href="/audio" className="text-pink-400 hover:text-pink-300 text-xs md:text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ModelCarousel models={AUDIO_TOOLS} />
      </section>

      {/* Free Tools */}
      <section className="py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-3 px-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
            Free Tools
          </h2>
          <Link href="/free-tools" className="text-green-400 hover:text-green-300 text-xs md:text-sm font-medium flex items-center gap-1 transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <ModelCarousel models={FREE_TOOLS} />
      </section>
    </section>
  );
}