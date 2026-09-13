#!/usr/bin/env node
// scripts/check_site_commands.mjs
//
// Every `eml-compile` command monogate.dev shows must run -- with the compiler
// a reader actually installs, against the source the same page shows.
//
// Motivation: on 2026-09-12 the 31 distinct `eml-compile` commands on the site
// were run for the first time. Six failed argument parsing outright
// (`--target python,c`, two sources in one call, `--profile esp32`), the CI
// example passed a shell glob and wrote to `-o build/c/` (a traceback), and
// the first-guard lesson's own source did not parse -- `ensures (return <=
// limit)`, where `return` is a keyword. `next build` saw none of it. Forge
// found the same class in its own tour (forge 283c001: six of seven steps
// broken under a green suite of six thousand tests) and fixed it by running
// the tour. This runs the site.
//
// THE RULE: a command shown on the site exits 0 when run exactly as written,
// in an empty directory holding the sources the SAME file shows under those
// names. If the lines after a command, up to the next command, narrate
// `compile error`, `parse error` or `allocator error`, it must exit non-zero.
//
// A SOURCE is a string/template literal attached to a JSX element that carries
// a `*.eml` attribute (`<Code lang="hello.eml">{`...`}</Code>`,
// `<CodeBlock code={src} filename="x.eml" />`), or a literal whose first line
// is `module NAME;` (shown as NAME.eml). Literals are read with the repo's own
// `typescript` parser, not a regex over TSX: a regex grabbed the annotation
// text beside a command during the audit and reported two false failures.
//
// WHAT IT DOES NOT CHECK
//   * Printed output. Only the exit status -- the same deliberate gap forge's
//     tour gate keeps, so an emitter change is not a documentation failure.
//   * A command whose source the page never shows (`file.eml`, `$f`). It runs
//     against a stand-in and only an ARGUMENT error (argparse exit 2) counts:
//     whether an unseen file carries @target(fpga) cannot be known.
//   * Other programs (gcc, lake, cargo) in the same blocks.
//
// THE COMPILER is the newest `monogate-forge` on PyPI -- what
// `pip install monogate-forge` gives a reader today, NOT forge master, which
// was 173 commits ahead of the release when this was written. It is cached in
// a venv under node_modules/.cache/monogate-forge/<version>.
// `EML_COMPILE=/path/to/eml-compile` overrides, for trying a forge checkout
// before it ships; the report says so.
//
// Canaries run first against the same compiler. A comma target list, a source
// that does not parse, a glob, and their good controls must each get the
// expected verdict, or no other verdict is reported.
//
// Exit: 0 every command runs | 1 a command or canary failed |
//       2 could not evaluate (no python3, PyPI unreachable) -- never a pass.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCAN_DIRS = ["app", "lib"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);
const PACKAGE = "monogate-forge";
const RUN_TIMEOUT_MS = 180_000;
// The site showed 31 distinct commands when this was written. Far fewer means
// the extractor stopped matching, and an extractor that matches nothing passes.
const MIN_COMMANDS = 10;

const EML_NAME = /^[\w.-]+\.eml$/;
const MODULE_LINE = /^\s*module\s+([A-Za-z_]\w*)\s*;/;
const NARRATED_FAILURE = /^\s*(compile error|parse error|allocator error)/m;
const ARGPARSE_ERROR = /eml-compile: error:/;

// Stands in for a source the page never shows. Carries both annotations so a
// lean or verilog target does not fail for a reason that has nothing to do
// with the command's arguments.
const STAND_IN = `module stand_in;

@verify(lean, theorem = "stand_in_positive")
@target(fpga, clock_mhz = 100)
fn stand_in(x: Real) -> Real
    requires (x > 0.0)
    ensures (result > 0.0)
{
    x
}
`;

class Unavailable extends Error {}

function scriptKind(file) {
  const ext = path.extname(file);
  if (ext === ".ts") return ts.ScriptKind.TS;
  if (ext === ".tsx") return ts.ScriptKind.TSX;
  return ts.ScriptKind.JSX;
}

function literalText(node) {
  return ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) ? node.text : null;
}

/** Sources and `eml-compile` commands in one file's text. */
function extract(fileName, text) {
  const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, scriptKind(fileName));
  const consts = new Map();
  const literals = [];

  (function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const value = literalText(node.initializer);
      if (value !== null) consts.set(node.name.text, value);
    }
    const value = literalText(node);
    if (value !== null) literals.push({ node, text: value });
    else if (ts.isJsxText(node)) literals.push({ node, text: node.getText(sf) });
    ts.forEachChild(node, collect);
  })(sf);

  const resolve = (expr) => literalText(expr) ?? (ts.isIdentifier(expr) ? consts.get(expr.text) ?? null : null);
  const sources = new Map();
  const conflicts = new Set();
  const addSource = (name, body) => {
    if (sources.has(name) && sources.get(name) !== body) conflicts.add(name);
    sources.set(name, body);
  };

  (function associate(node) {
    const attrs = ts.isJsxElement(node)
      ? node.openingElement.attributes.properties
      : ts.isJsxSelfClosingElement(node)
        ? node.attributes.properties
        : null;
    if (attrs) {
      const jsxAttrs = attrs.filter(ts.isJsxAttribute);
      const emlName = jsxAttrs
        .map((a) => (a.initializer && ts.isStringLiteral(a.initializer) ? a.initializer.text : ""))
        .find((v) => EML_NAME.test(v));
      if (emlName) {
        const bodies = jsxAttrs
          .map((a) => a.initializer)
          .filter((init) => init && ts.isJsxExpression(init) && init.expression)
          .map((init) => resolve(init.expression));
        if (ts.isJsxElement(node)) {
          for (const child of node.children) {
            if (ts.isJsxExpression(child) && child.expression) bodies.push(resolve(child.expression));
          }
        }
        for (const body of bodies) if (body !== null) addSource(emlName, body);
      }
    }
    const value = literalText(node);
    const moduleLine = value === null ? null : MODULE_LINE.exec(value);
    if (moduleLine && /\bfn\s/.test(value)) addSource(`${moduleLine[1]}.eml`, value);
    ts.forEachChild(node, associate);
  })(sf);

  const commands = [];
  for (const { node, text: body } of literals) {
    if (!body.includes("eml-compile")) continue;
    const startLine = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
    const lines = body.split("\n");
    const found = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const first = i;
      while (/\\\s*$/.test(line) && i + 1 < lines.length) line = line.replace(/\\\s*$/, " ") + lines[++i].trimStart();
      const command = line.trim().replace(/^\$\s+/, "").replace(/^-\s*run:\s*/, "");
      if (/^eml-compile(\s|$)/.test(command)) found.push({ command, first, last: i });
    }
    // Narration belongs to the command it follows: the lines after it, up to
    // the next command. Testing the whole literal would make a working command
    // shown beside a narrated failure "expect" to fail as well.
    found.forEach((cmd, n) => {
      const until = n + 1 < found.length ? found[n + 1].first : lines.length;
      const narration = lines.slice(cmd.last + 1, until).join("\n");
      commands.push({ command: cmd.command, line: startLine + cmd.first, narratedFailure: NARRATED_FAILURE.test(narration) });
    });
  }
  return { sources, commands, conflicts: [...conflicts] };
}

/**
 * Split a shell line into words, stopping at a comment, pipe, list or
 * redirect. `expanded[i]` is true when word i holds `$`, `*` or a backtick
 * outside single quotes -- its value depends on the reader's shell, not the page.
 */
function shellWords(line) {
  const words = [];
  const expanded = [];
  let current = "";
  let inWord = false;
  let quote = null;
  let expands = false;
  const flush = () => {
    if (inWord) {
      words.push(current);
      expanded.push(expands);
    }
    current = "";
    inWord = false;
    expands = false;
  };
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote === "'") {
      if (c === "'") quote = null;
      else current += c;
      continue;
    }
    if (quote === '"') {
      if (c === '"') quote = null;
      else {
        if (c === "$" || c === "`") expands = true;
        current += c;
      }
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      inWord = true;
      continue;
    }
    if (/\s/.test(c)) {
      flush();
      continue;
    }
    if (!inWord && c === "#") break;
    if ("|;&<>".includes(c)) break;
    if (c === "$" || c === "*" || c === "`") expands = true;
    current += c;
    inWord = true;
  }
  if (quote) return null;
  flush();
  return { words, expanded };
}

/** Run one command in a fresh directory. Returns { verdict, detail }. */
function evaluate(bin, cmd, pageSources) {
  const parsed = shellWords(cmd.command);
  if (!parsed || parsed.words[0] !== "eml-compile") return { verdict: "FAIL", detail: "could not read the command (unbalanced quotes?)" };
  const argv = parsed.words.slice(1);
  const expanded = parsed.expanded.slice(1);
  const work = fs.mkdtempSync(path.join(os.tmpdir(), "site-command-"));
  let shown = 0;
  let unseen = 0;
  try {
    // Every source the page shows sits beside the command, as it would for a
    // reader following the lesson -- `use local::x;` must find x.eml.
    for (const [name, body] of pageSources) fs.writeFileSync(path.join(work, name), body);
    for (let k = 0; k < argv.length; k++) {
      const word = argv[k];
      if ((word === "-o" || word === "--output") && k + 1 < argv.length && expanded[k + 1]) {
        argv[k + 1] = `out${path.extname(argv[k + 1].replace(/["'`]/g, ""))}`;
        k++;
        continue;
      }
      const isSource = word.endsWith(".eml") || (k === 0 && expanded[k]);
      if (!isSource) continue;
      if (word.includes("*")) {
        return {
          verdict: "FAIL",
          detail: `\`${word}\` is a shell glob: eml-compile takes ONE source, so this fails whenever the glob matches more than one file -- loop over the files instead`,
        };
      }
      const name = expanded[k] ? "stand_in.eml" : word;
      argv[k] = name;
      const body = pageSources.get(path.basename(name));
      fs.mkdirSync(path.dirname(path.join(work, name)), { recursive: true });
      fs.writeFileSync(path.join(work, name), body ?? STAND_IN);
      if (body === undefined) unseen++;
      else shown++;
    }
    const r = spawnSync(bin, argv, { cwd: work, encoding: "utf8", timeout: RUN_TIMEOUT_MS });
    const output = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
    const tail = output.split("\n").slice(-3).join("\n");
    if (r.error) return { verdict: "FAIL", detail: `did not finish: ${r.error.message}` };
    if (unseen > 0) {
      const argumentError = r.status === 2 && ARGPARSE_ERROR.test(output);
      return argumentError ? { verdict: "FAIL", detail: tail } : { verdict: "ARGS-OK", detail: "" };
    }
    if (cmd.narratedFailure) {
      return r.status !== 0 ? { verdict: "PASS", detail: "" } : { verdict: "FAIL", detail: "the page narrates a failure and the command SUCCEEDED" };
    }
    return r.status === 0 ? { verdict: "PASS", detail: "" } : { verdict: "FAIL", detail: `exit ${r.status}: ${tail}` };
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
}

async function resolveCompiler() {
  const override = process.env.EML_COMPILE;
  if (override) {
    if (!fs.existsSync(override)) throw new Unavailable(`EML_COMPILE=${override} does not exist`);
    return { bin: override, label: `${override} (EML_COMPILE override -- NOT what a reader installs)` };
  }
  let version;
  try {
    const res = await fetch(`https://pypi.org/pypi/${PACKAGE}/json`, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    version = (await res.json()).info.version;
  } catch (err) {
    throw new Unavailable(`cannot ask PyPI for the current ${PACKAGE}: ${err.message}`);
  }
  if (typeof version !== "string" || !/^[\w.+-]+$/.test(version)) {
    throw new Unavailable(`PyPI returned an unexpected version: ${JSON.stringify(version)}`);
  }
  const venv = path.join(ROOT, "node_modules", ".cache", PACKAGE, version);
  const bin = path.join(venv, "bin", "eml-compile");
  if (!fs.existsSync(bin)) {
    console.log(`installing ${PACKAGE}==${version} into ${path.relative(ROOT, venv)} ...`);
    const mk = spawnSync("python3", ["-m", "venv", venv], { encoding: "utf8" });
    if (mk.status !== 0) throw new Unavailable(`python3 -m venv failed: ${(mk.stderr || mk.error?.message || "").trim()}`);
    const pip = spawnSync(path.join(venv, "bin", "pip"), ["install", "--quiet", `${PACKAGE}==${version}`], {
      encoding: "utf8",
      timeout: 600_000,
    });
    if (pip.status !== 0 || !fs.existsSync(bin)) {
      fs.rmSync(venv, { recursive: true, force: true });
      throw new Unavailable(`pip install ${PACKAGE}==${version} failed: ${(pip.stderr || "").trim().slice(-400)}`);
    }
  }
  return { bin, label: `${PACKAGE} ${version} from PyPI -- what \`pip install ${PACKAGE}\` gives a reader` };
}

const SOURCE = 'const s = <Code lang="a.eml">{`fn f(x: Real) -> Real {\n    x\n}`}</Code>;\n';
const CANARIES = [
  {
    name: "a comma-separated target list fails",
    expect: "FAIL",
    text: `${SOURCE}const c = <Code lang="bash">{\`eml-compile a.eml --target python,c -o out\`}</Code>;`,
  },
  {
    name: "the same command with one target passes",
    expect: "PASS",
    text: `${SOURCE}const c = <Code lang="bash">{\`eml-compile a.eml --target python -o a.py\`}</Code>;`,
  },
  {
    name: "a page source that does not parse fails even with good flags",
    expect: "FAIL",
    text:
      'const s = <Code lang="a.eml">{`fn f(x: Real) -> Real\n    ensures (return <= x)\n{\n    x\n}`}</Code>;\n' +
      'const c = <Code lang="bash">{`eml-compile a.eml --target python -o a.py`}</Code>;',
  },
  {
    name: "a glob in the source position fails",
    expect: "FAIL",
    text: "const c = `eml-compile src/*.eml --target c -o out.c`;",
  },
  {
    name: "an unseen source with good flags is argument-checked only",
    expect: "ARGS-OK",
    text: "const c = `eml-compile file.eml --target lean -o out.lean`;",
  },
  {
    name: "an unseen source with a bad flag still fails",
    expect: "FAIL",
    text: "const c = `eml-compile file.eml --target c --profile esp32`;",
  },
  {
    name: "a const shown through code={...} counts as the page's source",
    expect: "PASS",
    text:
      "const src = `module m;\n\nfn f(x: Real) -> Real {\n    x\n}`;\n" +
      'const el = <CodeBlock code={src} lang="eml" filename="m.eml" />;\n' +
      "const cmd = `eml-compile m.eml --target c -o m.c`;",
  },
  {
    name: "a backslash continuation and a trailing comment are read as one command",
    expect: "PASS",
    text: `${SOURCE}const c = <Code lang="bash">{\`eml-compile a.eml \\\\\n    --target python -o a.py   # emit python\`}</Code>;`,
  },
  {
    name: "a source may import another source the same page shows",
    expect: "PASS",
    text:
      "const a = `module helper;\n\nfn twice(x: Real) -> Real {\n    x + x\n}`;\n" +
      "const b = `module main;\n\nuse local::helper;\n\nfn f(x: Real) -> Real {\n    twice(x)\n}`;\n" +
      "const c = `eml-compile main.eml --target c -o main.c`;",
  },
  {
    name: "an import of a file the page does not show fails",
    expect: "FAIL",
    text:
      "const b = `module main;\n\nuse local::missing;\n\nfn f(x: Real) -> Real {\n    x\n}`;\n" +
      "const c = `eml-compile main.eml --target c -o main.c`;",
  },
  {
    // Found in review: narration was once tested over the whole literal, so the
    // working second command here would have been required to fail as well.
    name: "a narrated failure binds to its own command, not to the one after it",
    expect: ["PASS", "PASS"],
    text:
      'const bad = <Code lang="bad.eml">{`fn f(x: Real) -> Real\n    ensures (return <= x)\n{\n    x\n}`}</Code>;\n' +
      SOURCE +
      "const c = `eml-compile bad.eml --target python -o bad.py\nparse error: bad.eml:2:14: expected an expression\neml-compile a.eml --target python -o a.py`;",
  },
  {
    name: "a command narrated as failing that succeeds fails the check",
    expect: "FAIL",
    text: `${SOURCE}const c = \`eml-compile a.eml --target python -o a.py\nparse error: this was supposed to fail\`;`,
  },
];

function runCanaries(bin) {
  const failures = [];
  for (const canary of CANARIES) {
    const expected = [canary.expect].flat();
    const { sources, commands } = extract("canary.tsx", canary.text);
    if (commands.length !== expected.length) {
      failures.push(`${canary.name}: extractor found ${commands.length} commands, expected ${expected.length}`);
      continue;
    }
    commands.forEach((cmd, n) => {
      const { verdict, detail } = evaluate(bin, cmd, sources);
      if (verdict !== expected[n]) {
        failures.push(`${canary.name} [command ${n + 1}]: got ${verdict}, expected ${expected[n]}${detail ? ` (${detail})` : ""}`);
      }
    });
  }
  return failures;
}

function* sourceFiles(dir) {
  // A scan root that does not exist holds no command: lib/ went with the
  // 2026-09-12 product-wave archive. It stays in SCAN_DIRS, so a lib/ that comes
  // back is scanned; MIN_COMMANDS still catches an extractor that finds nothing.
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* sourceFiles(full);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield full;
  }
}

async function main() {
  let compiler;
  try {
    compiler = await resolveCompiler();
  } catch (err) {
    if (err instanceof Unavailable) {
      console.error(`UNAVAILABLE (not a pass): ${err.message}`);
      process.exit(2);
    }
    throw err;
  }
  console.log(`compiler: ${compiler.label}`);

  const canaryFailures = runCanaries(compiler.bin);
  if (canaryFailures.length) {
    console.error("CANARY FAILURE -- the instrument is broken, so no command verdict is reported:");
    for (const f of canaryFailures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`canaries: ${CANARIES.length}/${CANARIES.length} got their expected verdict`);

  const runs = new Map();
  const failures = [];
  for (const dir of SCAN_DIRS) {
    for (const file of sourceFiles(path.join(ROOT, dir))) {
      const rel = path.relative(ROOT, file);
      const { sources, commands, conflicts } = extract(rel, fs.readFileSync(file, "utf8"));
      for (const name of conflicts) failures.push(`${rel}: two different sources are shown as ${name}; a command naming it is ambiguous`);
      for (const cmd of commands) {
        const key = JSON.stringify([rel, cmd.command, cmd.narratedFailure]);
        if (!runs.has(key)) runs.set(key, { rel, cmd, sources, lines: [] });
        runs.get(key).lines.push(cmd.line);
      }
    }
  }

  const counts = { PASS: 0, "ARGS-OK": 0, FAIL: 0 };
  for (const { rel, cmd, sources, lines } of runs.values()) {
    const { verdict, detail } = evaluate(compiler.bin, cmd, sources);
    counts[verdict]++;
    const where = `${rel}:${lines.join(",")}`;
    console.log(`${verdict.padEnd(7)} ${where}\n        ${cmd.command}`);
    if (verdict === "FAIL") failures.push(`${where}\n    ${cmd.command}\n    ${detail.replace(/\n/g, "\n    ")}`);
  }

  console.log(
    `\n${runs.size} distinct commands: ${counts.PASS} ran against the page's own source, ` +
      `${counts["ARGS-OK"]} argument-checked only (source not shown on the page), ${counts.FAIL} failed`,
  );
  if (runs.size < MIN_COMMANDS) failures.push(`only ${runs.size} commands found (expected at least ${MIN_COMMANDS}); the extractor has stopped matching`);
  if (counts.PASS + counts.FAIL === 0) failures.push("no command ran against a page's own source; the strong half of this check is not exercised");

  if (failures.length) {
    console.error(`\nFAIL -- ${failures.length} problem(s):`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("PASS -- every command shown on the site runs");
}

await main();
