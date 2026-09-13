#!/usr/bin/env node
// scripts/check_lesson_proofs.mjs
//
// A lesson that says a theorem is proved, or is not, quotes two outputs: what
// `eml-compile ... --target lean` emits for the lesson's own source, and what
// Lean's `#print axioms` then reports for it against MachLib. Neither output is
// in any repository, so neither can be a claim in scripts/lean_claims.json.
// This re-derives both before every deploy.
//
// Motivation: on 2026-09-12 the lessons said "pid_is_bounded is proved",
// "guard_output_bounded is proved (checked 2026-09-12 with #print axioms)" and
// "saturated_in_range and safe_output_bounded are proved". The verdicts were
// right that day, and nothing re-checked them: check_site_commands.mjs reads
// only exit status, and a dated note is not a check. A new monogate-forge
// release, or a MachLib change, could flip any of them unseen.
//
// THE RULE. Every verdict in scripts/lesson_proofs.json holds now:
//   * each of its `lines` still appears in its page file, and every
//     "monogate-forge X.Y.Z" inside one names the compiler this run used;
//   * its `source` is a source the page shows and its `command` an
//     `eml-compile <source> --target lean -o <file>` command the page shows,
//     both read by check_site_commands.mjs's own extractor. Each `edits` entry
//     (a change the lesson tells the reader to make) finds its text in the
//     source exactly once, and its replacement is written on the page;
//   * run as shown, with the compiler a reader installs (the newest
//     monogate-forge on PyPI, the venv check_site_commands.mjs keeps), the
//     command writes a Lean file;
//   * that file, with `#print axioms <theorem>` appended, compiles under
//     `lake env lean` in ../machlib/foundations, and the theorem's report has
//     no sorryAx for verdict "proved", has sorryAx for "not_proved", and, when
//     `quoted`, equals every report the page quotes for that theorem.
// MachLib is the checkout at ../machlib. Its MachLib/ tree must be committed
// (the run prints the sha a reader can check out), and `lake build --no-build`
// must find the build of every module the emitted files import current. This
// gate never builds.
//
// COVERAGE, BOTH DIRECTIONS.
//   * A line under app/ or lib/ that says "not proved", or that an output
//     "shows sorryAx", must hold a registered line or a `generic` entry, which
//     gives its reason. ("is proved" and "are proved" are labels of
//     scripts/lean_claims.json, which exempts the lesson lines citing this
//     check.) A phrase split across two source lines is not seen: register the
//     line that carries the verdict.
//   * An exemption in scripts/lean_claims.json whose reason cites
//     check_lesson_proofs must name a line registered here, so no exemption
//     points at a gate that does not cover it.
//
// CODES
//   STALE_LINE         a registered or generic line is no longer in its file
//   VERSION            a registered line names a monogate-forge this run did not use
//   NO_SOURCE          the page shows no source by that name
//   NO_COMMAND         the page shows no such command, or it is not <source> --target lean -o <file>
//   STALE_EDIT         an edit's text is not in the source exactly once, or its replacement is not on the page
//   COMPILE_FAILED     eml-compile exited non-zero or wrote no file
//   LEAN_ERROR         Lean reported an error outside the appended #print axioms lines
//   NOT_DECLARED       no axiom report: the emitted Lean does not declare the theorem
//   SORRY              registered as proved, and the report has sorryAx
//   PROVED             registered as not proved, and the report has no sorryAx
//   QUOTE              a report the page quotes differs from Lean's, or the page quotes none
//   UNREGISTERED       a verdict line under app/ or lib/ that no entry covers
//   UNGATED_EXEMPTION  a lean_claims.json exemption cites this check for a line not registered here
//   UNAVAILABLE        PyPI, lake or machlib missing, MachLib/ uncommitted, a stale build, or a
//                      timeout: exit 2, never a pass
//
// Canaries run first, against the same compiler and MachLib, on a planted page:
// every code but UNAVAILABLE must fire on its canary and two controls must stay
// green, or no verdict is reported. `--self-test` runs only the canaries.
//
// Exit: 0 every verdict holds | 1 a verdict or canary failed | 2 could not evaluate.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { extract, shellWords, resolveCompiler, Unavailable } from "./check_site_commands.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY = path.join(__dirname, "lesson_proofs.json");
const LEAN_CLAIMS = path.join(__dirname, "lean_claims.json");
const MACHLIB = path.resolve(ROOT, "..", "machlib", "foundations");
const SCAN_DIRS = ["app", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const COMPILE_TIMEOUT_MS = 180_000;
const LEAN_TIMEOUT_MS = 1_800_000;
const LAKE_TIMEOUT_MS = 600_000;
const VERDICT_LINE = [/\bnot proved\b/i, /\bshows\s+(?:<Inline>)?sorryAx\b/i];
const VERSION_IN_LINE = /monogate-forge (\d+\.\d+\.\d+)/g;
const CITES_THIS_CHECK = /check_lesson_proofs/;
const VERDICTS = new Set(["proved", "not_proved"]);
// Git exports GIT_DIR and friends to hooks; under one, `git -C <repo>` still
// reads the hook's repository. Every git and lake call here drops them.
const CLEAN_ENV = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")));

const decodeJsx = (s) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const occurrences = (text, needle) => text.split(needle).length - 1;

function compilerVersion(bin) {
  const r = spawnSync(bin, ["--version"], { encoding: "utf8" });
  const m = /(\d+\.\d+\.\d+)/.exec(`${r.stdout ?? ""}${r.stderr ?? ""}`);
  if (r.status !== 0 || !m) throw new Unavailable(`${bin} --version did not report a version`);
  return m[1];
}

/** The machlib sha the verdicts are checked against. */
function machlibRevision(project) {
  if (!fs.existsSync(path.join(project, "lean-toolchain"))) {
    throw new Unavailable(`${project} has no lean-toolchain: clone machlib beside this repository and run lake build`);
  }
  const lake = spawnSync("lake", ["--version"], { encoding: "utf8", env: CLEAN_ENV });
  if (lake.error || lake.status !== 0) throw new Unavailable("`lake` is not on PATH");
  const head = spawnSync("git", ["-C", project, "rev-parse", "HEAD"], { encoding: "utf8", env: CLEAN_ENV });
  if (head.status !== 0) throw new Unavailable(`${project} is not inside a git checkout`);
  const dirty = spawnSync("git", ["-C", project, "status", "--porcelain", "--", "MachLib"], { encoding: "utf8", env: CLEAN_ENV });
  if (dirty.status !== 0) throw new Unavailable(`git status failed in ${project}`);
  if (dirty.stdout.trim()) {
    throw new Unavailable(
      `${project}/MachLib has uncommitted changes, so no revision names the MachLib a verdict would be checked against:\n` +
        dirty.stdout.trim().split("\n").slice(0, 5).join("\n"),
    );
  }
  return head.stdout.trim();
}

function requireCurrentBuild(project, modules) {
  if (modules.length === 0) return;
  const r = spawnSync("lake", ["build", "--no-build", ...modules.map((m) => `+${m}`)], {
    cwd: project, encoding: "utf8", env: CLEAN_ENV, timeout: LAKE_TIMEOUT_MS,
  });
  if (r.error) throw new Unavailable(`lake build --no-build did not finish: ${r.error.message}`);
  if (r.status !== 0) {
    const said = `${r.stdout}${r.stderr}`.split("\n").filter((l) => /^(error:|- |Some required)/.test(l)).slice(0, 6).join(" | ");
    throw new Unavailable(
      `the MachLib build of ${modules.join(", ")} is not current (lake build --no-build exited ${r.status}: ` +
        `${said.slice(0, 300)}); run \`lake build\` in ${project}`,
    );
  }
}

/** Read one verdict against its page: its problems, and the compile job when it can run. */
function plan(verdict, readPage, version) {
  const problems = [];
  const report = (code, message) => problems.push({ code, who: verdict.id, message });
  for (const line of verdict.lines) {
    for (const m of line.matchAll(VERSION_IN_LINE)) {
      if (m[1] !== version) report("VERSION", `${JSON.stringify(line)} names monogate-forge ${m[1]}; this run used ${version}`);
    }
  }
  const text = readPage(verdict.file);
  if (text === null) {
    report("STALE_LINE", `${verdict.file} does not exist`);
    return { problems, job: null };
  }
  for (const line of verdict.lines) {
    if (!text.includes(line)) report("STALE_LINE", `${verdict.file} no longer contains ${JSON.stringify(line)}`);
  }
  const { sources, commands } = extract(verdict.file, text);
  let body = sources.get(verdict.source);
  if (body === undefined) report("NO_SOURCE", `${verdict.file} shows no source named ${verdict.source}`);
  const words = shellWords(verdict.command)?.words ?? [];
  const target = words.indexOf("--target");
  const out = words.indexOf("-o");
  const shaped = words[0] === "eml-compile" && words[1] === verdict.source && target > 1 && words[target + 1] === "lean" && out > 1 && Boolean(words[out + 1]);
  if (!commands.some((c) => c.command === verdict.command)) {
    report("NO_COMMAND", `${verdict.file} shows no command ${JSON.stringify(verdict.command)}`);
  } else if (!shaped) {
    report("NO_COMMAND", `${JSON.stringify(verdict.command)} is not \`eml-compile ${verdict.source} --target lean -o <file>\``);
  }
  const page = decodeJsx(text);
  for (const edit of verdict.edits ?? []) {
    if (body === undefined) break;
    const n = occurrences(body, edit.find);
    if (n !== 1) report("STALE_EDIT", `${JSON.stringify(edit.find)} occurs ${n} times in ${verdict.source}, not once`);
    else if (!page.includes(edit.replace.trim())) {
      report("STALE_EDIT", `${verdict.file} no longer tells the reader to write ${JSON.stringify(edit.replace.trim())}`);
    } else body = body.replace(edit.find, edit.replace);
  }
  if (problems.length) return { problems, job: null };
  const pageSources = new Map(sources);
  pageSources.set(verdict.source, body);
  return {
    problems,
    job: { key: JSON.stringify([verdict.file, verdict.command, body]), argv: words.slice(1), output: words[out + 1], sources: pageSources },
  };
}

function compile(bin, job) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "lesson-proof-"));
  for (const [name, body] of job.sources) fs.writeFileSync(path.join(work, name), body);
  const r = spawnSync(bin, job.argv, { cwd: work, encoding: "utf8", timeout: COMPILE_TIMEOUT_MS });
  const file = path.join(work, job.output);
  if (!r.error && r.status === 0 && fs.existsSync(file)) return { work, lean: fs.readFileSync(file, "utf8"), detail: "" };
  const said = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim().split("\n").slice(-3).join(" | ");
  return { work, lean: null, detail: r.error ? `did not finish: ${r.error.message}` : `exit ${r.status}${said ? `: ${said}` : ", no file written"}` };
}

function axiomReports(output) {
  const reports = new Map();
  for (const m of output.matchAll(/'([^']+)' does not depend on any axioms/g)) reports.set(m[1], []);
  for (const m of output.matchAll(/'([^']+)' depends on axioms: \[([^\]]*)\]/g)) {
    reports.set(m[1], m[2].split(",").map((a) => a.trim()).filter(Boolean));
  }
  return reports;
}

/** One `lake env lean` over the emitted file with one `#print axioms` per theorem on known lines. */
function lean(project, work, emitted, theorems) {
  const first = occurrences(emitted, "\n") + 3;
  const probe = path.join(work, "LessonProbe.lean");
  fs.writeFileSync(probe, `${emitted}\n\n${theorems.map((t) => `#print axioms ${t}\n`).join("")}`);
  const r = spawnSync("lake", ["env", "lean", probe], { cwd: project, encoding: "utf8", env: CLEAN_ENV, timeout: LEAN_TIMEOUT_MS });
  if (r.error) throw new Unavailable(`lean did not finish on the emitted file: ${r.error.message}`);
  const output = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  const onTheoremLine = new Set(theorems.map((_, i) => first + i));
  const outside = output.split("\n").filter((line) => {
    const at = /:(\d+):\d+: error/.exec(line);
    return at && !onTheoremLine.has(Number(at[1]));
  });
  const reports = axiomReports(output);
  if (outside.length === 0 && r.status !== 0 && reports.size === 0) outside.push(output.trim().slice(-300));
  return { reports, outside };
}

function judge(verdict, reports, pageText) {
  const problems = [];
  const report = (code, message) => problems.push({ code, who: verdict.id, message });
  const axioms = reports.get(verdict.theorem);
  if (!axioms) {
    report("NOT_DECLARED", `no #print axioms report for ${verdict.theorem}: the emitted Lean does not declare it`);
    return problems;
  }
  const sorry = axioms.includes("sorryAx");
  if (verdict.verdict === "proved" && sorry) report("SORRY", `${verdict.theorem} depends on sorryAx; the page says it is proved`);
  if (verdict.verdict === "not_proved" && !sorry) report("PROVED", `${verdict.theorem} does not depend on sorryAx; the page says it is not proved`);
  if (verdict.quoted) {
    const quoteRe = new RegExp(`'${escapeRegExp(verdict.theorem)}' depends on axioms: \\[([^\\]]*)\\]`, "g");
    const quotes = [...pageText.matchAll(quoteRe)];
    if (quotes.length === 0) report("QUOTE", `${verdict.file} quotes no #print axioms report for ${verdict.theorem}`);
    const actual = [...axioms].sort().join(", ");
    for (const q of quotes) {
      const quoted = q[1].split(",").map((a) => a.trim()).filter(Boolean).sort().join(", ");
      if (quoted !== actual) report("QUOTE", `the page quotes [${quoted}] for ${verdict.theorem}; Lean reports [${actual}]`);
    }
  }
  return problems;
}

function coverage(registry, exemptions, files, readPage) {
  const problems = [];
  for (const g of registry.generic ?? []) {
    const text = readPage(g.file);
    if (text === null || !text.includes(g.line)) {
      problems.push({ code: "STALE_LINE", who: "generic", message: `${g.file} no longer contains ${JSON.stringify(g.line)}` });
    }
  }
  const known = [
    ...registry.verdicts.flatMap((v) => v.lines.map((line) => [v.file, line])),
    ...(registry.generic ?? []).map((g) => [g.file, g.line]),
  ];
  for (const file of files) {
    (readPage(file) ?? "").split("\n").forEach((line, i) => {
      if (!VERDICT_LINE.some((re) => re.test(line))) return;
      if (known.some(([f, l]) => f === file && line.includes(l))) return;
      problems.push({ code: "UNREGISTERED", who: file, message: `line ${i + 1} states a verdict no entry covers: ${JSON.stringify(line.trim().slice(0, 120))}` });
    });
  }
  for (const e of exemptions) {
    if (!CITES_THIS_CHECK.test(e.reason ?? "")) continue;
    if (!registry.verdicts.some((v) => v.file === e.file && v.lines.includes(e.line))) {
      problems.push({
        code: "UNGATED_EXEMPTION",
        who: e.file,
        message: `scripts/lean_claims.json exempts ${JSON.stringify(e.line)} citing this check, but no verdict here registers that line`,
      });
    }
  }
  return problems;
}

function registryErrors(registry) {
  const errors = [];
  if (!Array.isArray(registry.verdicts) || registry.verdicts.length === 0) errors.push("no verdicts registered");
  const ids = new Set();
  for (const v of registry.verdicts ?? []) {
    if (ids.has(v.id)) errors.push(`duplicate verdict id ${v.id}`);
    ids.add(v.id);
    for (const key of ["id", "file", "source", "command", "theorem"]) if (typeof v[key] !== "string" || !v[key]) errors.push(`${v.id ?? "?"}: missing ${key}`);
    if (!Array.isArray(v.lines) || v.lines.length === 0) errors.push(`${v.id}: needs at least one line`);
    if (!VERDICTS.has(v.verdict)) errors.push(`${v.id}: verdict must be "proved" or "not_proved"`);
  }
  for (const g of registry.generic ?? []) if (!g.reason) errors.push(`generic entry ${JSON.stringify(g.line)} gives no reason`);
  return errors;
}

/** Every verdict against the compiler and MachLib: { problems, outcomes }. */
function check({ registry, exemptions, files, readPage, bin, version, project }) {
  const problems = [];
  const groups = new Map();
  for (const verdict of registry.verdicts) {
    const planned = plan(verdict, readPage, version);
    problems.push(...planned.problems);
    if (!planned.job) continue;
    if (!groups.has(planned.job.key)) groups.set(planned.job.key, { ...planned.job, verdicts: [] });
    groups.get(planned.job.key).verdicts.push(verdict);
  }
  try {
    const compiled = [];
    for (const group of groups.values()) {
      const { work, lean: emitted, detail } = compile(bin, group);
      group.work = work;
      if (emitted === null) {
        for (const v of group.verdicts) problems.push({ code: "COMPILE_FAILED", who: v.id, message: `eml-compile ${group.argv.join(" ")}: ${detail}` });
      } else {
        group.emitted = emitted;
        compiled.push(group);
      }
    }
    const modules = [...new Set(compiled.flatMap((g) => [...g.emitted.matchAll(/^import\s+(\S+)/gm)].map((m) => m[1])))].sort();
    requireCurrentBuild(project, modules);
    for (const group of compiled) {
      const theorems = [...new Set(group.verdicts.map((v) => v.theorem))];
      const { reports, outside } = lean(project, group.work, group.emitted, theorems);
      if (outside.length) {
        for (const v of group.verdicts) problems.push({ code: "LEAN_ERROR", who: v.id, message: `the emitted Lean does not compile: ${outside[0].slice(0, 240)}` });
        continue;
      }
      for (const v of group.verdicts) problems.push(...judge(v, reports, readPage(v.file) ?? ""));
    }
  } finally {
    for (const group of groups.values()) if (group.work) fs.rmSync(group.work, { recursive: true, force: true });
  }
  problems.push(...coverage(registry, exemptions, files, readPage));
  return problems;
}

// ---------------------------------------------------------------------------
// Canaries: a planted page, run through the same compiler and MachLib.

const CANARY_FILE = "canary/page.tsx";
const CANARY_COMMAND = "eml-compile canary.eml --target lean -o canary.lean";
const CANARY_PAGE = `const src = \`module canary;

@verify(lean, theorem = "canary_bounded")
fn canary_clamp(x: Real, limit: Real) -> Real
    requires (limit > 0.0)
    ensures (result <= limit)
{
    min(x, limit)
}

@verify(lean, theorem = "canary_product")
fn canary_mul(a: Real, b: Real) -> Real
    requires (abs(a) < 10.0)
    requires (abs(b) < 10.0)
    ensures (abs(result) < 100.0)
{
    a * b
}\`;
const cmd = \`${CANARY_COMMAND}\`;
const prose = [
  "canary_bounded is proved.",
  "canary_product is proved.",
  "canary_bounded is not proved.",
  "Return x instead of min(x, limit), and it is not proved.",
  "Write min(x, limit without the parenthesis, and the compiler stops.",
  "Name it fn guard( and Lean refuses the file.",
  "With monogate-forge 0.0.1, canary_bounded is proved.",
  "canary_mul is not proved either.",
  "'canary_bounded' depends on axioms: [propext, Quot.sound]",
];
`;

function canary(id, overrides) {
  return { id, file: CANARY_FILE, lines: ["canary_bounded is proved."], source: "canary.eml", command: CANARY_COMMAND, theorem: "canary_bounded", verdict: "proved", ...overrides };
}

const CANARY_REGISTRY = {
  verdicts: [
    canary("ok"),
    canary("edit-ok", { lines: ["Return x instead of min(x, limit), and it is not proved."], edits: [{ find: "min(x, limit)", replace: "x" }], verdict: "not_proved" }),
    canary("sorry", { lines: ["canary_product is proved."], theorem: "canary_product" }),
    canary("proved", { lines: ["canary_bounded is not proved."], verdict: "not_proved" }),
    canary("missing", { theorem: "canary_absent" }),
    canary("quote", { quoted: true }),
    canary("version", { lines: ["With monogate-forge 0.0.1, canary_bounded is proved."] }),
    canary("stale-line", { lines: ["a line the planted page does not have"] }),
    canary("no-command", { command: "eml-compile canary.eml --target lean -o elsewhere.lean" }),
    canary("no-source", { source: "absent.eml" }),
    canary("stale-edit", { edits: [{ find: "max(x, limit)", replace: "x" }] }),
    canary("compile-failed", { edits: [{ find: "min(x, limit)", replace: "min(x, limit" }] }),
    canary("lean-error", { edits: [{ find: "fn canary_clamp(", replace: "fn guard(" }] }),
  ],
  generic: [{ file: CANARY_FILE, line: "a generic line that has gone", reason: "canary" }],
};

const CANARY_EXEMPTIONS = [
  { file: CANARY_FILE, line: "canary_bounded is proved.", reason: "re-derived by check_lesson_proofs" },
  { file: CANARY_FILE, line: "canary_mul is not proved either.", reason: "claims check_lesson_proofs, which does not register it" },
];

const CANARY_WANT = [
  ["SORRY", "sorry"], ["PROVED", "proved"], ["NOT_DECLARED", "missing"], ["QUOTE", "quote"], ["VERSION", "version"],
  ["STALE_LINE", "stale-line"], ["NO_COMMAND", "no-command"], ["NO_SOURCE", "no-source"], ["NO_COMMAND", "no-source"],
  ["STALE_EDIT", "stale-edit"], ["COMPILE_FAILED", "compile-failed"], ["LEAN_ERROR", "lean-error"],
  ["STALE_LINE", "generic"], ["UNREGISTERED", CANARY_FILE], ["UNGATED_EXEMPTION", CANARY_FILE],
];

function selfTest(bin, version, project) {
  const readPage = (rel) => (rel === CANARY_FILE ? CANARY_PAGE : null);
  const problems = check({ registry: CANARY_REGISTRY, exemptions: CANARY_EXEMPTIONS, files: [CANARY_FILE], readPage, bin, version, project });
  const got = new Set(problems.map((p) => `${p.code} ${p.who}`));
  const want = new Set(CANARY_WANT.map(([code, who]) => `${code} ${who}`));
  const unexpected = [...got].filter((k) => !want.has(k));
  const missing = [...want].filter((k) => !got.has(k));
  return { ok: unexpected.length === 0 && missing.length === 0, unexpected, missing, problems };
}

// ---------------------------------------------------------------------------

function* sourceFiles(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield full;
  }
}

async function main() {
  const selfTestOnly = process.argv.includes("--self-test");
  let compiler;
  let version;
  let revision;
  let canaries;
  try {
    compiler = await resolveCompiler();
    version = compilerVersion(compiler.bin);
    revision = machlibRevision(MACHLIB);
    console.log(`compiler: ${compiler.label}`);
    console.log(`MachLib: ${path.relative(ROOT, MACHLIB)} at ${revision}`);
    canaries = selfTest(compiler.bin, version, MACHLIB);
  } catch (err) {
    if (err instanceof Unavailable) {
      console.error(`UNAVAILABLE (not a pass): ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
  if (!canaries.ok) {
    console.error("CANARY FAILURE -- the instrument is broken, so no verdict is reported:");
    for (const k of canaries.missing) console.error(`  - did not fire: ${k}`);
    for (const k of canaries.unexpected) console.error(`  - fired unexpectedly: ${k}`);
    for (const p of canaries.problems) console.error(`      ${p.code} [${p.who}] ${p.message}`);
    process.exit(1);
  }
  console.log(`SELF-TEST OK (${CANARY_WANT.length} canaries fire; ok and edit-ok stay green)`);
  if (selfTestOnly) return;

  const registry = JSON.parse(fs.readFileSync(REGISTRY, "utf8"));
  const errors = registryErrors(registry);
  if (errors.length) {
    console.error("registry error in scripts/lesson_proofs.json:");
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const exemptions = JSON.parse(fs.readFileSync(LEAN_CLAIMS, "utf8")).exempt ?? [];
  const files = SCAN_DIRS.flatMap((d) => [...sourceFiles(path.join(ROOT, d))]).map((f) => path.relative(ROOT, f));
  const readPage = (rel) => {
    try {
      return fs.readFileSync(path.join(ROOT, rel), "utf8");
    } catch {
      return null;
    }
  };

  let problems;
  try {
    problems = check({ registry, exemptions, files, readPage, bin: compiler.bin, version, project: MACHLIB });
  } catch (err) {
    if (err instanceof Unavailable) {
      console.error(`UNAVAILABLE (not a pass): ${err.message}`);
      process.exit(2);
    }
    throw err;
  }

  for (const v of registry.verdicts) {
    const own = problems.filter((p) => p.who === v.id);
    const says = v.verdict === "proved" ? "proved" : "not proved";
    const found = v.verdict === "proved" ? "no sorryAx" : "sorryAx";
    // A FAIL line states only what the page says. What Lean printed is in the
    // problem list below: an earlier version printed the page's verdict here
    // as if Lean had reported it.
    const detail = own.length
      ? `the page says ${says}; see ${[...new Set(own.map((p) => p.code))].join(", ")} below`
      : `the page says ${says}, and Lean agrees (${found})${v.quoted ? "; quoted report matches" : ""}`;
    console.log(`${own.length ? "FAIL" : "OK  "}  ${v.id.padEnd(40)} ${v.theorem}: ${detail}`);
  }
  const proved = registry.verdicts.filter((v) => v.verdict === "proved").length;
  if (problems.length) {
    console.error(`\nFAIL -- ${problems.length} problem(s):`);
    for (const p of problems) console.error(`  ${p.code.padEnd(18)} [${p.who}] ${p.message}`);
    process.exit(1);
  }
  console.log(
    `LESSON PROOFS: GREEN  (${registry.verdicts.length} verdicts: ${proved} proved, ${registry.verdicts.length - proved} not proved; ` +
      `monogate-forge ${version}; MachLib ${revision.slice(0, 12)}; ${(registry.generic ?? []).length} generic lines)`,
  );
}

await main();
