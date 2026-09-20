import Link from "next/link";
import ServicesShell from "./components/ServicesShell";
import BrandScene from "./components/BrandScene";
import { dollars, offer } from "./services-offer";

export default function HomePage() {
  return <ServicesShell>
    <div className="hero-band"><section className="service-hero wrap">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot"/> DIGITAL SERVICES · NORTHEAST TEXAS</p>
        <h1>Small business.<br/><em>Big presence.</em></h1>
        <p className="hero-description">Websites, local search, social content, and custom software—built around what your business needs.</p>
        <p className="hero-price">Website + ongoing marketing <strong>{dollars(offer.setup)} setup · {dollars(offer.monthly)}/mo</strong></p>
        <div className="hero-actions"><Link className="button" href="/pricing#quote">Build your quote <span aria-hidden="true">↗</span></Link><a className="text-link" href="#services">See what&apos;s included ↓</a></div>
        <p className="fine-print">No email needed to see your price. Custom software quoted separately.</p>
      </div>
      <BrandScene />
    </section></div>
    <div className="service-strip"><div className="wrap"><span>WEBSITES</span><i aria-hidden="true">✳</i><span>LOCAL SEARCH</span><i aria-hidden="true">✳</i><span>SOCIAL & REVIEWS</span><i aria-hidden="true">✳</i><span>BUSINESS SOFTWARE</span></div></div>
    <section className="section wrap" id="services">
      <div className="section-heading"><p className="eyebrow">01 / WHAT WE DO</p><h2>A front door.<br/>And everything behind it.</h2><p>You shouldn&apos;t have to become a web designer, a marketer, and a software developer to run your business.</p></div>
      <div className="service-columns"><article><span className="service-number">01</span><h3>Make it easy to find you.</h3><p>A clear website, a cared-for Google Business Profile, and local search work that helps people understand what you do and where you do it.</p><span className="service-label">WEBSITES + LOCAL SEARCH</span></article><article><span className="service-number">02</span><h3>Give people a reason to call.</h3><p>Useful social content and a straightforward way to ask customers for honest reviews. Content is approved by a person before it publishes.</p><span className="service-label">CONTENT + SOCIAL + REVIEWS</span></article><article><span className="service-number">03</span><h3>Keep the work moving.</h3><p>Custom software for the work behind the counter: orders, reservations, estimates, jobs, and invoices. We scope the build and ongoing operation around your business.</p><span className="service-label">CUSTOM APPS + OPERATIONS</span></article></div>
    </section>
    <section className="operations-section"><div className="wrap operations-grid"><div><p className="eyebrow">BEYOND THE CLICK</p><h2>What happened<br/>after the phone rang?</h2></div><div><p>A traffic report can tell you how people arrived. Connected operations software can help you follow an inquiry through an estimate, a job, and an invoice.</p><p>That connection is what we build toward. We agree on the systems and tracking first, then report what the records can actually support.</p><a className="text-link" href="mailto:hello@micro-titan.com?subject=Connecting%20my%20business%20operations">Talk through your workflow ↗</a></div></div></section>
    <section className="section wrap" id="work"><div className="section-heading"><p className="eyebrow">02 / SOFTWARE WITH A JOB TO DO</p><h2>Built around real work.</h2><p>Our software portfolio spans restaurant ordering, club reservations, property management, and more. Rosewood and Sandwich Etc. are our founding customers.</p></div><div className="work-grid"><article><span className="work-monogram">R.</span><p className="eyebrow">RESTAURANT OPERATIONS</p><h3>Rosewood</h3><p>Connecting an order to the kitchen&apos;s workflow.</p></article><article><span className="work-monogram">S&amp;</span><p className="eyebrow">ORDER-AHEAD SOFTWARE</p><h3>Sandwich Etc.</h3><p>Ordering and checkout, built around the lunch rush.</p></article><article><span className="work-monogram">↗</span><p className="eyebrow">A BROADER PORTFOLIO</p><h3>Different work.<br/>Same care.</h3><p>PGCC · Mineral Ledger · Property OS · Fairway Bets · The Download</p></article></div></section>
    <section className="package-section wrap"><div><p className="eyebrow">03 / STRAIGHTFORWARD PRICING</p><h2>Your website.<br/>Your marketing.<br/><em>One clear price.</em></h2><p>For a single-location small business. We build the website, then keep your online presence moving every month.</p></div><div className="package-card"><p className="eyebrow">WEBSITE + ONGOING MARKETING</p><div className="package-price">{dollars(offer.monthly)}<small>/ month</small></div><p className="setup-price">+ {dollars(offer.setup)} one-time setup</p><ul>{offer.includes.map(item=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul><Link className="button" href="/pricing#quote">Build your quote ↗</Link><p className="fine-print">Custom software, ad spend, photography, and video are separate. Scope and start date agreed before you commit.</p></div></section>
    <section className="closing wrap"><p className="eyebrow">A LOCAL PARTNER, WITH THE WHOLE BUSINESS IN VIEW.</p><h2>Let&apos;s make your<br/>next step a useful one.</h2><a className="button" href="mailto:hello@micro-titan.com?subject=Let%27s%20talk%20about%20my%20business">Tell us about your business ↗</a></section>
  </ServicesShell>;
}
