import Link from "next/link";
import ServicesShell from "./components/ServicesShell";
import BrandScene from "./components/BrandScene";
import { dollars, offer } from "./services-offer";

export default function HomePage() {
  return <ServicesShell>
    <div className="hero-band"><section className="service-hero wrap">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot"/> DIGITAL SERVICES</p>
        <h1>Small business.<br/><em>Big presence.</em></h1>
        <p className="hero-description">Business software, websites, and local search—built around what your business needs.</p>
        <p className="hero-price">Website + monthly care <strong>{dollars(offer.setup)} setup · {dollars(offer.monthly)}/mo</strong></p>
        <div className="hero-actions"><Link className="button" href="/pricing#quote">Build your quote <span aria-hidden="true">↗</span></Link><a className="text-link" href="#services">See what&apos;s included ↓</a></div>
        <p className="fine-print">No email needed to see your price. Custom software quoted separately.</p>
      </div>
      <BrandScene />
    </section></div>
    <div className="service-strip"><div className="wrap"><span>BUSINESS SOFTWARE</span><i aria-hidden="true">✳</i><span>OPERATIONS</span><i aria-hidden="true">✳</i><span>WEBSITES</span><i aria-hidden="true">✳</i><span>LOCAL SEARCH</span></div></div>
    <section className="section wrap" id="services">
      <div className="section-heading"><p className="eyebrow">01 / WHAT WE DO</p><h2>The work behind it.<br/>And the front door.</h2><p>We build and run the software your business works in, with an assistant inside it. The website and the search work extend that to how people find you.</p></div>
      <div className="service-columns"><article><span className="service-number">01</span><h3>Keep the work moving.</h3><p>Software for the work behind the counter: orders, reservations, estimates, jobs, and invoices. We build it around how your business already runs, then keep running it with you.</p><span className="service-label">CUSTOM APPS + OPERATIONS</span></article><article><span className="service-number">02</span><h3>An assistant comes with it.</h3><p>An assistant helps with the routine work inside your software. We agree on what it can do, what needs your approval, and how you can review its activity.</p><span className="service-label">BUILT-IN ASSISTANT</span></article><article><span className="service-number">03</span><h3>Make it easy to find you.</h3><p>A clear website, kept current, with the on-page groundwork search engines look for. This is where the digital services start, and the list grows as we prove each one.</p><span className="service-label">WEBSITES + LOCAL SEARCH</span></article></div>
    </section>
    <section className="operations-section"><div className="wrap operations-grid"><div><p className="eyebrow">BEYOND THE CLICK</p><h2>What happened<br/>after the phone rang?</h2></div><div><p>A traffic report can tell you how people arrived. Connected operations software can help you follow an inquiry through an estimate, a job, and an invoice.</p><p>That connection is what we build toward. We agree on the systems and tracking first, then report what the records can actually support.</p><a className="text-link" href="mailto:hello@micro-titan.com?subject=Connecting%20my%20business%20operations">Talk through your workflow ↗</a></div></div></section>
    <section className="section wrap" id="work"><div className="section-heading"><p className="eyebrow">02 / SOFTWARE WITH A JOB TO DO</p><h2>Built around real work.</h2><p>Our software portfolio spans restaurant ordering, club reservations, property management, and more. Rosewood and Sandwich Etc. are our founding customers.</p></div><div className="work-grid"><article><span className="work-monogram">R.</span><p className="eyebrow">RESTAURANT OPERATIONS</p><h3>Rosewood</h3><p>Connecting an order to the kitchen&apos;s workflow.</p></article><article><span className="work-monogram">S&amp;</span><p className="eyebrow">ORDER-AHEAD SOFTWARE</p><h3>Sandwich Etc.</h3><p>Ordering and checkout, built around the lunch rush.</p></article><article><span className="work-monogram">↗</span><p className="eyebrow">A BROADER PORTFOLIO</p><h3>Different work.<br/>Same care.</h3><p>PGCC · Mineral Ledger · Property OS · Fairway Bets · The Download</p></article></div></section>
    <section className="package-section wrap"><div><p className="eyebrow">03 / STRAIGHTFORWARD PRICING</p><h2>Your website.<br/>Kept running.<br/><em>One clear price.</em></h2><p>For a single-location small business. We build the website, then keep it current and report on it every month. Custom software and operations are scoped separately.</p></div><div className="package-card"><p className="eyebrow">WEBSITE + MONTHLY CARE</p><div className="package-price">{dollars(offer.monthly)}<small>/ month</small></div><p className="setup-price">+ {dollars(offer.setup)} one-time setup</p><ul>{offer.includes.map(item=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
<p className="eyebrow not-yet-label">NOT INCLUDED YET</p>
<ul className="not-yet">{offer.notYet.map(item=><li key={item}><span aria-hidden="true">·</span>{item}</li>)}</ul>
<p className="fine-print">These services are not part of the current package.</p><Link className="button" href="/pricing#quote">Build your quote ↗</Link><p className="fine-print">Custom operations software is scoped and quoted separately. Advertising, photography and video are not part of this package. Scope and start date agreed before you commit.</p></div></section>
    <section className="closing wrap"><p className="eyebrow">A LOCAL PARTNER, WITH THE WHOLE BUSINESS IN VIEW.</p><h2>Let&apos;s make your<br/>next step a useful one.</h2><a className="button" href="mailto:hello@micro-titan.com?subject=Let%27s%20talk%20about%20my%20business">Tell us about your business ↗</a></section>
  </ServicesShell>;
}
