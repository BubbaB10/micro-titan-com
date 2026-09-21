// Owner-approved September 19, 2026. Shared by public copy and quote calculation.
export const offer = {
  setup: 2500,
  monthly: 750,
  // WHAT IS INCLUDED TODAY. Every line here is something we have done or can do now.
  includes: [
    "A standard business website",
    "Website care and updates",
    "On-page local search setup: structured data, sitemap, robots",
    "A monthly report of what changed, what was checked, and what needs you",
  ],
  // NOT INCLUDED YET, and said so on the page rather than left to be assumed. Each needs
  // something we do not have: access a customer must grant, and a first real run.
  notYet: [
    "Google Business Profile management",
    "Customer review requests",
    "Social posting",
  ],
};
export const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
