// Pitch sheets: every sheet must carry its lane pricing, the trust
// wording, and none of the things a client sheet must never claim.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = readFileSync(path.join(root, "app/pitch/pitch-sheets.ts"), "utf8");
const component = readFileSync(path.join(root, "app/components/PitchSheet.tsx"), "utf8");

test("all three pitch sheets exist with their lane pricing", () => {
  for (const slug of ["scott-moffitt", "craig-corriston", "jason-spiegel"]) {
    assert.ok(data.includes(`"${slug}"`), `missing sheet ${slug}`);
  }
  // Family totals
  assert.ok(data.includes("$1,650") && data.includes("$1,500") && data.includes("$95/mo"));
  // Solo totals
  assert.ok(data.includes("$5,500") && data.includes("$5,000") && data.includes("$350/mo"));
  // Business totals, labelled proposed
  assert.ok(data.includes("$10,000") && data.includes("$9,000") && data.includes("$950/mo"));
  assert.ok(data.includes("proposed, not agreed"));
});

test("pitch sheets never publish the owner's last name, a Paris focus, or PHI handling", () => {
  assert.ok(!data.includes("Bell"), "owner last name must not appear");
  // Paris, Texas is allowed ONLY as Gatz's business location (a client fact),
  // never as Micro Titan service-area framing on any other sheet.
  const beforeGatz = data.slice(0, data.indexOf('"gatz-nottingham"'));
  assert.ok(!beforeGatz.includes("Paris, Texas") && !beforeGatz.includes("Paris, TX"));
  assert.ok(!data.includes("Built in Paris"));
  assert.ok(!data.toLowerCase().includes("patient health information will be"));
  assert.ok(data.includes("does not handle patient health information"));
  assert.ok(data.includes("illustrative"));
});

test("gatz sheet uses the confirmed spelling and Solo pricing, and names the four pain points", () => {
  assert.ok(data.includes('"gatz-nottingham"'));
  const gatz = data.slice(data.indexOf('"gatz-nottingham"'));
  assert.ok(gatz.includes("Nu-Tek Foundation Solitions"), "exact spelling Solitions");
  assert.ok(!gatz.includes("Nu-Tek Foundation Solutions"), "must not 'correct' Solitions to Solutions");
  assert.ok(gatz.includes("$500") && gatz.includes("$5,500") && gatz.includes("$5,000") && gatz.includes("$350/mo"));
  assert.ok(gatz.includes("Solo entrepreneur"));
  assert.ok(gatz.includes("Phone calls") || gatz.includes("phone calls"));
  assert.ok(gatz.includes("invoicing"));
  assert.ok(gatz.includes("estimating"));
});

test("shared template and dynamic route exist", () => {
  assert.ok(existsSync(path.join(root, "app/components/PitchSheet.tsx")));
  assert.ok(existsSync(path.join(root, "app/pitch/[slug]/page.tsx")));
  assert.ok(existsSync(path.join(root, "app/pitch/pitch.css")));
  // The trust trio lives in the shared data file; the component renders it.
  assert.ok(data.includes("You own the agent"));
  assert.ok(data.includes("You approve the actions"));
  assert.ok(data.includes("Proof at every step"));
  assert.ok(component.includes("TRUST_TRIO"));
});
