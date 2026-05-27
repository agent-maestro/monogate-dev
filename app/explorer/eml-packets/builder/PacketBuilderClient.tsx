"use client";

import { useMemo, useState } from "react";
import { C, pill } from "../../../evidence/data";

const falseClaimFlags = {
  public_ready: false,
  public_savings_claim: false,
  hardware_observed: false,
  live_serial_capture_performed: false,
  certified_safety_claim: false,
  production_controller_claim: false,
  formal_verification_claim: false,
  theorem_proof_claim: false,
  compiler_behavior_changed: false,
  forge_behavior_changed: false,
};

const artifactTypes = [
  "AI answer",
  "proof note",
  "trace/replay",
  "hardware packet",
  "compiler artifact",
  "EML expression",
] as const;

type ArtifactType = (typeof artifactTypes)[number];

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "candidate";
}

function parseInputs(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseRanges(value: string) {
  const ranges: Record<string, { min: number; max: number }> = {};
  for (const row of value.split("\n")) {
    const trimmed = row.trim();
    if (!trimmed) continue;
    const [name, rest] = trimmed.split(":");
    if (!name || !rest) continue;
    const [minRaw, maxRaw] = rest.split("..");
    const min = Number(minRaw);
    const max = Number(maxRaw);
    if (Number.isFinite(min) && Number.isFinite(max)) ranges[name.trim()] = { min, max };
  }
  return ranges;
}

function parseUnits(value: string, inputNames: string[]) {
  const units: Record<string, string> = Object.fromEntries(inputNames.map((name) => [name, "unspecified"]));
  for (const row of value.split("\n")) {
    const [name, unit] = row.split(":");
    if (name && unit) units[name.trim()] = unit.trim();
  }
  return units;
}

function TextInput({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  const style = {
    width: "100%",
    boxSizing: "border-box" as const,
    border: `1px solid ${C.border}`,
    background: C.surface2,
    color: C.text,
    borderRadius: 6,
    padding: "10px 11px",
    fontSize: 12,
    lineHeight: 1.55,
    fontFamily: "monospace",
    outline: "none",
  };
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={5} style={{ ...style, resize: "vertical" }} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} style={style} />
      )}
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ArtifactType;
  onChange: (value: ArtifactType) => void;
}) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", color: C.muted, fontSize: 11, marginBottom: 6 }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ArtifactType)}
        style={{
          width: "100%",
          border: `1px solid ${C.border}`,
          background: C.surface2,
          color: C.text,
          borderRadius: 6,
          padding: "10px 11px",
          fontSize: 12,
          outline: "none",
        }}
      >
        {artifactTypes.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}

export default function PacketBuilderClient() {
  const [artifactType, setArtifactType] = useState<ArtifactType>("AI answer");
  const [title, setTitle] = useState("EML runtime lowering note");
  const [artifactText, setArtifactText] = useState(
    "R10/R11 show that this EML-looking expression should preserve symbolic identity but lower to a standard runtime implementation."
  );
  const [sourcePath, setSourcePath] = useState("monogate/reports/eml_r11_hybrid_lowering_planner_2026_05_27.md");
  const [validationStatus, setValidationStatus] = useState("candidate");
  const [replayStatus, setReplayStatus] = useState("not_applicable");
  const [programId, setProgramId] = useState("voltage_divider_v0");
  const [family, setFamily] = useState("electronics");
  const [expression, setExpression] = useState("vin * r2 / (r1 + r2)");
  const [inputs, setInputs] = useState("vin,r1,r2");
  const [units, setUnits] = useState("vin:V\nr1:ohm\nr2:ohm");
  const [ranges, setRanges] = useState("vin:0..3.3\nr1:100..100000\nr2:100..100000");

  const inputNames = useMemo(() => parseInputs(inputs), [inputs]);
  const evidencePacket = useMemo(() => {
    const artifactId = slug(title);
    return {
      schemaVersion: "monogate.evidence_public_packet.v0",
      artifactId,
      title,
      artifactType,
      reviewDecision: "candidate_only",
      validationStatus,
      replayStatus,
      semanticStrength: "candidate_packet_generated_by_client_builder",
      semanticReview: {
        artifact_preview: artifactText.slice(0, 320),
        source_path: sourcePath,
        generated_in: "monogate.dev packet builder v1",
      },
      claimBoundary:
        "Candidate packet only. A local validator/replay/proof step must run before any public strengthening.",
      claimFlags: falseClaimFlags,
      nonClaims: [
        "This packet is a draft, not reviewer approval.",
        "This packet does not prove theorem correctness or formal safety.",
        "This packet does not claim hardware observation or live serial capture.",
        "This packet does not change compiler, Forge, or runtime behavior.",
      ],
      evidencePaths: sourcePath ? [sourcePath] : [],
      nextReviewSteps: [
        "run local validation",
        "attach replay or proof output when available",
        "review claim flags before surfacing publicly",
      ],
    };
  }, [artifactText, artifactType, replayStatus, sourcePath, title, validationStatus]);

  const expressionPacket = useMemo(
    () => ({
      schemaVersion: "monogate.eml_expression_packet.v0",
      program_id: programId,
      family,
      expression,
      inputs: inputNames,
      units: parseUnits(units, inputNames),
      safe_ranges: parseRanges(ranges),
      physical_meaning: artifactText,
      source_repo: sourcePath.split("/")[0] || "monogate",
      simulated_trace_samples: [],
      claim_flags: falseClaimFlags,
    }),
    [artifactText, expression, family, inputNames, programId, ranges, sourcePath, units]
  );

  const evidenceJson = JSON.stringify(evidencePacket, null, 2);
  const expressionJson = JSON.stringify(expressionPacket, null, 2);
  const encodedEvidence = `data:application/json;charset=utf-8,${encodeURIComponent(evidenceJson)}`;
  const encodedExpression = `data:application/json;charset=utf-8,${encodeURIComponent(expressionJson)}`;
  const hints = [
    [title.trim().length > 0, "title present"],
    [artifactText.trim().length > 0, "artifact pasted"],
    [Object.values(evidencePacket.claimFlags).every((value) => value === false), "claim flags false"],
    [validationStatus !== "pass" || sourcePath.trim().length > 0, "pass needs source"],
    [artifactType !== "hardware packet" || !artifactText.toLowerCase().includes("hardware observed"), "hardware wording bounded"],
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/evidence" style={{ color: C.muted, textDecoration: "none" }}>Evidence</a>
          <a href="/explorer/eml-packets" style={{ color: C.muted, textDecoration: "none" }}>EML Packets</a>
          <span style={{ color: C.orange }}>Builder</span>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("Evidence Packet Builder v1", C.orange)}
            {pill("client-side only", C.blue)}
            {pill("draft packets", C.orange)}
            {pill("claim flags locked false", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            Evidence Packet Builder
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 820, margin: 0 }}>
            Paste an artifact, choose its type, generate a candidate evidence packet, inspect blocked
            claims, and export JSON. EML expressions also get an expression packet draft.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 14, alignItems: "start" }}>
          <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, display: "grid", gap: 12 }}>
            <SelectInput label="artifact type" value={artifactType} onChange={setArtifactType} />
            <TextInput label="title" value={title} onChange={setTitle} />
            <TextInput label="paste artifact or summary" value={artifactText} onChange={setArtifactText} multiline />
            <TextInput label="source path / URL" value={sourcePath} onChange={setSourcePath} />
            <TextInput label="validation status" value={validationStatus} onChange={setValidationStatus} />
            <TextInput label="replay status" value={replayStatus} onChange={setReplayStatus} />

            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "grid", gap: 12 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                optional EML expression packet
              </div>
              <TextInput label="program_id" value={programId} onChange={setProgramId} />
              <TextInput label="family" value={family} onChange={setFamily} />
              <TextInput label="expression" value={expression} onChange={setExpression} multiline />
              <TextInput label="inputs" value={inputs} onChange={setInputs} />
              <TextInput label="units" value={units} onChange={setUnits} multiline />
              <TextInput label="safe ranges" value={ranges} onChange={setRanges} multiline />
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                review hints
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {hints.map(([ok, label]) => (
                  <span key={label}>{pill(`${label}: ${ok ? "ok" : "check"}`, ok ? C.green : C.orange)}</span>
                ))}
              </div>
            </section>

            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                blocked public claims
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, color: C.text, fontSize: 12, lineHeight: 1.75 }}>
                {evidencePacket.nonClaims.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  evidence packet json
                </div>
                <a href={encodedEvidence} download={`${evidencePacket.artifactId}_evidence_packet.json`} style={{ color: C.green, fontSize: 12 }}>
                  export JSON
                </a>
              </div>
              <pre style={{ margin: 0, maxHeight: 430, overflow: "auto", color: C.text, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, fontSize: 11, lineHeight: 1.55 }}>
                {evidenceJson}
              </pre>
            </section>

            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
                <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  expression packet json
                </div>
                <a href={encodedExpression} download={`${programId}_expression_packet.json`} style={{ color: C.green, fontSize: 12 }}>
                  export JSON
                </a>
              </div>
              <pre style={{ margin: 0, maxHeight: 360, overflow: "auto", color: C.text, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, fontSize: 11, lineHeight: 1.55 }}>
                {expressionJson}
              </pre>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
