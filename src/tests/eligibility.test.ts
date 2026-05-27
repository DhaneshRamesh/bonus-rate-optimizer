import { describe, expect, it } from "vitest";
import { checkCondition } from "@/lib/eligibility";
import type { AccountCondition } from "@/types/accounts";
import type { UserProfile } from "@/types/user";

const BASE_PROFILE: UserProfile = {
  age: 28,
  currentBalance: 25_000,
  monthlyDeposit: 1_000,
  monthlyCardTransactions: 5,
  balanceWillGrow: true,
  willingToLinkAccount: true,
  isNewCustomer: false,
};

describe("checkCondition — min_monthly_deposit", () => {
  const condition: AccountCondition = {
    type: "min_monthly_deposit",
    amount: 1_000,
    label: "Deposit $1,000+ per month",
    shortLabel: "$1,000 deposit",
  };

  it("returns met=true when deposit meets requirement", () => {
    const result = checkCondition(condition, BASE_PROFILE);
    expect(result.met).toBe(true);
    expect(result.gapAction).toBeNull();
  });

  it("returns met=false and a gapAction when deposit is below requirement", () => {
    const profile = { ...BASE_PROFILE, monthlyDeposit: 500 };
    const result = checkCondition(condition, profile);
    expect(result.met).toBe(false);
    expect(result.gapAction).toContain("1,000");
  });

  it("is met when deposit exactly equals requirement", () => {
    const result = checkCondition(condition, BASE_PROFILE);
    expect(result.met).toBe(true);
  });
});

describe("checkCondition — balance_growth", () => {
  const condition: AccountCondition = {
    type: "balance_growth",
    label: "Balance must grow each month",
    shortLabel: "Balance grows",
  };

  it("met when balanceWillGrow is true", () => {
    const result = checkCondition(condition, BASE_PROFILE);
    expect(result.met).toBe(true);
  });

  it("not met when balanceWillGrow is false, provides gap action", () => {
    const result = checkCondition(condition, { ...BASE_PROFILE, balanceWillGrow: false });
    expect(result.met).toBe(false);
    expect(result.gapAction).toBeTruthy();
  });
});

describe("checkCondition — min_card_transactions", () => {
  const condition: AccountCondition = {
    type: "min_card_transactions",
    count: 5,
    linkedAccount: "Orange Everyday",
    label: "5+ card purchases with Orange Everyday",
    shortLabel: "5+ card txns",
  };

  it("met when transactions meet the count", () => {
    const result = checkCondition(condition, BASE_PROFILE);
    expect(result.met).toBe(true);
  });

  it("not met when transactions are below count", () => {
    const result = checkCondition(condition, { ...BASE_PROFILE, monthlyCardTransactions: 3 });
    expect(result.met).toBe(false);
    expect(result.gapAction).toContain("Orange Everyday");
  });
});

describe("checkCondition — linked_account_required", () => {
  const condition: AccountCondition = {
    type: "linked_account_required",
    linkedAccount: "Orange Everyday",
    label: "Hold an ING Orange Everyday account",
    shortLabel: "Linked account",
  };

  it("met when user is willing to link", () => {
    expect(checkCondition(condition, BASE_PROFILE).met).toBe(true);
  });

  it("not met when user is unwilling, gapAction names the account", () => {
    const result = checkCondition(condition, { ...BASE_PROFILE, willingToLinkAccount: false });
    expect(result.met).toBe(false);
    expect(result.gapAction).toContain("Orange Everyday");
  });
});

describe("checkCondition — age_max", () => {
  const condition: AccountCondition = {
    type: "age_max",
    maxAge: 29,
    label: "Must be 29 or under",
    shortLabel: "Age ≤ 29",
  };

  it("met when age is within limit", () => {
    expect(checkCondition(condition, BASE_PROFILE).met).toBe(true); // age 28
  });

  it("not met when age exceeds limit", () => {
    const result = checkCondition(condition, { ...BASE_PROFILE, age: 35 });
    expect(result.met).toBe(false);
    expect(result.gapAction).toBeNull(); // can't change age
  });
});
