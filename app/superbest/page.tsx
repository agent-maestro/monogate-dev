"use client";
import { useState } from "react";
import superbest from "../../data/superbest_v5_table.json";

const C = {
  bg: "#06060a", surface: "#0d0e1c", border: "#191b2e",
  text: "#cdd0e0", muted: "#4e5168", accent: "#4facfe",
  green: "#5ec47a", red: "#c85050", mono: "monospace",
};

type Op = (typeof superbest.table)[number];

function SectionHead({ children, mt = 48 }: { children: React.ReactNode; mt?: number }) {
  return (
    <h2 style={{
      fontFamily: C.mono, fontSize: "0.95rem", fontWeight: 700, color: C.text,
      margin: `${mt}px 0 8px`, borderBottom: `1px solid ${C.border}`, paddingBottom: 8,
    }}>{children}</h2>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontFamily: C.mono, fontSize: "0.8rem", color: C.muted, margin: "20px 0 6px" }}>{children}</h3>;
}

function Th({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <th style={{
      textAlign: "left", padding: "8px 12px", borderBottom: `1px solid ${C.border}`,
      color: color ?? C.muted, fontWeight: 400, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em",
    }}>{children}</th>
  );
}

function Td({ children, bold, color, small, maxW }: { children: React.ReactNode; bold?: boolean; color?: string; small?: boolean; maxW?: number }) {
  return (
    <td style={{
      padding: "9px 12px", borderBottom: `1px solid ${C.border}`, verticalAlign: "top",
      fontWeight: bold ? 700 : 400, color: color ?? C.text,
      fontSize: small ? 11 : 13, maxWidth: maxW,
    }}>{children}</td>
  );
}

function Cat({ v }: { v: string }) {
  const first = v.split("/")[0].toLowerCase();
  const bg = first === "a" ? "rgba(94,196,122,0.15)" : first === "b" ? "rgba(79,172,254,0.12)" : "rgba(200,80,80,0.12)";
  const col = first === "a" ? C.green : first === "b" ? C.accent : C.red;
  return <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: bg, color: col }}>{v}</span>;
}

export default function SuperBESTPage() {
  const [domain, setDomain] = useState<"positive" | "general">("positive");
  const ops: Op[] = superbest.table;
  const totals = superbest.totals;
  const extOps = superbest.extended_operators;
  const hi = superbest.high_impact;
  const summary = superbest.savings_summary;
  const lock = superbest.taxonomy_lock;

  const headline = domain === "positive" ? totals.positive_headline : totals.general_headline;

  const hiCols = (
    <tr>
      <Th>Expression</Th>
      <Th>Naive</Th>
      <Th color={C.accent}>F16 (Layer 1)</Th>
      <Th color={C.green}>23-op (Layer 2)</Th>
      <Th>Saving type</Th>
    </tr>
  );

  function HiRow({ row }: { row: { expr: string; naive?: number; f16: number | string; op23: number | string; type?: string; reason?: string } }) {
    return (
      <tr>
        <Td><code style={{ fontSize: 11, color: C.muted }}>{row.expr}</code></Td>
        {"naive" in row ? <Td color={C.muted}>{row.naive}n</Td> : <Td color={C.muted}>—</Td>}
        <Td bold color={C.accent}>{row.f16 === "inf" ? "∞" : `${row.f16}n`}</Td>
        <Td bold color={C.green}>{row.op23 === "inf" ? "∞" : `${row.op23}n`}</Td>
        <Td small color={C.muted} maxW={200}>{row.type ?? row.reason}</Td>
      </tr>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: C.mono }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Meta */}
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span>SuperBEST {superbest.version}</span>
          <span>{superbest.date}</span>
          <span>arXiv:2603.21852</span>
          <span style={{ background: "rgba(79,172,254,0.1)", border: `1px solid ${C.accent}`, color: C.accent, padding: "2px 8px", borderRadius: 3, fontSize: 10 }}>
            Taxonomy Locked — {lock.total_operators} ops · No 24th exists
          </span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>SuperBEST Routing Table</h1>
        <p style={{ color: C.muted, marginBottom: 24, fontSize: 13 }}>
          Minimum F16-node constructions for every elementary arithmetic primitive.
          Taxonomy definitively closed: {lock.conj_no_op_24}.
        </p>

        {/* Two-layer policy */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 18px", marginBottom: 28, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          <strong style={{ color: C.text }}>Two-layer accounting policy — </strong>
          <span style={{ background: "rgba(79,172,254,0.12)", color: C.accent, padding: "1px 7px", borderRadius: 3, fontWeight: 700, margin: "0 4px" }}>Layer 1 (F16)</span>
          formal theorems, arXiv paper; only F16 orbit nodes counted.
          <span style={{ background: "rgba(94,196,122,0.12)", color: C.green, padding: "1px 7px", borderRadius: 3, fontWeight: 700, margin: "0 4px" }}>Layer 2 (23-op)</span>
          library/ML/physics use; extended operators count as 1n. Must be labeled.
        </div>

        {/* Domain toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["positive", "general"] as const).map(d => (
            <button key={d} onClick={() => setDomain(d)} style={{
              fontFamily: C.mono, fontSize: 11, padding: "6px 14px",
              border: `1px solid ${domain === d ? C.accent : C.border}`,
              borderRadius: 4, background: domain === d ? "rgba(79,172,254,0.08)" : C.surface,
              color: domain === d ? C.accent : C.muted, cursor: "pointer",
            }}>
              {d === "positive" ? "Positive domain (x > 0)" : "General domain (all ℝ)"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 32, fontSize: "0.9rem", fontWeight: 700, color: C.accent }}>{headline}</div>

        {/* Core arithmetic */}
        <SectionHead mt={0}>Core Arithmetic Primitives (F16 Layer 1)</SectionHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Operation</Th>
                <Th color={C.accent}>{domain === "positive" ? "Nodes (x>0)" : "Nodes (all ℝ)"}</Th>
                <Th>Naive</Th>
                <Th>Construction</Th>
                <Th>Notes</Th>
              </tr>
            </thead>
            <tbody>
              {ops.map((row) => {
                const cost = domain === "positive" ? row.cost_positive : row.cost_general;
                const constr = domain === "positive" ? row.construction_positive : row.construction_general;
                const isNum = typeof cost === "number";
                return (
                  <tr key={row.op}>
                    <Td><code style={{ color: C.text, fontSize: 13 }}>{row.op}</code></Td>
                    <Td bold color={isNum ? C.accent : C.muted}>{isNum ? `${cost}n` : "—"}</Td>
                    <Td color={C.muted}>{(row as any).v4_cost ?? "—"}</Td>
                    <Td><code style={{ fontSize: 11, color: C.muted }}>{String(constr)}</code></Td>
                    <Td small color={C.muted} maxW={200}>{row.notes}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Extended operators */}
        <SectionHead>Extended Operators (23-op Beyond F16)</SectionHead>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
          Cat A: genuine F16 algebraic shortcut. Cat B: genuine via EML sign-variant.
          Cat C: notation-only (23-op=1n; F16=3–4n; no F16 shortcut).
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Op</Th>
                <Th color={C.accent}>F16 cost (L1)</Th>
                <Th color={C.green}>23-op cost (L2)</Th>
                <Th>Genuine saving</Th>
                <Th>Category</Th>
                <Th>Description</Th>
              </tr>
            </thead>
            <tbody>
              {extOps.map((row) => (
                <tr key={row.op}>
                  <Td><code style={{ color: C.text }}>{row.op}</code></Td>
                  <Td bold color={C.accent}>{row.f16_cost}{typeof row.f16_cost === "number" ? "n" : ""}</Td>
                  <Td bold color={C.green}>{row.cost_23op}n</Td>
                  <Td color={C.muted}>{row.genuine_saving}</Td>
                  <Td><Cat v={String(row.category)} /></Td>
                  <Td small color={C.muted} maxW={200}>{row.desc}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* High-impact */}
        <SectionHead>High-Impact Expressions</SectionHead>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>{hi.note}</p>

        <SubHead>ML / Smooth Functions</SubHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>{hiCols}</thead>
            <tbody>{hi.ml.map((row, i) => <HiRow key={i} row={row} />)}</tbody>
          </table>
        </div>

        <SubHead>Quantum / Information</SubHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>{hiCols}</thead>
            <tbody>{hi.quantum.map((row, i) => <HiRow key={i} row={row} />)}</tbody>
          </table>
        </div>

        <SubHead>Physics</SubHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>{hiCols}</thead>
            <tbody>{hi.physics.map((row, i) => <HiRow key={i} row={row} />)}</tbody>
          </table>
        </div>

        <SubHead>Special Functions (all require infinite F16 depth)</SubHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><Th>Function</Th><Th>F16 / 23-op cost</Th><Th>Reason</Th></tr>
            </thead>
            <tbody>
              {hi.special_functions.map((row, i) => (
                <tr key={i}>
                  <Td><code style={{ fontSize: 11, color: C.muted }}>{row.expr}</code></Td>
                  <Td bold color={C.muted}>∞</Td>
                  <Td small color={C.muted}>{row.reason}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Savings summary */}
        <SectionHead>Honest Savings Summary</SectionHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Catalog</Th>
                <Th color={C.accent}>Layer 1 — F16 genuine</Th>
                <Th color={C.green}>Layer 2 — 23-op extended</Th>
              </tr>
            </thead>
            <tbody>
              {summary.catalogs.map((row, i) => (
                <tr key={i}>
                  <Td>{row.catalog}</Td>
                  <Td bold color={C.accent}>{row.layer1}</Td>
                  <Td bold color={C.green}>{row.layer2}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key results box */}
        <div style={{ marginTop: 48, padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: C.text, marginBottom: 12 }}>Key results</h2>
          <ul style={{ paddingLeft: 20, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li><strong style={{ color: C.text }}>Core table locked:</strong> 15n / 79.5% savings — canonical, unaffected by extended operators</li>
            <li><strong style={{ color: C.text }}>LSE corrected:</strong> ln(e^x+e^y) = 4n in F16 (was 5n); 2n in 23-op via EEA+ln</li>
            <li><strong style={{ color: C.text }}>Taxonomy closed:</strong> exactly 23 operators exist; CONJ_NO_OP_24 is a proved theorem</li>
            <li><strong style={{ color: C.text }}>softplus = 2n</strong> in both layers via EML(x,1/e)+ln (Category B: genuine F16)</li>
            <li><strong style={{ color: C.text }}>Aggregate genuine F16 savings: ~12%</strong> across all catalogs; ~40% with 23-op extended</li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 12, color: C.muted }}>
            Research: <a href="https://monogate.org/superbest" style={{ color: C.accent }}>monogate.org/superbest ↗</a> ·
            Explorer: <a href="/explorer" style={{ color: C.accent }}>monogate.dev/explorer</a>
          </p>
        </div>

      </div>
    </div>
  );
}
