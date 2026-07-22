import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Mail, Phone, Snowflake, UserIcon } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      toast.success("Welcome to Don Bosco Turf! Account created.");
      navigate({ to: "/" });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create account. Check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
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
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13l4 4L20 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight font-display">Create an account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start booking slots at Don Bosco Turf Bhilwara.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-white/5 border-border py-5"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="rahul@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white/5 border-border py-5"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 bg-white/5 border-border py-5"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Password (min 6 chars)</Label>
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
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <div className="text-center mt-6 text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
