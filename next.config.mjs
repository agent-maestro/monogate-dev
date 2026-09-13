/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE: /electronics is served by the catch-all route handler at
  // app/electronics/[[...slug]]/route.ts, NOT by rewrites(). Next rewrites to a
  // static public file (e.g. /electronics-lab/index.html) silently 404 on
  // @opennextjs/cloudflare — the rewrite resolves in the server function, which
  // can't serve a static asset (those live in the ASSETS binding). The route
  // handler fetches the SPA shell from ASSETS instead. Real files under
  // public/electronics/** are static assets and are served before the route.
  async redirects() {
    return [
      // Off-site. monogate.org answers /theorems with a 308 to /theorems/, so the
      // slash form keeps this to one hop. Three monogate.org pages link
      // monogate.dev/theorems, so the rule stays.
      { source: "/theorems", destination: "https://monogate.org/theorems/", permanent: false },
      { source: "/one-operator", destination: "https://monogate.org", permanent: false },
      // Legacy aliases of routes archived below. Until 2026-09-12 they were 308s to
      // /challenge/search, /challenge/leaderboard and /lab; each now goes straight
      // to /archive, so none is a two-hop chain. Temporary, like the archive rules.
      // `/play/:path*` also matches the bare /play.
      { source: "/search", destination: "/archive", permanent: false },
      { source: "/leaderboard", destination: "/archive", permanent: false },
      { source: "/games", destination: "/archive", permanent: false },
      { source: "/play/:path*", destination: "/archive", permanent: false },
      // Research workbenches, explorers and Lean lanes archived 2026-09-12 (git tag
      // attic/research-stack-2026-06). `:path*` also matches the bare route. Temporary
      // redirects, so a surface can come back without fighting cached permanent ones.
      ...[
        "/evidence",
        "/proof-digestion",
        "/case-study",
        "/explorer/eml-packets",
        "/explorer/rescue-suite",
        "/explorer/eml-ir-bridge",
        "/explorer/eml-atlas-annex",
        "/explorer/eml-advantage",
        "/explorer/eml-prime-residual",
        "/explorer/eml-symbolic-regression",
        "/learn/lane-1",
        "/learn/lane-2",
        "/learn/lean",
        "/learn/cert",
        "/learn/leaderboard",
      ].map((base) => ({ source: `${base}/:path*`, destination: "/archive", permanent: false })),
      // Product-wave routes archived later the same day (git tag
      // attic/product-wave-2026-09): the challenge board and its submission guide,
      // whose Supabase host no longer resolves; the Explorer with its language page;
      // the Math Lab; and the orphaned interactive lesson. `/explorer/:path*` also
      // covers the research explorers above, which stay listed for their own tag.
      // /lab goes to /archive, not to 1op.io: 1op.io/lab/* answers 404.
      ...[
        "/challenge",
        "/how-to-submit",
        "/explorer",
        "/lab",
        "/learn/eml/interactive",
      ].map((base) => ({ source: `${base}/:path*`, destination: "/archive", permanent: false })),
    ];
  },
};

export default nextConfig;
