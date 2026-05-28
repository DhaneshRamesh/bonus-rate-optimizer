import { describe, it, expect } from "vitest";
import { ACCOUNTS } from "../data/accounts";
import { rankAccounts } from "../lib/ranking";
import type { UserProfile } from "../types/user";

describe("rankAccounts live update test", () => {
  it("should update when profile changes", () => {
    const defaultProfile: UserProfile = {
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

    const r1 = rankAccounts(ACCOUNTS, defaultProfile);
    const balance1 = r1.overall[0].annualInterest;

    const r2 = rankAccounts(ACCOUNTS, { ...defaultProfile, balance: 150_000 });
    const balance2 = r2.overall[0].annualInterest;

    expect(balance1).not.toBe(balance2);
  });
});
