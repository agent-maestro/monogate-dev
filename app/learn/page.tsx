import type { Metadata } from "next";
import LearnHubClient from "./LearnHubClient";

export const metadata: Metadata = {
  title: "Learn — monogate.dev",
  description:
    "Learn EML: write math, inspect its cost profile, compile it to C, Verilog and Lean, and check what is proved. No prerequisites beyond algebra.",
};

// The Lean track (PETAL lanes, /learn/lean) was archived on 2026-09-12; its
// dataset went with it. See /archive and git tag attic/research-stack-2026-06.
export default function LearnHubPage() {
  return <LearnHubClient />;
}
