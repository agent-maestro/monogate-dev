"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { GENOME, GENOME_STATS } from "./genome-data";

// ── palette ─────────────────────────────────────────────────────────────────
const DOMAIN_COLORS = {
  "Physics":           "#4a9eff",
  "Chemistry":         "#4ade80",
  "Biology":           "#f87171",
  "Economics":         "#fbbf24",
  "Engineering":       "#c084fc",
  "Sports":            "#fb923c",
  "Statistics":        "#a78bfa",
  "Neural Networks":   "#22d3ee",
  "Neuroscience":      "#22d3ee",
  "Information Theory":"#38bdf8",
  "Astronomy":         "#fde68a",
  "Astrophysics":      "#fde68a",
  "Electromagnetism":  "#60a5fa",
  "Geology":           "#a3a3a3",
  "Geometry":          "#a78bfa",
  "Computation":       "#34d399",
  "Cosmology":         "#f472b6",
  "Technology":        "#fb7185",
  "Finance":           "#facc15",
  "unknown":           "#475569",
};
const CLUSTER_COLORS = ["#4facfe", "#5ec47a", "#f97316", "#a18cd1", "#ef4444",
                        "#22d3ee", "#fde68a", "#be185d"];

// ── helpers ─────────────────────────────────────────────────────────────────
function domainColor(d) {
  return DOMAIN_COLORS[d] || "#94a3b8";
}
function clusterColor(k) {
  return CLUSTER_COLORS[k % CLUSTER_COLORS.length];
}

function fitBounds(points, pad = 0.08) {
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  for (const p of points) {
    if (p.x < xmin) xmin = p.x;
    if (p.x > xmax) xmax = p.x;
    if (p.y < ymin) ymin = p.y;
    if (p.y > ymax) ymax = p.y;
  }
  const dx = (xmax - xmin) * pad;
  const dy = (ymax - ymin) * pad;
  return { xmin: xmin - dx, xmax: xmax + dx, ymin: ymin - dy, ymax: ymax + dy };
}

// ── component ───────────────────────────────────────────────────────────────
export default function EquationGenome() {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("domain"); // "domain" | "cluster"
  const [hover, setHover] = useState(null);   // index
  const [sel, setSel] = useState(null);       // selected index (locked)
  const [size, setSize] = useState({ w: 640, h: 520 });

  // Responsive sizing
  useEffect(() => {
    function onResize() {
      const w = Math.min(720, (typeof window !== "undefined" ? window.innerWidth : 720) - 40);
      setSize({ w, h: Math.round(w * 0.78) });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const bounds = useMemo(() => fitBounds(GENOME), []);

  // Pre-compute pixel positions for all points
  const placed = useMemo(() => {
    const { w, h } = size;
    const margin = 32;
    const innerW = w - margin * 2;
    const innerH = h - margin * 2;
    const xscale = innerW / (bounds.xmax - bounds.xmin || 1);
    const yscale = innerH / (bounds.ymax - bounds.ymin || 1);
    return GENOME.map((p, i) => {
      const px = margin + (p.x - bounds.xmin) * xscale;
      const py = h - margin - (p.y - bounds.ymin) * yscale;
      return { ...p, idx: i, px, py };
    });
  }, [size, bounds]);

  const selCluster = sel != null ? placed[sel].cluster : null;

  // Find isomorphism-family members of the selected point (same iso_fp,
  // different domain preferred for demonstration).
  const iso_family = useMemo(() => {
    if (sel == null) return [];
    const self = placed[sel];
    return placed.filter(q => q.idx !== sel && q.iso_fp === self.iso_fp);
  }, [sel, placed]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = size;
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    // background
    ctx.fillStyle = "#07080f";
    ctx.fillRect(0, 0, w, h);

    // faint grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = step; x < w; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = step; y < h; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // draw all points
    for (const p of placed) {
      const isSel = p.idx === sel;
      const isHover = p.idx === hover;
      const isIso = sel != null && placed[sel].iso_fp === p.iso_fp;
      const inCluster = selCluster != null && p.cluster === selCluster;

      let color = mode === "domain" ? domainColor(p.domain) : clusterColor(p.cluster);
      let r = Math.max(3, Math.min(10, 3 + Math.sqrt(p.nodes || 1)));

      // dim points not in the selected cluster
      if (sel != null && !inCluster && !isIso) {
        ctx.globalAlpha = 0.18;
      } else {
        ctx.globalAlpha = 1.0;
      }
      if (isSel) r += 3;
      if (isHover) r += 1.5;
      if (isIso && !isSel) r += 1.5;

      ctx.beginPath();
      ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (isSel || isHover || (isIso && sel != null)) {
        ctx.lineWidth = isSel ? 2.5 : 1.5;
        ctx.strokeStyle = isSel ? "#ffffff" : "rgba(255,255,255,0.7)";
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1.0;
  }, [placed, mode, hover, sel, size, selCluster]);

  // Pointer handling
  function nearest(px, py) {
    let best = -1, bestDist = 22;
    for (const p of placed) {
      const d = Math.hypot(p.px - px, p.py - py);
      if (d < bestDist) { bestDist = d; best = p.idx; }
    }
    return best;
  }
  function onMove(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setHover(nearest(px, py));
  }
  function onClick(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const idx = nearest(px, py);
    setSel(idx < 0 ? null : idx);
  }
  function onLeave() { setHover(null); }

  const hoverPt = hover != null ? placed[hover] : null;
  const selPt = sel != null ? placed[sel] : null;
  const domainsInGenome = useMemo(() => {
    const counts = new Map();
    for (const p of GENOME) counts.set(p.domain, (counts.get(p.domain) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, []);

  // Cluster breakdown
  const clusterBreakdown = useMemo(() => {
    if (selCluster == null) return null;
    const members = placed.filter(p => p.cluster === selCluster);
    const byDomain = new Map();
    for (const m of members) byDomain.set(m.domain, (byDomain.get(m.domain) || 0) + 1);
    return {
      size: members.length,
      members,
      domainMix: [...byDomain.entries()].sort((a, b) => b[1] - a[1]),
    };
  }, [selCluster, placed]);

  const hasCluster = selCluster != null;

  return (
    <div style={{
      minHeight: "100vh", background: "#07080f", color: "#e2e8f0",
      fontFamily: "var(--font-sans, system-ui, sans-serif)",
      padding: "60px 20px 60px",
    }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: 2,
            textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
            monogate.dev · lab · equation genome
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 10px", letterSpacing: -0.6 }}>
            Do equations cluster by field or by math?
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.7, maxWidth: 640 }}>
            {GENOME_STATS.total} scientific equations embedded in a 25-dimensional
            fingerprint space (operator counts + pattern hits + structural metrics),
            projected to 2-D via PCA and partitioned by k-means (K = {GENOME_STATS.k}).
            Toggle the colouring to see the punchline.
          </p>
        </header>

        {/* Stats strip */}
        <div style={{
          display: "flex", gap: 24, flexWrap: "wrap", fontSize: 12, color: "#94a3b8",
          fontFamily: "monospace", marginBottom: 18, padding: "10px 14px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
        }}>
          <span><b style={{color:"#e2e8f0"}}>{GENOME_STATS.total}</b> equations</span>
          <span><b style={{color:"#e2e8f0"}}>{GENOME_STATS.k}</b> clusters</span>
          <span>pair-purity <b style={{color:"#e2e8f0"}}>{GENOME_STATS.pair_purity}</b></span>
          <span>random baseline <b style={{color:"#e2e8f0"}}>{GENOME_STATS.random_baseline}</b></span>
          <span>excess <b style={{color: GENOME_STATS.excess_over_random < 0.03 ? "#22c55e" : "#e2e8f0"}}>+{GENOME_STATS.excess_over_random}</b></span>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <ToggleButton active={mode === "domain"}  onClick={() => setMode("domain")}  label="Colour by domain" hint="scattered → no pattern by field" />
          <ToggleButton active={mode === "cluster"} onClick={() => setMode("cluster")} label="Colour by cluster" hint="clean → pattern by math" />
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
            background: "#07080f", cursor: "crosshair",
            display: "block", margin: "0 auto",
          }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          onClick={onClick}
        />

        {/* Hover readout */}
        <div style={{
          minHeight: 40, marginTop: 10, fontSize: 12, fontFamily: "monospace",
          color: hoverPt ? "#e2e8f0" : "#475569",
        }}>
          {hoverPt ? (
            <>
              <span style={{ color: mode === "domain" ? domainColor(hoverPt.domain) : clusterColor(hoverPt.cluster) }}>●</span>{" "}
              <b>{hoverPt.name}</b> · {hoverPt.domain}
              {hoverPt.nodes ? <> · {hoverPt.nodes} nodes</> : null}
              {" · cluster "}{hoverPt.cluster + 1}
            </>
          ) : <>hover to inspect · click to lock a cluster · click empty to release</>}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 18, padding: "14px 16px",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8 }}>
          <div style={{
            fontSize: 11, fontFamily: "monospace", color: "#94a3b8",
            textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            {mode === "domain" ? "Domains" : "Clusters (K = 5)"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", fontSize: 12 }}>
            {mode === "domain"
              ? domainsInGenome.map(([d, n]) => (
                  <span key={d} style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: domainColor(d), display: "inline-block" }} />
                    {d} · <span style={{ color: "#64748b" }}>{n}</span>
                  </span>
                ))
              : Array.from({ length: GENOME_STATS.k }, (_, k) => (
                  <span key={k} style={{ color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: clusterColor(k), display: "inline-block" }} />
                    Cluster {k + 1} ·{" "}
                    <span style={{ color: "#64748b" }}>
                      {placed.filter(p => p.cluster === k).length}
                    </span>
                  </span>
                ))}
          </div>
        </div>

        {/* Selection panel */}
        {hasCluster && clusterBreakdown && (
          <div style={{
            marginTop: 18, padding: "16px 18px",
            background: "rgba(255,255,255,0.02)",
            border: `1px solid ${clusterColor(selCluster) + "55"}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 13, color: clusterColor(selCluster), marginBottom: 6, fontWeight: 700 }}>
              Cluster {selCluster + 1} · {clusterBreakdown.size} equations
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
              Domain mix: {clusterBreakdown.domainMix.slice(0, 8)
                .map(([d, n]) => `${d} (${n})`).join(" · ")}
            </div>
            {selPt && (
              <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 12,
                borderLeft: `2px solid ${clusterColor(selCluster)}`, paddingLeft: 10 }}>
                <div style={{ fontWeight: 600, color: "#e2e8f0" }}>{selPt.name}</div>
                <div style={{ color: "#64748b" }}>
                  {selPt.domain}{selPt.nodes ? ` · ${selPt.nodes} nodes` : ""}
                  {selPt.depth ? ` · depth ${selPt.depth}` : ""}
                  {selPt.iso_fp ? ` · signature ${selPt.iso_fp}` : ""}
                </div>
              </div>
            )}
            {iso_family.length > 0 && (
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: 4 }}>
                  Isomorphism family (same structural signature):
                </div>
                {iso_family.slice(0, 8).map(q => (
                  <div key={q.idx} style={{ fontSize: 11, color: "#cbd5e1" }}>
                    · {q.name} <span style={{ color: "#64748b" }}>({q.domain})</span>
                  </div>
                ))}
                {iso_family.length > 8 && (
                  <div style={{ fontSize: 11, color: "#475569" }}>
                    … {iso_family.length - 8} more
                  </div>
                )}
              </div>
            )}
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 12 }}>
              Click elsewhere on the plot to lock a different cluster; click an empty
              area to release.
            </div>
          </div>
        )}

        {/* Footer epigram */}
        <div style={{ marginTop: 24, padding: "12px 14px", fontSize: 12, color: "#94a3b8",
          borderLeft: "2px solid rgba(232, 160, 32, 0.4)", paddingLeft: 14, lineHeight: 1.7 }}>
          Pair-purity — the probability that two equations in the same cluster share
          a domain — lands at {GENOME_STATS.pair_purity}, compared with a random baseline
          of {GENOME_STATS.random_baseline}.  Excess over random: +{GENOME_STATS.excess_over_random}.
          Beer-Lambert, radioactive decay, RC discharge, drug elimination, and compound
          interest all share a single cluster; the NFL passer rating sits next to
          neural activation models; sigmoid growth laws cross biology, engineering,
          and economics.  Domain is decorative.  Structure is fundamental.
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, label, hint }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "rgba(232,160,32,0.15)" : "transparent",
        border: `1px solid ${active ? "rgba(232,160,32,0.6)" : "rgba(255,255,255,0.1)"}`,
        color: active ? "#e8a020" : "#cbd5e1",
        borderRadius: 6,
        padding: "10px 16px",
        fontFamily: "monospace",
        fontSize: 12,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 3,
        transition: "border-color 0.2s, background 0.2s",
        textAlign: "left",
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      <span style={{ fontSize: 10, opacity: 0.7 }}>{hint}</span>
    </button>
  );
}
