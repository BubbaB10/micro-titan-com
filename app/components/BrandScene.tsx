/** Original MT geometry, rendered as a layered sculpture. Decorative, not a product screenshot. */
export default function BrandScene() {
  return <div className="brand-scene" role="img" aria-label="Illustration: the Micro Titan mark above connected website and operations panels. Custom operations software is scoped separately.">
    <div className="brand-scene-art" aria-hidden="true">
      <div className="scene-halo" />
      <div className="scene-orbit" />
      <svg className="scene-monogram" viewBox="210 120 740 540" fill="none">
        <defs>
          <linearGradient id="scene-metal" x1="260" y1="160" x2="810" y2="590" gradientUnits="userSpaceOnUse"><stop stopColor="#ffffff"/><stop offset=".28" stopColor="#d4d5dc"/><stop offset=".53" stopColor="#ffffff"/><stop offset=".73" stopColor="#9b9faa"/><stop offset="1" stopColor="#5e6370"/></linearGradient>
          <linearGradient id="scene-blue" x1="480" y1="430" x2="650" y2="590" gradientUnits="userSpaceOnUse"><stop stopColor="#b7b0ff"/><stop offset=".5" stopColor="#8174e4"/><stop offset="1" stopColor="#51439e"/></linearGradient>
          <path id="scene-m" d="M258 175 H345 L567 365 L793 175 H881 V578 H783 V548 H849 V205 H806 L567 405 L331 205 H289 V548 H359 V578 H258 Z"/>
          <path id="scene-t" d="M483 437 H655 V478 H590 V578 H548 V478 H483 Z"/>
        </defs>
        {[24,20,16,12,8,4].map(offset=><g key={offset} transform={`translate(${offset} ${offset*.7})`} fill="#25262e" stroke="#656873" strokeWidth="1"><use href="#scene-m"/><use href="#scene-t"/></g>)}
        <use href="#scene-m" fill="url(#scene-metal)" stroke="#ffffff" strokeWidth="1.5"/>
        <use href="#scene-t" fill="url(#scene-blue)" stroke="#c4bdff" strokeWidth="1.5"/>
      </svg>
      <div className="scene-connector" />
      <div className="scene-window scene-website">
        <div className="scene-window-bar"><span className="scene-dots">● ● ●</span><span>YOUR WEBSITE</span><span>↗</span></div>
        <div className="scene-site-body"><span className="scene-mini-logo">YOUR BUSINESS</span><strong>A great first<br/>impression.</strong><div className="scene-text-lines"><i/><i/></div><span className="scene-mini-button">Let&apos;s talk ↗</span><div className="scene-site-art"><span/><span/><span/></div></div>
      </div>
      <div className="scene-window scene-operations">
        <div className="scene-window-bar"><span className="scene-status"/> <span>BEHIND THE BUSINESS</span><span>↗</span></div>
        <div className="scene-steps"><span>Inquiry</span><b>→</b><span>Estimate</span><b>→</b><span>Job</span></div>
        <div className="scene-record"><span className="scene-record-icon">↗</span><div><strong>From first hello to follow-through.</strong><small>Your workflow, connected.</small></div></div>
      </div>
    </div>
    <p className="scene-caption">WEBSITE + OPERATIONS <span>Illustration · custom software scoped separately</span></p>
  </div>;
}
