"use client";
import { useState } from "react";
import Link from "next/link";

/** Same mark asset as public/logo-512.png — replaces the "MT" text tile. */
const BRAND_LOGO_SRC = "/logo-512.png";

export default function VisionHeader() {
  const [open, setOpen] = useState(false);
  return <header className="mtv-header" onKeyDown={event => { if (event.key === "Escape") setOpen(false); }}>
    <div className="mtv-header-inner"><Link href="/" className="mtv-brand" aria-label="Micro Titan home"><span className="mtv-brand-tile"><img className="mtv-brand-logo" src={BRAND_LOGO_SRC} alt="" width={49} height={49} decoding="async" /></span><span>Micro Titan</span></Link>
      <nav className="mtv-desktop-nav" aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#see-it-work">See it work</a><Link href="/pricing">Pricing</Link></nav>
      <Link className="mtv-button mtv-consult" href="/book-discovery">Start with a consult</Link>
      <button className="mtv-menu-toggle" type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mtv-mobile-nav" onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{open ? <path d="m6 6 12 12M6 18 18 6"/> : <path d="M4 6h16M4 12h16M4 18h16"/>}</svg></button>
    </div>
    <nav id="mtv-mobile-nav" className="mtv-mobile-nav" aria-label="Mobile navigation" hidden={!open} onClick={() => setOpen(false)}><a href="#how-it-works">How it works</a><a href="#see-it-work">See it work</a><Link href="/#services">Our services</Link><Link href="/pricing">Pricing</Link><Link href="/book-discovery">Start with a consult →</Link></nav>
  </header>;
}
