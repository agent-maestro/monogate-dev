import type { Metadata } from "next";
import type { ReactNode } from "react";
import CopyButton from "../CopyButton";

export const metadata: Metadata = {
  title: "EML Intro: Your First Guard Kernel",
  description:
    "Write a Reflex Guard function in EML, compile it toward ESP32 C, check its Lean proof with #print axioms, and watch the guard fire in the Monogate Electronics visualizer.",
};

const GREEN = "#4ADE80";
const CYAN = "#6AB0F5";
const GOLD = "#E8A020";
const BG = "#08090e";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#12151f";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#7f8499";

// Named reflex_guard, not guard, because `guard` is taken in Lean. Up to
// monogate-forge 0.14.4 a kernel named guard emitted Lean that did not compile
// ("already declared"); 0.15.0 and 0.16.0 escape a reserved name instead and emit
// `guard_`, so the file compiles but the Lean name no longer matches the EML
// one. Pick a name that is not reserved and neither happens.
const emlSource = `module threshold_reflex;

@verify(lean, theorem = "guard_output_bounded")
@target(fpga, clock_mhz = 100)
fn reflex_guard(request: Real, limit: Real) -> Real
    requires (limit > 0.0)
    ensures (result <= limit)
{
    min(request, limit)
}`;

const compileC = `eml-compile threshold_reflex_v0.eml --target c -o threshold_reflex_v0.c`;
const compileLean = `eml-compile threshold_reflex_v0.eml --target lean -o threshold_reflex_v0.lean`;
// The Verilog target REFUSES this kernel, and the refusal is the lesson. Keep
// the narration on the line after the command: scripts/check_site_commands.mjs
// reads a following "compile error" line as "this command must exit non-zero",
// and requires every other command on the page to exit 0.
const compileVerilog = `eml-compile threshold_reflex_v0.eml --target verilog -o threshold_reflex_v0.v
compile error (emission gate): function(s) failed to emit, so the output is a comment rather than a datapath:
[('reflex_guard', "unsupported construct: 'no hardware realization for min(...), called from
this kernel(...). Every call needs a resolved module and a resolved latency before any RTL is
written: a guessed latency latches a register before its operand exists, which synthesises and
computes nothing.'")]`;

const verilogFix = `@verify(lean, theorem = "guard_output_bounded")
@target(fpga, clock_mhz = 100)
fn reflex_guard(request: Real, limit: Real) -> Real
    requires (limit > 0.0)
    ensures (result <= limit)
{
    clamp(request, 0.0, limit)
}`;

// Real output of monogate-forge 0.16.0 for emlSource. The file header and the
// two long rationale comments are trimmed; every line of code is verbatim, and
// each cut is marked. 0.15.0 emitted no fp-contract pragma at all.
const generatedC = `#include "libmonogate.h"
#include <stdint.h>
#include <math.h>

/* UNFUSED BY DEFAULT. \`a + b * c\` in EML is an add of a ROUNDED product; the fused operation is
 * written \`fma(a, b, c)\` and is emitted as a call to \`fma\`, which still contracts. GCC contracts
 * \`a + b*c\` into one fused multiply-add at -O2 and above [...], which would change this
 * artifact's last bits. The pragma below turns that off for THIS FILE ONLY [...]
 * THIS OVERRIDES -ffast-math, ON PURPOSE. [... rationale trimmed ...] */
#if defined(__clang__)
#pragma STDC FP_CONTRACT OFF
#elif defined(__GNUC__)
#pragma GCC push_options
#pragma GCC optimize("fp-contract=off")
#else
#pragma STDC FP_CONTRACT OFF
#endif
#include <stdio.h>
#include <stdlib.h>

/* Contract checks. NOT assert(): -DNDEBUG would delete them, and a release
 * build that silently drops every \`requires\` and \`ensures\` is exactly the
 * obligation attenuation this compiler exists to report. */
#define EML_CONTRACT(cond, msg) \\
    do { if (!(cond)) { \\
        fprintf(stderr, "EML contract violated: %s\\n", (msg)); \\
        abort(); } } while (0)

static inline double eml_builtin_min(double a, double b) { return isnan(a) ? a : isnan(b) ? b : a == b ? (signbit(a) ? a : b) : fmin(a, b); }

/*
 * reflex_guard
 * Pfaffian chain count (eml-cost pfaffian_r): 0     Cost class: p0-d1-w0-c0
 * EML depth:   1  Symbolic band: LOW (from pfaffian_r only)
 * Numerical:   cancellation exposure NONE  (no mixed-sign subtraction)
 * Dynamics:    0 osc, 0 decay  (predicted_r=0)
 * source obligations for reflex_guard: {O1}
 *   O1 [b0f58e3d87b2] -> PRESERVED (equivalent)  EML_CONTRACT before return; survives -DNDEBUG
 *        build: unconditional -- EML_CONTRACT is a self-contained if/abort, NOT assert(), so -DNDEBUG cannot delete it
 * FPGA est:   1 MAC, 0 exp, 0 ln, 0 trig -> 2 cy @ 32-bit
 */
double reflex_guard(double request, double limit) {
    EML_CONTRACT(((limit > 0.0)), "reflex_guard: requires ((limit > 0.0))");
    double result = eml_builtin_min(request, limit);
    EML_CONTRACT(((result <= limit)), "reflex_guard: ensures violated: (result <= limit)");
    return result;
}

#if !defined(__clang__) && defined(__GNUC__)
#pragma GCC pop_options  /* end of the unfused region: see the note at the top of this file */
#endif`;

const inoAdapter = `// threshold_reflex_v0.c, libmonogate.h and libmonogate.c sit beside this sketch.
extern "C" double reflex_guard(double request, double limit);

void loop() {
    int raw = analogRead(34);
    double pot_raw = raw / 4095.0;
    double requested_output = pot_raw;
    double safe_output = reflex_guard(requested_output, 0.85);
    const char* guard_action =
        requested_output > safe_output ? "clamp_to_safe_output" : "pass_through";

    Serial.printf(
        "{\\"pot_raw\\":%.3f,\\"requested_output\\":%.3f,\\"safe_output\\":%.3f,\\"guard_action\\":\\"%s\\"}\\n",
        pot_raw,
        requested_output,
        safe_output,
        guard_action
    );
}`;

// Real output of monogate-forge 0.16.0 (excerpt). The axiom report below is
// re-derived before each deploy by scripts/check_lesson_proofs.mjs, which
// fails when it stops matching what Lean prints.
const leanOutput = `import MachLib.EML
import MachLib.Trig
import MachLib.Forge
import MachLib.Linarith
import MachLib.FixedPoint
import MachLib.SignTactic
import MachLib.Decimal

set_option maxHeartbeats 1000000
set_option autoImplicit false
set_option linter.unusedSimpArgs false

open MachLib
open MachLib.Real

noncomputable def reflex_guard (request : Real) (limit : Real) : Real :=
  (min request limit)

theorem guard_output_bounded (request : Real) (limit : Real)
    (h1 : (limit > (0 : Real))) :
    ((reflex_guard request limit) <= limit) := by
  unfold reflex_guard
  try mach_split_hyps
  try dsimp only
  all_goals
    (try simp only [add_zero, zero_add, mul_zero, zero_mul, mul_one_ax, one_mul_thm, div_one_eq, ofSci_zero]) <;>
      first
      | (apply lo_le_clamp <;> (first | assumption | mach_positivity))
      | (apply clamp_le_hi <;> (first | assumption | mach_positivity))
      -- ... 14 more tactics, tried in order ...
      | sorry  -- out of reach; left for the prover`;

const checkAxioms = `git clone https://github.com/agent-maestro/machlib
cd machlib/foundations
lake build          # needs elan; about ten minutes the first time
echo '#print axioms guard_output_bounded' >> /path/to/threshold_reflex_v0.lean
lake env lean /path/to/threshold_reflex_v0.lean`;

const axiomsOutput = `'guard_output_bounded' depends on axioms: [propext, Classical.choice, Real,
 Quot.sound, leR, le_iff_lt_or_eq, ltR, zeroR]`;

const jsonFrame = `{
  "pot_raw": 0.97,
  "requested_output": 1.00,
  "safe_output": 0.85,
  "guard_action": "clamp_to_safe_output"
}`;

function Shell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "Space Mono, ui-monospace, SFMono-Regular, Menlo, monospace",
        padding: "42px 18px 96px",
      }}
    >
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>{children}</div>
    </main>
  );
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      style={{
        padding: "34px 0",
        borderTop: `1px solid ${BORDER}`,
        display: "grid",
        gap: 18,
      }}
    >
      <div>
        <p style={{ margin: "0 0 8px", color: GOLD, fontSize: 12, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
          {kicker}
        </p>
        <h2 style={{ margin: 0, color: "#fff", fontSize: "clamp(25px, 4vw, 38px)", lineHeight: 1.12 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: 0, color: TEXT, fontSize: 15, lineHeight: 1.72 }}>{children}</p>;
}

function Inline({ children }: { children: ReactNode }) {
  return (
    <code style={{ color: "#fff2a6", background: "rgba(232,160,32,0.10)", borderRadius: 3, padding: "1px 5px" }}>
      {children}
    </code>
  );
}

function CodeBlock({ code, lang, filename, command }: { code: string; lang?: string; filename?: string; command?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 0 }}>
      {filename ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            padding: "8px 10px",
            border: `1px solid ${BORDER}`,
            borderBottom: 0,
            borderRadius: "6px 6px 0 0",
            background: SURFACE_2,
            color: CYAN,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          <span>{filename}</span>
          <CopyButton text={code} />
        </div>
      ) : null}
      <div style={{ position: "relative" }}>
        {!filename && (command || lang) ? (
          <div style={{ position: "absolute", right: 8, top: 8, zIndex: 1 }}>
            <CopyButton text={code} />
          </div>
        ) : null}
        <pre
          style={{
            margin: 0,
            padding: command || lang ? "42px 14px 14px" : "14px",
            overflowX: "auto",
            border: `1px solid ${BORDER}`,
            borderRadius: filename ? "0 0 6px 6px" : 6,
            background: SURFACE,
            color: "#eef3f4",
            fontSize: 12.5,
            lineHeight: 1.55,
          }}
        >
          {lang ? <span style={{ color: MUTED, display: "block", marginBottom: 8 }}>{lang}</span> : null}
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

function LinkButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        minHeight: 40,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 13px",
        border: `1px solid rgba(74, 222, 128, 0.34)`,
        borderRadius: 5,
        background: "rgba(31, 88, 58, 0.76)",
        color: "#dffff0",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function SignalDiagram() {
  return (
    <svg viewBox="0 0 720 190" role="img" aria-label="Potentiometer input flows through guard kernel to LED and buzzer output" style={{ width: "100%", maxWidth: 760, border: `1px solid ${BORDER}`, borderRadius: 6, background: SURFACE }}>
      <rect x="40" y="58" width="130" height="58" rx="6" fill="#14241d" stroke="#4ADE80" />
      <rect x="285" y="58" width="150" height="58" rx="6" fill="#111b29" stroke="#6AB0F5" />
      <rect x="550" y="58" width="130" height="58" rx="6" fill="#241f12" stroke="#E8A020" />
      <text x="105" y="92" textAnchor="middle" fill="#dfffea" fontSize="16">Pot</text>
      <text x="360" y="92" textAnchor="middle" fill="#e5f3ff" fontSize="16">Guard Kernel</text>
      <text x="615" y="92" textAnchor="middle" fill="#fff2a6" fontSize="16">LED/Buzzer</text>
      <path d="M170 87 H285" stroke="#8fa6a2" strokeWidth="3" markerEnd="url(#arrow)" />
      <path d="M435 87 H550" stroke="#8fa6a2" strokeWidth="3" markerEnd="url(#arrow)" />
      <path d="M286 135 H435" stroke="#E8A020" strokeWidth="2" strokeDasharray="7 7" />
      <text x="360" y="158" textAnchor="middle" fill="#E8A020" fontSize="13">clamp boundary: safe_output &lt;= limit</text>
      <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0 0 L8 3 L0 6 Z" fill="#8fa6a2" /></marker></defs>
    </svg>
  );
}

export default function EmlIntroPage() {
  return (
    <Shell>
      <header style={{ minHeight: "min(640px, calc(100vh - 70px))", display: "grid", alignContent: "center", gap: 24 }}>
        <a href="/learn/eml" style={{ color: MUTED, fontSize: 12, textDecoration: "none" }}>
          Back to /learn/eml
        </a>
        <div style={{ display: "grid", gap: 14, maxWidth: 820 }}>
          <p style={{ margin: 0, color: GREEN, fontSize: 13, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
            Monogate Electronics Lab
          </p>
          <h1 style={{ margin: 0, color: "#fff", fontSize: "clamp(42px, 8vw, 82px)", lineHeight: 0.98 }}>
            EML Intro: Your First Guard Kernel
          </h1>
          <p style={{ margin: 0, color: "#cfd8d6", fontSize: "clamp(17px, 2vw, 22px)", lineHeight: 1.45, maxWidth: 760 }}>
            You built the Reflex Lab 01 circuit. Now write the guard in EML, compile it toward C for the ESP32, and watch your own clamp event appear in the visualizer.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <LinkButton href="/electronics/esp32/reflex-guard/lab">Guard Trace Console</LinkButton>
          <LinkButton href="https://github.com/agent-maestro/monogate-electronics/blob/main/kernels/threshold_reflex_v0/kernel.eml">
            threshold_reflex_v0.eml
          </LinkButton>
        </div>
      </header>

      <Section id="circuit" kicker="Section 1" title="What just happened in your circuit">
        <P>
          The potentiometer sends <Inline>pot_raw</Inline>. Firmware maps it into <Inline>requested_output</Inline>. The guard kernel clamps it to <Inline>safe_output</Inline>. The LED and buzzer reflect the safe output, not the raw request.
        </P>
        <SignalDiagram />
        <P>
          In the visualizer, the important fields are <Inline>pot_raw</Inline>, <Inline>requested_output</Inline>, <Inline>safe_output</Inline>, and <Inline>guard_action</Inline>.
        </P>
      </Section>

      <Section id="math" kicker="Section 2" title="The guard kernel in plain math">
        <CodeBlock code={"safe(request, limit) = min(request, limit)"} lang="math" />
        <P>
          The domain is <Inline>limit &gt; 0</Inline>. The guarantee is <Inline>safe output &lt;= limit</Inline>: whatever the request, the output never goes above the limit. <Inline>min</Inline> is the same function as <Inline>if request &gt; limit then limit else request</Inline>.
        </P>
      </Section>

      <Section id="eml" kicker="Section 3" title="Writing the guard in EML">
        <P>Save this file beside the Reflex Guard lesson files.</P>
        <CodeBlock code={emlSource} lang="eml" filename="threshold_reflex_v0.eml" />
        <P>
          <Inline>requires</Inline> and <Inline>ensures</Inline> are not comments. In C, 0.16.0 turns BOTH into runtime checks: <Inline>requires</Inline> before the body and <Inline>ensures</Inline> on the result, each an <Inline>EML_CONTRACT</Inline> that <Inline>-DNDEBUG</Inline> cannot delete. In Lean, <Inline>requires</Inline> becomes a hypothesis and <Inline>ensures</Inline> becomes the theorem. Name the function <Inline>reflex_guard</Inline>, not <Inline>guard</Inline>: <Inline>guard</Inline> is taken in Lean, and 0.16.0 renames it to <Inline>guard_</Inline> so the emitted name stops matching the one you wrote.
        </P>
      </Section>

      <Section id="compile-c" kicker="Section 4" title="Compiling to C for the ESP32">
        <CodeBlock code={compileC} lang="bash" command />
        <CodeBlock code={generatedC} lang="c" filename="threshold_reflex_v0.c" />
        <CodeBlock code={inoAdapter} lang="cpp" filename="threshold_reflex_adapter.ino" />
        <P>
          <Inline>libmonogate.h</Inline> and <Inline>libmonogate.c</Inline> ship inside the <Inline>monogate-forge</Inline> package under <Inline>software/runtime/c/</Inline>; <Inline>pip show -f monogate-forge</Inline> lists where. The hand-written firmware in <Inline>kernels/threshold_reflex_v0/esp32/threshold_reflex_v0</Inline> is still the reference: this adapter has not yet been built on a board from the generated file.
        </P>
      </Section>

      <Section id="proof" kicker="Section 5" title="The proof">
        <CodeBlock code={compileLean} lang="bash" command />
        <CodeBlock code={leanOutput} lang="lean" filename="threshold_reflex_v0.lean (excerpt)" />
        <P>
          The file ends in <Inline>sorry</Inline> whether or not the proof worked: Forge emits a list of tactics to try in order, and <Inline>sorry</Inline> is the last resort. So the word tells you nothing. Ask Lean what the theorem depends on:
        </P>
        <CodeBlock code={checkAxioms} lang="bash" command />
        <CodeBlock code={axiomsOutput} lang="output" />
        <P>
          No <Inline>sorryAx</Inline> in the list: <Inline>guard_output_bounded</Inline> is proved, resting on Lean&apos;s own axioms and MachLib&apos;s axioms for the real numbers. It proves the function never returns more than <Inline>limit</Inline>. It says nothing about the ADC, the firmware, or the board.
        </P>
      </Section>

      <Section id="visualizer" kicker="Section 6" title="Watching it in the visualizer">
        <CodeBlock code={jsonFrame} lang="json" />
        <P>
          When <Inline>guard_action</Inline> becomes <Inline>clamp_to_safe_output</Inline>, the dashboard logs the event, flashes the panel, and plays the sound. The loop is now visible: EML source, generated firmware shape, ESP32 serial frame, visualizer event.
        </P>
      </Section>

      <Section id="next" kicker="Section 7" title="What is next">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {[
            "Rewrite the body as if request > limit { limit } else { request }. The theorem is just as true. Does #print axioms still say proved?",
          ].map((item) => (
            <div key={item} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, background: SURFACE_2, color: TEXT, fontSize: 14, lineHeight: 1.55 }}>
              {item}
            </div>
          ))}
        </div>

        <P>
          Try the hardware target, and read what it says. With monogate-forge
          0.16.0 this kernel does not emit Verilog:
        </P>
        <CodeBlock code={compileVerilog} lang="bash" command />
        <P>
          <Inline>min</Inline> has no module in the Verilog backend, so there
          is no latency to schedule the call against. monogate-forge 0.14.4
          accepted the same command and wrote{" "}
          <Inline>min_pipeline #(...) min_pipeline_1 (...)</Inline> into the
          file — an instantiation of a module the file never defines, which no
          simulator can elaborate and no tool can synthesize. 0.15.0 and 0.16.0
          refuse instead, and say which call they could not realize.
        </P>
        <P>
          <Inline>clamp</Inline> does have one. Write the bound as a clamp and
          the same contract emits real RTL, and{" "}
          <Inline>#print axioms</Inline> still reports{" "}
          <Inline>guard_output_bounded</Inline> with no{" "}
          <Inline>sorryAx</Inline>:
        </P>
        <CodeBlock code={verilogFix} lang="eml" />
      </Section>

      <footer style={{ marginTop: 24, border: "1px solid rgba(232,160,32,0.28)", borderRadius: 6, background: "rgba(232,160,32,0.07)", padding: 16 }}>
        <p style={{ margin: 0, color: "#fff2a6", fontSize: 13, lineHeight: 1.6 }}>
          This course shows the EML -&gt; C -&gt; ESP32 path and a checked proof. With monogate-forge 0.16.0 and MachLib, guard_output_bounded is proved. The proof covers the function, not the firmware or the hardware; those need their own evidence.
        </p>
      </footer>
    </Shell>
  );
}
