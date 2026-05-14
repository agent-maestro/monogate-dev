export type CheckKind =
  | "currentSyntax"
  | "requiredTerms"
  | "restrictedTerms"
  | "guardContract"
  | "findingsDiscipline"
  | "auditDiscipline"
  | "noDestructiveHardware"
  | "roundtripDiscipline";

export type ContractSummary = {
  inputs: string[];
  outputs: string[];
  stateVariables: string[];
  guardStatus: string;
  evidenceStatus: string;
};

export type Lesson = {
  id: string;
  title: string;
  objective: string;
  starterCode: string;
  expectedConcepts: string[];
  hints: string[];
  checks: Array<{
    kind: CheckKind;
    label: string;
    terms?: string[];
  }>;
  sampleOutput: string;
  nextStep: string;
  contract?: ContractSummary;
};

export const lessons: Lesson[] = [
  {
    id: "tiny_eml_kernel",
    title: "Tiny EML kernel",
    objective: "Write current Forge syntax with a module and function, then pass the local structure checks.",
    starterCode: `module gaussian_lab;

fn gaussian(x: Real) -> Real {
  exp(-(x * x))
}
`,
    expectedConcepts: [
      "Current syntax starts with module.",
      "A kernel function is declared with fn.",
      "The source is the identity; targets are outputs from that source.",
    ],
    hints: [
      "Keep the module name simple.",
      "Use fn, not older block syntax.",
      "Return one Real value from the function.",
    ],
    checks: [
      { kind: "currentSyntax", label: "Uses module / fn syntax" },
      { kind: "requiredTerms", label: "Contains gaussian and exp", terms: ["gaussian", "exp"] },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Forge format: PASS
Target preview: Lean or Python target can be requested locally
Kernel hash: shown after real compile/check tooling is connected
Contract: pending
Evidence: local lesson only`,
    nextStep: "Try changing the function name, then restore gaussian and rerun checks.",
  },
  {
    id: "compile_targets",
    title: "Compile targets",
    objective: "Use the same EML source as the input for Python, Rust, and Lean target previews.",
    starterCode: `module smoothstep_lab;

fn smoothstep(t: Real) -> Real {
  t * t * (3.0 - 2.0 * t)
}

// Compile target preview:
// python, rust, lean
`,
    expectedConcepts: [
      "The .eml source stays stable while target output changes.",
      "Target output is not a new source of kernel truth.",
      "Different targets have different runtime shapes.",
    ],
    hints: [
      "Keep one module and one function.",
      "Use the target selector to compare sample output.",
      "Do not rewrite the source for each target.",
    ],
    checks: [
      { kind: "currentSyntax", label: "Uses current Forge syntax" },
      { kind: "requiredTerms", label: "Contains smoothstep structure", terms: ["smoothstep", "3.0", "2.0"] },
      { kind: "requiredTerms", label: "Names compile targets", terms: ["python", "rust", "lean", "target"] },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Format: PASS
Python target preview: def smoothstep(t): ...
Rust target preview: pub fn smoothstep(...)
Lean target preview: def smoothstep ...`,
    nextStep: "Select another target preview and notice that the source identity stays the same.",
  },
  {
    id: "conformance_trace",
    title: "Conformance trace",
    objective: "Connect a small kernel to expected rows and keep browser output as projection data.",
    starterCode: `module trace_lab;

fn double_unit(x: Real) -> Real {
  x * 2.0
}

// kernel_sha256: lesson-local-placeholder
// expected rows:
// x=0.0 -> 0.0
// x=0.5 -> 1.0
// projection: browser displays trace data, not kernel truth
`,
    expectedConcepts: [
      "A trace records expected inputs and outputs.",
      "A dashboard displays trace output.",
      "Projection output is not the oracle.",
    ],
    hints: [
      "Keep the expected rows visible.",
      "Name the trace relationship in a comment.",
      "Do not say the browser recomputes the kernel.",
    ],
    checks: [
      { kind: "currentSyntax", label: "Uses module / fn syntax" },
      { kind: "requiredTerms", label: "Names expected trace rows", terms: ["expected", "0.5", "1.0"] },
      { kind: "requiredTerms", label: "Names kernel hash, trace, and projection boundary", terms: ["kernel_sha256", "trace", "projection"] },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Trace check: 2 rows described
Projection note: browser displays trace data
Evidence: local lesson only`,
    nextStep: "Add one more expected row and rerun checks.",
  },
  {
    id: "guard_component_contract",
    title: "Guard / component contract",
    objective: "Separate requested output from safe output and explain the guard fields.",
    starterCode: `component passive_buzzer_12mm

requested_output: 0.82
safe_output: 0.62
safety_margin: 0.18
bottleneck: pwm_duty_margin
guard_action: limit_to_safe_output
`,
    expectedConcepts: [
      "Physical outputs need explicit guard fields.",
      "Requested output and safe output can differ.",
      "The bottleneck explains which limit controlled the decision.",
    ],
    hints: [
      "Keep safety_margin, bottleneck, and guard_action present.",
      "Do not describe destructive hardware tests.",
      "This is a contract report, not a hardware run.",
    ],
    checks: [
      { kind: "guardContract", label: "Contains guard contract fields" },
      { kind: "noDestructiveHardware", label: "Avoids destructive hardware framing" },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Contract: valid shape
Guard status: designed
Evidence: local lesson only
Action: keep requested_output and safe_output separate`,
    nextStep: "Change requested_output above safe_output and explain why the guard lowers it.",
    contract: {
      inputs: ["pot_raw", "prev_buzzer"],
      outputs: ["buzzer", "led", "oled", "browser"],
      stateVariables: ["prev_buzzer"],
      guardStatus: "designed",
      evidenceStatus: "local lesson only",
    },
  },
  {
    id: "efrog_roundtrip",
    title: "eFrog roundtrip",
    objective: "Describe a supported Python fixture moving through eFrog, EML, and a Forge Python target.",
    starterCode: `# source fixture: gaussian.py
def gaussian(x):
    return exp(-(x * x))

# path:
# supported source -> eFrog -> Forge-compatible EML -> target flow
# command evidence belongs to the runner
`,
    expectedConcepts: [
      "eFrog starts from supported source fixtures.",
      "Forge consumes EML.",
      "Command output should come from a runner, not from a guess.",
    ],
    hints: [
      "Name each artifact in the path.",
      "Keep this as a plan unless a runner executes commands.",
      "Do not claim arbitrary source support.",
    ],
    checks: [
      { kind: "roundtripDiscipline", label: "Names supported source to eFrog to target flow" },
      { kind: "requiredTerms", label: "Keeps command evidence separate", terms: ["runner"] },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Plan: source fixture -> eFrog -> emitted EML -> Forge Python target
Command evidence: runner-owned in later lessons
Evidence: local lesson only`,
    nextStep: "Add the exact command sequence you would expect a runner to execute.",
  },
  {
    id: "findings_discipline",
    title: "FINDINGS discipline",
    objective: "Write an observation-tier summary from a small result set without overclaiming.",
    starterCode: `OBSERVATION:
Across this test set, current-engine additivity matched 893/893 analyzable rows.

Limitations:
- This is bounded to the recorded fixture set.
- Older divergences were classified as recorded-column drift.

Reproduce:
python tools/graph/builder_v2.py invariants
`,
    expectedConcepts: [
      "Use OBSERVATION-tier language.",
      "Say across this test set.",
      "Include limitations and reproducible commands.",
    ],
    hints: [
      "Avoid stronger language than the data supports.",
      "Use numbers only when they come from the fixture.",
      "Keep the reproduce command visible.",
    ],
    checks: [
      { kind: "findingsDiscipline", label: "Uses observation-tier report structure" },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `FINDINGS shape: PASS
Limitations: present
Reproduce command: present
Evidence: local lesson only`,
    nextStep: "Add one more limitation and rerun checks.",
  },
  {
    id: "audit_release_discipline",
    title: "Audit / release discipline",
    objective: "Make a GO or NO-GO decision from gates, dirty files, stale copy, and token risk.",
    starterCode: `Decision: NO-GO

Evidence:
- tests passed
- build passed
- twine check passed
- dirty files include generated artifacts
- token-like string appeared in chat/log

Action:
- do not publish without approval
- do not push without approval
- do not deploy without approval
- rotate exposed token before release
- commit source/docs separately from generated media
`,
    expectedConcepts: [
      "Passing tests are not the whole release decision.",
      "Dirty files need classification.",
      "Token-like strings force a stop-and-rotate path.",
    ],
    hints: [
      "Use GO or NO-GO explicitly.",
      "Say what blocks release.",
      "Keep generated artifacts out of release commits unless approved.",
    ],
    checks: [
      { kind: "auditDiscipline", label: "Contains disciplined release decision" },
      { kind: "restrictedTerms", label: "Avoids restricted public-claim wording" },
    ],
    sampleOutput: `Release decision: NO-GO
Risk classification: present
Approval boundary: present
Evidence: local lesson only`,
    nextStep: "Change one evidence line and see whether the decision should stay NO-GO.",
  },
];
