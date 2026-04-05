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
      
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-8">
            <h1 className="font-heading font-bold text-4xl md:text-6xl leading-tight">
              <span className="text-foreground">Bring your imagination</span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Back2Life
              </span>
            </h1>

            {/* Create Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Create Image */}
              <Link href="/images/generate">
                <Card className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-[280px]">
                  <CardContent className="p-0 relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop"
                      alt="AI Generated Image"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-2xl font-bold text-white mb-1">Create Image</h3>
                      <p className="text-white/80 text-sm">Generate AI images</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Create Video */}
              <Link href="/video/generate">
                <Card className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer h-[280px]">
                  <CardContent className="p-0 relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20" />
                    <img
                      src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600&h=400&fit=crop"
                      alt="AI Video Generation"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-2xl font-bold text-white mb-1">Create Video</h3>
                      <p className="text-white/80 text-sm">Generate AI videos</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Explore All Tools Button */}
            <Link href="/tools">
              <button className="mt-10 px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:from-indigo-600 hover:via-purple-600 hover:to-cyan-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 mx-auto transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 border-2 border-white/20 dark:border-white/10 ring-4 ring-background">
                Explore all tools
                <Sparkles className="w-5 h-5" />
              </button>
            </Link>
          </div>

          {/* Featured Tools Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">TOP CHOICE</h2>
                <p className="text-muted-foreground text-sm">Creator-recommended tools tailored for you</p>
              </div>
              <Link href="/images" className="text-sm font-medium hover:underline flex items-center gap-1">
                See all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Nano Banana 2 */}
              <Link href="/images/generate">
                <Card className="group overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                  <CardContent className="p-0 relative h-[280px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20" />
                    <img
                      src="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=400&fit=crop"
                      alt="Nano Banana 2"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/90 text-black border border-amber-400">
                        4-5 credits
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="text-2xl font-bold text-white mb-2">Nano Banana 2</h3>
                      <p className="text-white/80 text-sm mb-3">Ultra HD image generation in 10 seconds</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-md text-xs bg-white/20 text-white backdrop-blur-sm">Ultra HD</span>
                        <span className="px-2 py-1 rounded-md text-xs bg-white/20 text-white backdrop-blur-sm">10s Gen</span>
                        <span className="px-2 py-1 rounded-md text-xs bg-white/20 text-white backdrop-blur-sm">Premium</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {featuredTools.slice(1).map((tool) => (
                <Link key={tool.name} href={tool.link}>
                  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-muted/30">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={tool.image}
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${tool.gradient} text-white shadow-lg`}>
                          {tool.badge}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-1">{tool.name}</h3>
                        <p className="text-white/80 text-sm">{tool.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Free Tools Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">FREE TOOLS</h2>
                <p className="text-muted-foreground text-sm">Professional tools at no cost</p>
              </div>
              <Link href="/free-tools" className="text-sm font-medium hover:underline flex items-center gap-1">
                See all 14
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {freeTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.name} href={tool.link}>
                    <Card className="group hover:border-primary/50 transition-all hover:shadow-lg bg-muted/30 h-full">
                      <div className="p-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                          <Icon className="w-7 h-7 text-indigo-400" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{tool.name}</h3>
                        <p className="text-xs text-muted-foreground">{tool.desc}</p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join thousands of creators using Back2Life.Studio
            </p>
            <Link href="/tools">
              <Button size="lg" className="text-lg h-14 px-8 border-2 border-primary/20">
                Explore All Tools
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}