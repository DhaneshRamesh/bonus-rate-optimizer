import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";

/**
 * Returns the portion of the user's balance that earns the bonus rate.
 * Balances above the cap earn the base rate only.
 */
export function computeEffectiveBalance(
  offer: SavingsAccountOffer,
  balance: number
): number {
  return offer.capAmount ? Math.min(balance, offer.capAmount) : balance;
}

/**
 * Returns the effective annual rate the user would earn given their eligibility.
 *
 * For intro-rate accounts where the user is a new customer, the rate is blended
 * across a full year: introRate for introMonths, then the post-intro rate for
 * the remainder. This slightly overstates Year 1 for mid-year starts — noted
 * as a known modelling assumption.
 *
 * "likely_eligible" → earns base + bonus (or intro if applicable)
 * "at_risk" / "not_eligible" → earns base rate only
 */
export function computeEstimatedRate(
  offer: SavingsAccountOffer,
  eligibilityStatus: EligibilityStatus,
  isIntroApplicable: boolean
): number {
  const earnsBonus = eligibilityStatus === "likely_eligible";

  if (isIntroApplicable && offer.introRatePa && offer.introMonths) {
    const postIntroRate = earnsBonus
      ? offer.baseRatePa + (offer.bonusRatePa ?? 0)
      : offer.baseRatePa;
    return (
      (offer.introRatePa * offer.introMonths +
        postIntroRate * (12 - offer.introMonths)) /
      12
    );
  }

  return earnsBonus
    ? offer.baseRatePa + (offer.bonusRatePa ?? 0)
    : offer.baseRatePa;
}

/**
 * Estimates annual interest in AUD.
 * Uses a simple non-compounding model: interest = balance × rate / 100.
 */
export function computeAnnualInterest(
  effectiveBalance: number,
  annualRate: number
): number {
  return (effectiveBalance * annualRate) / 100;
}
