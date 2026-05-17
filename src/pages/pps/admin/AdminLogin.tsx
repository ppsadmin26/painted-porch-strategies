import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Check if user is active
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", authData.user.id)
        .single();

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Your account has been deactivated. Please contact an administrator.");
      }

      navigate("/admin");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({
        title: "Check your email",
        description: "If an account exists with that email, you'll receive a password reset link.",
      });
      setForgotMode(false);
      setForgotEmail("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-2 text-center">
          Painted Porch Admin
        </h1>
        <p className="text-muted-foreground text-center mb-6">
          {forgotMode ? "Enter your email to receive a reset link" : "Sign in to manage your content"}
        </p>

        {forgotMode ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={forgotLoading}>
              {forgotLoading ? "Sending..." : "Send Reset Link"}
            </Button>
            <button
              type="button"
              onClick={() => setForgotMode(false)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </Button>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Forgot your password?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
