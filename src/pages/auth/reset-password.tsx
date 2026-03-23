import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authService } from "@/services/authService";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if we have the recovery token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type !== "recovery" || !accessToken) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: updateError } = await authService.updatePassword(password);
      
      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      }
    } catch (err) {
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <SEO
          title="Password Reset Successful - Back2Life.Studio"
          description="Your password has been reset successfully"
        />
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-950/20 p-3">
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Password Reset Successful!</h2>
                <p className="text-muted-foreground">
                  Your password has been updated. Redirecting to login...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Reset Password - Back2Life.Studio"
        description="Set your new password for Back2Life.Studio"
      />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-cyan-950/20">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Set New Password
            </CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 hover:from-indigo-700 hover:via-purple-700 hover:to-cyan-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
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