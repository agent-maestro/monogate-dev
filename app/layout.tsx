import type { Metadata } from "next";
import "./globals.css";
import Nav from "./components/Nav";

const siteUrl = "https://monogate.dev";

// Site-wide copy: every page's share card and footer come from here, so a
// claim in this file is on all of them. Until 2026-09-12 the share title was
// "Math you can verify. Hardware that confirms it.", the description said
// kernels run "on browser, ESP32, and FPGA" (the Electronics Lab's SOURCE.json
// records no ESP32 hardware capture), and the footer advertised the archived
// explorers.
const DESCRIPTION =
  "EML — a single-operator math language whose contracts compile to Lean " +
  "theorems and whose kernels compile to C, Python and Verilog. Learn EML, " +
  "try the Electronics Lab, and reproduce what the site checks.";
const SHARE_TITLE = "monogate.dev — Math you can check. Compiled to C, Verilog and Lean.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "monogate.dev — EML math language playground",
    template: "%s — monogate.dev",
  },
  description: DESCRIPTION,
  keywords: [
    "EML operator", "elementary functions", "exp minus log", "arXiv:2603.21852",
    "math language", "Lean 4", "ESP32", "FPGA", "monogate", "monogate-forge",
  ],
  authors: [{ name: "monogate.dev" }],
  openGraph: {
    type: "website",
    siteName: "monogate.dev",
    title: SHARE_TITLE,
    description: DESCRIPTION,
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
    title: SHARE_TITLE,
    description: DESCRIPTION,
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
      {" "}· Lessons · Electronics Lab · Reproduce ·{" "}
      <a href="https://monogate.org" style={{ color: "#4facfe" }}>monogate.org</a> ·{" "}
      <a href="https://monogate.dev" style={{ color: "#4facfe" }}>monogate.dev</a> ·{" "}
      <a href="https://github.com/agent-maestro/monogate" style={{ color: "#4facfe" }}>GitHub</a> ·{" "}
      <a href="https://pypi.org/project/monogate-forge/" style={{ color: "#4facfe" }}>PyPI monogate-forge</a>
    </footer>
  );
}

const projectLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Monogate",
  alternateName: "monogate.dev — Developer Playground",
  description:
    "Lessons and an electronics lab for EML, the single-operator math language: compile kernels with monogate-forge and read Lean's verdict on their contracts with #print axioms.",
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
