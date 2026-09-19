import type { Metadata } from "next";
import ServicesShell from "../components/ServicesShell";
import ServiceQuote from "../components/ServiceQuote";
export const metadata: Metadata = { title: "Services & Pricing | Micro Titan", description: "Website and ongoing marketing for small businesses: $2,500 setup and $750/month. See your quote without sharing your email." };
export default function PricingPage() {
  return <ServicesShell><div className="wrap"><header className="pricing-intro"><p className="eyebrow">SERVICES & PRICING</p><h1>Good work.<br/><em>Clear numbers.</em></h1><p>A standard website and ongoing marketing for one business location: <strong>$2,500 setup + $750/month.</strong> Custom operations software is scoped separately.</p></header><ServiceQuote/><section className="services-faq"><h2>A few straight answers.</h2>
<details><summary>What does the monthly fee cover?</summary><p>Website care and updates, Google Business Profile management, local SEO, customer review requests, eight social posts a month across two channels, and monthly reporting. Your standard website is included in the setup fee. We agree on the detailed scope before you commit.</p></details>
<details><summary>What if I need software to run the business?</summary><p>We scope custom applications and their ongoing operation around your workflow. That is separate from this marketing package. We quote the build and recurring costs before work starts.</p></details>
<details><summary>Are advertising and content production included?</summary><p>The package includes the social posts described above. Advertising spend, photography, and video are separate. Any additional services and costs need an agreed scope.</p></details>
<details><summary>Will you guarantee rankings or revenue?</summary><p>No. We commit to the agreed work and report the results the available data supports. Search position and revenue cannot be promised.</p></details>
<details><summary>How do content and reviews work?</summary><p>A person approves content before it is published. We help you ask customers for honest reviews. We never generate customer reviews, offer incentives, or filter requests so only happy customers are asked.</p></details>
<details><summary>When can we start?</summary><p>We agree on your scope and a start date together before you commit. Viewing a quote does not reserve a place or charge you.</p></details>
</section></div></ServicesShell>;
}
