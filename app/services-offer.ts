// Owner-approved September 19, 2026. Shared by public copy and quote calculation.
export const offer = {
  setup: 2500,
  monthly: 750,
  includes: ["A standard business website", "Website care and updates", "Google Business Profile management", "Local search optimization", "Customer review requests", "8 social posts a month across 2 channels", "Monthly reporting"],
};
export const dollars = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
