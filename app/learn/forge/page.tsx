import { redirect } from "next/navigation";

// /learn/forge is the historical URL; the canonical home for the
// EML-lang crash course is now /learn/eml (matches the language
// name, slots into the two-card /learn hub). External docs and
// older blog posts still point here. redirect() answers 307
// (temporary), which is what the live URL returns; a permanent
// move would be a `permanent: true` rule in next.config.mjs.
export default function LearnForgeRedirect() {
  redirect("/learn/eml");
}
