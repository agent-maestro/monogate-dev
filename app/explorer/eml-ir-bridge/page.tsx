import type { Metadata } from "next";
import type { ReactNode } from "react";
import fixtureJson from "./eml_r1_ir_explorer_bridge_2026_05_27.json";
import { C, pill } from "../../evidence/data";

export const metadata: Metadata = {
  title: "EML IR Bridge Explorer",
  description:
    "Candidate-only EML-R1 inspector for EML IR DAG sharing, replay frames, and claim boundaries.",
};

type Node = {
  id: string;
  kind: string;
  op: string | null;
  args: string[];
  source: string;
  reuse_count: number;
};

type Frame = {
  frame_id: string;
  monotonic_tick: number;
  lifecycle_state: string;
  kernel_id: string;
  guard_action: string;
  guard_reason: string;
  replay_hash: string;
  replay_hash_prev: string | null;
};

const fixture = fixtureJson as unknown as {
  artifactId: string;
  status: string;
  selectedProgram: {
    programId: string;
    family: string;
    sourceExpression: string;
    whySelected: string;
  };
  ir: {
    nodeCount: number;
    edgeCount: number;
    reusedNodes: Node[];
    nodes: Node[];
  };
  costs: {
    canonicalPublicTreeSuperbestNodes: number;
    internalDagSuperbestNodes: number;
    internalExtraDagSavingsNodes: number;
    canonicalPublicTreeEmlNodes: number;
    internalDagEmlNodes: number;
    publicSavingsClaim: boolean;
  };
  replay: {
    frameCount: number;
    terminalState: string;
    hashChainValid: boolean;
    frames: Frame[];
  };
  claimBoundary: {
    boundaryText: string;
    publicReady: boolean;
    publicSavingsClaim: boolean;
    compilerBehaviorChanged: boolean;
    forgeBehaviorChanged: boolean;
    formalVerificationClaim: boolean;
    theoremProofClaim: boolean;
  };
  validationCommands: string[];
};

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 28 }}>
      <h2 style={{ color: C.text, fontSize: 18, margin: "0 0 12px", lineHeight: 1.3 }}>{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value, color = C.orange }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, minHeight: 84 }}>
      <div style={{ color: C.muted, fontSize: 11, lineHeight: 1.4 }}>{label}</div>
      <div style={{ color, fontSize: 24, fontWeight: 800, fontFamily: "monospace", marginTop: 8 }}>{value}</div>
    </div>
  );
}

export default function EmlIrBridgePage() {
  const claimRows = [
    ["Public ready", fixture.claimBoundary.publicReady],
    ["Public savings claim", fixture.claimBoundary.publicSavingsClaim],
    ["Compiler behavior changed", fixture.claimBoundary.compilerBehaviorChanged],
    ["Forge behavior changed", fixture.claimBoundary.forgeBehaviorChanged],
    ["Formal verification claim", fixture.claimBoundary.formalVerificationClaim],
    ["Theorem proof claim", fixture.claimBoundary.theoremProofClaim],
  ];
  const frames = fixture.replay.frames.slice(0, 12);

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer" style={{ color: C.muted, textDecoration: "none" }}>Explorer</a>
          <a href="/evidence" style={{ color: C.muted, textDecoration: "none" }}>Evidence</a>
          <a href="/proof-digestion" style={{ color: C.muted, textDecoration: "none" }}>Proof Digestion</a>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-R1", C.orange)}
            {pill("candidate only", C.orange)}
            {pill("no new public savings claim", C.green)}
            {pill(fixture.status, C.blue)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML IR Bridge Explorer
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 760, margin: 0 }}>
            Watch one EML expression lower into an inspectable DAG, replay as hash-linked frames,
            and carry its claim boundary with it.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          <Metric label="DAG nodes" value={fixture.ir.nodeCount} color={C.blue} />
          <Metric label="Replay frames" value={fixture.replay.frameCount} color={C.green} />
          <Metric label="Reused nodes" value={fixture.ir.reusedNodes.length} />
          <Metric label="Internal DAG delta" value={fixture.costs.internalExtraDagSavingsNodes} color={C.orange} />
        </div>

        <Panel title="Selected Expression">
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              {pill(fixture.selectedProgram.programId, C.blue)}
              {pill(fixture.selectedProgram.family, C.purple)}
            </div>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0, color: C.text, fontSize: 12, lineHeight: 1.65 }}>
              {fixture.selectedProgram.sourceExpression}
            </pre>
            <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, margin: "12px 0 0" }}>
              {fixture.selectedProgram.whySelected}
            </p>
          </div>
        </Panel>

        <Panel title="Tree vs DAG Boundary">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            <Metric label="Public tree SuperBEST baseline" value={fixture.costs.canonicalPublicTreeSuperbestNodes} color={C.green} />
            <Metric label="Internal DAG SuperBEST candidate" value={fixture.costs.internalDagSuperbestNodes} color={C.orange} />
            <Metric label="Public tree EML baseline" value={fixture.costs.canonicalPublicTreeEmlNodes} color={C.green} />
            <Metric label="Internal DAG EML candidate" value={fixture.costs.internalDagEmlNodes} color={C.orange} />
          </div>
          <p style={{ color: C.muted, fontSize: 12, lineHeight: 1.7, marginTop: 12 }}>
            {fixture.claimBoundary.boundaryText}
          </p>
        </Panel>

        <Panel title="Shared DAG Nodes">
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
                {fixture.ir.reusedNodes.slice(0, 12).map((node) => (
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
        </Panel>

        <Panel title="Replay Frames">
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
        </Panel>

        <Panel title="Non-Claims">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 10 }}>
            {claimRows.map(([label, value]) => (
              <div key={String(label)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                <div style={{ color: C.muted, fontSize: 12, marginBottom: 8 }}>{label}</div>
                {pill(String(value), value === false ? C.green : C.red)}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}
