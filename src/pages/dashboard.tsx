import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authService } from "@/services/authService";
import type { AuthUser } from "@/services/authService";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogOut, Coins, Crown, Sparkles, TrendingUp } from "lucide-react";
import { ToolsGrid } from "@/components/ToolsGrid";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(100); // TODO: Fetch from credits service

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        router.push("/auth/login");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const isPro = false; // TODO: Check membership status

  return (
    <>
      <SEO
        title="Dashboard - Back2Life.Studio"
        description="Access your AI-powered creative tools"
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20">
        {/* Header */}
        <header className="border-b border-indigo-100/50 dark:border-indigo-900/30 bg-white/50 dark:bg-gray-950/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Back2Life.Studio
                </span>
              </Link>

              <div className="flex items-center gap-4">
                {/* Credits Display */}
                <Card className="border-indigo-200/50 dark:border-indigo-800/50">
                  <CardContent className="p-3 flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold">{credits} Credits</p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </CardContent>
                </Card>

                {/* User Menu */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-indigo-200 dark:border-indigo-800">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome back!
                </h1>
                <p className="text-muted-foreground mt-2">
                  {user?.email}
                </p>
              </div>

              {!isPro && (
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700"
                >
                  <Crown className="h-5 w-5" />
                  Upgrade to Pro
                </Button>
              )}
            </div>

            {/* Membership Status */}
            {isPro ? (
              <Card className="border-amber-200/50 dark:border-amber-800/50 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100">Pro Member</h3>
                      <p className="text-amber-700 dark:text-amber-300">Unlimited access to premium AI models</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-600 text-white">Active</Badge>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-indigo-200/50 dark:border-indigo-800/50">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Free Plan</h3>
                      <p className="text-muted-foreground">14 free tools available</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-indigo-200/50 dark:border-indigo-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {credits}
                  </span>
                  <Coins className="h-5 w-5 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200/50 dark:border-indigo-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tools Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                    0
                  </span>
                  <span className="text-sm text-muted-foreground">this month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-200/50 dark:border-indigo-800/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Account Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-semibold">Active</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tools Section */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Creative Tools</h2>
              <p className="text-muted-foreground">
                Access all 14 AI-powered tools for image, video, and audio creation
              </p>
            </div>

            <ToolsGrid showAuthenticatedView={true} />
          </div>

          {/* Upgrade CTA (for free users) */}
          {!isPro && (
            <Card className="border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
              <CardContent className="p-8 text-center space-y-4">
                <Crown className="h-16 w-16 text-amber-600 mx-auto" />
                <h3 className="text-2xl font-bold">Upgrade to Pro</h3>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Unlock premium AI models, unlimited credits, and priority processing for all your creative projects.
                </p>
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700"
                  >
                    <Crown className="h-5 w-5" />
                    View Pro Plans
                  </Button>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}