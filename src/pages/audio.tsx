import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Mic, Waves } from "lucide-react";
import Link from "next/link";

export default function AudioPage() {
  const proAudioTools = [
    {
      title: "Fish Audio TTS Pro",
      description: "Professional text-to-speech with natural voice synthesis and emotion control",
      icon: Mic,
      href: "/clone?model=fish-audio",
      credits: 3,
      color: "from-indigo-500 to-purple-500",
      comingSoon: true,
    },
    {
      title: "Pro Voice Cloning",
      description: "Clone any voice with exceptional accuracy using advanced AI models",
      icon: Waves,
      href: "/clone",
      credits: 5,
      color: "from-cyan-500 to-blue-500",
      comingSoon: true,
    },
    {
      title: "lalal.ai Stem Separator",
      description: "Industry-leading stem separation with pristine audio quality",
      icon: Music,
      href: "/stems?mode=pro",
      credits: 8,
      color: "from-pink-500 to-rose-500",
      comingSoon: true,
    },
    {
      title: "Adobe Podcast Enhancer",
      description: "Studio-grade audio enhancement and noise removal",
      icon: Sparkles,
      href: "/enhance?mode=pro",
      credits: 4,
      color: "from-orange-500 to-red-500",
      comingSoon: true,
    },
  ];

  return (
    <>
      <SEO
        title="Pro Audio Tools | Back2Life.Studio"
        description="Professional AI-powered audio tools. Voice cloning with Fish Audio, stem separation with lalal.ai, and more."
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional Audio Tools
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Advanced AI audio processing with Fish Audio TTS, lalal.ai stem separation, Adobe Podcast enhancement, and more.
              </p>
            </div>

            {/* Pro Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {proAudioTools.map((tool) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${tool.color}`}>
                          <tool.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                            Pro
                          </Badge>
                          {tool.comingSoon && (
                            <Badge variant="outline">Coming Soon</Badge>
                          )}
                        </div>
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>{tool.credits} credits per use</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Free Alternatives */}
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="font-heading font-bold text-2xl mb-2">
                Looking for free audio tools?
              </h3>
              <p className="text-muted-foreground mb-4">
                Try our free audio converter, editor, enhancer, and more - no credits required
              </p>
              <Link href="/free-tools#audio" className="inline-flex items-center gap-2 text-primary font-medium hover:underline">
                Browse Free Audio Tools →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}