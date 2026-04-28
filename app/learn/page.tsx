import type { Metadata } from "next";
import data from "./petal_eml.json";
import { type PetalDataset, LANE_DESCRIPTIONS } from "./petal-types";

const dataset = data as unknown as PetalDataset;

export const metadata: Metadata = {
  title: "Learn — monogate.dev",
  description:
    "Learn Lean by Proving EML. A 6-lane interactive walk through the Lean 4 formalization of the EML operator, powered by the PETAL dataset.",
};

const ACCENT_PURPLE = "#A78BFA";
const ACCENT_CYAN = "#06B6D4";
const ACCENT_PINK = "#EC4899";
const ACCENT_GOLD = "#E8A020";

const LANE_ACCENT: Record<number, string> = {
  1: ACCENT_CYAN,
  2: ACCENT_CYAN,
  3: ACCENT_PURPLE,
  4: ACCENT_PURPLE,
  5: ACCENT_PINK,
  6: ACCENT_GOLD,
};

const LANE_LONG_DESCRIPTION: Record<number, string> = {
  1: "Inductive types, depth, rfl, and the complex-exp identity. The smallest possible Lean proofs.",
  2: "How simp, rewrites, and hypothesis-driven tactics chain definitions into composite results.",
  3: "Witness extraction, F-family lower bounds, and proof-by-contradiction over EML trees.",
  4: "The SuperBEST framework: multi-operator lower bounds and the synthesis lemmas they unlock.",
  5: "Universality, EML-elementary, self-map conjugacies, and how Mathlib wrappers connect to the master result.",
  6: "The research frontier — the InfiniteZerosBarrier and the open lemmas that gate sin/cos/π/i.",
};

export default function LearnIndexPage() {
  // Group records by lane for the count badges.
  const byLane: Record<number, number> = {};
  for (const r of dataset.records) {
    byLane[r.lane] = (byLane[r.lane] ?? 0) + 1;
  }

  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
      }}
    >
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: ACCENT_PURPLE,
            textTransform: "uppercase",
            letterSpacing: 1.5,
            marginBottom: 12,
          }}
        >
          PETAL · Proof · Explanation · Tactic · Aligned · Lean
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 6vw, 2.4rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.15,
          }}
        >
          Learn Lean by Proving EML
        </h1>
        <p
          style={{
            fontSize: "clamp(0.95rem, 2.4vw, 1.05rem)",
            color: "#aaa",
            lineHeight: 1.6,
          }}
        >
          {dataset.records.length} hand-audited Lean&nbsp;4 theorems from the Monogate
          formalization, structured as a 6-lane interactive curriculum. Every
          proof step has a natural-language explanation, the rationale for the
          tactic chosen, and common mistakes a beginner typically makes.
        </p>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#666",
            marginTop: 16,
            fontFamily: "monospace",
          }}
        >
          Dataset {dataset.dataset_version} · schema {dataset.schema_version} ·{" "}
          <a
            href="https://github.com/agent-maestro/monogate-lean"
            style={{ color: ACCENT_CYAN }}
          >
            monogate-lean source ↗
          </a>{" "}
          · CC BY 4.0
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            fontFamily: "monospace",
            fontSize: 12,
          }}
        >
          <a
            href="/learn/leaderboard"
            style={{
              color: ACCENT_GOLD,
              textDecoration: "none",
              border: `1px solid ${ACCENT_GOLD}40`,
              padding: "6px 14px",
              borderRadius: 6,
              background: `${ACCENT_GOLD}08`,
            }}
          >
            🏆 Leaderboard
          </a>
        </div>
      </header>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "#fff",
            marginBottom: 24,
          }}
        >
          The 6 lanes
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((lane) => {
            const accent = LANE_ACCENT[lane];
            const lc = LANE_DESCRIPTIONS[lane];
            const longDesc = LANE_LONG_DESCRIPTION[lane];
            const count = byLane[lane] ?? 0;
            const isUnlocked = lane === 1;
            const lockedHint =
              lane === 2 ? "Complete Lane 1 to unlock Building Blocks" : null;

            const Wrapper = isUnlocked
              ? ({ children }: { children: React.ReactNode }) => (
                  <a
                    href="/learn/lane-1"
                    style={{
                      display: "block",
                      padding: "clamp(16px, 3vw, 22px) clamp(18px, 3.5vw, 26px)",
                      border: `1px solid ${accent}30`,
                      borderRadius: 10,
                      background: `${accent}08`,
                      textDecoration: "none",
                      color: "inherit",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {children}
                  </a>
                )
              : ({ children }: { children: React.ReactNode }) => (
                  <div
                    aria-disabled
                    style={{
                      position: "relative",
                      padding: "clamp(16px, 3vw, 22px) clamp(18px, 3.5vw, 26px)",
                      border: `1px dashed ${accent}30`,
                      borderRadius: 10,
                      background: `${accent}05`,
                      color: "inherit",
                      opacity: 0.85,
                    }}
                  >
                    {children}
                  </div>
                );

            return (
              <Wrapper key={lane}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: accent,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      fontFamily: "monospace",
                    }}
                  >
                    {isUnlocked ? `Lane ${lane}` : `🔒 Lane ${lane}`}
                  </span>
                  <span
                    style={{
                      fontSize: "clamp(15px, 3.5vw, 18px)",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {lc.title}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontFamily: "monospace",
                      marginLeft: "auto",
                    }}
                  >
                    {count} {count === 1 ? "record" : "records"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#888",
                    fontFamily: "monospace",
                    marginBottom: 8,
                  }}
                >
                  {lc.subtitle}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#aaa",
                    lineHeight: 1.55,
                  }}
                >
                  {longDesc}
                </div>
                {!isUnlocked && lockedHint && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#777",
                      marginTop: 12,
                      fontFamily: "monospace",
                      letterSpacing: 0.4,
                    }}
                  >
                    {lockedHint}
                  </div>
                )}
                {!isUnlocked && !lockedHint && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#777",
                      marginTop: 12,
                      fontFamily: "monospace",
                      letterSpacing: 0.4,
                    }}
                  >
                    Walk-through coming soon — view records on{" "}
                    <a
                      href="https://github.com/agent-maestro/monogate-lean"
                      style={{ color: accent }}
                    >
                      GitHub ↗
                    </a>
                  </div>
                )}
                {isUnlocked && (
                  <div
                    style={{
                      fontSize: 12,
                      color: accent,
                      marginTop: 12,
                      fontFamily: "monospace",
                      fontWeight: 600,
                    }}
                  >
                    Start →
                  </div>
                )}
              </Wrapper>
            );
          })}
        </div>
      </section>

      <footer
        style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: "1px solid #1a1a1d",
          fontSize: 12,
          color: "#666",
          lineHeight: 1.7,
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0 }}>
          Powered by <strong style={{ color: "#aaa" }}>PETAL</strong> ·{" "}
          {dataset.records.length} theorems · CC BY 4.0 ·{" "}
          <a
            href="https://huggingface.co/datasets/Monogate/petal-eml"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: ACCENT_CYAN, textDecoration: "none" }}
          >
            huggingface.co/datasets/Monogate/petal-eml
          </a>
        </p>
      </footer>
    </main>
  );
}
