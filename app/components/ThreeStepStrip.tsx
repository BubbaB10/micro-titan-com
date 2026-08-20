// Three-step "how it works" strip — faithful product frames, demo data only.
// Thread: The Bills · The Kids' Schedule · Appointments across all three frames.

const STEPS = [
  {
    n: "01",
    title: "Talk once",
    caption: "Tell your agent what matters. One conversation builds the picture.",
    frame: <IntakeFrame />,
  },
  {
    n: "02",
    title: "It runs the small stuff",
    caption: "Scheduling, replies, reminders, receipts — handled silently while you focus.",
    frame: <TelegramFrame />,
  },
  {
    n: "03",
    title: "You see everything",
    caption: "One cockpit screen shows everything your agent touched, proved, or needs you for.",
    frame: <CockpitFrame />,
  },
] as const;

function IntakeFrame() {
  return (
    <div
      data-step-frame="1"
      style={{
        background: "hsl(35 30% 95%)",
        height: "100%",
        padding: "14px 12px",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Eyebrow */}
      <p
        style={{
          textAlign: "center",
          fontSize: "8px",
          fontWeight: 700,
          letterSpacing: "0.22em",
          color: "hsl(25 40% 55%)",
          marginBottom: "4px",
        }}
      >
        VALET™
      </p>

      {/* User bubble */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            background: "hsl(25 35% 80%)",
            borderRadius: "12px 12px 3px 12px",
            padding: "8px 10px",
            maxWidth: "88%",
          }}
        >
          <p style={{ fontSize: "10.5px", color: "hsl(25 20% 25%)", lineHeight: 1.4, margin: 0 }}>
            I want to stay on top of The Bills, the kids&apos; schedule, and appointments that need prep.
          </p>
        </div>
      </div>

      {/* Agent bubble */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <div
          style={{
            background: "hsl(25 15% 88%)",
            borderRadius: "12px 12px 12px 3px",
            padding: "8px 10px",
            maxWidth: "88%",
          }}
        >
          <p style={{ fontSize: "10.5px", color: "hsl(25 20% 38%)", lineHeight: 1.4, margin: 0 }}>
            Good place to start. What does &ldquo;The Bills&rdquo; look like in your house — one pile, or a few different accounts?
          </p>
        </div>
      </div>

      {/* Typing indicator */}
      <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: "4px", gap: "3px", alignItems: "center", marginTop: "2px" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "hsl(25 20% 65%)",
              opacity: 0.6,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function TelegramFrame() {
  return (
    <div
      data-step-frame="2"
      style={{
        background: "#17212b",
        height: "100%",
        padding: "12px",
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Telegram header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: "10px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            background: "#2b5278",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>G</span>
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: "12px", fontWeight: 600, margin: 0, lineHeight: 1.2 }}>Greg</p>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px", margin: 0 }}>your agent · online</p>
        </div>
      </div>

      {/* User message */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            background: "#2b5278",
            borderRadius: "12px 12px 3px 12px",
            padding: "7px 10px",
            maxWidth: "86%",
          }}
        >
          <p style={{ color: "#fff", fontSize: "10.5px", lineHeight: 1.4, margin: 0 }}>
            Remind me about the bills on the 1st of every month
          </p>
        </div>
      </div>

      {/* Agent message */}
      <div style={{ display: "flex", justifyContent: "flex-start" }}>
        <div
          style={{
            background: "#182533",
            borderRadius: "12px 12px 12px 3px",
            padding: "7px 10px",
            maxWidth: "86%",
          }}
        >
          <p style={{ color: "#e8edf2", fontSize: "10.5px", lineHeight: 1.4, margin: 0 }}>
            Done — The Bills flagged monthly, 1st of every month. Already watching the kids&apos; schedule and flagging appointments that need prep. Anything else?
          </p>
        </div>
      </div>
    </div>
  );
}

function CockpitFrame() {
  const tiles = [
    { label: "The Bills", sub: "paid on time" },
    { label: "The Kids’ Schedule", sub: "2 this week, covered" },
    { label: "Appointments", sub: "0 need prep" },
  ];

  return (
    <div
      data-step-frame="3"
      style={{
        background: "#071628",
        height: "100%",
        padding: "14px 12px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* Verdict header */}
      <div
        style={{
          background: "#0a1e33",
          border: "1px solid rgba(12,163,12,0.3)",
          borderRadius: "10px",
          padding: "8px 10px",
          display: "flex",
          alignItems: "center",
          gap: "7px",
        }}
      >
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#0ca30c",
            boxShadow: "0 0 8px rgba(12,163,12,0.65)",
            flexShrink: 0,
          }}
        />
        <div>
          <p
            style={{
              color: "#0ca30c",
              fontSize: "11px",
              fontWeight: 800,
              margin: 0,
              letterSpacing: "0.06em",
              fontFamily: "system-ui",
            }}
          >
            ALL CLEAR
          </p>
          <p style={{ color: "rgba(168,216,240,0.3)", fontSize: "9px", margin: 0 }}>0 need you</p>
        </div>
      </div>

      {/* Domain tiles */}
      {tiles.map(({ label, sub }) => (
        <div
          key={label}
          style={{
            background: "#0a1e33",
            border: "1px solid rgba(12,163,12,0.18)",
            borderRadius: "8px",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#0ca30c",
              flexShrink: 0,
            }}
          />
          <div>
            <p style={{ color: "#a8d8f0", fontSize: "10.5px", fontWeight: 600, margin: 0, lineHeight: 1.2 }}>
              {label}
            </p>
            <p style={{ color: "rgba(168,216,240,0.35)", fontSize: "9px", margin: 0 }}>{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ThreeStepStrip() {
  return (
    <section className="px-4 py-14 border-t border-[rgba(168,216,240,0.08)] bg-[#06101f]">
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
          {STEPS.map(({ n, title, caption, frame }) => (
            <div key={n} className="flex flex-col gap-4">
              {/* Device frame */}
              <div
                className="w-full overflow-hidden rounded-2xl"
                style={{
                  height: "220px",
                  border: "1px solid rgba(168,216,240,0.1)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                }}
                aria-label={`Step ${n}: ${title}`}
              >
                {frame}
              </div>

              {/* Caption */}
              <div>
                <p className="text-[10px] font-semibold tracking-[0.28em] text-[#4fb8e8]/40 uppercase mb-2">
                  {n}
                </p>
                <p
                  className="text-base font-semibold text-[#f4f7fa] mb-2"
                  style={{ fontFamily: "var(--font-mulish)" }}
                >
                  {title}
                </p>
                <p className="text-sm text-[#a8d8f0]/55 leading-relaxed">{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
