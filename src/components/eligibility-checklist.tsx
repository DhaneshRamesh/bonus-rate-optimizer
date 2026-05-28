"use client";

import type { RankedAccount } from "@/types/ranking";

interface EligibilityChecklistProps {
  ranked: RankedAccount;
}

export function EligibilityChecklist({ ranked }: EligibilityChecklistProps) {
  const { eligibility, account } = ranked;

  if (eligibility.hardIneligible) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
        <p className="text-sm font-semibold text-rose-700 mb-1">Not eligible</p>
        <p className="text-sm text-rose-600">
          {account.provider} {account.productName} has an age restriction that
          applies to you.
        </p>
      </div>
    );
  }

  const hasContent =
    eligibility.metConditions.length > 0 ||
    eligibility.unmetConditions.length > 0 ||
    eligibility.warnings.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-white p-6">
        <p className="text-sm font-semibold text-stone-700 mb-1">No monthly conditions</p>
        <p className="text-sm text-stone-500">
          This account pays its rate automatically — nothing to track.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-stone-200 bg-white p-6 space-y-4">
      <h3 className="text-sm font-semibold text-stone-900">Condition checklist</h3>

      {eligibility.metConditions.length > 0 && (
        <div className="space-y-2">
          {eligibility.metConditions.map((cond) => (
            <div key={cond} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs font-bold mt-0.5">
                ✓
              </span>
              <p className="text-sm text-stone-700">{cond}</p>
            </div>
          ))}
        </div>
      )}

      {eligibility.unmetConditions.length > 0 && (
        <div className="space-y-2">
          {eligibility.unmetConditions.map((cond) => (
            <div key={cond} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-bold mt-0.5">
                ✕
              </span>
              <p className="text-sm text-stone-700">{cond}</p>
            </div>
          ))}
        </div>
      )}

      {eligibility.warnings.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-stone-100">
          {eligibility.warnings.map((warn) => (
            <div key={warn} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-xs font-bold mt-0.5">
                !
              </span>
              <p className="text-sm text-stone-600">{warn}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
