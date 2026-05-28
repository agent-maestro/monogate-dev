import type { Metadata } from "next";
import { C, pill } from "../../evidence/data";
import labJson from "./data/eml_advantage_lab_2026_05_27.json";
import holdoutJson from "./data/eml_a8_1_holdout_advantage_benchmark_2026_05_27.json";
import candidateJson from "./data/eml_a8_2_discovery_candidate_queue_2026_05_27.json";
import trialJson from "./data/eml_a8_3_candidate_trial_runner_2026_05_27.json";
import negativeControlJson from "./data/eml_a8_4_negative_control_discipline_2026_05_27.json";

type AdvantageClass = "eml_win" | "standard_win" | "mixed" | "research_only" | "blocked";

type AdvantagePacket = {
  caseId: string;
  family: string;
  standardForm: string;
  emlForm: string;
  advantageClass: AdvantageClass;
  axes: {
    compression: Record<string, string | number | boolean>;
    runtime: Record<string, string | number | boolean>;
    stability: Record<string, string | number | boolean>;
    lowering: Record<string, string | number | boolean>;
    proof: Record<string, string | number | boolean>;
    search: Record<string, string | number | boolean>;
    teaching: Record<string, string | number | boolean>;
  };
  blockedClaims: string[];
};

type HoldoutPacket = {
  caseId: string;
  sourceAdvantageClass: string;
  holdoutClass: string;
  holdoutConfidence: string;
  profiles: Array<Record<string, unknown>>;
};

type CandidatePacket = {
  candidateId: string;
  family: string;
  expectedAdvantageAxis: string;
  queueClass: string;
  priorityScore: number;
  whyEmlMightHelp: string;
};

type TrialPacket = {
  candidateId: string;
  trialId: string;
  trialClass: string;
  axisTested: string;
  interpretation: string;
  profiles: Array<Record<string, unknown>>;
};

type NegativeControlPacket = {
  controlId: string;
  controlClass: string;
  expectedWinner: string;
  evidenceStatus: string;
  reason: string;
};

const lab = labJson as unknown as {
  status: string;
  labId: string;
  summary: {
    packetCount: number;
    byAdvantageClass: Record<string, number>;
    emlWinCount: number;
    standardWinCount: number;
    mixedCount: number;
    researchOnlyCount: number;
    generalEmlSuperiorityClaim: boolean;
    compilerCorrectnessClaim: boolean;
  };
  advantagePackets: AdvantagePacket[];
  nonClaims: string[];
};

const holdout = holdoutJson as unknown as {
  status: string;
  summary: {
    holdoutPacketCount: number;
    byHoldoutClass: Record<string, number>;
    retainedCount: number;
    weakenedCount: number;
    blockedCount: number;
    negativeControlPassCount: number;
    emlAdvantageProved: boolean;
    generalEmlSuperiorityClaim: boolean;
  };
  holdoutPackets: HoldoutPacket[];
  nonClaims: string[];
};

const candidates = candidateJson as unknown as {
  status: string;
  summary: {
    candidateCount: number;
    byQueueClass: Record<string, number>;
    topCandidateId: string;
    topQueueClass: string;
    candidateTestPerformed: boolean;
    candidateProved: boolean;
  };
  candidatePackets: CandidatePacket[];
  nonClaims: string[];
};

const trials = trialJson as unknown as {
  status: string;
  summary: {
    trialCount: number;
    byTrialClass: Record<string, number>;
    proofShapeSupportedCount: number;
    mixedIdentitySupportedCount: number;
    standardRuntimeWinConfirmedCount: number;
    blockedCount: number;
    candidateProved: boolean;
    emlAdvantageProved: boolean;
  };
  trialPackets: TrialPacket[];
  nonClaims: string[];
};

const negativeControls = negativeControlJson as unknown as {
  status: string;
  summary: {
    controlCount: number;
    confirmedControlCount: number;
    registeredForNextHoldoutCount: number;
    negativeControlsExhaustive: boolean;
  };
  controlPackets: NegativeControlPacket[];
  nonClaims: string[];
};

export const metadata: Metadata = {
  title: "EML Advantage Lab",
  description: "Bounded EML-vs-standard comparison across compression, runtime, stability, lowering, proof, and search evidence.",
};

function classColor(value: AdvantageClass) {
  if (value === "eml_win") return C.green;
  if (value === "standard_win") return C.blue;
  if (value === "research_only") return C.purple;
  if (value === "blocked") return C.red;
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

function axisLabel(packet: AdvantagePacket, axis: keyof AdvantagePacket["axes"]) {
  const label = packet.axes[axis].label;
  return typeof label === "string" ? label : "n/a";
}

export default function EmlAdvantagePage() {
  const ordered = [...lab.advantagePackets].sort((a, b) => {
    const rank: Record<AdvantageClass, number> = {
      eml_win: 0,
      mixed: 1,
      standard_win: 2,
      research_only: 3,
      blocked: 4,
    };
    return rank[a.advantageClass] - rank[b.advantageClass] || a.caseId.localeCompare(b.caseId);
  });

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/explorer/eml-packets" style={{ color: C.muted, textDecoration: "none" }}>EML Packets</a>
          <a href="/explorer/eml-language" style={{ color: C.muted, textDecoration: "none" }}>Language Kernel</a>
          <a href="/explorer/eml-symbolic-regression" style={{ color: C.muted, textDecoration: "none" }}>Template Search</a>
          <a href="/explorer/eml-atlas-annex" style={{ color: C.muted, textDecoration: "none" }}>Atlas Annex</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML Advantage Lab", C.orange)}
            {pill(lab.status, C.green)}
            {pill("A8.1 holdout", C.purple)}
            {pill("A8.2 candidates", C.blue)}
            {pill("A8.3 trials", C.green)}
            {pill("A8.4 controls", C.red)}
            {pill("bounded comparison", C.blue)}
            {pill("general superiority: false", C.green)}
            {pill("compiler correctness: false", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Advantage Lab
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 880, margin: 0 }}>
            Compare EML-native and standard representations across compression, runtime, stability, lowering, proof, and search evidence.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 24 }}>
          <Metric label="Packets" value={lab.summary.packetCount} color={C.blue} />
          <Metric label="EML wins" value={lab.summary.emlWinCount} color={C.green} />
          <Metric label="Mixed" value={lab.summary.mixedCount} color={C.orange} />
          <Metric label="Standard wins" value={lab.summary.standardWinCount} color={C.blue} />
          <Metric label="Research-only" value={lab.summary.researchOnlyCount} color={C.purple} />
          <Metric label="Holdout retained" value={holdout.summary.retainedCount} color={C.green} />
          <Metric label="Controls passed" value={holdout.summary.negativeControlPassCount} color={C.blue} />
          <Metric label="Discovery candidates" value={candidates.summary.candidateCount} color={C.purple} />
          <Metric label="Candidate trials" value={trials.summary.trialCount} color={C.green} />
          <Metric label="Negative controls" value={negativeControls.summary.controlCount} color={C.red} />
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            current finding
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            This run does not say EML wins everywhere. It shows the useful terrain: scoped identities and symbolic-search structures are promising, while several runtime and stability cases still favor standard or protected math.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(lab.summary.byAdvantageClass).map(([name, count]) => (
              pill(`${name}: ${count}`, classColor(name as AdvantageClass))
            ))}
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            A8.3 candidate trials
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            The first queue items have moved from ranked candidates into bounded trials. One proof-shape lane is supported, one identity lane stays mixed, and one runtime anti-example confirms standard math should win.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
            <Metric label="Proof-shape supported" value={trials.summary.proofShapeSupportedCount} color={C.green} />
            <Metric label="Mixed identity" value={trials.summary.mixedIdentitySupportedCount} color={C.orange} />
            <Metric label="Standard runtime win" value={trials.summary.standardRuntimeWinConfirmedCount} color={C.blue} />
            <Metric label="Blocked" value={trials.summary.blockedCount} color={trials.summary.blockedCount === 0 ? C.green : C.red} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Candidate</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Trial</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Class</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Axis</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Profiles</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {trials.trialPackets.map((packet) => (
                  <tr key={packet.trialId}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.candidateId}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.trialId}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.trialClass, packet.trialClass.includes("standard") ? C.blue : packet.trialClass.includes("mixed") ? C.orange : C.green)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.axisTested}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.profiles.length}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", color: C.muted, lineHeight: 1.5 }}>{packet.interpretation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            A8.4 negative-control discipline
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            The lab keeps explicit cases where EML should lose or remain blocked. These controls prevent the scoreboard from turning into a one-way promotion surface.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
            <Metric label="Controls" value={negativeControls.summary.controlCount} color={C.red} />
            <Metric label="Confirmed" value={negativeControls.summary.confirmedControlCount} color={C.blue} />
            <Metric label="Next holdout" value={negativeControls.summary.registeredForNextHoldoutCount} color={C.orange} />
            <Metric label="Exhaustive" value={String(negativeControls.summary.negativeControlsExhaustive)} color={C.green} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Control</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Class</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Expected</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Evidence</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {negativeControls.controlPackets.map((packet) => (
                  <tr key={packet.controlId}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.controlId}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.controlClass, C.purple)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.expectedWinner, packet.expectedWinner === "standard" ? C.blue : C.orange)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.evidenceStatus, packet.evidenceStatus === "confirmed" ? C.green : C.orange)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", color: C.muted, lineHeight: 1.5 }}>{packet.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            A8.2 discovery queue
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            The queue turns the holdout result into new EML-native candidates to test next. These are private candidates, not public claims.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.entries(candidates.summary.byQueueClass).map(([name, count]) => (
              pill(`${name}: ${count}`, name === "ready_for_advantage_lab" ? C.green : name === "needs_machlib_witness" ? C.purple : C.orange)
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Candidate</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Family</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Axis</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Queue</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Score</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Why</th>
                </tr>
              </thead>
              <tbody>
                {[...candidates.candidatePackets]
                  .sort((a, b) => b.priorityScore - a.priorityScore || a.candidateId.localeCompare(b.candidateId))
                  .slice(0, 8)
                  .map((packet) => (
                    <tr key={packet.candidateId}>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.candidateId}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.family, C.blue)}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.expectedAdvantageAxis}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.queueClass, packet.queueClass === "ready_for_advantage_lab" ? C.green : packet.queueClass === "needs_machlib_witness" ? C.purple : C.orange)}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.priorityScore}</td>
                      <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", color: C.muted, lineHeight: 1.5 }}>{packet.whyEmlMightHelp}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            A8.1 holdout layer
          </div>
          <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>
            The holdout benchmark reruns the initial labels on shifted, edge, and stress profiles, then checks negative controls where EML should not win.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 14 }}>
            <Metric label="Holdout packets" value={holdout.summary.holdoutPacketCount} color={C.blue} />
            <Metric label="Retained" value={holdout.summary.retainedCount} color={C.green} />
            <Metric label="Weakened" value={holdout.summary.weakenedCount} color={C.orange} />
            <Metric label="Blocked" value={holdout.summary.blockedCount} color={C.red} />
            <Metric label="Negative controls" value={holdout.summary.negativeControlPassCount} color={C.purple} />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Case</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Source</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Holdout</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Confidence</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Profiles</th>
                </tr>
              </thead>
              <tbody>
                {holdout.holdoutPackets.map((packet) => (
                  <tr key={packet.caseId}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.caseId}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.sourceAdvantageClass}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.holdoutClass, packet.holdoutClass.includes("standard") ? C.blue : packet.holdoutClass.includes("eml") ? C.green : C.orange)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.holdoutConfidence, packet.holdoutConfidence === "retained" ? C.green : packet.holdoutConfidence === "control_pass" ? C.blue : C.orange)}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{packet.profiles.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, marginBottom: 24 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            advantage packets
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980, fontSize: 12 }}>
              <thead>
                <tr style={{ color: C.muted, textAlign: "left" }}>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Case</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Class</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Compression</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Runtime</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Stability</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Lowering</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Proof</th>
                  <th style={{ borderBottom: `1px solid ${C.border}`, padding: "8px 10px" }}>Clarity</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((packet) => (
                  <tr key={packet.caseId}>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace", overflowWrap: "anywhere" }}>{packet.caseId}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px" }}>{pill(packet.advantageClass, classColor(packet.advantageClass))}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "compression")}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "runtime")}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "stability")}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "lowering")}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "proof")}</td>
                    <td style={{ borderBottom: `1px solid ${C.border}`, padding: "9px 10px", fontFamily: "monospace" }}>{axisLabel(packet, "teaching")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 12, marginBottom: 24 }}>
          {ordered.map((packet) => (
            <article key={packet.caseId} style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {pill(packet.advantageClass, classColor(packet.advantageClass))}
                {pill(packet.family, C.blue)}
              </div>
              <h2 style={{ color: C.text, fontSize: 16, lineHeight: 1.25, margin: "0 0 10px", overflowWrap: "anywhere" }}>
                {packet.caseId}
              </h2>
              <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.6, marginBottom: 10 }}>
                <div style={{ color: C.green }}>EML</div>
                <pre style={{ margin: "4px 0 10px", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{packet.emlForm}</pre>
                <div style={{ color: C.blue }}>Standard</div>
                <pre style={{ margin: "4px 0 0", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{packet.standardForm}</pre>
              </div>
              <ul style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, margin: 0, paddingLeft: 18 }}>
                {packet.blockedClaims.slice(0, 3).map((claim) => (
                  <li key={claim}>{claim}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
          <div style={{ color: C.green, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            non-claims
          </div>
          <ul style={{ color: C.muted, fontSize: 13, lineHeight: 1.7, margin: 0, paddingLeft: 18 }}>
            {lab.nonClaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
            {holdout.nonClaims.map((item) => (
              <li key={`holdout-${item}`}>{item}</li>
            ))}
            {candidates.nonClaims.map((item) => (
              <li key={`candidate-${item}`}>{item}</li>
            ))}
            {trials.nonClaims.map((item) => (
              <li key={`trial-${item}`}>{item}</li>
            ))}
            {negativeControls.nonClaims.map((item) => (
              <li key={`negative-control-${item}`}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
