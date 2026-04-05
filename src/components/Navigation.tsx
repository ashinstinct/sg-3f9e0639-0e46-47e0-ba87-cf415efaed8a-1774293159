import { useState } from "react";
import Link from "next/link";
import { Menu, X, Image, Video, Music, Wand2, Scissors, Home } from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuSections = [
    {
      title: "Create",
      items: [
        { name: "Images", icon: Image, href: "/images" },
        { name: "Video", icon: Video, href: "/video" },
        { name: "Audio", icon: Music, href: "/audio" },
      ],
    },
    {
      title: "Edit",
      items: [
        { name: "Image Editor", icon: Wand2, href: "/edit?type=image" },
        { name: "Video Edit", icon: Scissors, href: "/edit?type=video" },
      ],
    },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
              
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-heading font-bold text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                  Back2Life.Studio
                </span>
              </Link>
            </div>

            {/* Right: Theme Toggle + Home Icon */}
            <div className="flex items-center gap-2">
              <ThemeSwitch />
              <Link href="/" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Home className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dropdown Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bg-background border-b border-border shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="container mx-auto px-4 py-6 space-y-6">
              {menuSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center group-hover:from-indigo-500/20 group-hover:to-purple-500/20 transition-colors">
                            <Icon className="w-5 h-5 text-indigo-500" />
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}