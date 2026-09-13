import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reproduce",
  description:
    "Install the compiler readers get, run the commands monogate.dev checks before each deploy, and see which checks run on private repositories.",
};

// Until 2026-09-12 this page was "Documentation" for the npm and PyPI
// `monogate` packages. Both quickstarts failed against the published releases
// (npm monogate 1.3.1 exports no eml, evalTree or countNodes; PyPI monogate
// 2.5.0 raises ImportError for `eml`), and its Evidence SDK commands named
// monogate_evidence, a module that ships only in a private repository.
//
// Every compile command here is run before each deploy by
// scripts/check_site_commands.mjs, against the newest monogate-forge on PyPI,
// in an empty directory holding the source this page shows. Keep the source
// and the commands in separate literals: the extractor reads a literal whose
// first line is `module NAME;` as NAME.eml, and each line that starts with the
// compiler's name as a command.

const C = {
  bg: "#08090e", surface: "#0d0f18", border: "#1c1f2e",
  text: "#d4d4d4", muted: "#7f8499", orange: "#e8a020",
  blue: "#6ab0f5", green: "#4ade80",
};

const INSTALL = `python3 -m venv .venv
. .venv/bin/activate
pip install monogate-forge
eml-compile --version`;

const SOURCE = `module clamp_demo;

@verify(lean, theorem = "clamp_demo_bounded")
@target(fpga, clock_mhz = 100)
fn clamp_demo(request: Real, limit: Real) -> Real
    requires (limit > 0.0)
    ensures (result <= limit)
{
    min(request, limit)
}`;

const COMPILE = `eml-compile clamp_demo.eml --profile-only
eml-compile clamp_demo.eml --target python -o clamp_demo.py
eml-compile clamp_demo.eml --target c -o clamp_demo.c
eml-compile clamp_demo.eml --target verilog -o clamp_demo.v
eml-compile clamp_demo.eml --target lean -o clamp_demo.lean
eml-compile clamp_demo.eml --allocate`;

function Code({ label, children }: { label?: string; children: string }) {
  return (
    <div style={{ margin: "12px 0" }}>
      {label ? (
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
      ) : null}
      <pre style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", fontSize: 12, color: C.green, overflowX: "auto", margin: 0 }}>
        {children}
      </pre>
    </div>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 17, color: C.text, margin: "36px 0 10px", fontWeight: 700 }}>{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, margin: "0 0 12px" }}>{children}</p>;
}

function Li({ children }: { children: ReactNode }) {
  return <li style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 10 }}>{children}</li>;
}

const mono = { color: C.orange, fontFamily: "monospace", fontSize: 13 };

export default function ReproducePage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", maxWidth: 720, margin: "0 auto", padding: "0 16px 80px" }}>

      <h1 style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 8 }}>Reproduce</h1>
      <P>
        What on monogate.dev you can re-run yourself, with the commands to do it, and what you cannot, because it runs
        on a private repository.
      </P>

      <H2>1 · Install the compiler you get</H2>
      <Code label="bash">{INSTALL}</Code>
      <P>
        That installs the newest monogate-forge release on PyPI. Before each deploy the site installs the same release
        and runs every compile command it shows against it, so the lessons are checked against what you have, not
        against unreleased source.
      </P>

      <H2>2 · Compile a kernel</H2>
      <P>
        Save this as <code style={mono}>clamp_demo.eml</code>. Its contract says the result never exceeds{" "}
        <code style={mono}>limit</code>. The Lean target needs <code style={mono}>@verify(lean)</code>; the Verilog
        target needs <code style={mono}>@target(fpga)</code>.
      </P>
      <Code label="clamp_demo.eml">{SOURCE}</Code>
      <Code label="bash">{COMPILE}</Code>
      <P>
        Each command writes one file, or prints a profile or a resource plan. The site&apos;s command check runs all six
        in an empty directory holding only the source above and requires each to exit 0. It does not compare what they
        print.
      </P>

      <H2>3 · Ask Lean about the theorem</H2>
      <P>
        <code style={mono}>clamp_demo.lean</code> states the theorem <code style={mono}>clamp_demo_bounded</code>.
        Whether Lean accepts its proof is a separate step: it needs MachLib, the Lean library the theorem is stated
        against, and <code style={mono}>#print axioms</code>.{" "}
        <Link href="/learn/eml/intro" style={{ color: C.blue }}>Level 1, Lesson 4</Link> shows the commands and how to
        read the answer.
      </P>

      <H2>4 · The checks behind this site</H2>
      <P>
        Three checks run before each deploy, from scripts in the public monogate-dev repository. They are not
        scheduled, so a result can change between deploys without the site noticing.
      </P>
      <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
        <Li>
          <strong>Commands</strong> (<code style={mono}>scripts/check_site_commands.mjs</code>): every compile command
          on the site, run against the newest monogate-forge on PyPI beside the source its page shows. A command whose
          source the page does not show is checked for argument errors only. Only the exit status counts; printed
          output is not compared.
        </Li>
        <Li>
          <strong>Figures</strong> (<code style={mono}>scripts/check_site_figures.mjs</code> with{" "}
          <code style={mono}>scripts/site_figures.json</code>): each registered number against what measures it
          (machlib&apos;s README count, the lesson counts, the SuperBEST totals in the monogate library), and phrases
          retired as false. A number that is not registered is not checked.
        </Li>
        <Li>
          <strong>Lean claims</strong> (monogate-lean&apos;s <code style={mono}>tools/lean_claims/check_claims.py</code>{" "}
          with <code style={mono}>scripts/lean_claims.json</code>): every registered theorem must be declared at its
          pinned machlib revision, compile, and have no <code style={mono}>sorryAx</code> in its{" "}
          <code style={mono}>#print axioms</code>. That covers the cost-theory table on /superbest and the
          forward-error theorems the Electronics Lab cites. machlib and monogate-lean are public, so this check needs
          nothing private.
        </Li>
      </ul>

      <H2>5 · What runs on private repositories</H2>
      <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
        <Li>
          <strong>The compiler&apos;s source.</strong> monogate-forge reaches you as a built package on PyPI. Its
          repository, test suite and release process are private. Nothing on this site is checked against them, only
          against the published package.
        </Li>
        <Li>
          <strong>Hardware evidence.</strong> The Electronics Lab&apos;s board captures and evidence packets are in the
          private monogate-electronics repository. This site ships the built lab and its{" "}
          <code style={mono}>SOURCE.json</code> summary, and no check here re-reads a capture. The Lean theorems its
          certificates cite are in machlib, and the Lean-claims check compiles those.
        </Li>
        <Li>
          <strong>Generated Verilog.</strong> The gate that committed Verilog is exactly what a pinned compiler
          revision emits runs in the private monogate-research repository, on a self-hosted runner. Its verdicts are
          not published here.
        </Li>
      </ul>

      <H2>Links</H2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { href: "https://pypi.org/project/monogate-forge/", label: "PyPI — monogate-forge, the compiler" },
          { href: "https://github.com/agent-maestro/machlib", label: "machlib — the Lean library (public)" },
          { href: "https://github.com/agent-maestro/monogate-lean", label: "monogate-lean — home of the Lean-claims checker (public)" },
          { href: "https://arxiv.org/abs/2603.21852", label: "arXiv:2603.21852 — Odrzywołek 2026" },
          { href: "https://monogate.org", label: "monogate.org — the research record" },
        ].map(({ href, label }) => (
          <a key={href} href={href} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: C.blue, textDecoration: "none" }}>
            → {label}
          </a>
        ))}
      </div>

      <footer style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, marginTop: 48, fontSize: 10, color: C.muted }}>
        <Link href="/" style={{ color: C.muted }}>← monogate.dev</Link>
      </footer>
    </div>
  );
}
