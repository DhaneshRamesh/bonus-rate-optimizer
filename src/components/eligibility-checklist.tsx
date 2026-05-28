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
      <div className="rounded-3xl border border-border bg-card p-6">
        <p className="text-sm font-semibold text-foreground mb-1">No monthly conditions</p>
        <p className="text-sm text-muted-foreground">
          This account pays its rate automatically — nothing to track.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Condition checklist</h3>

      {eligibility.metConditions.length > 0 && (
        <div className="space-y-4">
          {eligibility.metConditions.map((cond) => (
            <div key={cond.conditionKey} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xs mt-0.5">
                ✓
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cond.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cond.explanation}</p>
                {(cond.requiredValue !== undefined || cond.userValue !== undefined) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Required:</span> {cond.requiredValue ?? "N/A"} <span className="mx-1">·</span> <span className="font-medium">You:</span> {cond.userValue ?? "N/A"}
                  </p>
                )}
                {cond.sourceUrl && (
                  <a href={cond.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs text-muted-foreground underline hover:text-foreground">
                    Provider terms
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {eligibility.unmetConditions.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-border">
          {eligibility.unmetConditions.map((cond) => (
            <div key={cond.conditionKey} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 text-xs font-bold mt-0.5">
                ✕
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{cond.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cond.explanation}</p>
                {(cond.requiredValue !== undefined || cond.userValue !== undefined) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">Required:</span> {cond.requiredValue ?? "N/A"} <span className="mx-1">·</span> <span className="font-medium">You:</span> {cond.userValue ?? "N/A"}
                  </p>
                )}
                {cond.sourceUrl && (
                  <a href={cond.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs text-rose-600 underline hover:text-rose-800">
                    Verify provider terms
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {eligibility.warnings.length > 0 && (
        <div className="space-y-4 pt-2 border-t border-border">
          {eligibility.warnings.map((warn) => (
            <div key={warn.conditionKey} className="flex items-start gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold mt-0.5">
                !
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{warn.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{warn.explanation}</p>
                {warn.sourceUrl && (
                  <a href={warn.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-xs text-muted-foreground underline hover:text-foreground">
                    Provider terms
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
