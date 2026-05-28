/**
 * DEMO / SAMPLE DATA — NOT FOR PRODUCTION USE
 *
 * This dataset is a curated snapshot of publicly advertised Australian savings
 * account offers, assembled for demonstration purposes only. Rates, conditions,
 * and eligibility criteria change frequently. Always verify current terms
 * directly with the provider before making any financial decisions.
 *
 * Fields marked ASSUMPTION in the `notes` field are estimates derived from
 * publicly available information and may not reflect the current offer precisely.
 * Do not use this data in a live product without independent verification.
 */

import type { SavingsAccountOffer } from "@/types/accounts";

export const ACCOUNTS: SavingsAccountOffer[] = [
  // ──────────────────────────────────────────────────────────────────────────
  // 1. Macquarie Bank — Savings Account
  // Confidence: HIGH — well-documented, no conditions, consistently competitive
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "macquarie-savings",
    provider: "Macquarie Bank",
    productName: "Savings Account",
    baseRatePa: 4.75,
    bonusRatePa: undefined,
    totalMaxRatePa: 4.85,
    introRatePa: 4.85,
    introMonths: 4,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: undefined,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: undefined,
    withdrawalFlexibility: "full",
    conditionComplexityScore: 1,
    sourceUrl: "https://www.macquarie.com.au/everyday-banking.html",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "No ongoing conditions — base rate is always earned. " +
      "New customers receive a higher intro rate for the first 4 months. " +
      "ASSUMPTION: intro rate and intro period based on publicly advertised figures ~early 2025.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 1b. ING — Savings Maximiser
  // Confidence: HIGH — widely documented product with strict conditions
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "ing-savings-maximiser",
    provider: "ING",
    productName: "Savings Maximiser",
    baseRatePa: 0.01,
    bonusRatePa: 5.49,
    totalMaxRatePa: 5.50,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: true,
    monthlyDepositRequirement: 1000,
    monthlyCardPurchaseRequirement: 5,
    monthlyGrowthRequirement: true,
    capAmount: 100000,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 4,
    sourceUrl: "https://www.ing.com.au/savings/savings-maximiser.html",
    sourceLabel: "Official provider page",
    lastChecked: "2025-05-28",
    notes:
      "Requires linked Orange Everyday account. Must deposit $1,000+ from an external source, make 5+ settled card purchases, and grow the balance each month to earn the bonus rate.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 1c. Ubank — Save
  // Confidence: HIGH — popular digital bank offer
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "ubank-save",
    provider: "Ubank",
    productName: "Save",
    baseRatePa: 0.10,
    bonusRatePa: 5.00,
    totalMaxRatePa: 5.10,
    introRatePa: 5.85,
    introMonths: 4,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: 200,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: true,
    capAmount: 1000000,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 2,
    sourceUrl: "https://www.ubank.com.au/banking/savings-account",
    sourceLabel: "Official provider page",
    lastChecked: "2025-05-28",
    notes:
      "Must grow combined savings balance each month to earn the bonus rate. New customers receive a high intro rate for 4 months.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. AMP Bank — GO Save
  // Confidence: MEDIUM — product details less precisely documented in public sources
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "amp-go-save",
    provider: "AMP Bank",
    productName: "GO Save",
    baseRatePa: 5.00,
    bonusRatePa: undefined,
    totalMaxRatePa: 5.40,
    introRatePa: 5.40,
    introMonths: 3,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: undefined,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: undefined,
    withdrawalFlexibility: "full",
    conditionComplexityScore: 1,
    sourceUrl: "https://www.amp.com.au/personal-banking",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "ASSUMPTION: base rate, intro rate, and intro period are estimates based on " +
      "publicly available information ~early 2025. Verify all figures at provider. " +
      "Actual product may require a minimum deposit or linked account — not confirmed.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Westpac — Life
  // Confidence: HIGH — widely documented product with stable conditions
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "westpac-life",
    provider: "Westpac",
    productName: "Life",
    baseRatePa: 2.00,
    bonusRatePa: 3.20,
    totalMaxRatePa: 5.20,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: undefined,
    monthlyCardPurchaseRequirement: 5,
    monthlyGrowthRequirement: true,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 3,
    sourceUrl: "https://www.westpac.com.au/personal-banking/bank-accounts/savings/life/",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "2.00% base rate is earned regardless of conditions — useful protection if conditions " +
      "are missed. Bonus requires 5+ card purchases AND positive balance growth each month. " +
      "A Youth Bonus rate (for customers aged 18–29) may be available — check Westpac directly. " +
      "Card purchases typically require a linked Westpac everyday account.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 4. ANZ Plus — Growth Saver
  // Confidence: MEDIUM — based on publicly available ANZ Plus product information
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "anz-plus-growth-saver",
    provider: "ANZ Plus",
    productName: "Growth Saver",
    baseRatePa: 0.01,
    bonusRatePa: 4.99,
    totalMaxRatePa: 5.00,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: 10,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: true,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 2,
    sourceUrl: "https://www.anz.com.au/plus/",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "ANZ Plus is a digital-only product (app-based). Bonus rate requires a minimum " +
      "$10 monthly deposit AND no withdrawals during the month. " +
      "ASSUMPTION: product may be named 'Save' rather than 'Growth Saver' — verify " +
      "exact product name and current conditions at provider.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Great Southern Bank — Home Saver
  // Confidence: LOW — limited independent confirmation of exact conditions
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gsb-home-saver",
    provider: "Great Southern Bank",
    productName: "Home Saver",
    baseRatePa: 0.25,
    bonusRatePa: 4.75,
    totalMaxRatePa: 5.00,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: 200,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: true,
    capAmount: undefined,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 3,
    sourceUrl: "https://www.greatsouthernbank.com.au/savings-accounts/home-saver",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "ASSUMPTION: most fields are estimates — verify ALL at provider before use. " +
      "This product may be specifically designed for home buyers / home loan holders. " +
      "Monthly deposit requirement and growth requirement are inferred from similar GSB products.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Great Southern Bank — Goal Saver
  // Confidence: MEDIUM-HIGH — independently documented in multiple public sources
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gsb-goal-saver",
    provider: "Great Southern Bank",
    productName: "Goal Saver",
    baseRatePa: 0.10,
    bonusRatePa: 4.90,
    totalMaxRatePa: 5.00,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: 100,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: true,
    ageMax: 24,
    capAmount: 50_000,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 3,
    sourceUrl: "https://www.greatsouthernbank.com.au/savings-accounts/goal-saver",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "Bonus rate applies on balances up to $50,000. Balances above the cap earn the base rate. " +
      "Good for smaller balances with straightforward conditions. " +
      "ASSUMPTION: cap of $50,000 based on publicly cited figures — verify at provider.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Great Southern Bank — Future Saver
  // Confidence: LOW — limited independent confirmation of exact conditions
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gsb-future-saver",
    provider: "Great Southern Bank",
    productName: "Future Saver",
    baseRatePa: 0.10,
    bonusRatePa: 4.90,
    totalMaxRatePa: 5.00,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: 50,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: true,
    ageMin: undefined,
    ageMax: 35,
    capAmount: 50_000,
    withdrawalFlexibility: "growth-sensitive",
    conditionComplexityScore: 4,
    sourceUrl: "https://www.greatsouthernbank.com.au/savings-accounts/future-saver",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "ASSUMPTION: most fields are estimates — verify ALL at provider before use. " +
      "Product appears to be targeted at younger savers (inferred from name and positioning). " +
      "Age maximum of 35 is an assumption — actual age restriction may differ or not exist. " +
      "Monthly deposit threshold is estimated from similar GSB products.",
  },

  // ──────────────────────────────────────────────────────────────────────────
  // 8. Great Southern Bank — Everyday Saver
  // Confidence: LOW — limited independent confirmation of exact conditions
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: "gsb-everyday-saver",
    provider: "Great Southern Bank",
    productName: "Everyday Saver",
    baseRatePa: 0.50,
    bonusRatePa: undefined,
    totalMaxRatePa: 0.50,
    introRatePa: undefined,
    introMonths: undefined,
    requiresLinkedAccount: false,
    monthlyDepositRequirement: undefined,
    monthlyCardPurchaseRequirement: undefined,
    monthlyGrowthRequirement: undefined,
    capAmount: undefined,
    withdrawalFlexibility: "full",
    conditionComplexityScore: 1,
    sourceUrl: "https://www.greatsouthernbank.com.au/savings-accounts/everyday-saver",
    sourceLabel: "Official provider page",
    lastChecked: "2025-03-01",
    notes:
      "ASSUMPTION: most fields are estimates. This is modelled as a flexible at-call " +
      "account with no bonus conditions — suitable for transactional savings use. " +
      "Base rate of 0.50% is an estimate and may not reflect the current offer.",
  },
];
