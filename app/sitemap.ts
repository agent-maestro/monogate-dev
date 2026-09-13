import type { MetadataRoute } from "next";
import { ROUTE_SEO } from "./electronics/[[...slug]]/seo";
import { PAGE_ROUTES } from "./sitemap-pages";

// Generated from the routes that survive, not typed. Until 2026-09-12 this was a hand list: it
// advertised /one-operator (an off-site redirect), three pages of the dead challenge board and the
// Math Lab, omitted every lesson, and stamped every URL "modified now".
//
// Listed: PAGE_ROUTES, which scripts/check_sitemap_pages.mjs derives from app/**/page.tsx minus
// redirects and pages it names with a reason, and which check:site holds to the tree; plus the
// Electronics Lab routes that seo.ts gives their own title and description. No lastModified:
// nothing here knows when a page last changed.
//
// Nothing here may read the source tree. The first generated version walked app/ with node:fs and
// imported next.config.mjs when the route ran; the build prerendered it, but the OpenNext Worker
// runs the handler, and /sitemap.xml answered 500.
export const dynamic = "force-static";

const SITE = "https://monogate.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [...new Set([...PAGE_ROUTES, ...Object.keys(ROUTE_SEO)])].sort();
  return routes.map((route) => ({
    url: `${SITE}${route}`,
    priority: route === "/" ? 1 : route.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
