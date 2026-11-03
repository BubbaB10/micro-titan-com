// Use-case library: every starter use case must be present, labelled as an
// example, and free of the things a public Micro Titan page must never claim.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = readFileSync(path.join(root, "app/use-cases/use-cases.ts"), "utf8");
const component = readFileSync(path.join(root, "app/components/UseCaseLibrary.tsx"), "utf8");

const EXPECTED = [
  // Family (5)
  ["Family", "The morning brief"],
  ["Family", "A kids' schedule hub"],
  ["Family", "Inbox triage"],
  ["Family", "Meeting prep and follow-up"],
  ["Family", "Game day / event day setup"],
  // Solo (5)
  ["Solo", "The morning triage brief"],
  ["Solo", "Staffing and call-out chase"],
  ["Solo", "Follow-through tracking"],
  ["Solo", "Invoicing and estimating follow-up"],
  ["Solo", "A multi-location roll-up"],
  // Business (4)
  ["Business", "Job intake without retyping"],
  ["Business", "Proofs out, approvals back"],
  ["Business", "The floor, in step"],
  ["Business", "Delivery confirmed, out the door"],
];

test("all 14 starter use cases are present, by lane", () => {
  for (const [lane, title] of EXPECTED) {
    assert.ok(data.includes(`lane: "${lane}"`), `missing lane ${lane}`);
    assert.ok(data.includes(`title: "${title}"`), `missing use case ${title}`);
  }
  const slugs = data.match(/slug: "/g) || [];
  assert.equal(slugs.length, 14, `expected 14 use cases, found ${slugs.length}`);
});

test("use cases are labelled examples only, never promised integrations", () => {
  assert.ok(data.includes("EXAMPLES / POSSIBILITIES"));
  assert.ok(data.includes("not promised integrations"));
  assert.ok(data.includes("Discovery confirms the real workflow"));
  assert.ok(component.includes("Examples, not promises"));
  assert.ok(component.includes("EXAMPLES_NOTICE"));
});

test("no PHI promise, no Paris service framing, no owner last name, no prices", () => {
  assert.ok(!data.includes("Bell"), "owner last name must not appear");
  assert.ok(!data.includes("Paris"), "no Paris framing at all in the library");
  assert.ok(!data.match(/\$\d/), "no prices in the use-case library");
  assert.ok(!data.toLowerCase().includes("will handle patient health information"));
  assert.ok(data.includes("does not handle patient health information"));
  assert.ok(!data.toLowerCase().includes("medical billing"));
  assert.ok(!data.toLowerCase().includes("tax filing") || data.includes("does not file taxes"));
  assert.ok(!data.toLowerCase().includes("legal filing"));
});

test("every CTA links to the live intake page, with no invented lane parameter", () => {
  assert.ok(component.includes('href="https://micro-titan.com/intake"'));
  assert.ok(!component.includes("?lane="), "intake form has no lane query parameter");
  assert.ok(!data.includes("?lane="));
});

test("lane filter covers All, Family, Solo, Business", () => {
  assert.ok(data.includes('"All", "Family", "Solo", "Business"'));
  assert.ok(component.includes("Filter use cases by lane"));
});
