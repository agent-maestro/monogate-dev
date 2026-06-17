import type { Metadata } from "next";
import PacketBuilderClient from "./PacketBuilderClient";

export const metadata: Metadata = {
  title: "Evidence Bundle Builder | Monogate",
  description:
    "Client-side Monogate evidence bundle builder for AI answers, proof notes, traces, hardware artifacts, compiler outputs, and EML expressions.",
};

export default function EmlPacketBuilderPage() {
  return <PacketBuilderClient />;
}
