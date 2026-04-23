"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// ── operators ───────────────────────────────────────────────────────────────
// z_{n+1} = op(z_n, c), c is a complex param, z starts at 0.
// Each returns {re, im, bad}.
function cexp(ar, ai) {
  const k = Math.exp(ar);
  return { re: k * Math.cos(ai), im: k * Math.sin(ai) };
}
function clog(ar, ai) {
  const m2 = ar * ar + ai * ai;
  return { re: 0.5 * Math.log(m2), im: Math.atan2(ai, ar) };
}

function OP_EXL(zr, zi, cr, ci) {
  const e = cexp(zr, zi);
  const l = clog(cr, ci);
  return { re: e.re * l.re - e.im * l.im, im: e.re * l.im + e.im * l.re };
}
function OP_EML(zr, zi, cr, ci) {
  const e = cexp(zr, zi);
  const l = clog(cr, ci);
  return { re: e.re - l.re, im: e.im - l.im };
}
function OP_EDL(zr, zi, cr, ci) {
  const e = cexp(zr, zi);
  const l = clog(cr, ci);
  const denom = l.re * l.re + l.im * l.im;
  if (denom < 1e-300) return { re: NaN, im: NaN };
  return { re: (e.re * l.re + e.im * l.im) / denom, im: (e.im * l.re - e.re * l.im) / denom };
}
const OPS = { EXL: OP_EXL, EML: OP_EML, EDL: OP_EDL };
const OP_LABELS = {
  EXL: "exp(z) · log(c)",
  EML: "exp(z) − log(c)",
  EDL: "exp(z) / log(c)",
};

// ── period detection ────────────────────────────────────────────────────────
const BAIL = 1e6;
const WARM = 1200;
const KEEP = 260;
const MAX_P = 32;
const TOL  = 1e-6;

function classify(op, cr, ci) {
  let zr = 0, zi = 0;
  // warm-up
  for (let i = 0; i < WARM; i++) {
    const n = op(zr, zi, cr, ci);
    if (!isFinite(n.re) || !isFinite(n.im)) return -1;
    if (n.re * n.re + n.im * n.im > BAIL * BAIL) return -1;
    zr = n.re; zi = n.im;
  }
  // keep
  const tailR = new Float64Array(KEEP);
  const tailI = new Float64Array(KEEP);
  for (let i = 0; i < KEEP; i++) {
    const n = op(zr, zi, cr, ci);
    if (!isFinite(n.re) || !isFinite(n.im)) return -1;
    if (n.re * n.re + n.im * n.im > BAIL * BAIL) return -1;
    zr = n.re; zi = n.im;
    tailR[i] = zr; tailI[i] = zi;
  }
  for (let p = 1; p <= MAX_P; p++) {
    if (2 * p > KEEP) break;
    let maxErr = 0;
    let scale = 1;
    for (let k = 0; k < p; k++) {
      const a = tailR[KEEP - 1 - k], b = tailR[KEEP - 1 - k - p];
      const a2 = tailI[KEEP - 1 - k], b2 = tailI[KEEP - 1 - k - p];
      const e = Math.max(Math.abs(a - b), Math.abs(a2 - b2));
      if (e > maxErr) maxErr = e;
      const s = Math.max(Math.abs(a), Math.abs(a2));
      if (s > scale) scale = s;
    }
    if (maxErr < TOL * scale) return p;
  }
  return 0; // chaotic / quasi-periodic
}

function orbit(op, cr, ci, n = 400) {
  const pts = new Array(n);
  let zr = 0, zi = 0;
  for (let i = 0; i < n; i++) {
    const res = op(zr, zi, cr, ci);
    if (!isFinite(res.re) || !isFinite(res.im)) { pts[i] = null; break; }
    zr = res.re; zi = res.im;
    if (zr * zr + zi * zi > BAIL * BAIL) { pts[i] = null; break; }
    pts[i] = [zr, zi];
  }
  return pts.filter(Boolean);
}

// ── colour map ──────────────────────────────────────────────────────────────
function periodColor(p) {
  if (p === -1) return [0, 0, 0];      // escape
  if (p === 0)  return [240, 240, 240]; // chaotic
  if (p === 1)  return [30, 64, 175];  // blue
  if (p === 2)  return [22, 163, 74];  // green
  if (p === 3)  return [220, 38, 38];  // RED (star)
  if (p === 4)  return [234, 179, 8];  // yellow
  if (p <= 8)   {
    const t = (p - 4) / 4;
    return [255, Math.round(115 + 30 * (1 - t)), 30 + Math.round(40 * (1 - t))];
  }
  if (p <= 16) {
    const t = (p - 8) / 8;
    return [Math.round(140 + 50 * t), Math.round(50 * (1 - t)), Math.round(210 + 20 * t)];
  }
  if (p <= 32) {
    const t = (p - 16) / 16;
    return [Math.round(190 - 40 * t), Math.round(90 - 40 * t), Math.round(230 - 20 * t)];
  }
  return [255, 255, 255];
}

// ── component ───────────────────────────────────────────────────────────────
export default function PeriodMap() {
  const canvasRef = useRef(null);
  const orbitRef = useRef(null);
  const [opName, setOpName] = useState("EXL");
  const [res, setRes] = useState(300);
  const [progress, setProgress] = useState(0);
  const [computing, setComputing] = useState(true);
  const [periods, setPeriods] = useState(null);
  const [cursor, setCursor] = useState(null);         // {cr, ci, p}
  const [hist, setHist] = useState(null);
  const [selOrbit, setSelOrbit] = useState(null);     // array of [zr,zi]

  const bbox = { rmin: -3, rmax: 3, imin: -3, imax: 3 };

  // Run the period scan chunked across rAF frames
  useEffect(() => {
    let cancel = false;
    setComputing(true); setProgress(0); setPeriods(null); setHist(null);
    const op = OPS[opName];
    const N = res;
    const grid = new Int16Array(N * N);
    let y = 0;
    const ROWS_PER_FRAME = Math.max(2, Math.floor(24 * (300 / N)));

    function step() {
      if (cancel) return;
      const end = Math.min(N, y + ROWS_PER_FRAME);
      for (; y < end; y++) {
        const ci = bbox.imin + (bbox.imax - bbox.imin) * (y / (N - 1));
        for (let x = 0; x < N; x++) {
          const cr = bbox.rmin + (bbox.rmax - bbox.rmin) * (x / (N - 1));
          grid[y * N + x] = classify(op, cr, ci);
        }
      }
      setProgress(Math.round((y / N) * 100));
      if (y < N) {
        requestAnimationFrame(step);
      } else {
        // compute histogram
        const h = new Map();
        for (let i = 0; i < grid.length; i++) {
          const v = grid[i];
          h.set(v, (h.get(v) || 0) + 1);
        }
        setHist(h);
        setPeriods(grid);
        setComputing(false);
      }
    }
    requestAnimationFrame(step);
    return () => { cancel = true; };
  }, [opName, res]);

  // Render heatmap once periods are ready
  useEffect(() => {
    if (!periods) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const N = res;
    canvas.width = N;
    canvas.height = N;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(N, N);
    for (let i = 0; i < periods.length; i++) {
      const [r, g, b] = periodColor(periods[i]);
      const j = i * 4;
      img.data[j] = r; img.data[j + 1] = g; img.data[j + 2] = b; img.data[j + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [periods, res]);

  // Pointer → c-value + period readout
  const canvasSize = 520;
  function onMove(e) {
    if (!periods) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width - 1, e.clientX - rect.left));
    const py = Math.max(0, Math.min(rect.height - 1, e.clientY - rect.top));
    const x = Math.floor((px / rect.width) * res);
    const y = Math.floor((py / rect.height) * res);
    const cr = bbox.rmin + (bbox.rmax - bbox.rmin) * (x / (res - 1));
    const ci = bbox.imin + (bbox.imax - bbox.imin) * (y / (res - 1));
    const p = periods[y * res + x];
    setCursor({ cr, ci, p });
  }
  function onLeave() { setCursor(null); }
  function onClick(e) {
    if (!periods) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const x = Math.floor((px / rect.width) * res);
    const y = Math.floor((py / rect.height) * res);
    const cr = bbox.rmin + (bbox.rmax - bbox.rmin) * (x / (res - 1));
    const ci = bbox.imin + (bbox.imax - bbox.imin) * (y / (res - 1));
    setSelOrbit({ cr, ci, pts: orbit(OPS[opName], cr, ci, 500),
                  p: periods[y * res + x] });
  }

  // Draw orbit panel
  useEffect(() => {
    const canvas = orbitRef.current;
    if (!canvas) return;
    const W = 260, H = 200;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.fillStyle = "#07080f";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    if (!selOrbit || !selOrbit.pts.length) return;
    const pts = selOrbit.pts;
    let rmin = Infinity, rmax = -Infinity, imin = Infinity, imax = -Infinity;
    for (const [r, i] of pts) {
      if (r < rmin) rmin = r;
      if (r > rmax) rmax = r;
      if (i < imin) imin = i;
      if (i > imax) imax = i;
    }
    const dx = (rmax - rmin) * 0.2 || 1;
    const dy = (imax - imin) * 0.2 || 1;
    rmin -= dx; rmax += dx; imin -= dy; imax += dy;
    function toPx(r, i) {
      const x = ((r - rmin) / (rmax - rmin || 1)) * W;
      const y = H - ((i - imin) / (imax - imin || 1)) * H;
      return [x, y];
    }
    ctx.strokeStyle = "rgba(232,160,32,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let k = 0; k < pts.length; k++) {
      const [x, y] = toPx(pts[k][0], pts[k][1]);
      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let k = Math.max(0, pts.length - 60); k < pts.length; k++) {
      const [x, y] = toPx(pts[k][0], pts[k][1]);
      const age = (k - (pts.length - 60)) / 60;
      ctx.fillStyle = `rgba(232,160,32,${0.25 + age * 0.6})`;
      ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  }, [selOrbit]);

  const periodHistSorted = useMemo(() => {
    if (!hist) return null;
    const total = Array.from(hist.values()).reduce((a, b) => a + b, 0);
    const rows = [...hist.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([p, n]) => ({
        p, n, pct: (n / total) * 100,
        label: p === -1 ? "escape" : p === 0 ? "chaotic" : `period ${p}`,
      }));
    return { rows, total };
  }, [hist]);

  return (
    <div style={{ minHeight: "100vh", background: "#07080f", color: "#e2e8f0",
      fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "60px 20px 60px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: 2,
            textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
            monogate.dev · lab · period map
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.6 }}>
            Where chaos lives
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.7, maxWidth: 620 }}>
            Heat-map of the complex c-plane coloured by orbit period under one
            of three EML-family operators.  Red = period 3 (Li-Yorke /
            Sharkovskii regime). Blue = period 1. Black = escape.
            Click anywhere to inspect the orbit at that c.
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {Object.keys(OPS).map(k => (
            <button key={k} onClick={() => setOpName(k)} style={{
              background: opName === k ? "rgba(232,160,32,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${opName === k ? "rgba(232,160,32,0.6)" : "rgba(255,255,255,0.12)"}`,
              color: opName === k ? "#e8a020" : "#cbd5e1",
              borderRadius: 6, padding: "8px 14px",
              fontFamily: "monospace", fontSize: 12, cursor: "pointer",
              display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start",
            }}>
              <b>{k}</b>
              <span style={{ fontSize: 10, opacity: 0.75 }}>{OP_LABELS[k]}</span>
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setRes(300)} style={{
            background: res === 300 ? "rgba(255,255,255,0.08)" : "transparent",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1",
            borderRadius: 6, padding: "8px 14px", fontFamily: "monospace",
            fontSize: 11, cursor: "pointer",
          }}>300²</button>
          <button onClick={() => setRes(500)} style={{
            background: res === 500 ? "rgba(255,255,255,0.08)" : "transparent",
            border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1",
            borderRadius: 6, padding: "8px 14px", fontFamily: "monospace",
            fontSize: 11, cursor: "pointer",
          }}>HD 500²</button>
        </div>

        {/* Canvas + side panel */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ position: "relative" }}>
            <canvas
              ref={canvasRef}
              style={{
                width: canvasSize, height: canvasSize, maxWidth: "90vw", maxHeight: "90vw",
                imageRendering: "pixelated",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
                cursor: computing ? "progress" : "crosshair",
                background: "#07080f",
              }}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              onClick={onClick}
            />
            {computing && (
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "rgba(7,8,15,0.6)", borderRadius: 8,
                pointerEvents: "none",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "#e2e8f0" }}>
                  computing · {progress}%
                </div>
              </div>
            )}
          </div>

          <div style={{ minWidth: 240, flex: "1 1 240px" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace",
              color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              cursor
            </div>
            <div style={{ fontSize: 12, fontFamily: "monospace", color: "#cbd5e1",
              background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }}>
              {cursor ? (
                <>
                  <div>c = {cursor.cr.toFixed(4)} {cursor.ci >= 0 ? "+" : "−"} {Math.abs(cursor.ci).toFixed(4)}i</div>
                  <div style={{ marginTop: 6, color:
                      cursor.p === -1 ? "#64748b" :
                      cursor.p === 3 ? "#f87171" :
                      cursor.p === 1 ? "#60a5fa" : "#e2e8f0",
                  }}>
                    {cursor.p === -1 ? "escape" :
                     cursor.p === 0 ? "chaotic / quasi-periodic" :
                     `period ${cursor.p}${cursor.p === 3 ? "  ⚡ Li-Yorke" : ""}`}
                  </div>
                </>
              ) : <span style={{ color: "#475569" }}>hover the map</span>}
            </div>

            <div style={{ fontSize: 11, fontFamily: "monospace",
              color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
              orbit at click
            </div>
            <canvas ref={orbitRef} style={{
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
              background: "#07080f", display: "block", marginBottom: 8,
            }} />
            <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
              {selOrbit ? (
                <>
                  c = {selOrbit.cr.toFixed(4)} {selOrbit.ci >= 0 ? "+" : "−"} {Math.abs(selOrbit.ci).toFixed(4)}i
                  {" · "}
                  {selOrbit.p === -1 ? "escape" :
                   selOrbit.p === 0 ? "chaotic" :
                   `period ${selOrbit.p}`}
                </>
              ) : "click the map to trace an orbit"}
            </div>

            {periodHistSorted && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 11, fontFamily: "monospace",
                  color: "#94a3b8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>
                  period histogram (top 10)
                </div>
                {periodHistSorted.rows.map(r => {
                  const [R, G, B] = periodColor(r.p);
                  return (
                    <div key={r.p} style={{ display: "flex", gap: 8, alignItems: "center",
                      fontSize: 11, fontFamily: "monospace", marginBottom: 3 }}>
                      <span style={{ width: 10, height: 10,
                        background: `rgb(${R},${G},${B})`, borderRadius: 2,
                        border: "1px solid rgba(255,255,255,0.1)" }} />
                      <span style={{ minWidth: 70, color: "#cbd5e1" }}>{r.label}</span>
                      <span style={{ color: "#64748b" }}>{r.pct.toFixed(1)}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Legend strip */}
        <div style={{ marginTop: 18, fontSize: 11, color: "#94a3b8", lineHeight: 1.7,
          borderLeft: "2px solid rgba(232,160,32,0.3)", paddingLeft: 12, fontFamily: "monospace" }}>
          palette — blue: period 1 · green: period 2 ·{" "}
          <span style={{ color: "#f87171", fontWeight: 700 }}>red: period 3 (Sharkovskii)</span>{" "}
          · yellow: period 4 · orange: 5-8 · purple: 9-32 · white: chaotic · black: escape
        </div>

        {/* Description */}
        <div style={{ marginTop: 22, padding: "14px 16px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
          fontSize: 12, color: "#94a3b8", lineHeight: 1.75, maxWidth: 720 }}>
          {opName === "EXL" && (
            <>
              <b style={{ color: "#f87171" }}>EXL</b> is the outlier of the
              six exact-complete EML gates: a ~40 % red period-3 sea with
              period-6, period-12 doubling along its boundary — the overnight
              deep-session measured area ratios 4.60 / 4.44 / 4.45 between
              successive doublings, within 3.7 % of the classical Feigenbaum
              constant δ ≈ 4.669.  Period 3 implies chaos of every order
              (Sharkovskii 1964, Li-Yorke 1975).
            </>
          )}
          {opName === "EML" && (
            <>
              <b style={{ color: "#60a5fa" }}>EML</b> — the canonical gate —
              is the non-chaotic baseline: over 94 % of the c-plane converges
              to a fixed point. The small period-3 islands that do appear live
              in narrow windows near the real axis.
            </>
          )}
          {opName === "EDL" && (
            <>
              <b style={{ color: "#a78bfa" }}>EDL</b> — exp(z) / log(c) — is
              the multiplicative conjugate of EML.  Mostly period 1, with
              scattered period-3 pockets near the c = 1 singularity (log(1) = 0).
            </>
          )}
        </div>
      </div>
    </div>
  );
}
