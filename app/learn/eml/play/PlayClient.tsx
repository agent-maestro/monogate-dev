"use client";

import { useMemo, useState } from "react";

const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  surface2: "#111421",
  border: "#1c1f2e",
  border2: "#2a3044",
  text: "#d4d4d4",
  muted: "#737890",
  gold: "#e8a020",
  green: "#4ade80",
  blue: "#6ab0f5",
  red: "#f87171",
  violet: "#a78bfa",
};

type Level = {
  id: string;
  title: string;
  badge: string;
  prompt: string;
  goal: string;
  choices: string[];
  answer: string;
  kernel: string;
  electronics: string;
};

const LEVELS: Level[] = [
  {
    id: "signal",
    title: "Signal Gate",
    badge: "level 01",
    prompt: "The sensor is noisy. Choose the expression that keeps the value between 0 and 1.",
    goal: "Learn clamp as the first guard habit.",
    choices: ["sensor * 2.0", "clamp(sensor, 0.0, 1.0)", "sensor + previous"],
    answer: "clamp(sensor, 0.0, 1.0)",
    kernel: `fn normalize(sensor: Real) -> Real {
    clamp(sensor, 0.0, 1.0)
}`,
    electronics: "Potentiometer, humidity, microphone energy, and switch streams all start by becoming bounded inputs.",
  },
  {
    id: "threshold",
    title: "Threshold Door",
    badge: "level 02",
    prompt: "The LED should turn on only when the input crosses the warning line.",
    goal: "Learn a decision boundary.",
    choices: ["if input > 0.55 { 1.0 } else { 0.0 }", "input / 0.55", "exp(input)"],
    answer: "if input > 0.55 { 1.0 } else { 0.0 }",
    kernel: `fn warning(input: Real) -> Real {
    if input > 0.55 { 1.0 } else { 0.0 }
}`,
    electronics: "This is the core move behind LED warnings, buzzer alerts, and environmental guard states.",
  },
  {
    id: "rate",
    title: "Smooth Step",
    badge: "level 03",
    prompt: "The output should not jump instantly. Choose the rate-limited update.",
    goal: "Learn why physical outputs need gentle changes.",
    choices: [
      "target",
      "previous + clamp(target - previous, -0.20, 0.20)",
      "target * target",
    ],
    answer: "previous + clamp(target - previous, -0.20, 0.20)",
    kernel: `fn smooth(previous: Real, target: Real) -> Real {
    previous + clamp(target - previous, -0.20, 0.20)
}`,
    electronics: "Stepper speed, buzzer duty, motor commands, and LED brightness all become friendlier with rate limits.",
  },
  {
    id: "contract",
    title: "Contract Lock",
    badge: "level 04",
    prompt: "The reviewer asks what the hardware was allowed to do. Choose the output that records the guard.",
    goal: "Learn requested versus safe output.",
    choices: [
      "safe = requested",
      "safe = clamp(requested, 0.0, 0.85)",
      "safe = random()",
    ],
    answer: "safe = clamp(requested, 0.0, 0.85)",
    kernel: `fn guard(requested: Real) -> Real {
    clamp(requested, 0.0, 0.85)
}`,
    electronics: "This is what turns a bench demo into replayable evidence: requested output, safe output, and guard action.",
  },
  {
    id: "kernel",
    title: "Build A Kernel",
    badge: "level 05",
    prompt: "Combine the pieces into an electronics starter kernel.",
    goal: "Make the segue from learning EML to building hardware.",
    choices: [
      "sensor -> normalize -> warning -> guard -> trace",
      "sensor -> output with no trace",
      "hardware first, contract later",
    ],
    answer: "sensor -> normalize -> warning -> guard -> trace",
    kernel: `fn guarded_reflex(sensor: Real, previous: Real) -> Real {
    let input = clamp(sensor, 0.0, 1.0);
    let target = if input > 0.55 { 1.0 } else { 0.0 };
    let requested = previous + clamp(target - previous, -0.20, 0.20);
    clamp(requested, 0.0, 0.85)
}`,
    electronics: "Now you have the pattern used by Monogate Electronics: sensor/input -> starter kernel -> guard -> output -> trace.",
  },
];

function codeBlock(text: string) {
  return (
    <pre
      style={{
        margin: 0,
        padding: 14,
        background: "#090b11",
        border: `1px solid ${C.border2}`,
        borderRadius: 6,
        color: C.green,
        fontSize: 12,
        lineHeight: 1.55,
        overflowX: "auto",
      }}
    >
      <code>{text}</code>
    </pre>
  );
}

export default function PlayClient() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [maxSolved, setMaxSolved] = useState(0);
  const level = LEVELS[index];
  const correct = picked === level.answer;
  const solved = Math.max(maxSolved, correct ? index + 1 : 0);
  const unlocked = solved === LEVELS.length;
  const progress = useMemo(() => solved / LEVELS.length, [solved]);

  function choose(choice: string) {
    setPicked(choice);
    if (choice === level.answer) {
      setMaxSolved((value) => Math.max(value, index + 1));
    }
  }

  function next() {
    setPicked(null);
    setIndex((value) => Math.min(LEVELS.length - 1, value + 1));
  }

  function reset() {
    setIndex(0);
    setPicked(null);
    setMaxSolved(0);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        color: C.text,
        padding: "44px 18px 80px",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <a href="/learn/eml" style={{ color: C.muted, fontSize: 12, textDecoration: "none" }}>
          back to EML
        </a>

        <section style={{ marginTop: 18, marginBottom: 30 }}>
          <div style={{ color: C.gold, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
            play EML
          </div>
          <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 7vw, 3.2rem)", lineHeight: 1.05, margin: "0 0 14px" }}>
            Learn the language by solving tiny control puzzles.
          </h1>
          <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.75, maxWidth: 680, margin: 0 }}>
            Each level teaches one EML move: clamp a signal, cross a threshold,
            smooth an output, satisfy a guard, then turn the result into a
            starter electronics kernel.
          </p>
          <div style={{ marginTop: 18, maxWidth: 520 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 11, marginBottom: 6 }}>
              <span>contract meter</span>
              <span>{Math.round(progress * 100)}%</span>
            </div>
            <div style={{ height: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${progress * 100}%`,
                  background: `linear-gradient(90deg, ${C.green}, ${C.blue})`,
                  transition: "width 180ms ease",
                }}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 0.7fr)",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <span style={{ color: C.blue, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {level.badge}
              </span>
              <span style={{ color: C.muted, fontSize: 12 }}>
                solved {solved}/{LEVELS.length}
              </span>
            </div>

            <h2 style={{ color: "#fff", fontSize: 24, margin: "0 0 8px" }}>{level.title}</h2>
            <p style={{ color: C.text, lineHeight: 1.65, margin: "0 0 8px" }}>{level.prompt}</p>
            <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, margin: "0 0 18px" }}>{level.goal}</p>

            <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
              {level.choices.map((choice) => {
                const isPicked = picked === choice;
                const isAnswer = choice === level.answer;
                const border = !picked
                  ? C.border2
                  : isAnswer
                    ? "rgba(74,222,128,0.65)"
                    : isPicked
                      ? "rgba(248,113,113,0.65)"
                      : C.border2;
                return (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => choose(choice)}
                    style={{
                      textAlign: "left",
                      minHeight: 46,
                      border: `1px solid ${border}`,
                      borderRadius: 6,
                      background: isPicked ? "#151a29" : C.surface2,
                      color: C.text,
                      padding: "10px 12px",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            <div style={{ minHeight: 44, color: correct ? C.green : picked ? C.red : C.muted, fontSize: 13, lineHeight: 1.55 }}>
              {unlocked && correct
                ? "Kernel unlocked. You can now carry this pattern into the electronics courses."
                : correct
                ? "Contract satisfied. The kernel is ready to inspect."
                : picked
                  ? "Not quite. The hardware wants a bounded, replayable decision."
                  : "Pick the expression that would make the physical output easiest to trust."}
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button
                type="button"
                disabled={!correct || index === LEVELS.length - 1}
                onClick={next}
                style={{
                  border: `1px solid ${correct ? C.green : C.border2}`,
                  borderRadius: 5,
                  background: correct ? "rgba(74,222,128,0.10)" : C.surface2,
                  color: correct ? C.green : C.muted,
                  padding: "9px 12px",
                  cursor: correct && index < LEVELS.length - 1 ? "pointer" : "default",
                }}
              >
                Next level
              </button>
              <button
                type="button"
                onClick={reset}
                style={{
                  border: `1px solid ${C.border2}`,
                  borderRadius: 5,
                  background: C.surface2,
                  color: C.muted,
                  padding: "9px 12px",
                  cursor: "pointer",
                }}
              >
                Reset run
              </button>
              <a
                href="/electronics"
                style={{
                  border: `1px solid ${unlocked ? C.green : C.border2}`,
                  borderRadius: 5,
                  color: unlocked ? C.green : C.blue,
                  padding: "9px 12px",
                  textDecoration: "none",
                  fontSize: 13,
                }}
              >
                {unlocked ? "Unlock electronics kernels" : "Electronics courses"}
              </a>
            </div>
          </div>

          <aside style={{ display: "grid", gap: 14 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.gold, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                {unlocked ? "unlocked kernel" : "kernel view"}
              </div>
              {codeBlock(level.kernel)}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: 16 }}>
              <div style={{ color: C.violet, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                why it matters
              </div>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{level.electronics}</p>
            </div>

            <div style={{ background: unlocked ? "rgba(74,222,128,0.07)" : C.surface, border: `1px solid ${unlocked ? "rgba(74,222,128,0.28)" : C.border}`, borderRadius: 8, padding: 16 }}>
              <div style={{ color: unlocked ? C.green : C.muted, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
                next build
              </div>
              <p style={{ color: C.text, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                {unlocked
                  ? "Take this kernel shape into Monogate Electronics: LED clamp, soundfield matrix, or environmental guard node."
                  : "Finish the puzzle run to unlock the electronics bridge."}
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
