export interface UserProfile {
  age: number;
  currentBalance: number;          // AUD
  monthlyDeposit: number;          // AUD deposited per month
  monthlyCardTransactions: number; // number of card purchases per month
  balanceWillGrow: boolean;        // expects net positive balance movement
  willingToLinkAccount: boolean;   // open to opening a linked transaction account
  isNewCustomer: boolean;          // eligible for intro rates
}
