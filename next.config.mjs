/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["monogate"],
  // NOTE: /electronics is served by the catch-all route handler at
  // app/electronics/[[...slug]]/route.ts, NOT by rewrites(). Next rewrites to a
  // static public file (e.g. /electronics-lab/index.html) silently 404 on
  // @opennextjs/cloudflare — the rewrite resolves in the server function, which
  // can't serve a static asset (those live in the ASSETS binding). The route
  // handler fetches the SPA shell from ASSETS instead. Real files under
  // public/electronics/** are static assets and are served before the route.
  async redirects() {
    return [
      { source: "/search", destination: "/challenge/search", permanent: true },
      { source: "/leaderboard", destination: "/challenge/leaderboard", permanent: true },
      { source: "/theorems", destination: "https://monogate.org/theorems", permanent: false },
      { source: "/one-operator", destination: "https://monogate.org", permanent: false },
      { source: "/games", destination: "/lab", permanent: true },
      { source: "/play", destination: "/lab", permanent: true },
      { source: "/play/:path*", destination: "/lab/:path*", permanent: true },
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
    ];
  },
};

export default nextConfig;
