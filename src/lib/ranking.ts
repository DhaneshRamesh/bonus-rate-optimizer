import type { SavingsAccount } from "@/types/accounts";
import type { AccountResult } from "@/types/ranking";
import type { UserProfile } from "@/types/user";
import { checkCondition } from "./eligibility";
import { buildExplanation } from "./explanation";
import {
  computeAnnualInterest,
  computeEffectiveBalance,
  computeEstimatedRate,
} from "./interest";

/**
 * Runs the full analysis pipeline for one account against one user profile.
 * Deterministic: same inputs always produce identical outputs.
 */
export function analyzeAccount(
  account: SavingsAccount,
  profile: UserProfile
): AccountResult {
  const conditionChecks = account.conditions.map((c) =>
    checkCondition(c, profile)
  );

  const allBonusConditionsMet =
    conditionChecks.length === 0 || conditionChecks.every((c) => c.met);
  const conditionsMetCount = conditionChecks.filter((c) => c.met).length;
  const totalConditions = conditionChecks.length;
  const eligibilityScore =
    totalConditions === 0
      ? 100
      : Math.round((conditionsMetCount / totalConditions) * 100);

  const isIntroApplicable = !!(
    account.introRate &&
    account.introMonths &&
    profile.isNewCustomer
  );

  const effectiveBalance = computeEffectiveBalance(account, profile.currentBalance);
  const balanceExceedsCap = !!(
    account.balanceCap && profile.currentBalance > account.balanceCap
  );

  const estimatedRate = computeEstimatedRate(
    account,
    allBonusConditionsMet,
    isIntroApplicable
  );
  const estimatedAnnualInterest = computeAnnualInterest(effectiveBalance, estimatedRate);

  const gapActions = conditionChecks
    .filter((c) => !c.met && c.gapAction)
    .map((c) => c.gapAction!);

  const explanation = buildExplanation(
    account,
    conditionChecks,
    allBonusConditionsMet,
    conditionsMetCount,
    totalConditions,
    estimatedRate,
    isIntroApplicable,
    balanceExceedsCap
  );

  return {
    account,
    conditionChecks,
    allBonusConditionsMet,
    conditionsMetCount,
    totalConditions,
    eligibilityScore,
    estimatedRate,
    estimatedAnnualInterest,
    isIntroApplicable,
    balanceExceedsCap,
    gapActions,
    explanation,
  };
}

/**
 * Ranks all accounts by estimated annual interest (highest first).
 * Tiebreaks on eligibility score so accounts closest to qualifying rank higher.
 */
export function rankAccounts(
  accounts: SavingsAccount[],
  profile: UserProfile
): AccountResult[] {
  return accounts
    .map((account) => analyzeAccount(account, profile))
    .sort((a, b) => {
      if (Math.abs(b.estimatedAnnualInterest - a.estimatedAnnualInterest) > 0.01) {
        return b.estimatedAnnualInterest - a.estimatedAnnualInterest;
      }
      return b.eligibilityScore - a.eligibilityScore;
    });
}
