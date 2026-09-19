import { queryOne, num, bool } from '../config/database.js'
import { getPricingSettings } from './platform-settings.service.js'

export const activeMembership = async (userId) =>
  queryOne(
    `SELECT m.*, p.flatDiscountPercent AS planFlatDiscountPercent, p.name AS planName, p.slug AS planSlug
     FROM Membership m
     JOIN MembershipPlan p ON p.id = m.planId
     WHERE m.userId = :userId AND m.isActive = 1 AND m.expiresAt > NOW(3)
     LIMIT 1`,
    { userId },
  )

export const calculateForTest = async (test, userId) => {
  const originalPrice = num(test.price)
  const baseDiscountPct = num(test.discountPercent)
  const cardPrice = Math.round(originalPrice * (1 - baseDiscountPct / 100))
  const baseDiscount = originalPrice - cardPrice
  const settings = await getPricingSettings()

  if (!userId) {
    return {
      originalPrice,
      baseDiscount,
      membershipDiscount: 0,
      cardPrice,
      priceBeforePaymentDiscount: originalPrice,
      paymentDiscountPercent: 0,
      paymentDiscountAmount: 0,
      finalPrice: originalPrice,
      membershipApplied: false,
      flatDiscountPercent: settings.paymentPromoPercent,
      isFreeForMember: false,
    }
  }

  const membership = await activeMembership(userId)
  const applyToAll = settings.paymentPromoActive && settings.paymentPromoApplyToAllUsers
  const eligibleForPromo = applyToAll || !!membership
  const flatPct = settings.paymentPromoActive
    ? membership && !applyToAll
      ? num(membership.planFlatDiscountPercent)
      : settings.paymentPromoPercent
    : 0

  if (bool(test.membershipFree) && membership) {
    return {
      originalPrice,
      baseDiscount,
      membershipDiscount: cardPrice,
      cardPrice: 0,
      priceBeforePaymentDiscount: 0,
      paymentDiscountPercent: flatPct,
      paymentDiscountAmount: 0,
      finalPrice: 0,
      membershipApplied: true,
      flatDiscountPercent: flatPct,
      isFreeForMember: true,
    }
  }

  if (!eligibleForPromo) {
    return {
      originalPrice,
      baseDiscount,
      membershipDiscount: 0,
      cardPrice,
      priceBeforePaymentDiscount: originalPrice,
      paymentDiscountPercent: 0,
      paymentDiscountAmount: 0,
      finalPrice: originalPrice,
      membershipApplied: false,
      flatDiscountPercent: flatPct,
      isFreeForMember: false,
    }
  }

  const specialPrice = cardPrice
  const paymentDiscountAmount = flatPct > 0 ? Math.round(specialPrice * (flatPct / 100)) : 0
  const priceAfterPaymentDiscount = specialPrice - paymentDiscountAmount

  return {
    originalPrice,
    baseDiscount,
    membershipDiscount: originalPrice - specialPrice,
    cardPrice: specialPrice,
    priceBeforePaymentDiscount: specialPrice,
    paymentDiscountPercent: flatPct,
    paymentDiscountAmount,
    finalPrice: priceAfterPaymentDiscount,
    membershipApplied: true,
    flatDiscountPercent: flatPct,
    isFreeForMember: false,
  }
}
