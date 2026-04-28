"use client";

import { useEffect, useState } from "react";
import type { PetalRecord } from "../petal-types";
import { ghLink } from "../petal-types";

const ACCENT = "#06B6D4";
const ACCENT_DIM = "#06B6D440";
const ACCENT_GREEN = "#10b981";
const TEXT = "#e5e5e5";
const TEXT_DIM = "#aaa";
const TEXT_DIMMER = "#888";
const BG_PANEL = "#0d0d10";
const BG_DEEPER = "#08080a";
const BORDER = "#1a1a1d";

const STORAGE_KEY = "monogate.learn.lane1.completed";

type RenderedRecord = PetalRecord & { statementHtml: string };

export default function Lane1Client({ records }: { records: RenderedRecord[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState<string | null>(null);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) setCompleted(new Set(arr));
      }
    } catch {
      // localStorage may be unavailable; carry on with empty state.
    }
    setHydrated(true);
  }, []);

  function persist(next: Set<string>) {
    setCompleted(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    } catch {
      // ignore
    }
  }

  function toggleComplete(id: string) {
    const next = new Set(completed);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      setRecentlyCompleted(id);
      window.setTimeout(() => {
        setRecentlyCompleted((cur) => (cur === id ? null : cur));
      }, 1400);
    }
    persist(next);
  }

  function reset() {
    persist(new Set());
  }

  const total = records.length;
  // After hydration, use real count; before hydration, render 0/4 as a deterministic SSR-safe baseline.
  const doneCount = hydrated ? completed.size : 0;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const allDone = hydrated && doneCount === total && total > 0;

  return (
    <>
      <ProgressBar
        doneCount={doneCount}
        total={total}
        pct={pct}
        hydrated={hydrated}
        onReset={reset}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {records.map((rec, idx) => (
          <RecordCard
            key={rec.theorem_id}
            record={rec}
            index={idx}
            total={total}
            isDone={completed.has(rec.theorem_id)}
            justCompleted={recentlyCompleted === rec.theorem_id}
            onToggle={() => toggleComplete(rec.theorem_id)}
          />
        ))}
      </div>

      {allDone && <CompletionPanel onReset={reset} />}
    </>
  );
}

// ---------------------------------------------------------------------------

function ProgressBar({
  doneCount,
  total,
  pct,
  hydrated,
  onReset,
}: {
  doneCount: number;
  total: number;
  pct: number;
  hydrated: boolean;
  onReset: () => void;
}) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "rgba(8, 8, 10, 0.92)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: `1px solid ${BORDER}`,
        borderRadius: 10,
        padding: "14px 18px",
        marginBottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 700,
          color: ACCENT,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          minWidth: 180,
        }}
      >
        Lane 1: {doneCount}/{total} complete
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 180,
          height: 8,
          background: "#15151a",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background:
              doneCount === total && total > 0
                ? `linear-gradient(90deg, ${ACCENT}, ${ACCENT_GREEN})`
                : ACCENT,
            transition: "width 320ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
      {hydrated && doneCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          style={{
            background: "transparent",
            border: `1px solid #2a2a30`,
            color: TEXT_DIMMER,
            fontFamily: "monospace",
            fontSize: 11,
            padding: "5px 10px",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          reset
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

function RecordCard({
  record,
  index,
  total,
  isDone,
  justCompleted,
  onToggle,
}: {
  record: RenderedRecord;
  index: number;
  total: number;
  isDone: boolean;
  justCompleted: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      style={{
        position: "relative",
        padding: "clamp(20px, 4vw, 32px)",
        borderRadius: 12,
        border: `1px solid ${isDone ? `${ACCENT_GREEN}55` : ACCENT_DIM}`,
        background: BG_PANEL,
        transition: "border-color 320ms ease",
      }}
    >
      {justCompleted && <CelebrationOverlay />}

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 6,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: TEXT_DIMMER,
            textTransform: "uppercase",
            letterSpacing: 1,
            fontFamily: "monospace",
          }}
        >
          Theorem {index + 1} of {total} · difficulty {record.difficulty} · {record.domain}
        </div>
        {isDone && (
          <div
            style={{
              fontSize: 11,
              fontFamily: "monospace",
              color: ACCENT_GREEN,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            ✓ complete
          </div>
        )}
      </div>

      <h2
        style={{
          fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 18,
          marginTop: 4,
          fontFamily: "monospace",
          wordBreak: "break-word",
        }}
      >
        {record.theorem_id}
      </h2>

      <div
        style={{
          padding: "18px 20px",
          background: BG_DEEPER,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          marginBottom: 18,
          overflowX: "auto",
        }}
      >
        <div
          className="learn-katex"
          dangerouslySetInnerHTML={{ __html: record.statementHtml }}
        />
      </div>

      <p
        style={{
          fontSize: 15,
          color: TEXT,
          lineHeight: 1.65,
          marginBottom: 22,
        }}
      >
        {record.statement.natural_language}
      </p>

      <details>
        <summary
          style={{
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 12,
            fontWeight: 700,
            color: ACCENT,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            padding: "8px 0",
            userSelect: "none",
          }}
        >
          ▸ Proof walkthrough ({record.proof.lean4_step_by_step.length} step
          {record.proof.lean4_step_by_step.length === 1 ? "" : "s"})
        </summary>
        <div style={{ paddingTop: 16 }}>
          <CodeBlock>{record.proof.lean4_full}</CodeBlock>
          <div style={{ height: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {record.proof.lean4_step_by_step.map((step) => (
              <div
                key={step.step}
                style={{
                  padding: "14px 16px",
                  borderLeft: `2px solid ${ACCENT}`,
                  background: BG_DEEPER,
                  borderRadius: "0 6px 6px 0",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: ACCENT,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                    fontFamily: "monospace",
                  }}
                >
                  Step {step.step}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#fff",
                    background: "#101015",
                    padding: "8px 12px",
                    borderRadius: 4,
                    marginBottom: 10,
                    overflowX: "auto",
                  }}
                >
                  {step.tactic}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: TEXT,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {step.explanation}
                </p>
                {step.tactic_rationale && (
                  <p
                    style={{
                      fontSize: 13,
                      color: TEXT_DIM,
                      lineHeight: 1.6,
                      marginTop: 8,
                      marginBottom: 0,
                      fontStyle: "italic",
                    }}
                  >
                    Why this tactic: {step.tactic_rationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </details>

      {record.proof.lean4_step_by_step.some((s) => s.common_mistakes.length > 0) && (
        <details style={{ marginTop: 8 }}>
          <summary
            style={{
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              color: "#d97777",
              textTransform: "uppercase",
              letterSpacing: 1.2,
              padding: "8px 0",
              userSelect: "none",
            }}
          >
            ▸ Common mistakes
          </summary>
          <ul
            style={{
              marginTop: 10,
              paddingLeft: 22,
              fontSize: 14,
              color: TEXT_DIM,
              lineHeight: 1.65,
            }}
          >
            {record.proof.lean4_step_by_step.flatMap((step) =>
              step.common_mistakes.map((m, i) => (
                <li key={`${step.step}-${i}`} style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      color: TEXT_DIMMER,
                      fontFamily: "monospace",
                      fontSize: 11,
                      marginRight: 6,
                    }}
                  >
                    [step {step.step}]
                  </span>
                  {m}
                </li>
              )),
            )}
          </ul>
        </details>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginTop: 24,
          paddingTop: 18,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          style={{
            background: isDone ? `${ACCENT_GREEN}18` : ACCENT,
            border: `1px solid ${isDone ? ACCENT_GREEN : ACCENT}`,
            color: isDone ? ACCENT_GREEN : "#03171a",
            fontFamily: "monospace",
            fontSize: 13,
            fontWeight: 700,
            padding: "9px 18px",
            borderRadius: 6,
            cursor: "pointer",
            letterSpacing: 0.5,
            transition: "all 180ms ease",
          }}
        >
          {isDone ? "✓ Completed (click to undo)" : "Mark complete"}
        </button>
        <a
          href={ghLink(record.source.file, record.source.line)}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "8px 14px",
            border: `1px solid #2a2a30`,
            borderRadius: 5,
            color: TEXT_DIM,
            textDecoration: "none",
            fontSize: 12,
            fontFamily: "monospace",
          }}
        >
          source ↗
        </a>
        {record.dependencies.length > 0 && (
          <span
            style={{
              fontSize: 11,
              color: TEXT_DIMMER,
              fontFamily: "monospace",
            }}
          >
            depends on: {record.dependencies.join(", ")}
          </span>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------

function CelebrationOverlay() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: 12,
        boxShadow: `inset 0 0 0 2px ${ACCENT_GREEN}, 0 0 32px ${ACCENT_GREEN}40`,
        animation: "lane1Glow 1.2s ease-out forwards",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: 64,
          color: ACCENT_GREEN,
          animation: "lane1Check 900ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        }}
      >
        ✓
      </div>
    </div>
  );
}

function CompletionPanel({ onReset }: { onReset: () => void }) {
  return (
    <section
      style={{
        marginTop: 36,
        padding: "clamp(28px, 5vw, 48px)",
        borderRadius: 14,
        border: `1px solid ${ACCENT_GREEN}66`,
        background: `linear-gradient(135deg, ${ACCENT}10, ${ACCENT_GREEN}18)`,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: ACCENT_GREEN,
          marginBottom: 8,
        }}
      >
        🏆
      </div>
      <h2
        style={{
          fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
          color: "#fff",
          fontWeight: 700,
          marginTop: 0,
          marginBottom: 10,
        }}
      >
        Lane 1 complete.
      </h2>
      <p
        style={{
          fontSize: "1.05rem",
          color: TEXT,
          marginTop: 0,
          marginBottom: 24,
          lineHeight: 1.6,
        }}
      >
        You understand EML fundamentals — depth, expTree, rfl, and the complex-exp identity.
      </p>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <a
          href="https://capcard.ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 22px",
            background: ACCENT_GREEN,
            color: "#04150e",
            border: "none",
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.5,
          }}
        >
          Earn a CapCard → capcard.ai
          <span
            style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "#04150e",
              color: ACCENT_GREEN,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            soon
          </span>
        </a>
        <a
          href="/learn"
          style={{
            padding: "12px 22px",
            background: "transparent",
            color: TEXT,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            textDecoration: "none",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          ← Lanes overview
        </a>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "12px 22px",
            background: "transparent",
            color: TEXT_DIMMER,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "monospace",
            fontSize: 14,
          }}
        >
          Start over
        </button>
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre
      style={{
        fontFamily: "monospace",
        fontSize: 13,
        color: "#fff",
        background: BG_DEEPER,
        border: `1px solid ${BORDER}`,
        padding: "16px 20px",
        borderRadius: 6,
        overflowX: "auto",
        lineHeight: 1.55,
        margin: 0,
      }}
    >
      <code>{children}</code>
    </pre>
  );
}
