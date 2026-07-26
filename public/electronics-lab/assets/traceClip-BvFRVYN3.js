import{j as a,r as h}from"./react-BGrcABR8.js";import{ad as C,O as M,g as N,al as L}from"./icons-D5y1r_AZ.js";import{b as T,H as I,n as R}from"./vendor-D_gfsaub.js";function v(e){return`electronics-lab:${e}:prediction:v1`}function Z({courseId:e,config:t,revealed:i}){const[o,r]=h.useState(""),[l,c]=h.useState(null);h.useEffect(()=>{try{const u=window.localStorage.getItem(v(e));u!==null&&c(Number(u))}catch{}},[e]);function s(){const u=Number(o);if(Number.isFinite(u)){c(u);try{window.localStorage.setItem(v(e),String(u))}catch{}}}const n=l!==null&&Math.abs(l-t.answer)<=t.tolerance;return a.jsxs("section",{className:"predict-beat","aria-label":"Predict before you build",children:[a.jsxs("p",{className:"predict-beat-kicker",children:[a.jsx(M,{"aria-hidden":"true"})," Beat 1 · Predict"]}),a.jsx("h3",{children:t.question}),l===null?a.jsxs(a.Fragment,{children:[a.jsx("p",{className:"predict-beat-hint",children:t.hint}),a.jsxs("div",{className:"predict-beat-input",children:[a.jsx("label",{htmlFor:"predict-input",className:"visually-hidden",children:"Your prediction"}),a.jsx("input",{id:"predict-input",type:"number",step:"0.01",inputMode:"decimal",value:o,placeholder:"your guess",onChange:u=>r(u.target.value),onKeyDown:u=>{u.key==="Enter"&&s()}}),a.jsx("button",{type:"button",onClick:s,disabled:o.trim()==="",children:"Lock it in"})]}),a.jsx("p",{className:"predict-beat-note",children:"Locked before the build starts. Being wrong here is the point — it is what makes the real number mean something."})]}):i?a.jsxs("div",{className:n?"predict-beat-reveal is-called":"predict-beat-reveal",children:[a.jsxs("div",{className:"predict-beat-compare",children:[a.jsxs("span",{children:["you said ",a.jsx("strong",{children:l})]}),a.jsxs("span",{children:["it is ",a.jsx("strong",{children:t.answerLabel})]})]}),a.jsx("p",{children:n?"Called it.":"Not what you expected — and that is the lesson."}),a.jsx("p",{className:"predict-beat-why",children:t.answerNote})]}):a.jsxs("p",{className:"predict-beat-locked",children:[a.jsx(N,{"aria-hidden":"true"})," You predicted ",a.jsx("strong",{children:l}),". Finish the build and the bench will tell you what it actually does."]})]})}function ee({modes:e}){return e.length===0?null:a.jsxs("section",{className:"what-goes-wrong","aria-label":"What goes wrong",children:[a.jsxs("p",{className:"what-goes-wrong-kicker",children:[a.jsx(L,{"aria-hidden":"true"})," Beat 5 · What goes wrong"]}),a.jsx("ul",{children:e.map(t=>a.jsxs("li",{children:[a.jsx("strong",{children:t.failure}),a.jsx("span",{children:t.why})]},t.failure))})]})}function te({config:e}){return a.jsxs("section",{className:"why-eml","aria-label":"Why EML for this course",children:[a.jsxs("p",{className:"why-eml-kicker",children:[a.jsx(C,{"aria-hidden":"true"})," Why EML here"]}),a.jsxs("dl",{children:[a.jsxs("div",{children:[a.jsx("dt",{children:"what this course makes visible"}),a.jsx("dd",{children:e.makesVisible})]}),a.jsxs("div",{className:e.dischargesNothingNew?"is-nothing-new":"",children:[a.jsx("dt",{children:"what EML discharges"}),a.jsxs("dd",{children:[e.dischargesNothingNew?a.jsx("strong",{children:"Nothing new. "}):null,e.discharges]})]}),a.jsxs("div",{children:[a.jsx("dt",{children:"what stays unproven"}),a.jsx("dd",{children:e.unproven})]})]})]})}const O=`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Guard Trace — Instructor Verification Replay</title>
<!--
  Monogate instructor-grade replay skeleton (course-agnostic).
  Source of truth: dashboards/shared/instructor-replay-skeleton.html
  A dashboard exports a standalone verification replay by string-replacing the three
  quoted markers in the script below with JSON, then serving the result as a download:
    FRAMES marker -> array of trace frames (each may carry a \`raw\` original frame)
    CONFIG marker -> per-course config object (fields, events, rubric, traces)
    META marker   -> provenance object (device, capture window, source path, sha note)
  All report logic is driven by CONFIG, so the same skeleton serves every course.
-->
<style>
  :root {
    --bg: #07131b; --panel: rgba(8,22,23,.92); --panel2: rgba(2,12,14,.66);
    --ink: #edf7f4; --muted: #8fb3ad; --line: rgba(216,232,228,.14);
    --accent: #70dbff; --gold: #fff2a6; --green: #8ee0b2; --amber: #f7b267;
    --red: #ff7a7a; --blue: #9ad0ff; --violet: #c4b5fd;
  }
  * { box-sizing: border-box; }
  body { margin: 0; padding: 20px; background: var(--bg); color: var(--ink);
    font-family: Inter, system-ui, -apple-system, sans-serif; line-height: 1.45; }
  main { max-width: 1180px; margin: 0 auto; display: grid; gap: 14px; }
  .panel { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); padding: 16px; }
  h1 { margin: 0 0 2px; font-size: 22px; color: #fff; }
  h2 { margin: 0 0 10px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
  .sub { color: var(--muted); font-size: 13px; }
  .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;
    padding: 4px 9px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); }
  .badge.ok { color: #06241c; background: var(--green); border-color: transparent; }
  .badge.warn { color: #2a1c00; background: var(--amber); border-color: transparent; }
  .badge.bad { color: #2a0000; background: var(--red); border-color: transparent; }
  .badge.info { color: #04202e; background: var(--blue); border-color: transparent; }
  .badge.virtual { color: #2a0000; background: var(--red); border-color: transparent; }
  /* Virtual-replay watermark: faint tiled "VIRTUAL REPLAY", shown only when META.virtual.
     Fixed overlay, never intercepts clicks, set to print so it survives PDF export. */
  .watermark { position: fixed; inset: 0; z-index: 9998; pointer-events: none; display: none; opacity: .07;
    background-repeat: repeat;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='150'><text x='6' y='95' font-family='Segoe UI,Arial,sans-serif' font-size='18' font-weight='800' fill='%23ff7a7a' transform='rotate(-26 130 75)'>VIRTUAL REPLAY</text></svg>");
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body.is-virtual .watermark { display: block; }
  .prov { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
  .prov div { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; background: var(--panel2); }
  .prov span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); letter-spacing: .05em; }
  .prov b { font-size: 14px; color: var(--ink); word-break: break-word; font-weight: 700; }
  .verdict { display: flex; align-items: center; gap: 16px; border-radius: 12px; padding: 18px 20px; border: 1px solid var(--line); }
  .verdict.pass { background: linear-gradient(90deg, rgba(142,224,178,.16), transparent); border-color: rgba(142,224,178,.5); }
  .verdict.fail { background: linear-gradient(90deg, rgba(255,122,122,.18), transparent); border-color: rgba(255,122,122,.55); }
  .verdict .mark { font-size: 40px; line-height: 1; }
  .verdict .headline { font-size: 22px; font-weight: 900; color: #fff; }
  .verdict .detail { color: var(--muted); font-size: 13px; margin-top: 2px; }
  ul.rubric { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }
  ul.rubric li { display: flex; gap: 10px; align-items: baseline; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel2); }
  ul.rubric li .tick { font-size: 15px; }
  ul.rubric li.pass .tick { color: var(--green); }
  ul.rubric li.miss { opacity: .62; }
  ul.rubric li.miss .tick { color: var(--muted); }
  ul.rubric li .label { font-weight: 700; }
  ul.rubric li .ev { margin-left: auto; color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }
  .stats div { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; background: var(--panel2); }
  .stats span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); }
  .stats b { font-size: 18px; color: var(--gold); font-variant-numeric: tabular-nums; }
  .log { max-height: 360px; overflow: auto; border: 1px solid var(--line); border-radius: 8px; background: #00080c; }
  .log table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .log td { padding: 6px 10px; border-bottom: 1px solid rgba(216,232,228,.06); vertical-align: top; }
  .log tr { cursor: pointer; }
  .log tr:hover { background: rgba(112,219,255,.07); }
  .log .t { color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; width: 1%; }
  .log .f { color: var(--accent); font-variant-numeric: tabular-nums; white-space: nowrap; width: 1%; }
  .log .k { font-weight: 800; white-space: nowrap; width: 1%; }
  .log .k.latch, .log .k.clamp, .log .k.violation { color: var(--red); }
  .log .k.clear, .log .k.release { color: var(--green); }
  .log .k.limit { color: var(--blue); }
  .log .k.device, .log .k.surge { color: var(--violet); }
  .player { display: grid; gap: 10px; }
  .readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }
  .readouts div { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--panel2); }
  .readouts span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); }
  .readouts b { font-size: 24px; color: var(--gold); font-variant-numeric: tabular-nums; }
  .readouts b.alert { color: var(--red); }
  #frameMeta .alert { color: var(--red); font-weight: 800; }
  canvas { width: 100%; height: 300px; border: 1px solid var(--line); border-radius: 8px; background: #00080c; }
  .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  button { min-height: 34px; padding: 0 14px; border: 1px solid rgba(216,232,228,.18); border-radius: 7px;
    background: rgba(216,232,228,.07); color: var(--ink); font-weight: 800; cursor: pointer; }
  button:hover { background: rgba(216,232,228,.14); }
  input[type=range] { flex: 1; min-width: 180px; }
  pre { max-height: 280px; overflow: auto; background: #00080c; padding: 12px; border-radius: 8px; margin: 0;
    font-size: 12px; border: 1px solid var(--line); }
  .legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted); }
  .legend i { display: inline-block; width: 12px; height: 3px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }
  .foot { color: var(--muted); font-size: 12px; display: grid; gap: 10px; }
  .mono { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; word-break: break-all; }
  .verify-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
  .verify-row button { min-height: 30px; font-size: 12px; }
  .about p.lede { color: var(--ink); font-size: 14px; margin: 0 0 12px; }
  .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }
  .about-grid div { border: 1px solid var(--line); border-radius: 8px; padding: 11px 13px; background: var(--panel2); }
  .about-grid h3 { margin: 0 0 5px; font-size: 13px; color: var(--gold); }
  .about-grid p { margin: 0; font-size: 13px; color: var(--muted); }
  .operate { margin-top: 14px; }
  .operate .otitle { font-size: 12px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
  .operate table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .operate td { padding: 7px 10px; border-bottom: 1px solid rgba(216,232,228,.08); vertical-align: top; }
  .operate td.ctl { color: var(--gold); font-weight: 700; white-space: nowrap; width: 1%; font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; }
</style>
</head>
<body>
<div class="watermark" id="watermark" aria-hidden="true"></div>
<main>
  <header class="panel">
    <h1 id="title">Guard Trace — Instructor Verification Replay</h1>
    <p class="sub" id="subtitle"></p>
    <div class="badges" id="badges"></div>
  </header>

  <section class="panel">
    <h2>Provenance</h2>
    <div class="prov" id="prov"></div>
  </section>

  <section class="panel">
    <div class="verdict" id="verdict">
      <div class="mark" id="verdictMark">…</div>
      <div>
        <div class="headline" id="verdictHeadline">Evaluating…</div>
        <div class="detail" id="verdictDetail"></div>
      </div>
    </div>
  </section>

  <section class="panel about" id="aboutPanel" style="display:none">
    <h2 id="aboutHeading">About this guard</h2>
    <p class="lede" id="aboutLede"></p>
    <div class="about-grid" id="aboutSections"></div>
    <div id="aboutOperate"></div>
  </section>

  <section class="panel">
    <h2>Behaviors demonstrated (rubric)</h2>
    <ul class="rubric" id="rubric"></ul>
  </section>

  <section class="panel">
    <h2>Summary</h2>
    <div class="stats" id="stats"></div>
  </section>

  <section class="panel">
    <h2>Detailed event log <span class="sub" id="logCount"></span></h2>
    <div class="log"><table><tbody id="logBody"></tbody></table></div>
  </section>

  <section class="panel player">
    <h2>Replay</h2>
    <div class="controls">
      <button id="play">Play</button>
      <button id="prev">◀ Prev</button>
      <button id="next">Next ▶</button>
      <input id="scrub" type="range" min="0" max="0" value="0" />
      <span class="sub" id="frameMeta"></span>
    </div>
    <div class="readouts" id="readouts"></div>
    <div class="legend" id="legend"></div>
    <canvas id="graph" width="1120" height="300"></canvas>
    <pre id="rawFrame"></pre>
  </section>

  <footer class="panel foot">
    <div id="disclaimers"></div>
    <div class="mono" id="integrityLine"></div>
    <div class="verify-row">
      <button id="dlTrace" type="button">Download trace (.jsonl)</button>
      <span class="mono" id="verifyRecipe"></span>
    </div>
    <div id="fingerprintNote"></div>
  </footer>
</main>

<script>
"use strict";
const FRAMES = "__FRAMES__";
const CONFIG = "__CONFIG__";
const META = "__META__";

const $ = (id) => document.getElementById(id);
const num = (f, key) => { const v = f && key ? f[key] : undefined; const n = Number(v); return Number.isFinite(n) ? n : null; };
const truthy = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "True";
const boolf = (f, key) => (f && key ? truthy(f[key]) : false);
const fmt = (v) => (typeof v === "number" && Number.isFinite(v)) ? v.toFixed(2) : "--";
const lv = (v) => Math.max(0, Math.min(1, Number(v) || 0));
const pct = (v) => (v * 100).toFixed(0) + "%";

// ---- time base (wall clock if present, else frame index) ----
const TIME_KEYS = ["dashboard_received_epoch_ms", "timestamp_ms"];
function timeKey() { for (const k of TIME_KEYS) if (FRAMES.length && Number.isFinite(Number(FRAMES[0][k]))) return k; return null; }
const TK = timeKey();
const T0 = TK ? Number(FRAMES[0][TK]) : 0;
function elapsedSec(i) { return TK ? (Number(FRAMES[i][TK]) - T0) / 1000 : i; }
function clockLabel(i) {
  if (!TK) return "f" + i;
  let s = Math.max(0, elapsedSec(i)); const m = Math.floor(s / 60); s = s - m * 60;
  return m + ":" + s.toFixed(1).padStart(4, "0");
}
// absolute wall-clock time-of-day for a frame (HH:MM:SS.mmm) — what an instructor sees on the bench clock
const WALL_KEY = (FRAMES.length && Number.isFinite(Number(FRAMES[0].dashboard_received_epoch_ms))) ? "dashboard_received_epoch_ms" : null;
const pad2 = (n) => String(n).padStart(2, "0");
function wallClock(i) {
  if (!WALL_KEY) return clockLabel(i);
  const ms = Number(FRAMES[i] && FRAMES[i][WALL_KEY]); if (!Number.isFinite(ms)) return clockLabel(i);
  const d = new Date(ms);
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds()) + "." + String(d.getMilliseconds()).padStart(3, "0");
}

// ---- guard / contract helpers ----
function isClamp(f) {
  const ga = CONFIG.fields.guardAction, cv = CONFIG.fields.clampValue;
  if (ga && cv && f[ga] !== undefined) return f[ga] === cv;
  const req = num(f, CONFIG.fields.requested), lim = num(f, CONFIG.fields.limit);
  if (req !== null && lim !== null) return req > lim + 0.004;
  return false;
}
// The shaded band marks "the watched condition is active": a guard clamp for the
// guard model, a response error for the response-error model. Keeps the band and
// its legend honest across courses.
function isBandActive(f) {
  if (CONFIG.model === "response_error") {
    const ds = CONFIG.fields.decision;
    return ds ? f[ds] === CONFIG.fields.errorState : false;
  }
  return isClamp(f);
}
function checkContract() {
  const safeK = CONFIG.fields.safe; const ceils = CONFIG.contractCeilings || [];
  let violations = 0, worst = 0; const failures = [];
  FRAMES.forEach((f, i) => {
    const safe = num(f, safeK); if (safe === null) return;
    for (const ck of ceils) {
      const ceil = num(f, ck); if (ceil === null) continue;
      if (safe > ceil + 0.004) {
        violations++; worst = Math.max(worst, safe - ceil);
        if (failures.length < 12) failures.push({ i, safe, ceil, ck });
        break;
      }
    }
  });
  return { violations, worst, failures };
}

// ---- event detection (course-agnostic, config-driven) ----
function detectEvents() {
  const fields = CONFIG.fields; const out = [];
  const push = (kind, cls, i, message) => out.push({ kind, cls, i, t: elapsedSec(i), message });
  for (let i = 0; i < FRAMES.length; i++) {
    const f = FRAMES[i], p = i ? FRAMES[i - 1] : null;
    if (i === 0) { push("BASELINE", "", 0, baselineMsg(f)); continue; }
    if (CONFIG.model === "response_error") {
      // response-error course: decision transitions, not guard clamps.
      const ds = fields.decision, es = fields.errorState;
      const d = ds ? f[ds] : null, pd = ds ? p[ds] : null;
      if (d === es && pd !== es) push("RESPONSE ERROR", "clamp", i, errorWhy(f));
      if (d !== es && pd === es) push("TRACKING", "release", i, "Output tracked the command again (within deadband).");
    } else {
    // violation latch / clear
    if (fields.violation) {
      const v = boolf(f, fields.violation), pv = boolf(p, fields.violation);
      if (v && !pv) push("VIOLATION LATCHED", "latch", i, "Violation latched — " + clampWhy(f));
      if (!v && pv) push("VIOLATION CLEARED", "clear", i, "Violation cleared" + (isClamp(f) ? " (re-latches while still clamping)" : " while passing."));
    }
    // clamp engage / release (only meaningful if no violation field, else redundant-ish; keep for clamp-only courses)
    const c = isClamp(f), pc = isClamp(p);
    if (c && !pc) push("CLAMP", "clamp", i, "Guard clamped output to the safe limit — " + clampWhy(f));
    if (!c && pc) push("RELEASE", "release", i, "Guard released back to pass-through.");
    // limit moves
    if (CONFIG.trackLimitMoves && fields.limit) {
      const l = num(f, fields.limit), pl = num(p, fields.limit);
      if (l !== null && pl !== null && Math.abs(l - pl) > 0.01) {
        const up = l > pl;
        push(up ? "LIMIT UP" : "LIMIT DOWN", "limit", i, "Safe limit " + fmt(pl) + " → " + fmt(l) + (up ? " (raised)" : " (lowered)") + (isClamp(f) ? "" : " — passing"));
      }
    }
    }
    // momentary input (surge / mute button)
    if (fields.button) {
      const b = boolf(f, fields.button), pb = boolf(p, fields.button);
      if (b && !pb) push("INPUT", "surge", i, (CONFIG.buttonOnMessage || "Momentary input asserted."));
      if (!b && pb) push("INPUT", "surge", i, (CONFIG.buttonOffMessage || "Momentary input released."));
    }
    // device signals (LED, buzzer, ...)
    for (const sig of (CONFIG.deviceSignals || [])) {
      const on = (num(f, sig.key) ?? 0) > (sig.onAt ?? 0.03);
      const pon = (num(p, sig.key) ?? 0) > (sig.onAt ?? 0.03);
      if (on && !pon) push(sig.label.toUpperCase(), "device", i, sig.label + " turned on.");
      if (!on && pon) push(sig.label.toUpperCase(), "device", i, sig.label + " turned off.");
    }
  }
  return out;
}
function baselineMsg(f) {
  const safe = num(f, CONFIG.fields.safe);
  if (CONFIG.model === "response_error") {
    return "Baseline — output " + fmt(safe) + ", " + (isBandActive(f) ? "response error" : "tracking the command") + ".";
  }
  return "Baseline — safe output " + fmt(safe) + ", guard " + (isClamp(f) ? "clamping" : "passing") + ".";
}
function clampWhy(f) {
  const req = num(f, CONFIG.fields.requested), lim = num(f, CONFIG.fields.limit);
  if (req !== null && lim !== null) return "requested " + fmt(req) + " > limit " + fmt(lim);
  return "requested over the safe limit";
}
function errorWhy(f) {
  const cmd = num(f, CONFIG.fields.demandLabel), obs = num(f, CONFIG.fields.requested), err = num(f, CONFIG.fields.error);
  return "commanded " + fmt(cmd) + " vs observed " + fmt(obs) + " (Δ " + fmt(err) + ") — output diverged from reality.";
}

// ---- rubric evaluation ----
function evalRubric(events) {
  const counts = {}; events.forEach((e) => { counts[e.kind] = (counts[e.kind] || 0) + 1; });
  return (CONFIG.rubric || []).map((item) => {
    const t = item.test; let pass = false, detail = "";
    if (t.type === "maxAtLeast") {
      let mx = -Infinity, at = -1;
      FRAMES.forEach((f, i) => { const v = num(f, t.field); if (v !== null && v > mx) { mx = v; at = i; } });
      pass = mx >= t.value; detail = "max " + fmt(mx) + (at >= 0 ? " @ " + clockLabel(at) : "");
    } else if (t.type === "minAtMost") {
      let mn = Infinity, at = -1;
      FRAMES.forEach((f, i) => { const v = num(f, t.field); if (v !== null && v < mn) { mn = v; at = i; } });
      pass = mn <= t.value; detail = "min " + fmt(mn) + (at >= 0 ? " @ " + clockLabel(at) : "");
    } else if (t.type === "anyTrue") {
      const n = FRAMES.filter((f) => boolf(f, t.field)).length;
      pass = n > 0; detail = n + " frame" + (n === 1 ? "" : "s");
    } else if (t.type === "eventAtLeast") {
      const kinds = Array.isArray(t.event) ? t.event : [t.event];
      const n = kinds.reduce((s, k) => s + (counts[k] || 0), 0);
      pass = n >= (t.n || 1); detail = n + "×";
    }
    return { label: item.label, pass, detail };
  });
}

// ---- summary stats ----
function computeStats(events) {
  const safeK = CONFIG.fields.safe, reqK = CONFIG.fields.requested;
  const rng = (key) => { const xs = FRAMES.map((f) => num(f, key)).filter((v) => v !== null); return xs.length ? [Math.min(...xs), Math.max(...xs)] : [null, null]; };
  const clampN = FRAMES.filter(isBandActive).length;
  const out = [];
  out.push(["frames", String(FRAMES.length)]);
  if (TK) out.push(["duration", clockLabel(FRAMES.length - 1)]);
  out.push([CONFIG.model === "response_error" ? "% resp error" : "% clamping", pct(clampN / Math.max(1, FRAMES.length))]);
  const r = rng(reqK), s = rng(safeK);
  if (r[0] !== null) out.push(["request max", fmt(r[1])]);
  if (s[0] !== null) out.push(["safe max", fmt(s[1])]);
  if (CONFIG.fields.limit) { const l = rng(CONFIG.fields.limit); if (l[0] !== null) out.push(["limit range", fmt(l[0]) + "–" + fmt(l[1])]); }
  out.push(["events", String(events.filter((e) => e.kind !== "BASELINE").length)]);
  return out;
}

// ---- rendering ----
async function sha256Hex(text) {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) { return null; }
}

let curIndex = 0, playTimer = null;

function render() {
  $("title").textContent = CONFIG.courseTitle || "Guard Trace — Instructor Verification Replay";
  $("subtitle").textContent = (CONFIG.contractRule ? "Contract: " + CONFIG.contractRule + ". " : "")
    + "Captured " + (META.captured_at || "—") + ".";
  renderAbout();

  // badges
  const badges = $("badges"); badges.innerHTML = "";
  const src = FRAMES.length ? FRAMES[0][CONFIG.fields_source || "source_mode"] : null;
  const live = src && CONFIG.liveSourceValue && src === CONFIG.liveSourceValue;
  const isVirtual = META.virtual === true || (CONFIG.liveSourceValue && src && src !== CONFIG.liveSourceValue);
  if (isVirtual) { badges.appendChild(mkBadge("Virtual replay", "virtual")); document.body.classList.add("is-virtual"); }
  badges.appendChild(mkBadge(live ? "live hardware" : ("source: " + (src || "unknown")), live ? "ok" : "warn"));
  badges.appendChild(mkBadge(FRAMES.length + " frames", "info"));
  if (META.device) badges.appendChild(mkBadge(META.device, ""));

  // provenance
  const prov = $("prov"); prov.innerHTML = "";
  const f0 = FRAMES[0] || {};
  (CONFIG.provenance || []).forEach((p) => prov.appendChild(mkProv(p.label, f0[p.key] ?? "—")));
  if (META.serial_link) prov.appendChild(mkProv("Serial", META.serial_link));
  if (TK) prov.appendChild(mkProv("Window", clockLabel(0) + " → " + clockLabel(FRAMES.length - 1)));

  // verdict
  const c = checkContract();
  const v = $("verdict");
  if (CONFIG.model === "response_error") {
    // detection course: count response-error onsets; the loop "verifies" by
    // confirming the observed output against the command, not a ceiling.
    const es = CONFIG.fields.errorState, ds = CONFIG.fields.decision;
    let errEvents = 0;
    for (let i = 1; i < FRAMES.length; i++) {
      if (FRAMES[i][ds] === es && FRAMES[i - 1][ds] !== es) errEvents++;
    }
    v.className = "verdict pass";
    $("verdictMark").textContent = "✅";
    $("verdictHeadline").textContent = "CLOSED LOOP VERIFIED — " + errEvents + " response-error event" + (errEvents === 1 ? "" : "s") + " across " + FRAMES.length + " frames";
    $("verdictDetail").textContent = errEvents === 0
      ? "Observed tracked the command throughout — no divergence flagged."
      : "The board flagged where commanded output and observed reality diverged, then recovered to tracking.";
  } else {
    v.className = "verdict " + (c.violations === 0 ? "pass" : "fail");
    $("verdictMark").textContent = c.violations === 0 ? "✅" : "⛔";
    $("verdictHeadline").textContent = c.violations === 0
      ? "GUARD HELD — 0 contract violations across " + FRAMES.length + " frames"
      : "CONTRACT FAILED — " + c.violations + " violation" + (c.violations === 1 ? "" : "s");
    $("verdictDetail").textContent = c.violations === 0
      ? "Safe output never exceeded its ceiling (" + (CONFIG.contractCeilings || []).join(" / ") + ")."
      : "First failure at " + clockLabel(c.failures[0].i) + ": safe " + fmt(c.failures[0].safe) + " > " + c.failures[0].ck + " " + fmt(c.failures[0].ceil) + ".";
  }
  if (isVirtual) $("verdictDetail").textContent += " Virtual replay — no Arty A7 was programmed or observed.";

  // events + rubric + stats + log
  const events = detectEvents();
  const rubric = evalRubric(events);
  const ru = $("rubric"); ru.innerHTML = "";
  rubric.forEach((r) => {
    const li = document.createElement("li"); li.className = r.pass ? "pass" : "miss";
    li.innerHTML = '<span class="tick">' + (r.pass ? "✅" : "✗") + '</span><span class="label">' + r.label + '</span><span class="ev">' + r.detail + "</span>";
    ru.appendChild(li);
  });

  const st = $("stats"); st.innerHTML = "";
  computeStats(events).forEach(([k, val]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b>" + val + "</b>"; st.appendChild(d); });

  const body = $("logBody"); body.innerHTML = "";
  events.forEach((e) => {
    const tr = document.createElement("tr"); tr.dataset.i = e.i;
    tr.innerHTML = '<td class="t">' + wallClock(e.i) + '</td><td class="f">f' + e.i + '</td><td class="k ' + e.cls + '">' + e.kind + '</td><td>' + e.message + "</td>";
    tr.addEventListener("click", () => seek(e.i));
    body.appendChild(tr);
  });
  $("logCount").textContent = "(" + events.filter((e) => e.kind !== "BASELINE").length + " transitions)";

  // legend + player init
  const legend = $("legend"); legend.innerHTML = "";
  (CONFIG.traces || []).forEach((t) => { const s = document.createElement("span"); s.innerHTML = '<i style="background:' + t.color + '"></i>' + t.label; legend.appendChild(s); });
  const bandLabel = CONFIG.model === "response_error" ? "response error" : "guard clamping";
  const cs = document.createElement("span"); cs.innerHTML = '<i style="background:rgba(255,122,122,.45)"></i>' + bandLabel; legend.appendChild(cs);
  $("scrub").max = String(Math.max(0, FRAMES.length - 1));
  seek(0);

  // disclaimers + trace fingerprint
  $("disclaimers").textContent = (CONFIG.disclaimers || []).join("  ·  ");
  const claimedFp = META.trace_sha256;
  const canonical = canonicalJsonl(FRAMES);
  const fpShort = (h) => (h ? String(h).slice(0, 12) + "…" : "n/a");
  $("integrityLine").textContent = "Trace fingerprint (SHA-256): " + (claimedFp || "(not provided)");
  badges.appendChild(mkBadge("fingerprint " + fpShort(claimedFp), claimedFp ? "ok" : "warn"));
  $("verifyRecipe").textContent =
    "Verify: download the trace, then  sha256sum trace.jsonl  (PowerShell: Get-FileHash -Algorithm SHA256 trace.jsonl) — it must equal the value above.";
  $("fingerprintNote").textContent =
    "A fingerprint proves this trace's content is intact and identical to its .jsonl — it is not a signature and does not prove a board was used. Cryptographic authenticity comes only from the signed hardware evidence packet.";
  $("dlTrace").addEventListener("click", () => {
    const blob = new Blob([canonical], { type: "application/jsonl" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "trace.jsonl";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  // Recompute over the same canonical bytes to verify the embedded value, when
  // crypto is available (it often isn't on file://, so the embedded value stands).
  sha256Hex(canonical).then((hex) => {
    if (!hex) return;
    if (claimedFp) {
      const ok = hex.toLowerCase() === String(claimedFp).toLowerCase();
      $("integrityLine").textContent += ok ? "  ·  ✓ verified in page" : "  ·  ✗ recomputed " + hex;
    } else {
      $("integrityLine").textContent = "Trace fingerprint (SHA-256): " + hex + "  ·  (recomputed in page)";
    }
  });
}

// Canonical trace bytes — must match buildReplay.ts canonicalTraceJsonl exactly so
// the downloaded trace re-hashes to the embedded fingerprint.
function canonicalJsonl(frames) {
  const line = (f) =>
    "{" +
    Object.keys(f)
      .sort()
      .map((k) => JSON.stringify(k) + ":" + JSON.stringify(f[k]))
      .join(",") +
    "}";
  return frames.map(line).join("\\n") + "\\n";
}

function mkBadge(text, cls) { const s = document.createElement("span"); s.className = "badge " + (cls || ""); s.textContent = text; return s; }
function mkProv(label, val) { const d = document.createElement("div"); d.innerHTML = "<span>" + label + "</span><b>" + String(val) + "</b>"; return d; }

// ---- about / real-world context (config-driven, hidden if the course omits it) ----
function renderAbout() {
  const a = CONFIG.about; if (!a) return;
  $("aboutPanel").style.display = "";
  if (a.heading) $("aboutHeading").textContent = a.heading;
  $("aboutLede").textContent = a.lede || "";
  const sec = $("aboutSections"); sec.innerHTML = "";
  (a.sections || []).forEach((s) => { const d = document.createElement("div"); d.innerHTML = "<h3>" + s.h + "</h3><p>" + s.body + "</p>"; sec.appendChild(d); });
  const op = $("aboutOperate"); op.innerHTML = "";
  if (a.operate && (a.operate.rows || []).length) {
    let html = '<div class="operate"><div class="otitle">' + (a.operate.intro || "Operating the contract") + '</div><table><tbody>';
    a.operate.rows.forEach((r) => { html += '<tr><td class="ctl">' + r[0] + '</td><td>' + r[1] + "</td></tr>"; });
    op.innerHTML = html + "</tbody></table></div>";
  }
}

// ---- player ----
function drawGraph(upto) {
  const c = $("graph"), x = c.getContext("2d"), w = c.width, h = c.height, p = 30;
  const n = Math.max(1, FRAMES.length - 1), step = (w - p * 2) / n;
  x.clearRect(0, 0, w, h); x.fillStyle = "#00080c"; x.fillRect(0, 0, w, h);
  // red bands wherever the guard is actively clamping — the hardware "guard active" red, carried into the trace
  x.fillStyle = "rgba(255,122,122,.13)";
  FRAMES.slice(0, upto + 1).forEach((f, j) => { if (isBandActive(f)) { const xx = p + j / n * (w - p * 2); x.fillRect(xx - step / 2, p, step + 1, h - p * 2); } });
  x.strokeStyle = "rgba(216,232,228,.09)";
  for (let k = 0; k <= 5; k++) { const y = p + k / 5 * (h - p * 2); x.beginPath(); x.moveTo(p, y); x.lineTo(w - p, y); x.stroke(); }
  (CONFIG.traces || []).forEach((t) => {
    x.beginPath(); x.setLineDash(t.dashed ? [6, 5] : []);
    FRAMES.slice(0, upto + 1).forEach((f, j) => {
      const xx = p + j / n * (w - p * 2), yy = h - p - lv(num(f, t.key)) * (h - p * 2);
      j ? x.lineTo(xx, yy) : x.moveTo(xx, yy);
    });
    x.strokeStyle = t.color; x.lineWidth = t.width || 2; x.lineCap = "round"; x.stroke();
  });
  x.setLineDash([]);
  const px = p + upto / n * (w - p * 2);
  x.strokeStyle = "rgba(255,242,166,.7)"; x.beginPath(); x.moveTo(px, p - 8); x.lineTo(px, h - p + 8); x.stroke();
}
function renderFrame(i) {
  const f = FRAMES[i] || {};
  if (CONFIG.model === "response_error") {
    const err = f[CONFIG.fields.decision] === CONFIG.fields.errorState;
    $("frameMeta").innerHTML = "frame " + (i + 1) + " / " + FRAMES.length + "  ·  " + wallClock(i) + (err ? '  ·  <span class="alert">RESPONSE ERROR</span>' : "  ·  tracking");
    const ro = $("readouts"); ro.innerHTML = "";
    const show = [
      ["command", fmt(num(f, CONFIG.fields.demandLabel))],
      ["observed", fmt(num(f, CONFIG.fields.requested))],
      ["resp err", fmt(num(f, CONFIG.fields.error))],
      ["decision", err ? "resp err" : "tracking", err ? "alert" : ""],
    ];
    show.forEach(([k, val, cls]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b" + (cls ? ' class="' + cls + '"' : "") + ">" + (val ?? "--") + "</b>"; ro.appendChild(d); });
    $("rawFrame").textContent = JSON.stringify(f.raw ?? f, null, 2);
    drawGraph(i);
    return;
  }
  const clamping = isClamp(f);
  $("frameMeta").innerHTML = "frame " + (i + 1) + " / " + FRAMES.length + "  ·  " + wallClock(i) + (clamping ? '  ·  <span class="alert">CLAMP</span>' : "  ·  pass");
  const ro = $("readouts"); ro.innerHTML = "";
  const demandRaw = CONFIG.fields.demandLabel ? f[CONFIG.fields.demandLabel] : null;
  const show = [["demand", typeof demandRaw === "number" ? fmt(demandRaw) : demandRaw], ["request", fmt(num(f, CONFIG.fields.requested))], ["safe", fmt(num(f, CONFIG.fields.safe))]];
  if (CONFIG.fields.limit) show.push(["limit", fmt(num(f, CONFIG.fields.limit))]);
  show.push(["guard", clamping ? "clamp" : "pass", clamping ? "alert" : ""]);
  if (CONFIG.fields.violation) { const latched = boolf(f, CONFIG.fields.violation); show.push(["violation", latched ? "LATCHED" : "—", latched ? "alert" : ""]); }
  show.forEach(([k, val, cls]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b" + (cls ? ' class="' + cls + '"' : "") + ">" + (val ?? "--") + "</b>"; ro.appendChild(d); });
  $("rawFrame").textContent = JSON.stringify(f.raw ?? f, null, 2);
  drawGraph(i);
}
function seek(i) { curIndex = Math.max(0, Math.min(FRAMES.length - 1, i)); $("scrub").value = String(curIndex); renderFrame(curIndex); }
function play() {
  if (playTimer) { clearInterval(playTimer); playTimer = null; $("play").textContent = "Play"; return; }
  $("play").textContent = "Pause";
  playTimer = setInterval(() => { if (curIndex >= FRAMES.length - 1) { clearInterval(playTimer); playTimer = null; $("play").textContent = "Play"; return; } seek(curIndex + 1); }, 140);
}
$("play").addEventListener("click", play);
$("prev").addEventListener("click", () => seek(curIndex - 1));
$("next").addEventListener("click", () => seek(curIndex + 1));
$("scrub").addEventListener("input", (e) => seek(Number(e.target.value)));

if (Array.isArray(FRAMES) && FRAMES.length) { render(); }
else { document.body.innerHTML = '<main><section class="panel"><h1>No frames</h1><p class="sub">This replay was exported without any trace frames.</p></section></main>'; }
<\/script>
</body>
</html>
`,y={courseTitle:"ARTY-001 Switch Guard — Virtual Verification Replay",contractRule:"safe_output never exceeds the safe_limit or the requested_output",fields:{demandLabel:"switch_bits",requested:"requested_output",safe:"safe_output",limit:"safe_limit",margin:"safety_margin",violation:"violation_latched",guardAction:"guard_action",clampValue:"clamp_to_safe_output",button:"button_pressed"},contractCeilings:["safe_limit","requested_output"],trackLimitMoves:!0,traces:[{key:"requested_output",label:"request",color:"#f7b267",width:2},{key:"safe_output",label:"safe",color:"#8ee0b2",width:4},{key:"safe_limit",label:"limit",color:"#ffd166",width:1,dashed:!0}],provenance:[{key:"board_id",label:"Board"},{key:"kernel_id",label:"Kernel"},{key:"schema_version",label:"Schema"},{key:"source_mode",label:"Source"}],liveSourceValue:"live_board",buttonOnMessage:"Surge asserted (BTN0) — demand pushed over the limit.",buttonOffMessage:"Surge released (BTN0).",rubric:[{label:"Demand ramped toward full",test:{type:"maxAtLeast",field:"requested_output",value:.95}},{label:"Guard clamp engaged",test:{type:"eventAtLeast",event:"CLAMP",n:1}},{label:"Violation latched",test:{type:"eventAtLeast",event:"VIOLATION LATCHED",n:1}},{label:"Violation cleared (BTN3)",test:{type:"eventAtLeast",event:"VIOLATION CLEARED",n:1}},{label:"Surge applied (BTN0)",test:{type:"anyTrue",field:"button_pressed"}},{label:"Safe limit moved (BTN1/BTN2)",test:{type:"eventAtLeast",event:["LIMIT UP","LIMIT DOWN"],n:1}}],disclaimers:["Volatile FPGA programming."],about:{heading:"About this guard — and how to drive it",lede:"Promise: the safe output never exceeds the safe limit or the demand.",sections:[{h:"Real life",body:"Motor / power / heater / actuator ceilings held below a safe maximum."},{h:"Use it",body:"A last-line interlock between a controller and a power stage."}],operate:{intro:"Operating the contract",rows:[["SW0–SW3","set the demand"],["BTN0","surge the demand over the limit"],["BTN1 / BTN2","raise / lower the safe limit"],["BTN3","acknowledge a latched violation"]]}}};function k(e){return e.map(t=>({schema_version:t.schema_version,sample_index:t.sample_index,timestamp_ms:t.timestamp_ms,switch_bits:t.switch_bits,source_mode:t.source_mode,board_id:"— (virtual)",kernel_id:t.kernel_sha256,button_pressed:t.button_pressed,requested_output:t.guard.requested_output,safe_output:t.guard.safe_output,safe_limit:t.guard.limit,safety_margin:t.guard.safety_margin,violation_latched:t.guard.violation_latched,guard_action:t.guard.guard_action}))}function G(e){return{captured_at:e.toISOString(),device:"Browser FPGA simulator (Arty A7 model)",source:"virtual://arty001-switch-guard-sim",virtual:!0}}function j(e){return(e.skeleton??O).replace('"__FRAMES__"',()=>JSON.stringify(e.frames)).replace('"__CONFIG__"',()=>JSON.stringify(e.config)).replace('"__META__"',()=>JSON.stringify(e.meta))}function z(e){const t=i=>"{"+Object.keys(i).sort().map(o=>JSON.stringify(o)+":"+JSON.stringify(i[o])).join(",")+"}";return e.map(t).join(`
`)+`
`}async function P(e){const t=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e));return Array.from(new Uint8Array(t)).map(i=>i.toString(16).padStart(2,"0")).join("")}async function _(e,t,i){const o=await P(z(e)),r={...G(i),trace_sha256:o};return j({frames:e,config:t,meta:r})}async function ae(e,t){const i={...y,disclaimers:[...y.disclaimers,"Browser simulation — candidate-only; no Arty A7 was programmed or observed."]};return _(k(e),i,t)}const x={courseTitle:"Reflex Lab 01 — ESP32 Guard Virtual Replay",contractRule:"safe_output never exceeds the requested_output (the guard only reduces)",fields:{demandLabel:"pot_raw",requested:"requested_output",safe:"safe_output",limit:null,margin:"safety_margin",violation:null,guardAction:"guard_action",clampValue:"clamp_to_safe_output",button:"button_pressed"},contractCeilings:["requested_output"],trackLimitMoves:!1,traces:[{key:"pot_raw",label:"pot",color:"#7bdcff",width:2},{key:"requested_output",label:"request",color:"#ffb86b",width:2},{key:"safe_output",label:"safe",color:"#83e6ac",width:4}],provenance:[{key:"board_id",label:"Board"},{key:"kernel_id",label:"Kernel"},{key:"schema_version",label:"Schema"},{key:"source_mode",label:"Source"}],liveSourceValue:"live_board",deviceSignals:[{key:"led",label:"LED",onAt:.03},{key:"buzzer",label:"Buzzer",onAt:.03}],rubric:[{label:"Input swept toward full",test:{type:"maxAtLeast",field:"pot_raw",value:.85}},{label:"Guard clamp engaged",test:{type:"eventAtLeast",event:"CLAMP",n:1}},{label:"LED driven",test:{type:"maxAtLeast",field:"led",value:.5}},{label:"Buzzer activated",test:{type:"maxAtLeast",field:"buzzer",value:.5}},{label:"Mute button used",test:{type:"anyTrue",field:"button_pressed"}}],disclaimers:["Low-voltage educational evidence only."],about:{heading:"About this guard — and how to drive it",lede:"Firmware promise: output never exceeds the request; the guard only reduces.",sections:[{h:"Real life",body:"A dimmer / motor / setpoint capped before the load."}],operate:{intro:"Operating the contract",rows:[["Potentiometer","set the demand"],["Button","mute the buzzer"]]}}};function S(e){return e.map(t=>({schema_version:t.schema_version,sample_index:t.sample_index,timestamp_ms:t.timestamp_ms,pot_raw:t.pot_raw,source_mode:"browser_sim",board_id:"— (virtual)",kernel_id:t.kernel_id,button_pressed:t.button_pressed??!1,requested_output:t.outputs.requested_output,safe_output:t.outputs.safe_output,led:t.outputs.led,buzzer:t.outputs.buzzer,safety_margin:t.guard.safety_margin,guard_action:t.guard.guard_action}))}async function re(e,t){const i={...x,disclaimers:[...x.disclaimers,"Browser simulation — candidate-only; low-voltage educational evidence, not a hardware capture."]};return _(S(e),i,t)}function ie(e){return e.toISOString().replace("T","_").replace(/[:.]/g,"-").slice(0,19)}const p=600,f=180,b=26,g=f+b,d=14,H=80,w=90,$={lines:[{key:"safe_limit",color:"#ffd166",width:2,dashed:!0},{key:"safety_margin",color:"#c4b5fd",width:2,dashed:!1},{key:"requested_output",color:"#f7b267",width:2,dashed:!1},{key:"safe_output",color:"#8ee0b2",width:4,dashed:!1}],legend:[{label:"request",color:"#f7b267",dashed:!1,width:2},{label:"safe",color:"#8ee0b2",dashed:!1,width:3},{label:"limit",color:"#ffd166",dashed:!0,width:2},{label:"margin",color:"#c4b5fd",dashed:!1,width:2}]},q={lines:[{key:"pot_raw",color:"#7bdcff",width:2,dashed:!1},{key:"requested_output",color:"#ffb86b",width:2,dashed:!1},{key:"safe_output",color:"#83e6ac",width:4,dashed:!1},{key:"buzzer",color:"#a893ff",width:2,dashed:!1},{key:"button_pressed",color:"#ff9d9d",width:2,dashed:!0}],legend:[{label:"pot",color:"#7bdcff",dashed:!1,width:2},{label:"request",color:"#ffb86b",dashed:!1,width:2},{label:"safe",color:"#83e6ac",dashed:!1,width:3},{label:"buzzer",color:"#a893ff",dashed:!1,width:2},{label:"btn",color:"#ff9d9d",dashed:!0,width:2}]};function B(e){return Math.max(0,Math.min(1,e))}function V(e){return e.guard_action==="clamp_to_safe_output"}function D(e,t,i,o){const r=Math.max(1,t.length-1),l=(p-d*2)/r;e.fillStyle="#00080c",e.fillRect(0,0,p,f),e.fillStyle="rgba(255,122,122,0.16)";for(let s=0;s<=i;s++)if(V(t[s])){const n=d+s/r*(p-d*2);e.fillRect(n-l/2,d,l+1,f-d*2)}e.strokeStyle="rgba(216,232,228,0.09)",e.lineWidth=1;for(let s=0;s<=4;s++){const n=d+s/4*(f-d*2);e.beginPath(),e.moveTo(d,n),e.lineTo(p-d,n),e.stroke()}for(const s of o.lines){e.beginPath(),e.setLineDash(s.dashed?[5,4]:[]);for(let n=0;n<=i;n++){const u=d+n/r*(p-d*2),m=f-d-B(Number(t[n][s.key])||0)*(f-d*2);n===0?e.moveTo(u,m):e.lineTo(u,m)}e.strokeStyle=s.color,e.lineWidth=s.width,e.lineCap="round",e.stroke()}e.setLineDash([]);const c=d+i/r*(p-d*2);e.strokeStyle="rgba(255,242,166,0.7)",e.lineWidth=1,e.beginPath(),e.moveTo(c,d-6),e.lineTo(c,f-d+6),e.stroke()}function K(e,t,i){const o=f;e.fillStyle="#0a1620",e.fillRect(0,o,p,b),e.strokeStyle="rgba(216,232,228,0.12)",e.lineWidth=1,e.beginPath(),e.moveTo(0,o+.5),e.lineTo(p,o+.5),e.stroke();const r=o+b/2;e.textBaseline="middle",e.font="600 11px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.textAlign="left";let l=12;for(const n of i)e.strokeStyle=n.color,e.lineWidth=n.width,e.setLineDash(n.dashed?[4,3]:[]),e.beginPath(),e.moveTo(l,r),e.lineTo(l+16,r),e.stroke(),e.setLineDash([]),l+=21,e.fillStyle="#aebfbb",e.fillText(n.label,l,r),l+=e.measureText(n.label).width+14;let c=p-12;e.textAlign="right",e.font="800 10px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.fillStyle="#ff9d9d",e.fillText("VIRTUAL",c,r),c-=e.measureText("VIRTUAL").width+9,e.font="600 11px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.fillStyle="#7d918d";const s="monogatelectronics ·";e.fillText(s,c,r),c-=e.measureText(s).width+8,t&&e.drawImage(t,c-18,r-18/2,18,18)}async function W(){try{const e=new Image;return e.src="/electronics-lab/assets/monogatelogo.png",await e.decode(),e}catch{return null}}function U(e,t){if(e<=t)return Array.from({length:e},(r,l)=>l);const i=[],o=(e-1)/(t-1);for(let r=0;r<t;r++)i.push(Math.round(r*o));return i[i.length-1]=e-1,i}function Y(e,t,i){const o=document.createElement("canvas");o.width=p,o.height=g;const r=o.getContext("2d",{willReadFrequently:!0});if(!r)throw new Error("2D canvas context unavailable");const l=T(),c=U(e.length,H);return c.forEach((s,n)=>{D(r,e,s,t),K(r,i,t.legend);const{data:u}=r.getImageData(0,0,p,g),m=I(u,256),A=R(u,m),F=n===c.length-1?w*8:w;l.writeFrame(A,p,g,{palette:m,delay:F})}),l.finish(),l.bytes()}async function E(e,t,i){if(e.length===0)return;const o=await W(),r=Y(e,t,o),l=new Uint8Array(r.length);l.set(r);const c=new Blob([l],{type:"image/gif"}),s=URL.createObjectURL(c),n=document.createElement("a");n.href=s,n.download=i,n.click(),URL.revokeObjectURL(s)}function ne(e,t){return E(k(e),$,t)}function se(e,t){return E(S(e),q,t)}export{Z as P,ee as W,te as a,ae as b,re as c,se as d,ne as e,ie as r};
