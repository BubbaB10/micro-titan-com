"use client";
import { useMemo, useState } from "react";

type Lane = "Family" | "Solo entrepreneur" | "Business";
type Pricing = {
  discovery: string;
  setup: string;
  first: string;
  total: string;
  afterCredit: string;
  monthly: string;
};

const PRICING: Record<Lane, Pricing> = {
  Family: {
    discovery: "$150",
    setup: "$750",
    first: "$750",
    total: "$1,650",
    afterCredit: "$1,500",
    monthly: "$95/month",
  },
  "Solo entrepreneur": {
    discovery: "$500",
    setup: "$1,500",
    first: "$3,500",
    total: "$5,500",
    afterCredit: "$5,000",
    monthly: "$350/month",
  },
  Business: {
    discovery: "$1,000",
    setup: "$2,500",
    first: "$6,500",
    total: "$10,000",
    afterCredit: "$9,000",
    monthly: "$950/month",
  },
};

const FIRST_LABEL: Record<Lane, string> = {
  Family: "First household project",
  "Solo entrepreneur": "First workflow",
  Business: "First job-flow project",
};

const AGENTS = [
  "Muse by Meta",
  "Grok Bot by Grok",
  "Claude by Anthropic",
  "Gemini by Google",
  "Help me choose in discovery",
];

const QUESTIONS: Record<Lane, string[]> = {
  Family: [
    "What household jobs eat up your evenings or weekends right now?",
    "How do you handle bills, appointments, and school or family dates today?",
    "What calendar, inbox, or apps do you already use?",
    "Is there a trip, move, or property task coming up we should know about?",
    "What should an agent never do without your approval first?",
    "Anything else we should know before discovery?",
  ],
  "Solo entrepreneur": [
    "Where do your leads come from today?",
    "What happens to a lead between first contact and booking?",
    "How do you handle your inbox and calendar today?",
    "What bookkeeping or receipts work takes up your time?",
    "Would a morning brief help, and what would it need to cover?",
    "What should an agent never do without your approval first?",
  ],
  Business: [
    "How does a job get taken in today, from first contact to the shop floor?",
    "How do you decide how a job is routed or scheduled?",
    "How is art or proof approval handled with the customer today?",
    "How do you keep the production schedule and the customer updated?",
    "What would a daily brief need to cover for you?",
    "What should an agent never do without your approval first?",
  ],
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  marginTop: 6,
  fontSize: 16,
  border: "1px solid #ccc",
  borderRadius: 8,
  boxSizing: "border-box",
  background: "#fff",
  color: "#111",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 15,
  fontWeight: 600,
  marginBottom: 4,
};

export default function IntakeForm() {
  const [step, setStep] = useState(1);
  const [lane, setLane] = useState<Lane | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agent, setAgent] = useState(AGENTS[0]);
  const [plate, setPlate] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [reference, setReference] = useState("");
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverReference, setServerReference] = useState("");
  const [serverError, setServerError] = useState("");

  const pricing = lane ? PRICING[lane] : null;

  function makeReference() {
    const d = new Date();
    const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate(),
    ).padStart(2, "0")}`;
    const code = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MT-${date}-${code}`;
  }

  function goToReview() {
    if (!reference) setReference(makeReference());
    setStep(4);
  }

  function validateEssentials() {
    const missing: string[] = [];
    if (!name.trim()) missing.push("Full name");
    if (!email.trim() && !phone.trim()) missing.push("Email or phone");
    if (!plate.trim()) missing.push("What you most want taken off your plate");
    setErrors(missing);
    return missing.length === 0;
  }

  const summary = useMemo(() => {
    if (!lane) return "";
    const lines: string[] = [
      `Micro Titan intake — ${lane}`,
      `Reference: ${reference}`,
      "",
      `Name: ${name}`,
      `Email: ${email || "(not provided)"}`,
      `Phone: ${phone || "(not provided)"}`,
      `Agent preference: ${agent}`,
      "",
      `What they most want taken off their plate:`,
      plate,
      "",
      "Discovery answers (verbatim, as typed):",
    ];
    QUESTIONS[lane].forEach((q, i) => {
      lines.push("", `Q: ${q}`, `A: ${answers[`${lane}-${i}`] || "(left blank)"}`);
    });
    if (pricing) {
      lines.push(
        "",
        "PRICING — " + lane,
        `Discovery fee: ${pricing.discovery} (credited toward the program total)`,
        `Setup: ${pricing.setup}`,
        `${FIRST_LABEL[lane]}: ${pricing.first}`,
        `Program total: ${pricing.total} / ${pricing.afterCredit} after discovery credit`,
        `Optional monthly plan: ${pricing.monthly} (optional, not part of the total)`,
        "",
        "Notes: The discovery fee is credited toward the program total. The monthly plan is optional. Filling out this intake charges nothing — sending it starts the process, it does not charge you.",
      );
    }
    return lines.join("\n");
  }, [lane, reference, name, email, phone, agent, plate, answers, pricing]);

  const mailto = `mailto:hello@micro-titan.com?subject=${encodeURIComponent(
    `Micro Titan intake — ${lane} — ${reference}`,
  )}&body=${encodeURIComponent(summary)}`;

  async function submitIntake() {
    if (!lane || !pricing) return;
    setServerError("");
    setSubmitState("sending");
    const payloadAnswers = QUESTIONS[lane].map((q, i) => ({
      question: q,
      answer: answers[`${lane}-${i}`] || "",
    }));
    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lane,
          name,
          email,
          phone,
          agent,
          plate,
          answers: payloadAnswers,
          reference,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const detail =
          data?.errors && typeof data.errors === "object"
            ? Object.values(data.errors as Record<string, string>).join(" ")
            : data?.message || "The intake could not be sent just now.";
        setServerError(detail);
        setSubmitState("error");
        return;
      }
      setServerReference(data.reference || reference);
      setSubmitState("sent");
    } catch {
      setServerError(
        "The intake could not be sent just now. Use the email fallback below — it opens your email app with everything pre-filled.",
      );
      setSubmitState("error");
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = summary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
  }

  const progress = `${step} of 4`;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px 48px", boxSizing: "border-box" }}>
      <p style={{ fontSize: 13, letterSpacing: 2, fontWeight: 700, color: "#555" }}>
        MICRO TITAN INTAKE
      </p>
      <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: "8px 0" }}>
        Start your intake.
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.5, color: "#333" }}>
        Pick your lane, answer the essentials, and send it to Micro Titan. Filling this out
        charges nothing — sending it starts the process.
      </p>
      <p style={{ fontSize: 14, color: "#555" }}>
        Step {progress} — {step === 1 ? "Pick your lane" : step === 2 ? "Essentials" : step === 3 ? "Discovery questions" : "Review and send"}
      </p>
      <div style={{ height: 8, background: "#e5e5e5", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${step * 25}%`, height: "100%", background: "#4f46e5" }} />
      </div>

      {step === 1 && (
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {(["Family", "Solo entrepreneur", "Business"] as Lane[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLane(l)}
              style={{
                textAlign: "left",
                padding: 16,
                fontSize: 17,
                borderRadius: 10,
                border: lane === l ? "2px solid #4f46e5" : "1px solid #ccc",
                background: lane === l ? "#eef2ff" : "#fff",
                cursor: "pointer",
                color: "#111",
              }}
            >
              <strong>{l}</strong>
              <span style={{ display: "block", fontSize: 14, color: "#555", marginTop: 4 }}>
                {l === "Family" && "For your household — calendar, bills, appointments, and home."}
                {l === "Solo entrepreneur" && "For a one-person business — leads, inbox, calendar, bookkeeping."}
                {l === "Business" && "For a business team — job intake, routing, proof, scheduling, updates."}
              </span>
            </button>
          ))}
          {pricing && lane && (
            <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, background: "#fafafa" }}>
              <strong>{lane} pricing</strong>
              <p style={{ fontSize: 15, lineHeight: 1.6, margin: "8px 0 0" }}>
                Discovery: {pricing.discovery} (credited)<br />
                Setup: {pricing.setup}<br />
                {FIRST_LABEL[lane]}: {pricing.first}<br />
                <strong>Total: {pricing.total} / {pricing.afterCredit} after credit</strong><br />
                Optional monthly: {pricing.monthly}
              </p>
              <p style={{ fontSize: 13, color: "#555" }}>
                Discovery is credited toward the program total. The monthly plan is optional.
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={!lane}
            onClick={() => setStep(2)}
            style={{ padding: 14, fontSize: 17, borderRadius: 10, border: "none", background: lane ? "#4f46e5" : "#ccc", color: "#fff", cursor: lane ? "pointer" : "default" }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {errors.length > 0 && (
            <div style={{ border: "2px solid #b91c1c", borderRadius: 10, padding: 14, background: "#fef2f2" }}>
              <strong>Please fill in the essentials before continuing:</strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label style={labelStyle}>Full name *</label>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
            <p style={{ fontSize: 13, color: "#555" }}>Email or phone — at least one is required.</p>
          </div>
          <div>
            <label style={labelStyle}>Agent preference</label>
            <select style={inputStyle} value={agent} onChange={(e) => setAgent(e.target.value)}>
              {AGENTS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>What do you most want taken off your plate? *</label>
            <textarea style={inputStyle} rows={4} value={plate} onChange={(e) => setPlate(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: 14, fontSize: 16, borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateEssentials()) setStep(3);
              }}
              style={{ flex: 1, padding: 14, fontSize: 16, borderRadius: 10, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer" }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && lane && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <p style={{ fontSize: 14, color: "#555" }}>
            All of these are optional. Answer in your own words, or leave blank.
          </p>
          {QUESTIONS[lane].map((q, i) => (
            <div key={i}>
              <label style={labelStyle}>{q}</label>
              <textarea
                style={inputStyle}
                rows={3}
                value={answers[`${lane}-${i}`] || ""}
                onChange={(e) => setAnswers({ ...answers, [`${lane}-${i}`]: e.target.value })}
              />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: 14, fontSize: 16, borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
              Back
            </button>
            <button type="button" onClick={goToReview} style={{ flex: 1, padding: 14, fontSize: 16, borderRadius: 10, border: "none", background: "#4f46e5", color: "#fff", cursor: "pointer" }}>
              Review
            </button>
          </div>
        </div>
      )}

      {step === 4 && lane && pricing && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>
            Your intake reference is <strong>{reference}</strong>. This is exactly what will be
            sent, plus your lane pricing — nothing added.
          </p>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 16, background: "#fafafa" }}>
            <strong>{lane} pricing</strong>
            <p style={{ fontSize: 15, lineHeight: 1.6, margin: "8px 0 0" }}>
              Discovery: {pricing.discovery} (credited)<br />
              Setup: {pricing.setup}<br />
              {FIRST_LABEL[lane]}: {pricing.first}<br />
              <strong>Total: {pricing.total} / {pricing.afterCredit} after credit</strong><br />
              Optional monthly: {pricing.monthly}
            </p>
            <p style={{ fontSize: 13, color: "#555" }}>
              Discovery is credited toward the program total. The monthly plan is optional, not
              part of the total. Filling out this intake charges nothing.
            </p>
          </div>
          <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 14, lineHeight: 1.5, border: "1px solid #ddd", borderRadius: 10, padding: 16, background: "#fff", margin: 0 }}>
            {summary}
          </pre>
          {submitState === "sent" ? (
            <div style={{ border: "2px solid #15803d", borderRadius: 10, padding: 16, background: "#f0fdf4" }}>
              <strong>Intake sent.</strong>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "8px 0 0" }}>
                Your intake reference is <strong>{serverReference}</strong>. Micro Titan has
                received it at hello@micro-titan.com. Filling this out charges nothing — sending
                it starts the process.
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={submitIntake}
                disabled={submitState === "sending"}
                style={{ padding: 14, fontSize: 17, borderRadius: 10, border: "none", background: submitState === "sending" ? "#ccc" : "#4f46e5", color: "#fff", cursor: submitState === "sending" ? "default" : "pointer" }}
              >
                {submitState === "sending" ? "Sending…" : "Send intake"}
              </button>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                One tap sends your intake directly to Micro Titan. No second send in your email
                app is needed.
              </p>
              {submitState === "error" && serverError && (
                <div style={{ border: "2px solid #b91c1c", borderRadius: 10, padding: 14, background: "#fef2f2" }}>
                  <strong>Could not send directly:</strong> {serverError}
                </div>
              )}
              <a
                href={mailto}
                style={{ display: "block", textAlign: "center", padding: 14, fontSize: 16, borderRadius: 10, border: "1px solid #ccc", background: "#fff", color: "#111", textDecoration: "none" }}
              >
                Send by email instead (fallback)
              </a>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                Fallback only, if the direct send fails: this opens your email app with everything
                pre-filled, addressed to hello@micro-titan.com. Nothing is sent until you press
                send in your own email app.
              </p>
            </>
          )}
          <label style={{ position: "absolute", left: "-9999px", top: "auto", width: 1, height: 1, overflow: "hidden" }} aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>
          <button type="button" onClick={copySummary} style={{ padding: 14, fontSize: 16, borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button type="button" onClick={() => setStep(3)} style={{ padding: 14, fontSize: 16, borderRadius: 10, border: "1px solid #ccc", background: "#fff", cursor: "pointer" }}>
            Back to questions
          </button>
        </div>
      )}
    </div>
  );
}
