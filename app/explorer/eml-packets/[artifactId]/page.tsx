import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { C, pill } from "../../../evidence/data";
import { emlPackets, findEmlPacket, findGuardLensByProgramId, guardLensColor } from "../data";

type Props = {
  params: {
    artifactId: string;
  };
};

export function generateStaticParams() {
  return emlPackets.map((packet) => ({ artifactId: packet.artifactId }));
}

export function generateMetadata({ params }: Props): Metadata {
  const packet = findEmlPacket(params.artifactId);
  return {
    title: packet ? `${packet.sourcePacket.program_id} EML Packet` : "EML Packet",
    description: packet?.review.claimBoundary,
  };
}

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14, minHeight: 78 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 28 }}>
      <h2 style={{ color: C.text, fontSize: 18, margin: "0 0 12px", lineHeight: 1.3 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function EmlPacketDetailPage({ params }: Props) {
  const packet = findEmlPacket(params.artifactId);
  if (!packet) notFound();

  const frames = packet.replay.frames.slice(0, 14);
  const claimRows = Object.entries(packet.sourcePacket.claim_flags);
  const rangeRows = Object.entries(packet.sourcePacket.safe_ranges);
  const guardLens = findGuardLensByProgramId(packet.sourcePacket.program_id);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer/eml-packets" style={{ color: C.muted, textDecoration: "none" }}>EML Packets</a>
          <span style={{ color: C.orange }}>{packet.sourcePacket.program_id}</span>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("candidate only", C.orange)}
            {pill(packet.review.validationStatus, C.green)}
            {pill(packet.review.replayStatus, C.green)}
            {pill(packet.sourcePacket.family, C.blue)}
            {guardLens ? pill(guardLens.decision, guardLensColor(guardLens.decision, C)) : null}
            {pill("no public savings claim", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace", overflowWrap: "anywhere" }}>
            {packet.sourcePacket.program_id}
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 780, margin: 0 }}>
            {packet.sourcePacket.physical_meaning}
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          <Metric label="DAG nodes" value={packet.ir.nodeCount} color={C.blue} />
          <Metric label="Replay frames" value={packet.replay.frameCount} color={C.green} />
          <Metric label="Reused nodes" value={packet.ir.reusedNodes.length} />
          <Metric label="Internal DAG delta" value={packet.costs.internalExtraDagSavingsNodes} />
          <Metric label="Obligation cards" value={packet.obligations.summary.count} color={C.purple} />
          <Metric label="Domain requirements" value={packet.domainSafety.summary.domain_requirement_count} color={C.red} />
          <Metric label="Checked witnesses" value={packet.domainSafety.summary.checked_obligation_count} color={C.green} />
          <Metric label="Blocked claims" value={packet.domainSafety.summary.blocked_public_claim_count} color={C.orange} />
        </div>

        <Section title="Expression">
          <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
            <pre style={{ color: C.text, fontSize: 12, lineHeight: 1.65, whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0 }}>
              {packet.sourcePacket.expression}
            </pre>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {packet.sourcePacket.inputs.map((input) => pill(input, C.blue))}
            </div>
          </div>
        </Section>

        {guardLens ? (
          <Section title="Guard Lens">
            <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(guardLens.decision, guardLensColor(guardLens.decision, C))}
                {guardLens.recommendedLowering ? pill(guardLens.recommendedLowering, C.blue) : null}
                {pill(`depth ${guardLens.estimatedTreeDepth}`, C.purple)}
              </div>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.65, margin: "0 0 14px" }}>
                {guardLens.reason}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
                <div>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                    matched rules
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {guardLens.matchedRuleIds.map((rule) => pill(rule, C.blue))}
                  </div>
                </div>
                <div>
                  <div style={{ color: C.muted, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                    blocked claims
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {guardLens.blockedClaims.map((claim) => pill(claim, C.red))}
                  </div>
                </div>
              </div>
            </div>
          </Section>
        ) : null}

        <Section title="Tree vs DAG Boundary">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            <Metric label="Public tree SuperBEST baseline" value={packet.costs.canonicalPublicTreeSuperbestNodes} color={C.green} />
            <Metric label="Internal DAG SuperBEST candidate" value={packet.costs.internalDagSuperbestNodes} color={C.orange} />
            <Metric label="Public tree EML baseline" value={packet.costs.canonicalPublicTreeEmlNodes} color={C.green} />
            <Metric label="Internal DAG EML candidate" value={packet.costs.internalDagEmlNodes} color={C.orange} />
          </div>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, marginTop: 12 }}>{packet.review.claimBoundary}</p>
        </Section>

        <Section title="Inputs">
          <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560, fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {["Input", "Unit", "Range"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: 10, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {packet.sourcePacket.inputs.map((input) => {
                  const range = packet.sourcePacket.safe_ranges[input];
                  return (
                    <tr key={input}>
                      <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.blue, fontFamily: "monospace" }}>{input}</td>
                      <td style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>{packet.sourcePacket.units[input] ?? "unspecified"}</td>
                      <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, fontFamily: "monospace" }}>
                        {range ? `${range.min} .. ${range.max}` : "unspecified"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {rangeRows.length === 0 ? (
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>No safe ranges were provided in the source packet.</p>
          ) : null}
        </Section>

        <Section title="Shared DAG Nodes">
          <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 620, fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {["Node", "Kind", "Op", "Reuse", "Source"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: 10, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(packet.ir.reusedNodes.length ? packet.ir.reusedNodes : packet.ir.nodes.slice(0, 8)).map((node) => (
                  <tr key={node.id}>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.blue, fontFamily: "monospace" }}>{node.id}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>{node.kind}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>{node.op ?? "input"}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.orange }}>{node.reuse_count}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, fontFamily: "monospace", overflowWrap: "anywhere" }}>{node.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Replay Frames">
          <div style={{ overflowX: "auto", border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760, fontSize: 12 }}>
              <thead>
                <tr style={{ background: C.surface2 }}>
                  {["Tick", "State", "Kernel", "Guard", "Reason", "Hash"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: 10, color: C.muted, borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {frames.map((frame) => (
                  <tr key={frame.frame_id}>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.orange, fontFamily: "monospace" }}>{frame.monotonic_tick}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}` }}>{frame.lifecycle_state}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.blue, fontFamily: "monospace" }}>{frame.kernel_id}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: frame.guard_action === "PASS" ? C.green : C.orange }}>{frame.guard_action}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, color: C.muted }}>{frame.guard_reason}</td>
                    <td style={{ padding: 10, borderTop: `1px solid ${C.border}`, fontFamily: "monospace", maxWidth: 210, overflowWrap: "anywhere" }}>{frame.replay_hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Domain Safety Lens">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10, marginBottom: 14 }}>
            <Metric label="Unresolved obligations" value={packet.domainSafety.summary.unresolved_obligation_count} color={C.orange} />
            <Metric label="Checked witnesses" value={packet.domainSafety.summary.checked_obligation_count} color={C.green} />
            <Metric label="Safe rewrite candidates" value={packet.domainSafety.summary.safe_rewrite_candidate_count} color={C.blue} />
            <Metric label="Proved by lens" value={packet.domainSafety.summary.proved_count} color={C.green} />
          </div>

          {packet.domainSafety.domainRequirements.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10, marginBottom: 14 }}>
              {packet.domainSafety.domainRequirements.map((requirement) => (
                <article key={requirement.requirementId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {pill(requirement.trigger, C.blue)}
                    {pill(requirement.status, requirement.status === "checked_small_witness" ? C.green : C.orange)}
                  </div>
                  <h3 style={{ color: C.text, fontSize: 13, lineHeight: 1.35, margin: "0 0 8px", overflowWrap: "anywhere" }}>
                    {requirement.requirement}
                  </h3>
                  <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>{requirement.blockedPublicClaim}</p>
                  {requirement.checkedBy ? (
                    <code style={{ display: "block", color: C.green, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 8 }}>
                      {requirement.checkedBy}
                    </code>
                  ) : null}
                  {requirement.proofSummary ? (
                    <p style={{ color: C.green, fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>{requirement.proofSummary}</p>
                  ) : null}
                  <p style={{ color: C.blue, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{requirement.possibleSafeRewrite}</p>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7 }}>No operator-level domain requirements were classified for this packet.</p>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10, marginBottom: 14 }}>
            {packet.domainSafety.rangeAssumptions.map((range) => (
              <article key={range.input} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {pill("range", C.purple)}
                  {pill(range.status, C.orange)}
                </div>
                <h3 style={{ color: C.text, fontSize: 13, lineHeight: 1.35, margin: "0 0 8px", overflowWrap: "anywhere" }}>
                  {range.input}: {range.min} .. {range.max}
                </h3>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>{range.blockedPublicClaim}</p>
                <p style={{ color: C.blue, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{range.possibleSafeRewrite}</p>
              </article>
            ))}
          </div>

          <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14 }}>
            <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
              Blocked public claims
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {packet.domainSafety.blockedPublicClaims.map((claim) => pill(claim, C.red))}
            </div>
          </div>

          {packet.safeRewriteProposals.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10, marginTop: 14 }}>
              {packet.safeRewriteProposals.map((proposal) => (
                <article key={proposal.proposalId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {pill("rewrite proposal", C.blue)}
                    {pill(proposal.status, C.orange)}
                  </div>
                  <p style={{ color: C.text, fontSize: 12, lineHeight: 1.65, margin: "0 0 8px" }}>{proposal.proposal}</p>
                  <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{proposal.blockedAction}</p>
                </article>
              ))}
            </div>
          ) : null}
        </Section>

        <Section title="Obligation Cards">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
            {packet.obligations.cards.map((card) => (
              <article key={card.obligationId} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  {pill(card.kind, C.purple)}
                  {pill(card.status, card.status === "checked_small_witness" ? C.green : C.orange)}
                  {pill(card.trigger, C.blue)}
                </div>
                <h3 style={{ color: C.text, fontSize: 13, lineHeight: 1.35, margin: "0 0 8px", overflowWrap: "anywhere" }}>
                  {card.proofTarget}
                </h3>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: "0 0 10px" }}>{card.description}</p>
                <code style={{ display: "block", color: C.text, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 8 }}>
                  {card.obligationId}
                </code>
                {card.checkedBy ? (
                  <code style={{ display: "block", color: C.green, fontSize: 10, lineHeight: 1.55, overflowWrap: "anywhere", marginBottom: 8 }}>
                    {card.checkedBy}
                  </code>
                ) : null}
                {card.proofSummary ? (
                  <p style={{ color: C.green, fontSize: 11, lineHeight: 1.6, margin: "0 0 8px" }}>{card.proofSummary}</p>
                ) : null}
                <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{card.nonClaim}</p>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Non-Claims">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {claimRows.map(([label, value]) => (
              <div key={label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{label}</div>
                {pill(String(value), value === false ? C.green : C.red)}
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
