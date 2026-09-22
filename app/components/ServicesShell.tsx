import Link from "next/link";
import type { ReactNode } from "react";
import "../services.css";

export default function ServicesShell({ children }: { children: ReactNode }) {
  return <div className="services-site">
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="service-header wrap">
      <Link href="/" className="service-brand" aria-label="Micro Titan home"><svg aria-hidden="true" viewBox="243 160 653 433"><path fillRule="evenodd" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/><path d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/></svg><span>MICRO TITAN<small>SMALL BUSINESS. BIG PRESENCE.</small></span></Link>
      <nav aria-label="Services navigation"><Link href="/#for-business">For your business</Link><Link href="/#for-you">For you</Link><Link href="/studio">Custom software</Link><Link href="/pricing">Pricing</Link></nav>
      <Link className="button small" href="/pricing#quote">Build your website quote <span aria-hidden="true">↗</span></Link>
    </header>
    <main id="content">{children}</main>
    <footer className="service-footer wrap">
      <div><strong>MICRO TITAN</strong><p>Built in Paris, Texas.<br/>For the businesses that keep a town running.</p><a href="mailto:hello@micro-titan.com">hello@micro-titan.com ↗</a></div>
      <nav aria-label="More from Micro Titan"><Link href="/pricing">Services & pricing</Link><Link href="/studio">Custom software</Link><Link href="/valet">Meet Valet</Link><Link href="/valet/pricing">Valet plans</Link><Link href="/about">About Micro Titan</Link></nav>
      <div className="footer-legal"><span>© 2026 Micro Titan LLC · Paris, Texas</span><span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link></span></div>
    </footer>
  </div>;
}
