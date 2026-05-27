import type { EligibilityStatus, SavingsAccountOffer } from "./accounts";

/** Flat result returned by checkEligibility — used by UI components. */
export interface EligibilityResult {
  status: EligibilityStatus;
  /** True only for age restrictions — cannot be actioned by the user. */
  hardIneligible: boolean;
  /** Human-readable conditions the user currently meets. */
  metConditions: string[];
  /** Human-readable conditions the user does not currently meet. */
  unmetConditions: string[];
  /** Advisory notices (intro rates, balance caps, stale data, withdrawal caveats). */
  warnings: string[];
}

/** Result of evaluating one condition against the user's profile. */
export interface ConditionCheck {
  conditionKey:
    | "monthly_deposit"
    | "card_purchases"
    | "balance_growth"
    | "linked_account"
    | "age_min"
    | "age_max"
    | "withdrawal_flexibility";

  /** Short human-readable label for this condition. */
  label: string;

  /** What the account requires (formatted for display). */
  required: string;

  /** What the user currently does (formatted for display). */
  actual: string;

  status: EligibilityStatus;

  /** Actionable suggestion shown when status is at_risk or not_eligible. */
  gapAction?: string;
}

/** Full analysis result for one account offer against one user profile. */
export interface AccountResult {
  offer: SavingsAccountOffer;
  conditionChecks: ConditionCheck[];
  eligibilityStatus: EligibilityStatus;

  /** Effective annual rate the user would realistically earn, in % p.a. */
  estimatedRatePa: number;

  /** Estimated annual interest in AUD (non-compounding, on effective balance). */
  estimatedAnnualInterest: number;

  /** Whether a new-customer intro rate applies to this user for this offer. */
  isIntroApplicable: boolean;

  /** Whether the user's balance exceeds the account's cap amount. */
  balanceAboveCap: boolean;

  /** Plain-English actions the user could take to unlock the bonus rate. */
  gapActions: string[];

  /** Deterministic explanation of why the user would or would not earn the bonus. */
  explanation: string;
}
