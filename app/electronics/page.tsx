import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monogate Electronics - monogate.dev",
  description:
    "Monogate Electronics is the hardware learning layer for guarded EML loops, starting with Reflex Lab 01 on Trainer Board v0.",
};

const C = {
  bg: "#080c0f",
  panel: "#10171a",
  panel2: "#141d20",
  border: "rgba(142, 224, 178, 0.22)",
  text: "#eef3f4",
  muted: "#aebcba",
  dim: "#6f807e",
  green: "#8ee0b2",
  gold: "#fff2a6",
  red: "#ff6476",
  blue: "#52a8f7",
};

const LOOP = ["wire input", "EML kernel", "guard output", "observe hardware", "trace", "replay evidence"];

const TRACKS = [
  {
    label: "Arduino / ESP32",
    title: "Reflex Lab Series",
    href: "/electronics/trainer-board-v0",
    cta: "Open Trainer Board v0",
    status: "active",
    text: "Start with Trainer Board v0 and build the pot-to-guarded-LED loop in simulation and on hardware.",
  },
  {
    label: "FPGA",
    title: "Forge Logic Series",
    href: "/electronics/arty-a7",
    cta: "Preview Arty A7 roadmap",
    status: "roadmap",
    text: "Arty A7, Forge, EML, Pmods, and verifiable signal projects after the first reflex labs are solid.",
  },
  {
    label: "Later",
    title: "Field Systems Series",
    href: "/learn/eml/play",
    cta: "Learn the kernel pattern",
    status: "planned",
    text: "Sensors, soundfield, hydro, and field-capsule projects reuse the same evidence-producing loop.",
  },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ margin: 0, color: C.green, fontSize: 12, fontWeight: 900, letterSpacing: 0, textTransform: "uppercase" }}>
      {children}
    </p>
  );
}

export default function ElectronicsPage() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <section
        style={{
          width: "min(1120px, calc(100vw - 32px))",
          margin: "0 auto",
          padding: "72px 0 44px",
          display: "grid",
          gap: 28,
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Label>monogate.dev / electronics</Label>
          <h1 style={{ margin: 0, maxWidth: 820, fontSize: "clamp(44px, 8vw, 86px)", lineHeight: 0.95 }}>
            Hardware Learning Layer
          </h1>
          <p style={{ margin: 0, maxWidth: 720, color: C.muted, fontSize: 18, lineHeight: 1.45 }}>
            Build the circuit, run the EML kernel, watch the guard decision, and replay the evidence.
          </p>
        </div>

        <ol
          aria-label="Monogate electronics learning loop"
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 8,
          }}
        >
          {LOOP.map((step) => (
            <li
              key={step}
              style={{
                minHeight: 54,
                padding: 10,
                display: "grid",
                alignItems: "center",
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                background: C.panel,
                color: C.text,
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
              }}
            >
              {step}
            </li>
          ))}
        </ol>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {TRACKS.map((track) => (
            <article
              key={track.title}
              style={{
                minHeight: 310,
                padding: 18,
                display: "grid",
                alignContent: "space-between",
                gap: 18,
                border: `1px solid ${track.status === "active" ? "rgba(142, 224, 178, 0.44)" : C.border}`,
                borderRadius: 8,
                background: C.panel,
                boxShadow: "0 18px 46px rgba(0, 0, 0, 0.24)",
              }}
            >
              <div style={{ display: "grid", gap: 10 }}>
                <span style={{ color: C.green, fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>
                  {track.label}
                </span>
                <h2 style={{ margin: 0, fontSize: 26, lineHeight: 1.08 }}>{track.title}</h2>
                <p style={{ margin: 0, color: C.muted, fontSize: 14, lineHeight: 1.48 }}>{track.text}</p>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <span style={{ color: track.status === "active" ? C.gold : C.dim, fontSize: 12, fontWeight: 900 }}>
                  {track.status}
                </span>
                <a
                  href={track.href}
                  style={{
                    minHeight: 40,
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    background: track.status === "active" ? "rgba(31, 88, 58, 0.82)" : C.panel2,
                    color: track.status === "active" ? "#dffff0" : C.text,
                    fontSize: 13,
                    fontWeight: 900,
                    textDecoration: "none",
                  }}
                >
                  {track.cta}
                </a>
              </div>
            </article>
          ))}
        </div>

        <section style={{ padding: 18, border: `1px solid ${C.border}`, borderRadius: 8, background: C.panel }}>
          <Label>first flagship course</Label>
          <h2 style={{ margin: "10px 0 8px", fontSize: 28 }}>Reflex Lab 01: Pot to Guarded LED</h2>
          <p style={{ margin: 0, color: C.muted, fontSize: 14, lineHeight: 1.65 }}>
            Trainer Board v0 teaches one complete Monogate loop:
            potentiometer input, threshold_reflex_v0, guard clamp, LED output,
            simulated terminal, replay, and an evidence packet.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <a href="/electronics/trainer-board-v0/lab" style={{ color: C.green, fontWeight: 900 }}>
              Launch simulated lab
            </a>
            <a href="/electronics/trainer-board-v0/physical" style={{ color: C.blue, fontWeight: 900 }}>
              Open physical build
            </a>
          </div>
        </section>

        <section
          style={{
            padding: 18,
            border: "1px solid rgba(255, 100, 118, 0.24)",
            borderRadius: 8,
            background: "rgba(255, 100, 118, 0.06)",
          }}
        >
          <Label>public boundary</Label>
          <p style={{ margin: "10px 0 0", color: C.muted, fontSize: 13, lineHeight: 1.65 }}>
            The interactive lab is a static public artifact. Internal repo folders,
            funding packets, handoff notes, evidence workspaces, and private
            planning documents are not part of this deployed page.
          </p>
        </section>
      </section>
    </main>
  );
}
