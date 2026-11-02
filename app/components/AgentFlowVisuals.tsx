"use client";
import { useEffect, useRef, useState } from "react";

/* Animated tier demos — the approved vision-mockup stories, ported to the
   live site. Each story is illustrative, not a delivered app, and each ends
   in a checkable record and an approval step. No prices are repeated here
   (they live in AgentSetup); no invented client names, testimonials, or
   outcomes. Corner Mart / Job #1042 and Dana are the illustrative examples
   already used in the approved mockup demos. */
type Scene = { kicker: string; title: string; caption: string; card: string[] };
type Story = { tab: string; title: string; subtitle: string; scenes: Scene[]; checklist: string[]; result: string };

const STORIES: Story[] = [
  {
    tab: "Family",
    title: "The week that used to take a Sunday night",
    subtitle: "School, bills, a clash, and a trip — sorted into one approval.",
    scenes: [
      { kicker: "Scene 1 of 4 — The week arrives", title: "Everything lands in one place", caption: "A school form, an electric bill, a dentist appointment, and trip plans arrive across the week.", card: ["📋 School form due", "💡 Electric bill due", "🦷 Dentist · Sat 10:00 AM", "✈️ Trip plans to pull together"] },
      { kicker: "Scene 2 of 4 — A clash, spotted", title: "The clash is caught before it bites", caption: "The dentist slot clashes with soccer. The bill is due before the trip, not after it.", card: ["⚠️ Dentist clashes with soccer", "💡 Bill due Friday", "Proposed: move dentist to Sat 2:00 PM"] },
      { kicker: "Scene 3 of 4 — One approval", title: "You approve it, once", caption: "One tap approves the new time and the bill reminder — nothing moves without your OK.", card: ["✓ Yes, move the dentist", "✓ Remind me about the bill", "Another time"] },
      { kicker: "Scene 4 of 4 — On file", title: "A Monday-morning brief, on file", caption: "The week is settled, and the brief is a record you can check — not just a chat reply.", card: ["📄 Monday-morning brief on file", "Dentist moved · bill reminder set", "Trip plans in one place"] },
    ],
    checklist: ["School form filed", "Bill reminder set", "Clash resolved", "Trip plans in one place"],
    result: "Result: the week, settled — with a brief on file.",
  },
  {
    tab: "Solo",
    title: "A lead that doesn't go cold",
    subtitle: "An enquiry answered from the job site, booked the same day.",
    scenes: [
      { kicker: "Scene 1 of 4 — The enquiry", title: "Dana asks, while you're on a job", caption: "A new enquiry arrives. It doesn't sit in an inbox until tonight.", card: ["✉️ Dana: Can we book this week?", "Received while you're on site"] },
      { kicker: "Scene 2 of 4 — Calendar checked", title: "A real slot, not a guess", caption: "The calendar is checked: Tuesday 10:00 AM is open.", card: ["📅 Calendar checked", "Tuesday 10:00 AM — open"] },
      { kicker: "Scene 3 of 4 — Drafted in your voice", title: "A reply, ready for your OK", caption: "The reply is drafted in your voice and waits for approval — it is not sent blind.", card: ["Draft: Tuesday 10:00 AM works — shall I book it?", "Waiting for your approval"] },
      { kicker: "Scene 4 of 4 — Booked, on file", title: "Booked: Tuesday, 10:00 AM", caption: "Approved, booked, and confirmed — with an event record on file.", card: ["✓ Appointment booked", "✓ Confirmation sent", "Event on file"] },
    ],
    checklist: ["Enquiry answered", "Calendar checked", "Reply approved", "Appointment booked"],
    result: "Result: appointment booked, not just drafted.",
  },
  {
    tab: "Business",
    title: "One job, no phone tag",
    subtitle: "A signage job, captured once and tracked to approval.",
    scenes: [
      { kicker: "Scene 1 of 4 — Intake, once", title: "Corner Mart signage, captured once", caption: "Job #1042 is captured once — no re-typing it for every department.", card: ["🧾 Job #1042 — Corner Mart signage", "Intake captured once"] },
      { kicker: "Scene 2 of 4 — Routed by your rules", title: "Roll or flatbed, by your rules", caption: "The job is routed roll-to-roll or flatbed by the shop's own rules, not by phone tag.", card: ["↗ Routed: roll-to-roll", "By your rules"] },
      { kicker: "Scene 3 of 4 — Proof and schedule", title: "Proof and schedule, visible", caption: "Art / proof status and the production schedule are visible in one place.", card: ["🎨 Proof: approved", "📅 Production schedule updated"] },
      { kicker: "Scene 4 of 4 — Approved, and on file", title: "Ready for your approval", caption: "The customer is updated without a call, and the job ends with a record on file.", card: ["✓ Customer update sent, no phone tag", "✓ Job #1042 on file"] },
    ],
    checklist: ["Job captured once", "Routed by your rules", "Proof and schedule visible", "Customer updated"],
    result: "Result: one job, no phone tag — ready for your approval.",
  },
];

export default function AgentFlowVisuals() {
  const [storyIdx, setStoryIdx] = useState(0);
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const story = STORIES[storyIdx];
  const sceneCount = story.scenes.length;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => setPlaying(entries[0]?.isIntersecting ?? false),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setScene((s) => (s + 1) % sceneCount), 4200);
    return () => window.clearInterval(id);
  }, [playing, sceneCount, storyIdx]);

  const selectStory = (i: number) => { setStoryIdx(i); setScene(0); };
  const current = story.scenes[scene];
  const checked = Math.min(scene + 1, story.checklist.length);

  return (
    <div ref={rootRef} className="tier-demos" style={{ marginTop: 40 }}>
      <div className="section-heading">
        <p className="eyebrow">SEE IT WORK</p>
        <h2>Three stories. <em>One job each, start to finish.</em></h2>
        <p>Illustrative examples — not delivered apps. Each story ends in a checkable record and an approval step, not just a chat reply. Press play, or step through the scenes yourself.</p>
      </div>
      <div className="tier-tabs" role="tablist" aria-label="Tier demos">
        {STORIES.map((s, i) => (
          <button key={s.tab} type="button" role="tab" aria-selected={i === storyIdx} className={i === storyIdx ? "tier-tab active" : "tier-tab"} onClick={() => selectStory(i)}>{s.tab}</button>
        ))}
      </div>
      <div className="tier-player">
        <div className="tier-scene">
          <p className="tier-kicker">{current.kicker}</p>
          <h3>{story.title}</h3>
          <p className="tier-subtitle">{story.subtitle}</p>
          <div className="tier-card" key={`${storyIdx}-${scene}`}>
            <strong>{current.title}</strong>
            <p>{current.caption}</p>
            <ul>{current.card.map((line) => <li key={line}>{line}</li>)}</ul>
          </div>
          <div className="tier-progress" aria-hidden="true"><span style={{ width: `${((scene + 1) / sceneCount) * 100}%` }} /></div>
          <div className="tier-controls">
            <button type="button" onClick={() => setPlaying(!playing)}>{playing ? "⏸ Pause story" : "▶ Play story"}</button>
            <button type="button" disabled={scene === 0} onClick={() => setScene(scene - 1)}>← Prev</button>
            <button type="button" disabled={scene === sceneCount - 1} onClick={() => setScene(scene + 1)}>Next →</button>
            <button type="button" onClick={() => setScene(0)}>↺ Replay</button>
          </div>
          <div className="tier-dots" aria-label="Scenes">
            {story.scenes.map((_, i) => (
              <button key={i} type="button" aria-label={`Scene ${i + 1}`} className={i === scene ? "tier-dot active" : "tier-dot"} onClick={() => setScene(i)} />
            ))}
          </div>
        </div>
        <aside className="tier-checklist">
          <p className="eyebrow">WHAT JUST LEFT YOUR PLATE</p>
          <ul>
            {story.checklist.map((item, i) => (
              <li key={item} className={i < checked ? "done" : ""}><span aria-hidden="true">{i < checked ? "✓" : "○"}</span> {item}</li>
            ))}
          </ul>
          <p><strong>{story.result}</strong></p>
        </aside>
      </div>
    </div>
  );
}
