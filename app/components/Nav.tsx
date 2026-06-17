"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";

// Nav order is deliberately the first impression. Visitor first sees three
// items they can understand cold (Learn, Explorer, Electronics), then the
// interactive surfaces (Lab, Challenge), then the research-stack items
// (Evidence, Builder, Digestion) which require Monogate vocabulary to grok.
const LINKS = [
  { href: "/learn",             label: "Learn" },
  { href: "/explorer",          label: "Explorer" },
  { href: "/electronics",       label: "Electronics" },
  { href: "/lab",               label: "Lab" },
  { href: "/challenge",         label: "Challenge" },
  { href: "/evidence",          label: "Evidence" },
  { href: "/explorer/eml-packets/builder", label: "Builder" },
  { href: "/proof-digestion",   label: "Digestion" },
  { href: "/docs",              label: "Docs" },
  { href: "https://monogate.org", label: "Research ↗", external: true },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href !== "https://monogate.org" &&
    (pathname === href || (href !== "/" && pathname.startsWith(href)));

  return (
    <>
      <nav className="site-nav">
        <a href="/" className="site-nav__brand">monogate</a>

        <div className="site-nav__links">
          {LINKS.map(({ href, label, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`nav-link${isActive(href) ? " nav-link--active" : ""}`}
            >{label}</a>
          ))}
        </div>

        <button
          className="site-nav__hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </nav>

      {open && (
        <div className="site-nav__mobile" role="menu">
          {LINKS.map(({ href, label, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`site-nav__mobile-link${isActive(href) ? " site-nav__mobile-link--active" : ""}`}
              onClick={() => setOpen(false)}
              role="menuitem"
            >{label}</a>
          ))}
        </div>
      )}
    </>
  );
}
