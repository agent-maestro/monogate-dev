"use client";
import { useEffect, useMemo, useRef, useState } from "react";

// SuperBEST v5.2 op costs (positive domain)
const SB = {
  exp: 1, log: 1, ln: 1, sqrt: 1, pow: 1, recip: 1,
  mul: 2, div: 2, add: 2, sub: 2, neg: 2, abs: 2,
  sin: 1, cos: 1, tan: 1, // boundary (1 complex node each)
};
const NV = {
  exp: 1, log: 3, ln: 3, sqrt: 8, pow: 3, recip: 5,
  mul: 13, div: 15, add: 11, sub: 5, neg: 9, abs: 5,
  sin: 13, cos: 13, tan: 13,
};
const TRIG = new Set(["sin", "cos", "tan"]);
const PIECEWISE = new Set(["abs"]);

// Minimal expression parser (recursive descent)
function tokenize(src) {
  const out = [];
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < n && /[0-9.eE+-]/.test(src[j]) && !(src[j] === "+" || src[j] === "-") || (j === i && /[0-9.]/.test(src[j]))) {
        j++;
      }
      // safer number parse: consume digits, dot, optional e+/-digits
      let end = i;
      while (end < n && /[0-9.]/.test(src[end])) end++;
      if (end < n && (src[end] === "e" || src[end] === "E")) {
        end++;
        if (end < n && (src[end] === "+" || src[end] === "-")) end++;
        while (end < n && /[0-9]/.test(src[end])) end++;
      }
      out.push({ type: "num", value: parseFloat(src.slice(i, end)) });
      i = end; continue;
    }
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < n && /[a-zA-Z0-9_]/.test(src[j])) j++;
      out.push({ type: "id", value: src.slice(i, j) });
      i = j; continue;
    }
    if (c === "*" && src[i + 1] === "*") { out.push({ type: "op", value: "**" }); i += 2; continue; }
    if ("+-*/()^".includes(c)) { out.push({ type: "op", value: c }); i++; continue; }
    if (c === ",") { out.push({ type: "op", value: "," }); i++; continue; }
    i++; // skip unknown
  }
  return out;
}

// Pratt-ish parser
function parse(src) {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const eat = (v) => {
    if (!toks[p]) return false;
    if (v == null || toks[p].value === v || toks[p].type === v) { p++; return true; }
    return false;
  };

  function parsePrimary() {
    const t = toks[p];
    if (!t) throw new Error("unexpected end");
    if (t.type === "num") { p++; return { kind: "num", value: t.value }; }
    if (t.type === "id") {
      p++;
      if (toks[p] && toks[p].value === "(") {
        p++;
        const args = [];
        if (toks[p] && toks[p].value !== ")") {
          args.push(parseExpr());
          while (toks[p] && toks[p].value === ",") { p++; args.push(parseExpr()); }
        }
        if (!toks[p] || toks[p].value !== ")") throw new Error("expected )");
        p++;
        return { kind: "call", name: t.value, args };
      }
      return { kind: "var", name: t.value };
    }
    if (t.value === "(") {
      p++;
      const e = parseExpr();
      if (!toks[p] || toks[p].value !== ")") throw new Error("expected )");
      p++;
      return e;
    }
    if (t.value === "-") { p++; return { kind: "unary", op: "neg", arg: parseUnary() }; }
    if (t.value === "+") { p++; return parseUnary(); }
    throw new Error("unexpected token " + JSON.stringify(t));
  }

  function parseUnary() { return parsePrimary(); }
  function parsePow() {
    let left = parseUnary();
    while (toks[p] && (toks[p].value === "**" || toks[p].value === "^")) {
      p++;
      const right = parseUnary();
      left = { kind: "bin", op: "pow", left, right };
    }
    return left;
  }
  function parseMul() {
    let left = parsePow();
    while (toks[p] && (toks[p].value === "*" || toks[p].value === "/")) {
      const op = toks[p].value === "*" ? "mul" : "div"; p++;
      const right = parsePow();
      left = { kind: "bin", op, left, right };
    }
    return left;
  }
  function parseAdd() {
    let left = parseMul();
    while (toks[p] && (toks[p].value === "+" || toks[p].value === "-")) {
      const op = toks[p].value === "+" ? "add" : "sub"; p++;
      const right = parseMul();
      left = { kind: "bin", op, left, right };
    }
    return left;
  }
  function parseExpr() { return parseAdd(); }

  const res = parseExpr();
  if (p !== toks.length) throw new Error("trailing tokens");
  return res;
}

function walk(node, state) {
  if (!node) return;
  switch (node.kind) {
    case "num":
      if (node.value === 0 || node.value === 1) state.free_constants++;
      else state.non_free_constants++;
      break;
    case "var":
      state.variables.add(node.name);
      break;
    case "unary":
      state.counts[node.op] = (state.counts[node.op] || 0) + 1;
      walk(node.arg, state);
      break;
    case "bin":
      state.counts[node.op] = (state.counts[node.op] || 0) + 1;
      walk(node.left, state); walk(node.right, state);
      break;
    case "call": {
      const fn = node.name.toLowerCase();
      const known = {
        exp: "exp", ln: "log", log: "log", sqrt: "sqrt",
        sin: "sin", cos: "cos", tan: "tan", abs: "abs",
      }[fn];
      if (known) {
        state.counts[known] = (state.counts[known] || 0) + 1;
        if (TRIG.has(known)) state.contains_trig = true;
        if (PIECEWISE.has(known)) state.contains_piecewise = true;
      }
      for (const a of node.args) walk(a, state);
      break;
    }
  }
}

function analyse(expr) {
  let ast;
  try { ast = parse(expr); } catch (e) {
    return { error: e.message };
  }
  const state = {
    counts: {}, free_constants: 0, non_free_constants: 0,
    variables: new Set(),
    contains_trig: false, contains_piecewise: false,
  };
  walk(ast, state);
  const naive = Object.entries(state.counts)
    .reduce((s, [op, n]) => s + (NV[op] ?? 2) * n, 0);
  const sb = Object.entries(state.counts)
    .reduce((s, [op, n]) => s + (SB[op] ?? 2) * n, 0);
  const savings = naive > 0 ? Math.round((1 - sb / naive) * 10000) / 100 : 0;
  const elc = state.contains_piecewise ? "outside_piecewise"
            : state.contains_trig ? "boundary" : "inside";
  return {
    expression: expr,
    op_counts: state.counts,
    variables: [...state.variables],
    free_constants: state.free_constants,
    non_free_constants: state.non_free_constants,
    naive_cost: naive,
    superbest_cost: sb,
    savings_pct: savings,
    elc_class: elc,
  };
}

function elcBadge(elc) {
  if (elc === "inside") return { text: "Inside ELC", color: "#22c55e" };
  if (elc === "boundary") return { text: "Boundary", color: "#eab308" };
  return { text: "Outside ELC", color: "#ef4444" };
}

const EXAMPLES = [
  "exp(x) * y + log(z)",
  "1 / (1 + exp(-x))",
  "x * exp(-x**2)",
  "sin(x)**2 + cos(x)**2",
  "sqrt(x**2 + y**2)",
  "x**2 + 2*x + 1",
  "-x * log(x)",
  "log(1 + exp(x))",
  "(exp(x) - exp(-x)) / 2",
];

export default function LiveOptimizer() {
  const [expr, setExpr] = useState("exp(x) * y + log(z)");
  const [result, setResult] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try { setResult(analyse(expr.trim() || "x")); }
      catch (e) { setResult({ error: String(e.message || e) }); }
    }, 150);
    return () => timer.current && clearTimeout(timer.current);
  }, [expr]);

  const badge = useMemo(() => result && !result.error ? elcBadge(result.elc_class) : null, [result]);
  const savingsPct = result && !result.error ? result.savings_pct : 0;

  return (
    <div style={{
      minHeight: "100vh", background: "#07080f", color: "#e2e8f0",
      fontFamily: "var(--font-sans, system-ui, sans-serif)",
      padding: "60px 20px 80px",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ fontSize: 11, fontFamily: "monospace", letterSpacing: 2,
          textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>
          monogate.dev · lab · live optimiser
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px", letterSpacing: -0.6 }}>
          Type any equation. Watch it shrink.
        </h1>
        <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 28px", lineHeight: 1.7 }}>
          Every mathematical expression has an EML node cost.  This tool parses
          your expression in real time and reports the naïve EML cost, the
          SuperBEST-optimised cost, the savings percentage, and whether the
          expression stays inside the ELC theory.
        </p>

        <input
          value={expr}
          onChange={e => setExpr(e.target.value)}
          spellCheck={false}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "14px 16px",
            color: "#e2e8f0",
            fontFamily: "monospace",
            fontSize: 15,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setExpr(ex)} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              color: "#cbd5e1", borderRadius: 6, padding: "6px 10px",
              fontFamily: "monospace", fontSize: 11, cursor: "pointer",
            }}>{ex}</button>
          ))}
        </div>

        {result && result.error && (
          <div style={{ marginTop: 24, padding: 14, background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
            fontFamily: "monospace", fontSize: 12 }}>
            parse error: {result.error}
          </div>
        )}

        {result && !result.error && (
          <>
            <div style={{ marginTop: 24, padding: 16,
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between",
                fontFamily: "monospace", fontSize: 12, color: "#94a3b8",
                marginBottom: 10, letterSpacing: 1.2, textTransform: "uppercase" }}>
                <span>breakdown</span>
                <span style={{ color: badge.color }}>
                  {badge.text}
                </span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12,
                fontFamily: "monospace" }}>
                <thead>
                  <tr style={{ color: "#64748b", textTransform: "uppercase", fontSize: 10 }}>
                    <th style={{ textAlign: "left", padding: "4px 8px" }}>op</th>
                    <th style={{ textAlign: "right", padding: "4px 8px" }}>count</th>
                    <th style={{ textAlign: "right", padding: "4px 8px" }}>naive</th>
                    <th style={{ textAlign: "right", padding: "4px 8px" }}>SB</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result.op_counts).sort().map(([op, n]) => (
                    <tr key={op} style={{ color: "#cbd5e1",
                      borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "5px 8px" }}>{op}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right" }}>{n}</td>
                      <td style={{ padding: "5px 8px", textAlign: "right", color: "#94a3b8" }}>
                        {(NV[op] ?? 2) * n}n
                      </td>
                      <td style={{ padding: "5px 8px", textAlign: "right", color: "#e8a020" }}>
                        {(SB[op] ?? 2) * n}n
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 14,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 4, height: 8, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.max(0, Math.min(100, savingsPct))}%`,
                  height: "100%",
                  background: "#e8a020",
                  transition: "width 0.25s ease",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between",
                marginTop: 10, fontFamily: "monospace", fontSize: 13, color: "#cbd5e1" }}>
                <span>
                  Naïve: <b style={{ color: "#94a3b8" }}>{result.naive_cost}n</b> →
                  SuperBEST: <b style={{ color: "#e8a020" }}>{result.superbest_cost}n</b>
                </span>
                <span style={{ color: "#e8a020", fontWeight: 700 }}>
                  {savingsPct}% saved
                </span>
              </div>
              <div style={{ marginTop: 12, fontSize: 11, color: "#64748b",
                fontFamily: "monospace" }}>
                variables: {result.variables.join(", ") || "(none)"} ·
                {" "}free constants (0/1): {result.free_constants} ·
                {" "}built constants: {result.non_free_constants}
              </div>
            </div>
            <div style={{ marginTop: 18, padding: 14, fontSize: 12, color: "#94a3b8",
              borderLeft: "2px solid rgba(232,160,32,0.4)", paddingLeft: 14 }}>
              This component is a browser port of{" "}
              <code>python -m monogate.cli.expr_optimizer</code>.  Same v5.2
              cost table, same ELC classifier.  Parser is a ~200-line
              recursive-descent — edge cases (subscripts, LaTeX, Unicode
              operators) may not parse.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
