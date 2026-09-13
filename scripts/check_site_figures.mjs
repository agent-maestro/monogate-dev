#!/usr/bin/env node
// scripts/check_site_figures.mjs
//
// A number on monogate.dev must match what measures it, and a claim retired as
// false must not come back.
//
// Motivation: from 2026-06-16 to 2026-09-12 the homepage said "108 EML kernels
// -- Lean-verified in MachLib" and "Every kernel ships with a Lean proof".
// Nothing measured 108. The standard library that ships inside the compiler
// carries no @verify contract at all, and eml-stdlib's `hann_in_unit_interval`
// still depends on sorryAx. machlib and forge each keep a prose-count gate
// (tools/prose_counts_check.py) that fails when a figure in a document drifts
// from the command that measures it -- machlib's caught 485 -> 506 and
// 764 -> 795 in its own CLAUDE.md. This is that doctrine for the site.
//
// REGISTRY: scripts/site_figures.json
//   claims  -- a file, a regex whose first group is the figure as written, a
//              source, and a relation: `equal`, or `floor` for a figure written
//              "N+" (the source must be at least N).
//   sources -- `url` fetches text and extracts a number with a regex or, with
//              `entries`, counts that regex's matches inside the first group
//              (the items of a tuple). Each URL is fetched once per run.
//              `count` counts regex matches in a repo file.
//   retired -- phrases that were false on the site, each with why. Matched as
//              whole words, case-insensitively, one line at a time, in app/
//              and lib/; a phrase split across two source lines is not seen.
//              `allow` pins one reviewed line -- a file and a substring of
//              that line -- where the phrase makes a narrower claim. The hit is
//              printed; another use of the phrase in the same file still fails,
//              and an allowance that stops matching fails too.
//
// A claim whose pattern stops matching FAILS: the figure moved or was reworded,
// and a claim that matches nothing checks nothing. To put a number on a page,
// register it in the same change, or it is unchecked.
//
// Canaries run first: drift, a broken floor, an unmatched pattern, a retired
// phrase, a counted region that is empty or gone, and an unreachable source
// must each be caught, or no verdict is given.
//
// Exit: 0 pass | 1 drift, unmatched claim, retired phrase, or canary failure |
//       2 a source could not be evaluated -- never a pass.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY = path.join(__dirname, "site_figures.json");
const SCAN_DIRS = ["app", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const FETCH_TIMEOUT_MS = 20_000;

class Unavailable extends Error {}

/** "7 672", "7 672", "7,672" -> 7672; anything that is not a whole number -> null. */
function parseFigure(text) {
  const digits = String(text).replace(/[\s  ,]/g, "");
  return /^\d+$/.test(digits) ? Number(digits) : null;
}

function holds(relation, written, measured) {
  if (relation === "equal") return written === measured;
  if (relation === "floor") return measured >= written;
  throw new Error(`unknown relation ${JSON.stringify(relation)}`);
}

async function measure(source) {
  if (source.kind === "count") {
    let text;
    try {
      text = fs.readFileSync(path.join(ROOT, source.file), "utf8");
    } catch (err) {
      throw new Unavailable(`cannot read ${source.file}: ${err.message}`);
    }
    return [...text.matchAll(new RegExp(source.pattern, `g${source.flags ?? ""}`))].length;
  }
  if (source.kind === "url") {
    let text;
    try {
      text = await fetchText(source.url);
    } catch (err) {
      throw new Unavailable(`cannot fetch ${source.url}: ${err.message}`);
    }
    return figureFromText(source, text);
  }
  throw new Error(`unknown source kind ${JSON.stringify(source.kind)}`);
}

// Several sources read the same file (superbest.py, monogate.org's
// superbest.json), so each URL is fetched once per run.
const fetched = new Map();

function fetchText(url) {
  if (!fetched.has(url)) {
    fetched.set(
      url,
      fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      }),
    );
  }
  return fetched.get(url);
}

/**
 * The figure a `url` source reads from its text: the whole number in the first
 * group of `extract` or, when `entries` is set, how many times `entries` matches
 * inside that group (the items of a tuple, say). A region with no entry is a
 * pattern that stopped matching, not a count of zero, so it is UNAVAILABLE.
 */
function figureFromText(source, text) {
  const match = new RegExp(source.extract, source.flags ?? "").exec(text);
  if (!match || match[1] === undefined) {
    throw new Unavailable(`${source.url} no longer has a match for /${source.extract}/`);
  }
  if (source.entries !== undefined) {
    const found = [...match[1].matchAll(new RegExp(source.entries, "g"))].length;
    if (found === 0) throw new Unavailable(`${source.url}: /${source.entries}/ matches nothing inside /${source.extract}/`);
    return found;
  }
  const value = parseFigure(match[1]);
  if (value === null) throw new Unavailable(`${source.url} no longer has a figure matching /${source.extract}/`);
  return value;
}

/** Problems with one claim against one file's text; empty when it holds. */
function checkClaim(claim, text, measured) {
  const relation = claim.relation ?? "equal";
  const matches = [...text.matchAll(new RegExp(claim.pattern, `g${claim.flags ?? ""}`))];
  if (matches.length === 0) {
    return [`${claim.id}: /${claim.pattern}/ no longer matches ${claim.file} -- the figure moved or was reworded; update the registry`];
  }
  const problems = [];
  for (const match of matches) {
    const written = parseFigure(match[1]);
    if (written === null) {
      problems.push(`${claim.id}: matched "${match[0]}" but its first group is not a whole number`);
    } else if (!holds(relation, written, measured)) {
      const shown = relation === "floor" ? `${match[1]}+` : match[1];
      problems.push(`${claim.id}: ${claim.file} says ${shown}; the source measures ${measured}`);
    }
  }
  return problems;
}

function phraseRegex(phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i");
}

/** Lines holding a retired phrase as a whole word: failures, and hits in allowed files. */
function retiredHits(rel, text, retired) {
  const hits = [];
  const allowed = [];
  const lines = text.split("\n");
  for (const entry of retired) {
    const re = phraseRegex(entry.phrase);
    lines.forEach((line, i) => {
      if (!re.test(line)) return;
      const where = `${rel}:${i + 1}`;
      // An allowance excuses one reviewed line, not the file: a second use of
      // the phrase in the same file is a new claim and must be read on its own.
      const allowance = (entry.allow ?? []).find((a) => a.file === rel && a.line && line.includes(a.line));
      if (allowance) allowed.push({ where, phrase: entry.phrase, file: rel, line: allowance.line, reason: allowance.reason });
      else hits.push(`${where}: retired claim "${entry.phrase}" -- ${entry.why}`);
    });
  }
  return { hits, allowed };
}

async function runCanaries() {
  const failures = [];
  const expect = (name, ok) => {
    if (!ok) failures.push(name);
  };
  expect("an equal figure that differs is drift", holds("equal", 6, 7) === false);
  expect("an equal figure that matches holds", holds("equal", 6, 6) === true);
  expect("a floor holds while the source is above it", holds("floor", 7600, 7672) === true);
  expect("a floor fails once the source falls below it", holds("floor", 7600, 7599) === false);
  expect(
    "spaces, thin spaces and commas parse as one number",
    parseFigure("7 672") === 7672 && parseFigure("7 672") === 7672 && parseFigure("7,672") === 7672,
  );
  expect("a claim whose pattern matches nothing fails", checkClaim({ id: "c", file: "f", pattern: "(\\d+) widgets" }, "no figures here", 3).length === 1);
  expect("a drifted claim fails", checkClaim({ id: "c", file: "f", pattern: "(\\d+) lessons" }, "6 lessons", 7).length === 1);
  expect("a matching claim passes", checkClaim({ id: "c", file: "f", pattern: "(\\d+) lessons" }, "6 lessons", 6).length === 0);
  expect(
    "a retired phrase is found whatever its case",
    retiredHits("f", "ok\nEvery kernel SHIPS WITH A LEAN proof", [{ phrase: "ships with a Lean", why: "" }]).hits.length === 1,
  );
  // This gate's first run flagged "Forge proof-carrying", "Forge produce" and
  // "Forge profile" as the retired "Forge Pro". A substring match convicts the
  // innocent, so phrases match whole words only.
  expect(
    "a phrase inside a longer word is not a hit",
    retiredHits("f", "the Forge proof-carrying suite; let Forge produce it", [{ phrase: "Forge Pro", why: "" }]).hits.length === 0,
  );
  const allowT19 = [{ phrase: "Lean-verified", why: "", allow: [{ file: "a.tsx", line: "T19 (Lean-verified)", reason: "r" }] }];
  expect(
    "the pinned line in an allowed file is reported as allowed, not as a failure",
    (() => {
      const r = retiredHits("a.tsx", "T19 (Lean-verified)", allowT19);
      return r.hits.length === 0 && r.allowed.length === 1;
    })(),
  );
  // Found in review: allowances were once per FILE, so a new broad claim in an
  // allowed file was excused under the old line's reason.
  expect(
    "a different line in an allowed file is still a hit",
    retiredHits("a.tsx", "T19 (Lean-verified)\nAll 108 kernels are Lean-verified.", allowT19).hits.length === 1,
  );
  // Added 2026-09-13 with the first counted sources: "8-op basket" on /superbest
  // is the length of a tuple in superbest.py, not a number written there.
  const counted = { url: "u", extract: "^POS = \\(([^)]*)\\)", flags: "m", entries: '"\\w+"' };
  expect(
    "a counted source reads the entries inside its region, not the file's",
    figureFromText(counted, 'POS = (\n    "exp", "ln", "neg",\n)\nGEN = ("exp", "abs")\n') === 3,
  );
  const unavailableFrom = (text) => {
    try {
      figureFromText(counted, text);
      return false;
    } catch (err) {
      return err instanceof Unavailable;
    }
  };
  expect("a counted region that holds no entry is UNAVAILABLE, not zero", unavailableFrom("POS = ()\n"));
  expect("a counted region that is gone is UNAVAILABLE", unavailableFrom('GEN = ("exp")\n'));
  try {
    await measure({ kind: "url", url: "http://127.0.0.1:9/", extract: "(\\d+)" });
    failures.push("an unreachable source is UNAVAILABLE, not a value");
  } catch (err) {
    expect("an unreachable source is UNAVAILABLE, not a value", err instanceof Unavailable);
  }
  return failures;
}

function* sourceFiles(dir) {
  // A scan root that does not exist holds nothing to check: lib/ went with the
  // 2026-09-12 product-wave archive. It stays in SCAN_DIRS, so a lib/ that comes
  // back is scanned without anyone having to remember to re-add it.
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield full;
  }
}

async function main() {
  const registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));

  const canaryFailures = await runCanaries();
  if (canaryFailures.length) {
    console.error("CANARY FAILURE -- the instrument is broken, so no verdict is reported:");
    for (const f of canaryFailures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("canaries: every one caught what it plants");

  const measured = new Map();
  const unavailable = [];
  for (const id of new Set(registry.claims.map((c) => c.source))) {
    const source = registry.sources[id];
    if (!source) {
      console.error(`registry error: source "${id}" is used by a claim but not defined`);
      process.exit(1);
    }
    try {
      measured.set(id, await measure(source));
    } catch (err) {
      if (!(err instanceof Unavailable)) throw err;
      unavailable.push(`${id}: ${err.message}`);
    }
  }

  const problems = [];
  for (const claim of registry.claims) {
    if (!measured.has(claim.source)) {
      console.log(`UNAVAILABLE ${claim.id}`);
      continue;
    }
    const text = fs.readFileSync(path.join(ROOT, claim.file), "utf8");
    const found = checkClaim(claim, text, measured.get(claim.source));
    problems.push(...found);
    const verdict = found.length ? "DRIFT" : "OK   ";
    console.log(`${verdict} ${claim.id.padEnd(34)} source ${claim.source} = ${measured.get(claim.source)} (${claim.relation ?? "equal"})`);
  }

  const retired = registry.retired ?? [];
  const allowedHits = [];
  for (const dir of SCAN_DIRS) {
    for (const file of sourceFiles(path.join(ROOT, dir))) {
      const { hits, allowed } = retiredHits(path.relative(ROOT, file), fs.readFileSync(file, "utf8"), retired);
      problems.push(...hits);
      allowedHits.push(...allowed);
    }
  }
  for (const a of allowedHits) console.log(`ALLOWED ${a.where}: "${a.phrase}" -- ${a.reason}`);
  // An allowance that no longer matches anything is stale; left in place it
  // would excuse the phrase if it came back to that file.
  for (const entry of retired) {
    for (const allowance of entry.allow ?? []) {
      if (!allowance.line) {
        problems.push(`registry: the allowance for "${entry.phrase}" in ${allowance.file} has no \`line\`; a file-wide allowance would excuse every future use`);
        continue;
      }
      const used = allowedHits.some((a) => a.phrase === entry.phrase && a.file === allowance.file && a.line === allowance.line);
      if (!used) problems.push(`stale allowance: "${entry.phrase}" is no longer on the pinned line in ${allowance.file}; remove the allow entry`);
    }
  }

  if (problems.length) {
    console.error(`\nFAIL -- ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
  }
  if (unavailable.length) {
    console.error("\nUNAVAILABLE (not a pass):");
    for (const u of unavailable) console.error(`  - ${u}`);
  }
  if (problems.length) process.exit(1);
  if (unavailable.length) process.exit(2);
  console.log(`PASS -- ${registry.claims.length} figures match their sources; ${(registry.retired ?? []).length} retired claims stay retired`);
}

await main();
