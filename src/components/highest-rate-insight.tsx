"use client";

import { Lightbulb } from "lucide-react";
import type { RankedAccount } from "@/types/ranking";

interface HighestRateInsightProps {
  selectedAccount: RankedAccount;
  highestRateAccount: RankedAccount;
}

export function HighestRateInsight({ selectedAccount, highestRateAccount }: HighestRateInsightProps) {
  if (selectedAccount.account.id === highestRateAccount.account.id) {
    return null;
  }

  let reason = "";

  if (highestRateAccount.eligibility.hardIneligible) {
    reason = highestRateAccount.eligibility.unmetConditions[0]?.explanation 
      ? highestRateAccount.eligibility.unmetConditions[0].explanation.toLowerCase() 
      : "it has a restriction you don't meet";
  } else if (highestRateAccount.eligibility.status === "not_eligible" || highestRateAccount.eligibility.status === "at_risk") {
    reason = highestRateAccount.eligibility.unmetConditions[0]?.explanation 
      ? highestRateAccount.eligibility.unmetConditions[0].explanation.toLowerCase() 
      : "you may miss a monthly requirement";
  } else if (highestRateAccount.account.capAmount !== undefined && highestRateAccount.effectiveRatePa < selectedAccount.effectiveRatePa) {
    reason = `its balance cap of $${highestRateAccount.account.capAmount.toLocaleString()} lowers your overall return`;
  } else if (highestRateAccount.account.introRatePa !== undefined && highestRateAccount.effectiveRatePa < selectedAccount.effectiveRatePa) {
    reason = `its introductory rate period lowers your 12-month average return`;
  } else {
    reason = `its expected return is lower under your specific circumstances`;
  }

  return (
    <div className="rounded-3xl border border-orange-200 bg-orange-50/50 p-6 mt-6">
      <div className="flex items-start gap-4">
        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
          <Lightbulb className="w-4 h-4 text-orange-600" />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-orange-950">
            Why the highest rate didn’t win
          </h4>
          <p className="text-sm text-orange-900/80 mt-1.5 leading-relaxed">
            Highest advertised rate does not always mean highest expected return. Based on your profile, {highestRateAccount.account.provider} {highestRateAccount.account.productName} ({highestRateAccount.account.totalMaxRatePa.toFixed(2)}% p.a.) did not win because {reason}.
          </p>
        </div>
      </div>
    </div>
  );
}
