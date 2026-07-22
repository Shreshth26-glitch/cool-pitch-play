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
      style={{ background: "radial-gradient(circle, oklch(0.88 0.15 82 / 0.6), transparent 70%)", boxShadow: "0 0 30px oklch(0.80 0.14 78 / 0.6)" }}
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
          DON BOSCO
        </motion.div>
        <div className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">Turf · Bhilwara</div>
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
    { href: "#about", label: "About" },
    { href: "#facilities", label: "Facilities" },
    { href: "#pricing", label: "Pricing" },
    { href: "#gallery", label: "Gallery" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <motion.header
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.4 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled ? "bg-card/95 border-b border-border py-4 shadow-sm" : "bg-transparent py-6"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 group">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 13l4 4L20 7" />
            </svg>
            <div className="leading-none">
              <div className="text-base font-black tracking-wider text-foreground uppercase group-hover:text-emerald-500 transition duration-200">DON BOSCO</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold mt-0.5">Turf</div>
            </div>
          </a>
          <nav className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <a key={l.label} href={l.href} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-emerald-500 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {/* Desktop Auth Links */}
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings">
                  <Button size="sm" variant="outline" className="rounded-full border-border text-foreground hover:bg-muted font-semibold hidden md:inline-flex">
                    My Bookings
                  </Button>
                </Link>
                <Button onClick={logout} size="sm" variant="ghost" className="rounded-full hover:bg-muted text-muted-foreground hover:text-rose-500 font-semibold hidden md:inline-flex">
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="ghost" className="rounded-full hover:bg-muted text-foreground font-semibold hidden md:inline-flex">
                  Login
                </Button>
              </Link>
            )}

            <Button onClick={onBook} size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] tracking-wider uppercase px-5 py-2.5 hidden sm:inline-flex shadow-sm transition duration-200">
              Book Now
            </Button>
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="lg:hidden grid h-9 w-9 place-items-center rounded-full border border-border bg-card">
              <div className="flex flex-col gap-1">
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "translate-y-1 rotate-45" : ""}`} />
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-4 bg-foreground transition-all ${open ? "-translate-y-1 -rotate-45" : ""}`} />
              </div>
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="lg:hidden mt-4 rounded-2xl bg-card border border-border p-4 shadow-lg space-y-1"
            >
              {links.map(l => (
                <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-foreground hover:bg-muted rounded-xl transition">
                  {l.label}
                </a>
              ))}
              
              {/* Mobile Auth Links */}
              {isAuthenticated ? (
                <>
                  <Link to="/my-bookings" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-primary hover:bg-muted rounded-xl transition">
                    My Bookings
                  </Link>
                  <button onClick={() => { setOpen(false); logout(); }} className="block w-full text-left py-2.5 px-3 text-sm font-semibold text-rose-500 hover:bg-muted rounded-xl transition">
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="block py-2.5 px-3 text-sm font-semibold text-primary hover:bg-muted rounded-xl transition">
                  Login / Sign Up
                </Link>
              )}

              <Button onClick={() => { setOpen(false); onBook(); }} className="mt-3 w-full rounded-full bg-primary hover:bg-primary/95 text-white">Book Now</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onBook }: { onBook: () => void }) {
  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg} alt="Don Bosco Premium Cricket Turf"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay to match contrast */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-6 w-full text-center mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center justify-center space-y-8"
        >
          {/* Spaced, elegant serif headline */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-medium text-white tracking-[0.4em] uppercase">
            Where Champions Play
          </h1>
          
          <div>
            <Button
              onClick={onBook}
              size="lg"
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest px-8 py-5 shadow-lg transition duration-200 flex items-center gap-2 hover:scale-[1.02]"
            >
              <CalendarIcon className="h-4.5 w-4.5" /> Book Now
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator (vertical capsule pill) */}
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
    <section id="features" className="relative py-28 md:py-36 bg-card border-y border-border overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-5 space-y-6"
          >
            <SectionLabel>Signature Feature</SectionLabel>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Stay Cool.<br />Play Longer.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Bhilwara summers hit hard. Our proprietary perimeter mist system releases ultra-fine, evaporative droplets that instantly drop the ambient temperature around the pitch by up to 8°C—without wetting the turf or the ball.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Enjoy comfortable gameplay during the hottest summer days. No exhaustion, no slippery grips, just pure game time.
            </p>
            <div className="pt-4">
              <Button onClick={onBook} className="rounded-full bg-primary hover:bg-primary/95 text-white px-8 py-6 text-base font-semibold shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
                Book Cool Slot <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Benefits Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 grid sm:grid-cols-2 gap-6 items-start"
          >
            {/* Image */}
            <div className="sm:col-span-2 relative aspect-[16/10] overflow-hidden rounded-2xl border border-border shadow-sm bg-background">
              <img src={mistImg} alt="Water mist cooling system over cricket turf" className="h-full w-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-full px-4 py-2 text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Snowflake className="h-3.5 w-3.5 text-primary" /> Active: −8°C ambient cooling
              </div>
            </div>

            {/* Benefits List */}
            {[
              { icon: Droplets, title: "Water Mist Cooling", desc: "Nozzle sprayers blanket the boundary in a cooling dry vapor." },
              { icon: Heart, title: "Beat the Heat", desc: "Reduces fatigue, allowing longer matches and safer play." },
              { icon: Wind, title: "Microclimate Control", desc: "Creates a pleasant match environment for players and guests." },
              { icon: Trophy, title: "Better Performance", desc: "Cooler players maintain optimal concentration and energy." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl bg-background border border-border hover:shadow-sm transition duration-300">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{f.title}</h4>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
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
    <section id="about" className="relative py-28 md:py-36 bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-6 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left: Image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-2xl border border-border shadow-sm w-full"
        >
          <img src={aboutImg} alt="Aerial view of Don Bosco cricket turf" className="h-full w-full object-cover" />
        </motion.div>

        {/* Right: Story */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6"
        >
          <SectionLabel>About Don Bosco</SectionLabel>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
            A professional stadium vibe, <span className="text-primary">crafted for everyone.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            From casual weekend matches with friends to highly competitive corporate leagues, Don Bosco Turf delivers a premium box cricket experience in the heart of Bhilwara.
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            Our facility has been engineered to provide international turf standards, optimal non-glare floodlighting, clean amenities, and a comfortable atmosphere for both players and spectators.
          </p>
          
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {keyPoints.map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-[0_2px_4px_rgba(0,0,0,0.01)]">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium text-foreground">{p}</span>
              </div>
            ))}
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
    <section id="facilities" className="relative py-28 md:py-36 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Facilities</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Stadium standard.<br /><span className="text-primary">Every single slot.</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            We provide top-of-the-line amenities to ensure your box cricket game is uninterrupted and premium.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {facilities.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="group p-6 bg-background border border-border rounded-2xl hover:shadow-md transition duration-300"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition duration-300">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
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
    <section id="pricing" className="relative py-28 md:py-36 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Simple Pricing</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            One flat rate. <span className="text-primary">No hidden fees.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Play anytime, day or night. We keep our pricing direct, transparent, and standard.
          </p>
        </div>

        <div className="max-w-lg mx-auto overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="relative rounded-2xl bg-card border border-border shadow-md p-8 md:p-10 text-center"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Standard Slot
            </div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">All Hours · All Days</div>
            <div className="mt-6 flex items-baseline justify-center gap-1">
              <span className="text-6xl font-bold tracking-tight text-foreground">₹800</span>
              <span className="text-sm text-muted-foreground">/ hr</span>
            </div>
            
            <ul className="mt-8 space-y-4 text-left max-w-xs mx-auto">
              {perks.map((perk, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-foreground">
                  <div className="grid h-5.5 w-5.5 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {perk}
                </li>
              ))}
            </ul>
            
            <Button
              onClick={onBook}
              size="lg"
              className="mt-8 w-full rounded-full bg-primary hover:bg-primary/95 text-white py-6 shadow-sm"
            >
              Book Your Slot <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
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
    <section id="gallery" className="relative py-28 md:py-36 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Turf Gallery</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Moments from <span className="text-primary">the pitch.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="group relative overflow-hidden rounded-2xl border border-border shadow-sm bg-background aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                <span className="text-[10px] uppercase font-bold tracking-wider text-primary">Don Bosco</span>
                <p className="text-sm font-semibold text-white mt-0.5">{img.alt}</p>
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
    <section className="relative py-28 md:py-36 bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Why Choose Us</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Designed for <span className="text-primary">perfect play.</span>
          </h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-hidden">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: "easeOut" }}
              className="p-6 bg-card border border-border rounded-2xl hover:shadow-md transition duration-300"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
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
    { name: "Priya Mehta", role: "Corporate Team Captain", text: "Booked Don Bosco Turf for our office league matches. Clean facilities, well-lit parking, and extremely professional staff. The automatic booking confirmation made coordination seamless.", stars: 5 },
    { name: "Arjun Kasliwal", role: "Club Player", text: "The turf bounce is highly consistent, and the LED floodlighting setup has zero shadows. We have scheduled weekly night slots here, and it is worth every rupee.", stars: 5 },
    { name: "Vikram Toshniwal", role: "Weekend Warrior", text: "Incredibly premium turf and exceptionally well-maintained. Clean changing rooms and showers, chilled drinking water, and standard pricing make this the premier choice.", stars: 5 }
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(i => (i + 1) % reviews.length), 6000); return () => clearInterval(t); }, [reviews.length]);
  return (
    <section className="relative py-28 md:py-36 bg-card border-y border-border">
      <div className="mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <SectionLabel>Player Reviews</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Loved by <span className="text-primary">players.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
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
                className="rounded-2xl border border-border bg-background p-8 md:p-10 text-center shadow-sm"
              >
                <div className="flex justify-center gap-1">
                  {Array.from({ length: reviews[idx].stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="mt-6 text-base md:text-lg text-foreground italic leading-relaxed font-normal">
                  "{reviews[idx].text}"
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {reviews[idx].name[0]}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-foreground flex items-center gap-1">
                      {reviews[idx].name}
                      <span className="inline-block text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-1.5 py-0.2 rounded-full">
                        Verified Player
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">{reviews[idx].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="mt-8 flex justify-center gap-3">
            <button
              onClick={() => setIdx(i => (i - 1 + reviews.length) % reviews.length)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-background transition"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-primary" : "w-1.5 bg-border"}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIdx(i => (i + 1) % reviews.length)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border hover:bg-background transition"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
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
    <section className="relative py-28 md:py-36 bg-background">
      <div className="mx-auto max-w-3xl px-4 md:px-6">
        <div className="text-center mb-12">
          <SectionLabel>FAQ</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Questions? <span className="text-primary">Answered.</span>
          </h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="rounded-2xl bg-card border border-border p-4 shadow-sm"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-border last:border-0">
                <AccordionTrigger className="px-4 py-4 text-left text-base font-semibold hover:no-underline hover:text-primary transition duration-200">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
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
    <section id="contact" className="relative py-28 md:py-36 bg-card border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <SectionLabel>Contact Details</SectionLabel>
          <h2 className="mt-4 font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            Come visit <span className="text-primary">Don Bosco Turf.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Map Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-3 rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px] relative w-full"
          >
            <iframe
              title="Don Bosco Turf Map"
              src="https://www.openstreetmap.org/export/embed.html?bbox=74.60%2C25.32%2C74.68%2C25.38&layer=mapnik&marker=25.3463%2C74.6364"
              className="absolute inset-0 h-full w-full grayscale-[0.2] contrast-100"
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="rounded-xl bg-card border border-border p-4 flex items-center gap-3 shadow-sm">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">Don Bosco Turf, Bhilwara</div>
                  <div className="text-xs text-muted-foreground">RIICO Industrial Area, Bhilwara, Rajasthan 311001</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details Column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-2 space-y-4"
          >
            {[
              { icon: Phone, label: "Call Support", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: MessageCircle, label: "WhatsApp Chat", value: "Chat with us on WhatsApp", href: "https://wa.me/919876543210" },
              { icon: Mail, label: "Email Support", value: "play@donboscoturf.in", href: "mailto:play@donboscoturf.in" },
              { icon: Clock, label: "Operating Hours", value: "6:00 AM – 2:00 AM · All Days", href: "#" },
            ].map((c, i) => (
              <a
                key={i} href={c.href}
                className="group flex items-center gap-4 rounded-2xl bg-background border border-border p-5 hover:shadow-sm transition duration-300"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0 transition duration-300">
                  <c.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">{c.label}</span>
                  <div className="text-sm font-medium text-foreground truncate mt-0.5">{c.value}</div>
                </div>
                <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary transition" />
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
    <footer className="relative border-t border-border bg-card pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-emerald-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 13l4 4L20 7" />
              </svg>
              <div>
                <div className="text-sm font-bold tracking-wider text-foreground">DON BOSCO</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Turf · Bhilwara</div>
              </div>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Bhilwara's premier box cricket experience, featuring India's exclusive water mist cooling system. Play cool, play standard.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">Quick Links</div>
            <ul className="mt-4 space-y-2.5 text-sm font-medium">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition">Cooling</a></li>
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition">About Us</a></li>
              <li><a href="#facilities" className="text-muted-foreground hover:text-primary transition">Facilities</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition">Pricing</a></li>
              <li><a href="#gallery" className="text-muted-foreground hover:text-primary transition">Gallery</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-foreground">Contact & Socials</div>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground font-medium">
              <li>RIICO Industrial Area, Bhilwara</li>
              <li>+91 98765 43210</li>
              <li>play@donboscoturf.in</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted text-foreground hover:text-primary transition"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted text-foreground hover:text-primary transition"><Facebook className="h-4 w-4" /></a>
              <a href="https://wa.me/919876543210" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-muted text-foreground hover:text-primary transition"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
        </div>
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Don Bosco Turf. All rights reserved.</div>
          <div>Crafted in Bhilwara · Designed for Champions.</div>
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
      <DialogContent className="max-w-2xl bg-card border border-border p-6 shadow-xl text-foreground max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {!confirmed ? (
          showPaymentMock ? (
            <div className="space-y-6 mt-4">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-emerald-500" /> Secure Checkout Simulation
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Simulated secure payments portal for Don Bosco Turf.
                </DialogDescription>
              </DialogHeader>

              {/* Total Amount card */}
              <div className="bg-background border border-border rounded-2xl p-4 flex justify-between items-center shadow-[0_2px_8px_rgba(0,0,0,0.1)]">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Amount Due</span>
                  <p className="text-xl font-black text-foreground mt-0.5">
                    ₹{totalAmount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    ({form.duration} hour{Number(form.duration) > 1 ? "s" : ""} @ ₹{hourlyRate.toLocaleString()}/hr)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    PENDING AUTH
                  </span>
                </div>
              </div>

              {/* Method selection tabs */}
              <div className="flex gap-2 p-1 bg-background/50 border border-border rounded-xl">
                <button
                  type="button"
                  onClick={() => setPaymentType("upi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
                    paymentType === "upi"
                      ? "bg-card border border-border text-foreground shadow-sm font-bold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <QrCode className="h-4 w-4" /> UPI QR Code
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("card")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-lg transition ${
                    paymentType === "card"
                      ? "bg-card border border-border text-foreground shadow-sm font-bold text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CreditCard className="h-4 w-4" /> Card Payment
                </button>
              </div>

              {/* Tab content */}
              {paymentType === "upi" ? (
                <div className="flex flex-col items-center justify-center border border-border border-dashed rounded-2xl p-6 bg-background/30">
                  <div className="w-36 h-36 border border-border bg-white rounded-xl p-2.5 flex flex-col justify-between items-center shadow-inner relative overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 w-full h-full opacity-90">
                      <div className="bg-black rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                      <div className="bg-gray-300 rounded" />
                      <div className="bg-black rounded" />
                    </div>
                    <div className="absolute inset-0 m-auto h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white border-2 border-white shadow shadow-black/25">
                      <Check className="h-5 w-5 font-bold" />
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-4 max-w-xs">
                    Scan this QR code from any UPI app (GPay, PhonePe, Paytm) to complete payment simulation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 border border-border border-dashed rounded-2xl p-5 bg-background/30">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground">Card Number</Label>
                    <Input
                      type="text"
                      maxLength={16}
                      placeholder="4111 2222 3333 4444"
                      value={mockCard.number}
                      onChange={(e) => setMockCard({ ...mockCard, number: e.target.value.replace(/[^0-9]/g, "") })}
                      className="bg-background border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-muted-foreground">Expiry Date</Label>
                      <Input
                        type="text"
                        maxLength={5}
                        placeholder="MM/YY"
                        value={mockCard.expiry}
                        onChange={(e) => setMockCard({ ...mockCard, expiry: e.target.value })}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-muted-foreground">CVV</Label>
                      <Input
                        type="password"
                        maxLength={3}
                        placeholder="***"
                        value={mockCard.cvv}
                        onChange={(e) => setMockCard({ ...mockCard, cvv: e.target.value.replace(/[^0-9]/g, "") })}
                        className="bg-background border-border"
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
                  className="rounded-full hover:bg-muted text-foreground text-xs py-4 order-2 sm:order-1 font-semibold flex-1"
                >
                  Go Back
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  onClick={submit}
                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-4 shadow-md order-1 sm:order-2 flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing..." : "Simulate Payment Success"} <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl font-bold text-foreground">Book Your Slot</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm mt-1">
                  Instant SMS and email confirmations. Play on Bhilwara's coolest turf.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={submit} className="grid gap-5 mt-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Date *</Label>
                    <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg [color-scheme:dark]" required />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-foreground">Duration</Label>
                    <select value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="mt-1.5 h-10 w-full rounded-lg bg-background border border-border px-3 text-sm text-foreground focus:ring-1 focus:ring-primary focus:border-primary">
                      <option value="1" className="bg-[#0B0F19] text-white">1 hour</option>
                      <option value="2" className="bg-[#0B0F19] text-white">2 hours</option>
                      <option value="3" className="bg-[#0B0F19] text-white">3 hours</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-foreground">Team Name</Label>
                    <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="Optional" className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg" />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-bold text-foreground">Available slots *</Label>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {times.map((t) => {
                      const booked = bookedTimes.includes(t);
                      const active = form.time === t;
                      return (
                        <button
                          key={t} type="button" disabled={booked}
                          onClick={() => setForm({ ...form, time: t })}
                          className={`rounded-full px-4 py-2 text-xs font-semibold border transition-all ${
                            booked ? "opacity-35 cursor-not-allowed border-border line-through text-muted-foreground" :
                            active ? "bg-primary text-white border-primary shadow-sm" :
                            "bg-background border-border text-foreground hover:border-primary/60"
                          }`}
                        >{t}</button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-foreground">Player Name *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg" required />
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-foreground">Phone number *</Label>
                    <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg" required />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground">Email Address</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg" />
                </div>
                <div>
                  <Label className="text-xs font-bold text-foreground">Special Requests</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5 bg-background border-border text-foreground hover:border-primary/50 focus:ring-1 focus:ring-primary focus:border-primary rounded-lg resize-none h-20" placeholder="e.g. audio system requested, tournament scoreboard setup..." />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 border-t border-border pt-4 mt-2">
                  <Label className="text-xs font-bold text-foreground">Select Payment Method *</Label>
                  <div className="grid sm:grid-cols-2 gap-3 mt-1.5">
                    <button
                      key="pay-court"
                      type="button"
                      onClick={() => setPaymentMethod("court")}
                      className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between h-20 ${
                        paymentMethod === "court"
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "court" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        Pay at Court
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-normal mt-1">Pay with Cash/UPI on-site when you play.</span>
                    </button>
                    <button
                      key="pay-online"
                      type="button"
                      onClick={() => setPaymentMethod("online")}
                      className={`rounded-2xl p-4 text-left border transition-all flex flex-col justify-between h-20 ${
                        paymentMethod === "online"
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30"
                          : "bg-background border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${paymentMethod === "online" ? "bg-primary" : "bg-muted-foreground/30"}`} />
                        Pay Online
                      </span>
                      <span className="text-[10px] text-muted-foreground leading-normal mt-1">Pre-authorize & pay securely right now.</span>
                    </button>
                  </div>
                </div>

                <DialogFooter className="mt-4 pt-4 border-t border-border">
                  <Button type="submit" disabled={isSubmitting} className="rounded-full bg-primary hover:bg-primary/95 text-white w-full sm:w-auto px-6 py-5 font-semibold">
                    {paymentMethod === "online" ? "Proceed to Checkout" : "Confirm Booking"} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </form>
            </>
          )
        ) : (
          <div className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
              className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary">
              <Check className="h-6 w-6" />
            </motion.div>
            <h3 className="mt-5 font-display text-2xl font-bold text-foreground">Booking Confirmed!</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We look forward to seeing you on <span className="text-foreground font-semibold">{confirmed.date}</span> at{" "}
              <span className="text-foreground font-semibold">{confirmed.time}</span>, {confirmed.name}.
            </p>
            <p className="mt-2 text-xs font-bold text-primary flex items-center justify-center gap-1">
              <Check className="h-4 w-4" /> 
              {confirmed.paymentMethod === "online" 
                ? "Paid Online · Slot fully confirmed" 
                : "Pay at Court · Unpaid (Pay on-site)"}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">A confirmation SMS has been dispatched to your mobile.</p>
            <Button onClick={() => { onOpenChange(false); setConfirmed(null); setShowPaymentMock(false); }} className="mt-8 rounded-full bg-primary hover:bg-primary/95 text-white px-8 font-semibold">Done</Button>
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
          <Button onClick={onBook} className="w-full rounded-full bg-primary hover:bg-primary/95 text-white py-6 shadow-md font-semibold">
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
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-0.5 origin-left bg-primary z-[60]" />;
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
