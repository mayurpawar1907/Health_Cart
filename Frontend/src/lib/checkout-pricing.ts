import type { PriceQuote } from '@/types'
import { CHECKOUT_DISCOUNT_PCT } from '@/components/brand/PaymentDiscountOffer'

export type CheckoutPricingLines = {
  mrp: number
  specialPrice: number
  listDiscountFromMrp: number
  beforePaymentDiscount: number
  paymentDiscountPercent: number
  paymentDiscountAmount: number
  afterPaymentDiscount: number
  referralCreditApplied: number
  walletCreditApplied: number
  amountDue: number
  totalSavings: number
}

/** 30% is always calculated on the special/list price — never on MRP. */
export function paymentDiscountOnSpecialPrice(
  specialPrice: number,
  percent: number = CHECKOUT_DISCOUNT_PCT,
) {
  const discountAmount = Math.round(specialPrice * (percent / 100))
  return {
    specialPrice,
    percent,
    discountAmount,
    priceAfterDiscount: Math.max(0, specialPrice - discountAmount),
  }
}

export function resolveCheckoutPricing(quote: PriceQuote): CheckoutPricingLines {
  const specialPrice = quote.listPrice ?? quote.cardPrice ?? 0
  const paymentDiscountPercent = quote.paymentDiscountPercent ?? quote.flatDiscountPercent ?? CHECKOUT_DISCOUNT_PCT

  // Payment discount base = special price only (never MRP)
  const beforePaymentDiscount =
    quote.priceBeforePaymentDiscount ??
    (specialPrice > 0 ? specialPrice : 0)

  const paymentDiscountAmount =
    quote.paymentDiscountAmount ??
    (beforePaymentDiscount > 0
      ? paymentDiscountOnSpecialPrice(beforePaymentDiscount, paymentDiscountPercent).discountAmount
      : 0)

  const afterPaymentDiscount =
    quote.subtotalAfterPaymentDiscount ??
    quote.subtotalAfterCard ??
    Math.max(0, beforePaymentDiscount - paymentDiscountAmount)

  const listDiscountFromMrp = quote.listDiscountFromMrp ?? quote.cardDiscount ?? quote.membershipDiscount ?? 0
  const referralCreditApplied = quote.referralCreditApplied ?? 0
  const walletCreditApplied = quote.walletCreditApplied ?? 0
  const amountDue = quote.isFreeForMember ? 0 : quote.amountDue

  return {
    mrp: quote.originalPrice,
    specialPrice: specialPrice || beforePaymentDiscount,
    listDiscountFromMrp,
    beforePaymentDiscount,
    paymentDiscountPercent,
    paymentDiscountAmount,
    afterPaymentDiscount,
    referralCreditApplied,
    walletCreditApplied,
    amountDue,
    totalSavings:
      listDiscountFromMrp +
      paymentDiscountAmount +
      referralCreditApplied +
      walletCreditApplied,
  }
}
