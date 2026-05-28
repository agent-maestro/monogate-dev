import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import { emlPackets, families } from "./data";

export const metadata: Metadata = {
  title: "EML Packet Gallery",
  description:
    "Candidate-only gallery of EML Expression Packet v0 artifacts with IR, replay, and claim boundaries.",
};

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function EmlPacketGalleryPage() {
  const packetCount = emlPackets.length;
  const frameCount = emlPackets.reduce((sum, packet) => sum + packet.replay.frameCount, 0);
  const reusedNodeCount = emlPackets.reduce((sum, packet) => sum + packet.ir.reusedNodes.length, 0);
  const internalDelta = emlPackets.reduce((sum, packet) => sum + packet.costs.internalExtraDagSavingsNodes, 0);
  const domainRequirementCount = emlPackets.reduce((sum, packet) => sum + packet.domainSafety.summary.domain_requirement_count, 0);
  const blockedClaimCount = emlPackets.reduce((sum, packet) => sum + packet.domainSafety.summary.blocked_public_claim_count, 0);
  const checkedWitnessCount = emlPackets.reduce((sum, packet) => sum + packet.domainSafety.summary.checked_obligation_count, 0);
  const obligationCount = emlPackets.reduce((sum, packet) => sum + packet.obligations.summary.count, 0);
  const unresolvedObligations = emlPackets.flatMap((packet) =>
    packet.obligations.cards
      .filter((card) => card.status !== "checked_small_witness")
      .map((card) => ({ packet, card }))
  );
  const nextProofTarget = unresolvedObligations[0];

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-language" style={{ color: C.muted, textDecoration: "none" }}>Language Kernel</a>
          <a href="/explorer/eml-ir-bridge" style={{ color: C.muted, textDecoration: "none" }}>IR Bridge</a>
          <a href="/explorer/eml-advantage" style={{ color: C.muted, textDecoration: "none" }}>Advantage Lab</a>
          <a href="/explorer/eml-packets/builder" style={{ color: C.muted, textDecoration: "none" }}>Builder</a>
          <a href="/evidence" style={{ color: C.muted, textDecoration: "none" }}>Evidence</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-R3", C.orange)}
            {pill("candidate gallery", C.orange)}
            {pill("generated from EML-R2", C.blue)}
            {pill("R6 safety lens", C.purple)}
            {pill("R8 checked witness", C.green)}
            {pill("no public savings claim", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Packet Gallery
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
            Browse generated EML expression packets as inspectable DAG, replay, and reviewer-boundary artifacts.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 28 }}>
          <Metric label="Packets" value={packetCount} color={C.blue} />
          <Metric label="Families" value={families.length} color={C.purple} />
          <Metric label="Replay frames" value={frameCount} color={C.green} />
          <Metric label="Shared nodes" value={reusedNodeCount} color={C.orange} />
          <Metric label="Internal DAG delta" value={internalDelta} color={C.orange} />
          <Metric label="Domain reqs" value={domainRequirementCount} color={C.red} />
          <Metric label="Obligations" value={obligationCount} color={C.purple} />
          <Metric label="Checked witnesses" value={checkedWitnessCount} color={C.green} />
          <Metric label="Unresolved" value={unresolvedObligations.length} color={C.orange} />
          <Metric label="Blocked claims" value={blockedClaimCount} color={C.purple} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, alignItems: "start" }}>
            <div>
              <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                proof coverage
              </div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.55 }}>
                {checkedWitnessCount} of {obligationCount} obligations have checked small witnesses.
              </div>
            </div>
            <div>
              <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                next proof target
              </div>
              {nextProofTarget ? (
                <a href={`/explorer/eml-packets/${nextProofTarget.packet.artifactId}`} style={{ color: C.orange, textDecoration: "none", fontSize: 12, lineHeight: 1.6, overflowWrap: "anywhere", display: "block" }}>
                  {nextProofTarget.card.obligationId}
                </a>
              ) : (
                <div style={{ color: C.green, fontSize: 12 }}>No unresolved obligations in the generated fixture set.</div>
              )}
            </div>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                private intake
              </div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>
                Create an EML Expression Packet v0 candidate before running the local builder.
              </div>
            </div>
            <a href="/explorer/eml-packets/builder" style={{ color: C.bg, background: C.green, border: `1px solid ${C.green}`, borderRadius: 5, padding: "8px 12px", textDecoration: "none", fontSize: 12, fontWeight: 800 }}>
              Open Builder
            </a>
          </div>
        </section>

        <section style={{ marginBottom: 20 }}>
          <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            Families
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {families.map((family) => pill(family, C.blue))}
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
          {emlPackets.map((packet) => (
            <a
              key={packet.artifactId}
              href={`/explorer/eml-packets/${packet.artifactId}`}
              style={{
                display: "block",
                color: "inherit",
                textDecoration: "none",
                border: `1px solid ${C.border}`,
                background: C.surface,
                borderRadius: 8,
                padding: 16,
                minHeight: 260,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(packet.review.decision, C.orange)}
                {pill(packet.review.replayStatus, C.green)}
                {pill(packet.sourcePacket.family, C.blue)}
              </div>
              <h2 style={{ color: C.text, fontSize: 18, lineHeight: 1.25, margin: "0 0 10px", overflowWrap: "anywhere" }}>
                {packet.sourcePacket.program_id}
              </h2>
              <pre style={{ color: C.muted, fontSize: 11, lineHeight: 1.55, whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: "0 0 14px" }}>
                {packet.sourcePacket.expression}
              </pre>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8, marginBottom: 12 }}>
                <Metric label="Nodes" value={packet.ir.nodeCount} color={C.blue} />
                <Metric label="Frames" value={packet.replay.frameCount} color={C.green} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(`${packet.obligations.summary.count} obligations`, C.purple)}
                {pill(`${packet.domainSafety.summary.domain_requirement_count} domain reqs`, C.red)}
                {pill(`${packet.domainSafety.summary.checked_obligation_count} checked`, C.green)}
                {pill(`${packet.domainSafety.summary.blocked_public_claim_count} blocked claims`, C.orange)}
                {pill(`${packet.obligations.summary.proved_count} proved`, C.green)}
              </div>
              <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                {packet.review.claimBoundary}
              </p>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
