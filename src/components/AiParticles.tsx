"use client";

// 🔑 Keywords: Credentials AI V2 motion background, AI particles, ambient drift, Erosium-principle, deterministic seeded PRNG, client-only after mount, reduced-motion safe

import { useEffect, useState, type CSSProperties } from "react";

type ParticleTone = "home" | "paid";

interface AiParticlesProps {
  /** home = cyan/purple/teal brand shell · paid = emerald/cyan trust signals */
  tone: ParticleTone;
  /** Override particle count (defaults: home 22, paid 16). */
  count?: number;
  /** fixed = page-level viewport layer · absolute = inside a positioned section (e.g. Hero). */
  placement?: "fixed" | "absolute";
  /** Seed for the deterministic particle field (stable across remounts). */
  seed?: number;
}

interface ParticleSpec {
  left: string;
  top: string;
  size: number;
  delay: string;
  duration: string;
  sway: string;
  color: string;
  glowRadius: number;
  peakOpacity: number;
}

/**
 * Deterministic PRNG (mulberry32). Particle fields are stable across remounts,
 * and because particles render ONLY after mount there is no SSR/CSR hydration
 * mismatch regardless of the values generated.
 */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Homepage brand shell — cyan / purple / teal. */
const HOME_PALETTE = [
  "rgb(34 211 238 / 0.85)", // cyan
  "rgb(139 92 246 / 0.8)", // violet / purple
  "rgb(45 212 191 / 0.8)", // teal
];

/** Paid AI-Ready Business Page — emerald / cyan trust sparks. */
const PAID_PALETTE = [
  "rgb(52 211 153 / 0.85)", // emerald
  "rgb(34 211 238 / 0.8)", // cyan
  "rgb(16 185 129 / 0.8)", // deep emerald
];

export function AiParticles({
  tone,
  count,
  placement = "fixed",
  seed = 20260724,
}: AiParticlesProps) {
  const [particles, setParticles] = useState<ParticleSpec[] | null>(null);

  const resolvedCount = count ?? (tone === "paid" ? 16 : 22);

  useEffect(() => {
    // Respect reduced motion: no particles at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rand = mulberry32(seed + (tone === "paid" ? 101 : 0));
    const palette = tone === "paid" ? PAID_PALETTE : HOME_PALETTE;
    const next: ParticleSpec[] = Array.from({ length: resolvedCount }, (_, i) => {
      const size = 1.6 + rand() * 2.6;
      return {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(15 + rand() * 90).toFixed(2)}%`,
        size,
        // Negative delay pre-warms the loop so dots are mid-flight on first paint.
        delay: `${(-rand() * 40).toFixed(1)}s`,
        duration: `${(24 + rand() * 24).toFixed(1)}s`,
        sway: `${((rand() - 0.5) * 6).toFixed(2)}rem`,
        color: palette[i % palette.length],
        glowRadius: Math.round(size * 3.2),
        peakOpacity: 0.25 + rand() * 0.4,
      };
    });
    setParticles(next);
  }, [tone, resolvedCount, seed]);

  // Server render + pre-mount client render: nothing (no hydration mismatch).
  if (!particles) return null;

  return (
    <div
      className={`ai-particles${placement === "absolute" ? " ai-particles--absolute" : ""}`}
      aria-hidden
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="ai-particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.glowRadius}px ${p.color}`,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--p-sway": p.sway,
              "--p-peak": p.peakOpacity,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
