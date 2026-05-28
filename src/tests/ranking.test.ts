import { describe, expect, it } from "vitest";
import { analyzeOffer, rankAccounts, rankOffers } from "@/lib/ranking";
import { ACCOUNTS } from "@/data/accounts";
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

// ── rankAccounts fixtures ─────────────────────────────────────────────────────

const SAMPLE_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 1_000,
  monthlyCardPurchases: 5,
  monthlyNetSavingsGrowth: 300,
  willingToOpenLinkedAccount: true,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// User who fails all behavioural conditions — earns base rate only everywhere.
const FAILS_ALL_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 0,
  monthlyCardPurchases: 0,
  monthlyNetSavingsGrowth: -500,
  willingToOpenLinkedAccount: false,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// ── rankAccounts — bestMaxReturn ──────────────────────────────────────────────

describe("rankAccounts — bestMaxReturn does not choose high-headline when conditions fail", () => {
  it("Westpac Life (5.20% max) does not win when user fails card and growth conditions", () => {
    const result = rankAccounts(ACCOUNTS, FAILS_ALL_PROFILE);
    // Westpac earns only its 2% base; no-condition accounts should rank higher.
    expect(result.bestMaxReturn?.account.id).not.toBe("westpac-life");
  });

  it("bestMaxReturn is a no-condition account when all conditional accounts fail", () => {
    const result = rankAccounts(ACCOUNTS, FAILS_ALL_PROFILE);
    // AMP or Macquarie (no conditions) should win since conditional accounts earn base rates.
    expect(result.bestMaxReturn?.isNoFuss).toBe(true);
  });

  it("bestMaxReturn annualInterest beats all at_risk accounts for that user", () => {
    const result = rankAccounts(ACCOUNTS, FAILS_ALL_PROFILE);
    const winner = result.bestMaxReturn!;
    result.overall
      .filter((r) => r.eligibility.status !== "likely_eligible")
      .forEach((r) => {
        expect(winner.annualInterest).toBeGreaterThanOrEqual(r.annualInterest);
      });
  });

  it("bestMaxReturn has 'Highest estimated return' in rankReasons", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestMaxReturn?.rankReasons.some((r) => r.includes("Highest estimated return"))).toBe(true);
  });

  it("bestMaxReturn has 'Best Match' category tag", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestMaxReturn?.categoryTags).toContain("Best Match");
  });
});

// ── rankAccounts — bestNoFuss ─────────────────────────────────────────────────

describe("rankAccounts — no-fuss category excludes conditioned accounts", () => {
  it("bestNoFuss.isNoFuss is true", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestNoFuss?.isNoFuss).toBe(true);
  });

  it("bestNoFuss is not Westpac Life (requires cards + growth)", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestNoFuss?.account.id).not.toBe("westpac-life");
  });

  it("bestNoFuss is not ANZ Plus Growth Saver (requires deposit + growth)", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestNoFuss?.account.id).not.toBe("anz-plus-growth-saver");
  });

  it("bestNoFuss rankReasons includes 'No monthly hoops'", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestNoFuss?.rankReasons.some((r) => r.includes("hoops"))).toBe(true);
  });
});

// ── rankAccounts — bestFlexibleWithdrawals ────────────────────────────────────

describe("rankAccounts — flexible withdrawals category excludes growth-sensitive accounts", () => {
  it("bestFlexibleWithdrawals.isFlexibleWithdrawals is true", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestFlexibleWithdrawals?.isFlexibleWithdrawals).toBe(true);
  });

  it("bestFlexibleWithdrawals withdrawalFlexibility is not growth-sensitive", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestFlexibleWithdrawals?.account.withdrawalFlexibility).not.toBe("growth-sensitive");
  });

  it("Westpac Life (growth-sensitive) never wins flexible category", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.bestFlexibleWithdrawals?.account.id).not.toBe("westpac-life");
  });
});

// ── rankAccounts — hard-ineligible age product ────────────────────────────────

describe("rankAccounts — hard-ineligible age product does not win", () => {
  it("GSB Goal Saver (ageMax 24) does not win bestMaxReturn for age-25 user", () => {
    const age25 = { ...SAMPLE_PROFILE, age: 25 };
    const result = rankAccounts(ACCOUNTS, age25);
    expect(result.bestMaxReturn?.account.id).not.toBe("gsb-goal-saver");
  });

  it("hard-ineligible account still appears in overall list", () => {
    const age25 = { ...SAMPLE_PROFILE, age: 25 };
    const result = rankAccounts(ACCOUNTS, age25);
    expect(result.overall.some((r) => r.account.id === "gsb-goal-saver")).toBe(true);
  });

  it("GSB Goal Saver has hardIneligible=true for age-25 user", () => {
    const age25 = { ...SAMPLE_PROFILE, age: 25 };
    const result = rankAccounts(ACCOUNTS, age25);
    const gsbGoal = result.overall.find((r) => r.account.id === "gsb-goal-saver")!;
    expect(gsbGoal.eligibility.hardIneligible).toBe(true);
    expect(gsbGoal.eligibility.status).toBe("not_eligible");
  });

  it("hard-ineligible account ranks below all non-hard-ineligible accounts", () => {
    const age25 = { ...SAMPLE_PROFILE, age: 25 };
    const result = rankAccounts(ACCOUNTS, age25);
    const gsbGoal = result.overall.find((r) => r.account.id === "gsb-goal-saver")!;
    const nonHard = result.overall.filter((r) => !r.eligibility.hardIneligible);
    nonHard.forEach((r) => {
      expect(r.annualInterest).toBeGreaterThanOrEqual(gsbGoal.annualInterest);
    });
  });
});

// ── rankAccounts — determinism and structure ──────────────────────────────────

describe("rankAccounts — stable and deterministic", () => {
  it("same inputs produce identical overall order", () => {
    const r1 = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    const r2 = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(r1.overall.map((r) => r.account.id)).toEqual(r2.overall.map((r) => r.account.id));
  });

  it("same inputs produce identical category winners", () => {
    const r1 = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    const r2 = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(r1.bestMaxReturn?.account.id).toBe(r2.bestMaxReturn?.account.id);
    expect(r1.bestNoFuss?.account.id).toBe(r2.bestNoFuss?.account.id);
    expect(r1.bestFlexibleWithdrawals?.account.id).toBe(r2.bestFlexibleWithdrawals?.account.id);
  });

  it("overall contains all 8 accounts", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    expect(result.overall).toHaveLength(ACCOUNTS.length);
  });

  it("extraAnnualBenefit is negative when account base rate is below currentRatePa", () => {
    // ANZ Plus earns 0.01% when ineligible vs user's 3.5% — clearly negative delta.
    const result = rankAccounts(ACCOUNTS, FAILS_ALL_PROFILE);
    const anz = result.overall.find((r) => r.account.id === "anz-plus-growth-saver")!;
    expect(anz.extraAnnualBenefit).toBeLessThan(0);
  });

  it("overall is sorted by annualInterest descending", () => {
    const result = rankAccounts(ACCOUNTS, SAMPLE_PROFILE);
    for (let i = 0; i < result.overall.length - 1; i++) {
      expect(result.overall[i].annualInterest).toBeGreaterThanOrEqual(
        result.overall[i + 1].annualInterest
      );
    }
  });
});
