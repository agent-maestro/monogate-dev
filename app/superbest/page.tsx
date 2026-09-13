"use client";
import { useState } from "react";
import superbest from "../../data/superbest_v5_table.json";

const C = {
  bg: "#06060a", surface: "#0d0e1c", border: "#191b2e",
  text: "#cdd0e0", muted: "#4e5168", accent: "#4facfe",
  green: "#5ec47a", red: "#c85050", mono: "monospace",
};

// The JSON table is heterogeneous: most rows carry a numeric `v4_cost`, one
// carries `v4_cost_add_pos`/`v4_cost_add_gen` instead. Intersect in the
// optional field rather than casting to `any` so the lookup below stays typed.
type Op = (typeof superbest.table)[number] & { v4_cost?: number };

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

// Provenance for the cost theory's named results, mechanised in MachLib/CostTheory.lean.
type LeanStatus = "proven" | "structural" | "scope" | "conjecture";

const STATUS: Record<LeanStatus, { label: string; bg: string; col: string }> = {
  proven: { label: "machine-checked", bg: "rgba(94,196,122,0.15)", col: C.green },
  structural: { label: "structural core", bg: "rgba(79,172,254,0.12)", col: C.accent },
  scope: { label: "out of scope", bg: "rgba(78,81,104,0.22)", col: C.muted },
  conjecture: { label: "conjecture", bg: "rgba(200,80,80,0.12)", col: C.red },
};

function StatusBadge({ s }: { s: LeanStatus }) {
  const st = STATUS[s];
  return <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 3, fontSize: 10, fontWeight: 700, background: st.bg, color: st.col, whiteSpace: "nowrap" }}>{st.label}</span>;
}

interface LeanResult { id: string; name: string; lean: string; status: LeanStatus; }

const LEAN_THEOREMS: LeanResult[] = [
  { id: "T38-NNP", name: "No-Nesting Penalty — composing operators is additive, no adapter/depth overhead", lean: "no_nesting_penalty", status: "proven" },
  { id: "T38", name: "Cost = Naive − Pattern − Sharing — the two savings account for exactly the naive/actual gap", lean: "t38_decomposition", status: "proven" },
  { id: "T40", name: "Additive Cost Law — independent branches sum exactly; sums are association-independent", lean: "additive_cost_law · sum_assoc_invariant", status: "proven" },
  { id: "T41-ISO", name: "Cross-domain cost invariance — isomorphic DAG topologies cost the same", lean: "iso_cost", status: "proven" },
  { id: "T42", name: "O(N) single-sum law — N equal-cost terms cost (α₀+3)·N − 3", lean: "cost_flatSum", status: "proven" },
  { id: "T42²", name: "O(N²) double-sum law — a nested N×N sum is an exact quadratic", lean: "cost_doubleSum", status: "proven" },
  { id: "P1–P3", name: "Basic properties — non-negativity, terminal characterisation, subadditivity", lean: "p1_nonneg · p2_*_cost_ge · p3_subadditive_*", status: "proven" },
  { id: "T41", name: "Four structural classes — classification well-defined; rational is the cost floor, mixed the ceiling", lean: "classify · rational_floor · mixed_ceiling", status: "structural" },
  { id: "P4", name: "Algebraic invariance — cost as a function of the computed FUNCTION, not the tree", lean: "—", status: "scope" },
  { id: "T42-QCC", name: "Quadratic Ceiling Conjecture — no closed form exceeds O(N²); empirical over 187 equations", lean: "—", status: "conjecture" },
];

function nodes(value: number | string): string {
  return value === "inf" ? "∞" : `${value}n`;
}

function savings(total: number, naive: number) {
  return { total, naive, pct: (((naive - total) / naive) * 100).toFixed(1) };
}

export default function SuperBESTPage() {
  const [domain, setDomain] = useState<"positive" | "general">("positive");
  const ops: Op[] = superbest.table;
  const totals = superbest.totals;
  const extOps = superbest.extended_operators;
  const hi = superbest.high_impact;
  const summary = superbest.savings_summary;
  const lock = superbest.taxonomy_lock;
  // The Key-results figures for LSE and softplus, and the 23-op unit cost, are
  // read from the tables below, which check_site_figures.mjs compares cell by
  // cell with monogate.org's copy before each deploy. Until 2026-09-13 they
  // were typed here.
  const mlRow = (prefix: string) => {
    const row = hi.ml.find((r) => r.expr.startsWith(prefix));
    if (!row) throw new Error(`/superbest: no high-impact ML row starts with ${prefix}`);
    return row;
  };
  const lse = mlRow("LSE");
  const softplus = mlRow("softplus");
  const layer2Costs = [...new Set(extOps.map((row) => row.cost_23op))];

  // The notes under the headline quote three core-table cells. They are read
  // from the table, which check_site_figures.mjs compares cell by cell with
  // monogate.org's copy, so a recount there cannot leave a stale count in a
  // sentence here. A cell with no count fails the build instead of rendering.
  const coreCount = (prefix: string, field: "cost_positive" | "cost_general") => {
    const row = ops.find((r) => r.op.startsWith(prefix));
    const value = row?.[field];
    if (typeof value !== "number") throw new Error(`/superbest: core row ${prefix} has no ${field}`);
    return value;
  };
  const lnPositive = coreCount("ln(", "cost_positive");
  const mulGeneral = coreCount("mul(", "cost_general");
  const divGeneral = coreCount("div(", "cost_general");

  // Headline figures are computed from the totals block, never typed as prose.
  // Its six integers are checked against python/monogate/superbest.py, the
  // canonical library, by scripts/check_site_figures.mjs before each deploy:
  // the F16 totals against SUPERBEST_F16_POS_* and SUPERBEST_F16_GEN_*, and the
  // count with ln x = EXL(0, x) as one node against SUPERBEST_V53_POS_*.
  // Until 2026-09-12 both headlines were hand-typed strings no gate read.
  const pos = savings(totals.savings_positive.superbest_positive_total, totals.savings_positive.naive_total);
  const gen = savings(totals.savings_general.superbest_general_total, totals.savings_general.naive_total);
  const exl = savings(totals.savings_positive_with_exl.superbest_positive_total_with_exl, totals.savings_positive_with_exl.naive_total);
  const headline = domain === "positive"
    ? `${pos.total}n / ${pos.pct}% savings (positive domain, ${ops.length}-op headline vs ${pos.naive}n naive, F16)`
    : `${gen.total}n / ${gen.pct}% savings (general domain, 6-op basket vs ${gen.naive}n naive, F16)`;
  // The core-arithmetic row of the savings summary: Layer 1 is the positive F16
  // headline; Layer 2 counts ln x = EXL(0, x) as one node, as monogate.org's does.
  const cell = (v: string) => (v === "=headline" ? `${pos.pct}%` : v === "=with_exl" ? `${exl.pct}%` : v);

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
            {lock.total_operators} operators catalogued · no 24th found (conjecture)
          </span>
        </div>

        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: C.text, marginBottom: 8 }}>SuperBEST Routing Table</h1>
        {/* Until 2026-09-12 this read "Taxonomy definitively closed: PROVED", and
            the badge said a 24th operator does not exist. No Lean proof of
            CONJ_NO_OP_24 exists in machlib, monogate-lean or monogate-research.
            Until 2026-09-13 it called the constructions minimum; nothing shows
            any count minimal, and monogate.org says "Best known". */}
        <p style={{ color: C.muted, marginBottom: 24, fontSize: 13 }}>
          Best known F16-node constructions for every elementary arithmetic primitive. Every count is an upper bound;
          none is shown to be minimal. Taxonomy: {lock.total_operators} operators. {lock.conj_no_op_24}.
        </p>

        {/* Two-layer policy */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "12px 18px", marginBottom: 28, fontSize: 12, color: C.muted, lineHeight: 1.8 }}>
          <strong style={{ color: C.text }}>Two-layer accounting policy — </strong>
          <span style={{ background: "rgba(79,172,254,0.12)", color: C.accent, padding: "1px 7px", borderRadius: 3, fontWeight: 700, margin: "0 4px" }}>Layer 1 (F16)</span>
          formal theorems, arXiv paper; which sixteen operators each table counts is said under the headline.
          <span style={{ background: "rgba(94,196,122,0.12)", color: C.green, padding: "1px 7px", borderRadius: 3, fontWeight: 700, margin: "0 4px" }}>Layer 2 (23-op)</span>
          library/ML/physics use; extended operators count as {layer2Costs.length === 1 ? `${layer2Costs[0]}n` : "their listed cost"}. Must be labeled.
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

        <div style={{ marginBottom: 16, fontSize: "0.9rem", fontWeight: 700, color: C.accent }}>{headline}</div>

        {/* What the core counts are, since monogate.org's F16 recount of
            2026-09-13. Every count in these two notes is read from the data. */}
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 }}>
          <strong style={{ color: C.text }}>Which F16.</strong> The core table counts nodes in the sixteen operators on{" "}
          <a href="https://monogate.org/framework" style={{ color: C.accent }}>monogate.org/framework&nbsp;↗</a> and
          nothing else, since monogate.org recounted it on 2026-09-13. ln x takes {lnPositive} nodes there,
          LEdiv(0, F13(−1, x)), so the positive-domain total is {pos.total}n / {pos.pct}%. Counting ln x = EXL(0, x) as
          one node instead, with the census operator EXL, exp(x)·ln y, gives {exl.total}n / {exl.pct}%. Both totals
          are upper bounds. Each construction is evaluated numerically on its domain by the monogate
          repository&apos;s <code>python/tests/test_superbest_f16_constructions.py</code>, which this site does not
          run, and this site gates no Lean theorem that states either total. Before each deploy the totals are compared
          with python/monogate/superbest.py, and every node count in the table with monogate.org&apos;s copy. The
          high-impact tables below follow the taxonomy-lock paper, whose &quot;F16 orbit&quot; is a different sixteen
          that leaves out LEAd (F11 on /framework).
        </p>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 28, lineHeight: 1.7 }}>
          <strong style={{ color: C.text }}>General domain.</strong> The general basket is exp, neg, add, sub, mul and
          div, each with one F16 tree valid for every real input where the operation is defined (div needs y ≠ 0).
          mul takes {mulGeneral} nodes, LEdiv(0, F13(y, DEML(x, 1))), and div takes {divGeneral}. A numerical search
          over F16 trees with constant leaves 0, 1, −1, 2 and 1/2 finds no smaller signed division
          (<code>python/benchmarks/superbest_f16/search.py</code> in the monogate repository); a search is not a
          proof. Before the recount, mul and div counted sign-dispatch case splits, one circuit per sign quadrant, not
          trees. Two operations left the basket: abs, because no real F16 tree computes |x| (every tree is
          real-analytic where it is defined, and |x| is not analytic at 0; a paper argument, not a Lean proof), and
          ln, which has no real value for x ≤ 0. recip has a row-level entry for x ≠ 0; sqrt and pow have none over
          all reals. The naive costs are the monogate library&apos;s pure-EML figures, not re-derived in the recount.
        </p>

        {/* Core arithmetic */}
        <SectionHead mt={0}>Core Arithmetic Primitives (F16 Layer 1)</SectionHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Operation</Th>
                <Th color={C.accent}>{domain === "positive" ? "Nodes (x>0)" : "Nodes (all ℝ)"}</Th>
                <Th>v4 cost</Th>
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
                    <Td color={C.muted}>{row.v4_cost ?? "—"}</Td>
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
          Cat C: notation-only; with no F16 shortcut, the saving exists only in the 23-op count.
          Node counts here and in the high-impact tables are from the SuperBEST taxonomy lock of
          2026-04-21. Nothing on this site re-derives them; before each deploy they are compared cell
          by cell with the copy monogate.org shows.
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

        <SubHead>
          {hi.special_functions.every((row) => row.f16 === "inf")
            ? "Special Functions (all require infinite F16 depth)"
            : "Special Functions"}
        </SubHead>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr><Th>Function</Th><Th>F16 / 23-op cost</Th><Th>Reason</Th></tr>
            </thead>
            <tbody>
              {hi.special_functions.map((row, i) => (
                <tr key={i}>
                  <Td><code style={{ fontSize: 11, color: C.muted }}>{row.expr}</code></Td>
                  <Td bold color={C.muted}>{row.f16 === row.op23 ? nodes(row.f16) : `${nodes(row.f16)} / ${nodes(row.op23)}`}</Td>
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
                  <Td bold color={C.accent}>{cell(row.layer1)}</Td>
                  <Td bold color={C.green}>{cell(row.layer2)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 10, lineHeight: 1.7 }}>
          The core-arithmetic row&apos;s Layer 1 cell is the positive-domain F16 headline; its Layer 2 cell counts
          ln x = EXL(0, x) as one node, as monogate.org&apos;s does. Both are computed from totals that are checked
          against the monogate.superbest library before each deploy. The ML, quantum and physics rows are pooled over the SuperBEST
          taxonomy lock&apos;s own item rows, as monogate.org recomputed them on 2026-09-13 (they were rounded estimates
          before); the aggregate row is still the paper&apos;s rounded estimate, dated 2026-04-21. Nothing on this site
          re-derives them. Before each deploy they are compared with the copy monogate.org shows, so a change there
          fails the next deploy until this table matches.
        </p>

        {/* Machine-checked theorems */}
        <SectionHead>Machine-Checked Theorems (Lean 4)</SectionHead>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 }}>
          The cost theory&apos;s named results, mechanised in{" "}
          <a href="https://github.com/agent-maestro/machlib/blob/master/foundations/MachLib/CostTheory.lean" style={{ color: C.accent }}>MachLib/CostTheory.lean&nbsp;↗</a>
          {" "}— pure <code>Nat</code>, <code>#print axioms</code> shows only <code>propext</code> / <code>Quot.sound</code>,
          no <code>sorryAx</code>, no MachLib field axioms. Status is honest: the empirical mean-cost ordering
          (C&nbsp;&lt;&nbsp;B&nbsp;&lt;&nbsp;A&nbsp;&lt;&nbsp;D) and the T42-QCC conjecture are <em>not</em> claimed as proven.
        </p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <Th>Result</Th>
                <Th>Statement</Th>
                <Th color={C.green}>Lean theorem</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {LEAN_THEOREMS.map((t) => (
                <tr key={t.id}>
                  <Td bold><code style={{ color: C.text, fontSize: 12 }}>{t.id}</code></Td>
                  <Td small color={C.muted} maxW={300}>{t.name}</Td>
                  <Td><code style={{ fontSize: 11, color: t.lean === "—" ? C.muted : C.green }}>{t.lean}</code></Td>
                  <Td><StatusBadge s={t.status} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key results box */}
        <div style={{ marginTop: 48, padding: 24, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8 }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, color: C.text, marginBottom: 12 }}>Key results</h2>
          <ul style={{ paddingLeft: 20, color: C.muted, fontSize: 13, lineHeight: 1.9 }}>
            <li><strong style={{ color: C.text }}>Core table, recounted in F16 (2026-09-13):</strong> {pos.total}n / {pos.pct}% vs {pos.naive}n naive on the positive domain and {gen.total}n / {gen.pct}% vs {gen.naive}n naive on the 6-op general basket; {exl.total}n / {exl.pct}% when ln counts as one EXL node. Best-known upper bounds, evaluated numerically in the monogate repository; the totals are checked against the monogate.superbest library before each deploy. Extended operators do not change these counts</li>
            <li><strong style={{ color: C.text }}>LSE corrected:</strong> ln(e^x+e^y) = {lse.f16}n in F16 (was 5n); {lse.op23}n in 23-op via EEA+ln</li>
            <li><strong style={{ color: C.text }}>Taxonomy:</strong> {lock.total_operators} operators catalogued. CONJ_NO_OP_24 (no 24th operator) is a conjecture, argued on paper; no Lean proof exists</li>
            <li><strong style={{ color: C.text }}>softplus = {softplus.f16}n</strong> {softplus.f16 === softplus.op23 ? "in both layers" : `in F16 (${softplus.op23}n in 23-op)`} via EML(x,1/e)+ln (Category B: genuine F16)</li>
            <li><strong style={{ color: C.text }}>Aggregate genuine F16 savings: ~12%</strong> across the taxonomy lock&apos;s catalogs; ~40% with 23-op extended (rounded estimates dated 2026-04-21, not re-derived; compared with monogate.org&apos;s copy before each deploy)</li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 12, color: C.muted }}>
            Research: <a href="https://monogate.org/superbest" style={{ color: C.accent }}>monogate.org/superbest ↗</a>
          </p>
        </div>

      </div>
    </div>
  );
}
