import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import { emlCanonicalComparisons, emlLanguageCostLab, emlLanguageManifest, emlLanguagePrograms } from "./data";

export const metadata: Metadata = {
  title: "EML Language Kernel",
  description: "Candidate-only EML language kernel programs, guards, lets, ASTs, and normalized packet handoffs.",
};

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function EmlLanguageKernelPage() {
  const guardCount = emlLanguagePrograms.reduce((sum, program) => sum + program.guards.length, 0);
  const letCount = emlLanguagePrograms.reduce((sum, program) => sum + program.lets.length, 0);
  const inputCount = emlLanguagePrograms.reduce((sum, program) => sum + program.inputs.length, 0);
  const expansionTagCount = emlLanguagePrograms.reduce((sum, program) => sum + program.expansionTags.length, 0);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-packets" style={{ color: C.muted, textDecoration: "none" }}>EML Packets</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-L1", C.orange)}
            {pill("EML-L2", C.orange)}
            {pill("EML-L3", C.orange)}
            {pill("language kernel", C.blue)}
            {pill(emlLanguageManifest.status, C.green)}
            {pill("no compiler change", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Language Kernel
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 780, margin: 0 }}>
            Inspect candidate EML programs before they lower into Expression Packet v0.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 28 }}>
          <Metric label="Programs" value={emlLanguagePrograms.length} color={C.blue} />
          <Metric label="Inputs" value={inputCount} color={C.purple} />
          <Metric label="Guards" value={guardCount} color={C.green} />
          <Metric label="Let bindings" value={letCount} color={C.orange} />
          <Metric label="Expansion tags" value={expansionTagCount} color={C.blue} />
          <Metric label="Canonical pairs" value={emlCanonicalComparisons.summary.equivalent_count} color={C.green} />
          <Metric label="DAG unique ops" value={emlLanguageCostLab.summary.dagUniqueOperatorCount} color={C.purple} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            canonical operator tree lab
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
            {emlCanonicalComparisons.comparisons.map((item) => (
              <article key={item.label} style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: 8, padding: 12 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  {pill(item.equivalentByCanonicalization ? "canonical match" : "different", item.equivalentByCanonicalization ? C.green : C.red)}
                </div>
                <h2 style={{ color: C.text, fontSize: 13, lineHeight: 1.35, margin: "0 0 8px" }}>{item.label}</h2>
                <code style={{ display: "block", color: C.blue, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 6 }}>
                  {item.left.surfaceExpression}
                </code>
                <code style={{ display: "block", color: C.orange, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 8 }}>
                  {item.right.surfaceExpression}
                </code>
                <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.55, margin: 0 }}>{item.claimBoundary}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              internal language cost lab
            </div>
            {pill("no public SuperBEST claim change", emlLanguageCostLab.summary.publicCostClaimChanged ? C.red : C.green)}
          </div>
          <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginBottom: 12 }}>
            Surface syntax, expanded trees, and DAG-style unique operator counts for reviewer inspection.
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Program</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Surface</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Expanded</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Delta</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>DAG unique</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Repeated</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Obligations</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Checked</th>
                </tr>
              </thead>
              <tbody>
                {emlLanguageCostLab.programs.map((item) => (
                  <tr key={item.programId} style={{ color: C.text }}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>
                      {item.programId}
                    </td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.surfaceOperatorCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.expandedOperatorCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", color: item.expansionDelta > 0 ? C.orange : C.muted }}>
                      {item.expansionDelta}
                    </td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", color: C.purple }}>{item.dagUniqueOperatorCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.repeatedCanonicalSubtreeCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.proofObligationCount}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", color: item.checkedWitnessCount ? C.green : C.muted }}>
                      {item.checkedWitnessCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 12 }}>
          {emlLanguagePrograms.map((program) => (
            <article key={program.program_id} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(program.family, C.blue)}
                {pill(`${program.guards.length} guards`, C.green)}
                {pill(`${program.lets.length} lets`, C.orange)}
              </div>
              <h2 style={{ color: C.text, fontSize: 18, lineHeight: 1.25, margin: "0 0 10px", overflowWrap: "anywhere" }}>
                {program.program_id}
              </h2>
              <pre style={{ color: C.text, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontSize: 11, lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: "0 0 12px" }}>
                {program.normalized_expression}
              </pre>
              <code style={{ display: "block", color: C.green, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 12 }}>
                {program.canonicalHash}
              </code>
              {program.expansionTags.length ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {program.expansionTags.map((tag, index) => pill(`${tag.operator} expands`, index % 2 ? C.orange : C.green))}
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {program.inputs.map((input) => pill(input.name, C.purple))}
              </div>
              {program.guards.length ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>guards</div>
                  {program.guards.map((guard, index) => (
                    <code key={`${guard.kind}-${index}`} style={{ display: "block", color: C.green, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 6 }}>
                      {guard.kind}({guard.expression})
                    </code>
                  ))}
                </div>
              ) : null}
              {program.lets.length ? (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>lets</div>
                  {program.lets.map((item) => (
                    <code key={item.name} style={{ display: "block", color: C.orange, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 6 }}>
                      {item.name} = {item.normalized_expression}
                    </code>
                  ))}
                </div>
              ) : null}
              <details>
                <summary style={{ color: C.muted, cursor: "pointer", fontSize: 12 }}>ASTs</summary>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 10 }}>surface</div>
                <pre style={{ color: C.muted, fontSize: 10, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {JSON.stringify(program.surfaceAst, null, 2)}
                </pre>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>expanded</div>
                <pre style={{ color: C.muted, fontSize: 10, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {JSON.stringify(program.expandedAst, null, 2)}
                </pre>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>canonical</div>
                <pre style={{ color: C.muted, fontSize: 10, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {JSON.stringify(program.canonicalAst, null, 2)}
                </pre>
              </details>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
