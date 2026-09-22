"use client";
import { useState } from "react";
import { dollars, offer } from "../services-offer";

// Each extra carries its OWN note. One shared "Quoted separately" label told a visitor we would
// price advertising, photography and video. We do not offer those, so the tool must not offer
// to quote them.
const extras = [
  { name: "Custom operations software", note: "Quoted separately" },
  { name: "Paid advertising", note: "Not offered" },
  { name: "Photography or video", note: "Not offered" },
];
export default function ServiceQuote() {
  const [locations, setLocations] = useState("one");
  const [selected, setSelected] = useState<string[]>([]);
  const custom = locations !== "one" || selected.length > 0;
  return <section className="quote-grid" id="quote">
    <div><p className="eyebrow">BUILD YOUR QUOTE</p><h2>Just the price.<br/>No email required.</h2><p>Start with the standard package. Choose any additional needs to see what would be quoted separately.</p>
      <fieldset><legend>How many business locations?</legend><div className="quote-options">{[["one","One location"],["multiple","More than one"]].map(([value,label])=><label key={value}><input type="radio" name="locations" value={value} checked={locations===value} onChange={()=>setLocations(value)}/>{label}</label>)}</div></fieldset>
      <fieldset><legend>Anything else you need?</legend>{extras.map(extra=><label className="quote-check" key={extra.name}><input type="checkbox" checked={selected.includes(extra.name)} onChange={event=>setSelected(event.target.checked ? [...selected,extra.name] : selected.filter(item=>item!==extra.name))}/>{extra.name}<span>{extra.note}</span></label>)}</fieldset>
    </div>
    <div className="quote-summary" aria-live="polite" aria-atomic="true"><p className="eyebrow">{custom ? "YOUR PACKAGE + ADDITIONAL SCOPE" : "YOUR STANDARD PACKAGE"}</p><h3>Website + monthly care</h3><p>Single-location package</p><dl><div><dt>One-time setup</dt><dd>{dollars(offer.setup)}</dd></div><div><dt>Monthly service</dt><dd>{dollars(offer.monthly)}<small>/mo</small></dd></div></dl>
      <p className="fine-print">Standard website, website care and updates, on-page local search setup, monthly reporting, four original social posts a month, and a review request kit you send yourself. Publishing to your channels and Google Business Profile management are included once you grant us access.</p>
      {custom && <div className="quote-extras"><strong>Not included in the price above</strong><ul>{locations!=="one" && <li>Additional locations — quote needed</li>}{selected.map(extra=>{const meta=extras.find(item=>item.name===extra);return <li key={extra}>{extra} — {meta && meta.note==="Not offered" ? "not offered" : "quote needed"}</li>;})}</ul><p>We&apos;ll price this scope before you commit. The numbers above are the base package, not your complete total.</p></div>}
      <a className="button" href={`mailto:hello@micro-titan.com?subject=${encodeURIComponent("My Micro Titan quote")}&body=${encodeURIComponent(`I'd like to discuss the website and care package: ${dollars(offer.setup)} setup + ${dollars(offer.monthly)}/month. Locations: ${locations === "one" ? "one" : "multiple"}. Additional needs: ${selected.join(", ") || "none"}.`)}`}>Discuss this quote ↗</a><p className="fine-print">Opens your email app only if you choose. Scope, terms, and start date are agreed before payment.</p>
    </div>
  </section>;
}
