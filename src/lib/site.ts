export const SITE = {
  name: "Global Container Supply",
  shortName: "GCS",
  domain: "globalcontainersupply.com",
  email: "info@globalcontainersupply.com",
  tagline: "Shipping containers supplied worldwide",
  currency: "USD",
} as const;

export const FORMSUBMIT_ENDPOINT = `https://formsubmit.co/ajax/${SITE.email}`;

export function formatPrice(
  price: number | null | undefined,
  mode: string = "fixed",
  currency = "USD",
) {
  if (mode === "quote" || price == null) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function conditionLabel(condition: string) {
  return condition === "new" ? "New (one-trip)" : "Used";
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
