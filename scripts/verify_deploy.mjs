#!/usr/bin/env node
/**
 * Prove the build we just deployed is the one the custom domain serves.
 *
 * wrangler.jsonc declares no routes for this worker -- monogate.dev is
 * bound in the Cloudflare dashboard instead -- so `wrangler deploy` prints
 * only the workers.dev URL and says nothing about the real site. On
 * 2026-08-18 that led to reading a cached edge response and concluding the
 * deploy had failed when it had in fact succeeded.
 *
 * Declaring routes here would make the log self-evidencing, but it also
 * means changing live routing for a domain whose binding type is not
 * visible from the CLI, and a Custom Domain declaration conflicts with an
 * existing zone route. Verifying the result is the safer instrument: config
 * says what should happen, this says what did.
 *
 * Method: every build emits uniquely-named static chunks. Ask the live
 * domain for one that only exists in THIS build. A 200 cannot come from a
 * cached older deploy, because the older deploy never had that filename.
 */
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = process.env.DEPLOY_VERIFY_URL ?? "https://monogate.dev";
const CHUNKS = ".open-next/assets/_next/static/chunks";

if (!existsSync(CHUNKS)) {
    console.error(`verify: ${CHUNKS} missing -- run the build first`);
    process.exit(1);
}

const chunk = readdirSync(CHUNKS).filter((f) => f.endsWith(".js")).sort().at(-1);
if (!chunk) {
    console.error("verify: no chunks in the build output");
    process.exit(1);
}

const url = `${SITE}/_next/static/chunks/${chunk}`;
const res = await fetch(url, { headers: { "cache-control": "no-cache" } });

if (!res.ok) {
    console.error(`verify: FAIL -- ${SITE} does not serve this build`);
    console.error(`        ${res.status} for ${url}`);
    console.error(`        the worker deployed, but the custom domain is not`);
    console.error(`        serving it. Check the domain binding in the`);
    console.error(`        Cloudflare dashboard.`);
    process.exit(1);
}

// A page load too, so a 200 on a static asset alone cannot pass a site
// whose worker is erroring on render.
const page = await fetch(`${SITE}/?cb=${Date.now()}`, {
    headers: { "cache-control": "no-cache" },
});
if (!page.ok) {
    console.error(`verify: FAIL -- assets serve but ${SITE}/ returned ${page.status}`);
    process.exit(1);
}

console.log(`verify: ${SITE} is serving this build (${chunk}, page ${page.status})`);
