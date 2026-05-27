/**
 * Compact currency label for sliders and summaries (e.g. $25k, $1.2M).
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}k`;
  return `$${amount.toFixed(0)}`;
}

/**
 * Full AUD currency string (e.g. $1,250).
 */
export function formatCurrencyFull(amount: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Rate formatted to 2 decimal places with % suffix.
 */
export function formatRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}
