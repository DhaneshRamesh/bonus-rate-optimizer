"use client";

import type { AccountResult } from "@/types/ranking";

interface RecommendationCardProps {
  result: AccountResult;
  rank: number;
}

/**
 * TODO Phase 2: Full account recommendation card.
 * Shows estimated rate, annual interest, eligibility score bar,
 * condition pass/fail checklist, and gap-to-bonus actions.
 */
export function RecommendationCard({
  result: _result,
  rank: _rank,
}: RecommendationCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs text-muted-foreground">
        Recommendation card — coming in Phase 2
      </p>
    </div>
  );
}
