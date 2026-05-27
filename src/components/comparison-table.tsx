"use client";

import type { AccountResult } from "@/types/ranking";

interface ComparisonTableProps {
  results: AccountResult[];
}

/**
 * TODO Phase 3: Side-by-side comparison table.
 * Shows all offers: estimated rate, totalMaxRatePa, annual interest,
 * eligibility status, key conditions.
 */
export function ComparisonTable({ results: _results }: ComparisonTableProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm overflow-x-auto">
      <p className="text-xs text-muted-foreground">Comparison table — coming in Phase 3</p>
    </div>
  );
}
