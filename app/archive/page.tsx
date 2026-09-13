import type { Metadata } from "next";
import type { ReactNode } from "react";

// Every archived route redirects here (next.config.mjs). Keep this page honest
// about what went, why, and how to get it back.

export const metadata: Metadata = {
  title: "Archived pages",
  description:
    "What was retired from monogate.dev on 2026-09-12, why it went, how to restore it from git, and where to go instead.",
};

const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  border: "#1c1f2e",
  text: "#d4d4d4",
  muted: "#7f8499",
  orange: "#e8a020",
  blue: "#6ab0f5",
};

const RESEARCH_TAG = "attic/research-stack-2026-06";
const PRODUCT_TAG = "attic/product-wave-2026-09";

const ARCHIVED = [
  {
    group: "Evidence workbenches",
    items: "the evidence browser, the bundle builder and gallery, the rescue suite, proof digestion, the IR bridge, the atlas annex, and the evidence-governed-computation case study",
    why: "read from fixtures captured in May and June 2026",
    tag: RESEARCH_TAG,
  },
  {
    group: "Research explorers",
    items: "the advantage lab, the prime residual benchmark, and the template search",
    why: "read from fixtures captured in May 2026",
    tag: RESEARCH_TAG,
  },
  {
    group: "Lean practice lanes",
    items: "the PETAL lanes with their certificates and leaderboard",
    why: "unchanged since May 2026",
    tag: RESEARCH_TAG,
  },
  {
    group: "Challenge board",
    items: "the challenge list, the per-challenge submission pages, the leaderboard, the in-browser search, and the how-to-submit guide",
    why: "the database behind it no longer resolves, so no challenge could be listed and no submission stored",
    tag: PRODUCT_TAG,
  },
  {
    group: "Explorer",
    items: "the operator explorer and the EML language page",
    why: "their tables and status labels came from fixtures captured in May and June 2026 that nothing re-derives",
    tag: PRODUCT_TAG,
  },
  {
    group: "Math Lab",
    items: "the optimizer, the cost calculator, the playground and the calculator",
    why: "hand-typed tables unchanged since April 2026; the games had already moved to 1op.io",
    tag: PRODUCT_TAG,
  },
  {
    group: "Interactive EML lesson",
    items: "the in-browser course at /learn/eml/interactive",
    why: "it showed sample outputs instead of running the compiler, and nothing linked to it",
    tag: PRODUCT_TAG,
  },
];

const INSTEAD = [
  { href: "/learn/eml", label: "Learn EML", note: "write a kernel, compile it, and ask Lean what is proved" },
  { href: "/electronics", label: "Electronics Lab", note: "the hardware courses and their simulators" },
  { href: "https://monogate.org", label: "monogate.org", note: "the research record" },
  { href: "https://machlib.org", label: "machlib.org", note: "the Lean library the lessons' theorems build on" },
];

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontSize: 18, color: C.text, margin: "34px 0 10px", fontWeight: 700 }}>{children}</h2>;
}

function P({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, margin: "0 0 12px" }}>{children}</p>;
}

const code = { color: C.orange, fontFamily: "monospace", fontSize: 13 };

export default function ArchivePage() {
  return (
    <main style={{ background: C.bg, minHeight: "100vh", maxWidth: 760, margin: "0 auto", padding: "40px 18px 80px" }}>
      <h1 style={{ fontSize: 30, color: C.orange, fontFamily: "monospace", lineHeight: 1.2, marginBottom: 14 }}>
        Archived from monogate.dev
      </h1>
      <P>
        The page you followed a link to has been retired from monogate.dev. Nothing was deleted from history, and the
        sections below say how to bring it back.
      </P>

      <H2>What went, and why</H2>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {ARCHIVED.map(({ group, items, why, tag }) => (
          <li key={group} style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 8 }}>
            <strong style={{ color: C.text }}>{group}:</strong> <span style={{ color: C.muted }}>{items}.</span>{" "}
            <span style={{ color: C.text }}>Why: {why}.</span>{" "}
            <span style={{ color: C.muted }}>
              Tag <code style={code}>{tag}</code>.
            </span>
          </li>
        ))}
      </ul>

      <H2>What the site checks instead</H2>
      <P>
        Three checks run before each deploy. They are not scheduled, so a result can change between deploys without the
        site noticing.
      </P>
      <ul style={{ margin: "0 0 12px", paddingLeft: 20 }}>
        <li style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 6 }}>
          Every eml-compile command on the site is run against the newest monogate-forge on PyPI, the compiler{" "}
          <code style={code}>pip install monogate-forge</code> gives you, in a directory holding the source its page
          shows, and must succeed or fail as the page says. A command whose source the page does not show is checked
          for argument errors only, and printed output is not compared.
        </li>
        <li style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 6 }}>
          The figures registered in <code style={code}>scripts/site_figures.json</code> must match what measures them, and
          phrases retired as false must not come back. A number that is not registered there is not checked.
        </li>
        <li style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 6 }}>
          A page that labels a Lean theorem as checked must name it in <code style={code}>scripts/lean_claims.json</code>,
          and that theorem must compile at a pinned revision with no <code style={code}>sorryAx</code> in its{" "}
          <code style={code}>#print axioms</code>.
        </li>
      </ul>

      <H2>Getting one back</H2>
      <P>
        Each group&apos;s code is in the site&apos;s repository at the git tag named beside it. For example,{" "}
        <code style={code}>git checkout {RESEARCH_TAG} -- app/evidence</code> restores the evidence browser, and{" "}
        <code style={code}>git checkout {PRODUCT_TAG} -- app/explorer lib/explorer</code> restores the Explorer. Every
        route&apos;s redirect lives in <code style={code}>next.config.mjs</code>; remove it with the restore.
      </P>
      <P>
        If you worked through the Lean practice lanes, your progress is still saved in your own browser. Nothing here
        cleared it, so it picks up again if the lanes come back.
      </P>

      <H2>Where to go instead</H2>
      <div style={{ display: "grid", gap: 8 }}>
        {INSTEAD.map(({ href, label, note }) => (
          <a
            key={href}
            href={href}
            style={{
              display: "block",
              background: C.surface,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "12px 14px",
              textDecoration: "none",
            }}
          >
            <span style={{ color: C.blue, fontWeight: 700, fontSize: 14 }}>{label}</span>
            <span style={{ color: C.muted, fontSize: 13 }}> — {note}</span>
          </a>
        ))}
      </div>
    </main>
  );
}
