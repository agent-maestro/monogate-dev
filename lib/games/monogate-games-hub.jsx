import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const C = {
  bg: "#08060E", surface: "rgba(255,255,255,0.025)", border: "rgba(255,255,255,0.06)",
  text: "#E2E8F0", muted: "rgba(226,232,240,0.45)", accent: "#e8a020",
  mono: "var(--font-mono, monospace)",
};

const FEATURED = [
  {
    id: "optimizer", title: "Live Optimizer", icon: "⚡", color: "#e8a020",
    tagline: "Type any equation. Watch it shrink.",
    desc: "Real-time EML node-cost analyzer in the browser. Every mathematical expression gets naïve-vs-SuperBEST costs, operator breakdown, savings bar, and an ELC-class badge. Parser is a 200-line recursive descent — the optimizer that ships as a Python CLI, now running on paste-and-type.",
  },
  {
    id: "equation-genome", title: "Equation Genome", icon: "✱", color: "#60a5fa",
    tagline: "Equations cluster by math, not by field.",
    desc: "265 scientific equations projected to 2-D by structural fingerprint and partitioned by k-means (K = 5). Toggle between domain colouring and cluster colouring — the punchline is in the switch. Pair-purity 0.181 vs random baseline 0.155; excess +0.026.",
  },
  {
    id: "period-map", title: "Period Map", icon: "▣", color: "#f87171",
    tagline: "Where chaos lives — 40 % of the EXL c-plane is period 3.",
    desc: "Client-side heat-map of the complex c-plane coloured by orbit period under EXL, EML, or EDL. Red is period-3 Sharkovskii chaos; blue is fixed-point stability. Click to trace an orbit. Deep-session measured area ratios 4.60 / 4.44 / 4.45 — within 3.7 % of classical Feigenbaum δ ≈ 4.669.",
  },
  {
    id: "morph", title: "Operator Morph", icon: "↝", color: "#c084fc",
    tagline: "Watch one Mandelbrot set become another.",
    desc: "Scrub z ← (1 − t)·op₁(z,c) + t·op₂(z,c) across 51 frames between four EML-family pairs. The bounded-set area dips non-monotonically near t ≈ 0.4 for three of four pairs — the fractal nearly collapses at the midpoint, then rebuilds.",
  },
  {
    id: "eml-synthesizer", title: "EML Synthesizer", icon: "♫", color: "#5ec47a",
    tagline: "Timbre is node count.",
    desc: "Fourier synthesis where each harmonic is one complex EML node: Im(eml(i·2πft,1)) = sin(2πft). A sine wave costs 1 node. A violin costs 12.",
  },
  {
    id: "weierstrass-machine", title: "Weierstrass Machine", icon: "≈", color: "#10B981",
    tagline: "Build any continuous function from EML atoms.",
    desc: "T02 Universality in action: compose EML atoms to approximate any continuous f on [0.2, 3.0]. Depth-1, -2, and -3 atoms. Watch convergence live.",
  },
  {
    id: "phantom-attractor", title: "Phantom Attractor", icon: "⊕", color: "#F97316",
    tagline: "Why gradient descent stalls at 3.1696.",
    desc: "Simulate EML tree training dynamics. 92% of runs collapse to the phantom attractor — not π. Raise λ past the critical threshold. Phase transition. Real data from §5.",
  },
  {
    id: "negative-exponent", title: "Negative Exponent", icon: "⁻¹", color: "#EC4899",
    tagline: "Only one operator reaches exp(−x).",
    desc: "EML fails. EDL fails. EXL only approximates. DEML wins: deml(x,1) = exp(−x). Discover why each operator either succeeds or gets blocked.",
  },
  {
    id: "billion-trees", title: "Search Log", icon: "⏱", color: "#EF4444",
    tagline: "1,704,034,304 trees. Zero candidates.",
    desc: "The exhaustive EML search (§35) made interactive. Reveal each depth level: 4 trees at N=1 up to 1.7B at N=12. Best-MSE stalls above 0.1. sin(x) never appears.",
  },
  {
    id: "identity-theorem", title: "Identity Theorem", icon: "∴", color: "#06B6D4",
    tagline: "Step through the proof that eml gives you everything.",
    desc: "Walk each algebraic step: eml(x,1)=exp(x), eml(1,exp(x))=e−x, eml(e−x,1)=exp(e−x). Prove neg(x)=−x in 4 steps from first principles.",
  },
];

const COMPACT = [
  { id: "bifurcation", title: "Bifurcation Viewer", icon: "∿", color: "#0fd38d", tagline: "Where the multiplicative F16 ops fall into chaos." },
  { id: "julia-gallery", title: "Julia Set Gallery", icon: "❈", color: "#7af0c8", tagline: "40 Julia sets. 4 exceptions." },
  { id: "mandelbrot-grid", title: "Mandelbrot Grid", icon: "▣", color: "#5ec47a", tagline: "All 16 F16 sets, side by side." },
  { id: "conjugacy", title: "Conjugacy Viewer", icon: "⇌", color: "#a18cd1", tagline: "Two cobwebs, one dynamics." },
  { id: "em-cost", title: "EM Cost Calculator", icon: "∑", color: "#4facfe", tagline: "F16-node decomposition of EM formulas." },
  { id: "eml-builder", title: "EML Builder", icon: "⧈", color: "#06B6D4", tagline: "Snap. Compose. Create." },
  { id: "closure", title: "Closure", icon: "⊘", color: "#EF4444", tagline: "You can't escape. Unless…" },
  { id: "the-gap", title: "The Gap", icon: "∎", color: "#EF4444", tagline: "Real vs complex. Different depths." },
];

const HEROES = [
  {
    id: "fractal-studio",
    title: "EML Fractal Studio",
    icon: "◈",
    color: "#e8a020",
    tagline: "See it. Hear it. Play it.",
    desc: "The complex-plane Mandelbrot set for 8 EML-family operators, playable. Visual mode is a classical fractal explorer — scroll to zoom, drag to pan, 4 palettes. Audio mode turns the fractal into an instrument: hover for pitch, click to lock a chord (up to 6 tones). Sequencer sweeps a scan line across the boundary or replays a real orbit; DEXL and DEXN carry period-3 Sharkovskii chaos. Morph mode cross-fades two operators in real time.",
    kicker: "FLAGSHIP · FRACTAL · VISUAL / AUDIO / SEQUENCER / ORBIT / MORPH",
  },
  {
    id: "zen-garden",
    title: "EML Zen Garden",
    icon: "❋",
    color: "#a18cd1",
    tagline: "Drag. Listen. Breathe.",
    desc: "A living, interactive complex-plane garden. Drag floating leaf-nodes — each is a constant in a linear chain of F16 operators. Domain coloring, orbit field, or flow-field renders in real time. A continuous drone tracks the tree's output: Re(f) pitch, Im(f) pan, |f| volume. Mic or file FFT drives audio-reactive mode — bass drives depth, treble shifts hue. Presets: Pure Euler, Phantom Attractor, Chaos Lullaby, Golden Spiral, Breath.",
    kicker: "FLAGSHIP · GARDEN · DOMAIN COLORING / AUDIO-REACTIVE",
  },
];

function HeroCard({ game, visible, index }) {
  const nav = useNavigate();
  const [hovered, setHovered] = useState(false);
  const color = game.color;
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => nav(`/${game.id}`)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${0.1 + index * 0.12}s`,
        marginBottom: 20,
        background: hovered
          ? `linear-gradient(135deg, ${color}1a, ${color}05)`
          : `linear-gradient(135deg, ${color}10, rgba(8,6,14,0))`,
        border: `1px solid ${hovered ? color + "66" : color + "28"}`,
        borderRadius: 16,
        padding: "36px 36px 32px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: hovered
          ? `0 0 40px ${color}22, 0 8px 24px rgba(0,0,0,0.35)`
          : "0 4px 16px rgba(0,0,0,0.25)",
      }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: hovered ? 2 : 1,
        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        transition: "height 0.3s",
      }} />
      <div style={{
        position: "absolute", top: -80, right: -80, width: 300, height: 300,
        background: `radial-gradient(circle, ${color}14 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ fontSize: 26, color, lineHeight: 1,
          filter: hovered ? `drop-shadow(0 0 6px ${color}90)` : "none",
          transition: "filter 0.25s" }}>{game.icon}</span>
        <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
          color, fontFamily: C.mono }}>{game.kicker}</span>
      </div>

      <h2 style={{ fontSize: 26, fontWeight: 700, color: "#F1F5F9",
        margin: "0 0 6px", letterSpacing: -0.5 }}>{game.title}</h2>
      <div style={{ fontSize: 14, color, fontStyle: "italic",
        marginBottom: 14, opacity: 0.9 }}>{game.tagline}</div>
      <p style={{ fontSize: 13, color: "rgba(226,232,240,0.6)",
        margin: "0 0 20px", maxWidth: 560, lineHeight: 1.7 }}>{game.desc}</p>

      <button
        onClick={(e) => { e.stopPropagation(); nav(`/${game.id}`); }}
        style={{
          fontFamily: C.mono, fontSize: 12, padding: "10px 24px",
          background: hovered ? color : `${color}22`,
          border: `1px solid ${hovered ? color : color + "55"}`,
          color: hovered ? "#08060E" : color,
          borderRadius: 6, cursor: "pointer", fontWeight: 700, letterSpacing: 1,
          transition: "all 0.2s", textTransform: "uppercase",
        }}>
        ENTER →
      </button>
    </div>
  );
}

function FeaturedCard({ game, index, visible }) {
  const [hovered, setHovered] = useState(false);
  const nav = useNavigate();
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => nav(`/${game.id}`)}
      style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${0.1 + index * 0.07}s`,
        background: hovered ? `linear-gradient(135deg, ${game.color}10, rgba(255,255,255,0.02))` : C.surface,
        border: `1px solid ${hovered ? game.color + "40" : C.border}`,
        borderRadius: 12, padding: "20px", cursor: "pointer",
        position: "relative", overflow: "hidden",
      }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: hovered ? 2 : 0, background: game.color, transition: "height 0.25s" }} />
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 22, color: game.color, lineHeight: 1, flexShrink: 0,
          filter: hovered ? `drop-shadow(0 0 5px ${game.color}60)` : "none", transition: "filter 0.25s" }}>
          {game.icon}
        </span>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#E2E8F0", marginBottom: 2 }}>{game.title}</div>
          <div style={{ fontSize: 11, color: game.color, opacity: 0.8, fontStyle: "italic" }}>{game.tagline}</div>
        </div>
      </div>
      <p style={{ fontSize: 12, color: "rgba(226,232,240,0.5)", margin: 0, lineHeight: 1.65 }}>{game.desc}</p>
    </div>
  );
}

function CompactCard({ game, visible, delay }) {
  const [hovered, setHovered] = useState(false);
  const nav = useNavigate();
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => nav(`/${game.id}`)}
      style={{
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        background: hovered ? `${game.color}0a` : "transparent",
        border: `1px solid ${hovered ? game.color + "30" : C.border}`,
        borderRadius: 8, padding: "12px 16px", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12,
      }}>
      <span style={{ fontSize: 18, color: game.color, lineHeight: 1, flexShrink: 0 }}>{game.icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{game.title}</div>
        <div style={{ fontSize: 11, color: C.muted }}>{game.tagline}</div>
      </div>
    </div>
  );
}

export default function Hub() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text,
      fontFamily: "var(--font-sans, system-ui, sans-serif)", position: "relative" }}>

      <div style={{ position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(232,160,32,0.015) 1px, transparent 0)",
        backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 20px 80px", position: "relative" }}>

        {/* Header */}
        <header style={{
          padding: "48px 0 40px", textAlign: "center",
          opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-12px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontSize: 11, fontFamily: C.mono, color: C.muted, letterSpacing: 2,
            textTransform: "uppercase", marginBottom: 16 }}>
            monogate.dev · lab
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 16px", color: "#F1F5F9",
            letterSpacing: -0.8, lineHeight: 1.15 }}>
            One equation.<br />Every experiment.
          </h1>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 460, margin: "0 auto", lineHeight: 1.75 }}>
            <span style={{ fontFamily: C.mono, color: "#C4B5FD" }}>eml(x,y) = exp(x) − ln(y)</span>
            {" "}— a single binary operator that generates every elementary function.
            28 proved theorems. Each experiment below is grounded mathematics, not speculation.
          </p>
        </header>

        {/* Two flagships (heroes) */}
        <div style={{ marginBottom: 48 }}>
          {HEROES.map((g, i) => <HeroCard key={g.id} game={g} visible={visible} index={i} />)}
        </div>

        {/* Featured section */}
        <div style={{
          opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.2s",
          fontSize: 10, fontFamily: C.mono, color: C.muted, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span>── FEATURED</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16, marginBottom: 48 }}>
          {FEATURED.map((g, i) => <FeaturedCard key={g.id} game={g} index={i} visible={visible} />)}
        </div>

        {/* Compact section */}
        <div style={{
          opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.4s",
          fontSize: 10, fontFamily: C.mono, color: C.muted, letterSpacing: 2,
          textTransform: "uppercase", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span>── MORE EXPERIMENTS</span>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {COMPACT.map((g, i) => <CompactCard key={g.id} game={g} visible={visible} delay={0.45 + i * 0.06} />)}
        </div>

        {/* Footer note */}
        <div style={{
          marginTop: 60, paddingTop: 24, borderTop: `1px solid ${C.border}`,
          fontSize: 11, fontFamily: C.mono, color: C.muted, lineHeight: 1.8,
          opacity: visible ? 1 : 0, transition: "opacity 0.5s 0.6s",
        }}>
          Monogate Research ·{" "}
          <a href="https://arxiv.org/abs/2603.21852" style={{ color: "#4facfe" }}>arXiv:2603.21852</a>
          {" "}· 30 theorems · 315+ equations ·{" "}
          <a href="https://monogate.org" style={{ color: "#4facfe" }}>monogate.org</a>
        </div>

      </div>
    </div>
  );
}
