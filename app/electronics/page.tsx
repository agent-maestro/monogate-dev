import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electronics — monogate.dev",
  description:
    "Monogate Electronics teaches guarded physical-computing loops with starter kernels, traces, dashboards, and evidence packets.",
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
  red: "#f87171",
};

const FLOW = [
  "sensor/input",
  "starter kernel",
  "guard",
  "physical output",
  "trace",
  "dashboard",
  "evidence packet",
];

const LESSONS = [
  {
    n: "01",
    title: "LED clamp",
    text: "Turn a potentiometer into a bounded LED output and record guard telemetry.",
  },
  {
    n: "02",
    title: "Piezo output",
    text: "Add an audible low-voltage output without changing the kernel contract.",
  },
  {
    n: "03",
    title: "Stepper motion",
    text: "Drive 28BYJ-48 motion through a ULN2003 driver and a documented boundary.",
  },
  {
    n: "04",
    title: "FPGA switch stream",
    text: "Represent the same loop as switch-driven frames for FPGA-style targets.",
  },
  {
    n: "05",
    title: "Evidence packets",
    text: "Package traces, reports, media, source, pin maps, and hashes for replay.",
  },
];

const KERNEL_FILES = [
  "kernel.json",
  "traces/golden_trace.jsonl",
  "esp32/threshold_reflex_v0.ino",
  "fpga/rtl/threshold_reflex_v0_stub.v",
  "tools/validate_trace.py",
];

function Label({ children, color = C.orange }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontSize: 10, color, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
      {children}
    </div>
  );
}

export default function ElectronicsPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", maxWidth: 680, margin: "0 auto", padding: "0 16px 80px" }}>
      <section style={{ marginBottom: 46 }}>
        <Label>monogate electronics</Label>
        <h1 style={{ color: C.text, fontSize: 32, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 14 }}>
          Starter kernels for guarded physical computing.
        </h1>
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.8, maxWidth: 610, marginBottom: 18 }}>
          Monogate Electronics is an education track for building small
          sensor-to-output loops that are traceable, replayable, and safe to
          reason about. The curriculum treats electronics projects as starter
          kernels: compact contracts with inputs, guards, physical outputs,
          traces, and evidence packets.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["low voltage", "guard telemetry", "trace replay", "starter kernels"].map((tag) => (
            <span
              key={tag}
              style={{
                border: `1px solid ${C.border2}`,
                borderRadius: 4,
                color: C.muted,
                fontSize: 10,
                padding: "5px 9px",
                background: C.surface,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label color={C.blue}>the loop</Label>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", color: C.text, fontSize: 12 }}>
            {FLOW.map((step, index) => (
              <span key={step} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                <span style={{ border: `1px solid ${C.border2}`, borderRadius: 4, padding: "4px 7px" }}>{step}</span>
                {index < FLOW.length - 1 ? <span style={{ color: C.orange }}>→</span> : null}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label color={C.green}>course 001</Label>
        <h2 style={{ color: C.text, fontSize: 20, marginBottom: 8 }}>Guarded Reflex Loops</h2>
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.75, marginBottom: 16 }}>
          A practical sequence from LED clamp to driver-mediated motion, with
          each lesson producing a trace that can be validated and replayed.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {LESSONS.map((lesson) => (
            <div key={lesson.n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "13px 16px", display: "flex", gap: 14 }}>
              <span style={{ color: C.orange, fontSize: 11, letterSpacing: "0.16em", flex: "0 0 auto" }}>{lesson.n}</span>
              <span>
                <div style={{ color: C.text, fontSize: 13, marginBottom: 3 }}>{lesson.title}</div>
                <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.6 }}>{lesson.text}</div>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label color={C.blue}>course 002</Label>
        <h2 style={{ color: C.text, fontSize: 20, marginBottom: 8 }}>Soundfield Kernels</h2>
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.75, marginBottom: 16 }}>
          A sound-reactive 64x64 LED matrix project. Learners start with
          simulated microphone features, render replayable matrix frames, then
          move toward INMP441 input and HUB75 panel hardware with explicit
          brightness and lit-pixel guards.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 9 }}>
          {["I2S microphone", "64x64 RGB matrix", "feature traces", "brightness guard"].map((item) => (
            <div key={item} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 13, color: C.text, fontSize: 12 }}>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label color={C.orange}>course 003</Label>
        <h2 style={{ color: C.text, fontSize: 20, marginBottom: 8 }}>Environmental Guard Node</h2>
        <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.75, marginBottom: 16 }}>
          A BME280 sensor and SSD1306 OLED become a small environmental node:
          temperature, humidity, pressure, stale-sensor behavior, local display
          state, and guarded LED/buzzer alerts.
        </p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
          <pre style={{ background: "#090b11", border: `1px solid ${C.border2}`, borderRadius: 6, padding: 14, color: C.green, fontSize: 11, overflowX: "auto", margin: 0 }}>
{`BME280 reading
-> environment_guard_v0
-> OLED state + guarded alert
-> JSONL trace
-> replay summary
-> evidence packet`}
          </pre>
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label>starter kernel</Label>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.text, fontSize: 15, marginBottom: 8 }}>starter kernel set</div>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.75, marginBottom: 12 }}>
            Compact teaching kernels for thresholding, rate limiting, mapping,
            stale-sensor handling, guard clamping, and evidence-friendly
            telemetry.
          </p>
          <pre style={{ background: "#090b11", border: `1px solid ${C.border2}`, borderRadius: 6, padding: 14, color: C.green, fontSize: 11, overflowX: "auto", marginBottom: 12 }}>
{`centered = (pot_raw - 0.55) / 0.10
target = clamp(centered + 0.5, 0.0, 1.0)
requested = rate_limit(previous, target, max_step=0.20)
safe = clamp(requested, 0.0, 0.85)`}
          </pre>
          <div style={{ display: "grid", gap: 6 }}>
            {[...KERNEL_FILES, "kernels/soundfield_energy_v0/", "kernels/environment_guard_v0/"].map((file) => (
              <code key={file} style={{ color: C.blue, fontSize: 11 }}>
                {file}
              </code>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: 46 }}>
        <Label color={C.red}>boundary</Label>
        <div style={{ background: "rgba(248,113,113,0.06)", border: `1px solid rgba(248,113,113,0.20)`, borderRadius: 8, padding: 18 }}>
          <p style={{ color: C.text, fontSize: 12, lineHeight: 1.75, marginBottom: 10 }}>
            This track is low-voltage education material. It does not teach
            mains switching, high-power actuator control, certified safety, or
            autonomous deployment.
          </p>
          <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.7 }}>
            Beginner outputs are current-limited LEDs, piezo buzzers through
            resistors, dashboard-only outputs, and driver-mediated stepper
            motion.
          </p>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", fontSize: 10, color: C.muted }}>
        <a href="/" style={{ color: C.muted }}>← monogate.dev</a>
        <span>Course source: monogate-electronics</span>
      </footer>
    </div>
  );
}
