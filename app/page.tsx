import Link from "next/link";
import ServicesShell from "./components/ServicesShell";
import BrandScene from "./components/BrandScene";
import { dollars, offer } from "./services-offer";

export default function HomePage() {
  return <ServicesShell>
    <div className="hero-band"><section className="service-hero wrap">
      <div className="hero-copy">
        <p className="eyebrow"><span className="live-dot"/> PARIS, TEXAS</p>
        <h1>Custom software, automation,<br/><em>and practical AI help.</em></h1>
        <p className="hero-description">We build software around how work actually gets done — and we help people get the new tools set up properly and learn to use them on their own real tasks. You don&apos;t need a business, or a custom app, to get something useful out of us.</p>
        <div className="hero-actions"><a className="button" href="#for-business">For your business <span aria-hidden="true">→</span></a><a className="text-link" href="#for-you">For you →</a></div>
      </div>
      <BrandScene />
    </section></div>
    <div className="service-strip"><div className="wrap"><span>CUSTOM SOFTWARE</span><i aria-hidden="true">✳</i><span>AUTOMATION</span><i aria-hidden="true">✳</i><span>PRACTICAL AI HELP</span><i aria-hidden="true">✳</i><span>WEBSITES</span></div></div>

    <section className="section wrap" id="paths">
      <div className="section-heading"><p className="eyebrow">TWO WAYS TO WORK WITH US</p><h2>Same people, same approach.<br/><em>Two starting points.</em></h2></div>
      <div className="path-grid">
        <article id="for-business">
          <p className="path-tag">FOR YOUR BUSINESS</p>
          <h3>Apps, connected workflows, automation and assistants.</h3>
          <p>Software built around how your business actually works, not around what an off-the-shelf product expects you to do.</p>
          <ul><li>The everyday jobs handled properly — taking orders, booking, scheduling, checking numbers</li><li>The pieces talking to each other instead of three systems that disagree</li><li>Start with one useful system, and expand when there&apos;s a reason to</li><li>Ongoing operation and support, if and when you want it</li></ul>
          <a className="text-link" href="#services">See what we build ↓</a>
        </article>
        <article id="for-you">
          <p className="path-tag">FOR YOU</p>
          <h3>Personal automation, AI-tool setup, and hands-on guidance.</h3>
          <p>Plenty of people don&apos;t need software built. They need the right tool chosen, set up properly, and someone to show them how to actually use it.</p>
          <ul><li>Working out which tool fits what you do — including when the answer is that you don&apos;t need one</li><li>Getting it set up on your own machine and accounts, so it works when we leave</li><li>Sitting down and working through your real tasks together, not a demo</li><li>Small automations for the things you find yourself repeating</li></ul>
          <a className="text-link" href="#personal">What that looks like ↓</a>
        </article>
      </div>
      <div className="path-band">
        <div><h3>We recommend before we build</h3><p>If a tool that already exists solves your problem, we&apos;ll say so, set it up, and show you how to use it. We build something custom when it genuinely does what a tool can&apos;t. You&apos;ll hear which one we think it is, and why.</p></div>
        <div><h3>One-off, or ongoing — your choice</h3><p>A setup or a working session can be a single visit, with optional support afterward, which is often the right answer. Ongoing support is there when it earns its place. We&apos;ll tell you which we think you need rather than assuming a subscription.</p></div>
      </div>
    </section>

    <section className="section wrap" id="services">
      <div className="section-heading"><p className="eyebrow">01 / WHAT WE BUILD</p><h2>The work your business does<br/>every day, <em>in software you own.</em></h2><p>Most businesses run on a mix of phone calls, spreadsheets and paper. We replace the parts that cost you the most, with something your staff and customers actually use.</p></div>
      <div className="service-columns"><article><span className="service-number">01</span><h3>Keep the work moving.</h3><p>Software for the work behind the counter: orders, reservations, estimates, jobs, and invoices. We build it around how your business already runs, then keep running it with you.</p><span className="service-label">CUSTOM APPS + OPERATIONS</span></article><article><span className="service-number">02</span><h3>Start with one useful system.</h3><p>We recommend the smallest release that solves the problem you actually have, built so it can grow. A customer portal, a staff board and an owner dashboard are options — not things every build has to include.</p><span className="service-label">SIZED TO YOUR NEEDS</span></article><article><span className="service-number">03</span><h3>An assistant, where it earns its place.</h3><p>We can build an assistant into the software we make for you — something that answers questions about your own records, or watches the work and raises what needs a person. We scope it with you and show you what it does before it goes anywhere near your customers.</p><span className="service-label">BUILT-IN ASSISTANT</span></article></div>
    </section>

    <section className="operations-section"><div className="wrap operations-grid"><div><p className="eyebrow">BEYOND THE CLICK</p><h2>What happened<br/>after the phone rang?</h2></div><div><p>A traffic report can tell you how people arrived. Connected operations software can help you follow an inquiry through an estimate, a job, and an invoice.</p><p>That connection is what we build toward. We agree on the systems and tracking first, then report what the records can actually support.</p><a className="text-link" href="mailto:hello@micro-titan.com?subject=Connecting%20my%20business%20operations">Talk through your workflow ↗</a></div></div></section>

    <section className="section wrap" id="work"><div className="section-heading"><p className="eyebrow">02 / WHAT&apos;S RUNNING NOW</p><h2>Software we&apos;ve built<br/><em>and keep running.</em></h2><p>Described by what the software does.</p></div><div className="work-grid plain"><article><p className="eyebrow">ORDERING</p><h3>Order-ahead and a staff order board</h3><p>A deli ordering system: customers place an order ahead, staff work from a live board, and the owner maintains the menu — items, prices, variants and add-ons — through a manager built for them.</p></article><article><p className="eyebrow">CHECKING THE NUMBERS</p><h3>Statement comparison</h3><p>An oil-and-gas royalty ledger: statements go in, and the software compares them month to month so you can see what changed — which wells appear, what moved, and by how much.</p></article><article><p className="eyebrow">BOOKING AND MEMBERSHIP</p><h3>Member reservations and club operations</h3><p>A golf club app: members reserve tee times, see events and order food; each department works from its own view of what it needs to do.</p></article></div></section>

    <section className="section wrap" id="ongoing"><div className="section-heading"><p className="eyebrow">03 / ONGOING OPERATION AND SUPPORT</p><h2>We don&apos;t hand it over<br/><em>and disappear.</em></h2></div><div className="service-columns"><article><span className="service-number">01</span><h3>Changes as your business changes</h3><p>A new item, a new department, a season, a price rise. We agree on the support and included changes for your project.</p><span className="service-label">AGREED PER PROJECT</span></article><article><span className="service-number">02</span><h3>We check what&apos;s actually live</h3><p>Software can be right in one place and out of date in another. We check the running system, not just our own copy.</p><span className="service-label">VERIFIED, NOT ASSUMED</span></article><article><span className="service-number">03</span><h3>Improvements you approve first</h3><p>We propose, you decide, then we build. Nothing bigger gets started without your yes. A monthly account tells you what changed, what we checked, what&apos;s still open, and anything that needs you.</p><span className="service-label">YOUR CALL</span></article></div></section>

    <section className="section wrap" id="personal">
      <div className="section-heading"><p className="eyebrow">04 / FOR YOU</p><h2>Practical AI help,<br/><em>without needing a business.</em></h2><p>Three things. You can hire us for any one of them on its own, and plenty of people only ever need the first two.</p></div>
      <div className="service-columns"><article><span className="service-number">01</span><h3>Setup</h3><p>Working out which tool actually fits what you do — sometimes the answer is that you don&apos;t need one — then getting it working on your own machine and your own accounts.</p><span className="service-label">CHOOSING + INSTALLING</span></article><article><span className="service-number">02</span><h3>Hands-on guidance</h3><p>We sit down with your real work: the emails you write, the files you keep, the things you look up every week. We work through your real tasks and leave you with practical steps to use afterward.</p><span className="service-label">WORKING SESSION</span></article><article><span className="service-number">03</span><h3>Personal automation</h3><p>The small repeated jobs handled for you. We build something custom only when a tool that already exists won&apos;t do it.</p><span className="service-label">SMALL BUILDS</span></article></div>
      <div className="path-band single"><div><h3>How it works</h3><p>Most of this is a one-time setup or a guidance session: we get things working, show you how to use them, and you carry on from there. Everything stays in your own accounts, set up by you. If you&apos;d like us around afterwards, ongoing support is available — we&apos;ll talk about what&apos;s actually worth having.</p><a className="text-link" href="mailto:hello@micro-titan.com?subject=Practical%20AI%20help">Tell us what you&apos;re trying to do ↗</a></div></div>
    </section>

    <section className="package-section wrap" id="websites"><div><p className="eyebrow">05 / ADDITIONAL SERVICES</p><h2>Websites<br/>and marketing.<br/><em>One clear price.</em></h2><p>Available on their own, or alongside the software. This is a separate service with its own price — it isn&apos;t part of a custom software quote, and custom software is scoped and quoted separately.</p></div><div className="package-card"><p className="eyebrow">WEBSITE + MONTHLY CARE</p><div className="package-price">{dollars(offer.monthly)}<small>/ month</small></div><p className="setup-price">+ {dollars(offer.setup)} one-time setup</p><ul>{offer.includes.map(item=><li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
<p className="eyebrow not-yet-label">INCLUDED, ONCE YOU GRANT ACCESS</p>
<ul className="not-yet">{offer.withAccess.map(item=><li key={item}><span aria-hidden="true">·</span>{item}</li>)}</ul>
<p className="fine-print">Writing and preparing is our side. Publishing to your accounts, or managing your listing, needs permission only you can give — an onboarding step, not an extra charge.</p><Link className="button" href="/pricing#quote">Build your website quote ↗</Link><p className="fine-print">Custom operations software is scoped and quoted separately. Advertising, photography and video are not part of this package. Scope and start date agreed before you commit.</p></div></section>

    <section className="closing wrap"><p className="eyebrow">A LOCAL PARTNER, FOR BUSINESSES AND FOR PEOPLE.</p><h2>Let&apos;s make your<br/>next step a useful one.</h2><p className="closing-sub">Whether you run a business or just want the new tools working properly for you, start by telling us what you&apos;re trying to do.</p><a className="button" href="mailto:hello@micro-titan.com?subject=What%20I%27m%20trying%20to%20do">Tell us what you&apos;re trying to do ↗</a></section>
  </ServicesShell>;
}
