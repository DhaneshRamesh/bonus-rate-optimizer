"use client";

import type { AccountResult } from "@/types/ranking";

interface BenefitChartProps {
  results: AccountResult[];
  userCurrentRatePa?: number;
}

/**
 * TODO Phase 3: Bar chart comparing estimated annual interest across accounts.
 * Uses recharts BarChart. Highlights top pick and contrasts
 * estimated vs totalMaxRatePa potential earnings.
 * Also shows "gain vs your current rate" using userCurrentRatePa.
 */
export function BenefitChart({ results: _results, userCurrentRatePa: _rate }: BenefitChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm h-48 flex items-center justify-center">
      <p className="text-xs text-muted-foreground">
        Benefit chart (recharts) — coming in Phase 3
      </p>
    </div>
  );
}
