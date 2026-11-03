"use client";
import { useMemo, useState } from "react";

type Lane = "Family" | "Solo entrepreneur" | "Business";

const LANES: Lane[] = ["Family", "Solo entrepreneur", "Business"];

// Display totals only. The totals in the sent email are derived server-side
// from the lane in app/api/agreement/route.ts — the client never supplies
// totals, so a tampered form cannot misstate what was accepted.
const LANE_TOTALS: Record<Lane, { discovery: number; total: number; afterCredit: number; monthly: number }> = {
  Family: { discovery: 150, total: 1650, afterCredit: 1500, monthly: 95 },
  "Solo entrepreneur": { discovery: 500, total: 5500, afterCredit: 5000, monthly: 350 },
  Business: { discovery: 1000, total: 10000, afterCredit: 9000, monthly: 950 },
};

function money(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

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

export default function AgreementForm() {
  const [step, setStep] = useState(1);
  const [reference, setReference] = useState("");
  const [name, setName] = useState("");
  const [lane, setLane] = useState<Lane | "">("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [signature, setSignature] = useState("");
  const [readTerms, setReadTerms] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [serverReference, setServerReference] = useState("");

  function validateEssentials() {
    const missing: string[] = [];
    if (!reference.trim()) missing.push("Intake reference");
    if (!name.trim()) missing.push("Client name");
    if (!lane) missing.push("Lane");
    if (!date.trim()) missing.push("Date");
    if (!readTerms) missing.push("Confirmation that you have read the Micro Titan Scope and Terms");
    setErrors(missing);
    return missing.length === 0;
  }

  const totals = lane ? LANE_TOTALS[lane] : null;

  const summary = useMemo(() => {
    const lines: string[] = [
      "I have read and accept the Micro Titan Scope & Terms — Agent Setup for the lane below.",
      "",
      `Intake reference: ${reference}`,
      `Client name: ${name}`,
      `Lane: ${lane || "(not provided)"}`,
      `Date: ${date}`,
    ];
    if (totals) {
      lines.push(
        `Discovery fee (credited): ${money(totals.discovery)}`,
        `Program total: ${money(totals.total)}`,
        `Total after credit: ${money(totals.afterCredit)}`,
        `Monthly (optional): ${money(totals.monthly)}/mo`,
      );
    }
    if (signature.trim()) {
      lines.push("", `Typed signature/acceptance text (typed text, not a legal e-signature): ${signature.trim()}`);
    }
    lines.push(
      "",
      "This is not claimed as a legal e-signature. Nothing typed on this page is saved by the page itself.",
    );
    return lines.join("\n");
  }, [reference, name, lane, date, totals, signature]);

  const mailto = `mailto:hello@micro-titan.com?subject=${encodeURIComponent(
    `Agreement accepted — ${reference}`,
  )}&body=${encodeURIComponent(summary)}`;

  async function submitAcceptance() {
    setServerError("");
    setSubmitState("sending");
    try {
      const res = await fetch("/api/agreement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          name,
          lane,
          date,
          signature,
          readTerms,
          website,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const detail =
          data?.errors && typeof data.errors === "object"
            ? Object.values(data.errors as Record<string, string>).join(" ")
            : data?.message || "The acceptance could not be sent just now.";
        setServerError(detail);
        setSubmitState("error");
        return;
      }
      setServerReference(data.reference || reference);
      setSubmitState("sent");
    } catch {
      setServerError(
        "The acceptance could not be sent just now. Use the email fallback below — it opens your email app with everything pre-filled.",
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
        MICRO TITAN SCOPE &amp; TERMS — ACCEPTANCE
      </p>
      <h1 style={{ fontSize: 32, lineHeight: 1.15, margin: "8px 0" }}>
        Accept the Scope &amp; Terms.
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.5, color: "#333" }}>
        Use this page to accept the Micro Titan Scope &amp; Terms for your
        lane. One tap sends your acceptance directly to Micro Titan. If the
        direct send fails, the email fallback below opens your email app with
        everything pre-filled.
      </p>
      <div
        style={{
          border: "2px solid #4f46e5",
          borderRadius: 10,
          padding: 16,
          background: "#eef2ff",
        }}
      >
        <strong>Before you accept — read the Scope &amp; Terms first.</strong>
        <p style={{ fontSize: 15, lineHeight: 1.5, margin: "8px 0 0" }}>
          The full document is the <strong>Micro Titan Scope and Terms</strong>{" "}
          page sent to you with your intake. This page does not re-host its
          full text — please read that document before accepting. If you do
          not have it,{" "}
          <a href="mailto:hello@micro-titan.com?subject=Please%20send%20the%20Micro%20Titan%20Scope%20and%20Terms">
            email Micro Titan at hello@micro-titan.com
          </a>{" "}
          and ask for it before you accept.
        </p>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.5, color: "#333" }}>
        This is not claimed as a legal e-signature. Acceptance is captured by
        the email this page sends, plus a row in the Micro Titan CRM
        Agreements tab, logged on receipt. Nothing typed on this page is saved
        by the page itself.
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
            <label style={labelStyle}>Client name *</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
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
                  <span style={{ display: "block", fontSize: 14, color: "#555", marginTop: 4 }}>
                    Discovery {money(LANE_TOTALS[l].discovery)} credited · Total{" "}
                    {money(LANE_TOTALS[l].total)} · {money(LANE_TOTALS[l].afterCredit)} after credit ·{" "}
                    {money(LANE_TOTALS[l].monthly)}/mo optional
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Date *</label>
            <input
              style={inputStyle}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>
              Sign or type your name to accept (optional)
            </label>
            <input
              style={inputStyle}
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              autoComplete="off"
            />
            <p style={{ fontSize: 13, color: "#555" }}>
              Typed text only. This is not a legal e-signature.
            </p>
          </div>
          <label style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={readTerms}
              onChange={(e) => setReadTerms(e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2 }}
            />
            <span>
              I have read the Micro Titan Scope and Terms. *
            </span>
          </label>
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
            Review what I&apos;m accepting
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>
            This is exactly what you are accepting — nothing added. The totals
            below are the approved totals for your lane.
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
          {submitState === "sent" ? (
            <div style={{ border: "2px solid #15803d", borderRadius: 10, padding: 16, background: "#f0fdf4" }}>
              <strong>Acceptance sent.</strong>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: "8px 0 0" }}>
                Your intake reference is <strong>{serverReference}</strong>. Micro Titan has
                received your acceptance at hello@micro-titan.com. This is not claimed as a legal
                e-signature.
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={submitAcceptance}
                disabled={submitState === "sending"}
                style={{
                  padding: 14,
                  fontSize: 17,
                  borderRadius: 10,
                  border: "none",
                  background: submitState === "sending" ? "#ccc" : "#4f46e5",
                  color: "#fff",
                  cursor: submitState === "sending" ? "default" : "pointer",
                }}
              >
                {submitState === "sending" ? "Sending…" : "Accept & send"}
              </button>
              <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
                One tap sends your acceptance directly to Micro Titan. No second send in your email
                app is needed.
              </p>
              {submitState === "error" && serverError && (
                <div style={{ border: "2px solid #b91c1c", borderRadius: 10, padding: 14, background: "#fef2f2" }}>
                  <strong>Could not send directly:</strong> {serverError}
                </div>
              )}
              <a
                href={mailto}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: 14,
                  fontSize: 16,
                  borderRadius: 10,
                  border: "1px solid #ccc",
                  background: "#fff",
                  color: "#111",
                  textDecoration: "none",
                }}
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
