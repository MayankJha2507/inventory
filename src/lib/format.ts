const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
  INR: "en-IN",
  CAD: "en-CA",
  AUD: "en-AU",
};

export function formatCurrency(
  value: number,
  currency: string = "USD",
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: value >= 1000 ? 0 : 2,
    ...options,
  }).format(value);
}

export function formatCompactCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency] ?? "en-US", {
    style: "currency",
    currency,
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 10_000 ? 1 : 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}
