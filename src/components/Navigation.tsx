import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 rounded-lg" />
            <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Back2Life.Studio
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden sm:flex">
              Tools
            </Button>
            <Button variant="ghost" className="hidden sm:flex">
              Pricing
            </Button>
            <ThemeSwitch />
            {user ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-90">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-90">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}