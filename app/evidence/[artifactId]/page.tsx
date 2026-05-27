import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  C,
  artifactColor,
  artifacts,
  decisionColors,
  findArtifact,
  pill,
  statusColor,
} from "../data";

type Props = {
  params: {
    artifactId: string;
  };
};

export function generateStaticParams() {
  return artifacts.map((artifact) => ({ artifactId: artifact.id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const artifact = findArtifact(params.artifactId);
  return {
    title: artifact ? `${artifact.title} Evidence` : "Evidence Artifact",
    description: artifact?.claimBoundary,
  };
}

function valueRows(values: Record<string, unknown>) {
  return Object.entries(values).map(([key, value]) => (
    <div key={key} style={{ display: "contents" }}>
      <span style={{ color: C.muted, fontSize: 11 }}>{key}</span>
      <code style={{ color: C.text, fontSize: 11, overflowWrap: "anywhere" }}>
        {typeof value === "object" ? JSON.stringify(value) : String(value)}
      </code>
    </div>
  ));
}

export default function EvidenceArtifactPage({ params }: Props) {
  const artifact = findArtifact(params.artifactId);
  if (!artifact) notFound();
  const accent = artifactColor(artifact);
  const evidencePaths = Array.from(new Set([artifact.sourceReportPath, ...artifact.evidencePaths]));
  const isFlagship = artifact.id === "forge-rescue";

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 16px 72px", background: C.bg }}>
      <nav style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <a href="/evidence" style={{ color: C.muted, fontSize: 12 }}>Evidence Cockpit</a>
        <span style={{ color: C.muted, fontSize: 12 }}>/</span>
        <span style={{ color: accent, fontSize: 12 }}>{artifact.title}</span>
      </nav>

      <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ color: accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
          {artifact.lane}
        </div>
        <h1 style={{ color: C.text, fontSize: 30, lineHeight: 1.15, margin: "0 0 10px", letterSpacing: 0 }}>
          {artifact.title}
        </h1>
        {isFlagship ? (
          <p style={{ color: accent, fontSize: 13, lineHeight: 1.65, maxWidth: 780, margin: "0 0 8px", fontWeight: 700 }}>
            Watch Monogate turn optimizer boundary failures into reviewable, replayable, claim-bounded evidence.
          </p>
        ) : null}
        <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.75, maxWidth: 780, margin: "0 0 14px" }}>
          {artifact.summary}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pill(artifact.decision, decisionColors[artifact.decision])}
          {pill(artifact.validationStatus, statusColor(artifact.validationStatus))}
          {pill(artifact.replayStatus, statusColor(artifact.replayStatus))}
          {pill(artifact.semanticsLabel, accent)}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 16 }}>
        {artifact.reviewHighlights.map((highlight) => (
          <article key={highlight} style={{ minHeight: 112, border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 14 }}>
            <div style={{ color: accent, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              review signal
            </div>
            <p style={{ color: C.text, fontSize: 12, lineHeight: 1.6, margin: 0 }}>{highlight}</p>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 16 }}>
        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Claim boundary
          </div>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: 0 }}>{artifact.claimBoundary}</p>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Review packet
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <a href={artifact.href} style={{ color: C.bg, background: accent, border: `1px solid ${accent}`, borderRadius: 5, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>Open surface</a>
            <a href={artifact.packetHref} style={{ color: accent, border: `1px solid ${accent}55`, borderRadius: 5, padding: "7px 10px", fontSize: 11, fontWeight: 700 }}>Export JSON</a>
          </div>
        </article>
      </section>

      <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18, marginBottom: 16 }}>
        <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
          Evidence chain
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
          {artifact.timeline.map((event, index) => (
            <article key={`${event.label}-${index}`} style={{ border: `1px solid ${C.border}`, background: C.surface2, borderRadius: 8, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
                <strong style={{ color: C.text, fontSize: 12 }}>{event.label}</strong>
                {pill(event.status, statusColor(event.status))}
              </div>
              <p style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{event.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 16 }}>
        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Claim flags
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "9px 12px" }}>
            {valueRows(artifact.claimFlags)}
          </div>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Semantic review
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(120px, 0.8fr) minmax(0, 1.2fr)", gap: "9px 12px" }}>
            {valueRows(artifact.semanticReview)}
          </div>
        </article>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Non-claims
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {artifact.nonClaims.map((claim) => (
              <span key={claim}>{pill(claim, C.red)}</span>
            ))}
          </div>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Validation commands
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {artifact.validationCommands.map((command) => (
              <span key={command}>{pill(command, C.green)}</span>
            ))}
          </div>
        </article>

        <article style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 18 }}>
          <div style={{ color: C.orange, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
            Evidence paths
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {evidencePaths.map((path) => (
              <span key={path}>{pill(path, C.blue)}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
