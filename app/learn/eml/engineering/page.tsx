import type { Metadata } from "next";
import EngineeringClient from "./EngineeringClient";

export const metadata: Metadata = {
  title: "Engineering with EML (Level 2) — monogate.dev/learn/eml/engineering",
  description:
    "Level 2 of the EML curriculum. Six lessons, ten minutes each. "
    + "Multi-module systems, the chain-order cost model, compositional "
    + "verification contracts, hardware budgets, multi-target CI, and "
    + "the standard library. The lessons that turn a Level 1 user into "
    + "an EML engineer.",
};

export default function EngineeringPage() {
  return <EngineeringClient />;
}
