import { readFileSync } from "node:fs";
import { join } from "node:path";

const fixturePath = join(process.cwd(), "app/evidence/evidence_cockpit_fixture_v0_2026_05_26.json");
const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));

const fail = (message) => {
  console.error(`EVIDENCE_COCKPIT_FIXTURE_CHECK_FAIL ${message}`);
  process.exit(1);
};

if (fixture.schemaVersion !== "monogate.dev.evidence_cockpit_fixture.v0") {
  fail(`unexpected schema: ${fixture.schemaVersion}`);
}

const artifacts = fixture.artifacts ?? [];
const ids = new Set(artifacts.map((artifact) => artifact.id));
for (const id of ["forge-rescue", "electronics-trainer", "monogate-os-replay", "capcard-internal", "agent-output-demo", "monogate-os-eml-bridge"]) {
  if (!ids.has(id)) fail(`missing artifact: ${id}`);
}

if (fixture.decisionCounts?.approved_for_surface !== 2) {
  fail("approved_for_surface count drifted");
}
if (fixture.decisionCounts?.candidate_only !== 4) {
  fail("candidate_only count drifted");
}

for (const artifact of artifacts) {
  if (artifact.claimFlags?.certified_safety_claim === true) {
    fail(`${artifact.id} flipped certified_safety_claim`);
  }
  if (artifact.claimFlags?.production_controller_claim === true) {
    fail(`${artifact.id} flipped production_controller_claim`);
  }
  if (artifact.reviewPacket?.schemaVersion !== "monogate.evidence_public_packet.v0") {
    fail(`${artifact.id} packet schema drifted`);
  }
  for (const field of ["nonClaims", "reviewHighlights", "validationCommands", "timeline"]) {
    if (!Array.isArray(artifact[field]) || artifact[field].length === 0) {
      fail(`${artifact.id} missing ${field}`);
    }
    if (!Array.isArray(artifact.reviewPacket?.[field]) || artifact.reviewPacket[field].length === 0) {
      fail(`${artifact.id} review packet missing ${field}`);
    }
  }
  if (artifact.decision === "approved_for_surface") {
    if (artifact.validationStatus !== "pass") fail(`${artifact.id} approved without validation pass`);
    if (artifact.replayStatus !== "pass") fail(`${artifact.id} approved without replay pass`);
    if (!artifact.packetHref?.startsWith(`/evidence/${artifact.id}/`)) {
      fail(`${artifact.id} packet href does not match artifact id`);
    }
  }
}

const rescue = artifacts.find((artifact) => artifact.id === "forge-rescue");
if (!rescue) fail("forge-rescue missing");
if (
  rescue.semanticStrength !==
  "1_restricted_semantic_rewrite_plus_3_concrete_sample_invariant_plus_0_packet_bridge_only"
) {
  fail("forge-rescue semantic strength drifted");
}
if (!rescue.evidencePaths?.some((path) => path.includes("rescue_obligation_registry"))) {
  fail("forge-rescue missing obligation registry path");
}
if (!rescue.nonClaims?.some((claim) => claim.includes("unrestricted optimizer"))) {
  fail("forge-rescue missing unrestricted semantic non-claim");
}

const osReplay = artifacts.find((artifact) => artifact.id === "monogate-os-replay");
if (!osReplay) fail("monogate-os-replay missing");
if (osReplay.decision !== "candidate_only") fail("monogate-os-replay decision drifted");
if (!osReplay.reviewHighlights?.some((highlight) => highlight.includes("24 replay frames"))) {
  fail("monogate-os-replay missing identity CI highlight");
}
if (!osReplay.nonClaims?.some((claim) => claim.includes("bootable OS"))) {
  fail("monogate-os-replay missing bootable OS non-claim");
}
if (!osReplay.evidencePaths?.some((path) => path.includes("m7d_replay_identity_ci_result"))) {
  fail("monogate-os-replay missing M7D result evidence path");
}

const agentOutput = artifacts.find((artifact) => artifact.id === "agent-output-demo");
if (!agentOutput) fail("agent-output-demo missing");
if (agentOutput.decision !== "candidate_only") fail("agent-output-demo decision drifted");
if (agentOutput.reviewPacket?.agentTruthfulnessClaim === true) fail("agent-output-demo overclaims truthfulness");
if (!agentOutput.reviewPacket?.agentTask || !agentOutput.reviewPacket?.agentOutput) {
  fail("agent-output-demo missing task/output fields");
}
if (!agentOutput.nonClaims?.some((claim) => claim.includes("general agent truthfulness"))) {
  fail("agent-output-demo missing truthfulness non-claim");
}

const osBridge = artifacts.find((artifact) => artifact.id === "monogate-os-eml-bridge");
if (!osBridge) fail("monogate-os-eml-bridge missing");
if (osBridge.decision !== "candidate_only") fail("monogate-os-eml-bridge decision drifted");
if (osBridge.claimFlags?.public_ready === true) fail("monogate-os-eml-bridge public_ready flipped");
if (!osBridge.nonClaims?.some((claim) => claim.includes("Forge compiler behavior change"))) {
  fail("monogate-os-eml-bridge missing Forge compiler non-claim");
}
if (!osBridge.evidencePaths?.some((path) => path.includes("m8b_negative_fixture_result"))) {
  fail("monogate-os-eml-bridge missing negative fixture evidence path");
}
if (!osBridge.reviewHighlights?.some((highlight) => highlight.includes("Negative fixtures"))) {
  fail("monogate-os-eml-bridge missing negative fixture highlight");
}

console.log("EVIDENCE_COCKPIT_FIXTURE_CHECK_OK");
