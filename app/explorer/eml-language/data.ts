import manifestJson from "./data/eml_language_kernel_manifest_2026_05_27.json";
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
  physical_meaning: string;
  source_repo: string;
  normalized_expression: string;
  inputs: Array<{ name: string; unit: string; range?: { min: number; max: number } }>;
  guards: Array<{ kind: string; expression: string; min?: number; max?: number }>;
  lets: Array<{ name: string; expression: string; normalized_expression: string }>;
  ast: Record<string, unknown>;
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
  }>;
};

export const emlLanguagePrograms = [
  gaussianEnergyJson,
  guardedEmlSoftplusJson,
  rawEmlPrimitiveJson,
  sigmoidDerivativeJson,
  softplusPairJson,
] as unknown as EmlLanguageProgram[];

