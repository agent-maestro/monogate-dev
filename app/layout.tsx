import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

const siteUrl = "https://monogate.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "monogate.dev — EML math language playground",
    template: "%s — monogate.dev",
  },
  description:
    "EML — a single-operator math language verified in Lean and running from " +
    "your browser to ESP32 to FPGA. Explore the language, try the hardware lab, " +
    "and learn EML.",
  keywords: [
    "EML operator", "elementary functions", "exp minus log", "arXiv:2603.21852",
    "math language", "Lean-verified", "ESP32", "FPGA", "monogate",
    "hardware-validated math", "evidence packets",
  ],
  authors: [{ name: "monogate.dev" }],
  openGraph: {
    type: "website",
    siteName: "monogate.dev",
    title: "monogate.dev — Math you can verify. Hardware that confirms it.",
    description:
      "EML is a single-operator math language. Every kernel ships with a Lean " +
      "proof and runs from your browser to ESP32 to FPGA. Try the Explorer, " +
      "open the Electronics Lab, or learn EML.",
    url: siteUrl,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Monogate — One Operator for All Elementary Functions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "monogate.dev — Math you can verify. Hardware that confirms it.",
    description:
      "EML — a single-operator math language verified in Lean and running on " +
      "browser, ESP32, and FPGA. Try the Explorer or Electronics Lab.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  robots: { index: true, follow: true },
};

function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid #191b2e", padding: "24px", textAlign: "center",
      fontFamily: "monospace", fontSize: 11, color: "#4e5168",
      maxWidth: 900, margin: "0 auto",
    }}>
      Monogate Dev Playground ·{" "}
      <a href="https://arxiv.org/abs/2603.21852" style={{ color: "#4facfe" }}>arXiv:2603.21852</a>
      {" "}· Workbench surfaces · Evidence packets · EML explorers ·{" "}
      <a href="https://monogate.org" style={{ color: "#4facfe" }}>monogate.org</a> ·{" "}
      <a href="https://monogate.dev" style={{ color: "#4facfe" }}>monogate.dev</a> ·{" "}
      <a href="https://github.com/agent-maestro/monogate" style={{ color: "#4facfe" }}>GitHub</a> ·{" "}
      <a href="https://pypi.org/project/monogate/" style={{ color: "#4facfe" }}>PyPI</a>
    </footer>
  );
}

const projectLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Monogate",
  alternateName: "monogate.dev — Developer Playground",
  description:
    "Developer playground for Monogate artifacts: EML explorers, evidence packets, rescue traces, packet builders, simulators, and bounded demos.",
  url: siteUrl,
  applicationCategory: "DeveloperApplication",
  sameAs: [
    "https://monogate.org",
    "https://github.com/agent-maestro/monogate",
    "https://github.com/agent-maestro/monogate-lean",
    "https://pypi.org/project/monogate/",
    "https://arxiv.org/abs/2603.21852",
  ],
  codeRepository: "https://github.com/agent-maestro/monogate",
  author: { "@type": "Organization", name: "Monogate" },
  license: "https://opensource.org/licenses/MIT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(projectLd) }}
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
