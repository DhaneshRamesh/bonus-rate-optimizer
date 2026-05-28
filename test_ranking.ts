import { ACCOUNTS } from "./src/data/accounts";
import { rankAccounts } from "./src/lib/ranking";

const defaultProfile = {
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

console.log("--- DEFAULT PROFILE ---");
let results = rankAccounts(ACCOUNTS, defaultProfile);
console.log("Best match:", results.bestMaxReturn?.account.provider, results.bestMaxReturn?.annualInterest);

console.log("\n--- CHANGED PROFILE (balance = 150_000) ---");
const changedProfile = { ...defaultProfile, balance: 150_000 };
results = rankAccounts(ACCOUNTS, changedProfile);
console.log("Best match:", results.bestMaxReturn?.account.provider, results.bestMaxReturn?.annualInterest);

console.log("\n--- CHANGED PROFILE (purchases = 0) ---");
const noPurchasesProfile = { ...defaultProfile, monthlyCardPurchases: 0 };
results = rankAccounts(ACCOUNTS, noPurchasesProfile);
console.log("Best match:", results.bestMaxReturn?.account.provider, results.bestMaxReturn?.annualInterest);
