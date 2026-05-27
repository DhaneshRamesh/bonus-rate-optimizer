import { analyzeAccount, rankAccounts } from "@/lib/engine";
import type { SavingsAccount, UserProfile } from "@/lib/types";

const ING_ACCOUNT: SavingsAccount = {
  id: "ing",
  bank: "ING",
  accountName: "Savings Maximiser",
  bankInitials: "ING",
  bankColor: "#FF6600",
  baseRate: 0.55,
  bonusRate: 4.95,
  advertisedRate: 5.50,
  balanceCap: 100_000,
  conditions: [
    {
      type: "linked_account_required",
      linkedAccount: "Orange Everyday",
      label: "Hold an ING Orange Everyday account",
      shortLabel: "Linked account",
    },
    {
      type: "min_monthly_deposit",
      amount: 1_000,
      label: "Deposit $1,000+ per month",
      shortLabel: "$1,000 deposit",
    },
    {
      type: "min_card_transactions",
      count: 5,
      linkedAccount: "Orange Everyday",
      label: "5+ card purchases with Orange Everyday",
      shortLabel: "5+ card txns",
    },
    {
      type: "balance_growth",
      label: "Balance must grow each month",
      shortLabel: "Balance grows",
    },
  ],
  notes: [],
  sourceNote: "Demo data",
};

const NO_CONDITIONS_ACCOUNT: SavingsAccount = {
  id: "macquarie",
  bank: "Macquarie",
  accountName: "Savings Account",
  bankInitials: "MQG",
  bankColor: "#1A1F5E",
  baseRate: 4.75,
  bonusRate: 0,
  advertisedRate: 4.75,
  introRate: 4.85,
  introMonths: 4,
  conditions: [],
  notes: [],
  sourceNote: "Demo data",
};

const FULLY_ELIGIBLE_PROFILE: UserProfile = {
  age: 28,
  currentBalance: 50_000,
  monthlyDeposit: 2_000,
  monthlyCardTransactions: 10,
  balanceWillGrow: true,
  willingToLinkAccount: true,
  isNewCustomer: false,
};

const INELIGIBLE_PROFILE: UserProfile = {
  age: 35,
  currentBalance: 10_000,
  monthlyDeposit: 0,
  monthlyCardTransactions: 0,
  balanceWillGrow: false,
  willingToLinkAccount: false,
  isNewCustomer: false,
};

describe("analyzeAccount — ING Savings Maximiser", () => {
  test("fully eligible profile earns full advertised rate", () => {
    const result = analyzeAccount(ING_ACCOUNT, FULLY_ELIGIBLE_PROFILE);
    expect(result.allBonusConditionsMet).toBe(true);
    expect(result.eligibilityScore).toBe(100);
    expect(result.estimatedRate).toBeCloseTo(5.50, 2);
  });

  test("fully eligible profile: annual interest = balance * rate / 100 (capped at $100k)", () => {
    const result = analyzeAccount(ING_ACCOUNT, FULLY_ELIGIBLE_PROFILE);
    // Balance is $50k, under cap — full balance earns the rate
    expect(result.estimatedAnnualInterest).toBeCloseTo((50_000 * 5.50) / 100, 1);
  });

  test("ineligible profile earns only base rate", () => {
    const result = analyzeAccount(ING_ACCOUNT, INELIGIBLE_PROFILE);
    expect(result.allBonusConditionsMet).toBe(false);
    expect(result.estimatedRate).toBeCloseTo(0.55, 2);
  });

  test("ineligible profile: gapActions lists all unmet conditions", () => {
    const result = analyzeAccount(ING_ACCOUNT, INELIGIBLE_PROFILE);
    expect(result.gapActions.length).toBeGreaterThan(0);
    expect(result.gapActions.some((a) => a.includes("1,000"))).toBe(true);
    expect(result.gapActions.some((a) => a.includes("5 card"))).toBe(true);
  });

  test("balance exceeding cap is flagged", () => {
    const bigBalance: UserProfile = {
      ...FULLY_ELIGIBLE_PROFILE,
      currentBalance: 150_000,
    };
    const result = analyzeAccount(ING_ACCOUNT, bigBalance);
    expect(result.balanceExceedsCap).toBe(true);
    // Interest calculated on capped balance only
    expect(result.estimatedAnnualInterest).toBeCloseTo((100_000 * 5.50) / 100, 1);
  });

  test("eligibility score is proportional to conditions met", () => {
    const partialProfile: UserProfile = {
      ...FULLY_ELIGIBLE_PROFILE,
      willingToLinkAccount: false,
      monthlyCardTransactions: 2, // under 5
    };
    const result = analyzeAccount(ING_ACCOUNT, partialProfile);
    expect(result.conditionsMetCount).toBe(2); // deposit + balance_growth met
    expect(result.totalConditions).toBe(4);
    expect(result.eligibilityScore).toBe(50);
  });
});

describe("analyzeAccount — Macquarie (no conditions, intro rate)", () => {
  test("non-new-customer earns base rate", () => {
    const result = analyzeAccount(NO_CONDITIONS_ACCOUNT, FULLY_ELIGIBLE_PROFILE);
    expect(result.estimatedRate).toBeCloseTo(4.75, 2);
    expect(result.isIntroApplicable).toBe(false);
    expect(result.eligibilityScore).toBe(100);
  });

  test("new customer earns blended intro rate", () => {
    const newCustomer: UserProfile = { ...FULLY_ELIGIBLE_PROFILE, isNewCustomer: true };
    const result = analyzeAccount(NO_CONDITIONS_ACCOUNT, newCustomer);
    // Blended = (4.85 * 4 + 4.75 * 8) / 12
    const expected = (4.85 * 4 + 4.75 * 8) / 12;
    expect(result.estimatedRate).toBeCloseTo(expected, 4);
    expect(result.isIntroApplicable).toBe(true);
  });
});

describe("rankAccounts", () => {
  test("returns same number of results as input accounts", () => {
    const results = rankAccounts([ING_ACCOUNT, NO_CONDITIONS_ACCOUNT], FULLY_ELIGIBLE_PROFILE);
    expect(results).toHaveLength(2);
  });

  test("higher estimated interest ranks first", () => {
    const results = rankAccounts([ING_ACCOUNT, NO_CONDITIONS_ACCOUNT], FULLY_ELIGIBLE_PROFILE);
    // ING at 5.50% > Macquarie at 4.75% for $50k balance
    expect(results[0].account.id).toBe("ing");
  });

  test("when ineligible for bonus, lower interest account may rank higher", () => {
    // If user can't meet ING conditions, Macquarie (no conditions) may rank higher
    const results = rankAccounts([ING_ACCOUNT, NO_CONDITIONS_ACCOUNT], INELIGIBLE_PROFILE);
    // ING base = 0.55%, Macquarie base = 4.75%
    expect(results[0].account.id).toBe("macquarie");
  });

  test("result is deterministic — same inputs always produce same output", () => {
    const r1 = rankAccounts([ING_ACCOUNT, NO_CONDITIONS_ACCOUNT], FULLY_ELIGIBLE_PROFILE);
    const r2 = rankAccounts([ING_ACCOUNT, NO_CONDITIONS_ACCOUNT], FULLY_ELIGIBLE_PROFILE);
    expect(r1[0].account.id).toBe(r2[0].account.id);
    expect(r1[0].estimatedRate).toBe(r2[0].estimatedRate);
    expect(r1[0].estimatedAnnualInterest).toBe(r2[0].estimatedAnnualInterest);
  });
});
