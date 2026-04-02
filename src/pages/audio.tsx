import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Music, Sparkles, Mic, Waves, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

            {/* lalal.ai Pro Stem Separator - Enhanced with 10-stem feature */}
            <div className="group relative bg-gradient-to-br from-background to-muted/30 rounded-2xl p-6 border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <Music className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Pro
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                      Coming Soon
                    </span>
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xl mb-2">
                  Pro Stem Separator by lalal.ai
                </h3>
                
                <p className="text-sm text-muted-foreground mb-2">
                  World's #1 AI-powered stem extraction technology
                </p>

                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Professional-grade stem separation powered by lalal.ai's <strong>No.01 Sound artificial intelligence algorithm</strong> — the most advanced audio separation technology trusted by industry professionals worldwide. Extract crystal-clear stems from any audio or video with zero quality loss.
                </p>

                <div className="mb-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <h4 className="font-semibold text-sm mb-2 text-primary">Special Feature: 10-Stem Separation</h4>
                  <p className="text-xs text-muted-foreground mb-3">Split any song into up to 10 individual stems with surgical precision:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Vocals (main & backing)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Drums (kick, snare, cymbals)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Bass</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Piano</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Electric Guitar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Acoustic Guitar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Synthesizer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Strings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Wind Instruments</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>Full Accompaniment</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-2">
                  <h4 className="font-semibold text-sm">What Makes lalal.ai Different:</h4>
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="text-primary">✨</span>
                      <span>Lossless quality extraction — studio-grade results</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">⚡</span>
                      <span>Fast processing: 2-3 minutes for average track</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">🎯</span>
                      <span>Precision AI that preserves original audio fidelity</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">🎵</span>
                      <span>Supports all audio/video formats</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-primary">🏆</span>
                      <span>Trusted by Grammy-winning producers and top studios</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Perfect For:</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Music Production", "Remixing", "Karaoke Creation", "Audio Restoration", "Sampling", "Music Analysis"].map((use) => (
                      <span key={use} className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                        {use}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="font-semibold text-sm">8 credits per track</span>
                  </div>
                  <Button disabled variant="outline" size="sm">
                    Coming Soon
                  </Button>
                </div>
              </div>
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