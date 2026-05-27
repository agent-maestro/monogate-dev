import manifestJson from "./data/eml_language_kernel_manifest_2026_05_27.json";
import comparisonsJson from "./data/eml_language_canonical_comparisons_2026_05_27.json";
import costLabJson from "./data/eml_language_cost_lab_2026_05_27.json";
import gaussianEnergyJson from "./data/gaussian_energy_v0_language_2026_05_27.json";
import guardedEmlSoftplusJson from "./data/guarded_eml_softplus_v0_language_2026_05_27.json";
import rawEmlPrimitiveJson from "./data/raw_eml_primitive_v0_language_2026_05_27.json";
import sigmoidDerivativeJson from "./data/sigmoid_derivative_v0_language_2026_05_27.json";
import softplusPairJson from "./data/softplus_pair_v0_language_2026_05_27.json";

export type EmlLanguageProgram = {
  schemaVersion: string;
  program_id: string;
  family: string;
  source: string;
  surface_expression: string;
  physical_meaning: string;
  source_repo: string;
  normalized_expression: string;
  inputs: Array<{ name: string; unit: string; range?: { min: number; max: number } }>;
  guards: Array<{ kind: string; expression: string; min?: number; max?: number }>;
  lets: Array<{ name: string; expression: string; normalized_expression: string }>;
  ast: Record<string, unknown>;
  surfaceAst: Record<string, unknown>;
  expandedAst: Record<string, unknown>;
  canonicalAst: Record<string, unknown>;
  canonicalHash: string;
  expansionTags: Array<{ operator: string; expandsTo: string }>;
  claim_flags: Record<string, boolean>;
  nonClaims: string[];
};

export const emlLanguageManifest = manifestJson as unknown as {
  status: string;
  count: number;
  programs: Array<{
    program_id: string;
    family: string;
    normalized_expression: string;
    guard_count: number;
    let_count: number;
    canonical_hash: string;
    expansion_tag_count: number;
  }>;
};

export const emlCanonicalComparisons = comparisonsJson as unknown as {
  status: string;
  summary: {
    comparison_count: number;
    equivalent_count: number;
  };
  comparisons: Array<{
    label: string;
    equivalentByCanonicalization: boolean;
    claimBoundary: string;
    left: { surfaceExpression: string; expandedExpression: string; canonicalHash: string };
    right: { surfaceExpression: string; expandedExpression: string; canonicalHash: string };
  }>;
};

export const emlLanguageCostLab = costLabJson as unknown as {
  status: string;
  summary: {
    programCount: number;
    surfaceOperatorCount: number;
    expandedOperatorCount: number;
    dagUniqueOperatorCount: number;
    expansionDelta: number;
    repeatedCanonicalSubtreeCount: number;
    proofObligationCount: number;
    checkedWitnessCount: number;
    publicCostClaimChanged: boolean;
  };
  programs: Array<{
    programId: string;
    family: string;
    surfaceExpression: string;
    expandedExpression: string;
    canonicalHash: string;
    surfaceOperatorCount: number;
    expandedOperatorCount: number;
    canonicalOperatorCount: number;
    expansionDelta: number;
    dagUniqueOperatorCount: number;
    repeatedCanonicalSubtreeCount: number;
    proofObligationCount: number;
    checkedWitnessCount: number;
    publicCostClaimChanged: boolean;
  }>;
  nonClaims: string[];
};

export const emlLanguagePrograms = [
  gaussianEnergyJson,
  guardedEmlSoftplusJson,
  rawEmlPrimitiveJson,
  sigmoidDerivativeJson,
  softplusPairJson,
] as unknown as EmlLanguageProgram[];
