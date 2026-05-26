import fixtureJson from "./evidence_cockpit_fixture_v0_2026_05_26.json";

export const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  surface2: "#12151f",
  border: "#1c1f2e",
  text: "#d4d4d4",
  muted: "#6d7085",
  orange: "#e8a020",
  green: "#4ade80",
  blue: "#6ab0f5",
  red: "#f87171",
  purple: "#a78bfa",
};

export type Decision =
  | "approved_for_surface"
  | "candidate_only"
  | "blocked"
  | "needs_human_review";

export type Status = "pass" | "fail" | "unknown";

export type Artifact = {
  id: string;
  title: string;
  lane: string;
  sourceLane: string;
  decision: Decision;
  validationStatus: Status;
  replayStatus: Status;
  semanticStrength: string;
  semanticsLabel: string;
  summary: string;
  claimBoundary: string;
  href: string;
  packetHref: string;
  sourceReportPath: string;
  evidencePaths: string[];
  color: keyof typeof C;
  claimFlags: Record<string, boolean | null>;
  semanticReview: Record<string, unknown>;
  reviewReasons: string[];
  reviewNotes: string;
  reviewPacket: Record<string, unknown>;
};

export type EvidenceFixture = {
  schemaVersion: string;
  date: string;
  reviewer: string;
  generatedFrom: {
    schemaVersion: string;
    path: string;
  };
  decisionCounts: Record<string, number>;
  artifacts: Artifact[];
  boundaries: Record<string, boolean>;
  reviewerContract: Record<string, boolean | string>;
};

export const fixture = fixtureJson as EvidenceFixture;
export const artifacts = fixture.artifacts;

export const decisionColors: Record<Decision, string> = {
  approved_for_surface: C.green,
  candidate_only: C.orange,
  blocked: C.red,
  needs_human_review: C.blue,
};

export function artifactColor(artifact: Artifact) {
  return C[artifact.color] ?? C.orange;
}

export function statusColor(value: string) {
  if (value === "pass" || value === "approved_for_surface") return C.green;
  if (value === "candidate_only" || value === "needs_human_review") return C.orange;
  if (value === "fail" || value === "blocked") return C.red;
  return C.muted;
}

export function findArtifact(id: string) {
  return artifacts.find((artifact) => artifact.id === id);
}

export function pill(text: string, color = C.orange) {
  return (
    <code
      style={{
        display: "inline-flex",
        maxWidth: "100%",
        overflowWrap: "anywhere",
        color,
        border: `1px solid ${color}33`,
        background: `${color}12`,
        borderRadius: 4,
        padding: "3px 7px",
        fontSize: 11,
        lineHeight: 1.4,
      }}
    >
      {text}
    </code>
  );
}
