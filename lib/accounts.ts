import type { SavingsAccount } from "./types";

/**
 * Curated demo dataset of publicly advertised Australian savings accounts.
 * Rates and conditions are approximate figures from public bank websites (~early 2025).
 * This is a concept demo — always verify current terms directly with the provider.
 */
export const ACCOUNTS: SavingsAccount[] = [
  {
    id: "ing-savings-maximiser",
    bank: "ING",
    accountName: "Savings Maximiser",
    bankInitials: "ING",
    bankColor: "#FF6600",
    baseRate: 0.55,
    bonusRate: 4.95,
    advertisedRate: 5.50,
    balanceCap: 100_000,
    conditions: [
      {
        type: "linked_account_required",
        linkedAccount: "Orange Everyday",
        label: "Hold an ING Orange Everyday account",
        shortLabel: "Linked account",
      },
      {
        type: "min_monthly_deposit",
        amount: 1_000,
        label: "Deposit $1,000+ per month to any ING account",
        shortLabel: "$1,000 deposit",
      },
      {
        type: "min_card_transactions",
        count: 5,
        linkedAccount: "Orange Everyday",
        label: "Make 5+ card purchases with Orange Everyday",
        shortLabel: "5+ card txns",
      },
      {
        type: "balance_growth",
        label: "Savings Maximiser balance must grow each month",
        shortLabel: "Balance grows",
      },
    ],
    notes: [
      "Bonus rate applies on balances up to $100,000",
      "Balances above cap earn base rate only",
    ],
    sourceNote: "ING Australia — rates approx. early 2025, verify at ing.com.au",
  },

  {
    id: "ubank-high-interest",
    bank: "Ubank",
    accountName: "High Interest Savings",
    bankInitials: "UB",
    bankColor: "#5C2D91",
    baseRate: 0.10,
    bonusRate: 5.00,
    advertisedRate: 5.10,
    balanceCap: 250_000,
    conditions: [
      {
        type: "min_monthly_deposit",
        amount: 200,
        label: "Deposit $200+ per month to any Ubank account",
        shortLabel: "$200 deposit",
      },
    ],
    notes: ["One of the simplest bonus conditions available"],
    sourceNote: "Ubank — rates approx. early 2025, verify at ubank.com.au",
  },

  {
    id: "anz-plus-save",
    bank: "ANZ Plus",
    accountName: "Save",
    bankInitials: "ANZ",
    bankColor: "#007DBA",
    baseRate: 0.01,
    bonusRate: 4.99,
    advertisedRate: 5.00,
    balanceCap: 250_000,
    conditions: [
      {
        type: "min_monthly_deposit",
        amount: 10,
        label: "Deposit at least $10 per month",
        shortLabel: "$10 deposit",
      },
      {
        type: "no_withdrawals",
        label: "Make no withdrawals during the month",
        shortLabel: "No withdrawals",
      },
    ],
    notes: [
      "ANZ Plus is a digital-only account (app-based)",
      "Even a single $10 deposit qualifies — but no withdrawals allowed",
    ],
    sourceNote: "ANZ Plus — rates approx. early 2025, verify at anz.com.au",
  },

  {
    id: "westpac-life",
    bank: "Westpac",
    accountName: "Life",
    bankInitials: "WBC",
    bankColor: "#DA1710",
    baseRate: 2.00,
    bonusRate: 3.20,
    advertisedRate: 5.20,
    conditions: [
      {
        type: "min_card_transactions",
        count: 5,
        label: "Make 5+ card purchases per month",
        shortLabel: "5+ card txns",
      },
      {
        type: "balance_growth",
        label: "Westpac Life balance must grow each month",
        shortLabel: "Balance grows",
      },
    ],
    notes: [
      "Higher base rate means you earn something even without the bonus",
      "No balance cap or linked account required",
      "Youth Bonus (18–29) may offer a higher advertised rate — check westpac.com.au",
    ],
    sourceNote: "Westpac — rates approx. early 2025, verify at westpac.com.au",
  },

  {
    id: "me-homeme",
    bank: "ME Bank",
    accountName: "HomeME Savings",
    bankInitials: "ME",
    bankColor: "#00A8A0",
    baseRate: 0.05,
    bonusRate: 5.50,
    advertisedRate: 5.55,
    balanceCap: 100_000,
    conditions: [
      {
        type: "linked_account_required",
        linkedAccount: "SpendME Transaction Account",
        label: "Hold a ME SpendME Transaction Account",
        shortLabel: "Linked account",
      },
      {
        type: "min_card_transactions",
        count: 4,
        linkedAccount: "SpendME card",
        label: "Make 4+ purchases with your SpendME card per month",
        shortLabel: "4+ card txns",
      },
    ],
    notes: [
      "Highest headline rate in this dataset",
      "Requires the linked SpendME transaction account",
    ],
    sourceNote: "ME Bank — rates approx. early 2025, verify at mebank.com.au",
  },

  {
    id: "macquarie-savings",
    bank: "Macquarie",
    accountName: "Savings Account",
    bankInitials: "MQG",
    bankColor: "#1A1F5E",
    baseRate: 4.75,
    bonusRate: 0,
    advertisedRate: 4.75,
    introRate: 4.85,
    introMonths: 4,
    conditions: [],
    notes: [
      "No ongoing conditions — base rate is always earned",
      "New customers receive 4.85% for the first 4 months",
      "Rate reverts to base rate after intro period",
    ],
    sourceNote: "Macquarie Bank — rates approx. early 2025, verify at macquarie.com",
  },

  {
    id: "boq-smart-saver",
    bank: "Bank of Queensland",
    accountName: "Smart Saver",
    bankInitials: "BOQ",
    bankColor: "#E8000D",
    baseRate: 0.50,
    bonusRate: 4.75,
    advertisedRate: 5.25,
    balanceCap: 250_000,
    conditions: [
      {
        type: "linked_account_required",
        linkedAccount: "BOQ Day2Day Account",
        label: "Hold a BOQ Day2Day transaction account",
        shortLabel: "Linked account",
      },
      {
        type: "min_monthly_deposit",
        amount: 1_000,
        label: "Deposit $1,000+ per month to your BOQ account",
        shortLabel: "$1,000 deposit",
      },
      {
        type: "min_card_transactions",
        count: 5,
        linkedAccount: "BOQ Day2Day card",
        label: "Make 5+ purchases with your BOQ Day2Day card",
        shortLabel: "5+ card txns",
      },
    ],
    notes: ["Three conditions required — all must be met to earn bonus rate"],
    sourceNote: "Bank of Queensland — rates approx. early 2025, verify at boq.com.au",
  },

  {
    id: "gsbank-bonus-saver",
    bank: "Great Southern Bank",
    accountName: "Goal Saver",
    bankInitials: "GSB",
    bankColor: "#006B4F",
    baseRate: 0.10,
    bonusRate: 4.90,
    advertisedRate: 5.00,
    balanceCap: 50_000,
    conditions: [
      {
        type: "min_monthly_deposit",
        amount: 100,
        label: "Deposit $100+ per month",
        shortLabel: "$100 deposit",
      },
      {
        type: "balance_growth",
        label: "Account balance must grow each month",
        shortLabel: "Balance grows",
      },
    ],
    notes: [
      "Lower balance cap of $50,000",
      "Good option for smaller balances with straightforward conditions",
    ],
    sourceNote: "Great Southern Bank — rates approx. early 2025, verify at greatsouthernbank.com.au",
  },
];
