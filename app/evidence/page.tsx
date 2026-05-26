import type { Metadata } from "next";
import {
  C,
  artifactColor,
  artifacts,
  decisionColors,
  fixture,
  pill,
  statusColor,
} from "./data";

export const metadata: Metadata = {
  title: "Evidence Cockpit",
  description:
    "Review cockpit for Monogate computational evidence: validation, replay, semantic strength, claim flags, and reviewer decisions.",
};

export default function EvidencePage() {
  const counts = fixture.decisionCounts;

  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 16px 72px", background: C.bg }}>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
        <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Evidence Cockpit / v0
          </div>
          <h1 style={{ color: C.text, fontSize: 28, lineHeight: 1.15, margin: "0 0 10px", letterSpacing: 0 }}>
            Review computational claims before they become public.
          </h1>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
            Monogate turns traces, replay logs, proof obligations, semantic tiers, and claim flags into reviewer decisions.
            The cockpit shows what is approved, what is only candidate evidence, and what remains unsafe to say.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {pill("validation")}
            {pill("replay", C.green)}
            {pill("semantic strength", C.blue)}
            {pill("claim boundary", C.orange)}
          </div>
        </div>
        <aside style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Reviewer decision counts
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "8px 12px", fontSize: 12 }}>
            {(["approved_for_surface", "candidate_only", "blocked", "needs_human_review"] as const).map(decision => (
              <div key={decision} style={{ display: "contents" }}>
                <span style={{ color: C.muted }}>{decision}</span>
                <strong style={{ color: decisionColors[decision] }}>{counts[decision] ?? 0}</strong>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10, marginBottom: 16 }}>
        {artifacts.map(artifact => (
          <a
            key={artifact.id}
            href={`/evidence/${artifact.id}`}
            style={{
              minHeight: 178,
              display: "grid",
              alignContent: "start",
              gap: 9,
              border: `1px solid ${C.border}`,
              background: C.surface,
              borderRadius: 8,
              padding: 14,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ color: artifactColor(artifact), fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {artifact.lane}
            </div>
            <h2 style={{ color: C.text, fontSize: 15, lineHeight: 1.25, margin: 0 }}>{artifact.title}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pill(artifact.decision, decisionColors[artifact.decision])}
              {pill(artifact.semanticsLabel, artifactColor(artifact))}
            </div>
            <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{artifact.summary}</p>
          </a>
        ))}
      </section>

      <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Review queue
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr>
                {["artifact", "decision", "validation", "replay", "semantics", "claim boundary"].map(head => (
                  <th key={head} style={{ color: C.muted, textAlign: "left", fontSize: 10, borderBottom: `1px solid ${C.border}`, padding: "0 8px 8px" }}>
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {artifacts.map(artifact => (
                <tr key={artifact.id}>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>
                    <a href={`/evidence/${artifact.id}`} style={{ color: artifactColor(artifact), fontSize: 12, fontWeight: 700 }}>{artifact.title}</a>
                  </td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.decision, decisionColors[artifact.decision])}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.validationStatus, statusColor(artifact.validationStatus))}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.replayStatus, statusColor(artifact.replayStatus))}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.semanticsLabel, artifactColor(artifact))}</td>
                  <td style={{ color: C.muted, fontSize: 11, lineHeight: 1.55, padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{artifact.claimBoundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Flagship artifact
          </div>
          <h2 style={{ color: C.text, fontSize: 18, margin: "0 0 10px" }}>Forge rescue suite</h2>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: "0 0 12px" }}>
            The rescue suite is the clearest current example of evidence-governed computation: replayable trace,
            named obligation, concrete witness, restricted semantic theorem, approval gate, and public claim boundary.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <a href="/explorer/rescue-suite" style={{ color: C.bg, background: C.orange, border: `1px solid ${C.orange}`, borderRadius: 5, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>Open rescue explorer</a>
            <a href="https://monogate.org/blog/proof-carrying-rescue-status/" style={{ color: C.orange, border: `1px solid ${C.orange}55`, borderRadius: 5, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>Read status</a>
          </div>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Evidence paths
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {artifacts[0].evidencePaths.map(path => (
              <span key={path}>{pill(path, C.blue)}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
