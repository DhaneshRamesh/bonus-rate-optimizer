"use client";

import type { ConditionCheck } from "@/types/ranking";

interface EligibilityChecklistProps {
  checks: ConditionCheck[];
}

/**
 * TODO Phase 3: Condition checklist.
 * Renders each ConditionCheck with a status icon (green / amber / red),
 * required vs actual values, and an optional gapAction.
 */
export function EligibilityChecklist({ checks: _checks }: EligibilityChecklistProps) {
  return (
    <ul className="space-y-2">
      <li className="text-xs text-muted-foreground">
        Eligibility checklist — coming in Phase 3
      </li>
    </ul>
  );
}
