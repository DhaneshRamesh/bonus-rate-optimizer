import { describe, expect, it } from "vitest";
import { analyzeAccount, rankAccounts } from "@/lib/ranking";
import type { SavingsAccount } from "@/types/accounts";
import type { UserProfile } from "@/types/user";

const HIGH_BONUS_ACCOUNT: SavingsAccount = {
  id: "high-bonus",
  bank: "Test Bank",
  accountName: "High Bonus",
  bankInitials: "HB",
  bankColor: "#000",
  baseRate: 0.5,
  bonusRate: 5.0,
  advertisedRate: 5.5,
  balanceCap: 100_000,
  conditions: [
    { type: "min_monthly_deposit", amount: 1_000, label: "Deposit $1k", shortLabel: "$1k deposit" },
    { type: "min_card_transactions", count: 5, label: "5+ txns", shortLabel: "5+ txns" },
  ],
  notes: [],
  sourceNote: "Test data",
};

const NO_CONDITIONS_ACCOUNT: SavingsAccount = {
  id: "no-conditions",
  bank: "Easy Bank",
  accountName: "Base Rate",
  bankInitials: "EB",
  bankColor: "#000",
  baseRate: 4.0,
  bonusRate: 0,
  advertisedRate: 4.0,
  conditions: [],
  notes: [],
  sourceNote: "Test data",
};

const ELIGIBLE_PROFILE: UserProfile = {
  age: 30,
  currentBalance: 50_000,
  monthlyDeposit: 2_000,
  monthlyCardTransactions: 10,
  balanceWillGrow: true,
  willingToLinkAccount: true,
  isNewCustomer: false,
};

const INELIGIBLE_PROFILE: UserProfile = {
  age: 30,
  currentBalance: 50_000,
  monthlyDeposit: 0,
  monthlyCardTransactions: 0,
  balanceWillGrow: false,
  willingToLinkAccount: false,
  isNewCustomer: false,
};

describe("analyzeAccount", () => {
  it("eligible profile earns full advertised rate", () => {
    const result = analyzeAccount(HIGH_BONUS_ACCOUNT, ELIGIBLE_PROFILE);
    expect(result.allBonusConditionsMet).toBe(true);
    expect(result.eligibilityScore).toBe(100);
    expect(result.estimatedRate).toBeCloseTo(5.5);
  });

  it("ineligible profile earns only base rate", () => {
    const result = analyzeAccount(HIGH_BONUS_ACCOUNT, INELIGIBLE_PROFILE);
    expect(result.allBonusConditionsMet).toBe(false);
    expect(result.estimatedRate).toBeCloseTo(0.5);
  });

  it("gapActions includes actionable steps for unmet conditions", () => {
    const result = analyzeAccount(HIGH_BONUS_ACCOUNT, INELIGIBLE_PROFILE);
    expect(result.gapActions.length).toBeGreaterThan(0);
    expect(result.gapActions.some((a) => a.includes("1,000"))).toBe(true);
  });

  it("balanceExceedsCap is flagged correctly", () => {
    const bigBalance = { ...ELIGIBLE_PROFILE, currentBalance: 150_000 };
    const result = analyzeAccount(HIGH_BONUS_ACCOUNT, bigBalance);
    expect(result.balanceExceedsCap).toBe(true);
    // Interest computed on cap, not full balance
    expect(result.estimatedAnnualInterest).toBeCloseTo((100_000 * 5.5) / 100);
  });

  it("no-conditions account is always 100% eligible", () => {
    const result = analyzeAccount(NO_CONDITIONS_ACCOUNT, INELIGIBLE_PROFILE);
    expect(result.eligibilityScore).toBe(100);
    expect(result.allBonusConditionsMet).toBe(true);
  });
});

describe("rankAccounts", () => {
  it("eligible-for-bonus account ranks above no-conditions account when it earns more", () => {
    const results = rankAccounts(
      [HIGH_BONUS_ACCOUNT, NO_CONDITIONS_ACCOUNT],
      ELIGIBLE_PROFILE
    );
    // 5.5% on $50k = $2,750 > 4.0% on $50k = $2,000
    expect(results[0].account.id).toBe("high-bonus");
  });

  it("no-conditions account ranks above bonus account when user is ineligible", () => {
    const results = rankAccounts(
      [HIGH_BONUS_ACCOUNT, NO_CONDITIONS_ACCOUNT],
      INELIGIBLE_PROFILE
    );
    // HIGH_BONUS earns 0.5% base; no-conditions earns 4.0%
    expect(results[0].account.id).toBe("no-conditions");
  });

  it("returns same count as input", () => {
    const results = rankAccounts(
      [HIGH_BONUS_ACCOUNT, NO_CONDITIONS_ACCOUNT],
      ELIGIBLE_PROFILE
    );
    expect(results).toHaveLength(2);
  });

  it("is deterministic — same inputs always yield same output", () => {
    const r1 = rankAccounts([HIGH_BONUS_ACCOUNT, NO_CONDITIONS_ACCOUNT], ELIGIBLE_PROFILE);
    const r2 = rankAccounts([HIGH_BONUS_ACCOUNT, NO_CONDITIONS_ACCOUNT], ELIGIBLE_PROFILE);
    expect(r1[0].account.id).toBe(r2[0].account.id);
    expect(r1[0].estimatedRate).toBe(r2[0].estimatedRate);
    expect(r1[0].estimatedAnnualInterest).toBe(r2[0].estimatedAnnualInterest);
  });
});
