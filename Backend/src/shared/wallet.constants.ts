/** HealthID Wallet — fintech rules (product config). */
export const WALLET_RULES = {
  /** Credited once when user activates HealthID Card */
  JOINING_BONUS: 250,
  /** Credited to referrer when referred member activates card */
  REFERRAL_BONUS: 1000,
  /** Max referral wallet applied per test booking */
  REFERRAL_PER_TEST: 200,
} as const;

export enum WalletTxnType {
  JOINING_BONUS = 'JOINING_BONUS',
  REFERRAL_EARNED = 'REFERRAL_EARNED',
  REFERRAL_REDEEMED = 'REFERRAL_REDEEMED',
  WALLET_REDEEMED = 'WALLET_REDEEMED',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
}
