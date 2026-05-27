import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import annexJson from "./data/eml_atlas_annex_2026_05_27.json";
import gateJson from "./data/eml_atlas_promotion_gate_2026_05_27.json";

type AnnexEntry = {
  id: string;
  atlasObject: string;
  classification: string;
  standardForm: string;
  emlForm: string;
  claimBoundary: string;
  validationStatus: string;
  sampleCount: number;
  promoteToPublicAtlas: boolean;
  reviewAction: {
    action: string;
    priority: number;
    rationale: string;
  };
};

type ReviewQueueItem = {
  id: string;
  atlasObject: string;
  classification: string;
  action: string;
  priority: number;
  promoteToPublicAtlas: boolean;
};

type ProofTarget = {
  id: string;
  atlasObject: string;
  action: string;
  status: string;
};

const annex = annexJson as unknown as {
  status: string;
  publicAtlasSource: string;
  annexRole: string;
  entryCount: number;
  classificationCounts: Record<string, number>;
  reviewQueueSummary: {
    queueCount: number;
    actionCounts: Record<string, number>;
    candidateMachlibWitnessCount: number;
    publicPromotionCount: number;
  };
  reviewQueue: ReviewQueueItem[];
  nextProofTargets: ProofTarget[];
  entries: AnnexEntry[];
  nonClaims: string[];
};

const gate = gateJson as unknown as {
  status: string;
  bucketCounts: Record<string, number>;
  checkedWitnesses: Array<{
    entryId: string;
    machlibName: string;
    status: string;
  }>;
  policy: {
    publicPromotionPerformed: boolean;
  };
};

export const metadata: Metadata = {
  title: "EML Atlas Evidence Annex",
  description: "Candidate-only evidence annex for selected monogate.org Atlas identities and claim boundaries.",
};

function classificationColor(value: string) {
  if (value === "exact_identity") return C.green;
  if (value === "standard_rewrite") return C.blue;
  if (value === "conjectural_or_blocked") return C.red;
  return C.orange;
}

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

function actionColor(value: string) {
  if (value === "candidate_machlib_witness") return C.green;
  if (value === "keep_private_symbolic_or_numeric_verifier") return C.blue;
  if (value === "blocked_public_claim") return C.red;
  return C.orange;
}

export default function EmlAtlasAnnexPage() {
  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-language" style={{ color: C.muted, textDecoration: "none" }}>EML Language</a>
          <a href="/explorer/eml-prime-residual" style={{ color: C.muted, textDecoration: "none" }}>Prime Residual</a>
          <a href="/explorer/eml-symbolic-regression" style={{ color: C.muted, textDecoration: "none" }}>Template Search</a>
          <a href={annex.publicAtlasSource} style={{ color: C.orange, textDecoration: "none" }}>Public Atlas</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-A1", C.orange)}
            {pill(annex.status, C.green)}
            {pill("EML-A7 gate", C.blue)}
            {pill("evidence annex", C.blue)}
            {pill("public Atlas remains canonical", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Atlas Evidence Annex
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 820, margin: 0 }}>
            A candidate-only verifier for selected Atlas identities, rewrites, and blocked claim boundaries.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 24 }}>
          <Metric label="Entries" value={annex.entryCount} color={C.blue} />
          <Metric label="Exact identities" value={annex.classificationCounts.exact_identity ?? 0} color={C.green} />
          <Metric label="Standard rewrites" value={annex.classificationCounts.standard_rewrite ?? 0} color={C.blue} />
          <Metric label="Blocked" value={annex.classificationCounts.conjectural_or_blocked ?? 0} color={C.red} />
          <Metric label="Review queue" value={annex.reviewQueueSummary.queueCount} color={C.orange} />
          <Metric label="Candidate witnesses" value={annex.reviewQueueSummary.actionCounts.candidate_machlib_witness ?? 0} color={C.green} />
          <Metric label="Public promotions" value={annex.reviewQueueSummary.publicPromotionCount} color={C.red} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            promotion gate
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
            <Metric label="Safe education" value={gate.bucketCounts.safe_public_education_candidate ?? 0} color={C.green} />
            <Metric label="Proof targets" value={gate.bucketCounts.proof_target ?? 0} color={C.orange} />
            <Metric label="Reviewer only" value={gate.bucketCounts.internal_reviewer_only ?? 0} color={C.blue} />
            <Metric label="Blocked" value={gate.bucketCounts.blocked_or_conjectural ?? 0} color={C.red} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pill(gate.status, C.green)}
            {pill(`public promotion: ${gate.policy.publicPromotionPerformed}`, C.green)}
            {gate.checkedWitnesses.map((witness) => (
              <span key={witness.entryId}>{pill(`${witness.entryId}: ${witness.status}`, C.purple)}</span>
            ))}
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
            annex role
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
            This page supports the public monogate.org Atlas with generated checks. It is not a replacement Atlas and does not promote theorem, RH, physics, modular-form, quantum-group, compiler, or public SuperBEST claims.
          </p>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 24 }}>
          <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
            <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              review queue
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 660, fontSize: 12 }}>
                <thead>
                  <tr style={{ color: C.muted, textAlign: "left" }}>
                    <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Entry</th>
                    <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Action</th>
                    <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Priority</th>
                    <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Promote</th>
                  </tr>
                </thead>
                <tbody>
                  {annex.reviewQueue.slice(0, 14).map((item) => (
                    <tr key={item.id}>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.id}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(item.action, actionColor(item.action))}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{item.priority}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{String(item.promoteToPublicAtlas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
            <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              next proof targets
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {annex.nextProofTargets.map((target) => (
                <div key={target.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ color: C.text, fontFamily: "monospace", fontSize: 12, overflowWrap: "anywhere" }}>{target.id}</div>
                  <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.5, marginTop: 6 }}>{target.atlasObject}</div>
                  <div style={{ marginTop: 8 }}>{pill(target.status, C.orange)}</div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 12, marginBottom: 24 }}>
          {annex.entries.map((entry) => (
            <article key={entry.id} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(entry.classification, classificationColor(entry.classification))}
                {pill(entry.validationStatus, entry.validationStatus === "pass" ? C.green : C.red)}
                {pill(`${entry.sampleCount} checks`, C.purple)}
                {pill(entry.reviewAction.action, actionColor(entry.reviewAction.action))}
              </div>
              <h2 style={{ color: C.text, fontSize: 17, lineHeight: 1.25, margin: "0 0 10px", overflowWrap: "anywhere" }}>
                {entry.atlasObject}
              </h2>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>standard</div>
              <code style={{ display: "block", color: C.blue, fontSize: 11, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 10 }}>
                {entry.standardForm}
              </code>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>eml</div>
              <code style={{ display: "block", color: C.orange, fontSize: 11, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 12 }}>
                {entry.emlForm}
              </code>
              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{entry.claimBoundary}</p>
            </article>
          ))}
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            non-claims
          </div>
          <ul style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            {annex.nonClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
