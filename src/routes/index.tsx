import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef, type ReactNode } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Star, MapPin, Phone, Mail, Instagram, Facebook, MessageCircle,
  Clock, Users, Car, Droplets, Zap, Trophy, Shield, Wifi, Music,
  Camera, Coffee, ShowerHead, Snowflake, Sparkles, Award, Check,
  ChevronDown, ArrowRight, Calendar as CalendarIcon, Wind, Flame,
  Heart, PlayCircle, ChevronLeft, ChevronRight,
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

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ---------------- Helpers ---------------- */

function Reveal({ children, delay = 0, y = 30 }: { children: ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
      {children}
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
      style={{ background: "radial-gradient(circle, oklch(0.78 0.21 155 / 0.6), transparent 70%)", boxShadow: "0 0 30px oklch(0.72 0.19 155 / 0.6)" }}
    />
  );
}

/* ---------------- Loading screen ---------------- */

function Loader({ onDone }: { onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 1400); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[color:var(--onyx)]"
    >
      <div className="text-center">
        <motion.div
          className="mx-auto mb-6 h-16 w-16 rounded-full border-2 border-primary/30 border-t-primary"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div className="text-2xl font-semibold tracking-widest text-gradient" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          FROSTPITCH
        </motion.div>
        <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">Turf · Bhilwara</div>
      </div>
    </motion.div>
  );
}

/* ---------------- Nav ---------------- */

function Nav({ onBook }: { onBook: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#features", label: "Cooling" },
    { href: "#about", label: "About" },
    { href: "#facilities", label: "Facilities" },
    { href: "#pricing", label: "Pricing" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <motion.header
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className={`mx-auto max-w-7xl px-4 md:px-6`}>
        <div className={`flex items-center justify-between rounded-full px-4 md:px-6 py-3 transition-all ${scrolled ? "glass-strong shadow-[var(--shadow-elegant)]" : ""}`}>
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 glow-emerald">
              <Snowflake className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold tracking-wider">FROSTPITCH</div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Turf</div>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <a key={l.href} href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group">
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button onClick={onBook} size="sm" className="rounded-full bg-primary text-primary-foreground hover:opacity-90 hidden sm:inline-flex shadow-[var(--shadow-glow)]">
              Book Now <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="lg:hidden grid h-10 w-10 place-items-center rounded-full glass">
              <div className="flex flex-col gap-1">
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "translate-y-1.5 rotate-45" : ""}`} />
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-2 rounded-3xl glass-strong p-4"
            >
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 text-sm border-b border-border last:border-0">
                  {l.label}
                </a>
              ))}
              <Button onClick={() => { setOpen(false); onBook(); }} className="mt-3 w-full rounded-full">Book Now</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background image with parallax + slow zoom */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <motion.img
          src={heroImg} alt="FrostPitch Turf cricket stadium at night" width={1920} height={1088}
          className="h-full w-full object-cover"
          initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 8, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      </motion.div>

      {/* Floodlight beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[70vh] w-64 -translate-x-1/2 rotate-12 blur-3xl opacity-30 animate-flicker" style={{ background: "linear-gradient(to bottom, oklch(0.9 0.15 165), transparent)" }} />
        <div className="absolute top-0 right-1/4 h-[70vh] w-64 translate-x-1/2 -rotate-12 blur-3xl opacity-30 animate-flicker" style={{ background: "linear-gradient(to bottom, oklch(0.9 0.15 165), transparent)", animationDelay: "1s" }} />
      </div>

      {/* Grass / mist particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-primary/60 blur-[1px] animate-mist"
            style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${i * 0.6}s`, animationDuration: `${8 + (i % 5)}s` }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-4 md:px-6 pt-28 pb-24">
        <Reveal>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-primary w-fit">
            <MapPin className="h-3.5 w-3.5" /> Bhilwara, Rajasthan
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <h1 className="mt-6 max-w-5xl font-display text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.95] tracking-tighter">
            <span className="text-gradient">Where</span>{" "}
            <span className="text-gradient">Champions</span>
            <br />
            <span className="text-emerald-gradient italic">Play.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mt-6 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Premium box cricket experience with India's hottest playing atmosphere — made cooler by our exclusive{" "}
            <span className="text-foreground font-medium">water mist cooling system</span>.
          </p>
        </Reveal>

        <Reveal delay={0.45}>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={onBook} size="lg" className="rounded-full bg-primary px-8 py-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] hover:opacity-90 transition-transform hover:-translate-y-0.5">
              Book Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <a href="#gallery">
              <Button size="lg" variant="outline" className="rounded-full glass border-border px-8 py-6 text-base hover:bg-white/5">
                <PlayCircle className="mr-2 h-5 w-5" /> View Gallery
              </Button>
            </a>
          </div>
        </Reveal>

        {/* Stats */}
        <Reveal delay={0.6}>
          <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 max-w-5xl">
            {[
              { icon: Star, label: "★★★★★", sub: "Rating" },
              { icon: Users, label: "1000+", sub: "Happy Players" },
              { icon: Trophy, label: "Pro", sub: "Turf Grade" },
              { icon: Zap, label: "LED", sub: "Floodlights" },
              { icon: Droplets, label: "Mist", sub: "Cooling System" },
              { icon: Car, label: "Free", sub: "Parking" },
            ].map((s, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="rounded-2xl glass p-4 text-center"
              >
                <s.icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.sub}</div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------------- Cooling Mist Feature ---------------- */

function CoolingFeature() {
  return (
    <section id="features" className="relative py-24 md:py-36 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, oklch(0.72 0.19 155 / 0.15), transparent 60%)" }} />

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-3xl">
          <Reveal><SectionLabel>Signature Feature</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,5vw,4.5rem)] font-bold leading-[1.02] tracking-tight">
              Play Cool Even in <span className="text-emerald-gradient">Peak Summer.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Bhilwara summers hit hard. Our proprietary perimeter mist system releases ultra-fine, evaporative droplets that instantly drop the ambient temperature around the pitch — no wet grass, no soggy grip, just a refreshing microclimate.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-stretch">
          {/* Image with mist */}
          <Reveal>
            <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full overflow-hidden rounded-3xl glass-strong">
              <img src={mistImg} alt="Water mist cooling system over cricket turf" loading="lazy" width={1600} height={1000} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              {/* Animated mist particles */}
              {Array.from({ length: 24 }).map((_, i) => (
                <span key={i} className="absolute bottom-0 h-1 w-1 rounded-full bg-white/70 blur-[1px] animate-mist"
                  style={{ left: `${(i * 4.2) % 100}%`, animationDelay: `${i * 0.4}s`, animationDuration: `${7 + (i % 4)}s` }} />
              ))}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="rounded-full glass-strong px-4 py-2 text-xs uppercase tracking-widest">
                  <Snowflake className="inline h-3.5 w-3.5 mr-1 text-primary" /> Live: −8°C ambient
                </div>
                <div className="rounded-full glass-strong px-4 py-2 text-xs">
                  <Wind className="inline h-3.5 w-3.5 mr-1 text-primary" /> Fine mist
                </div>
              </div>
            </div>
          </Reveal>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Droplets, title: "Water Mist Cooling", desc: "Perimeter nozzles blanket the field in cooling vapor." },
              { icon: Heart, title: "Comfortable Play", desc: "No exhaustion. Play longer, harder, sharper." },
              { icon: Flame, title: "Reduced Heat", desc: "Up to 8°C cooler around the pitch on hot afternoons." },
              { icon: Trophy, title: "Better Performance", desc: "Cooler players focus better and score bigger." },
              { icon: Wind, title: "Refreshing Environment", desc: "A microclimate that spectators love, too." },
              { icon: Award, title: "Summer Tournaments", desc: "Host day-time leagues without the burnout." },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <motion.div whileHover={{ y: -6 }} className="group h-full rounded-3xl glass p-6 transition-all hover:glass-strong hover:glow-emerald">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- About ---------------- */

function About() {
  const perfect = ["Friends & Family", "Corporate Matches", "Night Matches", "Weekend Leagues", "Practice Sessions", "School & College Tournaments"];
  return (
    <section id="about" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <div className="relative">
            <div className="relative overflow-hidden rounded-[2rem] glass-strong shadow-[var(--shadow-elegant)]">
              <img src={aboutImg} alt="Aerial view of FrostPitch cricket turf" loading="lazy" width={1400} height={1000} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="absolute -bottom-8 -right-4 md:-right-8 rounded-3xl glass-strong p-5 w-56 shadow-[var(--shadow-elegant)]"
            >
              <div className="flex items-center gap-2 text-primary"><Star className="h-4 w-4 fill-primary" /><Star className="h-4 w-4 fill-primary" /><Star className="h-4 w-4 fill-primary" /><Star className="h-4 w-4 fill-primary" /><Star className="h-4 w-4 fill-primary" /></div>
              <div className="mt-2 text-sm">Rated <span className="font-bold">4.9</span> by 500+ players in Bhilwara</div>
            </motion.div>
          </div>
        </Reveal>

        <div>
          <Reveal><SectionLabel>About FrostPitch</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold leading-[1.05] tracking-tight">
              A professional cricket experience —<br /><span className="text-emerald-gradient">designed for every player.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              From weekend warriors to corporate teams and school leagues, FrostPitch delivers a stadium-grade box cricket experience in the heart of Bhilwara. International-grade turf, tournament-ready floodlights, and India's first cooling mist system — engineered to make every match memorable.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="mt-8 grid sm:grid-cols-2 gap-2">
              {perfect.map((p, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl glass px-4 py-3">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-primary shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm">{p}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Facilities ---------------- */

function Facilities() {
  const facilities = [
    { icon: Trophy, label: "Professional Turf" },
    { icon: Zap, label: "LED Floodlights" },
    { icon: Droplets, label: "Mist Cooling" },
    { icon: ShowerHead, label: "Changing Rooms" },
    { icon: Coffee, label: "Washrooms" },
    { icon: Wind, label: "Drinking Water" },
    { icon: Car, label: "Parking" },
    { icon: Users, label: "Seating Area" },
    { icon: Award, label: "Equipment Rental" },
    { icon: Sparkles, label: "Scoreboard" },
    { icon: Heart, label: "Spectator Area" },
    { icon: Music, label: "Music System" },
    { icon: Camera, label: "CCTV Security" },
    { icon: Shield, label: "First Aid" },
    { icon: Wifi, label: "Clean Environment" },
  ];
  return (
    <section id="facilities" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal><SectionLabel>Facilities</SectionLabel></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight leading-[1.05]">
                Every detail, <span className="text-emerald-gradient">crafted for champions.</span>
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {facilities.map((f, i) => (
            <Reveal key={i} delay={(i % 5) * 0.05}>
              <motion.div whileHover={{ y: -4 }} className="group flex flex-col items-start gap-3 rounded-2xl glass p-5 h-full transition hover:glass-strong">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary group-hover:bg-primary/25 transition">
                  <f.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium leading-snug">{f.label}</span>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */

function Pricing({ onBook }: { onBook: () => void }) {
  const plans = [
    { name: "Morning", price: "₹799", hint: "6 AM – 12 PM", perks: ["1 hour slot", "Free equipment", "Water refill"] },
    { name: "Afternoon", price: "₹899", hint: "12 PM – 5 PM", perks: ["1 hour slot", "Mist cooling on", "Free equipment"] },
    { name: "Evening", price: "₹1,199", hint: "5 PM – 9 PM", perks: ["1 hour slot", "Floodlights", "Music system"], popular: true },
    { name: "Night", price: "₹1,499", hint: "9 PM – 2 AM", perks: ["1 hour slot", "Full floodlights", "Music + Scoreboard"] },
    { name: "Weekend", price: "₹1,599", hint: "Sat & Sun", perks: ["Priority booking", "Extended slots", "Photography"] },
    { name: "Tournament", price: "Custom", hint: "Full-day / Multi-day", perks: ["Trophies & scoreboard", "Umpire optional", "Live-stream setup"] },
    { name: "Corporate", price: "₹9,999", hint: "Team packages", perks: ["3-hour block", "Refreshments", "Photography"] },
    { name: "Practice", price: "₹499", hint: "Off-peak drills", perks: ["30 min slot", "Bowling machine", "Coaching add-on"] },
  ];
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal><SectionLabel>Pricing</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
              Transparent. <span className="text-emerald-gradient">Fair. Premium.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-4 text-muted-foreground">Pick a slot that fits your team. All prices include mist cooling during summer months.</p>
          </Reveal>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p, i) => (
            <Reveal key={i} delay={(i % 4) * 0.06}>
              <motion.div whileHover={{ y: -8 }} className={`relative h-full rounded-3xl p-6 transition ${p.popular ? "glass-strong glow-emerald border-primary/40" : "glass hover:glass-strong"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground shadow-[var(--shadow-glow)]">
                    Most Popular
                  </div>
                )}
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{p.price}</span>
                  <span className="text-xs text-muted-foreground">/ hr</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.hint}</div>
                <ul className="mt-5 space-y-2">
                  {p.perks.map((perk, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {perk}
                    </li>
                  ))}
                </ul>
                <Button onClick={onBook} className={`mt-6 w-full rounded-full ${p.popular ? "bg-primary text-primary-foreground" : "bg-white/5 hover:bg-white/10 text-foreground"}`}>
                  Book slot
                </Button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Gallery (masonry) ---------------- */

function Gallery() {
  const images = [
    { src: g1, alt: "Batsman in night match", h: "row-span-2" },
    { src: g4, alt: "Cricket turf with mist cooling system", h: "" },
    { src: g2, alt: "Cricket ball on turf with water droplets", h: "" },
    { src: g3, alt: "Night cricket match under floodlights", h: "row-span-2" },
    { src: aboutImg, alt: "Aerial view of turf", h: "" },
    { src: mistImg, alt: "Mist cooling in action", h: "" },
  ];
  return (
    <section id="gallery" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Reveal><SectionLabel>Gallery</SectionLabel></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
                Moments from <span className="text-emerald-gradient">the pitch.</span>
              </h2>
            </Reveal>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 auto-rows-[220px] gap-3 md:gap-4">
          {images.map((img, i) => (
            <Reveal key={i} delay={(i % 3) * 0.06}>
              <motion.div whileHover={{ scale: 0.98 }} className={`group relative overflow-hidden rounded-3xl glass ${img.h} h-full`}>
                <img src={img.src} alt={img.alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition">
                  <div className="text-xs uppercase tracking-widest text-primary">FrostPitch</div>
                  <div className="text-sm font-medium">{img.alt}</div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Why Choose Us ---------------- */

function WhyUs() {
  const items = [
    { icon: Trophy, title: "Professional Turf", desc: "International-grade artificial grass with true bounce." },
    { icon: Droplets, title: "Cooling Mist Tech", desc: "The only turf in Bhilwara with perimeter cooling." },
    { icon: Zap, title: "Bright Floodlights", desc: "Zero-shadow LED lighting for perfect night matches." },
    { icon: Award, title: "Affordable Pricing", desc: "Premium experience without the premium markup." },
    { icon: CalendarIcon, title: "Online Booking", desc: "Instant slot booking. No queues, no hassle." },
    { icon: Car, title: "Easy Parking", desc: "Free, secure parking for players and spectators." },
    { icon: Sparkles, title: "Premium Maintenance", desc: "Deep-cleaned and rolled before every match." },
    { icon: Heart, title: "Family Friendly", desc: "Safe, well-lit spectator area for every guest." },
    { icon: Users, title: "All Skill Levels", desc: "From beginners to corporate warriors and pros." },
  ];
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <Reveal><SectionLabel>Why FrostPitch</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
              Nine reasons Bhilwara <span className="text-emerald-gradient">picks us.</span>
            </h2>
          </Reveal>
        </div>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((f, i) => (
            <Reveal key={i} delay={(i % 3) * 0.06}>
              <motion.div whileHover={{ y: -6 }} className="group h-full rounded-3xl glass p-7 transition hover:glass-strong">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary transition group-hover:scale-110">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Testimonials ---------------- */

function Testimonials() {
  const reviews = [
    { name: "Rohan S.", role: "Weekend Captain", text: "The mist system is a game changer. Played a 2 PM match in June and it felt like early evening. FrostPitch is on another level.", stars: 5 },
    { name: "Priya M.", role: "HR Lead — Reliance", text: "Booked FrostPitch for our corporate league. Clean, professional, and the team took care of everything. Coming back next quarter.", stars: 5 },
    { name: "Arjun K.", role: "College Team", text: "Best turf in Bhilwara — period. True bounce, zero shadow under the lights, and the changing rooms are spotless.", stars: 5 },
    { name: "Vikram T.", role: "Local Player", text: "Booking online was instant. Slot was ready, equipment was fresh, and the vibe was pure IPL. Ten out of ten.", stars: 5 },
    { name: "Neha J.", role: "Tournament Organizer", text: "Ran a 16-team weekend tournament — the scoreboard, music, and mist made it feel like a stadium event. Players loved it.", stars: 5 },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % reviews.length), 5000); return () => clearInterval(t); }, [reviews.length]);
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal><SectionLabel>Testimonials</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
              Loved by <span className="text-emerald-gradient">players.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 relative">
          <div className="relative min-h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl glass-strong p-8 md:p-12 max-w-3xl mx-auto text-center"
              >
                <div className="flex justify-center gap-1 text-primary">
                  {Array.from({ length: reviews[idx].stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-primary" />)}
                </div>
                <p className="mt-6 text-lg md:text-xl leading-relaxed font-light">"{reviews[idx].text}"</p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/15 text-primary font-semibold">
                    {reviews[idx].name[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{reviews[idx].name}</div>
                    <div className="text-xs text-muted-foreground">{reviews[idx].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => setIdx(i => (i - 1 + reviews.length) % reviews.length)} className="grid h-10 w-10 place-items-center rounded-full glass hover:glass-strong" aria-label="Previous">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-border"}`} aria-label={`Go to review ${i + 1}`} />
              ))}
            </div>
            <button onClick={() => setIdx(i => (i + 1) % reviews.length)} className="grid h-10 w-10 place-items-center rounded-full glass hover:glass-strong" aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Tournaments ---------------- */

function Tournaments({ onBook }: { onBook: () => void }) {
  const events = [
    { tag: "Weekend Cup", title: "FrostPitch Weekend Championship", date: "Every Saturday", prize: "₹25,000 prize pool", spots: "8 teams" },
    { tag: "Corporate", title: "Bhilwara Corporate League", date: "Sep 15 – Oct 20", prize: "Trophy + Media coverage", spots: "12 teams" },
    { tag: "School", title: "Inter-School Cricket Cup", date: "Nov 5 – Nov 12", prize: "Individual trophies", spots: "16 teams" },
    { tag: "Summer", title: "Cool Nights Mist League", date: "Peak Summer 2026", prize: "₹50,000 prize pool", spots: "10 teams" },
  ];
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal><SectionLabel>Tournaments</SectionLabel></Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
                Compete under <span className="text-emerald-gradient">the lights.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal>
            <Button onClick={onBook} variant="outline" className="rounded-full glass border-border">
              Register your team <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Reveal>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {events.map((e, i) => (
            <Reveal key={i} delay={(i % 2) * 0.06}>
              <motion.div whileHover={{ y: -6 }} className="group rounded-3xl glass p-6 md:p-8 h-full flex flex-col justify-between transition hover:glass-strong">
                <div>
                  <div className="inline-flex rounded-full bg-primary/15 text-primary px-3 py-1 text-[10px] uppercase tracking-widest font-semibold">{e.tag}</div>
                  <h3 className="mt-4 text-xl md:text-2xl font-semibold tracking-tight">{e.title}</h3>
                  <div className="mt-3 text-sm text-muted-foreground">{e.date} · {e.spots}</div>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4 pt-6 border-t border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Prize</div>
                    <div className="text-sm font-medium">{e.prize}</div>
                  </div>
                  <Button onClick={onBook} size="sm" className="rounded-full bg-primary text-primary-foreground">Register</Button>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

function FAQ() {
  const faqs = [
    { q: "How do I book a slot?", a: "Click Book Now anywhere on the site. Pick a date, time, and duration — you'll get instant confirmation via SMS and email." },
    { q: "What's your cancellation policy?", a: "Free cancellation up to 12 hours before your slot. Cancellations after that receive a 50% credit toward a future booking." },
    { q: "Is equipment provided?", a: "Yes. Bats, tennis balls, and helmets are included in every booking. Personal equipment is welcome." },
    { q: "Is parking available?", a: "Free secure parking for up to 20 vehicles is available on-site, staffed after 6 PM." },
    { q: "Do you serve food?", a: "We stock energy drinks, packaged snacks, and cold water. Full catering can be arranged for tournaments and corporate bookings." },
    { q: "Are changing rooms available?", a: "Two clean, air-conditioned changing rooms with showers are open to every booking." },
    { q: "Can we play at night?", a: "Absolutely. Our LED floodlights make late-night matches feel like day. Slots run until 2 AM." },
    { q: "How does the cooling mist system work?", a: "Fine-nozzle sprayers along the perimeter release evaporative mist that instantly cools the air by up to 8°C — without wetting the turf or the ball." },
  ];
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <Reveal><SectionLabel>FAQ</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
              Questions, <span className="text-emerald-gradient">answered.</span>
            </h2>
          </Reveal>
        </div>
        <Reveal>
          <div className="mt-12 rounded-3xl glass-strong p-2 md:p-4">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border last:border-0">
                  <AccordionTrigger className="px-4 py-5 text-left text-base font-medium hover:no-underline hover:text-primary">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Contact ---------------- */

function Contact() {
  return (
    <section id="contact" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <Reveal><SectionLabel>Get in touch</SectionLabel></Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.5vw,3.75rem)] font-bold tracking-tight">
              Come visit <span className="text-emerald-gradient">FrostPitch.</span>
            </h2>
          </Reveal>
        </div>

        <div className="mt-14 grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 rounded-3xl glass overflow-hidden min-h-[420px] relative">
            <iframe
              title="FrostPitch Turf on map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.60%2C25.32%2C74.68%2C25.38&layer=mapnik&marker=25.3463%2C74.6364"
              className="absolute inset-0 h-full w-full grayscale-[0.4] contrast-125"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 60%, oklch(0.14 0.02 165 / 0.7))" }} />
            <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
              <div className="rounded-2xl glass-strong p-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/20 text-primary shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">FrostPitch Turf, Bhilwara</div>
                  <div className="text-xs text-muted-foreground truncate">RIICO Industrial Area, Bhilwara, Rajasthan 311001</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {[
              { icon: Phone, label: "Call", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", href: "https://wa.me/919876543210" },
              { icon: Mail, label: "Email", value: "play@frostpitch.in", href: "mailto:play@frostpitch.in" },
              { icon: Clock, label: "Working Hours", value: "6:00 AM – 2:00 AM · All days", href: "#" },
            ].map((c, i) => (
              <a key={i} href={c.href} className="group flex items-center gap-4 rounded-2xl glass p-5 hover:glass-strong transition">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary shrink-0 group-hover:scale-110 transition">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{c.label}</div>
                  <div className="text-sm font-medium truncate">{c.value}</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              {[
                { icon: Instagram, href: "#" },
                { icon: Facebook, href: "#" },
                { icon: MessageCircle, href: "https://wa.me/919876543210" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="grid h-11 w-11 place-items-center rounded-2xl glass hover:glass-strong hover:text-primary transition" aria-label="Social">
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */

function Footer() {
  return (
    <footer className="relative border-t border-border pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/20 glow-emerald">
                <Snowflake className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-base font-bold tracking-wider">FROSTPITCH</div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Turf · Bhilwara</div>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm text-muted-foreground leading-relaxed">
              Bhilwara's most premium box cricket experience — with India's exclusive water mist cooling system. Play cool, play like champions.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Quick Links</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#facilities" className="hover:text-primary transition">Facilities</a></li>
              <li><a href="#pricing" className="hover:text-primary transition">Pricing</a></li>
              <li><a href="#gallery" className="hover:text-primary transition">Gallery</a></li>
              <li><a href="#contact" className="hover:text-primary transition">Booking</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Company</div>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="#" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition">Terms of Use</a></li>
              <li><a href="#" className="hover:text-primary transition">Refund Policy</a></li>
            </ul>
            <div className="mt-5 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-xl glass hover:text-primary transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-xl glass hover:text-primary transition"><Facebook className="h-4 w-4" /></a>
              <a href="https://wa.me/919876543210" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-xl glass hover:text-primary transition"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} FrostPitch Turf. All rights reserved.</div>
          <div>Crafted in Bhilwara · Made for champions.</div>
        </div>
      </div>
    </footer>
  );
}

/* ---------------- Booking Dialog ---------------- */

function BookingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [confirmed, setConfirmed] = useState<null | { name: string; date: string; time: string }>(null);
  const times = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00"];
  const bookedTimes = ["10:00", "18:00"];

  const [form, setForm] = useState({ date: "", time: "", duration: "1", name: "", phone: "", email: "", team: "", notes: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.date || !form.time) {
      toast.error("Please fill required fields");
      return;
    }
    // TODO: connect to booking API (MongoDB / Razorpay / auth)
    setConfirmed({ name: form.name, date: form.date, time: form.time });
    toast.success("Booking request sent!");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setConfirmed(null); }}>
      <DialogContent className="max-w-2xl glass-strong border-border">
        {!confirmed ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Book your slot</DialogTitle>
              <DialogDescription>Instant confirmation. Cool play guaranteed.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4 mt-2">
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Date *</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 bg-white/5 border-border" required />
                </div>
                <div>
                  <Label className="text-xs">Duration</Label>
                  <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1.5 h-9 w-full rounded-md bg-white/5 border border-border px-3 text-sm">
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Team name</Label>
                  <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Optional" className="mt-1.5 bg-white/5 border-border" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Available slots *</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {times.map((t) => {
                    const booked = bookedTimes.includes(t);
                    const active = form.time === t;
                    return (
                      <button
                        key={t} type="button" disabled={booked}
                        onClick={() => setForm({ ...form, time: t })}
                        className={`rounded-full px-3.5 py-1.5 text-xs border transition ${
                          booked ? "opacity-40 cursor-not-allowed border-border line-through" :
                          active ? "bg-primary text-primary-foreground border-primary shadow-[var(--shadow-glow)]" :
                          "border-border hover:border-primary/50"
                        }`}
                      >{t}</button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Player name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-white/5 border-border" required />
                </div>
                <div>
                  <Label className="text-xs">Phone number *</Label>
                  <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 bg-white/5 border-border" required />
                </div>
              </div>
              <div>
                <Label className="text-xs">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-white/5 border-border" />
              </div>
              <div>
                <Label className="text-xs">Special requests</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 bg-white/5 border-border" placeholder="Music, scoreboard, tournament setup..." />
              </div>

              <DialogFooter className="mt-2">
                <Button type="submit" className="rounded-full bg-primary text-primary-foreground w-full sm:w-auto shadow-[var(--shadow-glow)]">
                  Confirm booking <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground glow-emerald">
              <Check className="h-8 w-8" />
            </motion.div>
            <h3 className="mt-5 font-display text-2xl font-bold">Booking confirmed!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              See you on <span className="text-foreground font-medium">{confirmed.date}</span> at{" "}
              <span className="text-foreground font-medium">{confirmed.time}</span>, {confirmed.name}.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Confirmation SMS on the way.</p>
            <Button onClick={() => onOpenChange(false)} className="mt-6 rounded-full bg-primary text-primary-foreground">Done</Button>
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
          <Button onClick={onBook} className="w-full rounded-full bg-primary text-primary-foreground py-6 shadow-[var(--shadow-glow)] font-semibold">
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
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-0.5 origin-left bg-gradient-to-r from-primary to-primary-glow z-[60]" />;
}

/* ---------------- Landing Page ---------------- */

function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [bookOpen, setBookOpen] = useState(false);
  const openBook = () => setBookOpen(true);

  return (
    <>
      <AnimatePresence>{loading && <Loader onDone={() => setLoading(false)} />}</AnimatePresence>
      <Cursor />
      <ScrollProgress />

      <div className="relative min-h-screen bg-background text-foreground">
        <Nav onBook={openBook} />
        <main>
          <Hero onBook={openBook} />
          <CoolingFeature />
          <About />
          <Facilities />
          <Pricing onBook={openBook} />
          <Gallery />
          <WhyUs />
          <Testimonials />
          <Tournaments onBook={openBook} />
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
