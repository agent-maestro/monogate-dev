import type { Metadata } from "next";
import { PAGE_ROUTES } from "../../sitemap-pages";

const ACCENT_GOLD = "#E8A020";
const ACCENT_GREEN = "#4ADE80";
const ACCENT_BLUE = "#6AB0F5";
const ACCENT_PURPLE = "#A78BFA";
const SURFACE = "#0d0f18";
const SURFACE_2 = "#0a0b12";
const BORDER = "#1c1f2e";
const TEXT = "#d4d4d4";
const MUTED = "#6a6e85";

type Level = {
  number: string;
  title: string;
  href: string;
  time: string;
  prereq: string | null;
  blurb: string;
  accent: string;
};

const LEVELS: Level[] = [
  {
    number: "00",
    title: "Play EML",
    href: "/learn/eml/play",
    time: "10 min - 5 puzzles",
    prereq: null,
    blurb:
      "Learn the language by solving tiny control puzzles: clamp a signal, "
      + "cross a threshold, smooth an output, satisfy a guard, and turn the "
      + "solution into a starter electronics kernel.",
    accent: ACCENT_GREEN,
  },
  {
    number: "01",
    title: "EML in 30 Minutes",
    href: "/learn/eml/intro",
    time: "30 min · 6 lessons",
    prereq: null,
    blurb:
      "Write your first equation, emit Python/C-style outputs, inspect Lean "
      + "theorem scaffolds and hardware-target profiles, and read the "
      + "chain-order profile. No prerequisites beyond high-school algebra.",
    accent: ACCENT_GOLD,
  },
  {
    number: "02",
    title: "Engineering with EML",
    href: "/learn/eml/engineering",
    time: "60 min · 6 lessons",
    prereq: "Level 1",
    blurb:
      "Multi-module systems, the chain-order cost model, contracts on "
      + "composed functions, hardware budgets, multi-target CI workflows, "
      + "and the standard library. The lessons that turn a Level 1 user into "
      + "an EML engineer.",
    accent: ACCENT_GOLD,
  },
];

type Track = {
  slug: string;
  label: string;
  blurb: string;
};

const TRACKS: Track[] = [
  {
    slug: "aerospace",
    label: "Aerospace",
    blurb: "Flight controllers, autopilots, IMUs, INS alignment.",
  },
  {
    slug: "gaming",
    label: "Gaming",
    blurb: "Physics, animation, shaders (HLSL/GLSL/WGSL/Metal), audio.",
  },
  {
    slug: "robotics",
    label: "Robotics",
    blurb: "Kinematics, motion planning, control, sensor fusion.",
  },
  {
    slug: "audio",
    label: "Audio DSP",
    blurb: "Synthesizers, filters, reverbs, real-time effects.",
  },
  {
    slug: "medical",
    label: "Medical Devices",
    blurb: "Defibrillator energy, infusion pumps, patient monitors.",
  },
  {
    slug: "defi",
    label: "DeFi",
    blurb: "AMMs, oracles, risk models. Solidity-first.",
  },
];

const FORGE: Level = {
  number: "04",
  title: "Forge Internals",
  href: "/learn/eml/forge",
  time: "deep dive",
  prereq: "Level 2 + one Level 3 track",
  blurb:
    "Topics: the parser, the Pfaffian profiler, the optimizer passes "
    + "(inlining, CSE, SuperBEST routing, import shaking), the target "
    + "registry, the FPGA allocator, and the Lean backend.",
  accent: ACCENT_PURPLE,
};

const trackHref = (track: Track): string => `/learn/eml/${track.slug}`;

// Everything this page says about which levels and tracks exist is built from
// the same PAGE_ROUTES test as the pills (isPublished, below), so the prose and
// the pills cannot disagree. Until 2026-09-13 the metadata, the tracks
// paragraph and "Where to start" described all six tracks and Level 04 in the
// present tense while none of them had a page.
const PUBLISHED_LEVELS = LEVELS.filter((level) => isPublished(level.href));
const PUBLISHED_TRACKS = TRACKS.filter((track) => isPublished(trackHref(track)));
const FORGE_PUBLISHED = isPublished(FORGE.href);

function curriculumDescription(): string {
  const parts = PUBLISHED_LEVELS.map((level) => `Level ${Number(level.number)}, ${level.title}`);
  if (PUBLISHED_TRACKS.length > 0) {
    parts.push(`domain tracks for ${PUBLISHED_TRACKS.map((track) => track.label).join(", ")}`);
  }
  if (FORGE_PUBLISHED) parts.push(`Level ${Number(FORGE.number)}, ${FORGE.title}`);
  return `The EML curriculum on monogate.dev: ${parts.join("; ")}. Self-paced, written for engineers.`;
}

function tracksSummary(): string {
  const total = TRACKS.length;
  const n = PUBLISHED_TRACKS.length;
  if (n === 0) {
    return `None of these ${total} domain tracks has a page on this site. Each card names an industry vertical and the kind of kernel a track for it would cover.`;
  }
  const labels = PUBLISHED_TRACKS.map((track) => track.label).join(", ");
  return `${n} of ${total} domain tracks ${n === 1 ? "has" : "have"} a page on this site: ${labels}.`;
}

export const metadata: Metadata = {
  title: "Learn EML — monogate.dev/learn/eml",
  description: curriculumDescription(),
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: ACCENT_GOLD,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

// A pill says only whether this site has a page at the card's URL. PAGE_ROUTES
// is app/sitemap-pages.ts, which check_sitemap_pages.mjs derives from the app/
// tree and fails check:site on when it drifts, so no pill can call a route
// with no page published. Until 2026-09-13 each status was a typed field that
// no check read, and the green pill on every level with a page claimed more
// than that.
function isPublished(href: string): boolean {
  return PAGE_ROUTES.includes(href);
}

function StatusPill({ published }: { published: boolean }) {
  return (
    <span
      style={{
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 8px",
        borderRadius: 3,
        color: published ? ACCENT_GREEN : MUTED,
        background: published ? "rgba(74, 222, 128, 0.08)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${published ? "rgba(74, 222, 128, 0.25)" : BORDER}`,
      }}
    >
      {published ? "published" : "not published"}
    </span>
  );
}

function LevelCard({ level }: { level: Level }) {
  const published = isPublished(level.href);
  const content = (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 13,
              color: level.accent,
              letterSpacing: "0.08em",
            }}
          >
            {level.number}
          </span>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            {level.title}
          </h2>
        </div>
        <StatusPill published={published} />
      </div>
      {published ? (
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 12,
            color: MUTED,
            marginBottom: 12,
          }}
        >
          {level.time}
          {level.prereq ? <> &nbsp;·&nbsp; prereq: {level.prereq}</> : null}
        </div>
      ) : null}
      <p
        style={{
          fontSize: 14.5,
          lineHeight: 1.65,
          color: TEXT,
          margin: 0,
        }}
      >
        {level.blurb}
      </p>
    </>
  );

  if (published) {
    return (
      <a
        href={level.href}
        style={{
          display: "block",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          padding: "24px 26px",
          textDecoration: "none",
          color: "inherit",
          transition: "border-color 0.15s ease, transform 0.15s ease",
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <div
      style={{
        background: SURFACE_2,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: "24px 26px",
        opacity: 0.78,
      }}
    >
      {content}
    </div>
  );
}

function TrackTile({ track }: { track: Track }) {
  const href = trackHref(track);
  const published = isPublished(href);
  const inner = (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 600,
            color: "#fff",
          }}
        >
          {track.label}
          {published ? " →" : ""}
        </div>
        <StatusPill published={published} />
      </div>
      <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55 }}>
        {track.blurb}
      </div>
    </>
  );
  if (published) {
    return (
      <a
        href={href}
        style={{
          display: "block",
          padding: "16px 18px",
          background: SURFACE_2,
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        {inner}
      </a>
    );
  }
  return (
    <div
      style={{
        padding: "16px 18px",
        background: SURFACE_2,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        opacity: 0.7,
      }}
    >
      {inner}
    </div>
  );
}

export default function LearnEMLHub() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08090e",
        color: TEXT,
        fontFamily:
          "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: "48px 24px 80px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            fontSize: 11,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            color: "#666",
            marginBottom: 14,
          }}
        >
          <a href="/learn" style={{ color: "#888", textDecoration: "none" }}>
            ← /learn
          </a>
        </div>

        <Eyebrow>The EML curriculum</Eyebrow>
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 2.8rem)",
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 14px",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Learn EML
        </h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.65,
            color: "#bbb",
            margin: "0 0 12px",
            maxWidth: 660,
          }}
        >
          A playable ladder into mathematical programming. Start with tiny
          control puzzles, continue into Level 1 with no prerequisites, and
          finish Level 2 ready to reason about multi-module systems and their
          hardware budgets. The electronics path turns EML into starter kernels for
          sensors, guards, outputs, traces, and evidence packets.
        </p>
        <p
          style={{
            fontSize: 13.5,
            color: MUTED,
            margin: "0 0 40px",
          }}
        >
          Self-paced. Written for engineers. Before each deploy, every command
          in Levels 1 and 2 that calls the compiler is run against the release{" "}
          <code
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              color: ACCENT_GOLD,
            }}
          >
            pip install monogate-forge
          </code>{" "}
          gives you, beside the source its page shows. A command whose source
          the page does not show is checked for argument errors only, and the
          Level 0 puzzles are not compiled by that check.
        </p>

        {/* Levels 1 & 2 */}
        <section
          style={{
            display: "grid",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {LEVELS.map((l) => (
            <LevelCard key={l.number} level={l} />
          ))}
        </section>

        {/* Level 3: Tracks */}
        <section style={{ marginBottom: 48 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 13,
                  color: ACCENT_BLUE,
                  letterSpacing: "0.08em",
                }}
              >
                03
              </span>
              <h2
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Domain Tracks
              </h2>
            </div>
            <span
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                color: MUTED,
              }}
            >
              prereq: Level 2
              {PUBLISHED_TRACKS.length > 0 ? <> &nbsp;·&nbsp; pick any</> : null}
            </span>
          </div>
          <p
            style={{
              fontSize: 14.5,
              color: TEXT,
              lineHeight: 1.65,
              marginBottom: 20,
            }}
          >
            {tracksSummary()} The compiler itself is free —{" "}
            <a
              href="https://monogateforge.com/get-started"
              style={{ color: ACCENT_GOLD, textDecoration: "underline" }}
            >
              install Forge
            </a>{" "}
            and every target is available with no license.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {TRACKS.map((t) => (
              <TrackTile key={t.slug} track={t} />
            ))}
          </div>
        </section>

        {/* Level 4: Forge */}
        <section style={{ marginBottom: 56 }}>
          <LevelCard level={FORGE} />
        </section>

        {/* What this is for */}
        <section
          style={{
            paddingTop: 32,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Eyebrow>How to use this</Eyebrow>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
              fontWeight: 700,
              color: "#fff",
              marginTop: 8,
              marginBottom: 14,
            }}
          >
            Where to start
          </h2>
          <ul
            style={{
              color: TEXT,
              fontSize: 14.5,
              lineHeight: 1.85,
              paddingLeft: 22,
              margin: 0,
            }}
          >
            <li>
              <strong style={{ color: "#fff" }}>Never seen EML before?</strong>{" "}
              Start by playing{" "}
              <a href="/learn/eml/play" style={{ color: ACCENT_GOLD }}>
                Level 0
              </a>
              , then move to{" "}
              <a href="/learn/eml/intro" style={{ color: ACCENT_GOLD }}>
                Level 1
              </a>
              .
            </li>
            <li>
              <strong style={{ color: "#fff" }}>Already know the basics?</strong>{" "}
              Jump to{" "}
              <a href="/learn/eml/engineering" style={{ color: ACCENT_GOLD }}>
                Level 2
              </a>{" "}
              for module composition, contracts, and CI.
            </li>
            <li>
              <strong style={{ color: "#fff" }}>
                Want to build hardware?
              </strong>{" "}
              Finish Level 0, then jump to{" "}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- /electronics is a route handler serving the Vite electronics app, not a Next page: it needs a full page load */}
              <a href="/electronics" style={{ color: ACCENT_GOLD }}>
                Monogate Electronics
              </a>{" "}
              to turn EML-style kernels into LED, sensor, display, and matrix
              projects.
            </li>
            {PUBLISHED_TRACKS.length > 0 ? (
              <li>
                <strong style={{ color: "#fff" }}>
                  Looking for your domain?
                </strong>{" "}
                Pick a Level 3 track:{" "}
                {PUBLISHED_TRACKS.map((track) => track.label).join(", ")}.
              </li>
            ) : null}
            {FORGE_PUBLISHED ? (
              <li>
                <strong style={{ color: "#fff" }}>
                  Want to extend the compiler?
                </strong>{" "}
                <a href={FORGE.href} style={{ color: ACCENT_GOLD }}>
                  Level {Number(FORGE.number)}
                </a>{" "}
                covers the Forge internals.
              </li>
            ) : null}
          </ul>
        </section>

        {/* Footer */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 24,
            borderTop: `1px solid ${BORDER}`,
            fontSize: 12,
            color: MUTED,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          Monogate Research &nbsp;·&nbsp;{" "}
          <a href="https://monogate.org" style={{ color: MUTED }}>
            monogate.org
          </a>{" "}
          &nbsp;·&nbsp;{" "}
          <a href="https://1op.io" style={{ color: MUTED }}>
            1op.io
          </a>{" "}
        </div>
      </div>
    </main>
  );
}
