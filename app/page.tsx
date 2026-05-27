import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "monogate — One operator. All of mathematics.",
  description:
    "The research layer behind Monogate Forge and MachLib. Profile, measure, " +
    "and optimize EML expressions — pip install eml-cost.",
};

const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  border: "#1c1f2e",
  border2: "#252836",
  text: "#d4d4d4",
  muted: "#4a4d62",
  orange: "#e8a020",
  blue: "#6ab0f5",
  green: "#4ade80",
  purple: "#a78bfa",
};

const FLOW_STEPS: { n: string; text: string; sub: string; highlight?: boolean }[] = [
  {
    n: "01",
    text: "Engineer writes equation (.eml)",
    sub: "Single source of truth — the math itself.",
  },
  {
    n: "02",
    text: "Forge compiles to 36 targets",
    sub: "13 Free targets plus 23 Pro targets, from Python/C/Rust to HDL, EDA, and proof artifacts.",
  },
  {
    n: "03",
    text: "Lean output imports MachLib (not Mathlib)",
    sub: "~500 lines of axiomatic foundations. No external library.",
  },
  {
    n: "04",
    text: "MachLib core builds in under 5 minutes",
    sub: "Cold build, core foundations. Laptop. Every time.",
  },
  {
    n: "05",
    text: "Proof verified. Zero external dependencies.",
    sub: "Lean kernel says yes. Nothing else needed.",
  },
];

const TOOLKIT: { cmd: string; tagline: string; color: string }[] = [
  {
    cmd: "pip install eml-cost",
    tagline: "Profile any equation — chain order, drift, cost class.",
    color: C.blue,
  },
  {
    cmd: "pip install monogate-forge",
    tagline: "Compile to 36 targets — 13 Free, 23 Pro.",
    color: C.orange,
  },
  {
    cmd: "import MachLib",
    tagline: "Verify against MachLib core in under 5 minutes — zero Mathlib dependency.",
    color: C.green,
  },
];

const SECTIONS = [
  {
    href: "/evidence",
    label: "Evidence Browser",
    desc: "Inspect artifacts by validation, replay, semantic strength, claim flags, and reviewer decision.",
    color: C.green,
    tag: "review",
  },
  {
    href: "/explorer",
    label: "Explorer",
    desc: "Build and optimize EML expression trees interactively.",
    color: C.blue,
    tag: "tool",
  },
  {
    href: "/proof-digestion",
    label: "Proof Digestion",
    desc: "Turn evidence-backed artifacts into core ideas, minimum examples, reuse paths, failure modes, and open questions.",
    color: C.orange,
    tag: "lab",
  },
  {
    href: "/case-study/evidence-governed-computation",
    label: "Case Study",
    desc: "A concise public framing of Monogate as evidence-governed AI and formal-methods infrastructure.",
    color: C.blue,
    tag: "portfolio",
  },
  {
    href: "/electronics",
    label: "Electronics Lab",
    desc: "Trainer Board v0 simulator: wire the pot-to-guarded-LED loop, emit simulated traces, and learn the evidence packet path.",
    color: C.green,
    tag: "sim lab",
  },
  {
    href: "/challenge",
    label: "Challenge Board",
    desc: "Open problems: construct sin, cos, π, i from eml(x,y) = exp(x) − ln(y). Submit a construction, get credited permanently.",
    color: C.orange,
    tag: "challenge",
  },
  {
    href: "/lab",
    label: "Math Lab",
    desc: "Interactive experiments and experiences built on the EML grammar.",
    color: C.purple,
    tag: "lab",
  },
  {
    href: "/docs",
    label: "Docs",
    desc: "API reference, quickstart, and tutorial for the monogate library.",
    color: C.blue,
    tag: "docs",
  },
];

const SPOTLIGHTS = [
  {
    href: "/evidence",
    title: "Evidence Browser",
    eyebrow: "new · reviewer gate",
    text: "Inspect approved and candidate evidence packets without turning the public page into the private operator hub.",
    color: C.green,
  },
  {
    href: "/proof-digestion",
    title: "Proof Digestion Lab",
    eyebrow: "new · understanding packet",
    text: "Follow the first Understanding Packet: what the Forge Rescue Suite teaches, where it can be reused, and what it does not claim.",
    color: C.orange,
  },
  {
    href: "/case-study/evidence-governed-computation",
    title: "Evidence-Governed Computation",
    eyebrow: "case study · portfolio",
    text: "A shareable overview of the artifact-to-evidence-to-review-to-understanding pipeline.",
    color: C.blue,
  },
  {
    href: "/electronics",
    title: "Electronics Lab",
    eyebrow: "new · simulated trainer board",
    text: "A guided low-voltage bench simulator for threshold_reflex_v0: ground, 3V3, potentiometer, resistor, LED, guard clamp, trace.",
    color: C.green,
  },
  {
    href: "/explorer/rescue-suite",
    title: "Rescue Suite",
    eyebrow: "new · replay contract",
    text: "Inspect Forge boundary-event rescue packets, replay status, trace frames, and MachLib obligation routing.",
    color: C.orange,
  },
  {
    href: "/explorer?tab=field",
    title: "Complex Field",
    eyebrow: "visual EML",
    text: "Domain coloring for complex EML slices, including the modular-symmetry-inspired visual grammar.",
    color: C.blue,
  },
  {
    href: "/explorer/eml-ir-bridge",
    title: "EML IR Bridge",
    eyebrow: "new · candidate fixture",
    text: "Inspect one EML expression as a shared DAG, replay packet, and explicit non-claim boundary.",
    color: C.orange,
  },
  {
    href: "/explorer/eml-packets",
    title: "EML Packet Gallery",
    eyebrow: "new · generated packets",
    text: "Browse candidate EML expression packets generated from the private packet-builder flow.",
    color: C.green,
  },
  {
    href: "/explorer/eml-atlas-annex",
    title: "EML Atlas Annex",
    eyebrow: "new · review queue",
    text: "Review Atlas-style identities, claim boundaries, and candidate MachLib witness targets.",
    color: C.blue,
  },
  {
    href: "/explorer/eml-symbolic-regression",
    title: "EML Template Search",
    eyebrow: "new · research frontier",
    text: "Compare fixed EML, standard, control, and baseline templates on the prime residual fixture.",
    color: C.orange,
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", maxWidth: 920, margin: "0 auto", padding: "0 18px 80px" }}>

      {/* Hero */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          monogate.dev — research layer
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: C.orange, fontFamily: "monospace", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          One operator.<br />All of mathematics.
        </h1>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, maxWidth: 640, marginBottom: 24 }}>
          The research layer that powers Monogate Forge and MachLib. Profile,
          measure, and optimize EML expressions before the compiler ever sees
          them. Built on Odrzywołek (2026) — every elementary function as a
          finite binary tree of <code style={{ color: C.orange, fontFamily: "monospace" }}>eml(x, y) = exp(x) − ln(y)</code>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <code style={{ fontSize: 12, color: C.blue, background: "rgba(106,176,245,0.07)", border: `1px solid rgba(106,176,245,0.2)`, borderRadius: 4, padding: "6px 12px" }}>
            pip install eml-cost
          </code>
          <code style={{ fontSize: 12, color: C.green, background: "rgba(74,222,128,0.07)", border: `1px solid rgba(74,222,128,0.2)`, borderRadius: 4, padding: "6px 12px" }}>
            npm install monogate
          </code>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/explorer" style={{ fontSize: 12, color: C.bg, background: C.orange, border: `1px solid ${C.orange}`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontWeight: 700 }}>
            Open Explorer
          </a>
          <a href="/electronics" style={{ fontSize: 12, color: C.green, background: "rgba(74,222,128,0.07)", border: `1px solid rgba(74,222,128,0.28)`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontWeight: 700 }}>
            Try Electronics Lab
          </a>
        </div>
      </section>

      {/* Spotlight workbenches */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Workbenches
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
          {SPOTLIGHTS.map(({ href, title, eyebrow, text, color }) => (
            <a key={href} href={href} style={{ display: "block", minHeight: 150, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 18px", textDecoration: "none", color: "inherit" }}>
              <div style={{ fontSize: 9, color, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 10 }}>
                {eyebrow}
              </div>
              <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{text}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Toolkit row */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          The complete toolkit
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10 }}>
          {TOOLKIT.map(({ cmd, tagline, color }) => (
            <div key={cmd} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 20px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, color, marginBottom: 6, fontWeight: 700 }}>
                {cmd}
              </div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                {tagline}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — full-stack flow */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          How it works
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>
          From equation to silicon to proof.
        </h2>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
          One chain. No vendors. No external library. No 45-minute builds.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {FLOW_STEPS.map((step, i) => (
            <div key={step.n}>
              <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 6, padding: "14px 18px", display: "flex", gap: 14, alignItems: "baseline" }}>
                <span style={{ fontFamily: "monospace", fontSize: 11, color: C.orange, letterSpacing: "0.18em", flex: "0 0 auto" }}>
                  {step.n}
                </span>
                <span>
                  <div style={{ fontSize: 13, color: C.text, fontFamily: "monospace", lineHeight: 1.4 }}>
                    {step.text}
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>
                    {step.sub}
                  </div>
                </span>
              </div>
              {i < FLOW_STEPS.length - 1 ? (
                <div style={{ textAlign: "center", color: C.orange, fontFamily: "monospace", fontSize: 14, padding: "6px 0" }} aria-hidden>
                  ↓
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: "16px 20px", background: "rgba(232,160,32,0.08)", border: `1px solid rgba(232,160,32,0.18)`, borderRadius: 6, fontFamily: "monospace", fontSize: 12, color: C.text, lineHeight: 1.6 }}>
          You own every line from <strong style={{ color: C.orange }}>equation</strong> to{" "}
          <strong style={{ color: C.orange }}>silicon</strong> to <strong style={{ color: C.orange }}>proof</strong>.
        </div>
      </section>

      {/* Section cards */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 10, marginBottom: 48 }}>
        {SECTIONS.map(({ href, label, desc, color, tag }) => (
          <a key={href} href={href} style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "18px 18px", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color }}>{label}</div>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 3, padding: "2px 6px" }}>
                {tag}
              </span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>{desc}</div>
          </a>
        ))}
      </section>

      {/* Links */}
      <footer style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 10, color: C.muted }}>
        <div style={{ display: "flex", gap: 16 }}>
          {[
            { href: "https://arxiv.org/abs/2603.21852", label: "arXiv:2603.21852" },
            { href: "https://github.com/agent-maestro/monogate", label: "GitHub" },
            { href: "https://www.npmjs.com/package/monogate", label: "npm" },
            { href: "https://monogate.org", label: "monogate.org" },
          ].map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.muted }}>{label}</a>
          ))}
        </div>
        <span>Odrzywołek 2026 · CC BY 4.0</span>
      </footer>
    </div>
  );
}
