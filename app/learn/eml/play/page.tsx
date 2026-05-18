import type { Metadata } from "next";
import PlayClient from "./PlayClient";

export const metadata: Metadata = {
  title: "Play EML - monogate.dev/learn/eml/play",
  description:
    "Learn EML through small games: route signals, clamp outputs, satisfy contracts, and turn the solution into a starter electronics kernel.",
};

export default function PlayEMLPage() {
  return <PlayClient />;
}
