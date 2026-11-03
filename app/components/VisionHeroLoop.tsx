import Image from "next/image";
import VisionIcon from "./VisionIcon";

/** Decorative example only. The ribbon is an asset; the interface stays real HTML. */
export default function VisionHeroLoop() {
  return <div className="mtv-art" role="img" aria-label="Illustration: an inbox request and calendar slot come together in a proposal waiting for your approval.">
    <Image className="mtv-ribbon" src="/images/vision-glass-ribbon.webp" alt="" width={1448} height={1086} sizes="(max-width: 700px) 100vw, (max-width: 1200px) 55vw, 720px" preload />
    <svg className="mtv-art-connections" viewBox="0 0 600 470" fill="none" aria-hidden="true"><path d="M230 185C310 150 328 244 340 295M230 185C275 155 348 158 405 180" stroke="#e3c9ff" strokeWidth="2.5"/><g fill="white"><circle cx="230" cy="185" r="5"/><circle cx="340" cy="295" r="5"/><circle cx="405" cy="180" r="5"/></g></svg>
    <div className="mtv-float mtv-inbox" aria-hidden="true"><div className="mtv-card-title"><span className="mtv-badge"><VisionIcon name="inbox"/></span>Inbox</div><div className="mtv-card-content"><span className="mtv-status-dot"/>Can we book<br/>Thursday?<i/></div></div>
    <div className="mtv-float mtv-calendar" aria-hidden="true"><div className="mtv-card-title"><span className="mtv-badge is-blue"><VisionIcon name="calendar"/></span>Calendar</div><div className="mtv-card-content">Thursday<br/>9:00 AM<i/></div></div>
    <div className="mtv-float mtv-approval" aria-hidden="true"><div className="mtv-card-title"><span className="mtv-badge"><VisionIcon name="shield"/></span>Ready for your OK</div><div className="mtv-card-actions"><span className="mtv-yes">✓ &nbsp;Yes, send it</span><span className="mtv-no">Another time</span></div></div>
  </div>;
}
