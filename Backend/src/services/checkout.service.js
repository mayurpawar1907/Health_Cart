import { num } from '../config/database.js'
import { WALLET_RULES } from '../constants/wallet.js'
import { calculateForTest } from './pricing.service.js'
import * as walletService from './wallet.service.js'

export const quote = async (userId, test, opts = {}) => {
  const useWallet = opts.useWallet !== false
  const useReferral = opts.useReferral !== false
  const base = await calculateForTest(test, userId)
  const walletRecord = await walletService.ensureWallet(userId)
  const walletBalance = num(walletRecord.balance)
  const referralBalance = num(walletRecord.referralBalance)
  const subtotalAfterPaymentDiscount = base.isFreeForMember ? 0 : base.finalPrice
  const listDiscountFromMrp = base.membershipApplied ? base.membershipDiscount : 0
  const referralCreditAvailable =
    subtotalAfterPaymentDiscount > 0
      ? Math.min(WALLET_RULES.REFERRAL_PER_TEST, referralBalance, subtotalAfterPaymentDiscount)
      : 0
  const credits = walletService.computeCheckoutCredits(
    { balance: walletBalance, referralBalance },
    subtotalAfterPaymentDiscount,
    { useWallet, useReferral },
  )
  return {
    testId: test.id,
    testName: test.name,
    originalPrice: base.originalPrice,
    baseDiscount: base.baseDiscount,
    listPrice: base.cardPrice,
    specialPrice: base.cardPrice,
    listDiscountFromMrp,
    priceBeforePaymentDiscount: base.priceBeforePaymentDiscount,
    paymentDiscountPercent: base.paymentDiscountPercent,
    paymentDiscountAmount: base.paymentDiscountAmount,
    subtotalAfterPaymentDiscount,
    cardDiscount: listDiscountFromMrp,
    cardPrice: base.cardPrice,
    membershipApplied: base.membershipApplied,
    flatDiscountPercent: base.flatDiscountPercent,
    isFreeForMember: base.isFreeForMember,
    subtotalAfterCard: subtotalAfterPaymentDiscount,
    walletBalance,
    referralBalance,
    referralPerTest: WALLET_RULES.REFERRAL_PER_TEST,
    referralCreditAvailable,
    useWallet,
    useReferral,
    referralCreditApplied: credits.referralApplied,
    walletCreditApplied: credits.walletApplied,
    amountDue: credits.amountDue,
    finalPrice: credits.amountDue,
    membershipDiscount: listDiscountFromMrp,
  }
}
