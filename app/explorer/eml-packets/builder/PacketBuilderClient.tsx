"use client";

import { useMemo, useState } from "react";
import { C, pill } from "../../../evidence/data";

const falseFlags = {
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

function parseInputs(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseKeyValues(value: string, fallback: string) {
  const out: Record<string, string> = {};
  for (const input of parseInputs(value)) out[input] = fallback;
  return out;
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

export default function PacketBuilderClient() {
  const [programId, setProgramId] = useState("voltage_divider_v0");
  const [family, setFamily] = useState("electronics");
  const [expression, setExpression] = useState("vin * r2 / (r1 + r2)");
  const [inputs, setInputs] = useState("vin,r1,r2");
  const [units, setUnits] = useState("vin:V\nr1:ohm\nr2:ohm");
  const [ranges, setRanges] = useState("vin:0..3.3\nr1:100..100000\nr2:100..100000");
  const [meaning, setMeaning] = useState("Voltage divider expression packet candidate for EML IR/replay intake.");
  const [sourceRepo, setSourceRepo] = useState("monogate-electronics");

  const packet = useMemo(() => {
    const inputNames = parseInputs(inputs);
    const unitMap = parseKeyValues(inputNames.join(","), "unspecified");
    for (const row of units.split("\n")) {
      const [name, unit] = row.split(":");
      if (name && unit) unitMap[name.trim()] = unit.trim();
    }
    return {
      schemaVersion: "monogate.eml_expression_packet.v0",
      program_id: programId,
      family,
      expression,
      inputs: inputNames,
      units: unitMap,
      safe_ranges: parseRanges(ranges),
      physical_meaning: meaning,
      source_repo: sourceRepo,
      simulated_trace_samples: [],
      claim_flags: falseFlags,
    };
  }, [expression, family, inputs, meaning, programId, ranges, sourceRepo, units]);

  const packetJson = JSON.stringify(packet, null, 2);
  const packetName = `${programId}.json`;
  const command = `python python/scripts/eml_packet_builder.py --packet ${packetName} --strict`;
  const hints = [
    [/^[a-z][a-z0-9_]*_v[0-9]+$/.test(programId), "program_id shape"],
    [packet.inputs.length > 0, "inputs declared"],
    [expression.trim().length > 0, "expression present"],
    [meaning.trim().length > 0, "meaning present"],
    [Object.values(packet.claim_flags).every((value) => value === false), "claim flags false"],
  ] as const;

  return (
    <main style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 18px 72px" }}>
        <nav style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28, fontSize: 12 }}>
          <a href="/" style={{ color: C.muted, textDecoration: "none" }}>monogate.dev</a>
          <a href="/explorer/eml-packets" style={{ color: C.muted, textDecoration: "none" }}>EML Packets</a>
          <span style={{ color: C.orange }}>Builder</span>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {pill("EML-R4", C.orange)}
            {pill("private packet intake", C.orange)}
            {pill("client-side only", C.blue)}
            {pill("claim flags locked false", C.green)}
          </div>
          <h1 style={{ color: C.orange, fontSize: 34, lineHeight: 1.1, margin: "0 0 12px", fontFamily: "monospace" }}>
            EML Packet Builder
          </h1>
          <p style={{ color: C.text, fontSize: 16, lineHeight: 1.75, maxWidth: 780, margin: 0 }}>
            Draft an EML Expression Packet v0 candidate before running the local builder.
          </p>
        </header>

        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 14, alignItems: "start" }}>
          <div style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16, display: "grid", gap: 12 }}>
            <TextInput label="program_id" value={programId} onChange={setProgramId} />
            <TextInput label="family" value={family} onChange={setFamily} />
            <TextInput label="expression" value={expression} onChange={setExpression} multiline />
            <TextInput label="inputs" value={inputs} onChange={setInputs} />
            <TextInput label="units" value={units} onChange={setUnits} multiline />
            <TextInput label="safe ranges" value={ranges} onChange={setRanges} multiline />
            <TextInput label="physical meaning" value={meaning} onChange={setMeaning} multiline />
            <TextInput label="source repo" value={sourceRepo} onChange={setSourceRepo} />
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                validation hints
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {hints.map(([ok, label]) => (
                  <span key={label}>{pill(`${label}: ${ok ? "ok" : "check"}`, ok ? C.green : C.orange)}</span>
                ))}
              </div>
            </section>

            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                local command
              </div>
              <code style={{ display: "block", color: C.green, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, fontSize: 12, lineHeight: 1.6, overflowWrap: "anywhere" }}>
                {command}
              </code>
            </section>

            <section style={{ border: `1px solid ${C.border}`, background: C.surface, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.muted, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                packet json
              </div>
              <pre style={{ margin: 0, maxHeight: 560, overflow: "auto", color: C.text, background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 6, padding: 12, fontSize: 11, lineHeight: 1.55 }}>
                {packetJson}
              </pre>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
