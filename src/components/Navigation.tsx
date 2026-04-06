import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Menu,
  X,
  Sparkles,
  Library,
  User,
  LogOut,
  Coins,
  Wand2,
  ImageIcon,
  Video,
  Music,
  Scissors,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCredits(session.user.id);
      } else {
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCredits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_credits")
        .select("balance")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setCredits(data?.balance || 0);
    } catch (err) {
      console.error("Error fetching credits:", err);
      setCredits(0);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toolsMenu = [
    {
      label: "Image",
      href: "/images",
      icon: ImageIcon,
      items: [
        { label: "Generate", href: "/images/generate", icon: Sparkles },
        { label: "Edit", href: "/edit", icon: Scissors },
      ],
    },
    {
      label: "Video",
      href: "/video",
      icon: Video,
      items: [
        { label: "Generate", href: "/video/generate", icon: Sparkles },
        { label: "Kling", href: "/video/kling", icon: Video },
      ],
    },
    {
      label: "Audio",
      href: "/audio",
      icon: Music,
      items: [
        { label: "Voice Clone", href: "/clone", icon: Mic },
        { label: "Record", href: "/record-voice", icon: Mic },
      ],
    },
    {
      label: "Free Tools",
      href: "/free-tools",
      icon: Wand2,
    },
  ];

  const isActive = (href: string) => router.pathname.startsWith(href);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background backdrop-blur-xl border-b border-border/50 shadow-lg"
          : "bg-background border-b border-border/50"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Button + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-foreground hidden sm:block">
                Back2Life<span className="text-indigo-400">.Studio</span>
              </span>
              <span className="font-bold text-lg text-foreground sm:hidden">
                B2L<span className="text-indigo-400">.Studio</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Tools Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {toolsMenu.map((tool) => (
              <div key={tool.label} className="relative group">
                <Link
                  href={tool.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive(tool.href)
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                  )}
                >
                  <tool.icon className="w-4 h-4" />
                  {tool.label}
                </Link>

                {tool.items && (
                  <div className="absolute top-full left-0 mt-1 w-48 py-2 bg-popover border border-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {tool.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <item.icon className="w-4 h-4 text-indigo-400" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - User Profile OR Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 rounded-full bg-muted/50 hover:bg-muted transition-colors border border-border/50">
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                      <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span className="text-xs font-semibold text-amber-300">
                        {credits}
                      </span>
                    </div>
                    <Avatar className="w-6 h-6 sm:w-7 sm:h-7 border border-border">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-[10px] sm:text-xs">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-64 bg-popover border-border">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-foreground">
                        {user.user_metadata?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="px-3 py-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-300">Credits</span>
                      </div>
                      <span className="text-lg font-bold text-amber-400">
                        {credits}
                      </span>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild className="cursor-pointer text-foreground focus:text-foreground">
                    <Link href="/library" className="flex items-center gap-2">
                      <Library className="w-4 h-4" />
                      My Library
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-foreground focus:text-foreground">
                    <Link href="/images/generate" className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4" />
                      Generate
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer text-foreground focus:text-foreground">
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {toolsMenu.map((tool) => (
              <div key={tool.label}>
                <Link
                  href={tool.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                    isActive(tool.href)
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "text-foreground/70 hover:bg-muted"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <tool.icon className="w-5 h-5 shrink-0" />
                  {tool.label}
                </Link>
                
                {tool.items && (
                  <div className="ml-4 mt-1 space-y-1">
                    {tool.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-foreground/70 hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-4 h-4 text-indigo-400 shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {user && (
              <>
                <div className="border-t border-border my-2" />
                <Link
                  href="/library"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Library className="w-5 h-5" />
                  My Library
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}