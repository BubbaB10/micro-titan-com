"use client";
import { useMemo, useState } from "react";

type Lane = "Family" | "Solo entrepreneur" | "Business";

const LANES: Lane[] = ["Family", "Solo entrepreneur", "Business"];

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

export default function BookDiscoveryForm() {
  const [step, setStep] = useState(1);
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lane, setLane] = useState<Lane | "">("");
  const [preferred, setPreferred] = useState<string[]>(["", "", ""]);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  function validateEssentials() {
    const missing: string[] = [];
    if (!reference.trim()) missing.push("Intake reference");
    if (!name.trim()) missing.push("Full name");
    if (!email.trim() && !phone.trim())
      missing.push("Email or phone");
    if (!lane) missing.push("Lane");
    if (!preferred[0].trim())
      missing.push("Preferred date/time 1");
    setErrors(missing);
    return missing.length === 0;
  }

  const summary = useMemo(() => {
    const lines: string[] = [
      `Discovery booking request — ${reference}`,
      "",
      `Intake reference: ${reference}`,
      `Name: ${name}`,
      `Email: ${email || "(not provided)"}`,
      `Phone: ${phone || "(not provided)"}`,
      `Lane: ${lane || "(not provided)"}`,
      "",
      "Preferred date/times (America/Chicago) — preferences only, not confirmed availability:",
      `1: ${preferred[0] || "(left blank)"}`,
      `2: ${preferred[1] || "(left blank)"}`,
      `3: ${preferred[2] || "(left blank)"}`,
    ];
    return lines.join("\n");
  }, [reference, name, email, phone, lane, preferred]);

  const mailto = `mailto:hello@micro-titan.com?subject=${encodeURIComponent(
    `Discovery booking request — ${reference}`,
  )}&body=${encodeURIComponent(summary)}`;

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

  return (
    <div
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "24px 16px 48px",
        boxSizing: "border-box",
      }}
    >
      <p
        style={{
          fontSize: 13,
          letterSpacing: 2,
          fontWeight: 700,
          color: "#555",
        }}
      >
        MICRO TITAN DISCOVERY BOOKING
      </p>
      <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: "8px 0" }}>
        Book discovery.
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.5, color: "#333" }}>
        Send Micro Titan your preferred times for a discovery session. These
        are preferences only — they are not confirmed availability, and this
        page does not book a calendar slot.
      </p>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: "#333" }}>
        Nothing is sent until you press send in your own email app. There is
        no server-side sending, no backend, and no calendar booking made by
        this page.
      </p>

      {step === 1 && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          {errors.length > 0 && (
            <div
              style={{
                border: "2px solid #b91c1c",
                borderRadius: 10,
                padding: 14,
                background: "#fef2f2",
              }}
            >
              <strong>
                Please fill in the essentials before continuing:
              </strong>
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {errors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label style={labelStyle}>Intake reference *</label>
            <input
              style={inputStyle}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              autoComplete="off"
            />
            <p style={{ fontSize: 13, color: "#555" }}>
              The reference from your intake, for example MT-20261102-AB12.
            </p>
          </div>
          <div>
            <label style={labelStyle}>Full name *</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
            <p style={{ fontSize: 13, color: "#555" }}>
              Email or phone — at least one is required.
            </p>
          </div>
          <div>
            <label style={labelStyle}>Lane *</label>
            <div style={{ display: "grid", gap: 12, marginTop: 6 }}>
              {LANES.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLane(l)}
                  style={{
                    textAlign: "left",
                    padding: 16,
                    fontSize: 17,
                    borderRadius: 10,
                    border:
                      lane === l ? "2px solid #4f46e5" : "1px solid #ccc",
                    background: lane === l ? "#eef2ff" : "#fff",
                    cursor: "pointer",
                    color: "#111",
                  }}
                >
                  <strong>{l}</strong>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>
              Preferred date/times (America/Chicago) *
            </label>
            <p style={{ fontSize: 13, color: "#555", margin: "4px 0 0" }}>
              Times are in America/Chicago. These are your preferences only —
              not confirmed availability. Give up to 3 options; the first one
              is required.
            </p>
            {preferred.map((value, i) => (
              <div key={i} style={{ marginTop: 12 }}>
                <label style={labelStyle}>
                  Preferred date/time {i + 1}
                  {i === 0 ? " *" : " (optional)"}
                </label>
                <input
                  style={inputStyle}
                  value={value}
                  onChange={(e) =>
                    setPreferred(
                      preferred.map((p, j) => (j === i ? e.target.value : p)),
                    )
                  }
                  placeholder="e.g. Tuesday, November 10 at 10:00 AM"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (validateEssentials()) setStep(2);
            }}
            style={{
              padding: 14,
              fontSize: 17,
              borderRadius: 10,
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Review
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>
            This is exactly what will be sent — nothing added. Your preferred
            times are preferences in America/Chicago, not confirmed
            availability.
          </p>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontSize: 14,
              lineHeight: 1.5,
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 16,
              background: "#fff",
              margin: 0,
            }}
          >
            {summary}
          </pre>
          <a
            href={mailto}
            style={{
              display: "block",
              textAlign: "center",
              padding: 14,
              fontSize: 17,
              borderRadius: 10,
              background: "#4f46e5",
              color: "#fff",
              textDecoration: "none",
            }}
          >
            Send booking request by email
          </a>
          <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
            This opens your email app with everything pre-filled, addressed
            to hello@micro-titan.com. Nothing is sent until you press send in
            your own email app. No server-side sending, no backend, and no
            calendar booking is made by this page.
          </p>
          <button
            type="button"
            onClick={copySummary}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            {copied ? "Copied" : "Copy summary"}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{
              padding: 14,
              fontSize: 16,
              borderRadius: 10,
              border: "1px solid #ccc",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Back to form
          </button>
        </div>
      )}
    </div>
  );
}
