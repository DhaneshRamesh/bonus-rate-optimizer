import type { SavingsAccountOffer } from "@/types/accounts";
import type { AccountResult, RankedAccount, RankAccountsResult, DistinctRecommendationCards } from "@/types/ranking";
import type { UserProfile } from "@/types/user";
import { checkAllConditions, checkEligibility, deriveEligibilityStatus } from "./eligibility";
import { buildConditionSummary } from "./explanation";
import {
  calculateAnnualInterest,
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

  const explanation = buildConditionSummary(
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

// ── rankAccounts ──────────────────────────────────────────────────────────────

/** True when the account has no monthly behavioural conditions. */
function isNoFussAccount(account: SavingsAccountOffer): boolean {
  return (
    account.monthlyDepositRequirement === undefined &&
    account.monthlyCardPurchaseRequirement === undefined &&
    !account.monthlyGrowthRequirement &&
    !account.requiresLinkedAccount
  );
}

/** True when the account does not require balance growth to earn its bonus. */
function isFlexibleAccount(account: SavingsAccountOffer): boolean {
  return account.withdrawalFlexibility !== "growth-sensitive";
}

function buildRankedAccount(
  account: SavingsAccountOffer,
  user: UserProfile
): RankedAccount {
  const eligibility = checkEligibility(user, account);
  const eligibleForBonus = eligibility.status === "likely_eligible";

  const calc = calculateAnnualInterest(user.balance, account, {
    eligibleForBonus,
    isNewCustomerForIntro: user.isNewCustomerForIntro,
  });

  const annualInterest = calc.interestAmount;
  const effectiveRatePa = calc.effectiveRatePa;
  const extraAnnualBenefit = annualInterest - (user.balance * user.currentRatePa) / 100;

  let potentialAnnualInterest: number | undefined;
  let potentialUpside: number | undefined;
  
  if (!eligibility.hardIneligible) {
    const potentialCalc = calculateAnnualInterest(user.balance, account, {
      eligibleForBonus: true,
      isNewCustomerForIntro: user.isNewCustomerForIntro,
    });
    potentialAnnualInterest = potentialCalc.interestAmount;
    potentialUpside = potentialAnnualInterest - annualInterest;
  }

  const noFuss = isNoFussAccount(account);
  const flexible = isFlexibleAccount(account);

  // ── Category tags ──────────────────────────────────────────────────────────
  const categoryTags: string[] = [];
  if (noFuss) categoryTags.push("No Fuss");
  if (flexible) categoryTags.push("Flexible Access");
  if (account.introRatePa !== undefined && user.isNewCustomerForIntro) categoryTags.push("Intro Rate");
  if (account.ageMin !== undefined || account.ageMax !== undefined) categoryTags.push("Age Restricted");
  if (account.capAmount !== undefined) categoryTags.push("Balance Cap");

  // ── Rank reasons ───────────────────────────────────────────────────────────
  const rankReasons: string[] = [];

  if (noFuss) {
    rankReasons.push("No monthly hoops");
  } else if (eligibleForBonus && eligibility.metConditions.length > 0) {
    rankReasons.push("You meet all conditions");
  } else if (eligibility.status === "at_risk") {
    if (
      account.monthlyGrowthRequirement &&
      eligibility.unmetConditions.some((c) => c.conditionKey === "monthly_growth")
    ) {
      rankReasons.push("You may miss the bonus due to the monthly growth requirement");
    }
  }

  if (account.capAmount !== undefined && user.balance <= account.capAmount) {
    rankReasons.push("Your balance is within the bonus cap");
  }

  if (calc.introImpact) {
    rankReasons.push("Introductory rate boosts Year 1 return");
  }

  if (account.withdrawalFlexibility === "full") {
    rankReasons.push("Flexible withdrawals — no restrictions");
  }

  // ── Risks ──────────────────────────────────────────────────────────────────
  const risks: string[] = eligibility.unmetConditions.map((c) => c.explanation);

  if (calc.capImpact) risks.push(calc.capImpact);

  // Growth-sensitive accounts risk forfeiting bonus with any net withdrawal.
  if (account.withdrawalFlexibility === "growth-sensitive" && !eligibility.hardIneligible) {
    risks.push("Any net withdrawal this month forfeits the entire bonus");
  }

  // Generic at-risk notice when no specific unmet condition surfaced it already.
  if (eligibility.status === "at_risk" && eligibility.unmetConditions.length === 0) {
    risks.push("Bonus is at risk — review conditions monthly");
  }

  if (eligibility.hardIneligible) {
    // If there's an age restriction error, it's already in unmetConditions.
    // We can add a generic hard restriction notice if we want.
    if (!eligibility.unmetConditions.some((c) => c.conditionKey === "age")) {
       risks.push("You do not qualify for this account under the current assumptions");
    }
  }

  return {
    account,
    eligibility,
    annualInterest,
    potentialAnnualInterest,
    potentialUpside,
    effectiveRatePa,
    extraAnnualBenefit,
    categoryTags,
    rankReasons,
    risks,
    isNoFuss: noFuss,
    isFlexibleWithdrawals: flexible,
  };
}

/**
 * Ranks all offers by realistic annual interest and surfaces category winners.
 *
 * Sorting rules:
 *   1. Higher annualInterest wins.
 *   2. Within $5/year, likely_eligible beats at_risk.
 *   3. Tiebreak on totalMaxRatePa.
 *
 * Hard-ineligible accounts (age restriction) appear in overall but cannot
 * win a category (bestMaxReturn / bestNoFuss / bestFlexibleWithdrawals).
 *
 * Deterministic: same inputs always produce identical outputs.
 */
export function rankAccounts(
  accounts: SavingsAccountOffer[],
  user: UserProfile
): RankAccountsResult {
  const overall = accounts
    .map((account) => buildRankedAccount(account, user))
    .sort((a, b) => {
      const diff = b.annualInterest - a.annualInterest;
      if (Math.abs(diff) < 5) {
        const aScore = a.eligibility.status === "likely_eligible" ? 1 : 0;
        const bScore = b.eligibility.status === "likely_eligible" ? 1 : 0;
        if (bScore !== aScore) return bScore - aScore;
      }
      if (diff !== 0) return diff;
      return b.account.totalMaxRatePa - a.account.totalMaxRatePa;
    });

  // overall is already sorted — filter preserves that order.
  const eligible = overall.filter((r) => !r.eligibility.hardIneligible);

  const bestMaxReturn = eligible[0] as RankedAccount | undefined;
  if (bestMaxReturn) {
    bestMaxReturn.categoryTags.unshift("Best Match");
    bestMaxReturn.rankReasons.unshift("Highest estimated return based on your balance");
  }

  const bestNoFuss = eligible.find((r) => r.isNoFuss);
  const bestFlexibleWithdrawals = eligible.find((r) => r.isFlexibleWithdrawals);

  return { overall, bestMaxReturn, bestNoFuss, bestFlexibleWithdrawals };
}

/**
 * Returns distinct accounts for the summary cards.
 * If the top Best Match is also the Best No Fuss, it tries to find the next best No Fuss account
 * so the summary cards show different options. It falls back to duplicates if no alternative exists.
 */
export function getDistinctRecommendationCards(results: RankAccountsResult): DistinctRecommendationCards {
  const eligible = results.overall.filter((r) => !r.eligibility.hardIneligible);

  const displayBestMatch = eligible[0];
  
  if (!displayBestMatch) {
    return { noFussIsDuplicate: false, flexibleIsDuplicate: false };
  }

  // Find a distinct No Fuss account
  let displayNoFuss = eligible.find(
    (r) => r.isNoFuss && r.account.id !== displayBestMatch.account.id
  );
  let noFussIsDuplicate = false;
  
  if (!displayNoFuss) {
    displayNoFuss = results.bestNoFuss;
    if (displayNoFuss?.account.id === displayBestMatch.account.id) {
      noFussIsDuplicate = true;
    }
  }

  // Find a distinct Flexible account
  let displayFlexible = eligible.find(
    (r) => r.isFlexibleWithdrawals &&
           r.account.id !== displayBestMatch.account.id &&
           r.account.id !== displayNoFuss?.account.id
  );
  let flexibleIsDuplicate = false;

  if (!displayFlexible) {
    displayFlexible = results.bestFlexibleWithdrawals;
    if (displayFlexible && (displayFlexible.account.id === displayBestMatch.account.id || displayFlexible.account.id === displayNoFuss?.account.id)) {
      flexibleIsDuplicate = true;
    }
  }

  return {
    displayBestMatch,
    displayNoFuss,
    displayFlexible,
    noFussIsDuplicate,
    flexibleIsDuplicate,
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
