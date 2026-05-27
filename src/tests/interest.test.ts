import { describe, expect, it } from "vitest";
import {
  computeAnnualInterest,
  computeEffectiveBalance,
  computeEstimatedRate,
} from "@/lib/interest";
import type { SavingsAccount } from "@/types/accounts";

const BASE_ACCOUNT: SavingsAccount = {
  id: "test",
  bank: "Test",
  accountName: "Test Account",
  bankInitials: "TST",
  bankColor: "#000",
  baseRate: 1.0,
  bonusRate: 4.0,
  advertisedRate: 5.0,
  conditions: [],
  notes: [],
  sourceNote: "Test data",
};

const CAPPED_ACCOUNT: SavingsAccount = {
  ...BASE_ACCOUNT,
  balanceCap: 50_000,
};

const INTRO_ACCOUNT: SavingsAccount = {
  ...BASE_ACCOUNT,
  baseRate: 3.0,
  bonusRate: 0,
  advertisedRate: 3.0,
  introRate: 5.0,
  introMonths: 4,
};

describe("computeEffectiveBalance", () => {
  it("returns full balance when no cap", () => {
    expect(computeEffectiveBalance(BASE_ACCOUNT, 100_000)).toBe(100_000);
  });

  it("returns cap when balance exceeds cap", () => {
    expect(computeEffectiveBalance(CAPPED_ACCOUNT, 80_000)).toBe(50_000);
  });

  it("returns full balance when balance is below cap", () => {
    expect(computeEffectiveBalance(CAPPED_ACCOUNT, 30_000)).toBe(30_000);
  });

  it("returns cap exactly when balance equals cap", () => {
    expect(computeEffectiveBalance(CAPPED_ACCOUNT, 50_000)).toBe(50_000);
  });
});

describe("computeEstimatedRate", () => {
  it("returns base + bonus when all conditions are met", () => {
    expect(computeEstimatedRate(BASE_ACCOUNT, true, false)).toBeCloseTo(5.0);
  });

  it("returns only base rate when conditions are not met", () => {
    expect(computeEstimatedRate(BASE_ACCOUNT, false, false)).toBeCloseTo(1.0);
  });

  it("returns blended rate when intro is applicable (new customer)", () => {
    // (5.0 * 4 + 3.0 * 8) / 12 = (20 + 24) / 12 = 3.667
    const blended = (5.0 * 4 + 3.0 * 8) / 12;
    expect(computeEstimatedRate(INTRO_ACCOUNT, false, true)).toBeCloseTo(blended, 4);
  });

  it("intro not applicable for existing customers", () => {
    expect(computeEstimatedRate(INTRO_ACCOUNT, false, false)).toBeCloseTo(3.0);
  });
});

describe("computeAnnualInterest", () => {
  it("calculates interest correctly", () => {
    expect(computeAnnualInterest(100_000, 5.0)).toBeCloseTo(5_000);
  });

  it("returns zero for zero balance", () => {
    expect(computeAnnualInterest(0, 5.0)).toBe(0);
  });

  it("returns zero for zero rate", () => {
    expect(computeAnnualInterest(100_000, 0)).toBe(0);
  });
});
