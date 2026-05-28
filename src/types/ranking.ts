import type { EligibilityStatus, SavingsAccountOffer } from "./accounts";

export type EligibilityReason = {
  conditionKey:
    | "age"
    | "linked_account"
    | "monthly_deposit"
    | "card_purchases"
    | "monthly_growth"
    | "balance_cap"
    | "intro_eligibility"
    | "provider_terms"
    | "withdrawal_flexibility";
  status: "met" | "unmet" | "warning";
  label: string;
  userValue?: string | number | boolean;
  requiredValue?: string | number | boolean;
  explanation: string;
  sourceUrl: string;
  sourceLabel: string;
};

/** Flat result returned by checkEligibility — used by UI components. */
export interface EligibilityResult {
  status: EligibilityStatus;
  /** True when a hard restriction (like age or linked account refusal) makes the user completely ineligible. */
  hardIneligible: boolean;
  /** Structured conditions the user currently meets. */
  metConditions: EligibilityReason[];
  /** Structured conditions the user does not currently meet. */
  unmetConditions: EligibilityReason[];
  /** Advisory notices (intro rates, balance caps, stale data, withdrawal caveats). */
  warnings: EligibilityReason[];
}

/** A single account fully analysed and ranked against the user's profile. */
export interface RankedAccount {
  account: SavingsAccountOffer;
  eligibility: EligibilityResult;
  /** Estimated annual interest in AUD at the realistic rate (non-compounding). */
  annualInterest: number;
  /** Potential annual interest if all behavioural conditions were met (non-compounding). */
  potentialAnnualInterest?: number;
  /** Difference between potential and expected annual interest. */
  potentialUpside?: number;
  /** Effective annual rate the user would realistically earn, in % p.a. */
  effectiveRatePa: number;
  /** annualInterest minus what the user currently earns at their currentRatePa. */
  extraAnnualBenefit: number;
  /** UI labels: "Best Match", "No Fuss", "Flexible Access", "Intro Rate", etc. */
  categoryTags: string[];
  /** Plain-English reasons why this account is or isn't a good fit. */
  rankReasons: string[];
  /** Things that could cause the user to miss the bonus or be worse off. */
  risks: string[];
  /** True when the account has no monthly behavioural conditions. */
  isNoFuss: boolean;
  /** True when withdrawalFlexibility is not "growth-sensitive". */
  isFlexibleWithdrawals: boolean;
}

/** Return value of rankAccounts. */
export interface RankAccountsResult {
  overall: RankedAccount[]; // All accounts sorted by annualInterest descending
  bestMaxReturn?: RankedAccount; // Highest absolute return
  bestNoFuss?: RankedAccount; // Highest return among no-fuss accounts
  bestFlexibleWithdrawals?: RankedAccount; // Highest return among flexible withdrawal accounts
}

export interface DistinctRecommendationCards {
  displayBestMatch?: RankedAccount;
  displayNoFuss?: RankedAccount;
  displayFlexible?: RankedAccount;
  noFussIsDuplicate: boolean;
  flexibleIsDuplicate: boolean;
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
