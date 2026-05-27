import type { Metadata } from "next";
import PacketBuilderClient from "./PacketBuilderClient";

export const metadata: Metadata = {
  title: "EML Packet Builder",
  description:
    "Private client-side EML Expression Packet v0 builder for candidate intake before local IR/replay generation.",
};

export default function EmlPacketBuilderPage() {
  return <PacketBuilderClient />;
}
