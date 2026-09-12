import type { Metadata } from "next";
import LessonComplete from "./LessonComplete";

export const metadata: Metadata = {
  title: "EML in 30 Minutes (Level 1) — monogate.dev/learn/eml/intro",
  description:
    "Level 1 of the EML curriculum. Six lessons, five minutes each. By "
    + "the end you'll have written your own equation, emitted selected "
    + "software artifacts, read a chain-order profile, and seen how "
    + "proof-shaped and hardware-shaped obligations stay evidence-bound.",
};

const ACCENT_GOLD = "#E8A020";
const ACCENT_GREEN = "#4ADE80";
const ACCENT_BLUE = "#6AB0F5";
const ACCENT_PURPLE = "#A78BFA";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#12151f";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

// ── Reusable bits ──────────────────────────────────────────

function Code({
  lang,
  children,
}: {
  lang?: string;
  children: string;
}) {
  return (
    <pre
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
        padding: "16px 18px",
        margin: "12px 0",
        fontSize: 12.5,
        lineHeight: 1.55,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        color: TEXT,
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      {lang ? (
        <span style={{ color: MUTED, fontSize: 10, display: "block", marginBottom: 6 }}>
          {lang}
        </span>
      ) : null}
      <code style={{ color: "inherit", background: "transparent" }}>{children}</code>
    </pre>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: "0.92em",
        color: ACCENT_GOLD,
        background: "rgba(232, 160, 32, 0.08)",
        padding: "1px 6px",
        borderRadius: 3,
      }}
    >
      {children}
    </code>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: ACCENT_GOLD,
        textTransform: "uppercase",
        letterSpacing: 1.5,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function Lesson({
  num,
  title,
  minutes,
  anchor,
  accent,
  children,
}: {
  num: number;
  title: string;
  minutes: number;
  anchor: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={anchor}
      style={{
        marginTop: 56,
        paddingTop: 32,
        borderTop: `1px solid ${BORDER}`,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            color: accent,
            letterSpacing: 1.5,
          }}
        >
          LESSON {num.toString().padStart(2, "0")}
        </span>
        <span style={{ fontSize: 11, color: MUTED }}>· {minutes} min</span>
      </div>
      <h2
        style={{
          fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
          fontWeight: 700,
          color: "#fff",
          marginBottom: 18,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {children}
      <LessonComplete num={num} />
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        fontSize: "1.05rem",
        fontWeight: 600,
        color: "#eaeaea",
        marginTop: 28,
        marginBottom: 10,
      }}
    >
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        color: TEXT,
        fontSize: "0.96rem",
        lineHeight: 1.7,
        margin: "10px 0",
      }}
    >
      {children}
    </p>
  );
}

function Exercise({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 16,
        padding: "14px 18px",
        background: "rgba(74, 222, 128, 0.06)",
        border: `1px solid rgba(74, 222, 128, 0.20)`,
        borderRadius: 4,
        fontSize: "0.92rem",
        color: TEXT,
      }}
    >
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: ACCENT_GREEN,
          marginBottom: 8,
        }}
      >
        EXERCISE
      </div>
      {children}
    </div>
  );
}

function StrongLine({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: "20px 0",
        fontSize: "1.02rem",
        fontWeight: 600,
        color: ACCENT_GOLD,
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

function BoundaryNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        margin: "18px 0",
        padding: "14px 18px",
        background: "rgba(106, 176, 245, 0.07)",
        border: `1px solid rgba(106, 176, 245, 0.22)`,
        borderRadius: 4,
        color: TEXT,
        fontSize: "0.92rem",
        lineHeight: 1.65,
      }}
    >
      <div
        style={{
          color: ACCENT_BLUE,
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginBottom: 8,
        }}
      >
        CLAIM BOUNDARY
      </div>
      {children}
    </div>
  );
}

function EvidenceFlow() {
  const steps = [
    { label: "EML source", detail: "one equation" },
    { label: "Selected artifact", detail: "Python / C" },
    { label: "Profile", detail: "chain order" },
    { label: "Evidence packet", detail: "claim boundary" },
    { label: "Review", detail: "human decision" },
  ];
  return (
    <div
      style={{
        margin: "20px 0",
        padding: "18px",
        background: SURFACE_2,
        border: `1px solid ${BORDER}`,
        borderRadius: 4,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))",
          gap: 10,
        }}
      >
        {steps.map((step, index) => (
          <div
            key={step.label}
            style={{
              minHeight: 86,
              padding: "12px",
              border: `1px solid ${index === steps.length - 1 ? "rgba(74, 222, 128, 0.32)" : BORDER}`,
              borderRadius: 4,
              background: index === 0 ? "rgba(232, 160, 32, 0.08)" : SURFACE,
              position: "relative",
            }}
          >
            <div
              style={{
                color: index === steps.length - 1 ? ACCENT_GREEN : ACCENT_GOLD,
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 10.5,
                marginBottom: 8,
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
              {step.label}
            </div>
            <div style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>
              {step.detail}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function ForgeTutorialPage() {
  return (
    <main
      style={{
        maxWidth: 880,
        margin: "0 auto",
        padding: "clamp(32px, 6vw, 60px) clamp(16px, 4vw, 24px) 120px",
        color: TEXT,
      }}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <header style={{ marginBottom: 40 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#666",
            marginBottom: 14,
          }}
        >
          <a href="/learn/eml" style={{ color: "#888", textDecoration: "none" }}>
            ← /learn/eml
          </a>
        </div>
        <Eyebrow>EML-lang · Level 1 · 30-minute crash course</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(1.9rem, 6vw, 2.6rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            lineHeight: 1.12,
          }}
        >
          EML-lang in 30 Minutes
        </h1>
        <p
          style={{
            fontSize: "clamp(0.98rem, 2.4vw, 1.08rem)",
            color: "#bbb",
            lineHeight: 1.65,
            maxWidth: 640,
          }}
        >
          Six lessons, five minutes each. By the end you&apos;ll have written
          your own equation, emitted selected software artifacts, read the
          chain-order profile, and seen how proof-shaped and hardware-shaped
          obligations stay evidence-bound.
        </p>
        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            marginTop: 22,
            fontSize: 13,
            color: MUTED,
          }}
        >
          <span>
            <strong style={{ color: TEXT }}>Audience.</strong> Anyone who
            can write an equation.
          </span>
          <span>
            <strong style={{ color: TEXT }}>Prerequisite.</strong>
            Algebra. That&apos;s it.
          </span>
        </div>
      </header>

      {/* ── What you'll build (TOC) ────────────────────── */}
      <section
        style={{
          marginBottom: 40,
          padding: "20px 22px",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 4,
        }}
      >
        <Eyebrow>What you&apos;ll build</Eyebrow>
        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            color: TEXT,
            fontSize: "0.95rem",
            lineHeight: 1.85,
          }}
        >
          <li>
            <a href="#l1" style={{ color: ACCENT_GOLD }}>
              Write your first equation in EML-lang
            </a>
          </li>
          <li>
            <a href="#l1" style={{ color: ACCENT_GOLD }}>
              Emit selected software artifacts and inspect them
            </a>
          </li>
          <li>
            <a href="#l2" style={{ color: ACCENT_GOLD }}>
              Read a chain-order profile
            </a>
          </li>
          <li>
            <a href="#l3" style={{ color: ACCENT_GOLD }}>
              Build a PID controller
            </a>
          </li>
          <li>
            <a href="#l4" style={{ color: ACCENT_GOLD }}>
              Add a proof-shaped obligation
            </a>
          </li>
          <li>
            <a href="#l5" style={{ color: ACCENT_GOLD }}>
              Preview a hardware-target profile
            </a>
          </li>
          <li>
            <a href="#l6" style={{ color: ACCENT_GOLD }}>
              Build a bounded project artifact
            </a>
          </li>
        </ol>
        <P>
          No programming experience required. EML-lang is math with curly
          braces.
        </P>
      </section>

      <BoundaryNote>
        Level 1 uses selected local artifacts. Some Forge targets are
        structural-only, roadmap-only, or require extra toolchain validation.
        Hardware, proof, and broad source-roundtrip claims require separate
        evidence packets before they are treated as supported.
      </BoundaryNote>

      {/* ── Lesson 1 ───────────────────────────────────── */}
      <Lesson
        num={1}
        title="Your first equation"
        minutes={5}
        anchor="l1"
        accent={ACCENT_BLUE}
      >
        <Heading>The simplest possible program</Heading>
        <P>
          Create a file called <Inline>hello.eml</Inline>:
        </P>
        <Code lang="hello.eml">{`fn add(a: Real, b: Real) -> Real {
    a + b
}`}</Code>
        <P>That&apos;s it. You just wrote EML-lang.</P>
        <P>Let&apos;s break it down:</P>
        <Code>{`fn              → "I'm defining a function"
add             → the name (you pick this)
(a: Real,       → first input, it's a real number
 b: Real)       → second input, also a real number
-> Real         → this function returns a real number
{               → start of the math
    a + b       → the equation (just addition)
}               → end`}</Code>

        <Heading>Compile it</Heading>
        <P>
          Install the compiler once — it is free, and every target is
          included:
        </P>
        <Code lang="bash">{`pip install monogate-forge`}</Code>
        <P>Then compile. Each command takes one source and one target:</P>
        <Code lang="bash">{`eml-compile hello.eml --target python -o hello.py
eml-compile hello.eml --target c -o hello.c`}</Code>

        <Heading>What you get</Heading>
        <Code>{`hello.py          ← Python
hello.c           ← C`}</Code>
        <P>
          Want every target at once?{" "}
          <Inline>eml-compile hello.eml --target all -o my_first</Inline>{" "}
          writes one file per target into <Inline>my_first/</Inline> and skips
          the targets whose annotation the source does not carry.
        </P>

        <P>
          Open <Inline>hello.c</Inline> and look (file header trimmed):
        </P>
        <Code lang="hello.c">{`#include "libmonogate.h"
#include <stdint.h>
#include <math.h>

/*
 * add
 * Chain order: 0     Cost class: p0-d1-w0-c0
 * EML depth:   1  Drift risk: LOW
 * Dynamics:    0 osc, 0 decay  (predicted_r=0)
 * FPGA est:   1 MAC, 0 exp, 0 ln, 0 trig -> 2 cy @ 32-bit
 */
double add(double a, double b) {
    return (a + b);
}`}</Code>

        <P>
          Your equation, lowered into C. <Inline>libmonogate.h</Inline> ships
          inside the <Inline>monogate-forge</Inline> package, under{" "}
          <Inline>software/runtime/c/</Inline>.
        </P>

        <Heading>The evidence shape</Heading>
        <EvidenceFlow />
        <P>
          The point is not to pretend every target is already production-ready.
          The point is to keep the artifact, profile, evidence packet, and
          reviewer boundary close together.
        </P>

        <StrongLine>
          You just turned one equation into selected inspectable artifacts with an explicit evidence boundary.
        </StrongLine>

        <Exercise>
          Change <Inline>a + b</Inline> to <Inline>a * b</Inline>. Recompile.
          Open the Python and C files. See how they changed.
        </Exercise>
      </Lesson>

      {/* ── Lesson 2 ───────────────────────────────────── */}
      <Lesson
        num={2}
        title="Constants and real math"
        minutes={5}
        anchor="l2"
        accent={ACCENT_BLUE}
      >
        <Heading>Adding constants</Heading>
        <Code lang="gravity.eml">{`const g: Real = 9.81
const half: Real = 0.5

fn fall_distance(t: Real) -> Real {
    half * g * t * t
}

fn fall_velocity(t: Real) -> Real {
    g * t
}`}</Code>
        <P>
          <Inline>const</Inline> gives a name to a number. Same as any
          language.
        </P>

        <Heading>Using transcendental functions</Heading>
        <P>These are the functions that make EML-lang special:</P>
        <Code lang="transcendental.eml">{`fn exponential_decay(t: Real, k: Real) -> Real {
    exp(-k * t)
}

fn oscillation(t: Real, freq: Real) -> Real {
    sin(freq * t)
}

fn damped_wave(t: Real, decay: Real, freq: Real) -> Real {
    exp(-decay * t) * cos(freq * t)
}`}</Code>

        <P>The available math functions:</P>
        <Code>{`FUNCTION       WHAT IT DOES                 CHAIN ORDER
─────────────────────────────────────────────────────────
+ - * /        arithmetic                   0
exp(x)         e to the x                   adds 1
ln(x)          natural log of x             adds 1
sin(x)         sine                         adds 2
cos(x)         cosine                       adds 2
tan(x)         tangent                      adds 2
sqrt(x)        square root                  0
tanh(x)        hyperbolic tangent           adds 2
arcsin(x)      inverse sine                 adds 2
arccos(x)      inverse cosine               adds 2
atan2(y, x)    angle from coordinates       adds 2
abs(x)         absolute value               0
clamp(x, l, h) clip to range                0
min(a, b)      smaller of two               0
max(a, b)      larger of two                0
pow(x, y)      x to the y                   0 to 1
eml(x, y)      exp(x) - ln(y)               adds 1`}</Code>

        <Heading>Compile and read the profile</Heading>
        <Code lang="bash">{`eml-compile transcendental.eml --profile-only`}</Code>
        <P>The compiler tells you about each function (two of the three shown):</P>
        <Code>{`  exponential_decay
    status: ok    chain_order: 1    cost_class: p1-d2-w1-c0    eml_depth: 2    drift: MEDIUM
    dynamics: 0 osc, 1 decay  (predicted_r=1)
    fpga: 2 MAC, 1 exp, 0 ln, 0 trig (4 cy @ 32-bit)

  damped_wave
    status: ok    chain_order: 3    cost_class: p3-d5-w2-c0    eml_depth: 5    drift: HIGH
    dynamics: 1 osc, 1 decay  (predicted_r=3)
    fpga: 5 MAC, 1 exp, 0 ln, 1 trig (10 cy @ 64-bit)`}</Code>
        <P>
          <Inline>exponential_decay</Inline> has one <Inline>exp</Inline>{" "}
          layer, so chain order 1. <Inline>damped_wave</Inline> stacks{" "}
          <Inline>exp</Inline> and <Inline>cos</Inline> into chain order 3, and
          the drift flag rises with it.
        </P>

        <Heading>What chain order means (plain English)</Heading>
        <Code>{`Chain 0:   Just arithmetic. x + y, x * y, x^2.
           Usually simplest. Low drift risk on normal ranges.
           Still validate your numeric range.

Chain 1:   One exp or ln involved.
           Like exponential decay, compound interest.
           Often manageable. Check domains and exponent size.

Chain 2:   Trig involved. sin, cos, tanh.
           Like oscillations, waves, rotations.
           Usually wants float32+ and sample-grid checks.

Chain 3+:  Multiple layers nested.
           Like exp(sin(x)) or damped oscillators.
           Often wants float64. FPGA profiles need review.
           The compiler warns you automatically.`}</Code>

        <Exercise>
          Write a function for compound interest:{" "}
          <Inline>A = P * exp(r * t)</Inline>. Compile it. What chain order
          does the compiler report?
          <span style={{ color: MUTED }}> (Answer: chain 1 — one exp layer.)</span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 3 ───────────────────────────────────── */}
      <Lesson
        num={3}
        title="PID controller"
        minutes={5}
        anchor="l3"
        accent={ACCENT_GOLD}
      >
        <Heading>The most common equation in all of engineering</Heading>
        <P>Every robot, drone, car, thermostat, and factory uses PID:</P>
        <Code lang="pid_controller.eml">{`const Kp: Real = 2.5      // proportional gain
const Ki: Real = 0.1      // integral gain
const Kd: Real = 0.05     // derivative gain

fn pid(error: Real, integral: Real, derivative: Real) -> Real {
    Kp * error + Ki * integral + Kd * derivative
}`}</Code>
        <P>That&apos;s a complete PID controller.</P>

        <Heading>Compile it</Heading>
        <Code lang="bash">{`eml-compile pid_controller.eml --target python -o pid_controller.py
eml-compile pid_controller.eml --profile-only`}</Code>

        <Heading>What the compiler tells you</Heading>
        <Code>{`  pid
    status: ok    chain_order: 0    cost_class: p0-d2-w0-c0    eml_depth: 2    drift: LOW
    dynamics: 0 osc, 0 decay  (predicted_r=0)
    fpga: 2 MAC, 0 exp, 0 ln, 0 trig (4 cy @ 32-bit)`}</Code>

        <P>
          Chain order 0 means this PID is just arithmetic. No{" "}
          <Inline>exp</Inline>. No <Inline>sin</Inline>. Pure math. That makes
          it easier to inspect, but deployment still needs tests for the
          numeric range you care about.
        </P>

        <Heading>Now make it nonlinear</Heading>
        <Code lang="nonlinear_pid.eml">{`const Kp: Real = 2.5
const decay: Real = 0.1
const freq: Real = 10.0

fn adaptive_pid(error: Real, t: Real) -> Real {
    let gain = exp(-decay * t) * cos(freq * t);
    gain * Kp * error
}`}</Code>
        <P>Profile it again:</P>
        <Code lang="bash">{`eml-compile nonlinear_pid.eml --profile-only`}</Code>
        <Code>{`  adaptive_pid
    status: ok    chain_order: 3    cost_class: p3-d5-w2-c0    eml_depth: 5    drift: HIGH
    dynamics: 1 osc, 1 decay  (predicted_r=3)
    fpga: 5 MAC, 1 exp, 0 ln, 1 trig (10 cy @ 64-bit)`}</Code>

        <StrongLine>
          The compiler told you the complexity jumped. Before you ran
          anything expensive. Chain order is a review signal, not a proof of
          speed, stability, or deployability.
        </StrongLine>

        <Exercise>
          Add a <Inline>tanh</Inline> to the PID output (to clamp it
          smoothly). What does the chain order become?
          <span style={{ color: MUTED }}>
            {" "}
            (Answer: chain 2 — tanh adds 2 to chain 0.)
          </span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 4 ───────────────────────────────────── */}
      <Lesson
        num={4}
        title="Proof-shaped obligations"
        minutes={5}
        anchor="l4"
        accent={ACCENT_PURPLE}
      >
        <Heading>Making the code state what must be true</Heading>
        <P>
          Add <Inline>@verify</Inline> to any function:
        </P>
        <Code lang="safe_pid.eml">{`const Kp: Real = 2.5
const Ki: Real = 0.1
const max_output: Real = 100.0

@verify(lean, theorem = "pid_is_bounded")
fn safe_pid(error: Real, integral: Real) -> Real
    requires (abs(error) < 50.0)
    requires (abs(integral) < 500.0)
    ensures  (result >= -max_output)
    ensures  (result <= max_output)
{
    clamp(Kp * error + Ki * integral, -max_output, max_output)
}`}</Code>

        <P>What the new keywords mean:</P>
        <Code>{`@verify(lean, theorem = "pid_is_bounded")
  → "Emit a Lean theorem for this function, and try to prove it"
  → The theorem will be named "pid_is_bounded"

requires (abs(error) < 50.0)
  → "This function only works when error is between -50 and 50"
  → If someone passes error = 999, that's THEIR bug, not yours

ensures (result >= -max_output)
ensures (result <= max_output)
  → "This is the property the theorem states"
  → One conclusion per ensures`}</Code>

        <Heading>Compile to Lean</Heading>
        <Code lang="bash">{`eml-compile safe_pid.eml --target lean -o ./verified.lean`}</Code>
        <P>
          Open <Inline>verified.lean</Inline> (imports trimmed):
        </P>
        <Code lang="lean">{`noncomputable def safe_pid (error : Real) (integral : Real) : Real :=
  (min (max ((Kp * error) + (Ki * integral)) (-max_output)) max_output)

theorem pid_is_bounded (error : Real) (integral : Real)
    (h1 : ((abs error) < (50.0 : Real)))
    (h2 : ((abs integral) < (500.0 : Real)))
    (h_clamp1 : (-max_output) ≤ max_output) :
    (((safe_pid error integral) >= (-max_output))) ∧ (((safe_pid error integral) <= max_output)) := by
  unfold safe_pid
  refine ⟨?_, ?_⟩ <;>
    first
    | (apply lo_le_clamp <;> (first | assumption | mach_positivity))
    | apply clamp_le_hi
    -- ... 13 more tactics, tried in order ...
    | sorry  -- out of reach; left for the prover`}</Code>

        <P>
          One hypothesis per <Inline>requires</Inline>, one conclusion per{" "}
          <Inline>ensures</Inline>. Forge adds <Inline>h_clamp1</Inline>{" "}
          itself: a clamp needs its lower bound not above its upper bound.
        </P>

        <Heading>Is it proved?</Heading>
        <P>
          Do not look for <Inline>sorry</Inline>. It is always there: Forge
          emits a list of tactics to try in order, and{" "}
          <Inline>sorry</Inline> is the last one, reached only if all the others
          fail. Ask Lean what the theorem depends on instead. That needs
          MachLib, the Lean library these theorems are stated against:
        </P>
        <Code lang="bash">{`git clone https://github.com/agent-maestro/machlib
cd machlib/foundations
lake build          # needs elan; about ten minutes the first time
echo '#print axioms pid_is_bounded' >> /path/to/verified.lean
lake env lean /path/to/verified.lean`}</Code>
        <Code>{`'pid_is_bounded' depends on axioms: [propext, Classical.choice, Real, Quot.sound,
 addR, leR, le_iff_lt_or_eq, ltR, lt_total, mulR, negR, realOfScientific, zeroR]`}</Code>
        <P>
          No <Inline>sorryAx</Inline> in the list, so{" "}
          <Inline>pid_is_bounded</Inline> is proved. The list is what the proof
          rests on: Lean&apos;s own <Inline>propext</Inline>,{" "}
          <Inline>Classical.choice</Inline> and <Inline>Quot.sound</Inline>,
          plus MachLib&apos;s axioms for the real numbers.
        </P>

        <Heading>True is not the same as proved</Heading>
        <P>
          Delete the <Inline>clamp</Inline> and return{" "}
          <Inline>Kp * error + Ki * integral</Inline>. The theorem is now
          false: at <Inline>error = 49</Inline> and{" "}
          <Inline>integral = 499</Inline> the output is 172.4. Recompile, and{" "}
          <Inline>#print axioms</Inline> shows <Inline>sorryAx</Inline>.
        </P>
        <P>
          Now tighten the inputs to <Inline>abs(error) &lt; 20.0</Inline> and{" "}
          <Inline>abs(integral) &lt; 400.0</Inline>. The output stays under 90,
          so the theorem is true again, and it still shows{" "}
          <Inline>sorryAx</Inline>: none of the tactics Forge tries finds this
          proof. <Inline>sorryAx</Inline> means not proved. It does not mean
          false.
        </P>

        <Heading>Why this matters</Heading>
        <Code>{`WITHOUT @verify:
  "I think my PID output stays under 100."
  "It worked in testing."
  "Ship it and hope."

WITH @verify:
  "The theorem states exactly what must be true."
  "#print axioms says whether it is proved."
  "An unproved theorem is visible instead of hidden."`}</Code>

        <Heading>Advanced preview: other proof targets</Heading>
        <P>
          The same obligation shape can be routed to other proof-shaped or
          contract-shaped targets where those local backends are enabled. Each
          target still needs its own validation; emitting a scaffold is not the
          same thing as discharging a proof.
        </P>
        <Code lang="bash">{`eml-compile safe_pid.eml --target coq      -o ./safe.v
eml-compile safe_pid.eml --target isabelle -o ./Safe.thy
eml-compile safe_pid.eml --target ada      -o ./safe.adb`}</Code>

        <Exercise>
          Write a function for temperature conversion:{" "}
          <Inline>fn celsius_to_fahrenheit(c: Real) -&gt; Real</Inline>{" "}
          returning <Inline>1.8 * c + 32.0</Inline>. Add{" "}
          <Inline>@verify</Inline> with{" "}
          <Inline>requires (c &gt; -273.15)</Inline> (can&apos;t go below
          absolute zero) and{" "}
          <Inline>ensures (result &gt; -459.67)</Inline> (same constraint
          in Fahrenheit). Compile to Lean and run{" "}
          <Inline>#print axioms</Inline>. Proved, or only true?
        </Exercise>
      </Lesson>

      {/* ── Lesson 5 ───────────────────────────────────── */}
      <Lesson
        num={5}
        title="Hardware-shaped preview"
        minutes={5}
        anchor="l5"
        accent={ACCENT_GOLD}
      >
        <Heading>Preparing your math for hardware review</Heading>
        <P>
          Add <Inline>@target(fpga)</Inline> to any function:
        </P>
        <Code lang="fpga_pid.eml">{`const Kp: Real = 2.5
const Ki: Real = 0.1

@target(fpga, clock_mhz = 100)
fn hardware_pid(error: Real, integral: Real) -> Real {
    Kp * error + Ki * integral
}`}</Code>

        <Heading>Emit a hardware-shaped artifact</Heading>
        <Code lang="bash">{`eml-compile fpga_pid.eml --target verilog -o pid.v
eml-compile fpga_pid.eml --target systemverilog -o pid.sv
eml-compile fpga_pid.eml --allocate`}</Code>
        <P>
          The compiler does not create directories, so write to{" "}
          <Inline>pid.v</Inline> or make the folder first.{" "}
          <Inline>--allocate</Inline> prints the plan:
        </P>
        <Code>{`  FPGA allocation plan for Arty A7-100
  Pipeline depth: 2 stages
  Clock target:   100 MHz
  Throughput:     50.0 Msamples/s

  Resources:    100 LUTs     2 DSPs      0 KB BRAM
  MAC units:  2
  Transcendental units: none (pure-polynomial design)`}</Code>

        <P>
          The start of <Inline>pid.v</Inline>:
        </P>
        <Code lang="verilog">{`// Target device: Arty A7-100
// Pipeline depth: 2 stages
// Estimated:    100 LUTs, 2 DSPs, 0 KB BRAM
// Throughput:   50.0 Msamples/s @ 100 MHz

module hardware_pid_pipeline #(
    parameter WIDTH = 32,
    parameter FRAC  = 16
) (
    input  wire             clk,
    input  wire             rst,
    input  wire             valid_in,
    input  wire signed [WIDTH-1:0] error,
    input  wire signed [WIDTH-1:0] integral,
    output reg              valid_out,
    output reg signed [WIDTH-1:0] result
);

    localparam signed [WIDTH-1:0] Kp = 32'sd163840;  // 2.5
    localparam signed [WIDTH-1:0] Ki = 32'sd6554;  // 0.1
    // ...
    assign _w1_full = Kp * error;
    assign _w2 = _pr1 >>> FRAC;`}</Code>
        <P>
          The gains became Q16.16 fixed-point constants, and each product is
          shifted back down by <Inline>FRAC</Inline> bits.
        </P>

        <P>
          That&apos;s your equation as a hardware module candidate. The next
          steps are simulation, synthesis, board integration, and an evidence
          packet before any hardware-deployment claim.
        </P>
        <BoundaryNote>
          Level 1 does not claim hardware validation. Verilog-like output,
          FPGA estimates, and hardware annotations are review inputs until
          simulation, synthesis, and board evidence are attached.
        </BoundaryNote>

        <Heading>What the numbers mean</Heading>
        <Code>{`LUTs:      Estimated logic blocks for the selected FPGA profile.
           Treat this as a planning signal until synthesis confirms it.

DSPs:      Dedicated multiplier blocks. 2 out of 240 available.
           One for each multiplication (Kp*error, Ki*integral).

Pipeline depth, Throughput:
           The allocator's model, not a measurement: throughput is the
           clock divided by the depth. Simulated, pid.v takes a new
           sample on every clock edge and answers 3 cycles later (its
           header says "Total latency: 3 cycles"), so it runs at the
           clock rate: 100 Msamples/s at 100 MHz, not 50. Whether a
           part closes timing at 100 MHz is for synthesis to say.

For comparison:
  Software path: run and test first.
  FPGA path:     emit, simulate, synthesize, then measure.

  Do not claim speed until measured evidence exists.`}</Code>

        <Exercise>
          Take the <Inline>damped_wave</Inline> from Lesson 2. Add{" "}
          <Inline>@target(fpga)</Inline>. Compare the hardware-review notes
          to the simple PID.
          <span style={{ color: MUTED }}>
            {" "}
            (The damped wave needs exp + cos hardware units. More
            resources.)
          </span>
        </Exercise>
      </Lesson>

      {/* ── Lesson 6 ───────────────────────────────────── */}
      <Lesson
        num={6}
        title="Your own project"
        minutes={5}
        anchor="l6"
        accent={ACCENT_GREEN}
      >
        <Heading>Pick any equation you know</Heading>
        <P>Here are ideas based on what you do:</P>
        <Code>{`IF YOU'RE A MECHANICAL ENGINEER:
  Spring-mass-damper: F = -k*x - c*v
  Heat transfer:      Q = h*A*(T_surface - T_fluid)
  Stress:             sigma = F / A

IF YOU'RE AN ELECTRICAL ENGINEER:
  RC decay:       V = V0 * exp(-t / (R*C))
  RLC oscillator: V = V0 * exp(-R*t/(2*L)) * cos(omega*t)
  Ohm's law:      V = I * R

IF YOU'RE A CHEMICAL ENGINEER:
  Arrhenius:       k = A * exp(-Ea / (R*T))
  First-order:     C = C0 * exp(-k*t)
  pH:              pH = -ln(H_concentration) / ln(10)

IF YOU'RE A GAME DEVELOPER:
  Projectile:      y = v0*t - 0.5*g*t*t
  Bounce decay:    y = A * exp(-d*t) * abs(sin(omega*t))
  Camera smoothing: pos = lerp(curr, target, 1 - exp(-speed*dt))

IF YOU DON'T KNOW WHAT EQUATION TO USE:
  Just do this:

  fn my_function(x: Real) -> Real {
      exp(x) * sin(x)
  }

  Compile it. See what happens.`}</Code>

        <Heading>Write it</Heading>
        <Code lang="my_project.eml">{`const k: Real = 100.0     // spring constant
const c: Real = 5.0       // damping coefficient
const m: Real = 1.0       // mass

fn spring_force(x: Real, v: Real) -> Real {
    (-k * x - c * v) / m
}

@verify(lean, theorem = "force_proportional")
fn verified_spring(x: Real, v: Real) -> Real
    requires (abs(x) < 10.0)
    requires (abs(v) < 100.0)
    ensures  (abs(result) < 1500.0)
{
    spring_force(x, v)
}

@target(fpga, clock_mhz = 200)
fn realtime_spring(x: Real, v: Real) -> Real {
    spring_force(x, v)
}`}</Code>

        <Heading>Compile it</Heading>
        <Code lang="bash">{`eml-compile my_project.eml --target python -o my_project.py
eml-compile my_project.eml --target c -o my_project.c
eml-compile my_project.eml --target lean -o my_project.lean
eml-compile my_project.eml --target verilog -o my_project.v`}</Code>
        <P>
          Then run <Inline>#print axioms force_proportional</Inline> as in
          Lesson 4. With monogate-forge 0.14.4 it shows{" "}
          <Inline>sorryAx</Inline>: the bound is true (the output stays under
          1000 + 500) but not proved. Can you rewrite the function so it is?
        </P>

        <Heading>What you just did</Heading>
        <Code>{`In 30 minutes you:

  1. Learned EML-lang syntax (fn, const, Real)
  2. Used transcendental functions (exp, sin, cos)
  3. Read chain-order profiles
  4. Built a PID controller
  5. Stated a property with @verify and asked Lean whether it is proved
  6. Emitted a hardware-shaped profile (@target) without claiming hardware validation
  7. Built YOUR OWN bounded artifact

You can now:
  - Write any equation in EML-lang
  - Emit software targets, one per command
  - Read the structural profile (chain order, drift risk)
  - Tell a proved theorem from a stated one with #print axioms
  - Prepare hardware candidates for simulation and evidence review`}</Code>

        <StrongLine>
          One equation. Inspectable artifacts. Explicit evidence boundaries.
        </StrongLine>
      </Lesson>

      {/* ── Quick Reference ────────────────────────────── */}
      <section
        id="reference"
        style={{
          marginTop: 64,
          paddingTop: 32,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <Eyebrow>Quick reference card</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 18,
          }}
        >
          Print this and pin it to your wall.
        </h2>
        <Code>{`SYNTAX
  const NAME: Real = VALUE
  fn NAME(x: Real, y: Real) -> Real { equation }
  let temp = sub_expression;
  if condition { a } else { b }

MATH
  +  -  *  /                  arithmetic
  exp(x)  ln(x)               exponential / log
  sin(x)  cos(x)  tanh(x)     trigonometric
  sqrt(x)  abs(x)             utilities
  min(a, b)  max(a, b)        comparison
  clamp(x, lo, hi)            saturating clip
  arcsin(x)  arccos(x)        inverse trig
  atan2(y, x)                 angle from (x, y)
  pow(x, y)                   x to the y
  eml(x, y) = exp(x) - ln(y)  fundamental EML operator

ANNOTATIONS
  @verify(lean, theorem = "name")  emit a Lean theorem and try to prove it
  @target(fpga, clock_mhz = N)     emit a hardware-shaped profile
  requires CONDITION               input precondition
  ensures  CONDITION               output postcondition

COMPILE (one source and one target per command)
  eml-compile file.eml --target python -o out.py
  eml-compile file.eml --target c -o out.c
  eml-compile file.eml --target lean -o out.lean     # needs @verify(lean)
  eml-compile file.eml --target verilog -o out.v     # needs @target(fpga)
  eml-compile file.eml --target all -o out           # every target it qualifies for
  eml-compile file.eml --profile-only                # chain order, cost class, drift

CHECK A PROOF (in machlib/foundations)
  echo '#print axioms NAME' >> /path/to/out.lean
  lake env lean /path/to/out.lean    # sorryAx in the list = not proved

PROFILE READING
  chain_order: 0   polynomial (usually low drift risk)
  chain_order: 1   exponential (check domains and exponent size)
  chain_order: 2   trigonometric (sample-grid checks recommended)
  chain_order: 3+  nested (stronger numeric review recommended)
  drift_risk: LOW / MEDIUM / HIGH  precision warning`}</Code>
      </section>

      {/* ── Next Steps ─────────────────────────────────── */}
      <section
        style={{
          marginTop: 56,
          paddingTop: 32,
          borderTop: `1px solid ${BORDER}`,
        }}
      >
        <Eyebrow>Next steps</Eyebrow>
        <h2
          style={{
            fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
            fontWeight: 700,
            color: "#fff",
            marginBottom: 18,
          }}
        >
          You finished. Now what?
        </h2>
        <ol
          style={{
            color: TEXT,
            fontSize: "0.96rem",
            lineHeight: 1.85,
            paddingLeft: 22,
          }}
        >
          <li>
            <strong style={{ color: "#fff" }}>Prove one property.</strong>{" "}
            Take one equation from this course, give it requires and ensures,
            compile it to Lean, and check with <Inline>#print axioms</Inline>{" "}
            whether it is proved.
          </li>
        </ol>
        <p style={{ marginTop: 18 }}>
          <a
            href="/learn/eml/intro/guard"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#0b0d12",
              background: ACCENT_GOLD,
              borderRadius: 4,
              padding: "10px 14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Continue to the first guard kernel
          </a>
        </p>
      </section>
    </main>
  );
}
