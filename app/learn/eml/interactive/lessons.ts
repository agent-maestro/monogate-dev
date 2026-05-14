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
  explanation: string;
  starterCode: string;
  whatYouAreLearning: string[];
  expectedConcepts: string[];
  successCriteria: string[];
  commonMistake: string;
  whyThisMatters: string;
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
    explanation: "This lesson starts with the smallest useful EML shape: a named module and one function. You are practicing the syntax Forge expects before any target output enters the picture.",
    starterCode: `module gaussian_lab;

fn gaussian(x: Real) -> Real {
  exp(-(x * x))
}
`,
    whatYouAreLearning: [
      "How to start an EML file with a module declaration.",
      "How to define a kernel function with fn.",
      "How to avoid older block-style examples that no longer match current Forge syntax.",
    ],
    expectedConcepts: [
      "Current syntax starts with module.",
      "A kernel function is declared with fn.",
      "The source is the identity; targets are outputs from that source.",
    ],
    successCriteria: [
      "The file has module name; near the top.",
      "The file has one fn declaration.",
      "The old kernel block shape is absent.",
    ],
    commonMistake: "Using older kernel block syntax. Replace it with module name; and fn name(...) -> Type { ... }.",
    whyThisMatters: "Every later lesson depends on the same current Forge syntax. If this shape is stale, target checks and contract sidecars become noisy before the real idea is tested.",
    hints: [
      "Keep the module name short and lowercase, such as gaussian_lab.",
      "Look for both keywords: module and fn.",
      "Return one Real value from the function body.",
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
    explanation: "This lesson treats targets as projections from one source file. The point is to keep the EML stable while looking at different target-shaped outputs.",
    starterCode: `module smoothstep_lab;

fn smoothstep(t: Real) -> Real {
  t * t * (3.0 - 2.0 * t)
}

// Compile target preview:
// python, rust, lean
`,
    whatYouAreLearning: [
      "How one EML source can request multiple target outputs.",
      "Why a target preview is not a replacement for the source.",
      "How to talk about target names without changing the kernel.",
    ],
    expectedConcepts: [
      "The .eml source stays stable while target output changes.",
      "Target output is not a new source of kernel truth.",
      "Different targets have different runtime shapes.",
    ],
    successCriteria: [
      "The source still uses module / fn syntax.",
      "The smoothstep expression remains visible.",
      "Python, Rust, Lean, and target language are named.",
    ],
    commonMistake: "Rewriting the source once per target. Keep one EML source and let Forge produce target-specific output.",
    whyThisMatters: "Target projection is the habit that keeps Monogate honest: one kernel source can feed different outputs while the source identity stays stable.",
    hints: [
      "Keep one module and one function.",
      "Use the target selector to compare sample command shapes.",
      "Name targets in comments if you are not compiling yet.",
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
    explanation: "This lesson adds a tiny trace to a tiny kernel. The browser can display that trace, but the trace and source remain the evidence boundary.",
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
    whatYouAreLearning: [
      "How to write expected input/output rows beside a small kernel.",
      "How to name a kernel hash placeholder without pretending it came from a live compile.",
      "How to keep projection output separate from the kernel.",
    ],
    expectedConcepts: [
      "A trace records expected inputs and outputs.",
      "A dashboard displays trace output.",
      "Projection output is not the oracle.",
    ],
    successCriteria: [
      "The kernel uses module / fn syntax.",
      "At least one expected row is present.",
      "kernel_sha256, trace, and projection are named.",
    ],
    commonMistake: "Letting the browser become the authority. Say it displays trace data; do not make it the source of truth.",
    whyThisMatters: "Same-kernel trace discipline is how demos, dashboards, and reports stay connected to the canonical kernel instead of becoming separate stories.",
    hints: [
      "Keep the expected rows close to the function.",
      "Use trace language for expected inputs and outputs.",
      "Describe the browser as a projection surface only.",
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
    explanation: "This lesson moves from pure kernel output into a component boundary. A requested value may need to be lowered or held because the component contract says so.",
    starterCode: `component passive_buzzer_12mm

requested_output: 0.82
safe_output: 0.62
safety_margin: 0.18
bottleneck: pwm_duty_margin
guard_action: limit_to_safe_output
`,
    whatYouAreLearning: [
      "How requested_output and safe_output can differ.",
      "How safety_margin, bottleneck, and guard_action explain the decision.",
      "How to write a component contract report without describing destructive tests.",
    ],
    expectedConcepts: [
      "Physical outputs need explicit guard fields.",
      "Requested output and safe output can differ.",
      "The bottleneck explains which limit controlled the decision.",
    ],
    successCriteria: [
      "requested_output and safe_output are both present.",
      "safety_margin, bottleneck, and guard_action are present.",
      "No destructive hardware framing appears.",
    ],
    commonMistake: "Reporting only the requested output. The lesson needs the safe output and the guard reason too.",
    whyThisMatters: "Guard and component safety make physical demos reviewable. The contract explains what was requested, what was allowed, and why.",
    hints: [
      "Keep safety_margin, bottleneck, and guard_action present.",
      "Keep this USB-safe and contract-level.",
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
    explanation: "This lesson is a command-plan exercise. You are describing a supported source path and leaving actual command evidence to the runner.",
    starterCode: `# source fixture: gaussian.py
def gaussian(x):
    return exp(-(x * x))

# path:
# supported source -> eFrog -> Forge-compatible EML -> target flow
# command evidence belongs to the runner
`,
    whatYouAreLearning: [
      "How to describe a supported source fixture.",
      "How eFrog, EML, and Forge target output fit together.",
      "How to avoid inventing command output.",
    ],
    expectedConcepts: [
      "eFrog starts from supported source fixtures.",
      "Forge consumes EML.",
      "Command output should come from a runner, not from a guess.",
    ],
    successCriteria: [
      "The path names supported source, eFrog, Forge-compatible EML, and target.",
      "The answer says command evidence belongs to the runner.",
      "No arbitrary-source capability claim appears.",
    ],
    commonMistake: "Claiming command output without running the commands. In this MVP, write the plan and keep evidence runner-owned.",
    whyThisMatters: "The eFrog to Forge path connects existing source fixtures to EML without turning planning text into fake execution evidence.",
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
    explanation: "This lesson teaches report discipline. The result can be useful and still stay bounded to the test set that produced it.",
    starterCode: `OBSERVATION:
Across this test set, current-engine additivity matched 893/893 analyzable rows.

Limitations:
- This is bounded to the recorded fixture set.
- Older divergences were classified as recorded-column drift.

Reproduce:
python tools/graph/builder_v2.py invariants
`,
    whatYouAreLearning: [
      "How to write OBSERVATION-tier findings.",
      "How to bind a claim to a test set.",
      "How to include limitations and a reproducible command.",
    ],
    expectedConcepts: [
      "Use OBSERVATION-tier language.",
      "Say across this test set.",
      "Include limitations and reproducible commands.",
    ],
    successCriteria: [
      "OBSERVATION appears as the tier.",
      "The phrase across this test set appears.",
      "Limitations and a reproduce command are present.",
    ],
    commonMistake: "Writing a broad conclusion from a small result set. Keep the scope tied to the rows and commands shown.",
    whyThisMatters: "FINDINGS discipline is what keeps research useful without overstating what the evidence supports.",
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
    explanation: "This lesson turns engineering evidence into a release decision. Passing tests can still be NO-GO if the worktree, token handling, or public-copy risks are unresolved.",
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
    whatYouAreLearning: [
      "How to classify release blockers after gates pass.",
      "How to separate dirty source files from generated artifacts.",
      "How to stop before publish, push, or deploy when approval or token rotation is needed.",
    ],
    expectedConcepts: [
      "Passing tests are not the whole release decision.",
      "Dirty files need classification.",
      "Token-like strings force a stop-and-rotate path.",
    ],
    successCriteria: [
      "The decision says GO or NO-GO.",
      "Dirty files, token handling, and approval boundaries are named.",
      "The answer says not to publish, push, or deploy without approval.",
    ],
    commonMistake: "Treating green tests as automatic release approval. Gates are evidence, not the whole decision.",
    whyThisMatters: "Audit and release discipline is what lets a Monogate agent help near high-blast-radius work without crossing the line on its own.",
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
