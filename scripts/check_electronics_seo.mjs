#!/usr/bin/env node
// scripts/check_electronics_seo.mjs
//
// Guards the server-side SEO injection for the /electronics SPA.
//
// Motivation: /electronics is a Vite-built client-side app whose served shell
// is ~900 bytes of `<div id="root"></div>`. Before 2026-07-25 that meant every
// crawler, link unfurler, and LLM agent fetching the page got a blank document
// — while app/sitemap.ts pointed indexers at /electronics and three subroutes
// at priority 0.7-0.9. app/electronics/[[...slug]]/seo.ts now injects a
// per-route <title>, meta/OG tags, and a <noscript> summary.
//
// Three ways that regresses silently, all checked here:
//   1. The shell is synced in from the monogate-electronics repo by
//      scripts/sync_electronics_lab_public.py. injectSeo() fails open on
//      missing markers, so a shell reformat would quietly stop injection
//      without breaking the page.
//   2. A new path added to app/sitemap.ts with no ROUTE_SEO entry falls back
//      to the generic description — indexable, but duplicated across routes.
//   3. The landing page's boundary line drifts from SOURCE.json. Until
//      2026-09-12 it was typed as "Hardware observed: false" while SOURCE.json
//      recorded board captures on the FPGA track.
//
// Implementation: transpiles seo.ts with the repo's own `typescript` dep (Node
// 18 has no type stripping) and exercises injectSeo() directly. No network, no
// dev server, no browser — runs on a clean checkout in CI.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SEO_TS = path.join(ROOT, "app", "electronics", "[[...slug]]", "seo.ts");
const SHELL = path.join(ROOT, "public", "electronics-lab", "index.html");
const SOURCE_JSON = path.join(ROOT, "public", "electronics-lab", "SOURCE.json");
const SITEMAP_TS = path.join(ROOT, "app", "sitemap.ts");

const MAX_DESCRIPTION = 160; // Google truncates around here.
const MIN_DESCRIPTION = 50;

const failures = [];
const notes = [];
const fail = (msg) => failures.push(msg);

async function loadSeoModule() {
  const source = fs.readFileSync(SEO_TS, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const tmp = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), "electronics-seo-")),
    "seo.mjs"
  );
  fs.writeFileSync(tmp, outputText);
  return import(tmp);
}

// Since 2026-09-12 app/sitemap.ts lists the Electronics Lab as
// Object.keys(ROUTE_SEO), so every sitemap path has its own entry by
// construction. What can still drift is the sitemap no longer doing that: then
// this returns nothing and section 2 fails.
function sitemapElectronicsPaths(routeSeo) {
  return fs.readFileSync(SITEMAP_TS, "utf8").includes("Object.keys(ROUTE_SEO)") ? Object.keys(routeSeo) : [];
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const { injectSeo, seoForPath, normalizePath, ROUTE_SEO, boundaryText } = await loadSeoModule();
// The landing page's no-JS boundary is built from SOURCE.json, which route.ts
// imports at build time. The same file is passed here.
const LAB_SOURCE = JSON.parse(fs.readFileSync(SOURCE_JSON, "utf8"));

// --- 1. The synced shell still has the markers injectSeo() keys off of ------
const shell = fs.readFileSync(SHELL, "utf8");
for (const marker of ["</head>", "</body>", "<title>"]) {
  if (!shell.includes(marker)) {
    fail(`SPA shell ${path.relative(ROOT, SHELL)} has no ${marker} — injectSeo() fails open and silently stops injecting.`);
  }
}

// --- 2. Every sitemap path resolves to its own entry, not the fallback -----
const fallback = seoForPath("/electronics/definitely-not-a-real-route");
const sitemapPaths = sitemapElectronicsPaths(ROUTE_SEO);
if (sitemapPaths.length === 0) {
  fail("Found no /electronics paths in app/sitemap.ts — did the sitemap format change?");
}
for (const p of sitemapPaths) {
  const seo = seoForPath(p);
  if (seo.title === fallback.title) {
    fail(`${p} is in the sitemap but has no ROUTE_SEO entry (falls back to the generic description). Add one in seo.ts, keyed "${normalizePath(p)}".`);
  }
}

// --- 3. Injected output is well-formed for every checked route -------------
// Every mapped route, not just the sitemap ones — an entry that is only
// reachable by in-app navigation still gets shared and unfurled. Deduped by
// normalized path so a mixed-case path is not compared against its own
// lowercase key and reported as a duplicate title.
const checked = [...
  new Map(
    [...Object.keys(ROUTE_SEO), ...sitemapPaths, "/electronics"].map((p) => [normalizePath(p), p])
  ).values(),
];
const seenTitles = new Map();
const seenDescriptions = new Map();

for (const p of checked) {
  const html = injectSeo(shell, p, LAB_SOURCE);
  const seo = seoForPath(p);
  const canonical = `https://monogate.dev${normalizePath(p)}`;

  const required = [
    [`<title>`, `<title>`],
    [`meta name="description"`, `<meta name="description"`],
    [`canonical`, `<link rel="canonical" href="${canonical}"`],
    [`og:title`, `<meta property="og:title"`],
    [`og:description`, `<meta property="og:description"`],
    [`og:url`, `<meta property="og:url" content="${canonical}"`],
    [`og:image`, `<meta property="og:image"`],
    [`twitter:card`, `<meta name="twitter:card"`],
    [`noscript`, `<noscript>`],
  ];
  for (const [label, needle] of required) {
    if (!html.includes(needle)) fail(`${p}: injected HTML is missing ${label}.`);
  }

  if (!html.includes(`<title>${seo.title}</title>`)) {
    fail(`${p}: <title> was not rewritten to the route title (still the shell default?).`);
  }
  if (html.includes("MGElectronics Lab")) {
    fail(`${p}: the shell's hardcoded "MGElectronics Lab" title survived injection.`);
  }
  if (!/<noscript>[\s\S]*<h1>/.test(html)) {
    fail(`${p}: <noscript> block has no <h1> for crawlers to read.`);
  }

  // Length bounds — an over-long description is truncated mid-sentence in SERPs.
  const len = seo.description.length;
  if (len > MAX_DESCRIPTION) {
    fail(`${p}: description is ${len} chars, over the ${MAX_DESCRIPTION} limit.`);
  } else if (len < MIN_DESCRIPTION) {
    fail(`${p}: description is only ${len} chars — too thin to be useful.`);
  }

  // Duplicate title/description across routes reads as duplicate content.
  const titleDupe = seenTitles.get(seo.title);
  if (titleDupe) fail(`${p} and ${titleDupe} share the title "${seo.title}".`);
  else seenTitles.set(seo.title, p);

  const descDupe = seenDescriptions.get(seo.description);
  if (descDupe) fail(`${p} and ${descDupe} share the same description.`);
  else seenDescriptions.set(seo.description, p);

  notes.push(`  ${p} → "${seo.title}" (${len} chars)`);
}

// --- 4. Unknown routes still degrade gracefully ----------------------------
const unknown = injectSeo(shell, "/electronics/esp32/courses/some-future-course", LAB_SOURCE);
if (!unknown.includes("<noscript>") || !unknown.includes('<meta name="description"')) {
  fail("An unmapped /electronics/* route produced no noscript/description — the fallback path is broken.");
}

// --- 5. The landing boundary says what SOURCE.json records -----------------
const boundary = boundaryText(LAB_SOURCE);
if (!injectSeo(shell, "/electronics", LAB_SOURCE).includes(escapeHtml(boundary))) {
  fail("/electronics: the no-JS page does not carry the boundary line boundaryText() builds from SOURCE.json.");
}
for (const track of Object.values(LAB_SOURCE.hardware_evidence.tracks)) {
  const saysObserved = boundary.includes(`Hardware observed on ${track.label}:`);
  if (saysObserved !== Boolean(track.hardware_observed)) {
    fail(`/electronics: SOURCE.json records ${track.label} hardware_observed=${track.hardware_observed}; the boundary line disagrees.`);
  }
}
notes.push(`  boundary: ${boundary}`);

// --- report ---------------------------------------------------------------
console.log(`Checked ${checked.length} electronics routes:`);
console.log(notes.join("\n"));

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\n✓ electronics SEO injection OK");
