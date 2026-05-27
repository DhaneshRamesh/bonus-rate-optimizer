"use client";

import type { AccountResult } from "@/types/ranking";

interface BenefitChartProps {
  results: AccountResult[];
}

/**
 * TODO Phase 3: Bar chart comparing estimated annual interest across accounts.
 * Uses recharts BarChart.
 * Highlights the top pick and visually contrasts estimated vs advertised earnings.
 */
export function BenefitChart({ results: _results }: BenefitChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm h-48 flex items-center justify-center">
      <p className="text-xs text-muted-foreground">
        Benefit chart (recharts) — coming in Phase 3
      </p>
    </div>
  );
}
