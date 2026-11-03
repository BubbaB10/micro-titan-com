/* Dark navy "One job, start to finish" band from the approved vision look.
   Content only — no prices, no new claims, no invented names. */
const steps = [
  { n: "1", title: "Inbox", text: "A message arrives — a request, a job, a question." },
  { n: "2", title: "Calendar", text: "The calendar is checked and a real slot is found." },
  { n: "3", title: "Ready for your OK", text: "Nothing is sent or booked until you approve it." },
  { n: "4", title: "Confirmation & record", text: "Confirmation sent, with a checkable record on file." },
];

export default function VisionFlowBand() {
  return (
    <div className="vision-flow-band">
      <p className="eyebrow">ONE JOB, START TO FINISH</p>
      <h2>Four steps. <em>An agent that&apos;s yours.</em></h2>
      <div className="vision-flow-steps">
        {steps.map((s) => (
          <article key={s.n}>
            <span>{s.n}</span>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
