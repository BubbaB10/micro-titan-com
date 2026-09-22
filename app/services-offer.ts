// Owner-approved September 22, 2026. Shared by public copy and quote calculation.
//
// The NUMBERS below are the only things the quote arithmetic reads. The lists are descriptive:
// they are rendered as copy, and nothing computes a price from their length or contents. Moving
// an item between lists changes what we say, never what we charge.
export const offer = {
  setup: 2500,
  monthly: 750,
  // WHAT IS INCLUDED TODAY. Every line here is something we have done or can do now.
  includes: [
    "A standard business website",
    "Website care and updates",
    "On-page local search setup: structured data, sitemap, robots",
    "A monthly report of what changed, what was checked, and what needs you",
    "4 original social posts a month, approved by you before anything goes out",
    "A review request kit you send to your own customers",
  ],
  // ALSO INCLUDED, and prepared by us, but they cannot begin until the customer grants access.
  // That is an onboarding step, not an extra charge — stated plainly rather than left for a
  // customer to discover after signing.
  withAccess: [
    "Publishing to your channels — needs a posting role you grant us",
    "Google Business Profile management — needs Manager access you grant us",
  ],
};
export const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
