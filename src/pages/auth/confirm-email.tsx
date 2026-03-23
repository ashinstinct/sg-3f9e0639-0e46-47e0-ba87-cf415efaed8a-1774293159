import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import Link from "next/link";

export default function ConfirmEmail() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const confirmEmail = async () => {
      // Get the token from URL hash (Supabase uses hash-based routing)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      if (!accessToken || type !== "signup") {
        setStatus("error");
        setErrorMessage("Invalid verification link. Please try signing up again.");
        return;
      }

      try {
        // Supabase automatically verifies the email when the user clicks the link
        // We just need to check if the session is valid
        const user = await authService.getCurrentUser();
        
        if (user) {
          setStatus("success");
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage("Failed to verify email. Please try again.");
        }
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(error.message || "An error occurred during verification");
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <>
      <SEO
        title="Email Verification - Back2Life.Studio"
        description="Confirming your email address"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            {status === "loading" && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center mb-4">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  Verifying Your Email
                </CardTitle>
                <CardDescription>
                  Please wait while we confirm your email address...
                </CardDescription>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Email Verified!
                </CardTitle>
                <CardDescription>
                  Your email has been successfully verified
                </CardDescription>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Verification Failed
                </CardTitle>
                <CardDescription>
                  {errorMessage}
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {status === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium mb-2">✅ All set!</p>
                  <p>Redirecting you to your dashboard...</p>
                </div>
                <Link href="/dashboard">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:opacity-90">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-2">❌ Something went wrong</p>
                  <p>The verification link may have expired or is invalid.</p>
                </div>
                <div className="space-y-2">
                  <Link href="/auth/signup">
                    <Button className="w-full" variant="outline">
                      Sign Up Again
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button className="w-full" variant="ghost">
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}