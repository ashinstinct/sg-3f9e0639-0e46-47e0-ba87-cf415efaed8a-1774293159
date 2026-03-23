import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const errorParam = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        // Check for OAuth errors
        if (errorParam) {
          console.error("OAuth error:", errorParam, errorDescription);
          setError(errorDescription || "Authentication failed");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Handle the OAuth response
        if (accessToken && refreshToken) {
          // Set the session using the tokens
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Session error:", sessionError);
            setError("Failed to establish session");
            setTimeout(() => router.push("/auth/login"), 3000);
            return;
          }

          if (session) {
            // Successfully authenticated - redirect to dashboard
            router.push("/dashboard");
            return;
          }
        }

        // If we get here without tokens, check if there's an existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          // Already authenticated - redirect to dashboard
          router.push("/dashboard");
          return;
        }

        // No valid session found - redirect to login
        setError("No authentication data received");
        setTimeout(() => router.push("/auth/login"), 3000);

      } catch (err: any) {
        console.error("Callback error:", err);
        setError(err.message || "An unexpected error occurred");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <>
      <SEO
        title="Authenticating - Back2Life.Studio"
        description="Completing authentication..."
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 p-4">
        <div className="text-center space-y-4">
          {error ? (
            <>
              <div className="text-red-600 dark:text-red-400 text-lg font-medium">
                {error}
              </div>
              <p className="text-muted-foreground text-sm">
                Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
              <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Completing authentication...
              </h2>
              <p className="text-muted-foreground text-sm">
                Please wait while we sign you in
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}