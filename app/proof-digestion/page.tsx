import type { ReactNode } from "react";

import Nav from "@/app/components/Nav";
import { C, pill } from "@/app/evidence/data";

import fixtureJson from "./proof_digestion_lab_fixture_v0_2026_05_27.json";

type UnderstandingPacket = {
  artifactId: string;
  title: string;
  digestionStatus: string;
  verificationStatus: string;
  digestReview: {
    coreIdea: string;
    whyItMatters: string;
    minimumExample: string;
    failureModes: string[];
    reusePaths: string[];
    teachableExplanation: string;
    openQuestions: string[];
    humanReviewerNote: string;
  };
  scores: {
    teachability: number;
    reusePotential: number;
    humanDigestNeed: number;
  };
  creditLineage: {
    humanAuthors: string[];
    aiAssistants: string[];
    sourceArtifacts: string[];
    formalDependencies: string[];
    reviewer: string;
    digestionAuthor: string;
    publicExplainer: string;
  };
  claimBoundary: string;
  nonClaims: string[];
  evidencePaths: string[];
};

type Fixture = {
  date: string;
  summary: string;
  sourcePacket: string;
  artifacts: UnderstandingPacket[];
  boundaries: Record<string, boolean>;
};

const fixture = fixtureJson as unknown as Fixture;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 13, lineHeight: 1.7 }}>
      {items.map((item) => (
        <li key={item} style={{ marginBottom: 8 }}>{item}</li>
      ))}
    </ul>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: 14 }}>
      <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, color: C.orange, fontFamily: "monospace", fontWeight: 700 }}>{value}/5</div>
    </div>
  );
}

export default function ProofDigestionPage() {
  const packet = fixture.artifacts[0];

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <Nav />
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "58px 18px 84px" }}>
        <header style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
            Proof Digestion Lab
          </div>
          <h1 style={{ color: C.text, fontSize: 34, lineHeight: 1.12, margin: "0 0 14px", fontWeight: 700 }}>
            Turning evidence-backed artifacts into human understanding.
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, maxWidth: 720, margin: "0 0 18px" }}>
            Generation and verification answer whether an artifact exists and what evidence supports it.
            Digestion asks what it teaches, how it can be reused, what can go wrong, and what still needs human judgment.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pill(packet.digestionStatus, C.orange)}
            {pill(packet.verificationStatus, C.green)}
            {pill(fixture.date, C.blue)}
          </div>
        </header>

        <article style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: C.orange, fontFamily: "monospace", marginBottom: 8 }}>
                {packet.artifactId}
              </div>
              <h2 style={{ color: C.text, fontSize: 22, margin: 0, lineHeight: 1.25 }}>{packet.title}</h2>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
              <a href="/evidence/forge-rescue" style={{ color: C.green, fontSize: 12, textDecoration: "none", border: `1px solid ${C.green}44`, borderRadius: 5, padding: "7px 10px" }}>
                Evidence packet
              </a>
              <a href="/explorer/rescue-suite" style={{ color: C.orange, fontSize: 12, textDecoration: "none", border: `1px solid ${C.orange}44`, borderRadius: 5, padding: "7px 10px" }}>
                Rescue Explorer
              </a>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 22 }}>
            <Score label="Teachability" value={packet.scores.teachability} />
            <Score label="Reuse potential" value={packet.scores.reusePotential} />
            <Score label="Human digest need" value={packet.scores.humanDigestNeed} />
          </div>

          <Section title="Core idea">
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{packet.digestReview.coreIdea}</p>
          </Section>

          <Section title="Why it matters">
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{packet.digestReview.whyItMatters}</p>
          </Section>

          <Section title="Minimum example">
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{packet.digestReview.minimumExample}</p>
          </Section>

          <Section title="Teachable explanation">
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{packet.digestReview.teachableExplanation}</p>
          </Section>

          <Section title="Failure modes">
            <List items={packet.digestReview.failureModes} />
          </Section>

          <Section title="Reuse paths">
            <List items={packet.digestReview.reusePaths} />
          </Section>

          <Section title="Open questions">
            <List items={packet.digestReview.openQuestions} />
          </Section>

          <Section title="Claim boundary">
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.75, margin: 0 }}>{packet.claimBoundary}</p>
          </Section>

          <Section title="Non-claims">
            <List items={packet.nonClaims} />
          </Section>

          <Section title="Credit lineage">
            <div style={{ display: "grid", gap: 8 }}>
              {[
                ["reviewer", packet.creditLineage.reviewer],
                ["digestion author", packet.creditLineage.digestionAuthor],
                ["public explainer", packet.creditLineage.publicExplainer],
                ["formal dependencies", packet.creditLineage.formalDependencies.join(", ")],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 8, fontSize: 12 }}>
                  <span style={{ color: C.muted }}>{label}</span>
                  <span style={{ color: C.text, textAlign: "right", overflowWrap: "anywhere" }}>{value}</span>
                </div>
              ))}
            </div>
          </Section>
        </article>

        <footer style={{ marginTop: 22, color: C.muted, fontSize: 11, lineHeight: 1.6 }}>
          Source packet: {fixture.sourcePacket}. Digestion explains evidence; it does not increase proof strength.
        </footer>
      </main>
    </div>
  );
}
