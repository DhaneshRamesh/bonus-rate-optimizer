import { describe, expect, it } from "vitest";
import {
  buildDisclosureText,
  buildExplanation,
  buildMethodologyText,
} from "@/lib/explanation";
import { rankAccounts } from "@/lib/ranking";
import { ACCOUNTS } from "@/data/accounts";
import type { UserProfile } from "@/types/user";

// ── Fixtures ──────────────────────────────────────────────────────────────────

// Meets all Westpac Life conditions.
const ELIGIBLE_PROFILE: UserProfile = {
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

// Card purchases and growth both at risk for Westpac Life.
const AT_RISK_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 0,
  monthlyCardPurchases: 3, // needs 5; 3 >= 5-2 → at_risk in checkEligibility
  monthlyNetSavingsGrowth: 50, // > 0 but ≤ 100 → at_risk
  willingToOpenLinkedAccount: false,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// Balance above the $50k cap on GSB Goal Saver.
const ABOVE_CAP_PROFILE: UserProfile = {
  age: 22,
  balance: 80_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 200,
  monthlyCardPurchases: 0,
  monthlyNetSavingsGrowth: 500,
  willingToOpenLinkedAccount: false,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// No conditions met — earns base rate everywhere conditional.
const NO_CONDITIONS_PROFILE: UserProfile = {
  age: 28,
  balance: 25_000,
  currentRatePa: 3.5,
  monthlyExternalDeposit: 0,
  monthlyCardPurchases: 0,
  monthlyNetSavingsGrowth: 0,
  willingToOpenLinkedAccount: false,
  wantsFlexibleWithdrawals: false,
  isNewCustomerForIntro: false,
};

// Helper: find the ranked entry for a given account id.
function getRanked(profile: UserProfile, accountId: string) {
  const result = rankAccounts(ACCOUNTS, profile);
  return result.overall.find((r) => r.account.id === accountId)!;
}

// ── at_risk — mentions unmet condition ───────────────────────────────────────

describe("buildExplanation — at-risk account", () => {
  it("mentions 'at risk' or 'conditions are currently at risk'", () => {
    const ranked = getRanked(AT_RISK_PROFILE, "westpac-life");
    const text = buildExplanation(ranked, AT_RISK_PROFILE);
    expect(text.toLowerCase()).toMatch(/at risk|conditions.*at risk/);
  });

  it("lists at least one unmet condition in the explanation", () => {
    const ranked = getRanked(AT_RISK_PROFILE, "westpac-life");
    const text = buildExplanation(ranked, AT_RISK_PROFILE);
    // unmetConditions include the card or growth condition text
    expect(
      text.toLowerCase().includes("card") || text.toLowerCase().includes("grow")
    ).toBe(true);
  });

  it("states that the estimate uses the base rate conservatively", () => {
    const ranked = getRanked(AT_RISK_PROFILE, "westpac-life");
    const text = buildExplanation(ranked, AT_RISK_PROFILE);
    expect(text.toLowerCase()).toContain("base rate");
  });

  it("nudges toward simpler options when account is complex (score ≥ 3)", () => {
    const ranked = getRanked(AT_RISK_PROFILE, "westpac-life"); // score 3
    const text = buildExplanation(ranked, AT_RISK_PROFILE);
    expect(text.toLowerCase()).toContain("no-fuss");
  });
});

// ── capped account — mentions cap ────────────────────────────────────────────

describe("buildExplanation — balance above bonus cap", () => {
  it("mentions the cap amount", () => {
    const ranked = getRanked(ABOVE_CAP_PROFILE, "gsb-goal-saver");
    const text = buildExplanation(ranked, ABOVE_CAP_PROFILE);
    expect(text).toContain("50,000");
  });

  it("mentions the word 'cap'", () => {
    const ranked = getRanked(ABOVE_CAP_PROFILE, "gsb-goal-saver");
    const text = buildExplanation(ranked, ABOVE_CAP_PROFILE);
    expect(text.toLowerCase()).toContain("cap");
  });

  it("mentions the base rate applying to the excess", () => {
    const ranked = getRanked(ABOVE_CAP_PROFILE, "gsb-goal-saver");
    const text = buildExplanation(ranked, ABOVE_CAP_PROFILE);
    expect(text).toContain("0.1"); // baseRatePa
  });
});

// ── no-fuss account — mentions no recurring conditions ───────────────────────

describe("buildExplanation — no-fuss account", () => {
  it("mentions no monthly conditions for Macquarie Savings", () => {
    const ranked = getRanked(NO_CONDITIONS_PROFILE, "macquarie-savings");
    const text = buildExplanation(ranked, NO_CONDITIONS_PROFILE);
    expect(text.toLowerCase()).toContain("no monthly");
  });

  it("does not mention unmet conditions for a no-fuss account", () => {
    const ranked = getRanked(NO_CONDITIONS_PROFILE, "macquarie-savings");
    const text = buildExplanation(ranked, NO_CONDITIONS_PROFILE);
    expect(text.toLowerCase()).not.toContain("not currently met");
  });

  it("mentions estimated annual interest vs current rate", () => {
    const ranked = getRanked(NO_CONDITIONS_PROFILE, "macquarie-savings");
    const text = buildExplanation(ranked, NO_CONDITIONS_PROFILE);
    expect(text.toLowerCase()).toContain("estimated annual interest");
    expect(text).toContain(NO_CONDITIONS_PROFILE.currentRatePa.toString());
  });

  it("intro rate note included when user is a new customer", () => {
    const profile: UserProfile = { ...NO_CONDITIONS_PROFILE, isNewCustomerForIntro: true };
    const ranked = getRanked(profile, "macquarie-savings");
    const text = buildExplanation(ranked, profile);
    expect(text.toLowerCase()).toContain("months");
    expect(text).toContain("4.85"); // Macquarie introRatePa
  });

  it("intro rate note mentions ongoing rate when user is NOT a new customer", () => {
    const ranked = getRanked(NO_CONDITIONS_PROFILE, "macquarie-savings");
    const text = buildExplanation(ranked, NO_CONDITIONS_PROFILE);
    // ongoing rate note rather than new-customer note
    expect(text.toLowerCase()).toContain("introductory rate");
    expect(text.toLowerCase()).toContain("not a new customer");
  });
});

// ── hard-ineligible account ───────────────────────────────────────────────────

describe("buildExplanation — hard-ineligible account (age restriction)", () => {
  it("mentions age restriction for over-25 user on GSB Goal Saver (ageMax 24)", () => {
    const profile: UserProfile = { ...ELIGIBLE_PROFILE, age: 25 };
    const ranked = getRanked(profile, "gsb-goal-saver");
    const text = buildExplanation(ranked, profile);
    expect(text.toLowerCase()).toContain("age restriction");
  });

  it("returns early — does not include interest estimate for hard-ineligible", () => {
    const profile: UserProfile = { ...ELIGIBLE_PROFILE, age: 25 };
    const ranked = getRanked(profile, "gsb-goal-saver");
    const text = buildExplanation(ranked, profile);
    expect(text.toLowerCase()).not.toContain("estimated annual interest");
  });
});

// ── eligible account with growth-sensitive withdrawal warning ─────────────────

describe("buildExplanation — growth-sensitive account, user eligible", () => {
  it("includes withdrawal warning for growth-sensitive account", () => {
    const ranked = getRanked(ELIGIBLE_PROFILE, "westpac-life");
    const text = buildExplanation(ranked, ELIGIBLE_PROFILE);
    expect(text.toLowerCase()).toContain("withdrawal");
  });

  it("mentions balance must grow each month", () => {
    const ranked = getRanked(ELIGIBLE_PROFILE, "westpac-life");
    const text = buildExplanation(ranked, ELIGIBLE_PROFILE);
    expect(text.toLowerCase()).toContain("grow");
  });
});

// ── capped account, balance within cap ───────────────────────────────────────

describe("buildExplanation — balance within cap", () => {
  it("confirms full balance earns the bonus rate", () => {
    const profile: UserProfile = { ...ABOVE_CAP_PROFILE, balance: 30_000 };
    const ranked = getRanked(profile, "gsb-goal-saver");
    const text = buildExplanation(ranked, profile);
    expect(text.toLowerCase()).toContain("within the");
    expect(text.toLowerCase()).toContain("cap");
  });
});

// ── buildDisclosureText ───────────────────────────────────────────────────────

describe("buildDisclosureText", () => {
  it("contains 'general information' wording", () => {
    expect(buildDisclosureText().toLowerCase()).toContain("general information");
  });

  it("mentions verifying with the provider", () => {
    expect(buildDisclosureText().toLowerCase()).toContain("verify");
  });

  it("is non-empty and returns a string", () => {
    expect(typeof buildDisclosureText()).toBe("string");
    expect(buildDisclosureText().length).toBeGreaterThan(50);
  });

  it("does not constitute financial advice — mentions 'concept demo'", () => {
    expect(buildDisclosureText().toLowerCase()).toContain("concept demo");
  });
});

// ── buildMethodologyText ──────────────────────────────────────────────────────

describe("buildMethodologyText", () => {
  it("mentions non-compounding model", () => {
    expect(buildMethodologyText().toLowerCase()).toContain("non-compounding");
  });

  it("mentions balance cap handling", () => {
    expect(buildMethodologyText().toLowerCase()).toContain("cap");
  });

  it("mentions introductory rate blending", () => {
    expect(buildMethodologyText().toLowerCase()).toContain("introductory");
  });

  it("is non-empty and returns a string", () => {
    expect(typeof buildMethodologyText()).toBe("string");
    expect(buildMethodologyText().length).toBeGreaterThan(100);
  });
});
