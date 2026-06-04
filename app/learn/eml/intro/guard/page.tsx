import type { Metadata } from "next";
import type { ReactNode } from "react";
import CopyButton from "../CopyButton";

export const metadata: Metadata = {
  title: "EML Intro: Your First Guard Kernel",
  description:
    "Write a Reflex Guard function in EML, compile it toward ESP32 C, inspect the proof obligation, and watch the guard fire in the Monogate Electronics visualizer.",
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

const emlSource = `module threshold_reflex;

fn guard(request: Real, limit: Real) -> Real
    requires (limit > 0.0)
    ensures (return <= limit)
{
    let clamped = request - (request - limit);
    if request > limit { limit } else { request }
}`;

const compileC = `eml-compile threshold_reflex_v0.eml --target c --profile esp32`;
const compileLean = `eml-compile threshold_reflex_v0.eml --target lean`;
const compileVerilog = `eml-compile threshold_reflex_v0.eml --target verilog`;

const generatedC = `#include <assert.h>

double threshold_reflex_guard(double request, double limit) {
    assert(limit > 0.0);
    if (request > limit) {
        return limit;
    }
    return request;
}`;

const inoAdapter = `#include "threshold_reflex_v0.h"

void loop() {
    int raw = analogRead(34);
    double pot_raw = raw / 4095.0;
    double requested_output = pot_raw;
    double safe_output = threshold_reflex_guard(requested_output, 0.85);
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

const leanOutput = `def guard (request limit : Real) : Real :=
  if request > limit then limit else request

theorem guard_output_bounded
    (request limit : Real)
    (h_limit : limit > 0.0) :
    guard request limit <= limit := by
  unfold guard
  by_cases h : request > limit
  . simp [h]
  . simp [h]
    exact le_of_not_gt h`;

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
          <LinkButton href="/explorer/eml-packets/builder">Evidence Packet Builder</LinkButton>
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
        <CodeBlock code={"safe(request, limit) = if request > limit then limit else request"} lang="math" />
        <P>
          The domain is <Inline>limit &gt; 0</Inline>. The guarantee is <Inline>safe output &lt;= limit</Inline>. The proof obligation is the exact thing a reviewer would ask: show that the clamped path never returns a value above the limit.
        </P>
      </Section>

      <Section id="eml" kicker="Section 3" title="Writing the guard in EML">
        <P>Save this file beside the Reflex Guard lesson files.</P>
        <CodeBlock code={emlSource} lang="eml" filename="threshold_reflex_v0.eml" />
        <P>
          <Inline>requires</Inline> and <Inline>ensures</Inline> are not comments. They become obligations that MachLib/Lean can close later.
        </P>
      </Section>

      <Section id="compile-c" kicker="Section 4" title="Compiling to C for the ESP32">
        <CodeBlock code={compileC} lang="bash" command />
        <CodeBlock code={generatedC} lang="c" filename="threshold_reflex_v0.c" />
        <CodeBlock code={inoAdapter} lang="cpp" filename="threshold_reflex_adapter.ino" />
        <P>
          The current hand-written firmware reference remains in <Inline>kernels/threshold_reflex_v0/esp32/threshold_reflex_v0</Inline>. Generated C should match the same guard boundary and serial fields.
        </P>
      </Section>

      <Section id="proof" kicker="Section 5" title="The proof obligation">
        <CodeBlock code={compileLean} lang="bash" command />
        <CodeBlock code={leanOutput} lang="lean" filename="threshold_reflex_v0.lean" />
        <P>
          If your generated Lean contains <Inline>sorry</Inline>, that means the proof is still open. The important win is that the compiler named the exact property to prove.
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
            "Add a minimum threshold and inspect the new proof obligations.",
            `Run ${compileVerilog} and compare the hardware-shaped logic.`,
            "Paste the guard expression into the Evidence Packet Builder."
          ].map((item) => (
            <div key={item} style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: 14, background: SURFACE_2, color: TEXT, fontSize: 14, lineHeight: 1.55 }}>
              {item}
            </div>
          ))}
        </div>
      </Section>

      <footer style={{ marginTop: 24, border: "1px solid rgba(232,160,32,0.28)", borderRadius: 6, background: "rgba(232,160,32,0.07)", padding: 16 }}>
        <p style={{ margin: 0, color: "#fff2a6", fontSize: 13, lineHeight: 1.6 }}>
          This course shows the EML -&gt; C -&gt; ESP32 path and the proof obligation shape. The generated Lean proof uses sorry placeholders. Discharging those placeholders requires MachLib and is covered in the advanced course. No claim is made that the guard is formally verified until the proof is closed.
        </p>
      </footer>
    </Shell>
  );
}
