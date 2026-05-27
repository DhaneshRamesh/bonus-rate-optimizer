import { describe, expect, it } from "vitest";
import {
  computeAnnualInterest,
  computeEffectiveBalance,
  computeEstimatedRate,
} from "@/lib/interest";
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
