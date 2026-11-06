"use client";
import Link from "next/link";

/**
 * Optional SMS opt-in shown next to a phone field.
 * Unchecked by default. Not required to submit the form, and not a
 * condition of purchase. The phone field stays usable either way.
 */
export default function SmsConsentCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.45,
          color: "#f4f7fa",
        }}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
        />
        <span>
          I agree to receive text messages from Micro Titan about my inquiry, intake, and bookings.
          Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.
          See our{" "}
          <Link href="/privacy#sms" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms#sms" style={{ color: "#60a5fa", textDecoration: "underline" }}>
            Terms
          </Link>.
        </span>
      </label>
      <p style={{ fontSize: 13, color: "rgba(244,247,250,0.72)", margin: "6px 0 0" }}>
        Optional. You can enter a phone number and submit without checking this box. Agreeing to
        texts is not a condition of purchase.
      </p>
    </div>
  );
}
