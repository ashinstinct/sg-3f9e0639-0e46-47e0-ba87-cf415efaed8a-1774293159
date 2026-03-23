import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  const router = useRouter();
  const { toast } = useToast();
  const { email } = router.query;
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    // Check if user is already verified
    const checkVerification = async () => {
      const user = await authService.getCurrentUser();
      if (user && user.email_confirmed_at) {
        router.push("/dashboard");
      }
    };
    checkVerification();
  }, [router]);

  const handleResendEmail = async () => {
    if (!email || typeof email !== "string") {
      toast({
        title: "Error",
        description: "Email address not found",
        variant: "destructive",
      });
      return;
    }

    if (resendCount >= 3) {
      toast({
        title: "Too many requests",
        description: "Please wait a few minutes before trying again",
        variant: "destructive",
      });
      return;
    }

    setResending(true);
    try {
      const { error } = await authService.resendVerificationEmail(email);
      
      if (error) throw new Error(error.message);

      setResendCount(resendCount + 1);
      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Verify Your Email - Back2Life.Studio"
        description="Verify your email address to complete registration"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We've sent a verification link to
            </CardDescription>
            {email && (
              <p className="text-sm font-medium text-foreground">
                {email}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium">📧 Next steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Open the email we just sent you</li>
                <li>Click the verification link</li>
                <li>You'll be redirected to your dashboard</li>
              </ol>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email?</p>
              <Button
                variant="link"
                className="text-indigo-600 hover:text-indigo-700 p-0 h-auto"
                onClick={handleResendEmail}
                disabled={resending}
              >
                {resending ? "Sending..." : "Resend verification email"}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">
                  Back to Login
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>Check your spam folder if you don't see the email</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}