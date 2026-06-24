import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Serve the electronics-lab SPA at /electronics and any /electronics/* client
 * route. The SPA is a Vite artifact synced into public/electronics-lab (assets
 * referenced absolutely at /electronics-lab/...; its router's basename is
 * /electronics). We can't use Next `rewrites()` to /electronics-lab/index.html
 * because @opennextjs/cloudflare resolves rewrites in the server function,
 * which can't serve a static public asset (those live in the ASSETS binding)
 * and 404s. So this catch-all fetches the SPA shell from ASSETS and returns it
 * with the /electronics URL intact — which also gives the SPA deep-link
 * fallback (any /electronics/* path → the shell).
 *
 * Real files under public/electronics/** (e.g. the ESP32 PDFs) are static
 * assets served by ASSETS *before* this route runs, so they're unaffected.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SPA_SHELL = "/electronics-lab/index.html";

async function readShell(request: Request): Promise<string> {
  // Production (Cloudflare Workers): the shell lives in the ASSETS binding.
  try {
    const { env } = getCloudflareContext();
    const assets = (env as { ASSETS?: { fetch(input: URL | Request): Promise<Response> } }).ASSETS;
    if (assets) {
      const res = await assets.fetch(new URL(SPA_SHELL, request.url));
      if (res.ok) return await res.text();
    }
  } catch {
    // Not running on Cloudflare (e.g. `next dev`) — fall through to disk.
  }
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  return readFile(join(process.cwd(), "public", "electronics-lab", "index.html"), "utf8");
}

export async function GET(request: Request): Promise<Response> {
  const html = await readShell(request);
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      // The shell is tiny and the hashed assets are immutable; let the SPA
      // entry revalidate so a re-synced course shows up promptly.
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
