import type { Metadata } from "next";
import PacketBuilderClient from "./PacketBuilderClient";

export const metadata: Metadata = {
  title: "Evidence Packet Builder | Monogate",
  description:
    "Client-side Monogate evidence packet builder for AI answers, proof notes, traces, hardware packets, compiler artifacts, and EML expressions.",
};

export default function EmlPacketBuilderPage() {
  return <PacketBuilderClient />;
}
