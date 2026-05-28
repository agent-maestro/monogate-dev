import gaussianEnergyJson from "./data/gaussian_energy_v0_packet_2026_05_27.json";
import guardLensJson from "./data/eml_a10_expression_guard_lens_2026_05_27.json";
import sigmoidDerivativeJson from "./data/sigmoid_derivative_v0_packet_2026_05_27.json";
import softplusPairJson from "./data/softplus_pair_v0_packet_2026_05_27.json";

export type EmlNode = {
  id: string;
  kind: string;
  op: string | null;
  args: string[];
  source: string;
  reuse_count: number;
};

export type EmlReplayFrame = {
  frame_id: string;
  monotonic_tick: number;
  lifecycle_state: string;
  kernel_id: string;
  guard_action: string;
  guard_reason: string;
  replay_hash: string;
  replay_hash_prev: string | null;
};

export type EmlDomainSafety = {
  schemaVersion: string;
  status: string;
  domainRequirements: Array<{
    requirementId: string;
    nodeId?: string;
    trigger: string;
    requirement: string;
    status: string;
    blockedPublicClaim: string;
    possibleSafeRewrite: string;
    checkedBy?: string;
    proofArtifact?: string;
    proofSummary?: string;
  }>;
  rangeAssumptions: Array<{
    input: string;
    min: number;
    max: number;
    status: string;
    blockedPublicClaim: string;
    possibleSafeRewrite: string;
  }>;
  unresolvedObligations: Array<{
    obligationId: string;
    kind: string;
    proofTarget: string;
    reason: string;
  }>;
  checkedObligations: Array<{
    obligationId: string;
    kind: string;
    proofTarget: string;
    checkedBy?: string;
    proofArtifact?: string;
    proofSummary?: string;
  }>;
  possibleSafeRewrites: string[];
  blockedPublicClaims: string[];
  summary: {
    domain_requirement_count: number;
    range_assumption_count: number;
    unresolved_obligation_count: number;
    checked_obligation_count: number;
    checked_domain_requirement_count: number;
    safe_rewrite_candidate_count: number;
    blocked_public_claim_count: number;
    proved_count: number;
  };
  nonClaims: string[];
};

export type EmlPacketResult = {
  schemaVersion: string;
  artifactId: string;
  date: string;
  status: string;
  sourcePacket: {
    program_id: string;
    family: string;
    expression: string;
    inputs: string[];
    units: Record<string, string>;
    safe_ranges: Record<string, { min: number; max: number }>;
    physical_meaning: string;
    source_repo: string;
    claim_flags: Record<string, boolean>;
  };
  ir: {
    programId: string;
    outputNode: string;
    nodeCount: number;
    edgeCount: number;
    nodes: EmlNode[];
    reusedNodes: EmlNode[];
  };
  costs: {
    canonicalPublicTreeSuperbestNodes: number;
    internalDagSuperbestNodes: number;
    internalExtraDagSavingsNodes: number;
    canonicalPublicTreeEmlNodes: number;
    internalDagEmlNodes: number;
    publicSavingsClaim: boolean;
  };
  replay: {
    frameCount: number;
    terminalState: string;
    hashChainValid: boolean;
    frames: EmlReplayFrame[];
  };
  review: {
    decision: string;
    validationStatus: string;
    replayStatus: string;
    semanticStrength: string;
    claimBoundary: string;
    nonClaims: string[];
  };
  obligations: {
    schemaVersion: string;
    status: string;
    cards: Array<{
      obligationId: string;
      kind: string;
      status: string;
      trigger: string;
      nodeId?: string;
      input?: string;
      description: string;
      proofTarget: string;
      nonClaim: string;
      checkedBy?: string;
      proofArtifact?: string;
      proofSummary?: string;
    }>;
    summary: {
      count: number;
      domain_count: number;
      range_safety_count: number;
      proved_count: number;
    };
    nonClaims: string[];
  };
  domainSafety: EmlDomainSafety;
  safeRewriteProposals: Array<{
    proposalId: string;
    status: string;
    nodeId?: string;
    requirementId: string;
    proposal: string;
    blockedAction: string;
    proofArtifact?: string;
  }>;
};

export type EmlGuardLensPacket = {
  schemaVersion: string;
  packetType: string;
  date: string;
  programId: string;
  family: string;
  expression: string;
  estimatedTreeDepth: number;
  decision: string;
  matchedRuleIds: string[];
  recommendedLowering: string | null;
  reason: string;
  blockedClaims: string[];
  compilerBehaviorChanged: boolean;
  claimFlags: Record<string, boolean>;
  nonClaims: string[];
};

export const emlPackets = [
  gaussianEnergyJson,
  sigmoidDerivativeJson,
  softplusPairJson,
] as unknown as EmlPacketResult[];

export const emlGuardLensPackets = guardLensJson.guardLensPackets as EmlGuardLensPacket[];

export const families = Array.from(new Set(emlPackets.map((packet) => packet.sourcePacket.family))).sort();

export function findEmlPacket(artifactId: string) {
  return emlPackets.find((packet) => packet.artifactId === artifactId);
}

export function findGuardLensByProgramId(programId: string) {
  return emlGuardLensPackets.find((packet) => packet.programId === programId);
}

export function guardLensColor(decision: string, colors: { red: string; orange: string; green: string; blue: string }) {
  if (decision.startsWith("block")) return colors.red;
  if (decision.startsWith("recommend")) return colors.blue;
  if (decision.startsWith("allow")) return colors.green;
  return colors.orange;
}
