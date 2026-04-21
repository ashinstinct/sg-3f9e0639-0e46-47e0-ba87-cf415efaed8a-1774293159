import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Music,
  Mic,
  Users,
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Coins,
  UserCircle,
  Settings,
  Wrench,
  LayoutDashboard,
  FolderOpen,
  Bot,
  MessageSquare,
  PenLine,
  Sun,
  Moon,
  Grid3x3,
  Wand2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/contexts/ThemeProvider";

export function Navigation() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [credits] = useState<number>(1000);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleRouteChange = () => setSidebarOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  const navSections = [
    {
      title: "Create",
      items: [
        { name: "Start new", href: "/images/generate", icon: PenLine },
        { name: "Images", href: "/images", icon: ImageIcon },
        { name: "Video", href: "/video", icon: Video },
        { name: "Chat", href: "/chat", icon: MessageSquare },
        { name: "Audio", href: "/audio", icon: Music },
        { name: "Avatar", href: "/avatar", icon: UserCircle },
      ],
    },
    {
      title: "Tools",
      items: [
        { name: "All Tools", href: "/tools", icon: Grid3x3 },
        { name: "Free Tools", href: "/free-tools", icon: Wrench },
        { name: "Music", href: "/music", icon: Music },
        { name: "Voice Clone", href: "/clone", icon: Mic },
        { name: "Agents", href: "/agents", icon: Bot },
      ],
    },
    {
      title: "Library",
      items: [
        { name: "My Library", href: "/library", icon: FolderOpen },
        { name: "Gallery", href: "/gallery", icon: Grid3x3 },
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = router.pathname;
    if (path.startsWith("/images")) return "Images";
    if (path.startsWith("/video")) return "Video";
    if (path === "/chat") return "Chat";
    if (path.startsWith("/audio") || path === "/audio-editor") return "Audio";
    if (path === "/avatar") return "Avatar";
    if (path === "/music") return "Music";
    if (path === "/clone") return "Voice Clone";
    if (path === "/tools") return "Tools";
    if (path === "/free-tools") return "Free Tools";
    if (path === "/library") return "Library";
    if (path === "/gallery") return "Gallery";
    if (path === "/dashboard") return "Dashboard";
    if (path === "/agents") return "Agents";
    if (path === "/generate") return "Generate";
    if (path === "/transcriber") return "Transcriber";
    if (path === "/extract") return "Frame Extractor";
    if (path === "/download") return "Downloader";
    if (path === "/split") return "Splitter";
    if (path === "/convert") return "Converter";
    if (path === "/edit") return "Editor";
    if (path === "/stems" || path === "/stem-separator") return "Stems";
    if (path === "/enhance") return "Enhancer";
    if (path === "/record-voice") return "Recorder";
    if (path === "/image-to-prompt") return "Image to Prompt";
    return "";
  };

  return (
    <>
      {/* Minimal Top Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border/50 h-14">
        <div className="flex items-center justify-between h-full px-4">
          {/* Left: Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <span className="text-sm font-medium text-muted-foreground">
              {getPageTitle()}
            </span>
          </div>

          {/* Right: Credits + New */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubscriptionModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full hover:bg-muted transition-colors"
            >
              <Coins className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold">{credits.toLocaleString()}</span>
            </button>
            <button
              onClick={() => router.push("/images/generate")}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
            >
              <PenLine className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-out Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] w-72 bg-background border-r border-border/50 transition-transform duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header - Branding */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-border/50 flex-shrink-0">
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Back2Life.Studio
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
                {section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    router.pathname === item.href ||
                    (item.href !== "/" && router.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 border-t border-border/50 p-3 space-y-2">
          {/* Go Pro Button */}
          <button
            onClick={() => {
              setSidebarOpen(false);
              setSubscriptionModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors w-auto"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Go Pro</span>
          </button>

          {/* Settings */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-sm text-foreground"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors w-full text-left">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Guest User</p>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56">
              <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                <UserCircle className="w-4 h-4 mr-2" />
                My Account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSubscriptionModalOpen(true)}>
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/auth/login")}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign in
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
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