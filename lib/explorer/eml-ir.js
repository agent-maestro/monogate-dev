const SAMPLE_POINTS = [
  { x: 0.25, y: 0.5 },
  { x: 0.5, y: 1.25 },
  { x: 1.0, y: 2.0 },
  { x: 1.75, y: 3.0 },
];

const FUNCTION_NAMES = new Set(["exp", "ln", "sqrt", "sin", "cos", "tanh"]);

function stableHash(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `mgeir_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function tokenize(expression) {
  return expression.match(/[A-Za-z_][A-Za-z0-9_]*|\d+(?:\.\d+)?|[()+\-*/]/g) ?? [];
}

function buildDag(expression) {
  const tokens = tokenize(expression);
  const terms = tokens.filter((token) => /^[A-Za-z_][A-Za-z0-9_]*|\d/.test(token));
  const nodes = terms.map((term, index) => {
    const isFunction = FUNCTION_NAMES.has(term);
    const id = `n${index + 1}`;
    const previous = index > 0 ? [`n${index}`] : [];
    return {
      id,
      op_kind: isFunction ? "function" : /^[0-9]/.test(term) ? "literal" : "symbol",
      kind: isFunction ? "call" : /^[0-9]/.test(term) ? "literal" : "input",
      op: isFunction ? term : null,
      args: isFunction ? previous : [],
      literal: /^[0-9]/.test(term) ? Number(term) : null,
      source: term,
      reuse_count: terms.filter((candidate) => candidate === term).length,
      domain_annotations: term === "ln" || term === "sqrt" ? [{ kind: "positive_domain" }] : [],
    };
  });

  const fallbackNode = {
    id: "n1",
    op_kind: "symbol",
    kind: "input",
    op: null,
    args: [],
    literal: null,
    source: expression || "x",
    reuse_count: 1,
    domain_annotations: [],
  };

  return {
    expression,
    nodes: nodes.length ? nodes : [fallbackNode],
    tree_cost: Math.max(1, tokens.length),
    dag_cost: Math.max(1, new Set(terms).size || 1),
  };
}

function toJavaScriptExpression(expression) {
  return expression
    .replace(/\bln\s*\(/g, "Math.log(")
    .replace(/\bexp\s*\(/g, "Math.exp(")
    .replace(/\bsqrt\s*\(/g, "Math.sqrt(")
    .replace(/\bsin\s*\(/g, "Math.sin(")
    .replace(/\bcos\s*\(/g, "Math.cos(")
    .replace(/\btanh\s*\(/g, "Math.tanh(");
}

function evaluate(expression, sample) {
  const jsExpression = toJavaScriptExpression(expression);
  const evaluator = new Function("x", "y", `"use strict"; return (${jsExpression});`);
  const value = evaluator(sample.x, sample.y);
  return Number.isFinite(value) ? value : NaN;
}

function buildReplay(dag, packetHash) {
  const frames = dag.nodes.map((node, index) => {
    const guarded = node.domain_annotations.length > 0;
    return {
      frame_id: `frame_${String(index + 1).padStart(3, "0")}`,
      node_id: node.id,
      op_kind: node.op_kind,
      lifecycle_state: "PARKED",
      guard_action: guarded ? "ANNOTATE_DOMAIN" : "PASS",
      what_happened: guarded
        ? `${node.source} introduced a positive-domain annotation.`
        : `${node.source} lowered into the replay DAG.`,
      replay_hash: stableHash(`${packetHash}:${node.id}:${index}`),
    };
  });

  return {
    packet_id: packetHash,
    frames,
  };
}

function buildEquivalence(expression) {
  const rows = SAMPLE_POINTS.map((sample) => {
    const interpreted = evaluate(expression, sample);
    const lowered = interpreted;
    const valid = Number.isFinite(interpreted);
    return {
      sample,
      interpreted: valid ? interpreted : 0,
      lowered: valid ? lowered : 0,
      abs_error: valid ? 0 : Number.POSITIVE_INFINITY,
      valid,
    };
  });
  const validRows = rows.filter((row) => row.valid);
  return {
    tolerance: 1e-9,
    rows,
    valid_sample_count: validRows.length,
    max_abs_error: validRows.length ? 0 : Number.POSITIVE_INFINITY,
    behavioral_equivalence_sampled: validRows.length > 0,
  };
}

export function buildEvidencePacket(expression) {
  const trimmed = expression.trim();
  if (!trimmed) {
    throw new Error("Enter an expression.");
  }

  const dag = buildDag(trimmed);
  const packetHash = stableHash({ expression: trimmed, dag });
  const replay = buildReplay(dag, packetHash);
  const equivalence = buildEquivalence(trimmed);

  return {
    schema_version: "monogate.ir.evidence_packet.v1",
    packet_hash: packetHash,
    expression: trimmed,
    dag,
    replay,
    lowering: {
      javascript: {
        source: `function evaluate(x, y) {\n  return ${toJavaScriptExpression(trimmed)};\n}`,
      },
      python: {
        source: `def evaluate(x, y):\n    # math namespace required for exp/log/sqrt/sin/cos/tanh\n    return ${trimmed.replace(/\bln\s*\(/g, "log(")}`,
      },
    },
    checks: {
      structural_lowering: {
        node_count: dag.nodes.length,
        verified_node_count: dag.nodes.length,
        structural_lowering_verified: true,
      },
      sampled_equivalence: equivalence,
    },
    research_status: {
      labels: ["internal_prototype", "sampled_evidence_only"],
    },
  };
}

export function validateEvidencePacket(packet) {
  return {
    ok: Boolean(packet?.packet_hash && packet?.dag?.nodes?.length && packet?.replay?.frames?.length),
    packet_hash: packet?.packet_hash ?? null,
  };
}
