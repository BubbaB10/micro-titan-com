/* Vision hero loop: a glossy, 3D-looking purple-to-blue figure-8,
   drawn as layered SVG so it scales and stays text in the repo.
   Layers, bottom to top: soft drop shadow, dark base tube, main
   gradient tube, inner light tube, and a white specular streak
   clipped to the top of the tube — that layering is what makes it
   read as glossy rather than flat rings. On mobile the SVG is
   sized width 100%, height auto, object-fit contain, so it fits
   fully inside the panel with no left/right cut-off. Floating
   cards are glassy/frosted, larger, with coloured icon badges,
   and are positioned inside the panel. */
export default function VisionHeroLoop() {
  return (
    <div className="vision-loop" aria-label="One job, start to finish: a message arrives, the calendar is checked, you approve it, and a confirmation record is filed.">
      <svg className="vision-loop-svg" viewBox="0 0 520 360" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="visionLoopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6d28d9" />
            <stop offset="48%" stopColor="#5b5bd6" />
            <stop offset="100%" stopColor="#1d6bf0" />
          </linearGradient>
          <linearGradient id="visionLoopLight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="visionLoopShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#312e81" floodOpacity="0.25" />
          </filter>
          <clipPath id="visionLoopTop">
            <rect x="0" y="0" width="520" height="155" />
          </clipPath>
        </defs>
        <path d="M260 180 C 190 80 70 55 55 150 C 40 245 170 305 260 180 C 350 55 450 80 465 150 C 480 245 350 305 260 180 Z" fill="none" stroke="#1e1b4b" strokeWidth="46" strokeLinecap="round" opacity="0.18" transform="translate(0 8)" filter="url(#visionLoopShadow)" />
        <path d="M260 180 C 190 80 70 55 55 150 C 40 245 170 305 260 180 C 350 55 450 80 465 150 C 480 245 350 305 260 180 Z" fill="none" stroke="#3b0764" strokeWidth="44" strokeLinecap="round" />
        <path d="M260 180 C 190 80 70 55 55 150 C 40 245 170 305 260 180 C 350 55 450 80 465 150 C 480 245 350 305 260 180 Z" fill="none" stroke="url(#visionLoopGrad)" strokeWidth="38" strokeLinecap="round" />
        <path d="M260 180 C 190 80 70 55 55 150 C 40 245 170 305 260 180 C 350 55 450 80 465 150 C 480 245 350 305 260 180 Z" fill="none" stroke="url(#visionLoopLight)" strokeWidth="20" strokeLinecap="round" opacity="0.45" />
        <g clipPath="url(#visionLoopTop)">
          <path d="M260 180 C 190 80 70 55 55 150 C 40 245 170 305 260 180 C 350 55 450 80 465 150 C 480 245 350 305 260 180 Z" fill="none" stroke="#ffffff" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
        </g>
        <ellipse cx="130" cy="95" rx="52" ry="14" fill="#ffffff" opacity="0.35" transform="rotate(-18 130 95)" />
        <ellipse cx="395" cy="95" rx="52" ry="14" fill="#ffffff" opacity="0.35" transform="rotate(18 395 95)" />
      </svg>
      <div className="vision-float vision-float-inbox">
        <p><span className="vision-float-badge vision-float-badge-purple" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg></span> Inbox</p>
        <strong>Can we book Thursday?</strong>
      </div>
      <div className="vision-float vision-float-calendar">
        <p><span className="vision-float-badge vision-float-badge-blue" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></svg></span> Calendar</p>
        <strong>Thursday 9:00 AM</strong>
      </div>
      <div className="vision-float vision-float-ok">
        <p><span className="vision-float-badge vision-float-badge-grad" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></svg></span> Ready for your OK</p>
        <div><span className="vision-ok-yes">Yes, send it</span><span className="vision-ok-no">Another time</span></div>
      </div>
    </div>
  );
}
