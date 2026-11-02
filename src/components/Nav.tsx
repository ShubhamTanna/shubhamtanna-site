"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/story", label: "Story" },
  { href: "/work", label: "Work" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
];

export default function Nav({ resume }: { resume: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = (href: string) => path === href || path.startsWith(href + "/");
  return (
    <nav className={`top${open ? " open" : ""}`} aria-label="Main">
      <div className="wrap">
        <Link className="who d" href="/" onClick={() => setOpen(false)}>Shubham Tanna</Link>
        <button className="menu" type="button" aria-expanded={open} aria-controls="navLinks" onClick={() => setOpen(!open)}>
          {open ? "Close" : "Menu"}
        </button>
        <div className="links" id="navLinks" onClick={() => setOpen(false)}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={current(l.href) ? "page" : undefined}>{l.label}</Link>
          ))}
          <a href={resume}>Resume</a>
        </div>
        <a className="btn" href="#contact">Hire me</a>
      </div>
      <div className="progress" aria-hidden="true" />
    </nav>
  );
}
