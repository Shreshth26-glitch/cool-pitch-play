import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Star, MapPin, Phone, Mail, Instagram, Facebook, MessageCircle,
  Clock, Users, Car, Droplets, Zap, Trophy, Shield, Wifi, Music,
  Camera, Coffee, ShowerHead, Snowflake, Sparkles, Award, Check,
  ChevronDown, ArrowRight, Calendar as CalendarIcon, Wind, Flame,
  Heart, PlayCircle, ChevronLeft, ChevronRight, QrCode, CreditCard, Lock,
} from "lucide-react";

import heroImg from "@/assets/hero-stadium.jpg";
import mistImg from "@/assets/mist-cooling.jpg";
import aboutImg from "@/assets/about-turf.jpg";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { getBookedSlots, createBooking, getAvailableSlots } from "../lib/api-client";
import { useAuth } from "../hooks/use-auth";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ---------------- Helpers ---------------- */

function Reveal({ children, delay = 0, y = 20 }: { children: ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded bg-[#1c1c1f] border border-[#27272a] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ash-text">
      <span className="h-1.5 w-1.5 rounded-full bg-iris-violet animate-pulse shadow-[0_0_8px_#948ae3]" />
      {children}
    </div>
  );
}

function CommandSnippet() {
  const [copied, setCopied] = useState(false);
  const cmd = "npx play don-bosco";
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    toast.success("Command copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 bg-[#121214] border border-[#27272a] hover:border-iris-violet/40 rounded-lg px-4 py-3 font-mono text-[13px] text-white transition-all duration-300">
      <span className="text-iris-violet select-none">$</span>
      <span>{cmd}</span>
      <button onClick={copy} className="ml-2 text-ash-text hover:text-white transition" aria-label="Copy booking command">
        {copied ? <Check className="h-4 w-4 text-mint-green" /> : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>
    </div>
  );
}

function TelemetryCard() {
  const [sensors, setSensors] = useState({
    temp: 31.8,
    humidity: 48,
    mistRate: 85,
    pressure: 124,
    status: "COOLING"
  });

  useEffect(() => {
    const t = setInterval(() => {
      setSensors(prev => ({
        ...prev,
        temp: +(prev.temp + (Math.random() * 0.4 - 0.2)).toFixed(1),
        pressure: Math.floor(prev.pressure + (Math.random() * 4 - 2))
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-xl p-6 shadow-none text-left w-full hover:border-iris-violet/40 transition-all duration-300">
      <div className="flex justify-between items-center border-b border-[#27272a] pb-3 mb-4">
        <span className="font-mono text-xs text-ash-text">telemetry.donboscoturf.in</span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-mint-green/10 text-mint-green text-[9px] font-bold uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-mint-green animate-pulse shadow-[0_0_8px_#7bd88f]" />
          MIST {sensors.status}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2 px-3 bg-[#18181b] rounded border border-[#27272a]/50 text-xs">
          <span className="text-ash-text font-medium">Ambient Temperature</span>
          <span className="font-mono font-bold text-white">{sensors.temp}°C</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-[#1c1c1f] rounded border border-[#27272a]/50 text-xs">
          <span className="text-ash-text font-medium">Relative Humidity</span>
          <span className="font-mono font-bold text-white">{sensors.humidity}%</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-[#18181b] rounded border border-[#27272a]/50 text-xs">
          <span className="text-ash-text font-medium">Mist Spray Rate</span>
          <span className="font-mono font-bold text-white">{sensors.mistRate}% duty</span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 bg-[#1c1c1f] rounded border border-[#27272a]/50 text-xs">
          <span className="text-ash-text font-medium">Nozzle Feed Pressure</span>
          <span className="font-mono font-bold text-white">{sensors.pressure} PSI</span>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="text-[10px] font-mono text-muted-foreground">Updated 3s ago</span>
        <button
          type="button"
          onClick={() => toast.success("Telemetry sensors updated successfully")}
          className="bg-transparent hover:bg-white/10 text-white font-semibold text-xs rounded-lg px-3 py-1.5 border border-[#27272a] transition duration-200"
        >
          Purge Cache
        </button>
      </div>
    </div>
  );
}

function SDKPreviewCard() {
  return (
    <div className="bg-[#141414] border border-[#38383a] rounded-xl overflow-hidden text-left shadow-none w-full font-mono text-[13px] leading-relaxed">
      <div className="flex items-center justify-between bg-[#292929] px-4 py-3 border-b border-[#38383a]">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#fc618d]" />
          <span className="h-3 w-3 rounded-full bg-[#f8e67a]" />
          <span className="h-3 w-3 rounded-full bg-[#7bd88f]" />
        </div>
        <span className="text-ash-text text-xs">book.ts</span>
        <div className="w-12" />
      </div>
      <div className="p-5 text-[#d7d7d7] overflow-x-auto whitespace-pre">
        <div>
          <span className="text-[#fc618d]">import</span> {"{"} <span className="text-[#948ae3]">bookSlot</span>, <span className="text-[#948ae3]">Config</span> {"}"} <span className="text-[#fc618d]">from</span> <span className="text-[#f8e67a]">"@donbosco/sdk"</span>;
        </div>
        <div className="mt-1">
          <span className="text-[#fc618d]">const</span> <span className="text-[#948ae3]">config</span>: <span className="text-[#948ae3]">Config</span> = {"{"}
        </div>
        <div className="pl-4">
          <span className="text-[#d7d7d7]">turfId:</span> <span className="text-[#f8e67a]">"don-bosco-bhilwara"</span>,
        </div>
        <div className="pl-4">
          <span className="text-[#d7d7d7]">perimeterMist:</span> <span className="text-[#7bd88f]">true</span>, <span className="text-[#6d6d70]">/* cooling mist */</span>
        </div>
        <div className="pl-4">
          <span className="text-[#d7d7d7]">floodlights:</span> <span className="text-[#7bd88f]">true</span>
        </div>
        <div>{"};"}</div>
        <div className="mt-3">
          <span className="text-[#fc618d]">export async function</span> <span className="text-[#948ae3]">reserveMatch</span>() {"{"}
        </div>
        <div className="pl-4">
          <span className="text-[#fc618d]">const</span> <span className="text-[#d7d7d7]">booking</span> = <span className="text-[#fc618d]">await</span> <span className="text-[#948ae3]">bookSlot</span>({"{"}
        </div>
        <div className="pl-8">
          <span className="text-[#d7d7d7]">date:</span> <span className="text-[#f8e67a]">"2026-07-24"</span>,
        </div>
        <div className="pl-8">
          <span className="text-[#d7d7d7]">time:</span> <span className="text-[#f8e67a]">"20:00"</span>,
        </div>
        <div className="pl-8">
          <span className="text-[#d7d7d7]">durationHours:</span> <span className="text-[#f8e67a]">2</span>
        </div>
        <div className="pl-4">{"});"}</div>
        <div className="pl-4 text-[#6d6d70]">{"// Returns SMS & Email receipt"}</div>
        <div className="pl-4">
          <span className="text-[#fc618d]">return</span> <span className="text-[#d7d7d7]">booking</span>;
        </div>
        <div>{"}"}</div>
      </div>
    </div>
  );
}

/* ---------------- Mouse follower ---------------- */

function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onMove = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setVisible(true); };
    const onLeave = () => setVisible(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-8 w-8 rounded-full mix-blend-screen md:block"
      animate={{ x: pos.x - 16, y: pos.y - 16, opacity: visible ? 1 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.3 }}
      style={{ background: "radial-gradient(circle, rgba(148, 138, 227, 0.45), transparent 70%)" }}
    />
  );
}

/* ---------------- Loading screen ---------------- */

function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
    >
      <div className="text-center">
        <motion.div
          className="mx-auto mb-6 h-16 w-16 rounded-lg border-2 border-[#27272a] border-t-white"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div className="text-2xl font-bold tracking-widest text-white font-sans" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          frostPitch
        </motion.div>
        <div className="mt-2 text-xs uppercase tracking-[0.3em] text-ash-text">Turf · Bhilwara</div>
      </div>
    </motion.div>
  );
}

/* ---------------- Nav ---------------- */

function Nav({ onBook }: { onBook: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#", label: "Home" },
    { href: "#features", label: "Cooling" },
    { href: "#about", label: "About" },
    { href: "#facilities", label: "Facilities" },
    { href: "#pricing", label: "Pricing" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <motion.header
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 pt-6 pb-2 px-4`}
    >
      <div className="mx-auto max-w-7xl bg-transparent border-0 rounded-none px-6 pt-5 pb-2 flex items-center justify-between shadow-none">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="h-6 w-6 rounded bg-white text-ink-black flex items-center justify-center font-bold text-xs">
            F
          </div>
          <div className="leading-none text-left">
            <div className="text-sm font-bold tracking-wider text-white uppercase">frostPitch</div>
            <div className="text-[8px] uppercase tracking-[0.25em] text-ash-text font-bold mt-0.5">Turf</div>
          </div>
        </a>
        <nav className="hidden lg:flex items-center gap-6">
          {links.map(l => (
            <a key={l.label} href={l.href} className="text-xs font-semibold uppercase tracking-wider text-ash-text hover:text-white transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings">
                <Button size="sm" variant="outline" className="rounded-lg border-white/20 hover:bg-white/10 text-white py-2.5 shadow-none">
                  My Bookings
                </Button>
              </Link>
              <Button onClick={logout} size="sm" variant="ghost" className="rounded-lg text-xs font-semibold text-ash-text hover:text-hot-pink hover:bg-white/10 py-2.5 shadow-none">
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="ghost" className="rounded-lg text-xs font-semibold text-white hover:bg-white/10 py-2.5 shadow-none">
                Login
              </Button>
            </Link>
          )}

          <Button onClick={onBook} size="sm" className="rounded-lg bg-white hover:bg-white/95 text-ink-black font-bold text-[10px] tracking-wider uppercase px-4 py-2.5 border-0 shadow-none">
            Book Now
          </Button>
          <button onClick={() => setOpen(!open)} aria-label="Menu" className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-white/20 bg-white/10 shadow-none">
            <div className="flex flex-col gap-1">
              <span className={`h-0.5 w-4 bg-white transition-all ${open ? "translate-y-1 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 bg-white transition-all ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-4 bg-white transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-2 mx-auto max-w-7xl rounded-xl bg-[#09090b]/95 backdrop-blur-lg border border-white/10 p-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)] space-y-1"
          >
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-white hover:bg-white/10 rounded-lg transition text-left">
                {l.label}
              </a>
            ))}
            
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-white hover:bg-white/10 rounded-lg transition text-left">
                  My Bookings
                </Link>
                <button onClick={() => { setOpen(false); logout(); }} className="block w-full text-left py-2.5 px-3 text-sm font-semibold text-hot-pink hover:bg-white/10 rounded-lg transition">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-white hover:bg-white/10 rounded-lg transition text-left">
                Login / Sign Up
              </Link>
            )}

            <Button onClick={() => { setOpen(false); onBook(); }} className="mt-3 w-full rounded-lg bg-white hover:bg-white/90 text-ink-black font-bold uppercase tracking-wider text-xs py-5">Book Now</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg} alt="frostPitch Premium Cricket Turf"
          className="h-full w-full object-cover"
        />
        {/* Dusk gradient overlay mapping over photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/95 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at center, rgba(148, 138, 227, 0.15) 0%, transparent 75%)" }} />
        <div className="absolute inset-0 bg-black/15" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full text-center mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Preserve font and wording exactly as user requested */}
          <h1 className="hero-title text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-medium text-white tracking-[0.4em] uppercase">
            Where Champions Play
          </h1>
          
          <div className="mt-4 flex justify-center w-full">
            <Button
              onClick={onBook}
              size="lg"
              className="rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue hover:opacity-95 text-white font-bold text-xs uppercase tracking-widest px-10 py-6 border border-iris-violet/20 shadow-none transition duration-300 flex items-center gap-2 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(148,138,227,0.5)] w-full sm:w-auto justify-center"
            >
              <CalendarIcon className="h-4.5 w-4.5" /> Book Now
            </Button>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-5 h-8 rounded-full border border-white/40 flex justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1.5 rounded-full bg-white"
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Cooling Mist Feature ---------------- */

function CoolingFeature({ onBook }: { onBook: () => void }) {
  return (
    <section id="features" className="relative py-28 md:py-36 bg-[#09090b] border-y border-[#27272a] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 space-y-6"
          >
            <SectionLabel>Signature Feature</SectionLabel>
            <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white leading-tight">
              Stay Cool.<br />Play Longer.
            </h2>
            <p className="text-sm md:text-base text-ash-text leading-relaxed">
              Bhilwara summers hit hard. Our proprietary perimeter mist system releases ultra-fine, evaporative droplets that instantly drop the ambient temperature around the pitch by up to 8°C—without wetting the turf or the ball.
            </p>
            <p className="text-xs md:text-sm text-ash-text leading-relaxed">
              Enjoy comfortable gameplay during the hottest summer days. No exhaustion, no slippery grips, just pure game time.
            </p>
            <div className="pt-4">
              <Button onClick={onBook} className="rounded-lg bg-white hover:bg-white/90 text-ink-black px-6 py-5 text-sm font-semibold border border-white/10 shadow-none transition duration-200">
                Book Cool Slot <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 grid sm:grid-cols-2 gap-6 items-start"
          >
            <div className="sm:col-span-2 relative aspect-[16/10] overflow-hidden rounded-xl border border-[#27272a] shadow-none bg-[#161618]">
              <img src={mistImg} alt="Water mist cooling system over cricket turf" className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-[#161618] border border-[#27272a] rounded px-3 py-1.5 text-xs font-semibold text-white flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5 text-iris-violet animate-pulse" /> Active: −8°C ambient cooling
              </div>
            </div>

            <TelemetryCard />

            <div className="grid grid-cols-1 gap-4 w-full">
              {[
                { icon: Droplets, title: "Water Mist Cooling", desc: "Nozzle sprayers blanket the boundary in a cooling dry vapor." },
                { icon: Heart, title: "Beat the Heat", desc: "Reduces fatigue, allowing longer matches and safer play." },
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-5 rounded-xl bg-[#161618] border border-[#27272a] hover:border-iris-violet/40 transition duration-300">
                  <div className="grid h-10 w-10 place-items-center rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50 shrink-0">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{f.title}</h4>
                    <p className="mt-1 text-xs text-ash-text leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */

function About() {
  const keyPoints = [
    "Professional Turf Quality",
    "Premium Box Cricket Experience",
    "Comfortable & Well-Lit Environment",
    "Family & Spectator Friendly",
    "Perfect for Summer Tournaments"
  ];
  return (
    <section id="about" className="relative py-28 md:py-36 bg-[#09090b] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6"
        >
          <SectionLabel>About frostPitch</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white leading-tight">
            A professional stadium vibe, <span className="text-iris-violet">crafted for everyone.</span>
          </h2>
          <p className="text-sm md:text-base text-ash-text leading-relaxed">
            From casual weekend matches with friends to highly competitive corporate leagues, frostPitch delivers a premium box cricket experience in the heart of Bhilwara.
          </p>
          <p className="text-sm text-ash-text leading-relaxed">
            Our facility has been engineered to provide international turf standards, optimal non-glare floodlighting, clean amenities, and a comfortable atmosphere for both players and spectators.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {keyPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#161618] border border-[#27272a] rounded-lg px-4 py-3 shadow-none">
                <div className="grid h-6 w-6 place-items-center rounded bg-[#1d1d21] text-[#948ae3] border border-[#27272a]/40 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-white">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full space-y-4"
        >
          <div className="relative aspect-[16/11] overflow-hidden rounded-xl border border-[#27272a] shadow-none bg-[#161618]">
            <img src={aboutImg} alt="Aerial view of frostPitch cricket turf" className="h-full w-full object-cover" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}

/* ---------------- Facilities ---------------- */

function Facilities() {
  const facilities = [
    { icon: Trophy, label: "Professional Turf", desc: "International-grade artificial grass with true ball bounce." },
    { icon: Zap, label: "LED Floodlights", desc: "Non-glare, shadowless layout for night games." },
    { icon: Droplets, label: "Water Mist Cooling", desc: "Integrated perimeter mist system keeps field fresh." },
    { icon: ShowerHead, label: "Changing Rooms", desc: "Clean changing rooms with showers for prep." },
    { icon: Car, label: "Ample Parking", desc: "Dedicated, secure parking spaces inside turf boundary." },
    { icon: Coffee, label: "Clean Washrooms", desc: "Hygienic and sanitary washrooms on-site." },
    { icon: Wind, label: "Drinking Water", desc: "Cold purified mineral drinking water dispenser." },
    { icon: Award, label: "Equipment Rental", desc: "Bats, tennis balls, and wickets included in slot." },
    { icon: Music, label: "Music System", desc: "High-quality audio setup for match energy." },
    { icon: Camera, label: "CCTV Security", desc: "24/7 camera monitoring for player safety." },
    { icon: Users, label: "Spectator Seating", desc: "Elevated spectator benches for friends and supporters." },
  ];
  return (
    <section id="facilities" className="relative py-28 md:py-36 bg-[#09090b] border-y border-[#27272a]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Facilities</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Stadium standard.<br /><span className="text-iris-violet">Every single slot.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-ash-text">
            We provide top-of-the-line amenities to ensure your box cricket game is uninterrupted and premium.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {facilities.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="group p-6 card-premium rounded-xl shadow-none"
            >
              <div className="grid h-12 w-12 place-items-center rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50 group-hover:bg-iris-violet group-hover:text-white transition duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">{f.label}</h3>
              <p className="mt-2 text-xs text-ash-text leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

function Pricing({ onBook }: { onBook: () => void }) {
  const perks = [
    "1 hour of premium turf slot time",
    "Proprietary mist cooling included",
    "LED floodlights & high-end audio",
    "Premium bats, tennis balls, & helmets",
    "Changing rooms & cold drinking water",
    "Free secure parking on-site",
  ];
  return (
    <section id="pricing" className="relative py-28 md:py-36 bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Simple Pricing</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            One flat rate. <span className="text-iris-violet">No hidden fees.</span>
          </h2>
          <p className="mt-4 text-sm text-ash-text">
            Play anytime, day or night. We keep our pricing direct, transparent, and standard.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Card 1: 1 Hour */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative rounded-2xl bg-gradient-to-b from-[#18181b] to-[#0e0e0f] border border-[#27272a] p-8 md:p-10 overflow-hidden shadow-2xl hover:border-iris-violet/40 hover:shadow-[0_0_35px_rgba(148,138,227,0.12)] transition-all duration-500 flex flex-col justify-between group"
          >
            <div className="space-y-6">
              <div className="text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#69bee2]">Standard Slot</span>
                <h3 className="text-lg font-bold text-white">Single Hour Play</h3>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-5xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-ash-text">₹699</span>
                  <span className="text-xs font-semibold text-ash-text">/ hr</span>
                </div>
                <p className="text-xs text-ash-text leading-relaxed">Perfect for a quick, high-intensity box cricket match with friends.</p>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-[#27272a] text-left">
                {perks.map((perk, j) => (
                  <li key={j} className="flex items-center gap-3 text-xs font-semibold text-white/90">
                    <div className="grid h-5.5 w-5.5 place-items-center rounded-full bg-iris-violet/10 text-iris-violet border border-iris-violet/20 shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#27272a]">
              <Button
                onClick={onBook}
                size="lg"
                className="w-full rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue hover:opacity-95 text-white py-5 border border-iris-violet/20 hover:shadow-[0_0_20px_rgba(148,138,227,0.4)] shadow-none font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Book 1 Hour <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Card 2: 2 Hours */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative rounded-2xl bg-gradient-to-b from-[#1c1c20] to-[#0e0e0f] border border-iris-violet/30 p-8 md:p-10 overflow-hidden shadow-2xl hover:border-iris-violet/50 hover:shadow-[0_0_40px_rgba(148,138,227,0.18)] transition-all duration-500 flex flex-col justify-between group"
          >
            {/* Ambient Accent for the premium option */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-iris-violet/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-4 right-4 rounded bg-mint-green/10 text-mint-green border border-mint-green/20 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest">
              Best Value
            </div>

            <div className="space-y-6">
              <div className="text-left space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#948ae3]">Combo Session</span>
                <h3 className="text-lg font-bold text-white">Extended Play</h3>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="text-5xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-ash-text">₹1299</span>
                  <span className="text-xs font-semibold text-ash-text">/ 2 hrs</span>
                </div>
                <p className="text-xs text-ash-text leading-relaxed">Save ₹99! Ideal for full tournaments or comprehensive team leagues.</p>
              </div>

              <ul className="space-y-3.5 pt-4 border-t border-[#27272a] text-left">
                {[
                  "2 hours of consecutive turf slot time",
                  "Proprietary mist cooling included",
                  "LED floodlights & high-end audio",
                  "Premium bats, tennis balls, & helmets",
                  "Changing rooms & cold drinking water",
                  "Save ₹99 on back-to-back hours",
                ].map((perk, j) => (
                  <li key={j} className="flex items-center gap-3 text-xs font-semibold text-white/90">
                    <div className="grid h-5.5 w-5.5 place-items-center rounded-full bg-iris-violet/10 text-iris-violet border border-iris-violet/20 shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-[#27272a]">
              <Button
                onClick={onBook}
                size="lg"
                className="w-full rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue hover:opacity-95 text-white py-5 border border-iris-violet/20 hover:shadow-[0_0_20px_rgba(148,138,227,0.4)] shadow-none font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                Book 2 Hours <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Gallery ---------------- */

function Gallery() {
  const images = [
    { src: g1, alt: "Batsman driving a shot during night game" },
    { src: g4, alt: "Side view of cricket turf and mist nozzles" },
    { src: g2, alt: "Premium cricket ball on artificial grass" },
    { src: g3, alt: "Cricketers in action under high LED lighting" },
    { src: aboutImg, alt: "Cricketers on green turf field" },
    { src: mistImg, alt: "Cool water mist spraying over the turf" },
  ];
  return (
    <section id="gallery" className="relative py-28 md:py-36 bg-[#09090b] border-y border-[#27272a]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Turf Gallery</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Moments from <span className="text-iris-violet">the pitch.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-xl border border-[#27272a] shadow-none bg-[#161618] aspect-[4/3] hover:border-iris-violet/40 transition duration-300"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300 text-left">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#69bee2]">frostPitch</span>
                <p className="text-xs font-semibold text-white mt-0.5">{img.alt}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why Choose Us ---------------- */

function WhyUs() {
  const items = [
    { icon: Trophy, title: "International Grade Turf", desc: "Top-quality shock-padded artificial grass that is joint-free and mimics a real field bounce." },
    { icon: Droplets, title: "Water Mist System", desc: "Bhilwara's only box cricket facility with integrated, temperature-lowering perimeter mist sprayers." },
    { icon: Zap, title: "Zero Shadow Lighting", desc: "Meticulously mapped high-lumen floodlights ensuring optimal visibility for day and night games." },
    { icon: Award, title: "Flat Rate Billing", desc: "Direct, uniform pricing throughout the week. No surge rates, peak-hour charges or hidden fees." },
    { icon: CalendarIcon, title: "Seamless Online Booking", desc: "Instant automated slots checking and SMS confirmations. Manage reservations with ease." },
    { icon: Car, title: "Free On-Site Parking", desc: "Spacious, dedicated parking spots inside the facility boundaries, monitored for safety." }
  ];
  return (
    <section className="relative py-28 md:py-36 bg-[#09090b]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Why Choose Us</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Designed for <span className="text-iris-violet">perfect play.</span>
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="p-6 card-premium rounded-xl shadow-none text-left"
            >
              <div className="grid h-10 w-10 place-items-center rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-white">{item.title}</h3>
              <p className="mt-2 text-xs text-ash-text leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

function Testimonials() {
  const reviews = [
    { name: "Rohan Sharma", role: "Local Tournament Organizer", text: "The perimeter mist cooling system is a total lifesaver. We played on a hot Sunday afternoon in May, and the temperature on-field was unbelievably comfortable. Best turf in Bhilwara.", stars: 5 },
    { name: "Priya Mehta", role: "Corporate Team Captain", text: "Booked frostPitch for our office league matches. Clean facilities, well-lit parking, and extremely professional staff. The automatic booking confirmation made coordination seamless.", stars: 5 },
    { name: "Arjun Kasliwal", role: "Club Player", text: "The turf bounce is highly consistent, and the LED floodlighting setup has zero shadows. We have scheduled weekly night slots here, and it is worth every rupee.", stars: 5 },
    { name: "Vikram Toshniwal", role: "Weekend Warrior", text: "Incredibly premium turf and exceptionally well-maintained. Clean changing rooms and showers, chilled drinking water, and standard pricing make this the premier choice.", stars: 5 }
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % reviews.length), 6000); return () => clearInterval(t); }, [reviews.length]);
  return (
    <section className="relative py-28 md:py-36 bg-[#09090b] border-y border-[#27272a]">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>Player Reviews</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Loved by <span className="text-iris-violet">players.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="min-h-[250px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="rounded-xl border border-[#27272a] bg-[#161618] p-8 md:p-10 text-center shadow-none"
              >
                <div className="flex justify-center gap-1">
                  {Array.from({ length: reviews[idx].stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#f8e67a] text-[#f8e67a]" />
                  ))}
                </div>
                <p className="mt-6 text-sm md:text-base text-white italic leading-relaxed font-normal">
                  "{reviews[idx].text}"
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded bg-[#1d1d21] text-white border border-[#27272a]/50 font-bold text-sm">
                    {reviews[idx].name[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-white flex items-center gap-1">
                      {reviews[idx].name}
                      <span className="inline-block text-[8px] font-bold uppercase tracking-wider bg-mint-green/10 text-mint-green border border-mint-green/30 px-1.5 py-0.5 rounded">
                        Verified Player
                      </span>
                    </div>
                    <div className="text-[10px] text-ash-text">{reviews[idx].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setIdx(i => (i - 1 + reviews.length) % reviews.length)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#27272a] bg-[#161618] hover:bg-[#27272a] transition"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded transition-all ${i === idx ? "w-6 bg-white" : "w-1.5 bg-[#27272a]"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIdx(i => (i + 1) % reviews.length)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-[#27272a] bg-[#161618] hover:bg-[#27272a] transition"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


/* ---------------- FAQ ---------------- */

function FAQ() {
  const faqs = [
    { q: "How do I book a slot?", a: "Click 'Book Now' anywhere on the site. Choose your date, select your duration, select an available hourly slot, and fill in your details. You will get instant confirmation." },
    { q: "What is your cancellation & refund policy?", a: "Free cancellation is available up to 12 hours before your booked slot starts. Late cancellations will not receive a refund." },
    { q: "Is playing equipment provided?", a: "Yes. Basic tennis cricket bats, tennis balls, and wickets are provided at no extra cost. You are also welcome to bring your personal equipment." },
    { q: "How does the perimeter mist cooling system work?", a: "High-pressure misting nozzles release tiny water droplets that evaporate before hitting the ground, cooling the air dryly by up to 8°C. The grass and ball stay completely dry." },
    { q: "Do you have parking facilities?", a: "Yes, we provide spacious and free parking within the turf boundary walls for all players and visiting guests." }
  ];
  return (
    <section className="relative py-28 md:py-36 bg-[#09090b]">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center mb-12">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Questions? <span className="text-iris-violet">Answered.</span>
          </h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-xl bg-[#161618] border border-[#27272a] p-4 shadow-none"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-[#27272a] last:border-0">
                <AccordionTrigger className="px-4 py-4 text-left text-sm md:text-base font-bold hover:no-underline text-white hover:text-iris-violet transition duration-200">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-xs md:text-sm text-ash-text leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */

function Contact() {
  return (
    <section id="contact" className="relative py-28 md:py-36 bg-[#09090b] border-y border-[#27272a]">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Contact Details</SectionLabel>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-[-0.9px] text-white">
            Come visit <span className="text-iris-violet">frostPitch.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-3 rounded-xl border border-[#27272a] shadow-none overflow-hidden min-h-[400px] relative w-full"
          >
            <iframe
              title="frostPitch Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.60%2C25.32%2C74.68%2C25.38&layer=mapnik&marker=25.3463%2C74.6364"
              className="absolute inset-0 h-full w-full grayscale-[0.5] contrast-125"
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-xl bg-[#161618] border border-[#27272a] p-4 flex items-center gap-3 shadow-none">
                <div className="grid h-9 w-9 place-items-center rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50 shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white text-left">frostPitch, Bhilwara</div>
                  <div className="text-[10px] text-ash-text mt-0.5 text-left">RIICO Industrial Area, Bhilwara, Rajasthan 311001</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              { icon: Phone, label: "Call Support", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: MessageCircle, label: "WhatsApp Chat", value: "Chat with us on WhatsApp", href: "https://wa.me/919876543210" },
              { icon: Mail, label: "Email Support", value: "play@frostpitch.in", href: "mailto:play@frostpitch.in" },
              { icon: Clock, label: "Operating Hours", value: "6:00 AM – 2:00 AM · All Days", href: "#" },
            ].map((c, i) => (
              <a
                key={i} href={c.href}
                className="group flex items-center gap-4 rounded-xl bg-[#161618] border border-[#27272a] p-5 shadow-none hover:bg-[#1d1d21] hover:border-[#948ae3]/30 transition duration-300"
              >
                <div className="grid h-10 w-10 place-items-center rounded bg-[#1d1d21] text-iris-violet border border-[#27272a]/50 shrink-0 transition duration-300">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-ash-text">{c.label}</span>
                  <div className="text-xs font-bold text-white truncate mt-0.5">{c.value}</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-ash-text group-hover:text-white transition" />
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="relative border-t border-[#27272a] bg-[#0c0c0e] text-white pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <div className="h-6 w-6 rounded bg-[#292929] border border-[#38383a] text-white flex items-center justify-center font-bold text-xs">
                F
              </div>
              <div>
                <div className="text-sm font-bold tracking-wider text-white">frostPitch</div>
                <div className="text-[9px] uppercase tracking-widest text-ash-text font-bold">Turf · Bhilwara</div>
              </div>
            </div>
            <p className="max-w-sm text-xs text-ash-text leading-relaxed">
              Bhilwara's premier box cricket experience, featuring India's exclusive water mist cooling system. Play cool, play standard.
            </p>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Quick Links</div>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold">
              <li><a href="#features" className="text-ash-text hover:text-white transition">Cooling</a></li>
              <li><a href="#about" className="text-ash-text hover:text-white transition">About Us</a></li>
              <li><a href="#facilities" className="text-ash-text hover:text-white transition">Facilities</a></li>
              <li><a href="#pricing" className="text-ash-text hover:text-white transition">Pricing</a></li>
              <li><a href="#gallery" className="text-ash-text hover:text-white transition">Gallery</a></li>
            </ul>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-white">Contact & Socials</div>
            <ul className="mt-4 space-y-2 text-xs text-ash-text font-semibold">
              <li>RIICO Industrial Area, Bhilwara</li>
              <li>+91 98765 43210</li>
              <li>play@frostpitch.in</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-[#27272a] bg-[#161618] hover:bg-[#27272a] text-white hover:text-signal-blue transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-lg border border-[#27272a] bg-[#161618] hover:bg-[#27272a] text-white hover:text-signal-blue transition"><Facebook className="h-4 w-4" /></a>
              <a href="https://wa.me/919876543210" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-lg border border-[#27272a] bg-[#161618] hover:bg-[#27272a] text-white hover:text-signal-blue transition"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-ash-text font-mono">
          <div>© {new Date().getFullYear()} frostPitch. All rights reserved.</div>
          <div>Designed for Champions · Crafted in Bhilwara.</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Booking Dialog ---------------- */

function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user, token } = useAuth();
  const [confirmed, setConfirmed] = useState<null | { name: string; date: string; time: string; paymentMethod: string; paymentStatus: string }>(null);
  const [times, setTimes] = useState<string[]>(["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"court" | "online">("court");
  const [showPaymentMock, setShowPaymentMock] = useState(false);
  const [paymentType, setPaymentType] = useState<"upi" | "card">("upi");
  const [mockCard, setMockCard] = useState({ number: "", expiry: "", cvv: "" });

  const [form, setForm] = useState({ date: "", time: "", duration: "1", name: "", phone: "", email: "", team: "", notes: "" });

  // Fetch available slots settings on load
  useEffect(() => {
    if (open) {
      getAvailableSlots()
        .then((slots) => {
          setTimes(slots);
        })
        .catch((err) => {
          console.error("Failed to fetch available slots configuration:", err);
        });
    }
  }, [open]);


  // Pre-fill player details if logged in
  useEffect(() => {
    if (open && user) {
      setForm((prev) => ({
        ...prev,
        name: user.name,
        phone: user.phone,
        email: user.email || "",
      }));
    }
  }, [open, user]);

  // Fetch booked slots when date/duration changes
  useEffect(() => {
    if (!form.date) {
      setBookedTimes([]);
      return;
    }

    let active = true;
    getBookedSlots({ date: form.date, duration: Number(form.duration) })
      .then((slots) => {
        if (active) {
          setBookedTimes(slots);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch booked slots:", err);
      });

    return () => {
      active = false;
    };
  }, [form.date, form.duration]);

  // Reset selected time if it becomes booked (e.g. if user changes duration or date)
  useEffect(() => {
    if (form.time && bookedTimes.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: "" }));
    }
  }, [bookedTimes, form.time]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error("Please fill required fields");
      return;
    }

    if (paymentMethod === "online" && !showPaymentMock) {
      setShowPaymentMock(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createBooking({
        ...form,
        duration: Number(form.duration),
        paymentMethod,
        paymentStatus: paymentMethod === "online" ? "paid" : "unpaid"
      }, token || undefined);
      setConfirmed({ 
        name: res.name, 
        date: res.date, 
        time: res.time, 
        paymentMethod: res.paymentMethod || "court", 
        paymentStatus: res.paymentStatus || "unpaid" 
      });
      toast.success("Booking confirmed!");
      setShowPaymentMock(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to book slot");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hourlyRate = (form.time && ["18:00", "20:00", "22:00", "00:00"].includes(form.time)) ? 1200 : 1000;
  const totalAmount = hourlyRate * Number(form.duration);

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) { setConfirmed(null); setShowPaymentMock(false); } }}>
      <DialogContent className="max-w-2xl bg-[#161618] border border-[#27272a] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] text-white max-h-[90vh] overflow-y-auto rounded-xl">
        {!confirmed ? (
          showPaymentMock ? (
            <div className="space-y-6 mt-4">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                  <Lock className="h-5 w-5 text-iris-violet shrink-0" /> Secure Checkout Simulation
                </DialogTitle>
                <DialogDescription className="text-xs text-ash-text mt-0.5">
                  Simulated secure payments portal for frostPitch.
                </DialogDescription>
              </DialogHeader>

              {/* Total Amount card */}
              <div className="bg-[#1c1c1f] border border-[#27272a] rounded-xl p-4 flex justify-between items-center shadow-none">
                <div className="text-left">
                  <span className="text-[9px] font-bold text-ash-text uppercase tracking-wider">Total Amount Due</span>
                  <p className="text-xl font-bold text-white mt-0.5">
                    ₹{totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-ash-text mt-0.5">
                    ({form.duration} hour{Number(form.duration) > 1 ? "s" : ""} @ ₹{hourlyRate.toLocaleString()}/hr)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-iris-violet/10 border border-iris-violet/30 text-iris-violet px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                    PENDING AUTH
                  </span>
                </div>
              </div>

              {/* Method selection tabs */}
              <div className="flex gap-2 p-1 bg-[#1c1c1f] border border-[#27272a] rounded-lg">
                <button
                  type="button"
                  onClick={() => setPaymentType("upi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded transition ${
                    paymentType === "upi"
                      ? "bg-[#27272a] border border-[#3f3f46] text-white"
                      : "text-ash-text hover:text-white"
                  }`}
                >
                  <QrCode className="h-4 w-4" /> UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("card")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded transition ${
                    paymentType === "card"
                      ? "bg-[#27272a] border border-[#3f3f46] text-white"
                      : "text-ash-text hover:text-white"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Card Payment
                </button>
              </div>

              {/* Tab content */}
              {paymentType === "upi" ? (
                <div className="flex flex-col items-center justify-center border border-[#27272a] border-dashed rounded-xl p-6 bg-[#1c1c1f]/50">
                  <div className="w-36 h-36 border border-[#27272a] bg-white rounded-xl p-2.5 flex flex-col justify-between items-center shadow-none relative overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 w-full h-full opacity-95">
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-[#27272a] rounded" />
                    </div>
                    <div className="absolute inset-0 m-auto h-8 w-8 rounded-lg bg-black flex items-center justify-center text-white border-2 border-white shadow shadow-black/25">
                      <Check className="h-5 w-5 font-bold" />
                    </div>
                  </div>
                  <p className="text-[10px] text-ash-text text-center mt-4 max-w-xs">
                    Scan this QR code from any UPI app (GPay, PhonePe, Paytm) to complete payment simulation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 border border-[#27272a] border-dashed rounded-xl p-5 bg-[#1c1c1f]/50 text-left">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Card Number</Label>
                    <Input
                      type="text"
                      maxLength={16}
                      placeholder="4111 2222 3333 4444"
                      value={mockCard.number}
                      onChange={(e) => setMockCard({ ...mockCard, number: e.target.value.replace(/[^0-9]/g, "") })}
                      className="bg-[#121214] border-[#27272a] text-white text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-ash-text uppercase">Expiry Date</Label>
                      <Input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={mockCard.expiry}
                        onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                        className="bg-[#121214] border-[#27272a] text-white text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-ash-text uppercase">CVV</Label>
                      <Input
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={mockCard.cvv}
                        onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value.replace(/[^0-9]/g, "") })}
                        className="bg-[#121214] border-[#27272a] text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Simulated gateway buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowPaymentMock(false)}
                  className="rounded-lg hover:bg-[#27272a] text-white text-xs py-4 order-2 sm:order-1 font-semibold flex-1 border border-[#27272a] shadow-none"
                >
                  Go Back
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={submit}
                  className="rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue text-white font-bold text-xs py-4 border border-iris-violet/20 hover:shadow-[0_0_15px_rgba(148,138,227,0.3)] shadow-none order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 transition duration-200"
                >
                  {isSubmitting ? "Processing..." : "Simulate Payment Success"} <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="text-xl font-bold text-white">Book Your Slot</DialogTitle>
                <DialogDescription className="text-ash-text text-xs mt-1">
                  Instant SMS and email confirmations. Play on Bhilwara's coolest turf.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="grid gap-5 mt-4 text-left">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Date *</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs" required />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Duration</Label>
                    <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1.5 h-9 w-full rounded-lg bg-[#121214] border border-[#27272a] px-3 text-xs text-white focus:border-iris-violet/50">
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Team Name</Label>
                    <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Optional" className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs" />
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] font-bold text-ash-text uppercase">Available slots *</Label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {times.map((t) => {
                      const booked = bookedTimes.includes(t);
                      const active = form.time === t;
                      return (
                        <button
                          key={t} type="button" disabled={booked}
                          onClick={() => setForm({ ...form, time: t })}
                          className={`rounded-lg px-4 py-2 text-xs font-semibold border transition-all ${
                            booked ? "opacity-25 cursor-not-allowed border-[#27272a] line-through text-ash-text" :
                            active ? "bg-white text-ink-black border-white" :
                            "bg-[#161618] border-[#27272a] text-white hover:border-white/40"
                          }`}
                        >{t}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Player Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs" required />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-ash-text uppercase">Phone number *</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs" required />
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-ash-text uppercase">Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-ash-text uppercase">Special Requests</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 bg-[#121214] border-[#27272a] text-white focus:border-iris-violet/50 rounded-lg text-xs resize-none h-16" placeholder="e.g. wickets, extra ball..." />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 border-t border-[#27272a] pt-4 mt-2">
                  <Label className="text-[10px] font-bold text-ash-text uppercase">Select Payment Method *</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-1.5">
                    <button
                      key="pay-court"
                      type="button"
                      onClick={() => setPaymentMethod("court")}
                      className={`rounded-xl p-4 text-left border transition-all flex flex-col justify-between h-20 ${
                        paymentMethod === "court"
                          ? "bg-[#1c1c1f] border-iris-violet shadow-none ring-1 ring-iris-violet/20 text-white"
                          : "bg-[#121214] border-[#27272a] hover:border-white/30 text-white"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "court" ? "bg-iris-violet" : "bg-ash-text/50"}`} />
                        Pay at Court
                      </span>
                      <span className="text-[9px] text-ash-text leading-normal mt-1">Pay with Cash/UPI on-site when you play.</span>
                    </button>
                    <button
                      key="pay-online"
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`rounded-xl p-4 text-left border transition-all flex flex-col justify-between h-20 ${
                        paymentMethod === "online"
                          ? "bg-[#1c1c1f] border-iris-violet shadow-none ring-1 ring-iris-violet/20 text-white"
                          : "bg-[#121214] border-[#27272a] hover:border-white/30 text-white"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "online" ? "bg-iris-violet" : "bg-ash-text/50"}`} />
                        Pay Online
                      </span>
                      <span className="text-[9px] text-ash-text leading-normal mt-1">Pre-authorize & pay securely right now.</span>
                    </button>
                  </div>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t border-[#27272a]">
                  <Button type="submit" disabled={isSubmitting} className="rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue text-white w-full sm:w-auto px-6 py-5 font-bold uppercase tracking-wider text-xs border border-iris-violet/20 hover:shadow-[0_0_20px_rgba(148,138,227,0.4)] shadow-none transition duration-200">
                    {paymentMethod === "online" ? "Proceed to Checkout" : "Confirm Booking"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </form>
            </>
          )
        ) : (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="mx-auto grid h-12 w-12 place-items-center rounded bg-mint-green/10 text-mint-green border border-mint-green/30">
              <Check className="h-5 w-5 font-bold" />
            </motion.div>
            <h3 className="mt-5 text-xl font-bold text-white">Booking Confirmed!</h3>
            <p className="mt-3 text-xs md:text-sm text-ash-text leading-relaxed">
              We look forward to seeing you on <span className="text-white font-bold">{confirmed.date}</span> at{" "}
              <span className="text-white font-bold">{confirmed.time}</span>, {confirmed.name}.
            </p>
            <p className="mt-2 text-xs font-bold text-iris-violet flex items-center justify-center gap-1">
              <Check className="h-4 w-4" /> 
              {confirmed.paymentMethod === "online" 
                ? "Paid Online · Slot fully confirmed" 
                : "Pay at Court · Unpaid (Pay on-site)"}
            </p>
            <p className="mt-3 text-[10px] text-ash-text">A confirmation SMS has been dispatched to your mobile.</p>
            <Button onClick={() => { onOpenChange(false); setConfirmed(null); setShowPaymentMock(false); }} className="mt-8 rounded-lg bg-white hover:bg-white/95 text-ink-black px-8 font-bold uppercase tracking-wider text-xs py-5 border-0 shadow-none">Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Sticky Book CTA (mobile) ---------------- */

function StickyBookBar({ onBook }: { onBook: () => void }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
        >
          <Button onClick={onBook} className="w-full rounded-lg bg-gradient-to-r from-iris-violet to-signal-blue border border-iris-violet/20 text-white py-6 font-bold uppercase tracking-wider text-xs shadow-xl hover:shadow-[0_0_20px_rgba(148,138,227,0.4)] transition duration-200">
            Book your slot now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Scroll progress ---------------- */

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-0.5 origin-left bg-iris-violet z-[60]" />;
}

/* ---------------- Landing Page ---------------- */

function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const openBook = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem("open_booking_on_login", "true");
      toast.info("Please sign up or log in to book a slot");
      navigate({ to: "/signup" });
    } else {
      setBookOpen(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated && sessionStorage.getItem("open_booking_on_login") === "true") {
      sessionStorage.removeItem("open_booking_on_login");
      setBookOpen(true);
    }
  }, [isAuthenticated]);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <Cursor />
      <ScrollProgress />

      <div className="relative min-h-screen bg-background text-foreground">
        <Nav onBook={openBook} />
        <main>
          <Hero onBook={openBook} />
          <CoolingFeature onBook={openBook} />
          <About />
          <Facilities />
          <Pricing onBook={openBook} />
          <Gallery />
          <WhyUs />
          <Testimonials />
          
          <FAQ />
          <Contact />
        </main>
        <Footer />
        <StickyBookBar onBook={openBook} />
        <BookingDialog open={bookOpen} onOpenChange={setBookOpen} />
      </div>
    </>
  );
}

