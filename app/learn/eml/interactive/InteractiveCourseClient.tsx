"use client";

import { useMemo, useState } from "react";
import { lessons, type Lesson } from "./lessons";

const ACCENT = "#E8A020";
const GREEN = "#4ADE80";
const BLUE = "#6AB0F5";
const RED = "#F87171";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#12151f";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

type CheckResult = {
  label: string;
  pass: boolean;
  message: string;
};

const restrictedTerms = [
  "p" + "roved",
  "v" + "erified",
  "f" + "irst",
  "n" + "ovel",
  "a" + "lways",
  "u" + "niversal",
  "b" + "reakthrough",
  "t" + "herapy",
  "m" + "edical",
  "c" + "linical",
  "h" + "ealing",
  "c" + "onsciousness",
];

function includesAll(text: string, terms: string[]) {
  const lower = text.toLowerCase();
  return terms.every((term) => lower.includes(term.toLowerCase()));
}

function runChecks(lesson: Lesson, code: string): CheckResult[] {
  return lesson.checks.map((check) => {
    if (check.kind === "currentSyntax") {
      const hasModule = /\bmodule\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;/.test(code);
      const hasFn = /\bfn\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/.test(code);
      const staleBlock = /\bkernel\s*\{/.test(code);
      const fixes = [
        !hasModule ? "add `module name;` near the top" : null,
        !hasFn ? "add a `fn name(...) -> Type { ... }` declaration" : null,
        staleBlock ? "remove the older `kernel { ... }` block shape" : null,
      ].filter(Boolean);
      return {
        label: check.label,
        pass: hasModule && hasFn && !staleBlock,
        message: hasModule && hasFn && !staleBlock
          ? "Current module / fn structure found."
          : `Fix current Forge syntax: ${fixes.join("; ")}.`,
      };
    }

    if (check.kind === "requiredTerms") {
      const terms = check.terms ?? [];
      const pass = includesAll(code, terms);
      return {
        label: check.label,
        pass,
        message: pass
          ? `Found: ${terms.join(", ")}`
          : `Add these lesson markers: ${terms.filter((term) => !code.toLowerCase().includes(term.toLowerCase())).join(", ")}.`,
      };
    }

    if (check.kind === "guardContract") {
      const terms = ["requested_output", "safe_output", "safety_margin", "bottleneck", "guard_action"];
      const pass = includesAll(code, terms);
      const missing = terms.filter((term) => !code.toLowerCase().includes(term));
      return {
        label: check.label,
        pass,
        message: pass
          ? "Guard fields are present."
          : `Add the missing guard fields: ${missing.join(", ")}.`,
      };
    }

    if (check.kind === "findingsDiscipline") {
      const lower = code.toLowerCase();
      const missing = [
        !lower.includes("observation") ? "OBSERVATION tier" : null,
        !lower.includes("across this test set") ? "the phrase `across this test set`" : null,
        !lower.includes("limitations") ? "limitations section" : null,
        !lower.includes("reproduce") ? "reproduce command" : null,
      ].filter(Boolean);
      const pass = lower.includes("observation")
        && lower.includes("across this test set")
        && lower.includes("limitations")
        && lower.includes("reproduce");
      return {
        label: check.label,
        pass,
        message: pass
          ? "Observation-tier structure is present."
          : `Tighten the report with: ${missing.join(", ")}.`,
      };
    }

    if (check.kind === "auditDiscipline") {
      const lower = code.toLowerCase();
      const hasDecision = lower.includes("go") || lower.includes("no-go");
      const missing = [
        !hasDecision ? "an explicit GO or NO-GO decision" : null,
        !lower.includes("dirty") ? "dirty-file classification" : null,
        !lower.includes("token") ? "token handling" : null,
        !lower.includes("approval") ? "approval boundary" : null,
        !lower.includes("do not publish") ? "`do not publish` boundary" : null,
        !lower.includes("do not push") ? "`do not push` boundary" : null,
        !lower.includes("do not deploy") ? "`do not deploy` boundary" : null,
      ].filter(Boolean);
      const pass = hasDecision
        && lower.includes("dirty")
        && lower.includes("token")
        && lower.includes("approval")
        && lower.includes("do not publish")
        && lower.includes("do not push")
        && lower.includes("do not deploy");
      return {
        label: check.label,
        pass,
        message: pass
          ? "Release boundary and risk classification are present."
          : `Add release discipline markers: ${missing.join(", ")}.`,
      };
    }

    if (check.kind === "noDestructiveHardware") {
      const lower = code.toLowerCase();
      const blocked = ["destructive", "fry", "5v into", "solenoid"].find((term) => lower.includes(term));
      return {
        label: check.label,
        pass: !blocked,
        message: blocked
          ? `Remove unsafe hardware framing around "${blocked}" and keep the lesson at contract level.`
          : "No destructive hardware framing found.",
      };
    }

    if (check.kind === "roundtripDiscipline") {
      const lower = code.toLowerCase();
      const missing = [
        !lower.includes("supported source") ? "supported source" : null,
        !lower.includes("efrog") ? "eFrog" : null,
        !lower.includes("forge-compatible eml") ? "Forge-compatible EML" : null,
        !lower.includes("target") ? "target flow" : null,
      ].filter(Boolean);
      const pass = lower.includes("supported source")
        && lower.includes("efrog")
        && lower.includes("forge-compatible eml")
        && lower.includes("target");
      return {
        label: check.label,
        pass,
        message: pass
          ? "Supported-source to eFrog to EML to target flow is present."
          : `Name the missing roundtrip pieces: ${missing.join(", ")}.`,
      };
    }

    const lower = code.toLowerCase();
    const hit = restrictedTerms.find((term) => lower.includes(term));
    return {
      label: check.label,
      pass: !hit,
      message: hit ? "Restricted public-claim wording found." : "No restricted public-claim wording found.",
    };
  });
}

function ResultPill({ pass }: { pass: boolean }) {
  return (
    <span
      style={{
        color: pass ? GREEN : RED,
        border: `1px solid ${pass ? "rgba(74,222,128,0.35)" : "rgba(248,113,113,0.35)"}`,
        background: pass ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
        borderRadius: 3,
        padding: "2px 7px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {pass ? "PASS" : "FIX"}
    </span>
  );
}

export default function InteractiveCourseClient() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [codeByLesson, setCodeByLesson] = useState(() =>
    Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson.starterCode])),
  );
  const [target, setTarget] = useState("python");
  const lesson = lessons[lessonIndex];
  const code = codeByLesson[lesson.id] ?? lesson.starterCode;
  const results = useMemo(() => runChecks(lesson, code), [lesson, code]);
  const passed = results.filter((result) => result.pass).length;
  const allPassed = passed === results.length;

  function setCode(next: string) {
    setCodeByLesson((current) => ({ ...current, [lesson.id]: next }));
  }

  function selectLesson(index: number) {
    setLessonIndex(index);
  }

  function resetLesson() {
    setCode(lesson.starterCode);
  }

  const targetPreview = target === "python"
    ? "eml-compile lesson.eml --target python -o lesson.py"
    : target === "rust"
      ? "eml-compile lesson.eml --target rust -o lesson.rs"
      : "eml-compile lesson.eml --target lean -o lesson.lean";

  return (
    <main
      style={{
        maxWidth: 1500,
        margin: "0 auto",
        padding: "clamp(24px, 4vw, 48px) clamp(14px, 3vw, 24px) 96px",
        color: TEXT,
      }}
    >
      <header style={{ marginBottom: 26 }}>
        <a href="/learn/eml/intro" style={{ color: MUTED, fontSize: 12 }}>
          ← EML intro course
        </a>
        <div
          style={{
            marginTop: 16,
            color: ACCENT,
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          EML Lab · in development
        </div>
        <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 6vw, 3.2rem)", lineHeight: 1.08, marginTop: 8 }}>
          Learn EML by compiling
        </h1>
        <p style={{ color: "#a8adbd", maxWidth: 900, lineHeight: 1.7, marginTop: 14 }}>
          Edit small kernels, run local browser checks, inspect target previews, and learn the
          contract discipline that connects EML, Forge, eFrog, traces, and release gates.
        </p>
        <p style={{ color: MUTED, maxWidth: 900, lineHeight: 1.65, marginTop: 10, fontSize: 13 }}>
          Live Forge compile is planned for a sandboxed route; this MVP uses local checks and sample outputs.
        </p>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 16,
            color: "#cbd2df",
            fontSize: 13,
          }}
        >
          <span
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 999,
              background: SURFACE_2,
              padding: "6px 10px",
            }}
          >
            Lesson {lessonIndex + 1} of {lessons.length}
          </span>
          <span
            style={{
              border: `1px solid ${allPassed ? "rgba(74,222,128,0.35)" : BORDER}`,
              borderRadius: 999,
              background: allPassed ? "rgba(74,222,128,0.08)" : SURFACE_2,
              color: allPassed ? GREEN : "#cbd2df",
              padding: "6px 10px",
            }}
          >
            {passed}/{results.length} checks passing
          </span>
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
          gap: 14,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            background: SURFACE_2,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: 14,
          }}
        >
          <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Lessons
          </div>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
            {lessons.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectLesson(index)}
                style={{
                  textAlign: "left",
                  border: `1px solid ${index === lessonIndex ? "rgba(232,160,32,0.55)" : BORDER}`,
                  background: index === lessonIndex ? "rgba(232,160,32,0.08)" : SURFACE,
                  color: index === lessonIndex ? "#fff" : TEXT,
                  borderRadius: 6,
                  padding: "10px 11px",
                  minHeight: 44,
                }}
              >
                <div style={{ color: index === lessonIndex ? ACCENT : MUTED, fontSize: 11 }}>
                  {(index + 1).toString().padStart(2, "0")}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.4 }}>{item.title}</div>
              </button>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Goal
            </div>
            <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>{lesson.objective}</p>
            <p style={{ marginTop: 9, color: "#aeb5c4", fontSize: 13, lineHeight: 1.65 }}>
              {lesson.explanation}
            </p>
          </div>

          <div
            style={{
              border: "1px solid rgba(232,160,32,0.28)",
              borderRadius: 6,
              background: "rgba(232,160,32,0.06)",
              marginTop: 16,
              padding: 12,
            }}
          >
            <div style={{ color: ACCENT, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Why this matters
            </div>
            <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>{lesson.whyThisMatters}</p>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              What you are learning
            </div>
            <ul style={{ paddingLeft: 18, marginTop: 8, color: "#bfc4d2", fontSize: 13, lineHeight: 1.55 }}>
              {lesson.whatYouAreLearning.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Concepts
            </div>
            <ul style={{ paddingLeft: 18, marginTop: 8, color: "#bfc4d2", fontSize: 13, lineHeight: 1.55 }}>
              {lesson.expectedConcepts.map((concept) => <li key={concept}>{concept}</li>)}
            </ul>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Success criteria
            </div>
            <ul style={{ paddingLeft: 18, marginTop: 8, color: "#bfc4d2", fontSize: 13, lineHeight: 1.55 }}>
              {lesson.successCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
            </ul>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 16, paddingTop: 14 }}>
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Common mistake
            </div>
            <p style={{ marginTop: 8, color: "#c8cedb", fontSize: 13, lineHeight: 1.6 }}>{lesson.commonMistake}</p>
          </div>
        </aside>

        <section
          style={{
            background: SURFACE_2,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              borderBottom: `1px solid ${BORDER}`,
              padding: "12px 14px",
            }}
          >
            <div>
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Editor
              </div>
              <div style={{ color: "#fff", fontSize: 16, marginTop: 2 }}>{lesson.title}</div>
            </div>
            <button
              type="button"
              onClick={resetLesson}
              style={{
                minHeight: 36,
                border: `1px solid ${BORDER}`,
                borderRadius: 5,
                background: SURFACE,
                color: TEXT,
                padding: "7px 10px",
              }}
            >
              Reset
            </button>
          </div>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            spellCheck={false}
            style={{
              display: "block",
              width: "100%",
              minHeight: 470,
              resize: "vertical",
              border: 0,
              outline: "none",
              background: "#090b12",
              color: "#e9edf7",
              padding: 16,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          />
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
              borderTop: `1px solid ${BORDER}`,
              padding: 12,
            }}
          >
            <button
              type="button"
              style={{
                minHeight: 38,
                border: `1px solid rgba(74,222,128,0.45)`,
                borderRadius: 5,
                background: "rgba(74,222,128,0.08)",
                color: GREEN,
                padding: "8px 12px",
              }}
            >
              Run checks
            </button>
            <button
              type="button"
              onClick={() => setCode(code.trim() + "\n")}
              style={{
                minHeight: 38,
                border: `1px solid ${BORDER}`,
                borderRadius: 5,
                background: SURFACE,
                color: TEXT,
                padding: "8px 12px",
              }}
            >
              Format preview
            </button>
            <label style={{ display: "flex", alignItems: "center", gap: 8, color: MUTED, fontSize: 12 }}>
              Target
              <select
                value={target}
                onChange={(event) => setTarget(event.target.value)}
                style={{
                  background: SURFACE,
                  color: TEXT,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 5,
                  minHeight: 36,
                  padding: "6px 8px",
                }}
              >
                <option value="python">Python</option>
                <option value="rust">Rust</option>
                <option value="lean">Lean</option>
              </select>
            </label>
          </div>
        </section>

        <aside style={{ display: "grid", gap: 14 }}>
          <section
            style={{
              background: SURFACE_2,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Checks
              </div>
              <div style={{ color: passed === results.length ? GREEN : BLUE, fontSize: 12 }}>
                {passed}/{results.length} passing
              </div>
            </div>
            <div style={{ display: "grid", gap: 9, marginTop: 12 }}>
              {results.map((result) => (
                <div
                  key={result.label}
                  style={{
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    background: SURFACE,
                    padding: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <strong style={{ fontSize: 12 }}>{result.label}</strong>
                    <ResultPill pass={result.pass} />
                  </div>
                  <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.5, marginTop: 7 }}>{result.message}</div>
                </div>
              ))}
            </div>
          </section>

          <section
            style={{
              background: SURFACE_2,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Target preview
            </div>
            <pre
              style={{
                marginTop: 10,
                whiteSpace: "pre-wrap",
                color: "#dfe6f5",
                background: SURFACE,
                border: `1px solid ${BORDER}`,
                borderRadius: 6,
                padding: 12,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {targetPreview}
              {"\n\n"}
              {lesson.sampleOutput}
            </pre>
          </section>

          {lesson.contract ? (
            <section
              style={{
                background: SURFACE_2,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                Kernel contract
              </div>
              <dl style={{ display: "grid", gap: 8, marginTop: 10, fontSize: 12 }}>
                <div><dt style={{ color: MUTED }}>Inputs</dt><dd>{lesson.contract.inputs.join(", ")}</dd></div>
                <div><dt style={{ color: MUTED }}>Outputs</dt><dd>{lesson.contract.outputs.join(", ")}</dd></div>
                <div><dt style={{ color: MUTED }}>State</dt><dd>{lesson.contract.stateVariables.join(", ")}</dd></div>
                <div><dt style={{ color: MUTED }}>Guard</dt><dd>{lesson.contract.guardStatus}</dd></div>
                <div><dt style={{ color: MUTED }}>Evidence</dt><dd>{lesson.contract.evidenceStatus}</dd></div>
              </dl>
            </section>
          ) : null}

          <section
            style={{
              background: SURFACE_2,
              border: `1px solid ${BORDER}`,
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div style={{ color: MUTED, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Hints
            </div>
            <ul style={{ paddingLeft: 18, marginTop: 9, color: "#c8cedb", fontSize: 13, lineHeight: 1.55 }}>
              {lesson.hints.map((hint) => <li key={hint}>{hint}</li>)}
            </ul>
            <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 14, paddingTop: 12 }}>
              <div style={{ color: ACCENT, fontSize: 12, marginBottom: 8 }}>Next task</div>
              <p style={{ color: TEXT, fontSize: 13, lineHeight: 1.55 }}>{lesson.nextStep}</p>
              <button
                type="button"
                onClick={() => setLessonIndex((lessonIndex + 1) % lessons.length)}
                style={{
                  marginTop: 10,
                  minHeight: 38,
                  border: `1px solid rgba(232,160,32,0.45)`,
                  borderRadius: 5,
                  background: "rgba(232,160,32,0.08)",
                  color: ACCENT,
                  padding: "8px 12px",
                }}
              >
                Next lesson
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
