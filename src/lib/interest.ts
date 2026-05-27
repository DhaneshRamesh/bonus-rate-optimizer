import type { SavingsAccount } from "@/types/accounts";

/**
 * Returns the portion of the user's balance that earns the bonus rate.
 * If the account has a cap, balances above the cap earn base rate only.
 */
export function computeEffectiveBalance(
  account: SavingsAccount,
  currentBalance: number
): number {
  return account.balanceCap
    ? Math.min(currentBalance, account.balanceCap)
    : currentBalance;
}

/**
 * Returns the effective annual rate a user would earn given their eligibility.
 *
 * For accounts with an intro period (and an eligible new customer), the rate is
 * blended across the year: introRate for introMonths, then postIntroRate for the
 * remainder. This slightly overstates Year 1 for partial-year starts — documented
 * as a known assumption in the README.
 */
export function computeEstimatedRate(
  account: SavingsAccount,
  allBonusConditionsMet: boolean,
  isIntroApplicable: boolean
): number {
  if (isIntroApplicable) {
    const introMonths = account.introMonths!;
    const postIntroRate = allBonusConditionsMet
      ? account.baseRate + account.bonusRate
      : account.baseRate;
    return (account.introRate! * introMonths + postIntroRate * (12 - introMonths)) / 12;
  }

  return allBonusConditionsMet
    ? account.baseRate + account.bonusRate
    : account.baseRate;
}

/**
 * Computes estimated annual interest in AUD.
 * Uses a simple non-compounding model: interest = balance × rate / 100.
 */
export function computeAnnualInterest(
  effectiveBalance: number,
  annualRate: number
): number {
  return (effectiveBalance * annualRate) / 100;
}
