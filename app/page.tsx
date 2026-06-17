import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "monogate.dev — EML math language playground",
  description:
    "EML — a single-operator math language verified in Lean and running from " +
    "your browser to ESP32 to FPGA. Explore the language, try the hardware lab, " +
    "and learn EML.",
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
    sub: "Start with the EML Explorer, Electronics Lab, Learn pages, or a research-stack workbench.",
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

// Primary spotlights — what a first-time visitor should try.
// Order matters: Explorer first (what is EML), Electronics (the differentiator),
// Learn (where to go next), Advantage (why it matters).
const PRIMARY_SPOTLIGHTS = [
  {
    href: "/explorer/eml-language",
    title: "EML Language Explorer",
    eyebrow: "start here · what is eml",
    text:
      "The single-operator language at the heart of Monogate. Browse syntax, " +
      "expressions, and worked examples. Start here if you're new.",
    color: C.blue,
  },
  {
    href: "/electronics",
    title: "Electronics Lab",
    eyebrow: "differentiator · esp32 / fpga",
    text:
      "EML kernels running on real hardware: ESP32 trainer boards, FPGA bitstreams, " +
      "and physical-evidence-ready packets. The thing other AI projects don't have.",
    color: C.green,
  },
  {
    href: "/learn",
    title: "Learn EML",
    eyebrow: "tutorials · quick start",
    text:
      "Step-by-step paths into EML, Forge, and the certificate system. " +
      "Start with the language, then follow the lanes that interest you.",
    color: C.purple,
  },
  {
    href: "/explorer/eml-advantage",
    title: "EML Advantage Lab",
    eyebrow: "compare · why eml",
    text:
      "Side-by-side fixtures: where EML helps, where standard math wins, " +
      "where claims stay blocked. The honest comparison view.",
    color: C.orange,
  },
];

// Secondary spotlights — interactive surfaces that aren't the "start here" but
// reward curiosity.
const EXPLORE_FURTHER = [
  {
    href: "/lab",
    title: "Math Lab",
    eyebrow: "interactive · playground",
    text: "Hands-on experiments and experiences built on the EML grammar.",
    color: C.purple,
  },
  {
    href: "/challenge",
    title: "Challenge Board",
    eyebrow: "open problems · credited",
    text:
      "Construct sin, cos, π, i from eml(x,y) = exp(x) − ln(y). " +
      "Submit a construction, get credited permanently.",
    color: C.orange,
  },
  {
    href: "/explorer/eml-symbolic-regression",
    title: "EML Template Search",
    eyebrow: "research frontier · compare",
    text:
      "Compare fixed EML, standard, control, and baseline templates on the " +
      "prime residual fixture.",
    color: C.orange,
  },
];

// Under-the-hood surfaces — the research stack. Demoted from "start here" to
// "available if you want to go deep" — these are the tools that make sense
// AFTER you understand what Monogate is doing.
const RESEARCH_STACK = [
  {
    href: "/evidence",
    title: "Evidence Browser",
    sub: "Inspect artifacts by validation, replay, semantic strength, and claim flags.",
    color: C.green,
  },
  {
    href: "/explorer/eml-packets/builder",
    title: "Packet Builder",
    sub: "Draft Evidence Packet v0 JSON from AI answers, proofs, traces, hardware packets.",
    color: C.orange,
  },
  {
    href: "/explorer/rescue-suite",
    title: "Rescue Suite",
    sub: "Optimization-failure rescue packets, replay status, MachLib obligation routing.",
    color: C.green,
  },
  {
    href: "/proof-digestion",
    title: "Proof Digestion",
    sub: "Turn artifacts into core ideas, examples, reuse paths, and open questions.",
    color: C.orange,
  },
  {
    href: "/explorer/eml-ir-bridge",
    title: "EML IR Bridge",
    sub: "One EML expression as shared DAG, replay packet, and non-claim boundary.",
    color: C.orange,
  },
  {
    href: "/explorer/eml-packets",
    title: "Packet Gallery",
    sub: "Candidate EML expression packets from the private builder flow.",
    color: C.green,
  },
  {
    href: "/explorer/eml-atlas-annex",
    title: "Atlas Annex",
    sub: "Atlas-style identities, claim boundaries, and MachLib witness targets.",
    color: C.blue,
  },
];

// Ecosystem-status strip — three live-feeling cells under the hero. These
// signal "this is a real, active project" without requiring the visitor to
// click anything.
const ECOSYSTEM_STATUS = [
  {
    label: "EML kernels",
    value: "108",
    note: "Lean-verified in MachLib",
  },
  {
    label: "Hardware ports",
    value: "browser · ESP32 · FPGA",
    note: "running today",
  },
  {
    label: "Status feed",
    value: "monogate.net",
    note: "CI-emitted dashboard",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", maxWidth: 920, margin: "0 auto", padding: "0 18px 80px" }}>

      {/* Hero — lead with what EML is, not what the tools are. */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          monogate.dev — eml math language workbench
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 700, color: C.orange, fontFamily: "monospace", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.12 }}>
          Math you can verify.<br />
          <span style={{ color: C.green }}>Hardware that confirms it.</span>
        </h1>
        <p style={{ fontSize: 16, color: C.text, lineHeight: 1.7, maxWidth: 660, marginBottom: 24 }}>
          <strong style={{ color: C.text }}>EML</strong> is a single-operator math
          language — every expression reduces to one primitive,{" "}
          <code style={{ color: C.purple, fontSize: 14, fontFamily: "monospace" }}>
            eml(x, y) = exp(x) − ln(y)
          </code>
          . Every kernel ships with a Lean proof. The same kernel runs in your
          browser, on an ESP32, and as a synthesizable FPGA block.
        </p>
        {/* Capability badges — the "where it runs / how it's checked" strip. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "browser", color: C.blue },
            { label: "ESP32", color: C.green },
            { label: "FPGA", color: C.green },
            { label: "Lean-verified", color: C.purple },
            { label: "evidence-packeted", color: C.orange },
          ].map(({ label, color }) => (
            <span
              key={label}
              style={{
                fontSize: 10, color, background: `${color}10`,
                border: `1px solid ${color}33`, borderRadius: 4,
                padding: "5px 10px", fontFamily: "monospace",
                letterSpacing: "0.08em", textTransform: "uppercase",
              }}
            >
              {label}
            </span>
          ))}
        </div>
        {/* Primary CTAs — three doorways: Explorer (what), Electronics (proof
            of life), Learn (next step). */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/explorer/eml-language"
            style={{
              fontSize: 13, color: C.bg, background: C.blue,
              border: `1px solid ${C.blue}`, borderRadius: 5,
              padding: "10px 16px", textDecoration: "none", fontWeight: 700,
            }}
          >
            Try the Explorer →
          </a>
          <a
            href="/electronics"
            style={{
              fontSize: 13, color: C.green,
              background: "rgba(74,222,128,0.07)",
              border: `1px solid rgba(74,222,128,0.32)`, borderRadius: 5,
              padding: "10px 16px", textDecoration: "none", fontWeight: 700,
            }}
          >
            Open Electronics Lab
          </a>
          <a
            href="/learn"
            style={{
              fontSize: 13, color: C.purple,
              background: "rgba(167,139,250,0.07)",
              border: `1px solid rgba(167,139,250,0.32)`, borderRadius: 5,
              padding: "10px 16px", textDecoration: "none", fontWeight: 700,
            }}
          >
            Learn EML
          </a>
        </div>
      </section>

      {/* Ecosystem-status strip — three cells showing this is alive. */}
      <section
        aria-label="Ecosystem status"
        style={{
          marginBottom: 56,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: 10,
        }}
      >
        {ECOSYSTEM_STATUS.map(({ label, value, note }) => (
          <div
            key={label}
            style={{
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 14, color: C.text, fontFamily: "monospace", fontWeight: 700, marginBottom: 4 }}>
              {value}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>
              {note}
            </div>
          </div>
        ))}
      </section>

      {/* Primary spotlights — the four cards a first-time visitor should try. */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Start here
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {PRIMARY_SPOTLIGHTS.map(({ href, title, eyebrow, text, color }) => (
            <a
              key={href}
              href={href}
              style={{
                display: "block", minHeight: 170,
                background: C.surface,
                border: `1px solid ${color}33`,
                borderRadius: 8,
                padding: "18px 20px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontSize: 9, color, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 12 }}>
                {eyebrow}
              </div>
              <div style={{ fontSize: 17, color, fontWeight: 700, marginBottom: 8 }}>{title}</div>
              <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{text}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Explore further — interactive surfaces, medium prominence. */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          Try something
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
          {EXPLORE_FURTHER.map(({ href, title, eyebrow, text, color }) => (
            <a
              key={href}
              href={href}
              style={{
                display: "block", minHeight: 130,
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "14px 16px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ fontSize: 9, color, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 8 }}>
                {eyebrow}
              </div>
              <div style={{ fontSize: 14, color, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{text}</div>
            </a>
          ))}
        </div>
      </section>

      {/* How it works — kept from the original; useful for visitors who want
          to understand the workbench contract before clicking deeper. */}
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

      {/* Research stack — the previously-prominent internal nouns (Evidence
          Packets, Rescue Traces, Proof Digestion, EML IR Bridge, Atlas Annex,
          Packet Gallery). Demoted from "start here" to "the tools that make
          sense after you understand Monogate". Visually smaller, set apart by
          its own heading and a thin divider strip. */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 28 }}>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            Research stack
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>
            Under the hood — the evidence machinery.
          </h2>
          <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginBottom: 18, maxWidth: 600 }}>
            Once you know what EML is, these are the workbenches that make
            Monogate&apos;s claims auditable. Each surface is bounded — what is
            simulated, candidate-only, or public-ready is marked inline.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8 }}>
            {RESEARCH_STACK.map(({ href, title, sub, color }) => (
              <a
                key={href}
                href={href}
                style={{
                  display: "block",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "12px 14px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 5 }}>{title}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{sub}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer links */}
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
