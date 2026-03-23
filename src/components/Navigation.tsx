import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-indigo via-brand-purple to-brand-cyan" />
            <span className="font-heading font-bold text-xl">Back2Life.Studio</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/#tools" className="hidden sm:block">
              <Button variant="ghost">Tools</Button>
            </Link>
            <Button variant="ghost" className="hidden sm:block">Pricing</Button>
            <div className="flex items-center">
              <ThemeSwitch />
            </div>
            <Button className="hidden sm:inline-flex bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}