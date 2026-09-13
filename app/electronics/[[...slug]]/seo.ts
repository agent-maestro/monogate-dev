/**
 * Server-rendered SEO + no-JS fallback for the electronics-lab SPA.
 *
 * Why this exists: /electronics is a Vite-built client-side React app. The
 * shell we serve is ~900 bytes whose entire body is `<div id="root"></div>` —
 * every heading, card, and link is painted by JS after load. Anything that
 * reads the URL without executing JS (crawlers, Slack/LinkedIn/X unfurlers,
 * LLM agents fetching the page) sees a blank document and correctly reports
 * "there is no content here". /electronics and three subroutes are listed in
 * app/sitemap.ts at priority 0.7–0.9, so we were actively pointing indexers at
 * empty shells.
 *
 * The route is a Route Handler, not a page, so Next's `metadata` export does
 * not apply — the tags have to be injected into the HTML string by hand.
 *
 * Copy below is transcribed from the live rendered DOM (headless Chromium,
 * 2026-07-25), not written fresh, so the no-JS text matches what a JS visitor
 * actually reads. Descriptions deliberately avoid hardware claims. The one
 * hardware statement in the no-JS view, the landing page's boundary line, is
 * built by boundaryText() from SOURCE.json, which route.ts imports at build
 * time; monogate-electronics derives that file's hardware_evidence block from
 * its evidence packets. Until 2026-09-12 the line was typed here, with hardware
 * observation and serial capture both stated as false, while SOURCE.json
 * recorded board captures on the FPGA track. Keep it read from the file.
 */

const SITE = "https://monogate.dev";
const OG_IMAGE = "/og-image.jpg";

export interface RouteSeo {
  readonly title: string;
  readonly description: string;
}

/** One track of SOURCE.json's hardware_evidence block. */
export interface LabTrack {
  readonly label: string;
  readonly hardware_observed: boolean;
  readonly live_capture_packets: number;
  readonly total_captured_frames: number;
  readonly devices: readonly string[];
  readonly first_capture: string | null;
  readonly latest_capture: string | null;
}

/** The part of public/electronics-lab/SOURCE.json the no-JS boundary is read from. */
export interface LabSource {
  readonly boundary_flags: { readonly simulated: boolean };
  readonly hardware_evidence: {
    readonly generated_at: string;
    readonly tracks: Readonly<Record<string, LabTrack>>;
  };
}

/**
 * Keys are normalized paths (lowercased, trailing slash stripped) — matching
 * how the SPA's own viewFromLocation() lowercases before matching, so the
 * mixed-case /electronics/other/OptimizationBoundary resolves.
 *
 * This covers the landing page, the four track hubs, and the pages the
 * sitemap lists (app/sitemap.ts lists exactly these keys). The SPA has ~60
 * routes; the rest fall through to DEFAULT_SEO rather than being enumerated
 * here, because a stale hand-maintained mirror of a route table in another
 * repo is worse than an honest generic description.
 */
export const ROUTE_SEO: Readonly<Record<string, RouteSeo>> = {
  "/electronics": {
    title: "Monogate Electronics Lab — choose your hardware path",
    description:
      "Four hands-on hardware paths. ESP32 and FPGA turn an input into a " +
      "guarded decision and a replayable trace; Robotics and the Playground, " +
      "for the joy of building.",
  },
  "/electronics/esp32": {
    title: "ESP32 / Arduino courses — Monogate Electronics Lab",
    description:
      "Breadboard labs for learning guarded control loops with pots, LEDs, " +
      "buzzers, and serial traces. Every course has a simulator path and an " +
      "evidence boundary.",
  },
  "/electronics/artya7/courses": {
    title: "FPGA / Arty A7 courses — Monogate Electronics Lab",
    description:
      "The FPGA track runs the same guarded-loop pattern as the ESP32 " +
      "courses, on programmable logic: switch input, guard clamp, LED " +
      "output, UART-style evidence.",
  },
  "/electronics/robotics/courses": {
    title: "Robotics courses — Monogate Electronics Lab",
    description:
      "Motion and control, from a single servo to closed-loop systems — " +
      "hands-on robotics lessons with no thesis attached, each following the " +
      "same nine beats.",
  },
  "/electronics/other": {
    title: "Other / Playground — Monogate Electronics Lab",
    description:
      "Software labs where the controls feel tactile and the claims stay " +
      "bounded, plus standalone creative projects built outside the main " +
      "ESP32 and FPGA tracks.",
  },
  "/electronics/glossary": {
    title: "Electronics Glossary — Monogate Electronics Lab",
    description:
      "A living reference for Monogate Electronics terms across circuits, " +
      "components, tools, kernels, traces, and evidence.",
  },
  "/electronics/foundations": {
    title: "Foundations — the math and proofs under every guard",
    description:
      "The one track with homework. Climb from where an EE degree leaves off " +
      "— Calc II, fixed-point, a signal on a scope — up to machine-checked " +
      "certificates.",
  },
  "/electronics/reflexcourse": {
    title: "ESP32-001 Reflex Guard — Monogate Electronics Lab",
    description:
      "Build a pot-controlled LED with a safety clamp — your first complete " +
      "input to decision to output loop. About 45 minutes, beginner, " +
      "starting in the simulator.",
  },
  "/electronics/other/optimizationboundary": {
    title: "Optimization Boundary — Monogate Electronics Lab",
    description:
      "Explore the boundary-concentration idea in software now, then treat " +
      "the physical Trainer Board proxy as a planned path until a reviewed " +
      "hardware runbook exists.",
  },
};

const DEFAULT_SEO: RouteSeo = {
  title: "Monogate Electronics Lab",
  description:
    "Hands-on hardware courses from Monogate: guarded control loops on " +
    "ESP32, FPGA, and robotics, each with a simulator path and a stated " +
    "evidence boundary.",
};

/** Links crawlers can follow out of any no-JS page, so the lab isn't a dead end. */
const NAV_LINKS: ReadonlyArray<readonly [string, string]> = [
  ["/electronics", "Electronics Lab home"],
  ["/electronics/esp32", "ESP32 / Arduino courses"],
  ["/electronics/artya7/courses", "FPGA / Arty A7 courses"],
  ["/electronics/robotics/courses", "Robotics courses"],
  ["/electronics/other", "Other / Playground"],
  ["/electronics/foundations", "Foundations"],
  ["/electronics/glossary", "Glossary"],
];

/** The four-step method the landing page leads with. */
const METHOD_STEPS: ReadonlyArray<readonly [string, string]> = [
  ["Simulate", "Run the kernel against a known trace before touching hardware."],
  ["Build", "Wire the smallest circuit that can show the decision safely."],
  ["Capture", "Record serial frames, graph behavior, photos, and session logs."],
  ["Constrain", "State what the evidence proves, and what it does not claim."],
];

export function normalizePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "").toLowerCase();
  return trimmed || "/electronics";
}

export function seoForPath(pathname: string): RouteSeo {
  return ROUTE_SEO[normalizePath(pathname)] ?? DEFAULT_SEO;
}

/** The landing page's boundary sentence, read from SOURCE.json rather than typed. */
export function boundaryText(source: LabSource): string {
  const tracks = Object.values(source.hardware_evidence.tracks);
  const observed = tracks.filter((t) => t.hardware_observed);
  const unobserved = tracks.filter((t) => !t.hardware_observed).map((t) => t.label);
  const sentences: string[] = [];
  if (source.boundary_flags.simulated) sentences.push("The courseware runs as a simulation.");
  for (const t of observed) {
    sentences.push(
      `Hardware observed on ${t.label}: ${t.live_capture_packets} capture packets, ` +
        `${t.total_captured_frames} frames, ${t.devices.join(", ")}, ${t.first_capture} to ${t.latest_capture}.`
    );
  }
  if (observed.length === 0) sentences.push("No track has a hardware capture recorded.");
  if (observed.length > 0 && unobserved.length > 0) {
    sentences.push(`No hardware capture recorded for ${unobserved.join(" or ")}.`);
  }
  sentences.push(`(SOURCE.json evidence summary, ${source.hardware_evidence.generated_at.slice(0, 10)}.)`);
  return `Boundary: ${sentences.join(" ")}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderHeadTags(seo: RouteSeo, canonical: string): string {
  const title = escapeHtml(seo.title);
  const description = escapeHtml(seo.description);
  const url = escapeHtml(canonical);
  const image = escapeHtml(`${SITE}${OG_IMAGE}`);

  return [
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="monogate.dev" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ].join("\n    ");
}

function renderNoscript(seo: RouteSeo, normalized: string, labSource: LabSource): string {
  const isLanding = normalized === "/electronics";

  const links = NAV_LINKS
    .filter(([href]) => href !== normalized)
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("\n        ");

  const method = isLanding
    ? `<h2>How every course works</h2>
      <ol>
        ${METHOD_STEPS.map(
          ([name, detail]) =>
            `<li><strong>${escapeHtml(name)}</strong> — ${escapeHtml(detail)}</li>`
        ).join("\n        ")}
      </ol>`
    : "";

  // The lab states its own boundary in-page; the no-JS view must not quietly
  // drop that caveat, and must not state it from memory either.
  const boundary = isLanding
    ? `<p><em>${escapeHtml(boundaryText(labSource))}</em></p>`
    : "";

  return `<noscript>
      <h1>${escapeHtml(seo.title)}</h1>
      <p>${escapeHtml(seo.description)}</p>
      ${method}
      <h2>Explore the lab</h2>
      <ul>
        ${links}
      </ul>
      ${boundary}
      <p>This lab is an interactive application and needs JavaScript enabled for
      the simulators, circuit diagrams, and trace replay.</p>
    </noscript>`;
}

/**
 * Returns a new shell with a per-route <title>, meta/OG tags in <head>, and a
 * no-JS summary before </body>. `labSource` is the parsed SOURCE.json shipped
 * beside the shell; route.ts imports it at build time.
 *
 * The shell ships one hardcoded `<title>MGElectronics Lab</title>` for all ~60
 * SPA routes, so it is rewritten here too — otherwise every deep link shares a
 * title and reads as duplicate content.
 *
 * Fails open: if a marker is absent (the shell is synced in from
 * monogate-electronics by scripts/sync_electronics_lab_public.py, so its
 * markup is not ours to guarantee) that section is skipped and a working SPA
 * is still served. Degraded SEO beats a 500. Marker drift is caught at build
 * time by scripts/check_electronics_seo.mjs.
 */
export function injectSeo(shellHtml: string, pathname: string, labSource: LabSource): string {
  const normalized = normalizePath(pathname);
  const seo = seoForPath(normalized);
  const canonical = `${SITE}${normalized}`;

  const withTitle = shellHtml.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeHtml(seo.title)}</title>`
  );

  const withHead = withTitle.includes("</head>")
    ? withTitle.replace("</head>", `  ${renderHeadTags(seo, canonical)}\n  </head>`)
    : withTitle;

  return withHead.includes("</body>")
    ? withHead.replace("</body>", `    ${renderNoscript(seo, normalized, labSource)}\n  </body>`)
    : withHead;
}
