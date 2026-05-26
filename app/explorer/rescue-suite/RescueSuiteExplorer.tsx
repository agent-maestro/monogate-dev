"use client";

import { useEffect, useMemo, useState } from "react";
import { boundaryFlags, explorerFixture, lanes, replayStatus, type TraceFrame } from "./data";

const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  surface2: "#12151f",
  border: "#1c1f2e",
  border2: "#252836",
  text: "#d4d4d4",
  muted: "#6d7085",
  orange: "#e8a020",
  green: "#4ade80",
  blue: "#6ab0f5",
  red: "#f87171",
};

const humanCopy: Record<string, { problem: string; rescue: string; proof: string; limit: string }> = {
  log_domain_lift: {
    problem: "The raw sample asks log-domain math to evaluate at a non-positive coordinate.",
    rescue: "Forge replays the sample through a positive internal coordinate produced by the log-domain lift.",
    proof: "MachLib now has a concrete positive-coordinate witness theorem for this lane, plus the existing packet obligation route.",
    limit: "This is a sample-level witness and packet bridge, not a full semantic rewrite theorem for arbitrary programs.",
  },
  guard_clamp: {
    problem: "The raw expression hits overflow pressure and loses finite output.",
    rescue: "Forge replays the sample through a bounded guard coordinate.",
    proof: "The packet routes to an output-safety obligation and carries a transition witness.",
    limit: "The optimizer is not yet claiming production rewrite behavior.",
  },
  precision_escape: {
    problem: "Low precision makes the sample look stuck in a phantom attractor.",
    rescue: "Forge replays at higher precision and exposes an interior escape direction.",
    proof: "The packet routes to a precision-sensitivity obligation and keeps the transition explicit.",
    limit: "The lane is replay evidence, not a universal convergence guarantee.",
  },
  saturation_deshelf: {
    problem: "A clamp shelf hides useful boundary pressure behind saturated output.",
    rescue: "Forge replays pre-clamp pressure so the boundary structure becomes measurable again.",
    proof: "The packet routes to a clamp-invariant obligation with a transition witness.",
    limit: "No hardware observation or full semantic proof is claimed for v0.",
  },
};

function codePill(text: string, color = C.orange) {
  return (
    <code style={{
      display: "inline-flex",
      maxWidth: "100%",
      overflowWrap: "anywhere",
      color,
      border: `1px solid ${color}33`,
      background: `${color}12`,
      borderRadius: 4,
      padding: "3px 7px",
      fontSize: 11,
      lineHeight: 1.4,
    }}>
      {text}
    </code>
  );
}

function valueText(value: unknown) {
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "non-finite";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function payloadRows(payload: Record<string, unknown>) {
  return Object.entries(payload).filter(([key]) => key !== "event_class");
}

function PayloadPanel({ title, frame, payload, color }: { title: string; frame: TraceFrame; payload: Record<string, unknown>; color: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface2, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <div style={{ color, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
        {frame.isWitness ? codePill("witness", color) : codePill("context", C.muted)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(88px, 0.45fr) minmax(0, 1fr)", gap: "7px 10px", fontSize: 11 }}>
        <span style={{ color: C.muted }}>event</span>
        <strong style={{ color }}>{valueText(payload.event_class)}</strong>
        {payloadRows(payload).map(([key, value]) => (
          <div key={`${title}-${frame.sample}-${key}`} style={{ display: "contents" }}>
            <span style={{ color: C.muted, overflowWrap: "anywhere" }}>{key}</span>
            <strong style={{ color: C.text, overflowWrap: "anywhere", fontWeight: 600 }}>{valueText(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RescueSuiteExplorer() {
  const [active, setActive] = useState(0);
  const [showWitnessOnly, setShowWitnessOnly] = useState(false);
  const [frameCursor, setFrameCursor] = useState(0);
  const [viewMode, setViewMode] = useState<"human" | "machine">("human");
  const lane = lanes[active];
  const human = humanCopy[lane.operator];
  const witnessCount = useMemo(
    () => lanes.filter(item => item.frames.some(frame => frame.transition === item.transition)).length,
    []
  );
  const visibleFrames = showWitnessOnly ? lane.frames.filter(frame => frame.isWitness) : lane.frames;
  const selectedFrame = visibleFrames[Math.min(frameCursor, Math.max(visibleFrames.length - 1, 0))] ?? lane.frames[0];

  useEffect(() => {
    setFrameCursor(0);
  }, [active, showWitnessOnly]);

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 16px 72px", background: C.bg }}>
      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(260px, 0.6fr)", gap: 16, alignItems: "stretch", marginBottom: 16 }}>
        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Explorer / Rescue Suite
          </div>
          <h1 style={{ color: C.text, fontSize: 28, lineHeight: 1.15, margin: "0 0 10px", letterSpacing: 0 }}>
            Proof-carrying rescue suite
          </h1>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, maxWidth: 740, margin: 0 }}>
            Software replay surface for Forge boundary-event rescue packets. Each lane shows the raw event,
            named rescue operator, witness transition, trace frames, and MachLib obligation routed by the v0 manifest.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {codePill(explorerFixture.schemaVersion, C.blue)}
            {codePill(explorerFixture.generatedFrom.suite, C.orange)}
          </div>
          <div style={{ display: "inline-grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginTop: 14, border: `1px solid ${C.border}`, borderRadius: 8, padding: 4 }}>
            {(["human", "machine"] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                style={{
                  minWidth: 88,
                  border: "none",
                  borderRadius: 5,
                  background: viewMode === mode ? C.orange : "transparent",
                  color: viewMode === mode ? C.bg : C.muted,
                  padding: "7px 9px",
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <aside style={{ border: `1px solid ${replayStatus.valid ? C.green : C.red}55`, background: replayStatus.valid ? "#0d1712" : "#1b1012", borderRadius: 8, padding: 18 }}>
          <div style={{ color: replayStatus.valid ? C.green : C.red, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Replay status
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, fontSize: 12 }}>
            <span style={{ color: C.muted }}>valid</span><strong style={{ color: replayStatus.valid ? C.green : C.red }}>{String(replayStatus.valid)}</strong>
            <span style={{ color: C.muted }}>issues</span><strong style={{ color: C.text }}>{replayStatus.issueCount}</strong>
            <span style={{ color: C.muted }}>lanes</span><strong style={{ color: C.text }}>{replayStatus.laneCount}</strong>
            <span style={{ color: C.muted }}>witnesses</span><strong style={{ color: C.text }}>{witnessCount}</strong>
            <span style={{ color: C.muted }}>fixture</span><strong style={{ color: C.text }}>generated</strong>
          </div>
        </aside>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
        {lanes.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.operator}
              type="button"
              onClick={() => setActive(index)}
              style={{
                minHeight: 104,
                textAlign: "left",
                border: `1px solid ${selected ? item.accent : C.border}`,
                background: selected ? `${item.accent}12` : C.surface,
                color: C.text,
                borderRadius: 8,
                padding: 12,
              }}
            >
              <div style={{ color: item.accent, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
                {item.operator}
              </div>
              <div style={{ color: C.text, fontSize: 12, lineHeight: 1.45, overflowWrap: "anywhere" }}>
                {item.transition}
              </div>
            </button>
          );
        })}
      </section>

      {viewMode === "human" && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10, marginBottom: 16 }}>
          {[
            ["What failed", human.problem, C.red],
            ["What rescue did", human.rescue, lane.accent],
            ["What is proven", human.proof, C.green],
            ["What is not claimed", human.limit, C.muted],
          ].map(([title, body, color]) => (
            <article key={title} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14 }}>
              <div style={{ color, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
              <p style={{ color: C.text, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{body}</p>
            </article>
          ))}
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.05fr)", gap: 16, marginBottom: 16 }}>
        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: lane.accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Lane contract
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>source fixture</div>
              {codePill(lane.source, lane.accent)}
            </div>
            {viewMode === "machine" && (
              <div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>function family</div>
                {codePill(lane.fixture, C.text)}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>raw event</div>
                {codePill(lane.fromEvent, C.red)}
              </div>
              <div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>rescued event</div>
                {codePill(lane.toEvent, lane.accent)}
              </div>
            </div>
            <div>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>MachLib obligation</div>
              {codePill(lane.obligation, C.green)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>samples</div>
                {codePill(String(lane.summary.sampleCount), C.text)}
              </div>
              <div>
                <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>rescued events</div>
                {codePill(String(lane.summary.rescuedEventCount), lane.accent)}
              </div>
            </div>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              {viewMode === "human" ? human.rescue : lane.claim}
            </p>
          </div>
        </div>

        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: lane.accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Trace frames
            </div>
            <button
              type="button"
              onClick={() => setShowWitnessOnly(value => !value)}
              style={{
                color: showWitnessOnly ? C.bg : lane.accent,
                background: showWitnessOnly ? lane.accent : `${lane.accent}12`,
                border: `1px solid ${lane.accent}66`,
                borderRadius: 6,
                padding: "6px 8px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {showWitnessOnly ? "All frames" : "Witness only"}
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620 }}>
              <thead>
                <tr>
                  {["#", "input", "raw", "rescue", "metric"].map(head => (
                    <th key={head} style={{ color: C.muted, fontSize: 10, textAlign: "left", borderBottom: `1px solid ${C.border2}`, padding: "0 8px 8px" }}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleFrames.map((frame, index) => {
                  const selectedFrameRow = selectedFrame.sample === frame.sample && selectedFrame.input === frame.input;
                  return (
                  <tr
                    key={`${lane.operator}-${frame.sample}-${frame.input}`}
                    onClick={() => setFrameCursor(index)}
                    style={{ cursor: "pointer", background: selectedFrameRow ? `${lane.accent}10` : "transparent" }}
                  >
                    <td style={{ color: C.muted, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{frame.sample}</td>
                    <td style={{ color: C.text, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}`, overflowWrap: "anywhere" }}>{frame.input}</td>
                    <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{codePill(frame.rawEvent, C.red)}</td>
                    <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{codePill(frame.rescueEvent, lane.accent)}</td>
                    <td style={{ color: C.muted, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}`, overflowWrap: "anywhere" }}>{frame.metric}</td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {viewMode === "machine" ? (
        <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16, marginBottom: 16 }}>
          <PayloadPanel title="Before rescue" frame={selectedFrame} payload={selectedFrame.raw} color={C.red} />
          <PayloadPanel title="After rescue" frame={selectedFrame} payload={selectedFrame.rescued} color={lane.accent} />
        </section>
      ) : (
        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18, marginBottom: 16 }}>
          <div style={{ color: lane.accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Selected sample
          </div>
          <p style={{ color: C.text, fontSize: 13, lineHeight: 1.75, margin: 0 }}>
            Sample {selectedFrame.sample}: {selectedFrame.input}. The event moves from {selectedFrame.rawEvent} to {selectedFrame.rescueEvent}; {selectedFrame.metric}.
          </p>
        </section>
      )}

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Manifest
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {codePill(replayStatus.manifest, C.blue)}
            {codePill(replayStatus.replay, C.green)}
            {codePill(replayStatus.sourceSchema, C.orange)}
          </div>
        </div>

        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Claim boundaries
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "7px 12px", fontSize: 11 }}>
            {boundaryFlags.map(([name, value]) => (
              <div key={name} style={{ display: "contents" }}>
                <span style={{ color: C.muted, overflowWrap: "anywhere" }}>{name}</span>
                <strong style={{ color: value ? C.green : C.text }}>{String(value)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 860px) {
          main section {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          main {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
        }
      `}</style>
    </main>
  );
}
