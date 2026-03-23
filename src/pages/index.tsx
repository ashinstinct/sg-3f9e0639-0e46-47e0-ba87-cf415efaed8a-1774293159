import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { ToolsGrid } from "@/components/ToolsGrid";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="Back2Life.Studio - AI Image & Video Generation SaaS"
        description="Professional AI tools for image generation, video creation, audio editing, and more. 14 free tools + premium AI models."
        image="/og-image.png"
      />
      <div className="min-h-screen">
        <Navigation />
        <Hero />
        <ToolsGrid />
      </div>
    </>
  );
}