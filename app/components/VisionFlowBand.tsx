"use client";
import { useState } from "react";
import VisionIcon from "./VisionIcon";

/** Entirely local demonstration. Never sends a message or creates an event. */
export default function VisionFlowBand() {
  const [approved, setApproved] = useState(false);
  const [alternate, setAlternate] = useState(false);
  const time = alternate ? "10:00 AM" : "9:00 AM";
  return <section className="mtv-demo" id="see-it-work" aria-labelledby="mtv-demo-title">
    <div className="mtv-demo-inner"><h2 id="mtv-demo-title">One job, <em>start to finish.</em></h2>
      <div className="mtv-demo-track">
        <article className="mtv-demo-card mtv-demo-inbox"><h3><span className="mtv-badge"><VisionIcon name="inbox"/></span><span>Inbox</span></h3><p>Can we book<br/>Thursday?</p></article>
        <span className="mtv-connector" aria-hidden="true">→</span>
        <article className="mtv-demo-card mtv-demo-calendar"><h3><span className="mtv-badge is-blue"><VisionIcon name="calendar"/></span><span>Calendar</span></h3><p>Thursday<br/>{time}</p></article>
        <span className="mtv-connector" aria-hidden="true">→</span>
        <article className="mtv-demo-card mtv-demo-approval"><h3><span className="mtv-badge"><VisionIcon name="shield"/></span><span>{approved ? "You approved it" : "Ready for your OK"}</span></h3><div className="mtv-demo-actions"><button type="button" onClick={() => setApproved(true)} disabled={approved}>{approved ? "✓ Approved" : "✓ Yes, send it"}</button><button type="button" onClick={() => { setAlternate(!alternate); setApproved(false); }}>{alternate ? "9:00 AM instead" : "Another time"}</button></div></article>
        <span className="mtv-connector" aria-hidden="true">→</span>
        <article className={`mtv-demo-card mtv-demo-record${approved ? " is-complete" : ""}`}><h3><span className="mtv-badge"><VisionIcon name="check"/></span><span>Confirmation &amp; record</span></h3><p><VisionIcon name="calendar"/>{approved ? "Booked" : "Prepared"}: Thursday, {time}</p><span className="mtv-record-line"/><span className="mtv-record-line short"/></article>
      </div>
      <div className="mtv-demo-foot"><p role="status">{approved ? `Example complete: Thursday at ${time}.` : "Interactive example · nothing is sent or booked."}</p><button type="button" onClick={() => { setApproved(false); setAlternate(false); }}>Replay <span aria-hidden="true">↻</span></button></div>
    </div>
  </section>;
}
