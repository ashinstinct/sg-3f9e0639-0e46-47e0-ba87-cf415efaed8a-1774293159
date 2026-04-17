import { Navigation } from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Zap, MessageSquare, Phone, Globe, Lock, Headphones } from "lucide-react";
import Link from "next/link";

export default function AgentsPage() {
  const agents = [
    {
      title: "Customer Support Agent",
      description: "24/7 AI-powered customer support for your website",
      icon: Headphones,
      color: "bg-blue-500",
      features: ["Instant responses", "Multi-language support", "CRM integration"],
      pricing: "Premium"
    },
    {
      title: "Sales Assistant",
      description: "Convert visitors into customers with intelligent conversations",
      icon: MessageSquare,
      color: "bg-purple-500",
      features: ["Lead qualification", "Product recommendations", "Calendar booking"],
      pricing: "Premium"
    },
    {
      title: "Voice Agent",
      description: "Natural voice conversations for phone support",
      icon: Phone,
      color: "bg-green-500",
      features: ["Human-like voice", "Call routing", "Voicemail transcription"],
      pricing: "Premium"
    },
    {
      title: "Website Assistant",
      description: "Help visitors navigate your site and find information",
      icon: Globe,
      color: "bg-orange-500",
      features: ["Page navigation", "Search assistance", "FAQ automation"],
      pricing: "Premium"
    },
  ];

  return (
    <>
      <SEO 
        title="AI Agents - Back2Life.Studio"
        description="Deploy AI-powered agents for customer support, sales, and website assistance"
      />
      <div className="min-h-screen bg-slate-950">
        <Navigation />
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2">
                <Bot className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">AI Agents</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-purple-400">
                Deploy AI Agents
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Automate customer support, sales, and website assistance with intelligent AI agents
              </p>
            </div>

            {/* Coming Soon Banner */}
            <Card className="bg-slate-800/50 border-purple-500/20">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center gap-2 text-purple-400">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">Coming Soon</h2>
                </div>
                <p className="text-slate-300 text-lg">
                  AI Agents are currently in development. Sign up for premium access to get early access when they launch!
                </p>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
                    Get Early Access
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <Card key={agent.title} className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${agent.color}`}>
                        <agent.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                        {agent.pricing}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">{agent.title}</h3>
                      <p className="text-slate-400">{agent.description}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-300">Key Features:</h4>
                      <ul className="space-y-1">
                        {agent.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-slate-400">
                            <Zap className="w-3 h-3 text-purple-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Security & Privacy */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-green-400" />
                  <h2 className="text-2xl font-bold text-white">Security & Privacy</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">End-to-End Encryption</h3>
                    <p className="text-sm text-slate-400">All conversations are encrypted and secure</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">GDPR Compliant</h3>
                    <p className="text-sm text-slate-400">Full compliance with data protection regulations</p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-white">Private Data</h3>
                    <p className="text-sm text-slate-400">Your data never leaves your control</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}