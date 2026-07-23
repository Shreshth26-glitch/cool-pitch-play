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
      toast.success("Welcome back to frostPitch!");
      
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
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-xl bg-[#161618] border border-[#27272a] p-8 relative z-10 shadow-none hover:border-iris-violet/30 transition-all duration-300"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-bold text-ash-text hover:text-white transition mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <div className="mx-auto w-12 h-12 rounded-lg bg-white text-black flex items-center justify-center font-bold text-base mb-3">
            F
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">Log in to frostPitch</h1>
          <p className="text-xs text-ash-text mt-1">Book slots and manage your matches.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-bold text-ash-text uppercase">Email or Phone Number</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash-text" />
              <Input
                type="text"
                placeholder="player@gmail.com or +91..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 py-5 rounded-md text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <Label className="text-[10px] font-bold text-ash-text uppercase">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ash-text" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 py-5 rounded-md text-xs"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue border border-iris-violet/20 hover:shadow-[0_0_15px_rgba(148,138,227,0.3)] text-white shadow-none py-5 font-bold uppercase tracking-wider text-xs transition duration-200">
            {isLoading ? "Authenticating..." : "Log In"}
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-ash-text">
          Don't have an account?{" "}
          <Link to="/signup" className="text-iris-violet hover:underline font-bold">
            Sign up
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
