// Palette and pill for the EML language explorer. They lived in
// app/evidence/data.tsx, which was archived on 2026-09-12 with the evidence
// browser; this page was the only other importer.

export const C = {
  bg: "#08090e",
  surface: "#0d0f18",
  surface2: "#12151f",
  border: "#1c1f2e",
  text: "#d4d4d4",
  muted: "#6d7085",
  orange: "#e8a020",
  green: "#4ade80",
  blue: "#6ab0f5",
  red: "#f87171",
  purple: "#a78bfa",
};

export function pill(text: string, color = C.orange) {
  return (
    <code
      style={{
        display: "inline-flex",
        maxWidth: "100%",
        overflowWrap: "anywhere",
        color,
        border: `1px solid ${color}33`,
        background: `${color}12`,
        borderRadius: 4,
        padding: "3px 7px",
        fontSize: 11,
        lineHeight: 1.4,
      }}
    >
      {text}
    </code>
  );
}
