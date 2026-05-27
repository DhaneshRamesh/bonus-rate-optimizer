import type { EligibilityStatus } from "@/types/accounts";

/**
 * Full AUD currency string.
 * formatCurrency(1250)   → "$1,250"
 * formatCurrency(25000)  → "$25,000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compact currency label for sliders and summaries.
 * formatCurrencyCompact(1250)    → "$1k"
 * formatCurrencyCompact(25000)   → "$25k"
 * formatCurrencyCompact(1200000) → "$1.2M"
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
  return `$${amount.toFixed(0)}`;
}

/**
 * Percentage rate with p.a. suffix.
 * formatPercent(5.2)  → "5.20% p.a."
 * formatPercent(4.75) → "4.75% p.a."
 */
export function formatPercent(rate: number, decimals = 2): string {
  return `${rate.toFixed(decimals)}% p.a.`;
}

/**
 * Human-readable label for an EligibilityStatus value.
 * formatEligibilityStatus("likely_eligible") → "Likely eligible"
 * formatEligibilityStatus("at_risk")         → "At risk"
 * formatEligibilityStatus("not_eligible")    → "Not eligible"
 */
export function formatEligibilityStatus(status: EligibilityStatus): string {
  switch (status) {
    case "likely_eligible":
      return "Likely eligible";
    case "at_risk":
      return "At risk";
    case "not_eligible":
      return "Not eligible";
  }
}

/**
 * Tailwind colour classes for an EligibilityStatus value (bg + text + border).
 * Used consistently across cards and badges.
 */
export function eligibilityStatusClasses(status: EligibilityStatus): string {
  switch (status) {
    case "likely_eligible":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "at_risk":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "not_eligible":
      return "bg-red-50 text-red-600 border-red-200";
  }
}
