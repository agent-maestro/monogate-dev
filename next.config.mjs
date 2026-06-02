/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["monogate"],
  async rewrites() {
    return [
      // The public electronics section is owned by monogate-electronics and
      // served from the synced Vite artifact in public/electronics-lab.
      // Do not add an app/electronics route here; it will shadow these rewrites.
      { source: "/electronics", destination: "/electronics-lab/index.html" },
      { source: "/electronics/:path*", destination: "/electronics-lab/index.html" },
      { source: "/electronics/trainer-board-v0", destination: "/electronics-lab/index.html" },
      { source: "/electronics/trainer-board-v0/:path*", destination: "/electronics-lab/index.html" },
      { source: "/electronics/arty-a7", destination: "/electronics-lab/index.html" },
      { source: "/electronics/other", destination: "/electronics-lab/index.html" },
      { source: "/electronics/other/:path*", destination: "/electronics-lab/index.html" },
      { source: "/electronics/othersystems", destination: "/electronics-lab/index.html" },
      { source: "/electronics/othersystems/:path*", destination: "/electronics-lab/index.html" },
      { source: "/electronics/optimization-boundary", destination: "/electronics-lab/index.html" },
      { source: "/electronics/optimization-boundary/:path*", destination: "/electronics-lab/index.html" },
    ];
  },
  async redirects() {
    return [
      { source: "/search", destination: "/challenge/search", permanent: true },
      { source: "/leaderboard", destination: "/challenge/leaderboard", permanent: true },
      { source: "/theorems", destination: "https://monogate.org/theorems", permanent: false },
      { source: "/one-operator", destination: "https://monogate.org", permanent: false },
      { source: "/games", destination: "/lab", permanent: true },
      { source: "/play", destination: "/lab", permanent: true },
      { source: "/play/:path*", destination: "/lab/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
