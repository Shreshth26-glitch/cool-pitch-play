import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, Snowflake } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Please enter email/phone and password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back to FrostPitch!");
      
      // Redirect based on previous location or default home
      navigate({ to: "/" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to log in. Double check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background neon glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[50vh] w-[500px] blur-3xl opacity-20" style={{ background: "radial-gradient(circle, oklch(0.80 0.14 78), transparent 70%)" }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl glass-strong p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition mb-4">
            <ArrowLeft className="h-3 w-3" /> Back to Home
          </Link>
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/20 grid place-items-center mb-3 glow-emerald">
            <Snowflake className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Log in to FrostPitch</h1>
          <p className="text-sm text-muted-foreground mt-1">Book slots and manage your matches.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email or Phone Number</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="player@gmail.com or +91..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-border py-5"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white/5 border-border py-5"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-primary text-primary-foreground py-6 font-semibold shadow-[var(--shadow-glow)] hover:opacity-90">
            {isLoading ? "Authenticating..." : "Log In"}
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline font-semibold">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
