import type { EligibilityStatus, SavingsAccountOffer } from "@/types/accounts";

/** One row in the balance-based rate breakdown returned by calculateAnnualInterest. */
export interface TierBreakdownEntry {
  amount: number;
  ratePa: number;
  interest: number;
  label: string;
}

/** Full result from calculateAnnualInterest. */
export interface InterestCalculation {
  interestAmount: number;
  effectiveRatePa: number;
  capImpact?: string;
  introImpact?: string;
  tierBreakdown: TierBreakdownEntry[];
}

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

/**
 * Calculates estimated annual interest for a balance against an offer.
 *
 * Model: simple non-compounding (interest = balance × rate / 100).
 * Real banks calculate interest daily and may compound monthly — actual
 * earnings will differ. This is a transparent approximation for comparison.
 *
 * Handles: bonus vs base selection, balance caps, intro-rate Year-1 blending,
 * and explicit tier structures.
 */
export function calculateAnnualInterest(
  balance: number,
  account: SavingsAccountOffer,
  opts: { eligibleForBonus: boolean; isNewCustomerForIntro: boolean }
): InterestCalculation {
  const { eligibleForBonus, isNewCustomerForIntro } = opts;
  const tierBreakdown: TierBreakdownEntry[] = [];
  let capImpact: string | undefined;
  let introImpact: string | undefined;

  // Ongoing rate = rate earned after any intro period expires.
  // Accounts without bonusRatePa (e.g. Macquarie) earn baseRatePa ongoing
  // regardless of eligibility — there is no bonus to unlock.
  const ongoingRate = eligibleForBonus
    ? account.baseRatePa + (account.bonusRatePa ?? 0)
    : account.baseRatePa;

  // ── Steady-state tier breakdown ───────────────────────────────────────────
  if (account.tiers && account.tiers.length > 0 && eligibleForBonus) {
    // Allocate balance across explicit bonus-rate tiers in ascending order.
    let remaining = balance;
    let lower = 0;
    for (const tier of account.tiers) {
      if (remaining <= 0) break;
      const bandWidth = tier.upTo !== undefined ? tier.upTo - lower : remaining;
      const tierAmount = Math.min(remaining, bandWidth);
      tierBreakdown.push({
        amount: tierAmount,
        ratePa: tier.ratePa,
        interest: (tierAmount * tier.ratePa) / 100,
        label: tier.upTo !== undefined
          ? `Up to $${tier.upTo.toLocaleString()}`
          : `Above $${lower.toLocaleString()}`,
      });
      remaining -= tierAmount;
      if (tier.upTo !== undefined) lower = tier.upTo;
    }
    // Any balance beyond all defined tiers falls back to base rate.
    if (remaining > 0) {
      tierBreakdown.push({
        amount: remaining,
        ratePa: account.baseRatePa,
        interest: (remaining * account.baseRatePa) / 100,
        label: "Remaining balance (base rate)",
      });
    }
  } else if (account.capAmount !== undefined && balance > account.capAmount) {
    // Balance exceeds cap: apply full rate up to the cap, base rate on excess.
    const cappedAmount = account.capAmount;
    const excessAmount = balance - account.capAmount;
    tierBreakdown.push({
      amount: cappedAmount,
      ratePa: ongoingRate,
      interest: (cappedAmount * ongoingRate) / 100,
      label: `Up to $${account.capAmount.toLocaleString()} (${eligibleForBonus ? "bonus" : "base"} rate)`,
    });
    tierBreakdown.push({
      amount: excessAmount,
      ratePa: account.baseRatePa,
      interest: (excessAmount * account.baseRatePa) / 100,
      label: `Above $${account.capAmount.toLocaleString()} (base rate)`,
    });
    capImpact =
      `$${excessAmount.toLocaleString()} above the $${account.capAmount.toLocaleString()} ` +
      `cap earns only ${account.baseRatePa}% p.a.`;
  } else {
    // Single segment: whole balance at the ongoing rate.
    tierBreakdown.push({
      amount: balance,
      ratePa: ongoingRate,
      interest: (balance * ongoingRate) / 100,
      label: eligibleForBonus ? "Full balance (bonus rate)" : "Full balance (base rate)",
    });
  }

  // ── Steady-state annual interest ──────────────────────────────────────────
  const steadyStateInterest = tierBreakdown.reduce((sum, t) => sum + t.interest, 0);

  // ── Intro-rate Year-1 blending ────────────────────────────────────────────
  // New customers receive introRatePa on their full balance for introMonths,
  // then earn the steady-state rate for the remainder of the year.
  // Formula: (introInterest × introMonths + steadyInterest × remainingMonths) / 12
  let interestAmount = steadyStateInterest;
  if (
    isNewCustomerForIntro &&
    account.introRatePa !== undefined &&
    account.introMonths !== undefined
  ) {
    const introInterest = (balance * account.introRatePa) / 100;
    interestAmount =
      introInterest * (account.introMonths / 12) +
      steadyStateInterest * ((12 - account.introMonths) / 12);
    const blendedRatePct = (
      (account.introRatePa * account.introMonths +
        ongoingRate * (12 - account.introMonths)) /
      12
    ).toFixed(2);
    introImpact =
      `${account.introRatePa}% p.a. for the first ${account.introMonths} months, ` +
      `then ${ongoingRate}% p.a. — blended Year 1 rate: ${blendedRatePct}%`;
  }

  const effectiveRatePa = balance > 0 ? (interestAmount / balance) * 100 : 0;

  return { interestAmount, effectiveRatePa, capImpact, introImpact, tierBreakdown };
}
