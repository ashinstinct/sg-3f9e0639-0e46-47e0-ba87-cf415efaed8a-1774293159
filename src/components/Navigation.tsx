import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Music,
  Grid3x3,
  Wand2,
  Mic,
  Users,
  MapPin,
  Box,
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  Home,
  ChevronDown,
  Coins,
  UserCircle,
  Briefcase,
  Settings,
  Gift,
  Wrench,
  LayoutDashboard,
  FolderOpen,
  Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCreditBalance, subscribeToCreditsUpdates } from "@/services/creditsService";
import { supabase } from "@/integrations/supabase/client";

export function Navigation() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [credits, setCredits] = useState<number>(1000); // Default credits for dev
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Temporarily disabled authentication for development
  useEffect(() => {
    // No auth checks - just use default credits
  }, []);

  const toolsItems = [
    { name: "Generate", href: "/images/generate", icon: Wand2 },
    { name: "Avatar", href: "/avatar", icon: UserCircle },
    { name: "Audio", href: "/audio", icon: Mic },
    { name: "Music", href: "/music", icon: Music },
    { name: "Apps", href: "/tools", icon: Grid3x3 },
    { name: "Agents", href: "/agents", icon: Bot },
    { name: "Free Tools", href: "/free-tools", icon: Sparkles },
  ];

  const elementsItems = [
    { name: "Characters", href: "/elements/characters", icon: Users },
    { name: "Scenes", href: "/elements/scenes", icon: MapPin },
    { name: "Objects", href: "/elements/objects", icon: Box },
  ];

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Free Tools", href: "/free-tools", icon: Wrench },
    { name: "Images", href: "/images", icon: ImageIcon },
    { name: "Video", href: "/video", icon: Video },
    { name: "Avatar", href: "/avatar", icon: UserCircle },
    { name: "Library", href: "/library", icon: FolderOpen },
    { name: "Gallery", href: "/gallery", icon: Grid3x3 },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background backdrop-blur-xl border-b border-border/50 shadow-lg"
            : "bg-background border-b border-border/50"
        )}
      >
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
              >
                Back2Life.Studio
              </Link>
            </div>

            {/* Right: Credits + User Menu */}
            <div className="flex items-center gap-3">
              {/* Credits Display - Clickable */}
              <button
                onClick={() => setSubscriptionModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full hover:bg-muted transition-colors"
              >
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">
                  {credits.toLocaleString()}
                </span>
              </button>

              {/* User Menu */}
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full w-9 h-9 bg-muted/50 hover:bg-muted"
                  >
                    <UserCircle className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <UserCircle className="w-4 h-4 mr-2" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Teams
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionModalOpen(true)}>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscription
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar Menu */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-72 bg-background border-r border-border transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">Back2Life.Studio</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
            {/* TOOLS Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Tools
              </h3>
              <div className="space-y-1">
                {toolsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* ELEMENTS Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Elements
              </h3>
              <div className="space-y-1">
                {elementsItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted text-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* PROFILE Section */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                Profile
              </h3>
              <div className="space-y-1">
                <Link
                  href="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    router.pathname === "/dashboard"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <UserCircle className="w-5 h-5" />
                  <span>My Account</span>
                </Link>
                <Link
                  href="/library"
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                    router.pathname === "/library"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Briefcase className="w-5 h-5" />
                  <span>Library</span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link
                    href="/images"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      router.pathname.startsWith("/images")
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Images</span>
                  </Link>
                  <Link
                    href="/video"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      router.pathname.startsWith("/video")
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video</span>
                  </Link>
                  <Link
                    href="/avatar"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      router.pathname === "/avatar"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Avatar</span>
                  </Link>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-muted text-foreground"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Theme Switch */}
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Theme</span>
              <ThemeSwitch />
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}