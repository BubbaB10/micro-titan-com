"use client";

import { useState } from "react";
import Link from "next/link";
import { TRUST_TRIO, type PitchSheet } from "../pitch/pitch-sheets";

export default function PitchSheet({ sheet }: { sheet: PitchSheet }) {
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [approved, setApproved] = useState(false);
  const brief = sheet.briefDemo;
  const visibleMessages = brief
    ? brief.messages.filter((m) => !showUrgentOnly || m.urgent)
    : [];

  return (
    <div className="pitch-sheet">
      <header className="pitch-header">
        <Link href="/" className="pitch-brand" aria-label="Micro Titan home">
          MICRO TITAN
        </Link>
        <nav aria-label="Pitch sheet links">
          <Link href="/intake">Start an intake</Link>
          <Link href="/book-discovery">Book discovery</Link>
        </nav>
      </header>

      <main>
        <section className="pitch-hero">
          <p className="pitch-eyebrow">{sheet.eyebrow}</p>
          <h1>
            {sheet.headline} <em>{sheet.headlineAccent}</em>
          </h1>
          <p className="pitch-sub">{sheet.sub}</p>
          <div className="pitch-cards" aria-label="At a glance">
            {sheet.floatingCards.map((card) => (
              <article key={card.label} className="pitch-card">
                <strong>{card.label}</strong>
                <p>{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pitch-section">
          <p className="pitch-intro">{sheet.intro}</p>
          <p className="pitch-ownership">
            You own your own major-vendor agent, set up on your accounts.
            Micro Titan sets it up with you, helps with the switchover, and
            builds the first workflow — it does not hand you a shared agent,
            and it does not use self-hosted or open-source agents. Delivery is
            remote, anywhere in the US. Use cases below are examples, not
            promised integrations or outcomes.
          </p>
        </section>

        <section className="pitch-section" aria-labelledby="use-cases">
          <h2 id="use-cases">A few use cases to react to</h2>
          <div className="pitch-grid">
            {sheet.useCases.map((useCase) => (
              <article key={useCase.title} className={sheet.accentCrimson && useCase.title.includes("OU") ? "pitch-use pitch-use-crimson" : "pitch-use"}>
                <h3>{useCase.title}</h3>
                <p>{useCase.body}</p>
                {useCase.steps ? (
                  <ol>
                    {useCase.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        {sheet.timeline ? (
          <section className="pitch-section" aria-labelledby="day-in-life">
            <h2 id="day-in-life">A day in the life — illustrative</h2>
            <ol className="pitch-timeline">
              {sheet.timeline.map((entry) => (
                <li key={entry.time}>
                  <strong>{entry.time}</strong> {entry.text}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {brief ? (
          <section className="pitch-section pitch-demo" aria-labelledby="brief-demo">
            <h2 id="brief-demo">{brief.title}</h2>
            <p className="pitch-fine">{brief.note}</p>
            <div className="pitch-demo-controls" role="group" aria-label="Filter brief">
              <button type="button" aria-pressed={!showUrgentOnly} onClick={() => setShowUrgentOnly(false)}>
                All messages
              </button>
              <button type="button" aria-pressed={showUrgentOnly} onClick={() => setShowUrgentOnly(true)}>
                Needs you
              </button>
            </div>
            <ul className="pitch-messages">
              {visibleMessages.map((message) => (
                <li key={message.subject}>
                  <strong>{message.from}</strong>
                  <span>{message.subject}</span>
                  {message.urgent ? <em>Needs you</em> : null}
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="pitch-approve"
              disabled={approved}
              onClick={() => setApproved(true)}
            >
              {approved ? brief.approvedLabel : brief.approveLabel}
            </button>
            {approved ? (
              <div className="pitch-proof">
                <strong>{brief.proofTitle}</strong>
                <p>{brief.proofBody}</p>
              </div>
            ) : null}
          </section>
        ) : null}

        <section className="pitch-dark" aria-labelledby="flow">
          <h2 id="flow">{sheet.flowTitle}</h2>
          <ol className="pitch-flow">
            {sheet.flowSteps.map((step, index) => (
              <li key={step.title}>
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="pitch-trust">
            {TRUST_TRIO.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {sheet.firstProjects ? (
          <section className="pitch-section" aria-labelledby="first-projects">
            <h2 id="first-projects">Three first projects to choose from</h2>
            <ul className="pitch-list">
              {sheet.firstProjects.map((project) => (
                <li key={project}>{project}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {sheet.discoveryQuestions ? (
          <section className="pitch-section" aria-labelledby="discovery-questions">
            <h2 id="discovery-questions">Discovery questions</h2>
            <p className="pitch-fine">
              These are the questions a discovery conversation would start
              with. Nothing is built or quoted until they are answered.
            </p>
            <ol className="pitch-list numbered">
              {sheet.discoveryQuestions.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {sheet.status ? (
          <section className="pitch-section pitch-status" aria-labelledby="status">
            <h2 id="status">{sheet.status.heading}</h2>
            <ul className="pitch-list">
              {sheet.status.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="pitch-section" aria-labelledby="pricing">
          <h2 id="pricing">Pricing — {sheet.lane}</h2>
          {sheet.pricing.length > 0 ? (
            <dl className="pitch-pricing">
              {sheet.pricing.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>Pricing to be confirmed after discovery — no tier price is shown yet.</p>
          )}
          <p className="pitch-fine">{sheet.pricingNote}</p>
        </section>

        <section className="pitch-cta" aria-labelledby="next-step">
          <h2 id="next-step">Next step</h2>
          <p>
            Start with an intake, or book a discovery conversation. Either way,
            the intake itself charges nothing.
          </p>
          <div className="pitch-cta-links">
            <Link className="pitch-button" href="/intake">
              Start an intake
            </Link>
            <Link className="pitch-button secondary" href="/book-discovery">
              Book discovery
            </Link>
            {sheet.ctaMailto ? (
              <a
                className="pitch-button secondary"
                href={`mailto:hello@micro-titan.com?subject=Micro Titan pitch — ${encodeURIComponent(sheet.clientName)}`}
              >
                Email hello@micro-titan.com
              </a>
            ) : null}
          </div>
        </section>
      </main>

      <footer className="pitch-footer">
        <p>
          <strong>MICRO TITAN</strong> — delivered remotely, anywhere in the
          US. Examples on this page are illustrative.
        </p>
        <p>
          <Link href="/pricing">Services &amp; pricing</Link> ·{" "}
          <Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link>
        </p>
      </footer>
    </div>
  );
}
