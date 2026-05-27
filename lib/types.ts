export type ConditionType =
  | "min_monthly_deposit"
  | "balance_growth"
  | "no_withdrawals"
  | "min_card_transactions"
  | "linked_account_required"
  | "age_max";

export interface AccountCondition {
  type: ConditionType;
  amount?: number;         // for min_monthly_deposit
  count?: number;          // for min_card_transactions
  linkedAccount?: string;  // for linked_account_required, min_card_transactions
  maxAge?: number;         // for age_max
  label: string;
  shortLabel: string;
}

export interface SavingsAccount {
  id: string;
  bank: string;
  accountName: string;
  bankInitials: string;
  bankColor: string;
  baseRate: number;        // % p.a., always earned
  bonusRate: number;       // % p.a., earned when all conditions met
  advertisedRate: number;  // baseRate + bonusRate (headline rate)
  introRate?: number;      // higher rate for new customers (intro period)
  introMonths?: number;    // months the intro rate applies
  balanceCap?: number;     // AUD — only this much earns bonus rate
  conditions: AccountCondition[];
  notes: string[];
  sourceNote: string;
}

export interface UserProfile {
  age: number;
  currentBalance: number;          // AUD
  monthlyDeposit: number;          // AUD per month
  monthlyCardTransactions: number; // count per month
  balanceWillGrow: boolean;        // expects net positive each month
  willingToLinkAccount: boolean;   // open to a linked transaction account
  isNewCustomer: boolean;          // for intro rate eligibility
}

export interface ConditionCheck {
  condition: AccountCondition;
  met: boolean;
  userValueLabel: string;
  requiredValueLabel: string;
  gapAction: string | null;
}

export interface AccountResult {
  account: SavingsAccount;
  conditionChecks: ConditionCheck[];
  allBonusConditionsMet: boolean;
  conditionsMetCount: number;
  totalConditions: number;
  eligibilityScore: number;       // 0–100
  estimatedRate: number;          // effective % p.a. based on profile
  estimatedAnnualInterest: number; // AUD
  isIntroApplicable: boolean;
  balanceExceedsCap: boolean;
  gapActions: string[];
  explanation: string;            // deterministic plain-English
}
