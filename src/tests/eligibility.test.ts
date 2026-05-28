import { describe, expect, it } from "vitest";
import { checkAllConditions, checkEligibility, deriveEligibilityStatus, worstStatus } from "@/lib/eligibility";
import { ACCOUNTS } from "@/data/accounts";
import type { SavingsAccountOffer } from "@/types/accounts";
import type { UserProfile } from "@/types/user";

// ── Fixtures ──────────────────────────────────────────────────────────────────

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

const BASE_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.0,
  monthlyExternalDeposit: 1_000,
  monthlyCardPurchases: 5,
  monthlyNetSavingsGrowth: 800,
  willingToOpenLinkedAccount: true,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// ── worstStatus ───────────────────────────────────────────────────────────────

describe("worstStatus", () => {
  it("returns not_eligible if any status is not_eligible", () => {
    expect(worstStatus(["likely_eligible", "not_eligible", "at_risk"])).toBe("not_eligible");
  });

  it("returns at_risk if no not_eligible but at_risk present", () => {
    expect(worstStatus(["likely_eligible", "at_risk"])).toBe("at_risk");
  });

  it("returns likely_eligible when all are likely_eligible", () => {
    expect(worstStatus(["likely_eligible", "likely_eligible"])).toBe("likely_eligible");
  });
});

// ── Monthly deposit ───────────────────────────────────────────────────────────

describe("checkAllConditions — monthly_deposit", () => {
  const offer: SavingsAccountOffer = { ...BASE_OFFER, monthlyDepositRequirement: 1_000 };

  it("likely_eligible when deposit meets requirement exactly", () => {
    const checks = checkAllConditions(offer, BASE_PROFILE);
    const check = checks.find((c) => c.conditionKey === "monthly_deposit")!;
    expect(check.status).toBe("likely_eligible");
    expect(check.gapAction).toBeUndefined();
  });

  it("at_risk when deposit is 50–99% of requirement", () => {
    const profile = { ...BASE_PROFILE, monthlyExternalDeposit: 600 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "monthly_deposit"
    )!;
    expect(check.status).toBe("at_risk");
    expect(check.gapAction).toContain("1,000");
  });

  it("not_eligible when deposit is below 50% of requirement", () => {
    const profile = { ...BASE_PROFILE, monthlyExternalDeposit: 100 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "monthly_deposit"
    )!;
    expect(check.status).toBe("not_eligible");
  });

  it("no monthly_deposit check when requirement is undefined", () => {
    const checks = checkAllConditions(BASE_OFFER, BASE_PROFILE);
    expect(checks.find((c) => c.conditionKey === "monthly_deposit")).toBeUndefined();
  });
});

// ── Card purchases ────────────────────────────────────────────────────────────

describe("checkAllConditions — card_purchases", () => {
  const offer: SavingsAccountOffer = { ...BASE_OFFER, monthlyCardPurchaseRequirement: 5 };

  it("likely_eligible when purchases meet requirement", () => {
    const check = checkAllConditions(offer, BASE_PROFILE).find(
      (c) => c.conditionKey === "card_purchases"
    )!;
    expect(check.status).toBe("likely_eligible");
  });

  it("at_risk when 1–2 below requirement", () => {
    const profile = { ...BASE_PROFILE, monthlyCardPurchases: 4 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "card_purchases"
    )!;
    expect(check.status).toBe("at_risk");
  });

  it("not_eligible when more than 2 below requirement", () => {
    const profile = { ...BASE_PROFILE, monthlyCardPurchases: 2 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "card_purchases"
    )!;
    expect(check.status).toBe("not_eligible");
  });
});

// ── Balance growth ────────────────────────────────────────────────────────────

describe("checkAllConditions — balance_growth", () => {
  const offer: SavingsAccountOffer = { ...BASE_OFFER, monthlyGrowthRequirement: true };

  it("likely_eligible when net growth > $100", () => {
    const check = checkAllConditions(offer, BASE_PROFILE).find(
      (c) => c.conditionKey === "balance_growth"
    )!;
    expect(check.status).toBe("likely_eligible");
  });

  it("at_risk when growth is between $1 and $100", () => {
    const profile = { ...BASE_PROFILE, monthlyNetSavingsGrowth: 50 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "balance_growth"
    )!;
    expect(check.status).toBe("at_risk");
  });

  it("not_eligible when growth is zero or negative", () => {
    const profile = { ...BASE_PROFILE, monthlyNetSavingsGrowth: 0 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "balance_growth"
    )!;
    expect(check.status).toBe("not_eligible");
  });
});

// ── Linked account ────────────────────────────────────────────────────────────

describe("checkAllConditions — linked_account", () => {
  const offer: SavingsAccountOffer = { ...BASE_OFFER, requiresLinkedAccount: true };

  it("likely_eligible when willing to open linked account", () => {
    const check = checkAllConditions(offer, BASE_PROFILE).find(
      (c) => c.conditionKey === "linked_account"
    )!;
    expect(check.status).toBe("likely_eligible");
  });

  it("not_eligible when not willing, gapAction names the provider", () => {
    const profile = { ...BASE_PROFILE, willingToOpenLinkedAccount: false };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "linked_account"
    )!;
    expect(check.status).toBe("not_eligible");
    expect(check.gapAction).toContain("Test Bank");
  });
});

// ── Age restrictions ──────────────────────────────────────────────────────────

describe("checkAllConditions — age_max", () => {
  const offer: SavingsAccountOffer = { ...BASE_OFFER, ageMax: 30 };

  it("likely_eligible when age is within limit", () => {
    const check = checkAllConditions(offer, BASE_PROFILE).find(
      (c) => c.conditionKey === "age_max"
    )!;
    expect(check.status).toBe("likely_eligible"); // age 28 ≤ 30
  });

  it("not_eligible when age exceeds limit, no gapAction", () => {
    const profile = { ...BASE_PROFILE, age: 35 };
    const check = checkAllConditions(offer, profile).find(
      (c) => c.conditionKey === "age_max"
    )!;
    expect(check.status).toBe("not_eligible");
    expect(check.gapAction).toBeUndefined();
  });
});

// ── Withdrawal flexibility ────────────────────────────────────────────────────

describe("checkAllConditions — withdrawal_flexibility", () => {
  const growthSensitiveOffer: SavingsAccountOffer = {
    ...BASE_OFFER,
    withdrawalFlexibility: "growth-sensitive",
  };

  it("no check when user does not want flexible withdrawals", () => {
    const checks = checkAllConditions(growthSensitiveOffer, BASE_PROFILE);
    expect(checks.find((c) => c.conditionKey === "withdrawal_flexibility")).toBeUndefined();
  });

  it("at_risk (not not_eligible) when user wants flexible withdrawals", () => {
    const profile = { ...BASE_PROFILE, wantsFlexibleWithdrawals: true };
    const check = checkAllConditions(growthSensitiveOffer, profile).find(
      (c) => c.conditionKey === "withdrawal_flexibility"
    )!;
    expect(check.status).toBe("at_risk");
  });

  it("no check for full-flexibility accounts regardless of user preference", () => {
    const profile = { ...BASE_PROFILE, wantsFlexibleWithdrawals: true };
    const checks = checkAllConditions(BASE_OFFER, profile); // BASE_OFFER is "full"
    expect(checks.find((c) => c.conditionKey === "withdrawal_flexibility")).toBeUndefined();
  });
});

// ── checkEligibility — Westpac Life ──────────────────────────────────────────

describe("checkEligibility — Westpac Life", () => {
  const westpac = ACCOUNTS.find((a) => a.id === "westpac-life")!;

  it("is not treated as fully eligible without meeting its specific conditions", () => {
    const profile: UserProfile = {
      ...BASE_PROFILE,
      monthlyCardPurchases: 2,       // requires 5
      monthlyNetSavingsGrowth: -50,  // requires positive growth
    };
    const result = checkEligibility(profile, westpac);
    expect(result.status).toBe("at_risk");
    expect(result.hardIneligible).toBe(false);
    expect(result.unmetConditions.length).toBeGreaterThanOrEqual(2);
  });

  it("likely_eligible when cards and growth both met", () => {
    const result = checkEligibility(BASE_PROFILE, westpac); // 5 cards, 800 growth
    expect(result.status).toBe("likely_eligible");
    expect(result.hardIneligible).toBe(false);
    expect(result.unmetConditions).toHaveLength(0);
  });
});

// ── checkEligibility — ANZ Plus Growth Saver ─────────────────────────────────

describe("checkEligibility — ANZ Plus Growth Saver", () => {
  const anz = ACCOUNTS.find((a) => a.id === "anz-plus-growth-saver")!;

  it("at_risk when growth is below $100", () => {
    const profile: UserProfile = { ...BASE_PROFILE, monthlyNetSavingsGrowth: 50 };
    const result = checkEligibility(profile, anz);
    expect(result.status).toBe("at_risk");
    expect(result.hardIneligible).toBe(false);
    expect(result.unmetConditions.some((c) => c.conditionKey === "monthly_growth")).toBe(true);
  });

  it("likely_eligible when deposit met and growth exceeds $100", () => {
    const result = checkEligibility(BASE_PROFILE, anz); // $1,000 deposit, 800 growth
    expect(result.status).toBe("likely_eligible");
    expect(result.unmetConditions).toHaveLength(0);
  });
});

// ── checkEligibility — GSB Goal Saver (age hard-fail) ────────────────────────

describe("checkEligibility — GSB Goal Saver", () => {
  const gsbGoal = ACCOUNTS.find((a) => a.id === "gsb-goal-saver")!;

  it("hard-fails when age is 25 (ageMax is 24)", () => {
    const profile: UserProfile = { ...BASE_PROFILE, age: 25 };
    const result = checkEligibility(profile, gsbGoal);
    expect(result.status).toBe("not_eligible");
    expect(result.hardIneligible).toBe(true);
    expect(result.metConditions).toHaveLength(0);
    expect(result.unmetConditions.length).toBeGreaterThan(0);
  });

  it("does not hard-fail when age is within limit", () => {
    const profile: UserProfile = { ...BASE_PROFILE, age: 22 };
    const result = checkEligibility(profile, gsbGoal);
    expect(result.hardIneligible).toBe(false);
  });
});

// ── checkEligibility — no-condition accounts ─────────────────────────────────

describe("checkEligibility — no-condition accounts", () => {
  it("Macquarie Savings returns likely_eligible with no unmet conditions", () => {
    const macquarie = ACCOUNTS.find((a) => a.id === "macquarie-savings")!;
    const result = checkEligibility(BASE_PROFILE, macquarie);
    expect(result.status).toBe("likely_eligible");
    expect(result.hardIneligible).toBe(false);
    expect(result.unmetConditions).toHaveLength(0);
  });

  it("GSB Everyday Saver returns likely_eligible with no unmet conditions", () => {
    const everyday = ACCOUNTS.find((a) => a.id === "gsb-everyday-saver")!;
    const result = checkEligibility(BASE_PROFILE, everyday);
    expect(result.status).toBe("likely_eligible");
    expect(result.unmetConditions).toHaveLength(0);
  });
});

// ── deriveEligibilityStatus ───────────────────────────────────────────────────

describe("deriveEligibilityStatus", () => {
  it("returns likely_eligible for an offer with no conditions", () => {
    const checks = checkAllConditions(BASE_OFFER, BASE_PROFILE);
    expect(deriveEligibilityStatus(checks)).toBe("likely_eligible");
  });

  it("propagates not_eligible from any check", () => {
    const offer: SavingsAccountOffer = { ...BASE_OFFER, ageMax: 20 };
    const checks = checkAllConditions(offer, BASE_PROFILE); // age 28 > 20
    expect(deriveEligibilityStatus(checks)).toBe("not_eligible");
  });
});
