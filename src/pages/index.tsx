import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Image as ImageIcon, Video, Music, Scissors, Wand2, Play } from "lucide-react";

export default function Home() {
  const featuredTools = [
    {
      name: "Nano Banana 2",
      description: "Best 4K image model ever",
      category: "Image Generation",
      link: "/images/generate",
      image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=800&q=80", // Placeholder - replace with actual AI output
      gradient: "from-yellow-500 to-orange-500",
      badge: "TOP RATED",
    },
    {
      name: "Grok Image",
      description: "Creative AI interpretations",
      category: "Image Generation",
      link: "/images/generate",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", // Placeholder
      gradient: "from-purple-500 to-pink-500",
      badge: "CREATIVE",
    },
    {
      name: "Kling 3.0",
      description: "Cinema-grade video generation",
      category: "Video Generation",
      link: "/video/generate",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80", // Placeholder
      gradient: "from-blue-500 to-cyan-500",
      badge: "BEST VIDEO",
    },
    {
      name: "Seedance 1.5 Pro",
      description: "Cinematic multi-shot videos",
      category: "Video Generation",
      link: "/video/generate",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", // Placeholder
      gradient: "from-indigo-500 to-purple-500",
      badge: "CINEMATIC",
    },
  ];

  const freeTools = [
    { name: "Frame Extractor", icon: Scissors, link: "/extract", desc: "Extract video frames" },
    { name: "Audio Converter", icon: Music, link: "/convert", desc: "Convert audio formats" },
    { name: "Video Downloader", icon: Video, link: "/download", desc: "Download from YouTube" },
    { name: "AI Transcriber", icon: Wand2, link: "/transcriber", desc: "Audio to text" },
  ];

  return (
    <>
      <SEO
        title="Back2Life.Studio - Professional AI Creation Tools"
        description="Create stunning images and videos with state-of-the-art AI models. Featuring Nano Banana 2, Grok, Kling 3.0, and Seedance."
      />
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        <Navigation />
        
        <main className="container mx-auto px-4 py-4 max-w-7xl">
          <Hero />
          <ToolsGrid />
        </main>
      </div>
    </>
  );
}