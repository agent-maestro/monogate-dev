import gaussianEnergyJson from "./data/gaussian_energy_v0_packet_2026_05_27.json";
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
};

export const emlPackets = [
  gaussianEnergyJson,
  sigmoidDerivativeJson,
  softplusPairJson,
] as unknown as EmlPacketResult[];

export const families = Array.from(new Set(emlPackets.map((packet) => packet.sourcePacket.family))).sort();

export function findEmlPacket(artifactId: string) {
  return emlPackets.find((packet) => packet.artifactId === artifactId);
}
