import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { SEO } from "@/components/SEO";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-background">
        <Navigation />
        <Hero />
        
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-4xl mb-4">
              14 Free AI-Powered Tools
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Audio, video, and image processing tools. No signup required.
            </p>
            <Link href="/free-tools">
              <Button size="lg" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90">
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