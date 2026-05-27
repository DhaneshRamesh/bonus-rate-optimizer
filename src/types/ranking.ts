import type { AccountCondition, SavingsAccount } from "./accounts";

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
  eligibilityScore: number;        // 0–100
  estimatedRate: number;           // effective % p.a. based on profile
  estimatedAnnualInterest: number; // AUD
  isIntroApplicable: boolean;
  balanceExceedsCap: boolean;
  gapActions: string[];
  explanation: string;             // deterministic plain-English summary
}
