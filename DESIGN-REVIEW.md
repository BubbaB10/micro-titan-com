# Services redesign — first review, September 19, 2026

## Owner-approved follow-up

Owner approved the warm visual direction and the headline “Small business. Big presence.” The About and Custom Software pages now use the services design; shared legacy navigation returns visitors to services while retaining Valet and Pivot. Valet copy is preserved, with its pricing link corrected to /valet/pricing. No customer capacity or unapproved price was added. Mobile headline size now scales down on narrow screens; visual verification still requires an available browser.

Existing integrity gate ran against fbfaeb2...6832a41: no_secrets PASS (gitleaks), no_tests_removed PASS, gate_untouched PASS. Public-copy privacy check PASS. No company queue or gate records were updated. Browser inventory again returned no apps/browsers; owner was asked to connect the extension. Quote interaction and responsive visual checks are pending, and this PR remains draft. Existing Terms and Privacy pages retain their draft-placeholder notices and are not represented as finalized policies.

Scope: homepage, services pricing and contact-free quote builder. Owner-authorized exception to Codex's auditor role; no changes to company operations or customer apps.

Based on SEO PR #4, commit fbfaeb2701e8eb7603ad5b36aa1ce1d4392cc4c9. Keep its robots, sitemap, metadataBase and ProfessionalService schema. No street address or phone added. No production merge authorized.

## Decisions carried into this draft

Micro Titan brand. Single-location website/marketing package: $2,500 setup and $750 monthly; eight social posts across two channels, website care, GBP, local SEO, review requests and reporting. Custom operations software and extras quoted separately. Public pricing and quote without an email gate. No customer-capacity number, countdown, ranking or earnings guarantee. Scope and start date agreed before commitment.

Original Valet page is unchanged; original pricing content is retained at /valet/pricing (relative imports adjusted). This draft does not certify the older Valet claims. Other legacy pages and their navigation still need a consistency pass after design feedback.

## Checks

- npm ci --no-audit --no-fund: exit 0, 363 packages installed.
- npm run build: exit 0; 28 generated pages, including /valet/pricing.
- ESLint on changed TypeScript/TSX files: exit 0.
- npm run test:public-copy: exit 0.
- git diff --check: no whitespace errors.
- Local homepage HTTP: 200. Visual/mobile review and browser interaction verification remain pending: browser inventory returned no available browsers.

Baseline from existing local-seo-probe.mjs and site-crawl.mjs against micro-titan.com: both exit 0. Old homepage title/description sell the assistant, one H1 “Your system,your rules.”; robots and sitemap return 404, no JSON-LD found. Probe's “analytics NONE” is not accepted: source contains Vercel Analytics. No new probes written.

HTTPS draft preview: https://micro-titan-com-git-redesign-0d3538-billywbelljr-4327s-projects.vercel.app . Vercel check SUCCESS for draft PR #5. Existing SEO probe returned HTTP 200 with the new services title/H1, one ProfessionalService JSON-LD block, robots 200 and sitemap 200. Its LocalBusiness matcher does not recognize ProfessionalService; its analytics matcher misses Vercel Analytics. Neither negative is accepted as a finding. The existing crawler also ran successfully, but followed the sitemap's canonical micro-titan.com URLs back to production, so its page findings do NOT measure the draft. Production /valet/pricing 404 is expected before this branch is merged. Full candidate crawl remains pending; no production improvement is claimed.

## Next review

Owner reaction to visual direction, then refine. Before merge proposal: finish legacy-page navigation/copy consistency, verify responsive rendering and quote interactions, resolve candidate crawl coverage, run app's mechanical gates. User merges; PR #4 must be integrated first.
