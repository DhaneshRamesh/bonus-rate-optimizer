"use client";

import type { ConditionCheck } from "@/types/ranking";

interface EligibilityChecklistProps {
  checks: ConditionCheck[];
}

/**
 * TODO Phase 2: Condition pass/fail checklist.
 * Green checkmark for met, red X for unmet.
 * Shows user value vs required value for each condition.
 */
export function EligibilityChecklist({ checks: _checks }: EligibilityChecklistProps) {
  return (
    <ul className="space-y-2">
      <li className="text-xs text-muted-foreground">
        Eligibility checklist — coming in Phase 2
      </li>
    </ul>
  );
}
