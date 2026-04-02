import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-heading font-bold text-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Back2Life.Studio
          </Link>
          
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/free-tools" className="text-xs md:text-sm font-medium hover:text-primary transition-colors">
              Free Tools
            </Link>
            <Link href="/free-tools#audio" className="text-xs md:text-sm font-medium hover:text-primary transition-colors">
              Audio
            </Link>
            <Link href="/free-tools#video" className="text-xs md:text-sm font-medium hover:text-primary transition-colors">
              Video
            </Link>
            <Link href="/free-tools#image" className="text-xs md:text-sm font-medium hover:text-primary transition-colors">
              Image
            </Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <ThemeSwitch />
            <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-xs md:text-sm px-2 md:px-4">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}