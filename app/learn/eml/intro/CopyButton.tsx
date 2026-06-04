"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      style={{
        minHeight: 30,
        padding: "0 10px",
        border: "1px solid rgba(74, 222, 128, 0.28)",
        borderRadius: 4,
        background: copied ? "rgba(74, 222, 128, 0.18)" : "rgba(74, 222, 128, 0.08)",
        color: copied ? "#9af3b8" : "#dfffea",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 11,
        fontWeight: 700,
      }}
      aria-label="Copy code"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
