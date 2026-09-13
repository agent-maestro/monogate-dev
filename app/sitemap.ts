import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import nextConfig from "../next.config.mjs";
import { ROUTE_SEO } from "./electronics/[[...slug]]/seo";

// Generated from the routes that survive, not typed. Until 2026-09-12 this was
// a hand list: it advertised /one-operator (an off-site redirect), three pages
// of the dead challenge board and the Math Lab, omitted every lesson, and
// stamped every URL "modified now".
//
// Listed: every app/**/page.tsx outside a dynamic segment, minus any path a
// redirect in next.config.mjs captures (a redirect wins over a page with the
// same source, which is how a shadowed page stayed listed), minus NOT_LISTED;
// plus the Electronics Lab routes that seo.ts gives their own title and
// description. No lastModified: nothing here knows when a page last changed.
//
// Read at build time: force-static keeps fs out of the Worker.
export const dynamic = "force-static";

const SITE = "https://monogate.dev";

const NOT_LISTED: Record<string, string> = {
  "/archive": "a retirement notice, reached through redirects",
  "/learn/forge": "calls redirect() to /learn/eml",
};

function pagePaths(dir: string, route: string): string[] {
  const found: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name.startsWith("[") || entry.name.startsWith("_")) continue;
      const segment = entry.name.startsWith("(") ? "" : `/${entry.name}`;
      found.push(...pagePaths(path.join(dir, entry.name), `${route}${segment}`));
    } else if (entry.name === "page.tsx") {
      found.push(route || "/");
    }
  }
  return found;
}

function captured(route: string, sources: string[]): boolean {
  return sources.some((source) => {
    if (!source.endsWith("/:path*")) return route === source;
    const base = source.slice(0, -"/:path*".length);
    return route === base || route.startsWith(`${base}/`);
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const redirects = nextConfig.redirects ? await nextConfig.redirects() : [];
  const sources = redirects.map((r: { source: string }) => r.source);
  const pages = pagePaths(path.join(process.cwd(), "app"), "").filter(
    (route) => !(route in NOT_LISTED) && !captured(route, sources),
  );
  const routes = [...new Set([...pages, ...Object.keys(ROUTE_SEO)])].sort();
  return routes.map((route) => ({
    url: `${SITE}${route}`,
    priority: route === "/" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
