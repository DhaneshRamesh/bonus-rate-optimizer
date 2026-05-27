import { describe, expect, it } from "vitest";
import { analyzeOffer, rankOffers } from "@/lib/ranking";
import type { SavingsAccountOffer } from "@/types/accounts";
import type { UserProfile } from "@/types/user";

const HIGH_BONUS_OFFER: SavingsAccountOffer = {
  id: "high-bonus",
  provider: "Test Bank",
  productName: "High Bonus",
  baseRatePa: 0.5,
  bonusRatePa: 5.0,
  totalMaxRatePa: 5.5,
  requiresLinkedAccount: false,
  monthlyDepositRequirement: 1_000,
  monthlyCardPurchaseRequirement: 5,
  capAmount: 100_000,
  withdrawalFlexibility: "growth-sensitive",
  conditionComplexityScore: 4,
  sourceUrl: "https://example.com",
  sourceLabel: "Official provider page",
  lastChecked: "2025-01-01",
};

const NO_CONDITIONS_OFFER: SavingsAccountOffer = {
  id: "no-conditions",
  provider: "Easy Bank",
  productName: "Base Rate",
  baseRatePa: 4.0,
  totalMaxRatePa: 4.0,
  requiresLinkedAccount: false,
  withdrawalFlexibility: "full",
  conditionComplexityScore: 1,
  sourceUrl: "https://example.com",
  sourceLabel: "Official provider page",
  lastChecked: "2025-01-01",
};

const ELIGIBLE_PROFILE: UserProfile = {
  age: 30,
  balance: 50_000,
  currentRatePa: 3.0,
  monthlyExternalDeposit: 2_000,
  monthlyCardPurchases: 10,
  monthlyNetSavingsGrowth: 1_500,
  willingToOpenLinkedAccount: true,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

const INELIGIBLE_PROFILE: UserProfile = {
  age: 30,
  balance: 50_000,
  currentRatePa: 0.5,
  monthlyExternalDeposit: 0,
  monthlyCardPurchases: 0,
  monthlyNetSavingsGrowth: -500,
  willingToOpenLinkedAccount: false,
  wantsFlexibleWithdrawals: true,
  isNewCustomerForIntro: false,
};

// ── analyzeOffer ──────────────────────────────────────────────────────────────

describe("analyzeOffer", () => {
  it("eligible profile → likely_eligible, earns full rate", () => {
    const result = analyzeOffer(HIGH_BONUS_OFFER, ELIGIBLE_PROFILE);
    expect(result.eligibilityStatus).toBe("likely_eligible");
    expect(result.estimatedRatePa).toBeCloseTo(5.5);
  });

  it("ineligible profile → not_eligible, earns only base rate", () => {
    const result = analyzeOffer(HIGH_BONUS_OFFER, INELIGIBLE_PROFILE);
    expect(result.eligibilityStatus).toBe("not_eligible");
    expect(result.estimatedRatePa).toBeCloseTo(0.5);
  });

  it("no-conditions offer → always likely_eligible", () => {
    const result = analyzeOffer(NO_CONDITIONS_OFFER, INELIGIBLE_PROFILE);
    expect(result.eligibilityStatus).toBe("likely_eligible");
    expect(result.estimatedRatePa).toBeCloseTo(4.0);
  });

  it("gapActions populated when conditions are not met", () => {
    const result = analyzeOffer(HIGH_BONUS_OFFER, INELIGIBLE_PROFILE);
    expect(result.gapActions.length).toBeGreaterThan(0);
    expect(result.gapActions.some((a) => a.includes("1,000"))).toBe(true);
  });

  it("balanceAboveCap flagged, interest computed on cap not full balance", () => {
    const bigBalance: UserProfile = { ...ELIGIBLE_PROFILE, balance: 150_000 };
    const result = analyzeOffer(HIGH_BONUS_OFFER, bigBalance);
    expect(result.balanceAboveCap).toBe(true);
    // effective balance capped at $100k
    expect(result.estimatedAnnualInterest).toBeCloseTo((100_000 * 5.5) / 100);
  });

  it("isIntroApplicable when offer has intro and user is new customer", () => {
    const introOffer: SavingsAccountOffer = {
      ...NO_CONDITIONS_OFFER,
      introRatePa: 5.5,
      introMonths: 4,
    };
    const newCustomer: UserProfile = { ...ELIGIBLE_PROFILE, isNewCustomerForIntro: true };
    const result = analyzeOffer(introOffer, newCustomer);
    expect(result.isIntroApplicable).toBe(true);
    // blended: (5.5 * 4 + 4.0 * 8) / 12
    const expected = (5.5 * 4 + 4.0 * 8) / 12;
    expect(result.estimatedRatePa).toBeCloseTo(expected, 4);
  });

  it("explanation is a non-empty string", () => {
    const result = analyzeOffer(HIGH_BONUS_OFFER, ELIGIBLE_PROFILE);
    expect(typeof result.explanation).toBe("string");
    expect(result.explanation.length).toBeGreaterThan(10);
  });
});

// ── rankOffers ────────────────────────────────────────────────────────────────

describe("rankOffers", () => {
  it("eligible-for-bonus account ranks first when it earns more", () => {
    // HIGH_BONUS eligible: 5.5% × $50k = $2,750 > 4% × $50k = $2,000
    const results = rankOffers([HIGH_BONUS_OFFER, NO_CONDITIONS_OFFER], ELIGIBLE_PROFILE);
    expect(results[0].offer.id).toBe("high-bonus");
  });

  it("no-conditions account ranks first when user is ineligible for bonus", () => {
    // HIGH_BONUS base: 0.5% × $50k = $250 < 4% × $50k = $2,000
    const results = rankOffers([HIGH_BONUS_OFFER, NO_CONDITIONS_OFFER], INELIGIBLE_PROFILE);
    expect(results[0].offer.id).toBe("no-conditions");
  });

  it("returns the same number of results as input offers", () => {
    const results = rankOffers([HIGH_BONUS_OFFER, NO_CONDITIONS_OFFER], ELIGIBLE_PROFILE);
    expect(results).toHaveLength(2);
  });

  it("is deterministic — same inputs produce same order and values", () => {
    const r1 = rankOffers([HIGH_BONUS_OFFER, NO_CONDITIONS_OFFER], ELIGIBLE_PROFILE);
    const r2 = rankOffers([HIGH_BONUS_OFFER, NO_CONDITIONS_OFFER], ELIGIBLE_PROFILE);
    expect(r1[0].offer.id).toBe(r2[0].offer.id);
    expect(r1[0].estimatedRatePa).toBe(r2[0].estimatedRatePa);
    expect(r1[0].estimatedAnnualInterest).toBe(r2[0].estimatedAnnualInterest);
  });
});
