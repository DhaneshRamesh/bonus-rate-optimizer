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
  bonusRate: number;       // % p.a., earned when all conditions are met
  advertisedRate: number;  // baseRate + bonusRate (headline rate on the tin)
  introRate?: number;      // higher rate for new customers during intro period
  introMonths?: number;    // how many months the intro rate applies
  balanceCap?: number;     // AUD — only this portion earns the bonus rate
  conditions: AccountCondition[];
  notes: string[];
  sourceNote: string;
}
