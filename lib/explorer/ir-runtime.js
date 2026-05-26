/**
 * Browser mirror of the canonical EML IR API in monogate/lib/src/ir.js.
 *
 * Keep this file behavior-compatible with `monogate/ir` until the npm package
 * published to Vercel exposes the IR subpath. The canonical contract, schemas,
 * and tests live in the core monogate package.
 */

const COMMUTATIVE = new Set(["add", "mul"]);
const STRUCTURAL_LOWERING_SCHEMA = "monogate.eml_ir.structural_lowering.v1";
const EVIDENCE_PACKET_SCHEMA = "monogate.eml_ir.evidence_packet.v1";

const TREE_COST = {
  input: 0,
  constant: 0,
  neg: 2,
  add: 2,
  sub: 2,
  mul: 2,
  div: 2,
  pow: 3,
  exp: 1,
  ln: 1,
  sqrt: 3,
  sin: 1,
  cos: 1,
  tanh: 1,
};

const JS_OP = {
  neg: (a) => `(-${a})`,
  add: (a, b) => `(${a} + ${b})`,
  sub: (a, b) => `(${a} - ${b})`,
  mul: (a, b) => `(${a} * ${b})`,
  div: (a, b) => `(${a} / ${b})`,
  pow: (a, b) => `Math.pow(${a}, ${b})`,
  exp: (a) => `Math.exp(${a})`,
  ln: (a) => `Math.log(${a})`,
  sqrt: (a) => `Math.sqrt(${a})`,
  sin: (a) => `Math.sin(${a})`,
  cos: (a) => `Math.cos(${a})`,
  tanh: (a) => `Math.tanh(${a})`,
};

const PY_OP = {
  neg: (a) => `(-${a})`,
  add: (a, b) => `(${a} + ${b})`,
  sub: (a, b) => `(${a} - ${b})`,
  mul: (a, b) => `(${a} * ${b})`,
  div: (a, b) => `(${a} / ${b})`,
  pow: (a, b) => `math.pow(${a}, ${b})`,
  exp: (a) => `math.exp(${a})`,
  ln: (a) => `math.log(${a})`,
  sqrt: (a) => `math.sqrt(${a})`,
  sin: (a) => `math.sin(${a})`,
  cos: (a) => `math.cos(${a})`,
  tanh: (a) => `math.tanh(${a})`,
};

const RESEARCH_STATUS_LEVELS = {
  verified: {
    public_label: "verified",
    public_ready: true,
    meaning: "Mechanically checked or directly structural within the declared contract.",
  },
  sampled: {
    public_label: "sampled",
    public_ready: false,
    meaning: "Finite numerical evidence only; useful as a regression signal, not a proof.",
  },
  prototype: {
    public_label: "prototype",
    public_ready: false,
    meaning: "Internal research artifact with explicit non-claim boundaries.",
  },
  blocked: {
    public_label: "blocked",
    public_ready: false,
    meaning: "Known missing prerequisite or failed gate.",
  },
};

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function stableHash(value) {
  const text = typeof value === "string" ? value : stableStringify(value);
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= BigInt(text.charCodeAt(i));
    hash = BigInt.asUintN(64, hash * prime);
  }
  return `fnv1a64:${hash.toString(16).padStart(16, "0")}`;
}

function parseExpression(input) {
  let pos = 0;
  const s = input.replace(/\s+/g, "");

  const peek = () => s[pos];
  const consume = (ch) => {
    if (s[pos] !== ch) throw new Error(`expected ${ch}`);
    pos += 1;
  };

  function parseAdd() {
    let left = parseMul();
    while (pos < s.length && (peek() === "+" || peek() === "-")) {
      const op = peek();
      pos += 1;
      const right = parseMul();
      left = { type: op === "+" ? "add" : "sub", args: [left, right] };
    }
    return left;
  }

  function parseMul() {
    let left = parsePow();
    while (pos < s.length && (peek() === "*" || peek() === "/")) {
      if (peek() === "*" && s[pos + 1] === "*") break;
      const op = peek();
      pos += 1;
      const right = parsePow();
      left = { type: op === "*" ? "mul" : "div", args: [left, right] };
    }
    return left;
  }

  function parsePow() {
    let base = parseUnary();
    if (pos < s.length && (peek() === "^" || s.slice(pos, pos + 2) === "**")) {
      if (peek() === "*") pos += 2;
      else pos += 1;
      base = { type: "pow", base, exponent: parseUnary() };
    }
    return base;
  }

  function parseUnary() {
    if (peek() === "-") {
      pos += 1;
      return { type: "neg", arg: parseUnary() };
    }
    return parseAtom();
  }

  function parseAtom() {
    if (/[0-9.]/.test(peek())) {
      let text = "";
      while (pos < s.length && /[0-9.eE+-]/.test(s[pos])) {
        if ((s[pos] === "+" || s[pos] === "-") && text.length > 0 && !/[eE]/.test(text[text.length - 1])) break;
        text += s[pos];
        pos += 1;
      }
      return { type: "num", value: Number(text) };
    }
    if (peek() === "(") {
      consume("(");
      const inner = parseAdd();
      consume(")");
      return inner;
    }

    let name = "";
    while (pos < s.length && /[a-zA-Z_0-9]/.test(s[pos])) {
      name += s[pos];
      pos += 1;
    }
    if (!name) throw new Error("unexpected character");
    if (name === "pi") return { type: "num", value: Math.PI };
    if (name === "e" && peek() !== "(") return { type: "num", value: Math.E };

    if (peek() === "(") {
      consume("(");
      const args = [];
      if (peek() !== ")") {
        args.push(parseAdd());
        while (peek() === ",") {
          pos += 1;
          args.push(parseAdd());
        }
      }
      consume(")");
      const fn = name.toLowerCase();
      if (fn === "log" || fn === "ln") return { type: "ln", arg: args[0] };
      if (fn === "sqrt") return { type: "sqrt", arg: args[0] };
      if (["exp", "sin", "cos", "tanh", "neg"].includes(fn)) return { type: fn, arg: args[0] };
      if (["add", "sub", "mul", "div"].includes(fn)) return { type: fn, args };
      if (fn === "pow") return { type: "pow", base: args[0], exponent: args[1] };
      throw new Error(`unsupported function ${name}`);
    }
    return { type: "sym", name };
  }

  const parsed = parseAdd();
  if (pos !== s.length) throw new Error("unexpected trailing characters");
  return parsed;
}

function opKind(node) {
  if (node.type === "num") return "constant";
  if (node.type === "sym") return "input";
  return node.type;
}

function childrenOf(node, kind) {
  if (kind === "constant" || kind === "input") return [];
  if (node.arg) return [node.arg];
  if (node.args) return node.args;
  if (node.base) return [node.base, node.exponent];
  return [];
}

function literalOf(node, kind) {
  if (kind === "constant") return Object.is(node.value, -0) ? 0 : node.value;
  if (kind === "input") return node.name;
  return null;
}

function domainAnnotations(kind, argIds) {
  if (kind === "ln") return [{ kind: "requires_positive", arg: argIds[0], reason: "ln argument must be positive" }];
  if (kind === "sqrt") return [{ kind: "requires_nonnegative", arg: argIds[0], reason: "sqrt argument must be nonnegative" }];
  if (kind === "div") return [{ kind: "requires_nonzero", arg: argIds[1], reason: "division denominator must be nonzero" }];
  if (kind === "pow") return [{ kind: "domain_sensitive", args: argIds, reason: "pow domain depends on base and exponent" }];
  return [];
}

function totalTreeCost(node) {
  const kind = opKind(node);
  return TREE_COST[kind] + childrenOf(node, kind).reduce((sum, child) => sum + totalTreeCost(child), 0);
}

function requireDag(expressionOrDag) {
  return expressionOrDag?.schema_version === "monogate.eml_ir.v1" ? expressionOrDag : normalizeDag(expressionOrDag);
}

function sortedInputs(dag) {
  return dag.nodes.filter((node) => node.op_kind === "input").map((node) => node.literal).sort();
}

function literalCode(value) {
  if (!Number.isFinite(value)) throw new Error(`cannot lower non-finite literal ${value}`);
  return Object.is(value, -0) ? "0" : String(value);
}

function lowerNodeExpression(node, names, ops) {
  if (node.op_kind === "input") return node.literal;
  if (node.op_kind === "constant") return literalCode(node.literal);
  const args = node.args.map((id) => names.get(id));
  return ops[node.op_kind](...args);
}

export function normalizeDag(expression) {
  const tree = typeof expression === "string" ? parseExpression(expression) : expression;
  const nodes = [];
  const byKey = new Map();

  function visit(node) {
    const kind = opKind(node);
    if (!(kind in TREE_COST)) throw new Error(`unsupported primitive ${kind}`);
    const childRecords = childrenOf(node, kind).map(visit);
    let args = childRecords.map((child) => child.id);
    let childHashes = childRecords.map((child) => child.structural_hash);

    if (COMMUTATIVE.has(kind)) {
      const sorted = childRecords.map((child) => ({ id: child.id, hash: child.structural_hash })).sort((a, b) => a.hash.localeCompare(b.hash));
      args = sorted.map((child) => child.id);
      childHashes = sorted.map((child) => child.hash);
    }

    const literal = literalOf(node, kind);
    const structural_hash = stableHash({ op_kind: kind, args: childHashes, literal });
    const key = stableStringify({ op_kind: kind, args: childHashes, literal });
    if (byKey.has(key)) return byKey.get(key);

    const record = { id: `n${nodes.length}`, structural_hash };
    nodes.push({
      id: record.id,
      op_kind: kind,
      args,
      literal,
      structural_hash,
      domain_annotations: domainAnnotations(kind, args),
      tree_cost: TREE_COST[kind],
    });
    byKey.set(key, record);
    return record;
  }

  const root = visit(tree).id;
  return {
    schema_version: "monogate.eml_ir.v1",
    source: expression,
    root,
    nodes,
    tree_cost: totalTreeCost(tree),
    dag_cost: nodes.reduce((sum, node) => sum + node.tree_cost, 0),
    boundaries: {
      public_savings_claim: false,
      formal_verification_claim: false,
      compiler_release_claim: false,
    },
  };
}

export function lowerDagToJS(expressionOrDag) {
  const dag = requireDag(expressionOrDag);
  const inputs = sortedInputs(dag);
  const names = new Map();
  const lines = [];
  for (const node of dag.nodes) {
    const expr = lowerNodeExpression(node, names, JS_OP);
    names.set(node.id, node.id);
    lines.push(`  const ${node.id} = ${expr};`);
  }
  return {
    language: "javascript",
    function_name: "lowered",
    inputs,
    source: [`function lowered(${inputs.join(", ")}) {`, ...lines, `  return ${dag.root};`, `}`].join("\n"),
  };
}

export function lowerDagToPython(expressionOrDag) {
  const dag = requireDag(expressionOrDag);
  const inputs = sortedInputs(dag);
  const names = new Map();
  const lines = ["import math", "", `def lowered(${inputs.join(", ")}):`];
  for (const node of dag.nodes) {
    const expr = lowerNodeExpression(node, names, PY_OP);
    names.set(node.id, node.id);
    lines.push(`    ${node.id} = ${expr}`);
  }
  lines.push(`    return ${dag.root}`);
  return { language: "python", function_name: "lowered", inputs, source: lines.join("\n") };
}

export function evaluateDag(expressionOrDag, sample = {}) {
  const dag = requireDag(expressionOrDag);
  const values = new Map();
  for (const node of dag.nodes) {
    const args = node.args.map((id) => values.get(id));
    const value = {
      input: () => {
        if (!(node.literal in sample)) throw new Error(`missing sample value for ${node.literal}`);
        return sample[node.literal];
      },
      constant: () => node.literal,
      neg: () => -args[0],
      add: () => args[0] + args[1],
      sub: () => args[0] - args[1],
      mul: () => args[0] * args[1],
      div: () => args[0] / args[1],
      pow: () => Math.pow(args[0], args[1]),
      exp: () => Math.exp(args[0]),
      ln: () => Math.log(args[0]),
      sqrt: () => Math.sqrt(args[0]),
      sin: () => Math.sin(args[0]),
      cos: () => Math.cos(args[0]),
      tanh: () => Math.tanh(args[0]),
    }[node.op_kind]();
    values.set(node.id, value);
  }
  return values.get(dag.root);
}

function createLoweredJSFunction(lowering) {
  return new Function(`${lowering.source}; return ${lowering.function_name};`)();
}

function defaultSamples(inputs) {
  if (inputs.length === 0) return [{}];
  return [0.25, 0.75, 1.25, 2.0, 3.0].map((seed) => Object.fromEntries(inputs.map((name, index) => [name, seed + index * 0.5])));
}

export function checkSampledEquivalence(expressionOrDag, options = {}) {
  const dag = requireDag(expressionOrDag);
  const js = lowerDagToJS(dag);
  const lowered = createLoweredJSFunction(js);
  const samples = options.samples ?? defaultSamples(js.inputs);
  const tolerance = options.tolerance ?? 1e-12;
  let max_abs_error = 0;
  let valid_sample_count = 0;
  let invalid_sample_count = 0;
  const rows = samples.map((sample) => {
    const interpreted = evaluateDag(dag, sample);
    const loweredValue = lowered(...js.inputs.map((name) => sample[name]));
    const abs_error = Math.abs(interpreted - loweredValue);
    const valid = Number.isFinite(interpreted) && Number.isFinite(loweredValue) && Number.isFinite(abs_error);
    if (valid) {
      valid_sample_count += 1;
      max_abs_error = Math.max(max_abs_error, abs_error);
    } else {
      invalid_sample_count += 1;
    }
    return { sample, interpreted, lowered: loweredValue, abs_error, valid };
  });
  return {
    schema_version: "monogate.eml_ir.sampled_equivalence.v1",
    method: "dag_interpreter_vs_lowered_javascript",
    inputs: js.inputs,
    tolerance,
    sample_count: samples.length,
    valid_sample_count,
    invalid_sample_count,
    max_abs_error,
    behavioral_equivalence_sampled: valid_sample_count > 0 && invalid_sample_count === 0 && max_abs_error <= tolerance,
    rows,
    boundaries: {
      sampled_evidence_only: true,
      formal_verification_claim: false,
      compiler_release_claim: false,
    },
  };
}

export function checkStructuralLowering(expressionOrDag) {
  const dag = requireDag(expressionOrDag);
  const available = new Set(["input", "constant", ...Object.keys(JS_OP)]);
  const rows = dag.nodes.map((node) => {
    const supported = available.has(node.op_kind) && (node.op_kind in PY_OP || ["input", "constant"].includes(node.op_kind));
    return {
      node_id: node.id,
      op_kind: node.op_kind,
      javascript_rule: node.op_kind === "input" || node.op_kind === "constant" ? "literal_or_input" : `JS_OP.${node.op_kind}`,
      python_rule: node.op_kind === "input" || node.op_kind === "constant" ? "literal_or_input" : `PY_OP.${node.op_kind}`,
      structural_lowering_verified: supported,
    };
  });
  return {
    schema_version: STRUCTURAL_LOWERING_SCHEMA,
    method: "per_node_direct_lowering_rule_presence",
    node_count: dag.nodes.length,
    verified_node_count: rows.filter((row) => row.structural_lowering_verified).length,
    structural_lowering_verified: rows.every((row) => row.structural_lowering_verified),
    rows,
    boundaries: {
      structural_contract_only: true,
      host_float_semantics_claim: false,
      formal_verification_claim: false,
      compiler_release_claim: false,
    },
  };
}

function replayHash(prev, frame) {
  const copy = { ...frame };
  delete copy.replay_hash;
  return stableHash({ previous: prev, frame: copy });
}

export function emitReplayPacket(expressionOrDag) {
  const dag = requireDag(expressionOrDag);
  const frames = [];
  let prev = "GENESIS";
  const push = (frame) => {
    const full = {
      schema_version: "monogate.eml_ir.replay.v1",
      frame_index: frames.length,
      frame_id: `irv1_${String(frames.length).padStart(4, "0")}`,
      replay_hash_prev: prev,
      ...frame,
    };
    full.replay_hash = replayHash(prev, full);
    prev = full.replay_hash;
    frames.push(full);
  };

  push({ lifecycle_state: "INIT", what_happened: "IR replay packet initialized." });
  push({ lifecycle_state: "READY", root: dag.root, node_count: dag.nodes.length, tree_cost: dag.tree_cost, dag_cost: dag.dag_cost, what_happened: "Normalized DAG is ready for operation replay." });
  for (const node of dag.nodes) {
    push({
      lifecycle_state: "RUNNING",
      node_id: node.id,
      op_kind: node.op_kind,
      args: node.args,
      literal: node.literal,
      structural_hash: node.structural_hash,
      domain_annotations: node.domain_annotations,
      guard_action: node.domain_annotations.length ? "ANNOTATE_DOMAIN" : "PASS",
      what_happened: node.domain_annotations.length ? `${node.op_kind} replayed with domain annotation.` : `${node.op_kind} replayed without domain annotation.`,
    });
  }
  push({ lifecycle_state: "END", what_happened: "All normalized DAG nodes replayed." });
  push({ lifecycle_state: "PARKED", what_happened: "Explicit terminal replay boundary." });
  return { schema_version: "monogate.eml_ir.replay.v1", root: dag.root, tree_cost: dag.tree_cost, dag_cost: dag.dag_cost, frames, boundaries: dag.boundaries };
}

export function certifyLowering(expressionOrDag, options = {}) {
  const dag = requireDag(expressionOrDag);
  return {
    schema_version: "monogate.eml_ir.lowering_certificate.v1",
    dag,
    replay: emitReplayPacket(dag),
    lowering: {
      javascript: lowerDagToJS(dag),
      python: lowerDagToPython(dag),
    },
    structural: checkStructuralLowering(dag),
    equivalence: checkSampledEquivalence(dag, options),
    boundaries: {
      sampled_evidence_only: true,
      structural_contract_only: true,
      public_savings_claim: false,
      formal_verification_claim: false,
      compiler_release_claim: false,
    },
  };
}

export function researchStatusLevels() {
  return typeof structuredClone === "function"
    ? structuredClone(RESEARCH_STATUS_LEVELS)
    : JSON.parse(JSON.stringify(RESEARCH_STATUS_LEVELS));
}

export function classifyEvidenceStatus(evidence) {
  const replayOk = evidence?.checks?.replay_validation?.ok ?? false;
  const structuralOk = evidence?.checks?.structural_lowering?.structural_lowering_verified ?? false;
  const sampledOk = evidence?.checks?.sampled_equivalence?.behavioral_equivalence_sampled ?? false;
  if (!replayOk || !structuralOk) {
    return {
      overall: "blocked",
      public_ready: false,
      labels: ["blocked"],
      reason: "A required replay or structural lowering gate failed.",
    };
  }
  if (sampledOk) {
    return {
      overall: "prototype",
      public_ready: false,
      labels: ["verified", "sampled", "prototype"],
      reason: "Replay and structural lowering gates pass, with sampled numerical evidence; this is still not a public theorem or compiler release.",
    };
  }
  return {
    overall: "prototype",
    public_ready: false,
    labels: ["verified", "prototype"],
    reason: "Replay and structural lowering gates pass, but sampled numerical equivalence did not pass.",
  };
}

export function buildEvidencePacket(expressionOrDag, options = {}) {
  const cert = certifyLowering(expressionOrDag, options);
  const replayValidation = validateReplayPacket(cert.replay);
  const packet = {
    schema_version: EVIDENCE_PACKET_SCHEMA,
    source_expression: cert.dag.source,
    dag: cert.dag,
    replay: cert.replay,
    lowering: cert.lowering,
    checks: {
      replay_validation: replayValidation,
      structural_lowering: cert.structural,
      sampled_equivalence: cert.equivalence,
    },
    research_status: null,
    status_levels: RESEARCH_STATUS_LEVELS,
    boundaries: {
      public_savings_claim: false,
      formal_verification_claim: false,
      compiler_release_claim: false,
      sampled_evidence_only: true,
      structural_contract_only: true,
    },
  };
  packet.research_status = classifyEvidenceStatus(packet);
  packet.packet_hash = stableHash({ ...packet, packet_hash: null });
  return packet;
}

export function validateEvidencePacket(packet) {
  const errors = [];
  if (packet?.schema_version !== EVIDENCE_PACKET_SCHEMA) errors.push("schema_version mismatch");
  const replay = validateReplayPacket(packet?.replay ?? {});
  if (!replay.ok) errors.push(...replay.errors.map((error) => `replay: ${error}`));
  if (!packet?.checks?.structural_lowering?.structural_lowering_verified) {
    errors.push("structural lowering gate failed");
  }
  if (packet?.boundaries?.formal_verification_claim !== false) {
    errors.push("formal_verification_claim boundary must be false");
  }
  if (packet?.boundaries?.public_savings_claim !== false) {
    errors.push("public_savings_claim boundary must be false");
  }
  const expectedHash = stableHash({ ...packet, packet_hash: null });
  if (packet?.packet_hash !== expectedHash) errors.push("packet_hash mismatch");
  return { ok: errors.length === 0, errors };
}

export function validateReplayPacket(packet) {
  const errors = [];
  let prev = "GENESIS";
  for (const [index, frame] of (packet.frames ?? []).entries()) {
    if (frame.frame_index !== index) errors.push(`frame ${index} has incorrect frame_index`);
    if (frame.replay_hash_prev !== prev) errors.push(`frame ${index} has incorrect replay_hash_prev`);
    const expected = replayHash(prev, frame);
    if (frame.replay_hash !== expected) errors.push(`frame ${index} has invalid replay_hash`);
    prev = frame.replay_hash;
  }
  const states = packet.frames?.map((frame) => frame.lifecycle_state) ?? [];
  if (states[0] !== "INIT" || states[1] !== "READY" || states.at(-2) !== "END" || states.at(-1) !== "PARKED") {
    errors.push("invalid lifecycle order");
  }
  return { ok: errors.length === 0, errors };
}
