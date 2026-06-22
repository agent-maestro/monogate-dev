import{b as A,H as E,n as F}from"./vendor-Bozx688T.js";const C=`<!doctype html>\r
<html lang="en">\r
<head>\r
<meta charset="utf-8" />\r
<meta name="viewport" content="width=device-width, initial-scale=1" />\r
<title>Guard Trace — Instructor Verification Replay</title>\r
<!--\r
  Monogate instructor-grade replay skeleton (course-agnostic).\r
  Source of truth: dashboards/shared/instructor-replay-skeleton.html\r
  A dashboard exports a standalone verification replay by string-replacing the three\r
  quoted markers in the script below with JSON, then serving the result as a download:\r
    FRAMES marker -> array of trace frames (each may carry a \`raw\` original frame)\r
    CONFIG marker -> per-course config object (fields, events, rubric, traces)\r
    META marker   -> provenance object (device, capture window, source path, sha note)\r
  All report logic is driven by CONFIG, so the same skeleton serves every course.\r
-->\r
<style>\r
  :root {\r
    --bg: #07131b; --panel: rgba(8,22,23,.92); --panel2: rgba(2,12,14,.66);\r
    --ink: #edf7f4; --muted: #8fb3ad; --line: rgba(216,232,228,.14);\r
    --accent: #70dbff; --gold: #fff2a6; --green: #8ee0b2; --amber: #f7b267;\r
    --red: #ff7a7a; --blue: #9ad0ff; --violet: #c4b5fd;\r
  }\r
  * { box-sizing: border-box; }\r
  body { margin: 0; padding: 20px; background: var(--bg); color: var(--ink);\r
    font-family: Inter, system-ui, -apple-system, sans-serif; line-height: 1.45; }\r
  main { max-width: 1180px; margin: 0 auto; display: grid; gap: 14px; }\r
  .panel { border: 1px solid var(--line); border-radius: 10px; background: var(--panel); padding: 16px; }\r
  h1 { margin: 0 0 2px; font-size: 22px; color: #fff; }\r
  h2 { margin: 0 0 10px; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }\r
  .sub { color: var(--muted); font-size: 13px; }\r
  .badges { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }\r
  .badge { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em;\r
    padding: 4px 9px; border-radius: 999px; border: 1px solid var(--line); color: var(--muted); }\r
  .badge.ok { color: #06241c; background: var(--green); border-color: transparent; }\r
  .badge.warn { color: #2a1c00; background: var(--amber); border-color: transparent; }\r
  .badge.bad { color: #2a0000; background: var(--red); border-color: transparent; }\r
  .badge.info { color: #04202e; background: var(--blue); border-color: transparent; }\r
  .badge.virtual { color: #2a0000; background: var(--red); border-color: transparent; }\r
  /* Virtual-replay watermark: faint tiled "VIRTUAL REPLAY", shown only when META.virtual.\r
     Fixed overlay, never intercepts clicks, set to print so it survives PDF export. */\r
  .watermark { position: fixed; inset: 0; z-index: 9998; pointer-events: none; display: none; opacity: .07;\r
    background-repeat: repeat;\r
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='150'><text x='6' y='95' font-family='Segoe UI,Arial,sans-serif' font-size='18' font-weight='800' fill='%23ff7a7a' transform='rotate(-26 130 75)'>VIRTUAL REPLAY</text></svg>");\r
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }\r
  body.is-virtual .watermark { display: block; }\r
  .prov { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }\r
  .prov div { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; background: var(--panel2); }\r
  .prov span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); letter-spacing: .05em; }\r
  .prov b { font-size: 14px; color: var(--ink); word-break: break-word; font-weight: 700; }\r
  .verdict { display: flex; align-items: center; gap: 16px; border-radius: 12px; padding: 18px 20px; border: 1px solid var(--line); }\r
  .verdict.pass { background: linear-gradient(90deg, rgba(142,224,178,.16), transparent); border-color: rgba(142,224,178,.5); }\r
  .verdict.fail { background: linear-gradient(90deg, rgba(255,122,122,.18), transparent); border-color: rgba(255,122,122,.55); }\r
  .verdict .mark { font-size: 40px; line-height: 1; }\r
  .verdict .headline { font-size: 22px; font-weight: 900; color: #fff; }\r
  .verdict .detail { color: var(--muted); font-size: 13px; margin-top: 2px; }\r
  ul.rubric { list-style: none; margin: 0; padding: 0; display: grid; gap: 7px; }\r
  ul.rubric li { display: flex; gap: 10px; align-items: baseline; padding: 8px 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel2); }\r
  ul.rubric li .tick { font-size: 15px; }\r
  ul.rubric li.pass .tick { color: var(--green); }\r
  ul.rubric li.miss { opacity: .62; }\r
  ul.rubric li.miss .tick { color: var(--muted); }\r
  ul.rubric li .label { font-weight: 700; }\r
  ul.rubric li .ev { margin-left: auto; color: var(--muted); font-size: 12px; font-variant-numeric: tabular-nums; }\r
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; }\r
  .stats div { border: 1px solid var(--line); border-radius: 8px; padding: 9px 11px; background: var(--panel2); }\r
  .stats span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); }\r
  .stats b { font-size: 18px; color: var(--gold); font-variant-numeric: tabular-nums; }\r
  .log { max-height: 360px; overflow: auto; border: 1px solid var(--line); border-radius: 8px; background: #00080c; }\r
  .log table { width: 100%; border-collapse: collapse; font-size: 13px; }\r
  .log td { padding: 6px 10px; border-bottom: 1px solid rgba(216,232,228,.06); vertical-align: top; }\r
  .log tr { cursor: pointer; }\r
  .log tr:hover { background: rgba(112,219,255,.07); }\r
  .log .t { color: var(--muted); font-variant-numeric: tabular-nums; white-space: nowrap; width: 1%; }\r
  .log .f { color: var(--accent); font-variant-numeric: tabular-nums; white-space: nowrap; width: 1%; }\r
  .log .k { font-weight: 800; white-space: nowrap; width: 1%; }\r
  .log .k.latch, .log .k.clamp, .log .k.violation { color: var(--red); }\r
  .log .k.clear, .log .k.release { color: var(--green); }\r
  .log .k.limit { color: var(--blue); }\r
  .log .k.device, .log .k.surge { color: var(--violet); }\r
  .player { display: grid; gap: 10px; }\r
  .readouts { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; }\r
  .readouts div { border: 1px solid var(--line); border-radius: 8px; padding: 10px; background: var(--panel2); }\r
  .readouts span { display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--accent); }\r
  .readouts b { font-size: 24px; color: var(--gold); font-variant-numeric: tabular-nums; }\r
  .readouts b.alert { color: var(--red); }\r
  #frameMeta .alert { color: var(--red); font-weight: 800; }\r
  canvas { width: 100%; height: 300px; border: 1px solid var(--line); border-radius: 8px; background: #00080c; }\r
  .controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }\r
  button { min-height: 34px; padding: 0 14px; border: 1px solid rgba(216,232,228,.18); border-radius: 7px;\r
    background: rgba(216,232,228,.07); color: var(--ink); font-weight: 800; cursor: pointer; }\r
  button:hover { background: rgba(216,232,228,.14); }\r
  input[type=range] { flex: 1; min-width: 180px; }\r
  pre { max-height: 280px; overflow: auto; background: #00080c; padding: 12px; border-radius: 8px; margin: 0;\r
    font-size: 12px; border: 1px solid var(--line); }\r
  .legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted); }\r
  .legend i { display: inline-block; width: 12px; height: 3px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }\r
  .foot { color: var(--muted); font-size: 12px; display: grid; gap: 10px; }\r
  .mono { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; word-break: break-all; }\r
  .verify-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }\r
  .verify-row button { min-height: 30px; font-size: 12px; }\r
  .about p.lede { color: var(--ink); font-size: 14px; margin: 0 0 12px; }\r
  .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; }\r
  .about-grid div { border: 1px solid var(--line); border-radius: 8px; padding: 11px 13px; background: var(--panel2); }\r
  .about-grid h3 { margin: 0 0 5px; font-size: 13px; color: var(--gold); }\r
  .about-grid p { margin: 0; font-size: 13px; color: var(--muted); }\r
  .operate { margin-top: 14px; }\r
  .operate .otitle { font-size: 12px; color: var(--accent); font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }\r
  .operate table { width: 100%; border-collapse: collapse; font-size: 13px; }\r
  .operate td { padding: 7px 10px; border-bottom: 1px solid rgba(216,232,228,.08); vertical-align: top; }\r
  .operate td.ctl { color: var(--gold); font-weight: 700; white-space: nowrap; width: 1%; font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; }\r
</style>\r
</head>\r
<body>\r
<div class="watermark" id="watermark" aria-hidden="true"></div>\r
<main>\r
  <header class="panel">\r
    <h1 id="title">Guard Trace — Instructor Verification Replay</h1>\r
    <p class="sub" id="subtitle"></p>\r
    <div class="badges" id="badges"></div>\r
  </header>\r
\r
  <section class="panel">\r
    <h2>Provenance</h2>\r
    <div class="prov" id="prov"></div>\r
  </section>\r
\r
  <section class="panel">\r
    <div class="verdict" id="verdict">\r
      <div class="mark" id="verdictMark">…</div>\r
      <div>\r
        <div class="headline" id="verdictHeadline">Evaluating…</div>\r
        <div class="detail" id="verdictDetail"></div>\r
      </div>\r
    </div>\r
  </section>\r
\r
  <section class="panel about" id="aboutPanel" style="display:none">\r
    <h2 id="aboutHeading">About this guard</h2>\r
    <p class="lede" id="aboutLede"></p>\r
    <div class="about-grid" id="aboutSections"></div>\r
    <div id="aboutOperate"></div>\r
  </section>\r
\r
  <section class="panel">\r
    <h2>Behaviors demonstrated (rubric)</h2>\r
    <ul class="rubric" id="rubric"></ul>\r
  </section>\r
\r
  <section class="panel">\r
    <h2>Summary</h2>\r
    <div class="stats" id="stats"></div>\r
  </section>\r
\r
  <section class="panel">\r
    <h2>Detailed event log <span class="sub" id="logCount"></span></h2>\r
    <div class="log"><table><tbody id="logBody"></tbody></table></div>\r
  </section>\r
\r
  <section class="panel player">\r
    <h2>Replay</h2>\r
    <div class="controls">\r
      <button id="play">Play</button>\r
      <button id="prev">◀ Prev</button>\r
      <button id="next">Next ▶</button>\r
      <input id="scrub" type="range" min="0" max="0" value="0" />\r
      <span class="sub" id="frameMeta"></span>\r
    </div>\r
    <div class="readouts" id="readouts"></div>\r
    <div class="legend" id="legend"></div>\r
    <canvas id="graph" width="1120" height="300"></canvas>\r
    <pre id="rawFrame"></pre>\r
  </section>\r
\r
  <footer class="panel foot">\r
    <div id="disclaimers"></div>\r
    <div class="mono" id="integrityLine"></div>\r
    <div class="verify-row">\r
      <button id="dlTrace" type="button">Download trace (.jsonl)</button>\r
      <span class="mono" id="verifyRecipe"></span>\r
    </div>\r
    <div id="fingerprintNote"></div>\r
  </footer>\r
</main>\r
\r
<script>\r
"use strict";\r
const FRAMES = "__FRAMES__";\r
const CONFIG = "__CONFIG__";\r
const META = "__META__";\r
\r
const $ = (id) => document.getElementById(id);\r
const num = (f, key) => { const v = f && key ? f[key] : undefined; const n = Number(v); return Number.isFinite(n) ? n : null; };\r
const truthy = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "True";\r
const boolf = (f, key) => (f && key ? truthy(f[key]) : false);\r
const fmt = (v) => (typeof v === "number" && Number.isFinite(v)) ? v.toFixed(2) : "--";\r
const lv = (v) => Math.max(0, Math.min(1, Number(v) || 0));\r
const pct = (v) => (v * 100).toFixed(0) + "%";\r
\r
// ---- time base (wall clock if present, else frame index) ----\r
const TIME_KEYS = ["dashboard_received_epoch_ms", "timestamp_ms"];\r
function timeKey() { for (const k of TIME_KEYS) if (FRAMES.length && Number.isFinite(Number(FRAMES[0][k]))) return k; return null; }\r
const TK = timeKey();\r
const T0 = TK ? Number(FRAMES[0][TK]) : 0;\r
function elapsedSec(i) { return TK ? (Number(FRAMES[i][TK]) - T0) / 1000 : i; }\r
function clockLabel(i) {\r
  if (!TK) return "f" + i;\r
  let s = Math.max(0, elapsedSec(i)); const m = Math.floor(s / 60); s = s - m * 60;\r
  return m + ":" + s.toFixed(1).padStart(4, "0");\r
}\r
// absolute wall-clock time-of-day for a frame (HH:MM:SS.mmm) — what an instructor sees on the bench clock\r
const WALL_KEY = (FRAMES.length && Number.isFinite(Number(FRAMES[0].dashboard_received_epoch_ms))) ? "dashboard_received_epoch_ms" : null;\r
const pad2 = (n) => String(n).padStart(2, "0");\r
function wallClock(i) {\r
  if (!WALL_KEY) return clockLabel(i);\r
  const ms = Number(FRAMES[i] && FRAMES[i][WALL_KEY]); if (!Number.isFinite(ms)) return clockLabel(i);\r
  const d = new Date(ms);\r
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes()) + ":" + pad2(d.getSeconds()) + "." + String(d.getMilliseconds()).padStart(3, "0");\r
}\r
\r
// ---- guard / contract helpers ----\r
function isClamp(f) {\r
  const ga = CONFIG.fields.guardAction, cv = CONFIG.fields.clampValue;\r
  if (ga && cv && f[ga] !== undefined) return f[ga] === cv;\r
  const req = num(f, CONFIG.fields.requested), lim = num(f, CONFIG.fields.limit);\r
  if (req !== null && lim !== null) return req > lim + 0.004;\r
  return false;\r
}\r
// The shaded band marks "the watched condition is active": a guard clamp for the\r
// guard model, a response error for the response-error model. Keeps the band and\r
// its legend honest across courses.\r
function isBandActive(f) {\r
  if (CONFIG.model === "response_error") {\r
    const ds = CONFIG.fields.decision;\r
    return ds ? f[ds] === CONFIG.fields.errorState : false;\r
  }\r
  return isClamp(f);\r
}\r
function checkContract() {\r
  const safeK = CONFIG.fields.safe; const ceils = CONFIG.contractCeilings || [];\r
  let violations = 0, worst = 0; const failures = [];\r
  FRAMES.forEach((f, i) => {\r
    const safe = num(f, safeK); if (safe === null) return;\r
    for (const ck of ceils) {\r
      const ceil = num(f, ck); if (ceil === null) continue;\r
      if (safe > ceil + 0.004) {\r
        violations++; worst = Math.max(worst, safe - ceil);\r
        if (failures.length < 12) failures.push({ i, safe, ceil, ck });\r
        break;\r
      }\r
    }\r
  });\r
  return { violations, worst, failures };\r
}\r
\r
// ---- event detection (course-agnostic, config-driven) ----\r
function detectEvents() {\r
  const fields = CONFIG.fields; const out = [];\r
  const push = (kind, cls, i, message) => out.push({ kind, cls, i, t: elapsedSec(i), message });\r
  for (let i = 0; i < FRAMES.length; i++) {\r
    const f = FRAMES[i], p = i ? FRAMES[i - 1] : null;\r
    if (i === 0) { push("BASELINE", "", 0, baselineMsg(f)); continue; }\r
    if (CONFIG.model === "response_error") {\r
      // response-error course: decision transitions, not guard clamps.\r
      const ds = fields.decision, es = fields.errorState;\r
      const d = ds ? f[ds] : null, pd = ds ? p[ds] : null;\r
      if (d === es && pd !== es) push("RESPONSE ERROR", "clamp", i, errorWhy(f));\r
      if (d !== es && pd === es) push("TRACKING", "release", i, "Output tracked the command again (within deadband).");\r
    } else {\r
    // violation latch / clear\r
    if (fields.violation) {\r
      const v = boolf(f, fields.violation), pv = boolf(p, fields.violation);\r
      if (v && !pv) push("VIOLATION LATCHED", "latch", i, "Violation latched — " + clampWhy(f));\r
      if (!v && pv) push("VIOLATION CLEARED", "clear", i, "Violation cleared" + (isClamp(f) ? " (re-latches while still clamping)" : " while passing."));\r
    }\r
    // clamp engage / release (only meaningful if no violation field, else redundant-ish; keep for clamp-only courses)\r
    const c = isClamp(f), pc = isClamp(p);\r
    if (c && !pc) push("CLAMP", "clamp", i, "Guard clamped output to the safe limit — " + clampWhy(f));\r
    if (!c && pc) push("RELEASE", "release", i, "Guard released back to pass-through.");\r
    // limit moves\r
    if (CONFIG.trackLimitMoves && fields.limit) {\r
      const l = num(f, fields.limit), pl = num(p, fields.limit);\r
      if (l !== null && pl !== null && Math.abs(l - pl) > 0.01) {\r
        const up = l > pl;\r
        push(up ? "LIMIT UP" : "LIMIT DOWN", "limit", i, "Safe limit " + fmt(pl) + " → " + fmt(l) + (up ? " (raised)" : " (lowered)") + (isClamp(f) ? "" : " — passing"));\r
      }\r
    }\r
    }\r
    // momentary input (surge / mute button)\r
    if (fields.button) {\r
      const b = boolf(f, fields.button), pb = boolf(p, fields.button);\r
      if (b && !pb) push("INPUT", "surge", i, (CONFIG.buttonOnMessage || "Momentary input asserted."));\r
      if (!b && pb) push("INPUT", "surge", i, (CONFIG.buttonOffMessage || "Momentary input released."));\r
    }\r
    // device signals (LED, buzzer, ...)\r
    for (const sig of (CONFIG.deviceSignals || [])) {\r
      const on = (num(f, sig.key) ?? 0) > (sig.onAt ?? 0.03);\r
      const pon = (num(p, sig.key) ?? 0) > (sig.onAt ?? 0.03);\r
      if (on && !pon) push(sig.label.toUpperCase(), "device", i, sig.label + " turned on.");\r
      if (!on && pon) push(sig.label.toUpperCase(), "device", i, sig.label + " turned off.");\r
    }\r
  }\r
  return out;\r
}\r
function baselineMsg(f) {\r
  const safe = num(f, CONFIG.fields.safe);\r
  if (CONFIG.model === "response_error") {\r
    return "Baseline — output " + fmt(safe) + ", " + (isBandActive(f) ? "response error" : "tracking the command") + ".";\r
  }\r
  return "Baseline — safe output " + fmt(safe) + ", guard " + (isClamp(f) ? "clamping" : "passing") + ".";\r
}\r
function clampWhy(f) {\r
  const req = num(f, CONFIG.fields.requested), lim = num(f, CONFIG.fields.limit);\r
  if (req !== null && lim !== null) return "requested " + fmt(req) + " > limit " + fmt(lim);\r
  return "requested over the safe limit";\r
}\r
function errorWhy(f) {\r
  const cmd = num(f, CONFIG.fields.demandLabel), obs = num(f, CONFIG.fields.requested), err = num(f, CONFIG.fields.error);\r
  return "commanded " + fmt(cmd) + " vs observed " + fmt(obs) + " (Δ " + fmt(err) + ") — output diverged from reality.";\r
}\r
\r
// ---- rubric evaluation ----\r
function evalRubric(events) {\r
  const counts = {}; events.forEach((e) => { counts[e.kind] = (counts[e.kind] || 0) + 1; });\r
  return (CONFIG.rubric || []).map((item) => {\r
    const t = item.test; let pass = false, detail = "";\r
    if (t.type === "maxAtLeast") {\r
      let mx = -Infinity, at = -1;\r
      FRAMES.forEach((f, i) => { const v = num(f, t.field); if (v !== null && v > mx) { mx = v; at = i; } });\r
      pass = mx >= t.value; detail = "max " + fmt(mx) + (at >= 0 ? " @ " + clockLabel(at) : "");\r
    } else if (t.type === "minAtMost") {\r
      let mn = Infinity, at = -1;\r
      FRAMES.forEach((f, i) => { const v = num(f, t.field); if (v !== null && v < mn) { mn = v; at = i; } });\r
      pass = mn <= t.value; detail = "min " + fmt(mn) + (at >= 0 ? " @ " + clockLabel(at) : "");\r
    } else if (t.type === "anyTrue") {\r
      const n = FRAMES.filter((f) => boolf(f, t.field)).length;\r
      pass = n > 0; detail = n + " frame" + (n === 1 ? "" : "s");\r
    } else if (t.type === "eventAtLeast") {\r
      const kinds = Array.isArray(t.event) ? t.event : [t.event];\r
      const n = kinds.reduce((s, k) => s + (counts[k] || 0), 0);\r
      pass = n >= (t.n || 1); detail = n + "×";\r
    }\r
    return { label: item.label, pass, detail };\r
  });\r
}\r
\r
// ---- summary stats ----\r
function computeStats(events) {\r
  const safeK = CONFIG.fields.safe, reqK = CONFIG.fields.requested;\r
  const rng = (key) => { const xs = FRAMES.map((f) => num(f, key)).filter((v) => v !== null); return xs.length ? [Math.min(...xs), Math.max(...xs)] : [null, null]; };\r
  const clampN = FRAMES.filter(isBandActive).length;\r
  const out = [];\r
  out.push(["frames", String(FRAMES.length)]);\r
  if (TK) out.push(["duration", clockLabel(FRAMES.length - 1)]);\r
  out.push([CONFIG.model === "response_error" ? "% resp error" : "% clamping", pct(clampN / Math.max(1, FRAMES.length))]);\r
  const r = rng(reqK), s = rng(safeK);\r
  if (r[0] !== null) out.push(["request max", fmt(r[1])]);\r
  if (s[0] !== null) out.push(["safe max", fmt(s[1])]);\r
  if (CONFIG.fields.limit) { const l = rng(CONFIG.fields.limit); if (l[0] !== null) out.push(["limit range", fmt(l[0]) + "–" + fmt(l[1])]); }\r
  out.push(["events", String(events.filter((e) => e.kind !== "BASELINE").length)]);\r
  return out;\r
}\r
\r
// ---- rendering ----\r
async function sha256Hex(text) {\r
  try {\r
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));\r
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");\r
  } catch (e) { return null; }\r
}\r
\r
let curIndex = 0, playTimer = null;\r
\r
function render() {\r
  $("title").textContent = CONFIG.courseTitle || "Guard Trace — Instructor Verification Replay";\r
  $("subtitle").textContent = (CONFIG.contractRule ? "Contract: " + CONFIG.contractRule + ". " : "")\r
    + "Captured " + (META.captured_at || "—") + ".";\r
  renderAbout();\r
\r
  // badges\r
  const badges = $("badges"); badges.innerHTML = "";\r
  const src = FRAMES.length ? FRAMES[0][CONFIG.fields_source || "source_mode"] : null;\r
  const live = src && CONFIG.liveSourceValue && src === CONFIG.liveSourceValue;\r
  const isVirtual = META.virtual === true || (CONFIG.liveSourceValue && src && src !== CONFIG.liveSourceValue);\r
  if (isVirtual) { badges.appendChild(mkBadge("Virtual replay", "virtual")); document.body.classList.add("is-virtual"); }\r
  badges.appendChild(mkBadge(live ? "live hardware" : ("source: " + (src || "unknown")), live ? "ok" : "warn"));\r
  badges.appendChild(mkBadge(FRAMES.length + " frames", "info"));\r
  if (META.device) badges.appendChild(mkBadge(META.device, ""));\r
\r
  // provenance\r
  const prov = $("prov"); prov.innerHTML = "";\r
  const f0 = FRAMES[0] || {};\r
  (CONFIG.provenance || []).forEach((p) => prov.appendChild(mkProv(p.label, f0[p.key] ?? "—")));\r
  if (META.serial_link) prov.appendChild(mkProv("Serial", META.serial_link));\r
  if (TK) prov.appendChild(mkProv("Window", clockLabel(0) + " → " + clockLabel(FRAMES.length - 1)));\r
\r
  // verdict\r
  const c = checkContract();\r
  const v = $("verdict");\r
  if (CONFIG.model === "response_error") {\r
    // detection course: count response-error onsets; the loop "verifies" by\r
    // confirming the observed output against the command, not a ceiling.\r
    const es = CONFIG.fields.errorState, ds = CONFIG.fields.decision;\r
    let errEvents = 0;\r
    for (let i = 1; i < FRAMES.length; i++) {\r
      if (FRAMES[i][ds] === es && FRAMES[i - 1][ds] !== es) errEvents++;\r
    }\r
    v.className = "verdict pass";\r
    $("verdictMark").textContent = "✅";\r
    $("verdictHeadline").textContent = "CLOSED LOOP VERIFIED — " + errEvents + " response-error event" + (errEvents === 1 ? "" : "s") + " across " + FRAMES.length + " frames";\r
    $("verdictDetail").textContent = errEvents === 0\r
      ? "Observed tracked the command throughout — no divergence flagged."\r
      : "The board flagged where commanded output and observed reality diverged, then recovered to tracking.";\r
  } else {\r
    v.className = "verdict " + (c.violations === 0 ? "pass" : "fail");\r
    $("verdictMark").textContent = c.violations === 0 ? "✅" : "⛔";\r
    $("verdictHeadline").textContent = c.violations === 0\r
      ? "GUARD HELD — 0 contract violations across " + FRAMES.length + " frames"\r
      : "CONTRACT FAILED — " + c.violations + " violation" + (c.violations === 1 ? "" : "s");\r
    $("verdictDetail").textContent = c.violations === 0\r
      ? "Safe output never exceeded its ceiling (" + (CONFIG.contractCeilings || []).join(" / ") + ")."\r
      : "First failure at " + clockLabel(c.failures[0].i) + ": safe " + fmt(c.failures[0].safe) + " > " + c.failures[0].ck + " " + fmt(c.failures[0].ceil) + ".";\r
  }\r
  if (isVirtual) $("verdictDetail").textContent += " Virtual replay — no Arty A7 was programmed or observed.";\r
\r
  // events + rubric + stats + log\r
  const events = detectEvents();\r
  const rubric = evalRubric(events);\r
  const ru = $("rubric"); ru.innerHTML = "";\r
  rubric.forEach((r) => {\r
    const li = document.createElement("li"); li.className = r.pass ? "pass" : "miss";\r
    li.innerHTML = '<span class="tick">' + (r.pass ? "✅" : "✗") + '</span><span class="label">' + r.label + '</span><span class="ev">' + r.detail + "</span>";\r
    ru.appendChild(li);\r
  });\r
\r
  const st = $("stats"); st.innerHTML = "";\r
  computeStats(events).forEach(([k, val]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b>" + val + "</b>"; st.appendChild(d); });\r
\r
  const body = $("logBody"); body.innerHTML = "";\r
  events.forEach((e) => {\r
    const tr = document.createElement("tr"); tr.dataset.i = e.i;\r
    tr.innerHTML = '<td class="t">' + wallClock(e.i) + '</td><td class="f">f' + e.i + '</td><td class="k ' + e.cls + '">' + e.kind + '</td><td>' + e.message + "</td>";\r
    tr.addEventListener("click", () => seek(e.i));\r
    body.appendChild(tr);\r
  });\r
  $("logCount").textContent = "(" + events.filter((e) => e.kind !== "BASELINE").length + " transitions)";\r
\r
  // legend + player init\r
  const legend = $("legend"); legend.innerHTML = "";\r
  (CONFIG.traces || []).forEach((t) => { const s = document.createElement("span"); s.innerHTML = '<i style="background:' + t.color + '"></i>' + t.label; legend.appendChild(s); });\r
  const bandLabel = CONFIG.model === "response_error" ? "response error" : "guard clamping";\r
  const cs = document.createElement("span"); cs.innerHTML = '<i style="background:rgba(255,122,122,.45)"></i>' + bandLabel; legend.appendChild(cs);\r
  $("scrub").max = String(Math.max(0, FRAMES.length - 1));\r
  seek(0);\r
\r
  // disclaimers + trace fingerprint\r
  $("disclaimers").textContent = (CONFIG.disclaimers || []).join("  ·  ");\r
  const claimedFp = META.trace_sha256;\r
  const canonical = canonicalJsonl(FRAMES);\r
  const fpShort = (h) => (h ? String(h).slice(0, 12) + "…" : "n/a");\r
  $("integrityLine").textContent = "Trace fingerprint (SHA-256): " + (claimedFp || "(not provided)");\r
  badges.appendChild(mkBadge("fingerprint " + fpShort(claimedFp), claimedFp ? "ok" : "warn"));\r
  $("verifyRecipe").textContent =\r
    "Verify: download the trace, then  sha256sum trace.jsonl  (PowerShell: Get-FileHash -Algorithm SHA256 trace.jsonl) — it must equal the value above.";\r
  $("fingerprintNote").textContent =\r
    "A fingerprint proves this trace's content is intact and identical to its .jsonl — it is not a signature and does not prove a board was used. Cryptographic authenticity comes only from the signed hardware evidence packet.";\r
  $("dlTrace").addEventListener("click", () => {\r
    const blob = new Blob([canonical], { type: "application/jsonl" });\r
    const a = document.createElement("a");\r
    a.href = URL.createObjectURL(blob);\r
    a.download = "trace.jsonl";\r
    a.click();\r
    URL.revokeObjectURL(a.href);\r
  });\r
  // Recompute over the same canonical bytes to verify the embedded value, when\r
  // crypto is available (it often isn't on file://, so the embedded value stands).\r
  sha256Hex(canonical).then((hex) => {\r
    if (!hex) return;\r
    if (claimedFp) {\r
      const ok = hex.toLowerCase() === String(claimedFp).toLowerCase();\r
      $("integrityLine").textContent += ok ? "  ·  ✓ verified in page" : "  ·  ✗ recomputed " + hex;\r
    } else {\r
      $("integrityLine").textContent = "Trace fingerprint (SHA-256): " + hex + "  ·  (recomputed in page)";\r
    }\r
  });\r
}\r
\r
// Canonical trace bytes — must match buildReplay.ts canonicalTraceJsonl exactly so\r
// the downloaded trace re-hashes to the embedded fingerprint.\r
function canonicalJsonl(frames) {\r
  const line = (f) =>\r
    "{" +\r
    Object.keys(f)\r
      .sort()\r
      .map((k) => JSON.stringify(k) + ":" + JSON.stringify(f[k]))\r
      .join(",") +\r
    "}";\r
  return frames.map(line).join("\\n") + "\\n";\r
}\r
\r
function mkBadge(text, cls) { const s = document.createElement("span"); s.className = "badge " + (cls || ""); s.textContent = text; return s; }\r
function mkProv(label, val) { const d = document.createElement("div"); d.innerHTML = "<span>" + label + "</span><b>" + String(val) + "</b>"; return d; }\r
\r
// ---- about / real-world context (config-driven, hidden if the course omits it) ----\r
function renderAbout() {\r
  const a = CONFIG.about; if (!a) return;\r
  $("aboutPanel").style.display = "";\r
  if (a.heading) $("aboutHeading").textContent = a.heading;\r
  $("aboutLede").textContent = a.lede || "";\r
  const sec = $("aboutSections"); sec.innerHTML = "";\r
  (a.sections || []).forEach((s) => { const d = document.createElement("div"); d.innerHTML = "<h3>" + s.h + "</h3><p>" + s.body + "</p>"; sec.appendChild(d); });\r
  const op = $("aboutOperate"); op.innerHTML = "";\r
  if (a.operate && (a.operate.rows || []).length) {\r
    let html = '<div class="operate"><div class="otitle">' + (a.operate.intro || "Operating the contract") + '</div><table><tbody>';\r
    a.operate.rows.forEach((r) => { html += '<tr><td class="ctl">' + r[0] + '</td><td>' + r[1] + "</td></tr>"; });\r
    op.innerHTML = html + "</tbody></table></div>";\r
  }\r
}\r
\r
// ---- player ----\r
function drawGraph(upto) {\r
  const c = $("graph"), x = c.getContext("2d"), w = c.width, h = c.height, p = 30;\r
  const n = Math.max(1, FRAMES.length - 1), step = (w - p * 2) / n;\r
  x.clearRect(0, 0, w, h); x.fillStyle = "#00080c"; x.fillRect(0, 0, w, h);\r
  // red bands wherever the guard is actively clamping — the hardware "guard active" red, carried into the trace\r
  x.fillStyle = "rgba(255,122,122,.13)";\r
  FRAMES.slice(0, upto + 1).forEach((f, j) => { if (isBandActive(f)) { const xx = p + j / n * (w - p * 2); x.fillRect(xx - step / 2, p, step + 1, h - p * 2); } });\r
  x.strokeStyle = "rgba(216,232,228,.09)";\r
  for (let k = 0; k <= 5; k++) { const y = p + k / 5 * (h - p * 2); x.beginPath(); x.moveTo(p, y); x.lineTo(w - p, y); x.stroke(); }\r
  (CONFIG.traces || []).forEach((t) => {\r
    x.beginPath(); x.setLineDash(t.dashed ? [6, 5] : []);\r
    FRAMES.slice(0, upto + 1).forEach((f, j) => {\r
      const xx = p + j / n * (w - p * 2), yy = h - p - lv(num(f, t.key)) * (h - p * 2);\r
      j ? x.lineTo(xx, yy) : x.moveTo(xx, yy);\r
    });\r
    x.strokeStyle = t.color; x.lineWidth = t.width || 2; x.lineCap = "round"; x.stroke();\r
  });\r
  x.setLineDash([]);\r
  const px = p + upto / n * (w - p * 2);\r
  x.strokeStyle = "rgba(255,242,166,.7)"; x.beginPath(); x.moveTo(px, p - 8); x.lineTo(px, h - p + 8); x.stroke();\r
}\r
function renderFrame(i) {\r
  const f = FRAMES[i] || {};\r
  if (CONFIG.model === "response_error") {\r
    const err = f[CONFIG.fields.decision] === CONFIG.fields.errorState;\r
    $("frameMeta").innerHTML = "frame " + (i + 1) + " / " + FRAMES.length + "  ·  " + wallClock(i) + (err ? '  ·  <span class="alert">RESPONSE ERROR</span>' : "  ·  tracking");\r
    const ro = $("readouts"); ro.innerHTML = "";\r
    const show = [\r
      ["command", fmt(num(f, CONFIG.fields.demandLabel))],\r
      ["observed", fmt(num(f, CONFIG.fields.requested))],\r
      ["resp err", fmt(num(f, CONFIG.fields.error))],\r
      ["decision", err ? "resp err" : "tracking", err ? "alert" : ""],\r
    ];\r
    show.forEach(([k, val, cls]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b" + (cls ? ' class="' + cls + '"' : "") + ">" + (val ?? "--") + "</b>"; ro.appendChild(d); });\r
    $("rawFrame").textContent = JSON.stringify(f.raw ?? f, null, 2);\r
    drawGraph(i);\r
    return;\r
  }\r
  const clamping = isClamp(f);\r
  $("frameMeta").innerHTML = "frame " + (i + 1) + " / " + FRAMES.length + "  ·  " + wallClock(i) + (clamping ? '  ·  <span class="alert">CLAMP</span>' : "  ·  pass");\r
  const ro = $("readouts"); ro.innerHTML = "";\r
  const demandRaw = CONFIG.fields.demandLabel ? f[CONFIG.fields.demandLabel] : null;\r
  const show = [["demand", typeof demandRaw === "number" ? fmt(demandRaw) : demandRaw], ["request", fmt(num(f, CONFIG.fields.requested))], ["safe", fmt(num(f, CONFIG.fields.safe))]];\r
  if (CONFIG.fields.limit) show.push(["limit", fmt(num(f, CONFIG.fields.limit))]);\r
  show.push(["guard", clamping ? "clamp" : "pass", clamping ? "alert" : ""]);\r
  if (CONFIG.fields.violation) { const latched = boolf(f, CONFIG.fields.violation); show.push(["violation", latched ? "LATCHED" : "—", latched ? "alert" : ""]); }\r
  show.forEach(([k, val, cls]) => { const d = document.createElement("div"); d.innerHTML = "<span>" + k + "</span><b" + (cls ? ' class="' + cls + '"' : "") + ">" + (val ?? "--") + "</b>"; ro.appendChild(d); });\r
  $("rawFrame").textContent = JSON.stringify(f.raw ?? f, null, 2);\r
  drawGraph(i);\r
}\r
function seek(i) { curIndex = Math.max(0, Math.min(FRAMES.length - 1, i)); $("scrub").value = String(curIndex); renderFrame(curIndex); }\r
function play() {\r
  if (playTimer) { clearInterval(playTimer); playTimer = null; $("play").textContent = "Play"; return; }\r
  $("play").textContent = "Pause";\r
  playTimer = setInterval(() => { if (curIndex >= FRAMES.length - 1) { clearInterval(playTimer); playTimer = null; $("play").textContent = "Play"; return; } seek(curIndex + 1); }, 140);\r
}\r
$("play").addEventListener("click", play);\r
$("prev").addEventListener("click", () => seek(curIndex - 1));\r
$("next").addEventListener("click", () => seek(curIndex + 1));\r
$("scrub").addEventListener("input", (e) => seek(Number(e.target.value)));\r
\r
if (Array.isArray(FRAMES) && FRAMES.length) { render(); }\r
else { document.body.innerHTML = '<main><section class="panel"><h1>No frames</h1><p class="sub">This replay was exported without any trace frames.</p></section></main>'; }\r
<\/script>\r
</body>\r
</html>\r
`,b={courseTitle:"ARTY-001 Switch Guard — Virtual Verification Replay",contractRule:"safe_output never exceeds the safe_limit or the requested_output",fields:{demandLabel:"switch_bits",requested:"requested_output",safe:"safe_output",limit:"safe_limit",margin:"safety_margin",violation:"violation_latched",guardAction:"guard_action",clampValue:"clamp_to_safe_output",button:"button_pressed"},contractCeilings:["safe_limit","requested_output"],trackLimitMoves:!0,traces:[{key:"requested_output",label:"request",color:"#f7b267",width:2},{key:"safe_output",label:"safe",color:"#8ee0b2",width:4},{key:"safe_limit",label:"limit",color:"#ffd166",width:1,dashed:!0}],provenance:[{key:"board_id",label:"Board"},{key:"kernel_id",label:"Kernel"},{key:"schema_version",label:"Schema"},{key:"source_mode",label:"Source"}],liveSourceValue:"live_board",buttonOnMessage:"Surge asserted (BTN0) — demand pushed over the limit.",buttonOffMessage:"Surge released (BTN0).",rubric:[{label:"Demand ramped toward full",test:{type:"maxAtLeast",field:"requested_output",value:.95}},{label:"Guard clamp engaged",test:{type:"eventAtLeast",event:"CLAMP",n:1}},{label:"Violation latched",test:{type:"eventAtLeast",event:"VIOLATION LATCHED",n:1}},{label:"Violation cleared (BTN3)",test:{type:"eventAtLeast",event:"VIOLATION CLEARED",n:1}},{label:"Surge applied (BTN0)",test:{type:"anyTrue",field:"button_pressed"}},{label:"Safe limit moved (BTN1/BTN2)",test:{type:"eventAtLeast",event:["LIMIT UP","LIMIT DOWN"],n:1}}],disclaimers:["Volatile FPGA programming."],about:{heading:"About this guard — and how to drive it",lede:"Promise: the safe output never exceeds the safe limit or the demand.",sections:[{h:"Real life",body:"Motor / power / heater / actuator ceilings held below a safe maximum."},{h:"Use it",body:"A last-line interlock between a controller and a power stage."}],operate:{intro:"Operating the contract",rows:[["SW0–SW3","set the demand"],["BTN0","surge the demand over the limit"],["BTN1 / BTN2","raise / lower the safe limit"],["BTN3","acknowledge a latched violation"]]}}};function y(e){return e.map(r=>({schema_version:r.schema_version,sample_index:r.sample_index,timestamp_ms:r.timestamp_ms,switch_bits:r.switch_bits,source_mode:r.source_mode,board_id:"— (virtual)",kernel_id:r.kernel_sha256,button_pressed:r.button_pressed,requested_output:r.guard.requested_output,safe_output:r.guard.safe_output,safe_limit:r.guard.limit,safety_margin:r.guard.safety_margin,violation_latched:r.guard.violation_latched,guard_action:r.guard.guard_action}))}function M(e){return{captured_at:e.toISOString(),device:"Browser FPGA simulator (Arty A7 model)",source:"virtual://arty001-switch-guard-sim",virtual:!0}}function T(e){return(e.skeleton??C).replace('"__FRAMES__"',()=>JSON.stringify(e.frames)).replace('"__CONFIG__"',()=>JSON.stringify(e.config)).replace('"__META__"',()=>JSON.stringify(e.meta))}function L(e){const r=a=>"{"+Object.keys(a).sort().map(o=>JSON.stringify(o)+":"+JSON.stringify(a[o])).join(",")+"}";return e.map(r).join(`
`)+`
`}async function N(e){const r=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e));return Array.from(new Uint8Array(r)).map(a=>a.toString(16).padStart(2,"0")).join("")}async function x(e,r,a){const o=await N(L(e)),t={...M(a),trace_sha256:o};return T({frames:e,config:r,meta:t})}async function D(e,r){const a={...b,disclaimers:[...b.disclaimers,"Browser simulation — candidate-only; no Arty A7 was programmed or observed."]};return x(y(e),a,r)}const h={courseTitle:"Reflex Lab 01 — ESP32 Guard Virtual Replay",contractRule:"safe_output never exceeds the requested_output (the guard only reduces)",fields:{demandLabel:"pot_raw",requested:"requested_output",safe:"safe_output",limit:null,margin:"safety_margin",violation:null,guardAction:"guard_action",clampValue:"clamp_to_safe_output",button:"button_pressed"},contractCeilings:["requested_output"],trackLimitMoves:!1,traces:[{key:"pot_raw",label:"pot",color:"#7bdcff",width:2},{key:"requested_output",label:"request",color:"#ffb86b",width:2},{key:"safe_output",label:"safe",color:"#83e6ac",width:4}],provenance:[{key:"board_id",label:"Board"},{key:"kernel_id",label:"Kernel"},{key:"schema_version",label:"Schema"},{key:"source_mode",label:"Source"}],liveSourceValue:"live_board",deviceSignals:[{key:"led",label:"LED",onAt:.03},{key:"buzzer",label:"Buzzer",onAt:.03}],rubric:[{label:"Input swept toward full",test:{type:"maxAtLeast",field:"pot_raw",value:.85}},{label:"Guard clamp engaged",test:{type:"eventAtLeast",event:"CLAMP",n:1}},{label:"LED driven",test:{type:"maxAtLeast",field:"led",value:.5}},{label:"Buzzer activated",test:{type:"maxAtLeast",field:"buzzer",value:.5}},{label:"Mute button used",test:{type:"anyTrue",field:"button_pressed"}}],disclaimers:["Low-voltage educational evidence only."],about:{heading:"About this guard — and how to drive it",lede:"Firmware promise: output never exceeds the request; the guard only reduces.",sections:[{h:"Real life",body:"A dimmer / motor / setpoint capped before the load."}],operate:{intro:"Operating the contract",rows:[["Potentiometer","set the demand"],["Button","mute the buzzer"]]}}};function k(e){return e.map(r=>({schema_version:r.schema_version,sample_index:r.sample_index,timestamp_ms:r.timestamp_ms,pot_raw:r.pot_raw,source_mode:"browser_sim",board_id:"— (virtual)",kernel_id:r.kernel_id,button_pressed:r.button_pressed??!1,requested_output:r.outputs.requested_output,safe_output:r.outputs.safe_output,led:r.outputs.led,buzzer:r.outputs.buzzer,safety_margin:r.guard.safety_margin,guard_action:r.guard.guard_action}))}async function j(e,r){const a={...h,disclaimers:[...h.disclaimers,"Browser simulation — candidate-only; low-voltage educational evidence, not a hardware capture."]};return x(k(e),a,r)}function K(e){return e.toISOString().replace("T","_").replace(/[:.]/g,"-").slice(0,19)}const c=600,u=180,g=26,m=u+g,l=14,I=80,v=90,R={lines:[{key:"safe_limit",color:"#ffd166",width:2,dashed:!0},{key:"safety_margin",color:"#c4b5fd",width:2,dashed:!1},{key:"requested_output",color:"#f7b267",width:2,dashed:!1},{key:"safe_output",color:"#8ee0b2",width:4,dashed:!1}],legend:[{label:"request",color:"#f7b267",dashed:!1,width:2},{label:"safe",color:"#8ee0b2",dashed:!1,width:3},{label:"limit",color:"#ffd166",dashed:!0,width:2},{label:"margin",color:"#c4b5fd",dashed:!1,width:2}]},O={lines:[{key:"pot_raw",color:"#7bdcff",width:2,dashed:!1},{key:"requested_output",color:"#ffb86b",width:2,dashed:!1},{key:"safe_output",color:"#83e6ac",width:4,dashed:!1},{key:"buzzer",color:"#a893ff",width:2,dashed:!1},{key:"button_pressed",color:"#ff9d9d",width:2,dashed:!0}],legend:[{label:"pot",color:"#7bdcff",dashed:!1,width:2},{label:"request",color:"#ffb86b",dashed:!1,width:2},{label:"safe",color:"#83e6ac",dashed:!1,width:3},{label:"buzzer",color:"#a893ff",dashed:!1,width:2},{label:"btn",color:"#ff9d9d",dashed:!0,width:2}]};function G(e){return Math.max(0,Math.min(1,e))}function z(e){return e.guard_action==="clamp_to_safe_output"}function H(e,r,a,o){const t=Math.max(1,r.length-1),s=(c-l*2)/t;e.fillStyle="#00080c",e.fillRect(0,0,c,u),e.fillStyle="rgba(255,122,122,0.16)";for(let i=0;i<=a;i++)if(z(r[i])){const n=l+i/t*(c-l*2);e.fillRect(n-s/2,l,s+1,u-l*2)}e.strokeStyle="rgba(216,232,228,0.09)",e.lineWidth=1;for(let i=0;i<=4;i++){const n=l+i/4*(u-l*2);e.beginPath(),e.moveTo(l,n),e.lineTo(c-l,n),e.stroke()}for(const i of o.lines){e.beginPath(),e.setLineDash(i.dashed?[5,4]:[]);for(let n=0;n<=a;n++){const p=l+n/t*(c-l*2),f=u-l-G(Number(r[n][i.key])||0)*(u-l*2);n===0?e.moveTo(p,f):e.lineTo(p,f)}e.strokeStyle=i.color,e.lineWidth=i.width,e.lineCap="round",e.stroke()}e.setLineDash([]);const d=l+a/t*(c-l*2);e.strokeStyle="rgba(255,242,166,0.7)",e.lineWidth=1,e.beginPath(),e.moveTo(d,l-6),e.lineTo(d,u-l+6),e.stroke()}function P(e,r,a){const o=u;e.fillStyle="#0a1620",e.fillRect(0,o,c,g),e.strokeStyle="rgba(216,232,228,0.12)",e.lineWidth=1,e.beginPath(),e.moveTo(0,o+.5),e.lineTo(c,o+.5),e.stroke();const t=o+g/2;e.textBaseline="middle",e.font="600 11px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.textAlign="left";let s=12;for(const n of a)e.strokeStyle=n.color,e.lineWidth=n.width,e.setLineDash(n.dashed?[4,3]:[]),e.beginPath(),e.moveTo(s,t),e.lineTo(s+16,t),e.stroke(),e.setLineDash([]),s+=21,e.fillStyle="#aebfbb",e.fillText(n.label,s,t),s+=e.measureText(n.label).width+14;let d=c-12;e.textAlign="right",e.font="800 10px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.fillStyle="#ff9d9d",e.fillText("VIRTUAL",d,t),d-=e.measureText("VIRTUAL").width+9,e.font="600 11px ui-monospace, 'SFMono-Regular', Menlo, monospace",e.fillStyle="#7d918d";const i="monogatelectronics ·";e.fillText(i,d,t),d-=e.measureText(i).width+8,r&&e.drawImage(r,d-18,t-18/2,18,18)}async function $(){try{const e=new Image;return e.src="/electronics-lab/assets/monogatelogo.png",await e.decode(),e}catch{return null}}function q(e,r){if(e<=r)return Array.from({length:e},(t,s)=>s);const a=[],o=(e-1)/(r-1);for(let t=0;t<r;t++)a.push(Math.round(t*o));return a[a.length-1]=e-1,a}function B(e,r,a){const o=document.createElement("canvas");o.width=c,o.height=m;const t=o.getContext("2d",{willReadFrequently:!0});if(!t)throw new Error("2D canvas context unavailable");const s=A(),d=q(e.length,I);return d.forEach((i,n)=>{H(t,e,i,r),P(t,a,r.legend);const{data:p}=t.getImageData(0,0,c,m),f=E(p,256),_=F(p,f),S=n===d.length-1?v*8:v;s.writeFrame(_,c,m,{palette:f,delay:S})}),s.finish(),s.bytes()}async function w(e,r,a){if(e.length===0)return;const o=await $(),t=B(e,r,o),s=new Uint8Array(t.length);s.set(t);const d=new Blob([s],{type:"image/gif"}),i=URL.createObjectURL(d),n=document.createElement("a");n.href=i,n.download=a,n.click(),URL.revokeObjectURL(i)}function U(e,r){return w(y(e),R,r)}function W(e,r){return w(k(e),O,r)}export{j as a,D as b,W as c,U as e,K as r};
