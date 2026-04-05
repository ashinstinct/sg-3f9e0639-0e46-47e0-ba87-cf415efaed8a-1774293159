import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Sparkles, Image as ImageIcon, Video, Music, Scissors, Wand2, Play } from "lucide-react";
import { Hero } from "@/components/Hero";
import { FeaturedModels } from "@/components/FeaturedModels";

export default function Home() {
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
          <FeaturedModels />
        </main>
      </div>
    </>
  );
}