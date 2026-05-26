import type { Metadata } from "next";
import rescueFixture from "../explorer/rescue-suite/proof_carrying_rescue_explorer_fixture_v0_2026_05_26.json";

export const metadata: Metadata = {
  title: "Evidence Cockpit",
  description:
    "Review cockpit for Monogate computational evidence: validation, replay, semantic strength, claim flags, and reviewer decisions.",
};

const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  surface2: "#12151f",
  border: "#1c1f2e",
  text: "#d4d4d4",
  muted: "#6d7085",
  orange: "#e8a020",
  green: "#4ade80",
  blue: "#6ab0f5",
  red: "#f87171",
  purple: "#a78bfa",
};

type Artifact = {
  id: string;
  title: string;
  lane: string;
  decision: "approved_for_surface" | "candidate_only" | "blocked" | "needs_human_review";
  validation: "pass" | "fail" | "unknown";
  replay: "pass" | "fail" | "unknown";
  semantics: string;
  summary: string;
  claimBoundary: string;
  href: string;
  evidencePaths: string[];
  color: string;
};

const rescueApproval = rescueFixture.approval;
const semanticSummary = rescueApproval.semantic_summary;

const artifacts: Artifact[] = [
  {
    id: "forge_rescue",
    title: "Forge Rescue Suite",
    lane: "optimizer evidence",
    decision: rescueApproval.surface_allowed ? "approved_for_surface" : "blocked",
    validation: rescueFixture.replayStatus.valid ? "pass" : "fail",
    replay: rescueFixture.replayStatus.valid ? "pass" : "fail",
    semantics: `${semanticSummary.restricted_semantic_rewrite?.length ?? 0} restricted rewrite, ${semanticSummary.concrete_sample_invariant_count} concrete invariants`,
    summary:
      "Boundary-event rescue packets with replay validation, MachLib witness routing, and a restricted log-domain semantic theorem.",
    claimBoundary:
      "Approved for existing public/dev surfaces; no full optimizer semantic rewrite or hardware observation is claimed.",
    href: "/explorer/rescue-suite",
    evidencePaths: [
      "reports/proof_carrying_rescue_suite_v0_2026_05_26.json",
      "reports/proof_carrying_rescue_replay_v0_2026_05_26.json",
      "reports/rescue_obligation_registry_v0_2026_05_26.json",
      "reports/rescue_artifact_approval_v0_2026_05_26.json",
    ],
    color: C.orange,
  },
  {
    id: "electronics_simulated_packet",
    title: "Electronics Trainer Packet",
    lane: "simulated hardware evidence",
    decision: "approved_for_surface",
    validation: "pass",
    replay: "pass",
    semantics: "evidence grammar packet",
    summary:
      "Simulated Trainer Board packet using the shared evidence grammar for trace, replay, validation, and claim flags.",
    claimBoundary:
      "Approved as simulated evidence only; hardware truth requires a real capture packet from the laptop-agent lane.",
    href: "/electronics",
    evidencePaths: [
      "monogate-electronics/docs/evidence-grammar.md",
      "evidence/trainer_board_v0/simulated_reflex_packet_2026_05_26/evidence_packet.json",
      "evidence/trainer_board_v0/simulated_reflex_packet_2026_05_26/trace.jsonl",
    ],
    color: C.green,
  },
  {
    id: "monogate_os_replay",
    title: "Monogate OS Replay Chain",
    lane: "runtime evidence",
    decision: "candidate_only",
    validation: "pass",
    replay: "pass",
    semantics: "candidate replay chain",
    summary:
      "QEMU/replay/Observatory evidence chain with passing cards, kept internal until promotion criteria are sharper.",
    claimBoundary:
      "Candidate only; not a bootable OS claim, not certified safety, and not production runtime assurance.",
    href: "https://monogate.org/research/frontier/",
    evidencePaths: [
      "data/monogate_os_m7a_observatory_status_2026_05_24.json",
      "reports/evidence_review_gate_v0_2026_05_26.json",
    ],
    color: C.blue,
  },
  {
    id: "capcard_candidate",
    title: "CapCard Internal Lane",
    lane: "capability evidence",
    decision: "candidate_only",
    validation: "pass",
    replay: "pass",
    semantics: "internal candidate capability",
    summary:
      "Internal CapCard marketplace/import evidence that exercises review grammar without public-ready promotion.",
    claimBoundary:
      "Candidate only; no public marketplace promotion and no external capability certification.",
    href: "https://monogate.org/research/frontier/",
    evidencePaths: [
      "capcard/reports/capcard_marketplace_import_flow_qa_2026_05_25.json",
      "reports/evidence_review_gate_v0_2026_05_26.json",
    ],
    color: C.purple,
  },
];

const decisionColors: Record<Artifact["decision"], string> = {
  approved_for_surface: C.green,
  candidate_only: C.orange,
  blocked: C.red,
  needs_human_review: C.blue,
};

function pill(text: string, color = C.orange) {
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

function statusColor(value: string) {
  if (value === "pass" || value === "approved_for_surface") return C.green;
  if (value === "candidate_only" || value === "needs_human_review") return C.orange;
  if (value === "fail" || value === "blocked") return C.red;
  return C.muted;
}

export default function EvidencePage() {
  const counts = artifacts.reduce<Record<string, number>>((acc, artifact) => {
    acc[artifact.decision] = (acc[artifact.decision] ?? 0) + 1;
    return acc;
  }, {});

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
            href={artifact.href}
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
            <div style={{ color: artifact.color, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {artifact.lane}
            </div>
            <h2 style={{ color: C.text, fontSize: 15, lineHeight: 1.25, margin: 0 }}>{artifact.title}</h2>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {pill(artifact.decision, decisionColors[artifact.decision])}
              {pill(artifact.semantics, artifact.color)}
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
                    <a href={artifact.href} style={{ color: artifact.color, fontSize: 12, fontWeight: 700 }}>{artifact.title}</a>
                  </td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.decision, decisionColors[artifact.decision])}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.validation, statusColor(artifact.validation))}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.replay, statusColor(artifact.replay))}</td>
                  <td style={{ padding: "12px 8px", borderBottom: `1px solid ${C.border}` }}>{pill(artifact.semantics, artifact.color)}</td>
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
