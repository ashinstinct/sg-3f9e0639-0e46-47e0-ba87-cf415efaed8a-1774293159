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
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <Link href="/images" className="text-sm font-medium hover:text-primary transition-colors">
                Images
              </Link>
              <Link href="/video" className="text-sm font-medium hover:text-primary transition-colors">
                Video
              </Link>
              <Link href="/audio" className="text-sm font-medium hover:text-primary transition-colors">
                Audio
              </Link>
              <Link href="/free-tools" className="text-sm font-medium hover:text-primary transition-colors">
                Free Tools
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4 ml-2 md:ml-4 pl-2 md:pl-4 border-l">
              <ThemeSwitch />
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}