import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus("Verifying authentication...");

        // Get the code from URL parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const code = hashParams.get("code") || new URLSearchParams(window.location.search).get("code");

        if (!code) {
          // Check for error parameters
          const errorParam = hashParams.get("error") || new URLSearchParams(window.location.search).get("error");
          const errorDescription = hashParams.get("error_description") || new URLSearchParams(window.location.search).get("error_description");

          if (errorParam) {
            throw new Error(errorDescription || errorParam || "Authentication failed");
          }

          throw new Error("No authentication code received");
        }

        setStatus("Establishing session...");

        // Exchange code for session using Supabase's built-in method
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Session exchange error:", exchangeError);
          throw new Error(exchangeError.message);
        }

        if (!data.session) {
          throw new Error("No session created");
        }

        setStatus("Redirecting to dashboard...");
        console.log("Authentication successful, redirecting...");

        // Small delay to ensure session is fully stored
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);

      } catch (err: any) {
        console.error("Authentication error:", err);
        setError(err.message || "Authentication failed");
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
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
                  {status}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Please wait while we sign you in
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}