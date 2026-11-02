/* Vision hero loop: a glossy purple-to-blue figure-8, drawn as SVG so it
   scales. On mobile the SVG is sized with object-fit/contain behaviour
   (width 100%, height auto, no cropping) — the mockup's mobile cut-off
   must not be reintroduced. Floating cards are positioned inside the
   panel, never outside it. */
export default function VisionHeroLoop() {
  return (
    <div className="vision-loop" aria-label="One job, start to finish: a message arrives, the calendar is checked, you approve it, and a confirmation record is filed.">
      <svg className="vision-loop-svg" viewBox="0 0 520 380" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="visionLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="55%" stopColor="#5b5bd6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="visionLoopGloss" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="185" cy="190" rx="150" ry="130" fill="none" stroke="url(#visionLoopGrad)" strokeWidth="34" opacity="0.95" transform="rotate(-24 185 190)" />
        <ellipse cx="345" cy="190" rx="150" ry="130" fill="none" stroke="url(#visionLoopGrad)" strokeWidth="34" opacity="0.95" transform="rotate(24 345 190)" />
        <ellipse cx="185" cy="190" rx="150" ry="130" fill="none" stroke="url(#visionLoopGloss)" strokeWidth="10" opacity="0.55" transform="rotate(-24 185 190)" />
        <ellipse cx="345" cy="190" rx="150" ry="130" fill="none" stroke="url(#visionLoopGloss)" strokeWidth="10" opacity="0.55" transform="rotate(24 345 190)" />
      </svg>
      <div className="vision-float vision-float-inbox">
        <p><span aria-hidden="true">✉️</span> Inbox</p>
        <strong>Can we book Thursday?</strong>
      </div>
      <div className="vision-float vision-float-calendar">
        <p><span aria-hidden="true">📅</span> Calendar</p>
        <strong>Thursday 9:00 AM</strong>
      </div>
      <div className="vision-float vision-float-ok">
        <p><span aria-hidden="true">✓</span> Ready for your OK</p>
        <div><span className="vision-ok-yes">Yes, send it</span><span className="vision-ok-no">Another time</span></div>
      </div>
    </div>
  );
}
