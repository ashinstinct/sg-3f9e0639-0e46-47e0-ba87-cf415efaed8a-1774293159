import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Mic, Wand2, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const AUDIO_TOOLS = [
  {
    id: "voice-clone",
    name: "Voice Cloner + Text-to-Speech",
    description: "Natural and realistic voice cloning with Fish Audio. Clone any voice or use pre-built voices. More natural than ElevenLabs.",
    icon: Mic,
    credits: 5,
    route: "/tools/voice-clone",
    features: ["Voice Cloning", "Male & Female Voices", "Natural TTS"],
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
  },
  {
    id: "stem-separator",
    name: "Pro Stem Separator by lalal.ai",
    description: "World's #1 AI-powered stem extraction. Split any song into 10 individual stems with No.01 Sound AI algorithm.",
    icon: Music,
    credits: 8,
    route: "/stem-separator",
    features: ["10-Stem Split", "Lossless Quality", "Fast Processing"],
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
  },
  {
    id: "audio-enhancer",
    name: "Pro Audio Enhancer",
    description: "Professional audio enhancement powered by Adobe Podcast AI. Remove noise, enhance clarity, and optimize levels.",
    icon: Sparkles,
    credits: 4,
    route: "/tools/audio-enhancer",
    features: ["AI Denoising", "Clarity Boost", "Studio Quality"],
    gradient: "from-orange-500 via-red-500 to-pink-500",
    comingSoon: true,
  },
  {
    id: "music-generator",
    name: "AI Music Generator",
    description: "Create original music tracks with AI. Generate melodies, beats, and full compositions in any genre.",
    icon: Wand2,
    credits: 6,
    route: "/tools/music-generator",
    features: ["Any Genre", "Custom Length", "Royalty-Free"],
    gradient: "from-purple-500 via-pink-500 to-red-500",
    comingSoon: true,
  },
];

export default function AudioHub() {
  return (
    <>
      <SEO
        title="AI Audio Tools - Back2Life.Studio"
        description="Professional AI audio tools for voice cloning, stem separation, and audio enhancement"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-4">
              <Music className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium">Professional Audio Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Audio Tools
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Clone voices, separate stems, and enhance audio with cutting-edge AI
            </p>
          </div>

          {/* Tools Grid */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {AUDIO_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card key={tool.id} className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                          Pro
                        </Badge>
                        {tool.comingSoon && (
                          <Badge variant="secondary">Coming Soon</Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="font-heading font-bold text-xl mb-2">
                      {tool.name}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4">
                      {tool.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {tool.features.map((feature) => (
                        <span key={feature} className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold">{tool.credits} credits</span>
                      </div>
                      <Link href={tool.route}>
                        <Button 
                          disabled={tool.comingSoon}
                          size="sm" 
                          className={`bg-gradient-to-r ${tool.gradient} hover:opacity-90`}
                        >
                          {tool.comingSoon ? "Coming Soon" : (
                            <>
                              Try Now
                              <ArrowRight className="ml-2 w-4 h-4" />
                            </>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Free Alternative */}
          <div className="max-w-6xl mx-auto mt-12">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for free audio tools?</h3>
                    <p className="text-sm text-muted-foreground">Check out our free audio editing, conversion, and recording tools</p>
                  </div>
                  <Link href="/free-tools">
                    <Button variant="outline">
                      View Free Tools
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}