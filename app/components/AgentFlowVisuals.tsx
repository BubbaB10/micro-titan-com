export default function AgentFlowVisuals() {
  return (
    <div style={{ marginTop: 40 }}>
      <div className="section-heading">
        <p className="eyebrow">SEE IT WORK</p>
        <h2>One job, <em>shown step by step.</em></h2>
        <p>Illustrative examples — not delivered apps. Each flow ends in a checkable record and an approval step, not just a chat reply.</p>
      </div>
      <div className="path-grid">
        <article>
          <p className="path-tag">SOLO — LEAD TO APPOINTMENT</p>
          <p>New inquiry received — 9:02 AM</p>
          <p>✓ Calendar checked — Tuesday 10:00 AM is open</p>
          <p>✓ Appointment proposed and approved by you</p>
          <p>✓ Confirmation sent — event ID on file</p>
          <p><strong>Result:</strong> Appointment booked, not just drafted.</p>
        </article>
        <article>
          <p className="path-tag">BUSINESS — JOB FLOW</p>
          <p>Job received — intake captured once</p>
          <p>✓ Routed by your rules — roll or flatbed</p>
          <p>✓ Art / proof status visible</p>
          <p>✓ Production schedule updated</p>
          <p><strong>Result:</strong> Customer update sent, no phone tag. Ready for your approval.</p>
        </article>
      </div>
    </div>
  );
}
