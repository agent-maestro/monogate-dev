import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "monogate.dev — Developer Playground",
  description:
    "A developer playground for Monogate artifacts: inspect evidence packets, " +
    "run EML explorers, draft packet JSON, and try bounded simulators.",
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

const FLOW_STEPS: { n: string; text: string; sub: string }[] = [
  {
    n: "01",
    text: "Open a live tool",
    sub: "Start with a packet builder, explorer, simulator, evidence browser, or replay fixture.",
  },
  {
    n: "02",
    text: "Inspect the artifact",
    sub: "Read the expression, trace, replay frames, guard decisions, supporting evidence, and non-claims.",
  },
  {
    n: "03",
    text: "Export or follow the packet",
    sub: "Use generated JSON and reports as reviewable handoff material, not automatic approval.",
  },
  {
    n: "04",
    text: "Check the boundary",
    sub: "Every surface marks what is simulated, candidate-only, blocked, checked, or public-ready.",
  },
  {
    n: "05",
    text: "Go deeper on monogate.org",
    sub: "The public research story, Atlas, and essays live on the .org site.",
  },
];

const TOOLKIT: { cmd: string; tagline: string; color: string }[] = [
  {
    cmd: "Inspect",
    tagline: "Open generated EML, rescue, evidence, and proof-digestion artifacts.",
    color: C.blue,
  },
  {
    cmd: "Build",
    tagline: "Draft candidate evidence packets and EML expression packets in the browser.",
    color: C.orange,
  },
  {
    cmd: "Export",
    tagline: "Copy packet JSON and carry bounded claims into private review.",
    color: C.green,
  },
];

const SECTIONS = [
  {
    href: "/explorer/eml-packets/builder",
    label: "Packet Builder",
    desc: "Draft candidate Evidence Packet v0 JSON from AI answers, proof notes, traces, hardware packets, compiler artifacts, or EML expressions.",
    color: C.orange,
    tag: "build",
  },
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
    desc: "Browse the current Explorer surfaces: EML language, packet gallery, rescue suite, advantage lab, Atlas annex, and symbolic-regression fixtures.",
    color: C.blue,
    tag: "index",
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
    desc: "A concise public framing for the artifact-to-evidence-to-review-to-understanding pipeline.",
    color: C.blue,
    tag: "overview",
  },
  {
    href: "/electronics",
    label: "Electronics Lab",
    desc: "Laptop-agent-owned electronics surface for simulated trainer boards and physical-evidence-ready packets.",
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
    desc: "Reference material and developer notes for the current Monogate surfaces.",
    color: C.blue,
    tag: "docs",
  },
];

const SPOTLIGHTS = [
  {
    href: "/explorer/rescue-suite",
    title: "Rescue Suite",
    eyebrow: "inspect · replay",
    text: "Open optimization-failure rescue packets, replay status, trace frames, and MachLib obligation routing.",
    color: C.green,
  },
  {
    href: "/explorer/eml-packets/builder",
    title: "Packet Builder",
    eyebrow: "build · export",
    text: "Draft candidate Evidence Packet v0 JSON and EML Expression Packet v0 JSON from pasted artifacts.",
    color: C.orange,
  },
  {
    href: "/explorer/eml-advantage",
    title: "EML Advantage Lab",
    eyebrow: "compare · guard",
    text: "See where EML helps, where protected standard math wins, and which claims stay blocked.",
    color: C.blue,
  },
  {
    href: "/electronics",
    title: "Electronics Lab",
    eyebrow: "simulate · export",
    text: "Open the laptop-agent electronics surface for simulated trainer board work and physical-evidence-ready packets.",
    color: C.green,
  },
  {
    href: "/evidence",
    title: "Evidence Browser",
    eyebrow: "review · packets",
    text: "Inspect candidate and approved evidence packets by validation, replay, semantic strength, and claim flags.",
    color: C.orange,
  },
  {
    href: "/proof-digestion",
    title: "Proof Digestion Lab",
    eyebrow: "explain · reuse",
    text: "Turn evidence-backed artifacts into minimum examples, failure modes, reuse paths, and open questions.",
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
    eyebrow: "inspect · packets",
    text: "Browse candidate EML expression packets generated from the private packet-builder flow.",
    color: C.green,
  },
  {
    href: "/explorer/eml-atlas-annex",
    title: "EML Atlas Annex",
    eyebrow: "review · atlas",
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
          monogate.dev — developer playground
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: C.orange, fontFamily: "monospace", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Open the tool.<br />Inspect the packet.
        </h1>
        <p style={{ fontSize: 15, color: C.text, lineHeight: 1.8, maxWidth: 640, marginBottom: 24 }}>
          This is the public workbench for Monogate artifacts: EML explorers,
          evidence packets, rescue traces, packet builders, proof-digestion
          views, and bounded simulators. The deeper research story lives on{" "}
          <a href="https://monogate.org" style={{ color: C.blue }}>monogate.org</a>;
          this site is for trying the tools.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <code style={{ fontSize: 12, color: C.blue, background: "rgba(106,176,245,0.07)", border: `1px solid rgba(106,176,245,0.2)`, borderRadius: 4, padding: "6px 12px" }}>
            inspect artifacts
          </code>
          <code style={{ fontSize: 12, color: C.green, background: "rgba(74,222,128,0.07)", border: `1px solid rgba(74,222,128,0.2)`, borderRadius: 4, padding: "6px 12px" }}>
            export candidate JSON
          </code>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a href="/explorer/rescue-suite" style={{ fontSize: 12, color: C.bg, background: C.orange, border: `1px solid ${C.orange}`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontWeight: 700 }}>
            Start With Rescue Suite
          </a>
          <a href="/explorer/eml-packets/builder" style={{ fontSize: 12, color: C.blue, background: "rgba(106,176,245,0.07)", border: `1px solid rgba(106,176,245,0.28)`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontWeight: 700 }}>
            Open Packet Builder
          </a>
          <a href="/electronics" style={{ fontSize: 12, color: C.green, background: "rgba(74,222,128,0.07)", border: `1px solid rgba(74,222,128,0.28)`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontWeight: 700 }}>
            Try Electronics
          </a>
        </div>
      </section>

      {/* Spotlight workbenches */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Start here
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
          Playground contract
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

      {/* How it works */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          How it works
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>
          Use the dev site as a workbench, not a claim engine.
        </h2>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
          The useful move is always the same: try a tool, inspect the evidence,
          export a packet, and keep unsupported claims blocked.
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
          Surface split: <strong style={{ color: C.orange }}>monogate.dev</strong> is the workbench,{" "}
          <a href="https://monogate.org" style={{ color: C.orange, fontWeight: 700 }}>monogate.org</a> is the research record,{" "}
          <a href="https://monogate.net" style={{ color: C.orange, fontWeight: 700 }}>monogate.net</a> is the CI-emitted verification dashboard, and{" "}
          <a href="https://1op.io" style={{ color: C.orange, fontWeight: 700 }}>1op.io</a> is games and visualization.
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
            { href: "https://monogate.net", label: "monogate.net" },
            { href: "https://1op.io", label: "1op.io" },
          ].map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{ color: C.muted }}>{label}</a>
          ))}
        </div>
        <span>Odrzywołek 2026 · CC BY 4.0</span>
      </footer>
    </div>
  );
}
