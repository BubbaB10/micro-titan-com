// Pins the preview cleanup: retired offers redirect, shared chrome is remote
// nationwide, and the A2P opt-out line stays in the shared footer and shell.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");

const footer = read("app/components/Footer.tsx");
const shell = read("app/components/ServicesShell.tsx");
const nav = read("app/components/Nav.tsx");
const config = read("next.config.ts");
const sitemap = read("app/sitemap.ts");
const terms = read("app/terms/page.tsx");
const home = read("app/page.tsx");
const privacy = read("app/privacy/page.tsx");

const OPT_OUT = "Reply STOP to opt out";

test("shared footer and services shell do not say Paris, Texas", () => {
  for (const [name, src] of [["Footer", footer], ["ServicesShell", shell]]) {
    assert.ok(!src.includes("Paris, Texas"), `${name} still says Paris, Texas`);
    assert.ok(!src.includes("Paris, TX"), `${name} still says Paris, TX`);
    assert.ok(src.includes("Remote, nationwide"), `${name} missing remote framing`);
  }
  assert.ok(!shell.includes("Built in Paris"));
});

test("Twilio opt-out line is still present on the shared footer, shell, homepage, terms, and privacy", () => {
  for (const [name, src] of [
    ["Footer", footer],
    ["ServicesShell", shell],
    ["homepage", home],
  ]) {
    assert.ok(src.includes("(903) 300-5734"), `${name} missing the business line`);
    assert.ok(src.includes("hello@micro-titan.com"), `${name} missing hello@`);
  }
  for (const [name, src] of [
    ["Footer", footer],
    ["ServicesShell", shell],
    ["homepage", home],
    ["terms", terms],
    ["privacy", privacy],
    ["SmsConsentCheckbox", read("app/components/SmsConsentCheckbox.tsx")],
  ]) {
    assert.ok(src.includes(OPT_OUT), `${name} missing the opt-out line`);
  }
  assert.ok(privacy.includes("+1 903-300-5734"), "privacy SMS section missing the business line");
  assert.ok(
    home.includes("Text or call (903) 300-5734. Msg & data rates may apply. Reply STOP to opt out."),
    "homepage contact sentence must stay verbatim",
  );
});

test("retired /valet and /missed-call-ai redirect to /pricing with permanent 308s", () => {
  const list = config.slice(config.indexOf("const retiredToPricing"), config.indexOf("];"));
  for (const source of ["/valet", "/valet/:path*", "/missed-call-ai"]) {
    assert.ok(list.includes(`"${source}"`), `missing redirect source ${source}`);
  }
  assert.match(config, /destination:\s*"\/pricing"/);
  assert.match(config, /permanent:\s*true/);
  assert.ok(!config.includes('destination: "/valet"'), "redirects must not chain through /valet");
});

test("sitemap and primary nav no longer publish retired Valet or missed-call routes", () => {
  for (const retired of ["/valet", "/missed-call-ai", "/pivot", "/why-provable", "/ai-bookkeeper"]) {
    assert.ok(!sitemap.includes(`path: "${retired}"`), `sitemap still lists ${retired}`);
  }
  assert.ok(!nav.includes("Try Valet"));
  assert.ok(!nav.includes('href: "/valet"'));
  assert.ok(!footer.includes('href="/valet'));
  assert.ok(!shell.includes('href="/valet'));
});

test("terms point at /pricing, keep the 30-day notice, and drop the Valet price URL", () => {
  assert.ok(terms.includes("micro-titan.com/pricing"));
  assert.ok(!terms.includes("valet/pricing"));
  assert.ok(terms.includes("30 days"));
  assert.ok(terms.includes("Micro Titan LLC, a Texas limited liability company"));
});

test("redirected page source is still in the repo", () => {
  for (const rel of [
    "app/valet/page.tsx",
    "app/valet/pricing/page.tsx",
    "app/missed-call-ai/page.tsx",
  ]) {
    assert.ok(fs.existsSync(path.join(root, rel)), `${rel} was deleted`);
  }
});
