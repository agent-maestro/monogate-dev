import fixture from "./proof_carrying_rescue_explorer_fixture_v0_2026_05_26.json";

export type TraceFrame = {
  sample: number;
  input: string;
  rawEvent: string;
  rescueEvent: string;
  transition: string;
  metric: string;
  raw: Record<string, unknown>;
  rescued: Record<string, unknown>;
  isWitness: boolean;
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
  summary: {
    sampleCount: number;
    rescuedEventCount: number;
    hasTransitionWitness: boolean;
  };
  accent: string;
  frames: TraceFrame[];
};

const accents: Record<string, string> = {
  log_domain_lift: "#6ab0f5",
  guard_clamp: "#4ade80",
  precision_escape: "#a78bfa",
  saturation_deshelf: "#e8a020",
};

export const explorerFixture = fixture;

export const replayStatus = fixture.replayStatus;

export const boundaryFlags = Object.entries(fixture.boundaryFlags);

export const lanes: RescueLane[] = fixture.lanes.map(lane => ({
  ...lane,
  accent: accents[lane.operator] ?? "#e8a020",
}));
