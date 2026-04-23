"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// ── operators (complex z, complex c) ────────────────────────────────────────
function cexp(ar, ai) {
  const k = Math.exp(ar);
  return { re: k * Math.cos(ai), im: k * Math.sin(ai) };
}
function clog(ar, ai) {
  const m2 = ar * ar + ai * ai;
  return { re: 0.5 * Math.log(m2), im: Math.atan2(ai, ar) };
}
function EML(zr, zi, cr, ci) {
  const e = cexp(zr, zi), l = clog(cr, ci);
  return { re: e.re - l.re, im: e.im - l.im };
}
function EXL(zr, zi, cr, ci) {
  const e = cexp(zr, zi), l = clog(cr, ci);
  return { re: e.re * l.re - e.im * l.im, im: e.re * l.im + e.im * l.re };
}
function EDL(zr, zi, cr, ci) {
  const e = cexp(zr, zi), l = clog(cr, ci);
  const d = l.re * l.re + l.im * l.im;
  if (d < 1e-300) return { re: NaN, im: NaN };
  return {
    re: (e.re * l.re + e.im * l.im) / d,
    im: (e.im * l.re - e.re * l.im) / d,
  };
}
function DEML(zr, zi, cr, ci) {
  const e = cexp(-zr, -zi), l = clog(cr, ci);
  return { re: e.re - l.re, im: e.im - l.im };
}
const OPS = { EML, DEML, EXL, EDL };

const PAIRS = [
  { id: "EML_DEML", a: "EML", b: "DEML",
    blurb: "Mirror gate: gradual — the bulb structure is preserved end-to-end." },
  { id: "EML_EXL",  a: "EML", b: "EXL",
    blurb: "The period-3 Sharkovskii islands emerge in the second half." },
  { id: "EML_EDL",  a: "EML", b: "EDL",
    blurb: "Conjugate operators — area stays near-constant through the whole morph." },
  { id: "EXL_DEML", a: "EXL", b: "DEML",
    blurb: "Most dramatic transition — red period-3 sea collapses then rebuilds." },
];

// ── compute Mandelbrot-like escape-time grid ────────────────────────────────
const VIEW = { rmin: -2.5, rmax: 1.5, imin: -1.5, imax: 1.5 };
const RES = 400;
const MAX_ITER = 100;
const BAIL = 1e6;

function renderGrid(opA, opB, t, res = RES, maxIter = MAX_ITER) {
  // Returns { iters: Int16Array(res*res), inSet: int }
  const iters = new Int16Array(res * res);
  let inSet = 0;
  const dr = (VIEW.rmax - VIEW.rmin) / (res - 1);
  const di = (VIEW.imax - VIEW.imin) / (res - 1);
  const oneMinusT = 1 - t;
  for (let y = 0; y < res; y++) {
    const ci = VIEW.imin + y * di;
    for (let x = 0; x < res; x++) {
      const cr = VIEW.rmin + x * dr;
      let zr = 0, zi = 0;
      let escape = maxIter;
      for (let i = 0; i < maxIter; i++) {
        const a = opA(zr, zi, cr, ci);
        const b = opB(zr, zi, cr, ci);
        const nr = oneMinusT * a.re + t * b.re;
        const ni = oneMinusT * a.im + t * b.im;
        if (!isFinite(nr) || !isFinite(ni) || nr * nr + ni * ni > BAIL * BAIL) {
          escape = i;
          break;
        }
        zr = nr; zi = ni;
      }
      iters[y * res + x] = escape;
      if (escape === maxIter) inSet++;
    }
  }
  return { iters, inSet };
}

// ── escape-time palette ─────────────────────────────────────────────────────
function paletteColor(it, maxIter) {
  if (it >= maxIter) return [8, 10, 18];
  const t = it / maxIter;
  const r = Math.round(55 + 200 * Math.pow(t, 0.4));
  const g = Math.round(30 + 160 * Math.pow(t, 0.7));
  const b = Math.round(80 + 160 * Math.pow(t, 1.3));
  return [r, g, b];
}

// ── component ───────────────────────────────────────────────────────────────
export default function MorphPlayer() {
  const canvasRef = useRef(null);
  const sparkRef  = useRef(null);
  const [pairIdx, setPairIdx] = useState(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x / 2x / 4x
  const [areas, setAreas] = useState(null); // { ts: [...], values: [...] }
  const [computing, setComputing] = useState(false);

  const pair = PAIRS[pairIdx];
  const opA = OPS[pair.a], opB = OPS[pair.b];

  // Render a single frame at the current t
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = RES, H = RES;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const { iters } = renderGrid(opA, opB, t, RES, MAX_ITER);
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < iters.length; i++) {
      const [r, g, b] = paletteColor(iters[i], MAX_ITER);
      const j = i * 4;
      img.data[j] = r; img.data[j + 1] = g; img.data[j + 2] = b; img.data[j + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }, [opA, opB, t]);

  // Compute 51-frame area sparkline whenever the pair changes
  useEffect(() => {
    let cancel = false;
    setComputing(true); setAreas(null);
    const N = 51;
    const ts = new Array(N);
    const vals = new Array(N);
    let i = 0;
    function step() {
      if (cancel) return;
      const tt = i / (N - 1);
      const { inSet } = renderGrid(opA, opB, tt, 120, 80);  // fast preview
      ts[i] = tt;
      vals[i] = inSet;
      i++;
      if (i < N) {
        requestAnimationFrame(step);
      } else {
        setAreas({ ts, values: vals });
        setComputing(false);
      }
    }
    requestAnimationFrame(step);
    return () => { cancel = true; };
  }, [opA, opB]);

  // Play/pause auto-advance
  useEffect(() => {
    if (!playing) return;
    const interval = 300 / speed;
    const timer = setInterval(() => {
      setT(prev => {
        const nxt = prev + 0.02;
        if (nxt >= 1.0001) return 0;
        return Math.min(1, nxt);
      });
    }, interval);
    return () => clearInterval(timer);
  }, [playing, speed]);

  // Draw sparkline
  useEffect(() => {
    const canvas = sparkRef.current;
    if (!canvas) return;
    const W = 400, H = 60;
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
    if (!areas) return;

    const vals = areas.values;
    const vmin = Math.min(...vals);
    const vmax = Math.max(...vals);
    const range = Math.max(1, vmax - vmin);
    const N = vals.length;
    ctx.strokeStyle = "rgba(232,160,32,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = (i / (N - 1)) * (W - 4) + 2;
      const y = H - 4 - ((vals[i] - vmin) / range) * (H - 8);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // current t marker
    const xi = (t * (W - 4)) + 2;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(xi, 2); ctx.lineTo(xi, H - 2); ctx.stroke();

    // label: min area frame + percent drop
    const minIdx = vals.indexOf(vmin);
    const pctDrop = (1 - vmin / Math.max(vals[0], vals[N - 1])) * 100;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px monospace";
    ctx.fillText(`area trough @ t ≈ ${areas.ts[minIdx].toFixed(2)}`, 6, 12);
    ctx.fillText(`drop ${pctDrop > 0 ? `-${pctDrop.toFixed(0)}%` : `${(-pctDrop).toFixed(0)}%`}`, W - 80, 12);
  }, [areas, t]);

  // Observation line per pair
  const obs = useMemo(() => {
    if (!areas) return pair.blurb;
    const vals = areas.values;
    const vmin = Math.min(...vals);
    const mid = (vals[0] + vals[vals.length - 1]) / 2;
    if (vmin >= mid * 0.92) {
      return `${pair.blurb}  Area stays within ${((1 - vmin / mid) * 100).toFixed(0)}% of its endpoints.`;
    }
    const minIdx = vals.indexOf(vmin);
    const dropPct = (1 - vmin / mid) * 100;
    return `${pair.blurb}  Area drops ${dropPct.toFixed(0)}% at t ≈ ${areas.ts[minIdx].toFixed(2)} before recovering.`;
  }, [areas, pair]);

  return (
    <div style={{ minHeight: "100vh", background: "#07080f", color: "#e2e8f0",
      fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "60px 20px 60px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: 2,
            textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
            monogate.dev · lab · operator morph
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.6 }}>
            Watch one fractal become another
          </h1>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.7, maxWidth: 580 }}>
            Linear interpolation <span style={{ fontFamily: "monospace", color: "#cbd5e1" }}>
              z ← (1 − t)·op₁(z, c) + t·op₂(z, c)
            </span>.  Scrub the slider to move between two EML-family gates;
            watch the Mandelbrot-like set shrink, warp, and recover.
          </p>
        </div>

        {/* Pair buttons */}
        <div style={{ display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 6, marginBottom: 14 }}>
          {PAIRS.map((p, i) => (
            <button key={p.id} onClick={() => { setPairIdx(i); setT(0); }} style={{
              background: pairIdx === i ? "rgba(232,160,32,0.18)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${pairIdx === i ? "rgba(232,160,32,0.55)" : "rgba(255,255,255,0.1)"}`,
              color: pairIdx === i ? "#e8a020" : "#cbd5e1",
              borderRadius: 6, padding: "10px 10px",
              fontFamily: "monospace", fontSize: 11, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3,
            }}>
              <b>{p.a} → {p.b}</b>
            </button>
          ))}
        </div>

        <canvas ref={canvasRef} style={{
          width: "100%", maxWidth: 400, aspectRatio: "1",
          imageRendering: "pixelated",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8,
          display: "block", margin: "0 auto 10px",
          background: "#07080f",
        }} />

        {/* Slider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#94a3b8", minWidth: 80 }}>
            t = {t.toFixed(3)}
          </span>
          <input
            type="range"
            min={0} max={1} step={0.01}
            value={t}
            onChange={e => setT(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#e8a020" }}
          />
        </div>

        {/* Play controls */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12, fontFamily: "monospace", fontSize: 12 }}>
          <button onClick={() => setPlaying(p => !p)} style={{
            background: playing ? "rgba(232,160,32,0.2)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${playing ? "rgba(232,160,32,0.5)" : "rgba(255,255,255,0.12)"}`,
            color: playing ? "#e8a020" : "#cbd5e1",
            borderRadius: 6, padding: "6px 14px", cursor: "pointer",
          }}>{playing ? "⏸ pause" : "▶ play"}</button>
          <button onClick={() => setT(0)} style={{
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.12)",
            color: "#cbd5e1", borderRadius: 6, padding: "6px 14px", cursor: "pointer",
          }}>⏮ reset</button>
          <div style={{ flex: 1 }} />
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)} style={{
              background: speed === s ? "rgba(255,255,255,0.08)" : "transparent",
              border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1",
              borderRadius: 6, padding: "6px 10px", cursor: "pointer",
            }}>{s}×</button>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace",
            letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
            in-set area (box-count proxy) across 51 frames{computing ? " · computing…" : ""}
          </div>
          <canvas ref={sparkRef} style={{
            width: "100%", maxWidth: 400,
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6,
            background: "#07080f", display: "block",
          }} />
        </div>

        {/* Observation */}
        <div style={{ marginTop: 14, padding: "12px 14px",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
          fontSize: 12, color: "#94a3b8", lineHeight: 1.7, maxWidth: 560 }}>
          {obs}
        </div>
      </div>
    </div>
  );
}
