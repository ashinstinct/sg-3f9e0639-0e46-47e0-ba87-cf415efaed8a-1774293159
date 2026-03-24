import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get both hash and query parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        // Debug info
        const debugData = {
          hash: window.location.hash,
          search: window.location.search,
          hashParams: Object.fromEntries(hashParams.entries()),
          queryParams: Object.fromEntries(queryParams.entries())
        };
        setDebugInfo(JSON.stringify(debugData, null, 2));
        console.log("OAuth Callback Debug:", debugData);

        // Check for errors in both hash and query
        const errorParam = hashParams.get("error") || queryParams.get("error");
        const errorDescription = hashParams.get("error_description") || queryParams.get("error_description");

        if (errorParam) {
          console.error("OAuth error:", errorParam, errorDescription);
          setError(errorDescription || errorParam || "Authentication failed");
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Try to get tokens from hash first (standard OAuth flow)
        let accessToken = hashParams.get("access_token");
        let refreshToken = hashParams.get("refresh_token");

        // If not in hash, try query params (some OAuth providers use this)
        if (!accessToken) {
          accessToken = queryParams.get("access_token");
          refreshToken = queryParams.get("refresh_token");
        }

        // Handle Supabase's built-in OAuth exchange
        // This is the recommended approach for OAuth callbacks
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
          window.location.search
        );

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          
          // Fallback: Try manual token setting if we have tokens
          if (accessToken && refreshToken) {
            console.log("Attempting manual token setting...");
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              console.error("Manual session error:", sessionError);
              setError(`Session error: ${sessionError.message}`);
              setTimeout(() => router.push("/auth/login"), 3000);
              return;
            }

            if (sessionData.session) {
              console.log("Session established via manual tokens");
              router.push("/dashboard");
              return;
            }
          }

          setError(`Authentication error: ${exchangeError.message}`);
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        if (data.session) {
          console.log("Session established successfully");
          router.push("/dashboard");
          return;
        }

        // If we get here, check if there's already an existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log("Found existing session");
          router.push("/dashboard");
          return;
        }

        // No valid session found
        setError("No authentication data received. Please try again.");
        setTimeout(() => router.push("/auth/login"), 3000);

      } catch (err: any) {
        console.error("Callback error:", err);
        setError(err.message || "An unexpected error occurred");
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    };

    // Small delay to ensure URL is fully loaded
    const timer = setTimeout(() => {
      handleCallback();
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <SEO
        title="Authenticating - Back2Life.Studio"
        description="Completing authentication..."
      />
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-4">
            {error ? (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
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

          {/* Debug info - only show in development */}
          {process.env.NODE_ENV === "development" && debugInfo && (
            <details className="mt-4 p-4 bg-muted rounded-lg text-xs">
              <summary className="cursor-pointer font-medium mb-2">Debug Info</summary>
              <pre className="overflow-auto">{debugInfo}</pre>
            </details>
          )}
        </div>
      </div>
    </>
  );
}