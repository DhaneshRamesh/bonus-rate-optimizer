import { describe, expect, it } from "vitest";
import {
  calculateAnnualInterest,
  computeAnnualInterest,
  computeEffectiveBalance,
  computeEstimatedRate,
} from "@/lib/interest";
import { ACCOUNTS } from "@/data/accounts";
import type { SavingsAccountOffer } from "@/types/accounts";

const BASE_OFFER: SavingsAccountOffer = {
  id: "test",
  provider: "Test Bank",
  productName: "Test Saver",
  baseRatePa: 1.0,
  bonusRatePa: 4.0,
  totalMaxRatePa: 5.0,
  requiresLinkedAccount: false,
  withdrawalFlexibility: "full",
  conditionComplexityScore: 1,
  sourceUrl: "https://example.com",
  sourceLabel: "Official provider page",
  lastChecked: "2025-01-01",
};

const CAPPED_OFFER: SavingsAccountOffer = { ...BASE_OFFER, capAmount: 50_000 };

const INTRO_OFFER: SavingsAccountOffer = {
  ...BASE_OFFER,
  baseRatePa: 3.0,
  bonusRatePa: 0,
  totalMaxRatePa: 5.0,
  introRatePa: 5.0,
  introMonths: 4,
};

// ── computeEffectiveBalance ───────────────────────────────────────────────────

describe("computeEffectiveBalance", () => {
  it("returns full balance when there is no cap", () => {
    expect(computeEffectiveBalance(BASE_OFFER, 100_000)).toBe(100_000);
  });

  it("returns full balance when balance is below the cap", () => {
    expect(computeEffectiveBalance(CAPPED_OFFER, 30_000)).toBe(30_000);
  });

  it("returns the cap when balance exceeds it", () => {
    expect(computeEffectiveBalance(CAPPED_OFFER, 80_000)).toBe(50_000);
  });

  it("returns the cap when balance exactly equals it", () => {
    expect(computeEffectiveBalance(CAPPED_OFFER, 50_000)).toBe(50_000);
  });
});

// ── computeEstimatedRate ──────────────────────────────────────────────────────

describe("computeEstimatedRate", () => {
  it("returns base + bonus when likely_eligible, no intro", () => {
    expect(computeEstimatedRate(BASE_OFFER, "likely_eligible", false)).toBeCloseTo(5.0);
  });

  it("returns base rate only when not_eligible, no intro", () => {
    expect(computeEstimatedRate(BASE_OFFER, "not_eligible", false)).toBeCloseTo(1.0);
  });

  it("returns base rate only when at_risk, no intro", () => {
    expect(computeEstimatedRate(BASE_OFFER, "at_risk", false)).toBeCloseTo(1.0);
  });

  it("returns blended rate when intro is applicable (new customer, no conditions)", () => {
    // (5.0 * 4 + 3.0 * 8) / 12 = (20 + 24) / 12 = 3.667
    const expected = (5.0 * 4 + 3.0 * 8) / 12;
    expect(computeEstimatedRate(INTRO_OFFER, "likely_eligible", true)).toBeCloseTo(expected, 4);
  });

  it("intro not applicable for existing customers — returns base rate", () => {
    expect(computeEstimatedRate(INTRO_OFFER, "likely_eligible", false)).toBeCloseTo(3.0);
  });
});

// ── computeAnnualInterest ─────────────────────────────────────────────────────

describe("computeAnnualInterest", () => {
  it("calculates correctly on a standard balance", () => {
    expect(computeAnnualInterest(100_000, 5.0)).toBeCloseTo(5_000);
  });

  it("returns 0 for zero balance", () => {
    expect(computeAnnualInterest(0, 5.0)).toBe(0);
  });

  it("returns 0 for zero rate", () => {
    expect(computeAnnualInterest(100_000, 0)).toBe(0);
  });

  it("calculates proportionally for fractional rates", () => {
    expect(computeAnnualInterest(10_000, 2.5)).toBeCloseTo(250);
  });
});

// ── calculateAnnualInterest — balance above cap ───────────────────────────────

describe("calculateAnnualInterest — balance above cap", () => {
  // GSB Goal Saver: baseRatePa 0.10%, bonusRatePa 4.90%, cap $50k
  const gsbGoal = ACCOUNTS.find((a) => a.id === "gsb-goal-saver")!;

  it("splits balance: bonus rate on capped portion, base rate on excess", () => {
    const result = calculateAnnualInterest(80_000, gsbGoal, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    expect(result.tierBreakdown).toHaveLength(2);
    expect(result.tierBreakdown[0].amount).toBe(50_000);
    expect(result.tierBreakdown[0].ratePa).toBeCloseTo(5.0); // 0.10 + 4.90
    expect(result.tierBreakdown[1].amount).toBe(30_000);
    expect(result.tierBreakdown[1].ratePa).toBe(0.10);
    // $50k × 5% + $30k × 0.1% = $2,500 + $30 = $2,530
    expect(result.interestAmount).toBeCloseTo(2_530);
    expect(result.capImpact).toBeDefined();
  });

  it("single tier when balance is at or below the cap", () => {
    const result = calculateAnnualInterest(50_000, gsbGoal, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    expect(result.tierBreakdown).toHaveLength(1);
    expect(result.capImpact).toBeUndefined();
    expect(result.interestAmount).toBeCloseTo(2_500); // $50k × 5%
  });
});

// ── calculateAnnualInterest — intro blending ──────────────────────────────────

describe("calculateAnnualInterest — intro blending", () => {
  // Macquarie: baseRatePa 4.75%, introRatePa 4.85% for 4 months, no bonus
  const macquarie = ACCOUNTS.find((a) => a.id === "macquarie-savings")!;
  const balance = 25_000;

  it("blends intro and base rates correctly for new customers", () => {
    const result = calculateAnnualInterest(balance, macquarie, {
      eligibleForBonus: true,
      isNewCustomerForIntro: true,
    });
    // (4.85 × 4 + 4.75 × 8) / 12 = 4.7833...
    const expectedRate = (4.85 * 4 + 4.75 * 8) / 12;
    expect(result.effectiveRatePa).toBeCloseTo(expectedRate, 4);
    expect(result.introImpact).toBeDefined();
    // Blended interest lies between pure-base and pure-intro
    const pureBase = (balance * 4.75) / 100;
    const pureIntro = (balance * 4.85) / 100;
    expect(result.interestAmount).toBeGreaterThan(pureBase);
    expect(result.interestAmount).toBeLessThan(pureIntro);
  });

  it("no blending for existing customers — earns base rate only", () => {
    const result = calculateAnnualInterest(balance, macquarie, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    expect(result.effectiveRatePa).toBeCloseTo(4.75);
    expect(result.introImpact).toBeUndefined();
    expect(result.interestAmount).toBeCloseTo((balance * 4.75) / 100);
  });
});

// ── calculateAnnualInterest — extra benefit can be negative ───────────────────

describe("calculateAnnualInterest — extra annual benefit can be negative", () => {
  // ANZ Plus Growth Saver: baseRatePa 0.01% — extremely low if bonus not earned
  const anzPlus = ACCOUNTS.find((a) => a.id === "anz-plus-growth-saver")!;
  const balance = 25_000;
  const currentRatePa = 3.0;

  it("ineligible user earns far less than their current rate — extra benefit is negative", () => {
    const result = calculateAnnualInterest(balance, anzPlus, {
      eligibleForBonus: false,
      isNewCustomerForIntro: false,
    });
    // base rate 0.01% on $25k = $2.50
    expect(result.interestAmount).toBeCloseTo(2.5);
    const currentInterest = (balance * currentRatePa) / 100; // $750
    const extraBenefit = result.interestAmount - currentInterest;
    expect(extraBenefit).toBeLessThan(0);
  });

  it("eligible user earns the full bonus rate", () => {
    const result = calculateAnnualInterest(balance, anzPlus, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    // 0.01 + 4.99 = 5.00% on $25k = $1,250
    expect(result.interestAmount).toBeCloseTo(1_250);
    const currentInterest = (balance * currentRatePa) / 100;
    expect(result.interestAmount - currentInterest).toBeGreaterThan(0);
  });
});

// ── calculateAnnualInterest — tiered product ──────────────────────────────────

describe("calculateAnnualInterest — tiered product", () => {
  const TIERED_OFFER: SavingsAccountOffer = {
    id: "test-tiered",
    provider: "Test Bank",
    productName: "Tiered Saver",
    baseRatePa: 1.0,
    bonusRatePa: 4.0,
    totalMaxRatePa: 5.0,
    requiresLinkedAccount: false,
    withdrawalFlexibility: "full",
    conditionComplexityScore: 2,
    sourceUrl: "https://example.com",
    sourceLabel: "Official provider page",
    lastChecked: "2025-01-01",
    tiers: [
      { upTo: 10_000, ratePa: 5.0 },
      { upTo: 50_000, ratePa: 4.0 },
      // balance above $50k falls back to baseRatePa
    ],
  };

  it("allocates balance across tiers and uses base rate for the remainder", () => {
    const result = calculateAnnualInterest(60_000, TIERED_OFFER, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    expect(result.tierBreakdown).toHaveLength(3);
    expect(result.tierBreakdown[0]).toMatchObject({ amount: 10_000, ratePa: 5.0 });
    expect(result.tierBreakdown[1]).toMatchObject({ amount: 40_000, ratePa: 4.0 });
    expect(result.tierBreakdown[2]).toMatchObject({ amount: 10_000, ratePa: 1.0 });
    // $10k × 5% + $40k × 4% + $10k × 1% = $500 + $1,600 + $100 = $2,200
    expect(result.interestAmount).toBeCloseTo(2_200);
    expect(result.effectiveRatePa).toBeCloseTo((2_200 / 60_000) * 100, 4);
  });

  it("ignores tiers when not eligible — single segment at base rate", () => {
    const result = calculateAnnualInterest(60_000, TIERED_OFFER, {
      eligibleForBonus: false,
      isNewCustomerForIntro: false,
    });
    expect(result.tierBreakdown).toHaveLength(1);
    expect(result.tierBreakdown[0].ratePa).toBe(1.0);
    expect(result.interestAmount).toBeCloseTo(600); // $60k × 1%
  });
});

// ── calculateAnnualInterest — no-fuss account ─────────────────────────────────

describe("calculateAnnualInterest — no-fuss account", () => {
  it("GSB Everyday Saver: single tier, no cap or intro, correct interest", () => {
    const everyday = ACCOUNTS.find((a) => a.id === "gsb-everyday-saver")!;
    const result = calculateAnnualInterest(10_000, everyday, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    expect(result.tierBreakdown).toHaveLength(1);
    expect(result.capImpact).toBeUndefined();
    expect(result.introImpact).toBeUndefined();
    expect(result.interestAmount).toBeCloseTo(50); // $10k × 0.5%
    expect(result.effectiveRatePa).toBeCloseTo(0.5);
  });

  it("same result whether eligibleForBonus is true or false (no bonus exists)", () => {
    const everyday = ACCOUNTS.find((a) => a.id === "gsb-everyday-saver")!;
    const eligible = calculateAnnualInterest(10_000, everyday, {
      eligibleForBonus: true,
      isNewCustomerForIntro: false,
    });
    const ineligible = calculateAnnualInterest(10_000, everyday, {
      eligibleForBonus: false,
      isNewCustomerForIntro: false,
    });
    expect(eligible.interestAmount).toBeCloseTo(ineligible.interestAmount);
  });
});
