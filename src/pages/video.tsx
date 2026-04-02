import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Sparkles, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const VIDEO_MODELS = [
  {
    id: "kling-3",
    name: "Kling 3.0",
    description: "Latest cinematic quality video generation with advanced camera movements and scene understanding.",
    credits: 20,
    maxDuration: 10,
    route: "/tools/kling-3",
    gradient: "from-purple-500 via-pink-500 to-red-500",
  },
  {
    id: "kling-26",
    name: "Kling 2.6",
    description: "Standard balanced quality with reliable performance for most video generation needs.",
    credits: 16,
    maxDuration: 10,
    route: "/tools/kling-26",
    gradient: "from-blue-500 via-purple-500 to-pink-500",
  },
  {
    id: "kling-25",
    name: "Kling 2.5 Pro",
    description: "Enhanced details and professional-grade output for high-quality productions.",
    credits: 18,
    maxDuration: 8,
    route: "/tools/kling-25",
    gradient: "from-cyan-500 via-blue-500 to-purple-500",
  },
  {
    id: "kling-01",
    name: "Kling 01",
    description: "Experimental variant with unique artistic interpretations and creative outputs.",
    credits: 15,
    maxDuration: 6,
    route: "/tools/kling-01",
    gradient: "from-green-500 via-emerald-500 to-cyan-500",
  },
  {
    id: "luma",
    name: "Luma Dream Machine",
    description: "Fast generation with exceptional quality. Perfect for quick iterations and rapid prototyping.",
    credits: 15,
    maxDuration: 5,
    route: "/tools/luma",
    gradient: "from-orange-500 via-pink-500 to-purple-500",
  },
  {
    id: "runway",
    name: "Runway Gen-3 Turbo",
    description: "Professional-grade video generation trusted by filmmakers and content creators worldwide.",
    credits: 18,
    maxDuration: 10,
    route: "/tools/runway",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
  },
  {
    id: "minimax",
    name: "MiniMax Video",
    description: "Cost-effective solution with good quality output. Ideal for high-volume projects.",
    credits: 12,
    maxDuration: 6,
    route: "/tools/minimax",
    gradient: "from-teal-500 via-green-500 to-emerald-500",
  },
  {
    id: "hunyuan",
    name: "Hunyuan Video",
    description: "Tencent's advanced AI model with superior scene composition and motion dynamics.",
    credits: 16,
    maxDuration: 8,
    route: "/tools/hunyuan",
    gradient: "from-red-500 via-orange-500 to-yellow-500",
  },
  {
    id: "sora",
    name: "Sora 2.0",
    description: "OpenAI's groundbreaking model for ultra-realistic, long-form video generation.",
    credits: 25,
    maxDuration: 20,
    route: "/tools/sora",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    comingSoon: true,
  },
  {
    id: "veo",
    name: "Veo 3.1",
    description: "Google DeepMind's advanced video synthesis with unmatched photorealism.",
    credits: 22,
    maxDuration: 15,
    route: "/tools/veo",
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    comingSoon: true,
  },
  {
    id: "veo-fast",
    name: "Veo 3.1 Fast",
    description: "Faster variant of Veo 3.1 optimized for quick turnaround without quality loss.",
    credits: 18,
    maxDuration: 10,
    route: "/tools/veo-fast",
    gradient: "from-green-500 via-teal-500 to-cyan-500",
    comingSoon: true,
  },
  {
    id: "seedream",
    name: "Seedream 2.0",
    description: "State-of-the-art video synthesis with exceptional temporal consistency.",
    credits: 20,
    maxDuration: 12,
    route: "/tools/seedream",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    comingSoon: true,
  },
];

export default function VideoHub() {
  return (
    <>
      <SEO
        title="AI Video Generation Tools - Back2Life.Studio"
        description="Professional AI video generation with 12 cutting-edge models"
      />
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-12">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-4">
              <Video className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Professional Video Tools</span>
            </div>
            
            <h1 className="font-heading font-bold text-5xl mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AI Video Generation
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Create cinematic videos with 12 state-of-the-art AI models
            </p>
          </div>

          {/* Models Grid */}
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {VIDEO_MODELS.map((model) => (
              <Card key={model.id} className="group relative overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all">
                <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center`}>
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        Pro
                      </Badge>
                      {model.comingSoon && (
                        <Badge variant="secondary">Soon</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-lg mb-2">
                    {model.name}
                  </h3>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {model.description}
                  </p>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 rounded-md text-xs bg-muted text-muted-foreground">
                      Max {model.maxDuration}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-semibold">{model.credits} credits</span>
                    </div>
                    <Link href={model.route}>
                      <Button 
                        disabled={model.comingSoon}
                        size="sm" 
                        className={`bg-gradient-to-r ${model.gradient} hover:opacity-90`}
                      >
                        {model.comingSoon ? "Soon" : (
                          <>
                            Try
                            <ArrowRight className="ml-1 w-3 h-3" />
                          </>
                        )}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Free Alternative */}
          <div className="max-w-7xl mx-auto mt-12">
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg mb-1">Looking for free video tools?</h3>
                    <p className="text-sm text-muted-foreground">Check out our free video editing and processing tools</p>
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