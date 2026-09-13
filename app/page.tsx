import type { Metadata } from "next";
import labSource from "../public/electronics-lab/SOURCE.json";

export const metadata: Metadata = {
  title: "monogate.dev — EML math language playground",
  description:
    "EML — a single-operator math language whose contracts compile to Lean " +
    "theorems and whose kernels compile to C, Python and Verilog. Learn EML, " +
    "try the Electronics Lab, and reproduce what the site checks.",
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

// Hardware is read from the Electronics Lab's SOURCE.json at build time, never
// typed here. monogate-electronics derives that file's hardware_evidence block
// from its evidence packets: a track reads hardware_observed only where a
// packet records a capture from a real board. Until 2026-09-12 this page said
// "browser · ESP32 · FPGA — running today" while the same file recorded
// hardware_observed: false for ESP32.
const HARDWARE = labSource.hardware_evidence;
const TRACKS = Object.values(HARDWARE.tracks);
const OBSERVED = TRACKS.filter((t) => t.hardware_observed);
const OBSERVED_LABELS = OBSERVED.map((t) => t.label).join(", ") || "none";
const NOT_OBSERVED_LABELS = TRACKS.filter((t) => !t.hardware_observed).map((t) => t.label).join(", ");
const CAPTURE_PACKETS = OBSERVED.reduce((n, t) => n + t.live_capture_packets, 0);
const EVIDENCE_DATE = HARDWARE.generated_at.slice(0, 10);

const FLOW_STEPS: { n: string; text: string; sub: string }[] = [
  {
    n: "01",
    text: "Write a kernel",
    sub: "A function with requires and ensures. Learn EML starts here.",
  },
  {
    n: "02",
    text: "Compile it",
    sub: "pip install monogate-forge, then eml-compile to C, Verilog, Lean and more.",
  },
  {
    n: "03",
    text: "Ask Lean what is proved",
    sub: "Run #print axioms against MachLib. No sorryAx in the list means the theorem is proved.",
  },
  {
    n: "04",
    text: "Take it to hardware",
    sub:
      "The Electronics Lab's courses start in a simulator. Board captures on record: " +
      `${OBSERVED_LABELS}; none for ${NOT_OBSERVED_LABELS}.`,
  },
  {
    n: "05",
    text: "Go deeper",
    sub: "The research record lives on monogate.org, and the Lean library the lessons' theorems import on machlib.org.",
  },
];

// Primary spotlights — what a first-time visitor should try.
// The Explorer card went with the 2026-09-12 product-wave archive (git tag
// attic/product-wave-2026-09): it rendered May fixtures that nothing re-derives.
const PRIMARY_SPOTLIGHTS = [
  {
    href: "/electronics",
    title: "Electronics Lab",
    eyebrow: "courses · esp32 / fpga / robotics",
    text:
      "Hands-on hardware courses that start in a simulator, each with its " +
      `evidence boundary stated. Board captures on record: ${OBSERVED_LABELS}.`,
    color: C.green,
  },
  {
    href: "/learn",
    title: "Learn EML",
    eyebrow: "tutorials · quick start",
    text:
      "Step-by-step courses in EML and Forge: write a kernel, compile it, " +
      "and read Lean's verdict on its contract.",
    color: C.purple,
  },
  {
    href: "/docs",
    title: "Reproduce",
    eyebrow: "what you can re-run",
    text:
      "Install the compiler you get from PyPI, run the commands this site checks, " +
      "and see which checks run on private repositories.",
    color: C.blue,
  },
];

// Status strip — each cell comes from a source, not from memory.
// The MachLib figure is a floor ("N+") checked against machlib's README by
// scripts/check_site_figures.mjs; change it there and here together. The
// hardware cell is read from SOURCE.json (above).
const ECOSYSTEM_STATUS = [
  {
    label: "MachLib theorems",
    value: "7 600+",
    note: "machine-checked in Lean 4 · machlib.org",
  },
  {
    label: "Board captures",
    value: OBSERVED_LABELS,
    note: `${CAPTURE_PACKETS} capture packets · none for ${NOT_OBSERVED_LABELS} · lab SOURCE.json, ${EVIDENCE_DATE}`,
  },
  {
    label: "Status feed",
    value: "monogate.net",
    note: "renders machlib's CI status file",
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", maxWidth: 920, margin: "0 auto", padding: "0 18px 80px" }}>

      {/* Hero — lead with what EML is, not what the tools are. Until
          2026-09-12 the heading was "Math you can verify. Hardware that
          confirms it."; nothing checked the second half. */}
      <section style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          monogate.dev — eml math language workbench
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 700, color: C.orange, fontFamily: "monospace", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.12 }}>
          Math you can check.<br />
          <span style={{ color: C.green }}>Compiled to C, Verilog and Lean.</span>
        </h1>
        <p style={{ fontSize: 16, color: C.text, lineHeight: 1.7, maxWidth: 660, marginBottom: 24 }}>
          <strong style={{ color: C.text }}>EML</strong> is a single-operator math
          language — every expression reduces to one primitive,{" "}
          <code style={{ color: C.purple, fontSize: 14, fontFamily: "monospace" }}>
            eml(x, y) = exp(x) − ln(y)
          </code>
          . A kernel&apos;s contract compiles to a Lean theorem, and Lean
          reports whether it is proved. The same source compiles to C, Python
          and Verilog with the compiler{" "}
          <code style={{ color: C.purple, fontSize: 14, fontFamily: "monospace" }}>
            pip install monogate-forge
          </code>{" "}
          gives you, and every compile command on this site is run against
          that release before each deploy.
        </p>
        {/* Target badges — the targets the lessons compile to. Every command
            that emits one is run by scripts/check_site_commands.mjs. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {[
            { label: "C", color: C.blue },
            { label: "Python", color: C.blue },
            { label: "Verilog", color: C.green },
            { label: "Lean", color: C.purple },
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
        {/* Primary CTAs — Level 1 (the first thing to do), Electronics, the
            Learn hub. "Try the Explorer" went with the 2026-09-12 archive. */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a
            href="/learn/eml/intro"
            style={{
              fontSize: 13, color: C.bg, background: C.blue,
              border: `1px solid ${C.blue}`, borderRadius: 5,
              padding: "10px 16px", textDecoration: "none", fontWeight: 700,
            }}
          >
            Start with Level 1 →
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- /electronics is a route handler serving the Vite electronics app, not a Next page: it needs a full page load */}
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

      {/* Status strip — three cells, each read from a source. */}
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

      {/* Primary spotlights — the cards a first-time visitor should try. */}
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

      {/* The "Try something" section (Math Lab, Challenge Board) went with the
          2026-09-12 product-wave archive; see /archive. */}

      {/* How it works — kept from the original; useful for visitors who want
          to understand the workbench contract before clicking deeper. */}
      <section style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
          How it works
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 6, lineHeight: 1.3 }}>
          From a formula to generated code and a Lean verdict.
        </h2>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
          The loop: write the kernel, compile it, ask Lean what is proved, then
          measure it on a board if you have one wired up.
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
          <a href="https://machlib.org" style={{ color: C.orange, fontWeight: 700 }}>machlib.org</a> is the Lean library the lessons&apos; theorems import,{" "}
          <a href="https://monogate.net" style={{ color: C.orange, fontWeight: 700 }}>monogate.net</a> renders machlib&apos;s CI status file, and{" "}
          <a href="https://1op.io" style={{ color: C.orange, fontWeight: 700 }}>1op.io</a> is games and visualization.
        </div>
      </section>

      {/* The research-stack section (Evidence Browser, Bundle Builder, Rescue
          Suite, Proof Digestion, IR Bridge, Bundle Gallery, Atlas Annex) was
          archived on 2026-09-12; see /archive and git tag
          attic/research-stack-2026-06. */}

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
