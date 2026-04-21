import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Sparkles,
  Video,
  Image as ImageIcon,
  Music,
  Mic,
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

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-3 left-3 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-[#1a1a1c]/80 backdrop-blur-sm border border-white/5 hover:bg-[#252528] transition-colors"
      >
        <Menu className="w-5 h-5 text-white/70" />
      </button>

      <div
        className={cn(
          "fixed top-0 left-0 bottom-0 z-[60] w-72 bg-[#0e0e10] border-r border-white/5 transition-transform duration-300 ease-in-out flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/5 flex-shrink-0">
          <Link
            href="/"
            className="text-lg font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          >
            Back2Life.Studio
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-white/50" /> : <Moon className="w-4 h-4 text-white/50" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-3 mb-2">
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
                          ? "bg-white/10 text-white font-medium"
                          : "text-white/60 hover:bg-white/5 hover:text-white/80"
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

        <div className="flex-shrink-0 border-t border-white/5 p-3 space-y-2">
          <button
            onClick={() => {
              setSidebarOpen(false);
              setSubscriptionModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors w-auto"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-400">Go Pro</span>
          </button>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-white/60"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Settings</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors w-full text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate">Guest User</p>
                  <p className="text-[11px] text-white/40">{credits.toLocaleString()} credits</p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
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
              <DropdownMenuItem onClick={() => setSubscriptionModalOpen(true)}>
                <Coins className="w-4 h-4 mr-2" />
                Buy Credits
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />
    </>
  );
}