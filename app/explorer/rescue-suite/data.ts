export type TraceFrame = {
  sample: number;
  input: string;
  rawEvent: string;
  rescueEvent: string;
  transition: string;
  metric: string;
};

export type RescueLane = {
  operator: string;
  fromEvent: string;
  toEvent: string;
  transition: string;
  obligation: string;
  source: string;
  fixture: string;
  packetSchema: string;
  claim: string;
  accent: string;
  frames: TraceFrame[];
};

export const replayStatus = {
  schema: "forge.optimizer.proof_carrying_rescue_replay.v0",
  sourceSchema: "forge.optimizer.proof_carrying_rescue_suite.v0",
  valid: true,
  issueCount: 0,
  laneCount: 4,
  manifest: "reports/proof_carrying_rescue_suite_v0_2026_05_26.json",
  replay: "reports/proof_carrying_rescue_replay_v0_2026_05_26.json",
};

export const boundaryFlags = [
  ["analysis_only", true],
  ["simulated_trace", true],
  ["semantic_rewrite_claim", false],
  ["optimizer_release_claim", false],
  ["hardware_observed", false],
  ["completed_formal_proof_claim", false],
] as const;

export const lanes: RescueLane[] = [
  {
    operator: "log_domain_lift",
    fromEvent: "domain_wall",
    toEvent: "log_domain_rescue",
    transition: "domain_wall->log_domain_rescue",
    obligation: "PositiveCoordinateObligation",
    source: "examples/proof_carrying_rescue.eml",
    fixture: "positive_log_energy(x) = ln(x) + sqrt(x) + 1/x",
    packetSchema: "forge.optimizer.proof_carrying_rescue.v1",
    claim: "Raw non-positive coordinates are lifted through exp(theta), preserving a positive internal coordinate path.",
    accent: "#6ab0f5",
    frames: [
      { sample: 0, input: "theta=-2.0 -> x=0.13533528", rawEvent: "domain_wall", rescueEvent: "log_domain_rescue", transition: "domain_wall->log_domain_rescue", metric: "finite: false -> true" },
      { sample: 1, input: "x=-0.5 -> 0.60653066", rawEvent: "domain_wall", rescueEvent: "log_domain_rescue", transition: "domain_wall->log_domain_rescue", metric: "finite: false -> true" },
      { sample: 2, input: "x=0.0 -> 1.00000000", rawEvent: "domain_wall", rescueEvent: "log_domain_rescue", transition: "domain_wall->log_domain_rescue", metric: "finite: false -> true" },
    ],
  },
  {
    operator: "guard_clamp",
    fromEvent: "overflow_wall",
    toEvent: "guard_rescue",
    transition: "overflow_wall->guard_rescue",
    obligation: "OutputSafetyObligation",
    source: "examples/guard_clamp_rescue.eml",
    fixture: "exp_pressure(x) = exp(x) + exp(x*x)",
    packetSchema: "forge.optimizer.guard_clamp_rescue.v1",
    claim: "Raw overflow pressure is replayed through a bounded guard coordinate, preserving finite output.",
    accent: "#4ade80",
    frames: [
      { sample: 3, input: "x=30.0 -> guard=8.0", rawEvent: "overflow_wall", rescueEvent: "guard_rescue", transition: "overflow_wall->guard_rescue", metric: "finite: false -> true" },
      { sample: 4, input: "x=710.0 -> guard=8.0", rawEvent: "overflow_wall", rescueEvent: "guard_rescue", transition: "overflow_wall->guard_rescue", metric: "finite: false -> true" },
      { sample: 5, input: "x=800.0 -> guard=8.0", rawEvent: "overflow_wall", rescueEvent: "guard_rescue", transition: "overflow_wall->guard_rescue", metric: "finite: false -> true" },
    ],
  },
  {
    operator: "precision_escape",
    fromEvent: "phantom_attractor",
    toEvent: "interior_sample",
    transition: "phantom_attractor->interior_sample",
    obligation: "PrecisionSensitivityObligation",
    source: "examples/precision_escape_rescue.eml",
    fixture: "quantized_basin(x) = (x - 0.375)^2",
    packetSchema: "forge.optimizer.precision_escape_rescue.v1",
    claim: "A finite low-precision stall is replayed at higher precision, exposing a descent direction and escape witness.",
    accent: "#a78bfa",
    frames: [
      { sample: 0, input: "x=0.25", rawEvent: "phantom_attractor", rescueEvent: "interior_sample", transition: "phantom_attractor->interior_sample", metric: "low grad 0.0, high grad -0.25" },
      { sample: 1, input: "x=0.5", rawEvent: "phantom_attractor", rescueEvent: "interior_sample", transition: "phantom_attractor->interior_sample", metric: "low grad 0.0, high grad 0.25" },
      { sample: 2, input: "x=0.75", rawEvent: "phantom_attractor", rescueEvent: "interior_sample", transition: "phantom_attractor->interior_sample", metric: "low grad 0.0, high grad 0.75" },
    ],
  },
  {
    operator: "saturation_deshelf",
    fromEvent: "saturation_shelf",
    toEvent: "corner_concentration",
    transition: "saturation_shelf->corner_concentration",
    obligation: "ClampInvariantObligation",
    source: "examples/saturation_deshelf_rescue.eml",
    fixture: "saturated_response(x) = clamp(exp(x), 0, 1)",
    packetSchema: "forge.optimizer.saturation_deshelf_rescue.v1",
    claim: "Finite clamp-shelf collapse is replayed through pre-clamp pressure, restoring measurable boundary structure.",
    accent: "#e8a020",
    frames: [
      { sample: 2, input: "x=2.0", rawEvent: "saturation_shelf", rescueEvent: "saturation_shelf", transition: "saturation_shelf->saturation_shelf", metric: "pressure 2.1269280110" },
      { sample: 3, input: "x=4.0", rawEvent: "saturation_shelf", rescueEvent: "corner_concentration", transition: "saturation_shelf->corner_concentration", metric: "pressure 4.0181499279" },
      { sample: 4, input: "x=8.0", rawEvent: "saturation_shelf", rescueEvent: "corner_concentration", transition: "saturation_shelf->corner_concentration", metric: "pressure 8.0003354064" },
    ],
  },
];
