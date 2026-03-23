import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resetError } = await authService.resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage("Password reset email sent! Check your inbox for instructions.");
        setEmail("");
      }
    } catch (err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password - Back2Life.Studio"
        description="Reset your password and regain access to your Back2Life.Studio account"
      />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Link 
              href="/auth/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Forgot Password
            </CardTitle>
            <CardDescription>
              Enter your email and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                  <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link 
                  href="/auth/login" 
                  className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                >
                  Log in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}