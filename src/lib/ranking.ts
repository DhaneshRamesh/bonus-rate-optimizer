import type { SavingsAccountOffer } from "@/types/accounts";
import type { AccountResult } from "@/types/ranking";
import type { UserProfile } from "@/types/user";
import { checkAllConditions, deriveEligibilityStatus } from "./eligibility";
import { buildExplanation } from "./explanation";
import {
  computeAnnualInterest,
  computeEffectiveBalance,
  computeEstimatedRate,
} from "./interest";

/**
 * Runs the full analysis pipeline for one offer against one user profile.
 * Deterministic: same inputs always produce identical outputs.
 */
export function analyzeOffer(
  offer: SavingsAccountOffer,
  profile: UserProfile
): AccountResult {
  const conditionChecks = checkAllConditions(offer, profile);
  const eligibilityStatus = deriveEligibilityStatus(conditionChecks);

  const isIntroApplicable = !!(
    offer.introRatePa &&
    offer.introMonths &&
    profile.isNewCustomerForIntro
  );

  const effectiveBalance = computeEffectiveBalance(offer, profile.balance);
  const balanceAboveCap = !!(offer.capAmount && profile.balance > offer.capAmount);

  const estimatedRatePa = computeEstimatedRate(
    offer,
    eligibilityStatus,
    isIntroApplicable
  );
  const estimatedAnnualInterest = computeAnnualInterest(effectiveBalance, estimatedRatePa);

  const gapActions = conditionChecks
    .filter((c) => c.gapAction)
    .map((c) => c.gapAction!);

  const explanation = buildExplanation(
    offer,
    conditionChecks,
    eligibilityStatus,
    estimatedRatePa,
    isIntroApplicable,
    balanceAboveCap
  );

  return {
    offer,
    conditionChecks,
    eligibilityStatus,
    estimatedRatePa,
    estimatedAnnualInterest,
    isIntroApplicable,
    balanceAboveCap,
    gapActions,
    explanation,
  };
}

/**
 * Ranks all offers by estimated annual interest (highest first).
 * Tiebreaks on totalMaxRatePa, giving accounts with higher potential a boost.
 */
export function rankOffers(
  offers: SavingsAccountOffer[],
  profile: UserProfile
): AccountResult[] {
  return offers
    .map((offer) => analyzeOffer(offer, profile))
    .sort((a, b) => {
      if (Math.abs(b.estimatedAnnualInterest - a.estimatedAnnualInterest) > 0.01) {
        return b.estimatedAnnualInterest - a.estimatedAnnualInterest;
      }
      return b.offer.totalMaxRatePa - a.offer.totalMaxRatePa;
    });
}
