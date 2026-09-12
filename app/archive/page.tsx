import type { Metadata } from "next";
import type { ReactNode } from "react";

// Every archived route redirects here (next.config.mjs). Keep this page honest
// about what went, why, and how to get it back.

export const metadata: Metadata = {
  title: "Archived research workbenches",
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

const ARCHIVED = [
  {
    group: "Evidence workbenches",
    items: "the evidence browser, the bundle builder and gallery, the rescue suite, proof digestion, the IR bridge, the atlas annex, and the evidence-governed-computation case study",
  },
  {
    group: "Research explorers",
    items: "the advantage lab, the prime residual benchmark, and the template search",
  },
  {
    group: "Lean practice lanes",
    items: "the PETAL lanes with their certificates and leaderboard",
  },
];

const INSTEAD = [
  { href: "/learn/eml", label: "Learn EML", note: "write a kernel, compile it, and check its proof" },
  { href: "/electronics", label: "Electronics Lab", note: "kernels on ESP32 trainer boards and FPGA bitstreams" },
  { href: "/explorer", label: "Explorer", note: "the language and its operators" },
  { href: "https://monogate.org", label: "monogate.org", note: "the research record" },
  { href: "https://machlib.org", label: "machlib.org", note: "the Lean library the proofs rest on" },
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
        Research workbenches, archived
      </h1>
      <P>
        The page you followed a link to has been retired from monogate.dev. Nothing was deleted from history, and the
        sections below say how to bring it back.
      </P>

      <H2>What went</H2>
      <ul style={{ margin: 0, paddingLeft: 20 }}>
        {ARCHIVED.map(({ group, items }) => (
          <li key={group} style={{ fontSize: 14, color: C.text, lineHeight: 1.75, marginBottom: 6 }}>
            <strong style={{ color: C.text }}>{group}:</strong> <span style={{ color: C.muted }}>{items}.</span>
          </li>
        ))}
      </ul>

      <H2>Why</H2>
      <P>
        Each was last changed between April and June 2026 and read from fixtures captured then, not from anything the
        project measures today. The site now concentrates on what the compiler actually does, and checks every command
        and figure it shows before each deploy.
      </P>

      <H2>Getting one back</H2>
      <P>
        The code is in the site&apos;s repository at the git tag <code style={code}>attic/research-stack-2026-06</code>.
        For example, <code style={code}>git checkout attic/research-stack-2026-06 -- app/evidence</code> restores the
        evidence browser; the other routes come back the same way, and their redirects live in{" "}
        <code style={code}>next.config.mjs</code>.
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
