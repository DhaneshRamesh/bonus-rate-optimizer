/**
 * Inputs describing the user's savings situation and behavioural preferences.
 * All monetary values are in AUD. All rates are % p.a.
 */
export interface UserProfile {
  /** User's age in years. */
  age: number;

  /** Current total savings balance in AUD. */
  balance: number;

  /** Interest rate the user currently earns on their savings, in % p.a. */
  currentRatePa: number;

  /** AUD deposited into savings from external income sources per month. */
  monthlyExternalDeposit: number;

  /** Number of debit/credit card purchases made per month. */
  monthlyCardPurchases: number;

  /**
   * Net AUD change in savings balance per month (deposits minus withdrawals).
   * Positive = balance growing, negative = balance shrinking.
   */
  monthlyNetSavingsGrowth: number;

  /** Whether the user is willing to open a linked transaction account at the same provider. */
  willingToOpenLinkedAccount: boolean;

  /** Whether the user needs to be able to make withdrawals freely at any time. */
  wantsFlexibleWithdrawals: boolean;

  /** Whether the user would be a new customer at this provider (for intro rate eligibility). */
  isNewCustomerForIntro: boolean;
}
