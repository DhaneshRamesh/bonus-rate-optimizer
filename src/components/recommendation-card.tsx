"use client";

import type { AccountResult } from "@/types/ranking";

interface RecommendationCardProps {
  result: AccountResult;
  rank: number;
}

/**
 * TODO Phase 3: Full account recommendation card.
 * Shows estimated rate vs totalMaxRatePa, annual interest, eligibility status,
 * condition checklist, and gap-to-bonus actions.
 */
export function RecommendationCard({ result: _result, rank: _rank }: RecommendationCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-xs text-muted-foreground">Recommendation card — coming in Phase 3</p>
    </div>
  );
}
