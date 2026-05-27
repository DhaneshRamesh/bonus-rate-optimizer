/**
 * Confidence level that a user will earn the bonus rate on a given account,
 * given their stated profile. Determined deterministically by the engine.
 */
export type EligibilityStatus = "likely_eligible" | "at_risk" | "not_eligible";

/**
 * A rate tier for accounts where different balance ranges earn different rates.
 * `upTo` is the inclusive AUD ceiling; undefined means "all balances above."
 */
export interface RateTier {
  upTo?: number;
  ratePa: number;
}

/**
 * One savings account offer in the demo dataset.
 * All monetary values are in AUD. All rates are % p.a.
 */
export interface SavingsAccountOffer {
  id: string;
  provider: string;
  productName: string;

  /** Rate always earned, regardless of whether bonus conditions are met. */
  baseRatePa: number;

  /** Additional rate earned when all bonus conditions are satisfied. */
  bonusRatePa?: number;

  /** Highest rate achievable on this account (base + bonus, or intro if higher). */
  totalMaxRatePa: number;

  /** Promotional rate for new customers during the intro window. */
  introRatePa?: number;

  /** Number of months the intro rate applies for new customers. */
  introMonths?: number;

  /** Whether a separate transaction account must be opened with the same provider. */
  requiresLinkedAccount: boolean;

  /** Minimum AUD deposit from an external source required per month. */
  monthlyDepositRequirement?: number;

  /** Minimum number of card purchases required per month. */
  monthlyCardPurchaseRequirement?: number;

  /** Whether the account balance must grow each month to earn the bonus. */
  monthlyGrowthRequirement?: boolean;

  /** Minimum age (inclusive) to hold this account. */
  ageMin?: number;

  /** Maximum age (inclusive) to hold this account. */
  ageMax?: number;

  /** AUD balance above which the bonus rate no longer applies. */
  capAmount?: number;

  /** Rate tiers for accounts with different rates at different balance ranges. */
  tiers?: RateTier[];

  /**
   * How freely the user can make withdrawals without losing the bonus rate.
   * - "full"                  → withdrawals have no effect on the bonus.
   * - "growth-sensitive"      → the balance must grow each month; a net withdrawal
   *                             that prevents growth forfeits the bonus.
   * - "linked-account-only"   → withdrawals are only available via a linked account.
   */
  withdrawalFlexibility: "full" | "linked-account-only" | "growth-sensitive";

  /** Relative measure of how many hoops exist. 1 = none, 5 = highly complex. */
  conditionComplexityScore: number;

  sourceUrl: string;
  sourceLabel: string;

  /** ISO date string (YYYY-MM-DD) of when this record was last verified. */
  lastChecked: string;

  /** Free-text caveats, assumptions, or unusual conditions. */
  notes?: string;
}
