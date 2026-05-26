import type { Metadata } from "next";
import RescueSuiteExplorer from "./RescueSuiteExplorer";

export const metadata: Metadata = {
  title: "Proof-Carrying Rescue Explorer",
  description:
    "Interactive software replay surface for the Forge proof-carrying rescue suite v0: trace frames, boundary events, rescue operators, and MachLib obligations.",
};

export default function RescueSuitePage() {
  return <RescueSuiteExplorer />;
}
