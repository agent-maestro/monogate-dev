const COMMUTATIVE = new Set(["add", "mul"]);
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

function replayHash(prev, frame) {
  const copy = { ...frame };
  delete copy.replay_hash;
  return stableHash({ previous: prev, frame: copy });
}

export function emitReplayPacket(expressionOrDag) {
  const dag = expressionOrDag?.schema_version === "monogate.eml_ir.v1" ? expressionOrDag : normalizeDag(expressionOrDag);
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
