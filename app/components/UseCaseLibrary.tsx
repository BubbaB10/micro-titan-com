"use client";

import { useState } from "react";
import { EXAMPLES_NOTICE, LANES, USE_CASES, type Lane } from "../use-cases/use-cases";
import "../use-cases/use-cases.css";

type Filter = "All" | Lane;

export default function UseCaseLibrary() {
  const [filter, setFilter] = useState<Filter>("All");
  const shown = filter === "All" ? USE_CASES : USE_CASES.filter((u) => u.lane === filter);

  return (
    <main className="use-cases">
      <header className="use-cases-header">
        <a className="use-cases-brand" href="/">
          Micro Titan
        </a>
        <nav>
          <a href="/intake">Intake</a>
          <a href="/book-discovery">Book discovery</a>
        </nav>
      </header>

      <section className="use-cases-hero">
        <p className="use-cases-eyebrow">Use cases · Examples, not promises</p>
        <h1>
          Things you didn&apos;t know <em>you could ask an agent to do.</em>
        </h1>
        <p className="use-cases-sub">
          Most people don&apos;t ask for help from an agent because they don&apos;t know what to ask for yet.
          Start with a job you already hate doing — if you recognise yourself in one of these, that&apos;s the
          job to bring to discovery.
        </p>
        <p className="use-cases-notice">{EXAMPLES_NOTICE}</p>
      </section>

      <section className="use-cases-section">
        <div
          className="use-cases-filters"
          role="group"
          aria-label="Filter use cases by lane"
        >
          {LANES.map((lane) => (
            <button
              key={lane}
              type="button"
              aria-pressed={filter === lane}
              onClick={() => setFilter(lane)}
            >
              {lane}
            </button>
          ))}
        </div>
        <p className="use-cases-count">
          Showing {shown.length} of {USE_CASES.length} example use cases
          {filter !== "All" ? ` · ${filter}` : ""}.
        </p>

        <div className="use-cases-grid">
          {shown.map((u) => (
            <article className="use-case-card" key={u.slug}>
              <p className="use-case-lane">{u.lane} · Example</p>
              <h2>{u.title}</h2>
              <p className="use-case-pain">{u.pain}</p>
              <ol>
                {u.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="use-case-gets">
                <strong>What you get:</strong> {u.gets}
              </p>
              {u.doesNot ? (
                <p className="use-case-does-not">
                  <strong>What it does not do:</strong> {u.doesNot}
                </p>
              ) : null}
              <a className="use-case-cta" href="https://micro-titan.com/intake">
                Start with this kind of job — fill out the intake
              </a>
            </article>
          ))}
        </div>

        <section className="use-cases-next">
          <h2>Recognise yourself in one of these?</h2>
          <p>
            Bring it to discovery. Fill out the intake, pick your lane, and tell us in your own words
            what you want off your plate. Discovery confirms the real workflow for you — these examples
            are the starting point, not the promise.
          </p>
          <a className="use-cases-cta" href="https://micro-titan.com/intake">
            Fill out the intake
          </a>
          <p className="use-cases-fine">
            The intake itself charges nothing. Delivery is remote, anywhere. You own your own
            major-vendor agent account, and nothing is sent, booked, or changed without your OK
            where it matters.
          </p>
        </section>
      </section>

      <footer className="use-cases-footer">
        <p>Micro Titan — delivered remotely, anywhere.</p>
      </footer>
    </main>
  );
}
