import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export function SplashCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const mouseRef = useRef({ x: -100, y: -100, targetX: -100, targetY: -100 });
  const isHoveringRef = useRef(false);
  const isInteractiveRef = useRef(false);
  const isInputRef = useRef(false);

  // Palette matching frostPitch: Iris Violet, Hot Pink, Cyan, White, Yellow
  const colors = ["#948ae3", "#fc618d", "#69bee2", "#ffffff", "#f8e67a"];

  useEffect(() => {
    // Check if it's a touch device or mobile screen
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768 || window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window;
      setIsMobile(mobile);
    };
    
    checkDevice();
    window.addEventListener("resize", checkDevice);

    if (isMobile) {
      return () => {
        window.removeEventListener("resize", checkDevice);
      };
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let ripples: Ripple[] = [];

    // Scale canvas for high-DPI screens
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position and detect hover states
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      isHoveringRef.current = true;

      // Detect interactive elements and input elements dynamically
      const target = e.target as HTMLElement;
      if (target) {
        const computedStyle = window.getComputedStyle(target);
        const isClickable =
          computedStyle.cursor === "pointer" ||
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.closest("a") ||
          target.closest("button") ||
          target.getAttribute("role") === "button";

        const isInput =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable;

        isInteractiveRef.current = !!isClickable;
        isInputRef.current = isInput;
      }

      // Spawn a small water mist trail particle with some probability
      if (!isInputRef.current && Math.random() < 0.25) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.4 + 0.1;
        particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 1.2 + 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.5,
          decay: Math.random() * 0.02 + 0.015,
        });
      }
    };

    const handleMouseLeave = () => {
      isHoveringRef.current = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (isInputRef.current) return;

      const clickX = e.clientX;
      const clickY = e.clientY;

      // Create a water ripple expanding wave
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 4,
        maxRadius: Math.random() * 15 + 25,
        alpha: 0.7,
        color: colors[Math.floor(Math.random() * colors.length)],
      });

      // Spawn droplet splash particles
      const particleCount = Math.floor(Math.random() * 10) + 14; // 14-24 particles
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.5;
        // Upward bias in vertical velocity to simulate water splash arc
        const vyBias = -0.5 - Math.random() * 1.5;
        
        particles.push({
          x: clickX,
          y: clickY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + vyBias,
          radius: Math.random() * 2.5 + 1.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: Math.random() * 0.025 + 0.015,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);

    // Smooth cursor rendering variables
    let ringRadius = 12;
    let ringAlpha = 0.5;
    let ringColor = "#948ae3";
    let cursorX = -100;
    let cursorY = -100;

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // 1. Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // Gravity pulls droplets down
        p.vx *= 0.97; // Friction slows them down
        p.vy *= 0.97;
        p.alpha -= p.decay;

        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        
        // Soft glow for particles
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft outer halo
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        return true;
      });

      // 2. Update and draw ripples
      ripples = ripples.filter((r) => {
        r.radius += (r.maxRadius - r.radius) * 0.08;
        r.alpha -= 0.025;

        if (r.alpha <= 0 || r.radius >= r.maxRadius - 0.5) return false;

        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        return true;
      });

      // 3. Update and draw custom cursor
      if (isHoveringRef.current && !isInputRef.current) {
        // Interpolate position for lag-smoothed feel
        cursorX += (mouseRef.current.targetX - cursorX) * 0.3;
        cursorY += (mouseRef.current.targetY - cursorY) * 0.3;

        // Hover animation targets
        const targetRadius = isInteractiveRef.current ? 22 : 12;
        const targetAlpha = isInteractiveRef.current ? 0.8 : 0.5;
        const targetColor = isInteractiveRef.current ? "#fc618d" : "#948ae3"; // Pink on hover, Violet default

        // Smoothly transition ring properties
        ringRadius += (targetRadius - ringRadius) * 0.15;
        ringAlpha += (targetAlpha - ringAlpha) * 0.15;
        ringColor = targetColor;

        // Draw outer glowing circle
        ctx.save();
        ctx.globalAlpha = ringAlpha;
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = isInteractiveRef.current ? 1.8 : 1.2;
        
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();

        // Draw inner dot
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cursorX, cursorY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[9999] hidden md:block"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
