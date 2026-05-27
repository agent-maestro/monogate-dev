import type { Metadata } from "next";

import { C, pill } from "@/app/evidence/data";

export const metadata: Metadata = {
  title: "Evidence-Governed Computation | Monogate",
  description:
    "A Monogate case study on replayable evidence packets, reviewer decisions, claim boundaries, and proof digestion.",
};

const steps = [
  {
    n: "01",
    title: "Generated artifact",
    text: "Forge, OS, electronics, or agent work creates an artifact that could be useful but should not be trusted by default.",
  },
  {
    n: "02",
    title: "Evidence packet",
    text: "The artifact is wrapped with validation status, replay status, semantic strength, claim flags, evidence paths, and explicit non-claims.",
  },
  {
    n: "03",
    title: "Reviewer gate",
    text: "A private review layer decides whether the artifact is approved for public surface, candidate-only, blocked, or in need of human review.",
  },
  {
    n: "04",
    title: "Public boundary",
    text: "The public page displays only the bounded evidence and avoids turning internal operations into public claims.",
  },
  {
    n: "05",
    title: "Proof digestion",
    text: "An understanding packet explains what the artifact teaches, where it can be reused, which failures matter, and what remains unresolved.",
  },
];

const proofPoints = [
  {
    label: "Evidence Browser",
    href: "/evidence",
    text: "Approved and candidate artifacts with validation, replay, semantic strength, and non-claims.",
  },
  {
    label: "Forge Rescue Packet",
    href: "/evidence/forge-rescue",
    text: "A bounded evidence packet for the current proof-carrying rescue lane.",
  },
  {
    label: "Rescue Explorer",
    href: "/explorer/rescue-suite",
    text: "Trace frames and human/machine views for rescue events.",
  },
  {
    label: "Proof Digestion Lab",
    href: "/proof-digestion",
    text: "Understanding Packets for Forge Rescue and the Monogate OS EML Bridge: core ideas, reuse paths, failure modes, and open questions.",
  },
];

const built = [
  "Designed an evidence packet flow with validation status, replay status, semantic strength, claim flags, evidence paths, and non-claims.",
  "Implemented a reviewer-gate pattern that separates private approval decisions from bounded public inspection surfaces.",
  "Generated public fixtures from internal research artifacts so pages can drift-check against source evidence.",
  "Built Proof Digestion infrastructure that turns evidence-backed artifacts into teachable explanations, reuse paths, failure modes, and credit lineage.",
  "Deployed public case-study, evidence, explorer, and digestion surfaces while keeping the private command cockpit out of the public product.",
];

const nonClaims = [
  "This is not a production AI safety platform.",
  "This is not a complete formal proof of Forge, Monogate OS, or every rescue obligation.",
  "This is not hardware truth without a live capture packet.",
  "This is not a replacement for human expert review.",
];

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ color: C.text, fontSize: 21, margin: 0, lineHeight: 1.25 }}>{title}</h2>
    </div>
  );
}

export default function EvidenceGovernedComputationCaseStudy() {
  return (
    <main style={{ background: C.bg, minHeight: "100vh", padding: "58px 18px 84px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <header style={{ marginBottom: 42 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {pill("case study", C.orange)}
            {pill("AI safety / formal methods", C.green)}
            {pill("public boundary", C.blue)}
          </div>
          <h1 style={{ color: C.text, fontSize: 40, lineHeight: 1.08, margin: "0 0 16px", fontWeight: 750 }}>
            Evidence-governed computation.
          </h1>
          <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, maxWidth: 740, margin: 0 }}>
            Monogate is a research stack for turning generated artifacts into replayable evidence,
            reviewer decisions, bounded public claims, and human-readable understanding packets.
          </p>
        </header>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="Problem" title="Generated outputs are cheap. Trustworthy review is scarce." />
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, maxWidth: 760, margin: 0 }}>
            AI systems, compilers, proof tools, and hardware-adjacent labs can produce a flood of
            plausible artifacts. The hard part is deciding what evidence exists, what can be replayed,
            what is actually proven, and what should be shown publicly without overclaiming.
          </p>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="Architecture" title="The Monogate evidence flow." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(165px,1fr))", gap: 10 }}>
            {steps.map((step) => (
              <article key={step.n} style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, minHeight: 172 }}>
                <div style={{ color: C.orange, fontSize: 11, fontFamily: "monospace", marginBottom: 10 }}>{step.n}</div>
                <h3 style={{ color: C.text, fontSize: 15, margin: "0 0 8px", lineHeight: 1.35 }}>{step.title}</h3>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="What I built" title="Concrete engineering work behind the public surface." />
          <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 13, lineHeight: 1.75 }}>
            {built.map((item) => (
              <li key={item} style={{ marginBottom: 8 }}>{item}</li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="End-to-end example" title="Forge Rescue Suite." />
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
            <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, margin: "0 0 16px" }}>
              The rescue lane shows the pattern in miniature: an optimization boundary failure becomes
              a named rescue event, a replayable fixture, a semantic-strength review, and an
              understanding packet that explains what the artifact teaches and what it does not prove.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pill("validation: pass", C.green)}
              {pill("replay: pass", C.green)}
              {pill("semantic tier: restricted", C.orange)}
              {pill("digestion: partial", C.blue)}
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="Proof points" title="Inspectable public surfaces." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {proofPoints.map((point) => (
              <a key={point.href} href={point.href} style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16, textDecoration: "none" }}>
                <h3 style={{ color: C.orange, fontSize: 15, margin: "0 0 8px" }}>{point.label}</h3>
                <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.65, margin: 0 }}>{point.text}</p>
              </a>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 44 }}>
          <SectionTitle eyebrow="Why it matters" title="This is infrastructure for proof abundance." />
          <p style={{ color: C.text, fontSize: 14, lineHeight: 1.8, maxWidth: 780, margin: 0 }}>
            As models produce more code, proofs, plans, and explanations, the scarce layer becomes
            review: what happened, what evidence supports it, what can be replayed, what is reusable,
            and what claims are still out of bounds. Monogate treats that layer as a product surface,
            not an afterthought.
          </p>
        </section>

        <section>
          <SectionTitle eyebrow="Boundaries" title="What this case study does not claim." />
          <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 13, lineHeight: 1.75 }}>
            {nonClaims.map((claim) => (
              <li key={claim} style={{ marginBottom: 8 }}>{claim}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
