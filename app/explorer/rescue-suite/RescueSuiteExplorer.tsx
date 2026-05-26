"use client";

import { useMemo, useState } from "react";
import { boundaryFlags, lanes, replayStatus } from "./data";

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

export default function RescueSuiteExplorer() {
  const [active, setActive] = useState(0);
  const lane = lanes[active];
  const witnessCount = useMemo(
    () => lanes.filter(item => item.frames.some(frame => frame.transition === item.transition)).length,
    []
  );

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
            <div>
              <div style={{ color: C.muted, fontSize: 10, marginBottom: 5 }}>function family</div>
              {codePill(lane.fixture, C.text)}
            </div>
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
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: 0 }}>{lane.claim}</p>
          </div>
        </div>

        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: lane.accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Trace frames
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
                {lane.frames.map(frame => (
                  <tr key={`${lane.operator}-${frame.sample}-${frame.input}`}>
                    <td style={{ color: C.muted, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{frame.sample}</td>
                    <td style={{ color: C.text, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}`, overflowWrap: "anywhere" }}>{frame.input}</td>
                    <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{codePill(frame.rawEvent, C.red)}</td>
                    <td style={{ padding: "10px 8px", borderBottom: `1px solid ${C.border}` }}>{codePill(frame.rescueEvent, lane.accent)}</td>
                    <td style={{ color: C.muted, fontSize: 11, padding: "10px 8px", borderBottom: `1px solid ${C.border}`, overflowWrap: "anywhere" }}>{frame.metric}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

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
