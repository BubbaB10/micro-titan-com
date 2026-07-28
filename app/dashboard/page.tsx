import Link from "next/link";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

const NEEDS_YOU = [
  {
    id: "water",
    type: "HELD",
    typeColor: "#e74c3c",
    icon: '<path d="M12 4 C12 4 6 10 6 15 Q6 20 12 20 Q18 20 18 15 Q18 10 12 4 Z"/><line x1="9" y1="14" x2="15" y2="14"/>',
    title: "Water bill — unusual charge",
    detail: "Your usual $47 arrived as $127 this month. Held — does not count as handled until you review it.",
    action: "Review",
    actionHref: "#",
  },
  {
    id: "overlap",
    type: "CONFLICT",
    typeColor: "#e2a44a",
    icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    title: "Emma's soccer overlaps dentist",
    detail: "Emma's soccer practice (Tue 4:30 pm) and the dentist appointment (Tue 4:00 pm) are both on Tuesday.",
    action: "Resolve",
    actionHref: "#",
  },
];

const HANDLED = [
  {
    id: "bills",
    title: "All 4 bills paid this month",
    detail: "None missed. None paid twice. Gate-verified.",
  },
  {
    id: "appts",
    title: "2 upcoming appointments confirmed",
    detail: "Dentist (Tue) and orthodontist (Thu) on calendar.",
  },
  {
    id: "emma",
    title: "Emma's school calendar synced",
    detail: "3 new events added — pickup times updated.",
  },
  {
    id: "grocery",
    title: "Grocery delivery confirmed",
    detail: "Wed 10 am — order placed, confirmation received.",
  },
];

const TODAY = [
  { time: "9:00 am",  label: "Team call",              source: "Google Calendar" },
  { time: "2:30 pm",  label: "Emma — orthodontist",     source: "Google Calendar" },
  { time: "5:00 pm",  label: "Dinner at Rosewood",      source: "Confirmed reservation" },
];

const REMINDERS = [
  "Emma's permission slip — due Friday",
  "Car insurance renewal — 12 days",
];

export default function DashboardPage() {
  const today = "Mon, Jul 28";

  return (
    <div className="min-h-screen bg-[#0a1628] text-[#f4f7fa]">
      <Nav />

      {/* Header */}
      <section className="pt-28 pb-8 px-4 border-b border-[rgba(168,216,240,0.08)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-[#4fb8e8] mb-2">{today}</p>
            <h1
              className="text-3xl sm:text-4xl font-[300] text-[#f4f7fa] leading-tight"
              style={{ fontFamily: "var(--font-mulish)" }}
            >
              Good morning. Here&apos;s your day.
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-[#46cf93]/08 border border-[#46cf93]/20 rounded-xl px-4 py-2.5 flex-shrink-0">
            <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
              <circle cx="10" cy="10" r="9" stroke="#46cf93" strokeWidth="1.5" />
              <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-xs font-semibold text-[#46cf93]">Every item below is gate-verified</p>
          </div>
        </div>
      </section>

      <div className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left column: Needs you + Handled */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Needs you */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#e2a44a]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#e2a44a]">Needs you</h2>
                  <span className="text-xs font-semibold text-[#e2a44a] bg-[#e2a44a]/10 border border-[#e2a44a]/20 px-2 py-0.5 rounded-full">
                    {NEEDS_YOU.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {NEEDS_YOU.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#12243d] border rounded-xl p-5"
                      style={{ borderColor: `${item.typeColor}30` }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            backgroundColor: `${item.typeColor}12`,
                            border: `1px solid ${item.typeColor}30`,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: `<svg viewBox="0 0 24 24" fill="none" stroke="${item.typeColor}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">${item.icon}</svg>`,
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span
                              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${item.typeColor}15`,
                                color: item.typeColor,
                                border: `1px solid ${item.typeColor}30`,
                              }}
                            >
                              {item.type}
                            </span>
                            <p className="text-sm font-semibold text-[#f4f7fa]">{item.title}</p>
                          </div>
                          <p className="text-xs text-[#a8d8f0]/70 leading-relaxed mb-3">{item.detail}</p>
                          <a
                            href={item.actionHref}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{
                              backgroundColor: `${item.typeColor}10`,
                              border: `1px solid ${item.typeColor}25`,
                              color: item.typeColor,
                            }}
                          >
                            {item.action} →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Handled & verified */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#46cf93]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#46cf93]">Handled &amp; verified</h2>
                  <span className="text-xs font-semibold text-[#46cf93] bg-[#46cf93]/10 border border-[#46cf93]/20 px-2 py-0.5 rounded-full">
                    {HANDLED.length}
                  </span>
                </div>
                <div className="bg-[#12243d] border border-[rgba(168,216,240,0.08)] rounded-xl divide-y divide-[rgba(168,216,240,0.06)]">
                  {HANDLED.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 px-5 py-4">
                      <svg viewBox="0 0 20 20" fill="none" width="18" height="18" className="flex-shrink-0 mt-0.5">
                        <circle cx="10" cy="10" r="9" stroke="#46cf93" strokeWidth="1.5" />
                        <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="#46cf93" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-[#f4f7fa]">{item.title}</p>
                        <p className="text-xs text-[#a8d8f0]/50 mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column: Today + Money */}
            <div className="flex flex-col gap-6">

              {/* Today */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#818cf8]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#818cf8]">Today</h2>
                </div>
                <div className="bg-[#12243d] border border-[rgba(168,216,240,0.08)] rounded-xl p-5 flex flex-col gap-4">
                  {TODAY.map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <span className="text-xs font-mono text-[#a8d8f0]/40 w-14 flex-shrink-0 pt-0.5">{item.time}</span>
                      <div>
                        <p className="text-sm text-[#f4f7fa]">{item.label}</p>
                        <p className="text-[10px] text-[#a8d8f0]/35 mt-0.5">{item.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders */}
              <div className="bg-[#0f1f38] border border-[#818cf8]/15 rounded-xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#818cf8] mb-3">Reminders</p>
                <div className="flex flex-col gap-2.5">
                  {REMINDERS.map((r) => (
                    <div key={r} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] mt-1.5 flex-shrink-0" />
                      <p className="text-xs text-[#a8d8f0] leading-relaxed">{r}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Money strip */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#4fb8e8]" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#4fb8e8]">This month</h2>
                </div>
                <div className="bg-[#12243d] border border-[rgba(168,216,240,0.08)] rounded-xl p-5">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      { label: "Income",   value: "$6,200",  color: "#46cf93" },
                      { label: "Bills",    value: "$1,847",  color: "#f4f7fa" },
                      { label: "Net",      value: "+$4,353", color: "#46cf93" },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-sm font-bold" style={{ color: m.color }}>{m.value}</p>
                        <p className="text-[10px] text-[#a8d8f0]/40 mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[rgba(168,216,240,0.08)] pt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: "Bills paid",  val: "4 / 4" },
                      { label: "Missed",      val: "0" },
                      { label: "Duplicates",  val: "0" },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="text-sm font-semibold text-[#f4f7fa]">{s.val}</p>
                        <p className="text-[10px] text-[#a8d8f0]/35 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gate stamp footer */}
          <div className="mt-10 pt-8 border-t border-[rgba(168,216,240,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7z" stroke="#46cf93" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="#46cf93" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-xs text-[#a8d8f0]/50 leading-relaxed">
                Every item above is gate-verified. Aver does not claim&nbsp;done unless it can prove it.
              </p>
            </div>
            <Link
              href="/why-provable"
              className="text-xs text-[#a8d8f0]/40 hover:text-[#a8d8f0] transition-colors flex-shrink-0"
            >
              How the gate works →
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
