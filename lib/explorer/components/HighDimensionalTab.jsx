import { useMemo, useState } from "react";
import cornerPacket from "../data/high_dim_corner_concentration_2026_05_26.json";
import tracePacket from "../data/forge_attractor_trace_packet_2026_05_26.json";
import heuristicPacket from "../data/forge_heuristic_frontier_2026_05_26.json";
import usefulPacket from "../data/high_dim_useful_volume_census_2026_05_26.json";
import formalizationPacket from "../data/high_dim_formalization_bridge_2026_05_26.json";
import corpusIndex from "../data/ir_evidence_corpus_index.json";
import expSharedPacket from "../data/exp_shared.json";
import domainGuardsPacket from "../data/domain_guards.json";
import expRatioPacket from "../data/exp_ratio.json";
import trigPairPacket from "../data/trig_pair.json";
import saturationProbePacket from "../data/saturation_probe.json";

const C = {
  bg: "#07080f",
  surface: "#0d0e1c",
  border: "#191b2e",
  text: "#cdd0e0",
  muted: "#6f738a",
  accent: "#e8a020",
  blue: "#6ab0f5",
  green: "#5ec47a",
  warn: "#f59e0b",
  red: "#e05060",
};

function Stat({ label, value, tone = C.accent }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ color: tone, fontSize: 18, fontWeight: 700, wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}

function Chip({ children, tone = C.muted }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      border: `1px solid ${C.border}`,
      borderRadius: 999,
      padding: "3px 8px",
      color: tone,
      background: "rgba(255,255,255,0.025)",
      fontSize: 10,
      lineHeight: 1.5,
    }}>
      {children}
    </span>
  );
}

function Bar({ value, tone = C.accent }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div style={{ height: 6, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: tone }} />
    </div>
  );
}

function fmt(value) {
  if (value === null || value === undefined) return "n/a";
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) return Number(value).toExponential(2);
  return Number(value).toPrecision(4);
}

const corpusPackets = {
  exp_shared: expSharedPacket,
  domain_guards: domainGuardsPacket,
  exp_ratio: expRatioPacket,
  trig_pair: trigPairPacket,
  saturation_probe: saturationProbePacket,
};

export default function HighDimensionalTab() {
  const [selectedPacketId, setSelectedPacketId] = useState(corpusIndex.packets[0]?.id ?? "");
  const rows = cornerPacket.rows;
  const final = rows[rows.length - 1];
  const traceRows = tracePacket.summary;
  const heuristicRows = heuristicPacket.rows.filter((row) => row.depth >= 3);
  const usefulRows = usefulPacket.rows.filter((row) => row.target === "pi" && row.distribution !== "raw_cube");
  const selectedPacket = corpusPackets[selectedPacketId] ?? expSharedPacket;
  const selectedMeta = corpusIndex.packets.find((packet) => packet.id === selectedPacketId) ?? corpusIndex.packets[0];
  const selectedReplayFrames = selectedPacket.replay?.frames ?? [];
  const guardFrames = selectedReplayFrames.filter((frame) => frame.guard_action && frame.guard_action !== "PASS");
  const packetJson = useMemo(() => JSON.stringify(selectedPacket, null, 2), [selectedPacket]);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.accent, marginBottom: 6 }}>
              High-D EML Tree Space
            </div>
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.8, maxWidth: 720 }}>
              Sampled probe linking high-dimensional corner concentration to EML tree domain, overflow,
              saturation, and optimizer-trace failure modes.
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Chip tone={C.warn}>sampled_evidence_only</Chip>
            <Chip tone={C.warn}>phantom_attractor_proof: false</Chip>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginBottom: 14 }}>
        <Stat label="max leaves" value={final.leaf_dimension} tone={C.blue} />
        <Stat label="ball/cube" value={fmt(final.hypersphere_cube_ratio)} />
        <Stat label="boundary shell" value={`${(final.boundary_shell_fraction * 100).toFixed(1)}%`} tone={C.warn} />
        <Stat label="raw valid" value={`${(final.raw_domain_valid_fraction * 100).toFixed(1)}%`} tone={C.red} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Corner Concentration by Depth</div>
        <div style={{ overflowX: "auto", paddingBottom: 2 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {rows.map((row) => (
              <div key={row.depth} style={{
                display: "grid",
                gridTemplateColumns: "54px 64px minmax(90px,1fr) minmax(90px,1fr) minmax(90px,1fr) 74px",
                gap: 10,
                alignItems: "center",
                color: C.muted,
                fontSize: 10,
                minWidth: 640,
              }}>
                <span style={{ color: C.text }}>d{row.depth}</span>
                <span>{row.leaf_dimension} leaves</span>
                <Bar value={row.boundary_shell_fraction} tone={C.warn} />
                <Bar value={row.middle_ball_fraction} tone={C.blue} />
                <Bar value={row.positive_non_saturated_fraction} tone={C.green} />
                <span style={{ color: C.accent }}>{fmt(row.hypersphere_cube_ratio)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <Chip tone={C.warn}>orange: boundary shell</Chip>
          <Chip tone={C.blue}>blue: middle proxy</Chip>
          <Chip tone={C.green}>green: non-saturated EML</Chip>
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>Forge Heuristic Frontier</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              Multi-seed comparison for guarded, boundary-aware, log-domain, and random-search regimes.
            </div>
          </div>
          <Chip tone={C.warn}>optimizer_release_claim: false</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
          {heuristicRows.map((row) => (
            <div key={`${row.depth}_${row.regime}`} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <span style={{ color: C.accent, fontSize: 10, fontWeight: 700 }}>d{row.depth}</span>
                <span style={{ color: C.muted, fontSize: 9 }}>{row.regime}</span>
              </div>
              <Bar value={1 - row.mean_saturation_rate} tone={row.mean_saturation_rate < 0.5 ? C.green : C.red} />
              <div style={{ color: C.muted, fontSize: 9, lineHeight: 1.7, marginTop: 7 }}>
                mean loss {fmt(row.mean_best_loss)}<br />
                finite {(row.mean_finite_fraction * 100).toFixed(0)}% · saturation {(row.mean_saturation_rate * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
        <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7, marginTop: 12 }}>
          Log-domain parameterization is now tracked as a first-class Forge candidate. Random search remains a control.
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>Forge Attractor Trace Packet</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              Six optimizer regimes against the same depth-{tracePacket.depth} terminal geometry.
            </div>
          </div>
          <Chip tone={C.warn}>optimizer_release_claim: false</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 8 }}>
          {traceRows.map((row) => (
            <div key={row.regime} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: 10 }}>
              <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>
                {row.regime}
              </div>
              <div style={{ color: row.label === "converged" ? C.green : row.label === "domain_failed" || row.label === "collapsed" ? C.red : C.warn, fontSize: 13, fontWeight: 700, marginBottom: 7 }}>
                {row.label}
              </div>
              <div style={{ color: C.muted, fontSize: 9, lineHeight: 1.7 }}>
                best loss {fmt(row.best_loss)}<br />
                domain {row.domain_failures} · overflow {row.overflow_events}<br />
                saturation {row.saturation_events} · finite {row.finite_steps}
              </div>
            </div>
          ))}
        </div>
        <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7, marginTop: 12 }}>
          MachLib/Lean queue: ball/cube collapse, boundary-shell probability, first-layer log-domain survival,
          and guarded lowering domain preservation.
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>Useful Volume Census</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              Target-adjacent sampled volume for pi under positive and guarded terminal distributions.
            </div>
          </div>
          <Chip tone={C.warn}>symbolic_usefulness_proof: false</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 8 }}>
          {usefulRows.map((row) => (
            <div key={`${row.distribution}_${row.depth}`} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                <span style={{ color: C.accent, fontSize: 10, fontWeight: 700 }}>d{row.depth}</span>
                <span style={{ color: C.muted, fontSize: 9 }}>{row.distribution}</span>
              </div>
              <Bar value={row.target_adjacent_fraction} tone={row.target_adjacent_fraction > 0 ? C.green : C.red} />
              <div style={{ color: C.muted, fontSize: 9, lineHeight: 1.7, marginTop: 7 }}>
                adjacent {(row.target_adjacent_fraction * 100).toFixed(2)}%<br />
                finite {(row.finite_fraction * 100).toFixed(1)}% · best {fmt(row.best_abs_error)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
        <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Formalization Bridge</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 8 }}>
          {formalizationPacket.obligations.map((item) => (
            <div key={item.id} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: 10 }}>
              <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>{item.id}</div>
              <div style={{ color: C.text, fontSize: 10, lineHeight: 1.6, marginBottom: 6 }}>{item.informal_statement}</div>
              <div style={{ color: C.blue, fontSize: 9, wordBreak: "break-word" }}>{item.lean_name}</div>
            </div>
          ))}
        </div>
        <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7, marginTop: 12 }}>
          These are theorem stubs only. No formal verification claim is attached to this packet.
        </div>
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div>
            <div style={{ color: C.text, fontSize: 12, fontWeight: 700 }}>IR Evidence Corpus</div>
            <div style={{ color: C.muted, fontSize: 10, lineHeight: 1.7 }}>
              Stable packet index for lowering, replay, guard, and saturation cases.
            </div>
          </div>
          <Chip tone={C.warn}>formal_verification_claim: false</Chip>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 8 }}>
          {corpusIndex.packets.map((packet) => (
            <button
              key={packet.id}
              onClick={() => setSelectedPacketId(packet.id)}
              style={{
                background: C.bg,
                border: `1px solid ${selectedPacketId === packet.id ? C.accent : C.border}`,
                borderRadius: 7,
                padding: 10,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, marginBottom: 5 }}>{packet.id}</div>
              <div style={{ color: C.text, fontSize: 10, lineHeight: 1.6, marginBottom: 6 }}>{packet.expression}</div>
              <div style={{ color: C.muted, fontSize: 9, wordBreak: "break-all" }}>{packet.packet_hash}</div>
            </button>
          ))}
        </div>
        <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: 12, marginTop: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 10 }}>
            <Stat label="nodes" value={selectedPacket.dag.nodes.length} tone={C.blue} />
            <Stat label="tree cost" value={selectedPacket.dag.tree_cost} />
            <Stat label="dag cost" value={selectedPacket.dag.dag_cost} tone={C.green} />
            <Stat label="replay frames" value={selectedReplayFrames.length} tone={C.warn} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(180px,0.8fr) minmax(240px,1.2fr)", gap: 10 }}>
            <div>
              <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, marginBottom: 6 }}>{selectedMeta.id}</div>
              <div style={{ color: C.text, fontSize: 11, lineHeight: 1.7, marginBottom: 8 }}>{selectedPacket.source_expression}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                {(selectedPacket.research_status?.labels ?? []).map((label) => <Chip key={label} tone={C.blue}>{label}</Chip>)}
                {guardFrames.length > 0 ? <Chip tone={C.warn}>guarded</Chip> : <Chip tone={C.green}>guards pass</Chip>}
              </div>
              <div style={{ color: C.muted, fontSize: 9, lineHeight: 1.7, wordBreak: "break-all" }}>
                root {selectedPacket.dag.root}<br />
                {selectedPacket.packet_hash}
              </div>
            </div>
            <pre style={{
              margin: 0,
              maxHeight: 220,
              overflow: "auto",
              background: "#05060b",
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: 10,
              color: C.muted,
              fontSize: 9,
              lineHeight: 1.55,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>{packetJson}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
