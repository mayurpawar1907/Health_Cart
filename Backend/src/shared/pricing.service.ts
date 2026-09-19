import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PROMO_FLAT_DISCOUNT_PERCENT } from './pricing.constants';
import { PlatformSettingsService } from './platform-settings.service';

export type PriceBreakdown = {
  originalPrice: number;
  baseDiscount: number;
  /** Savings from MRP down to the special list rate */
  membershipDiscount: number;
  /** Special list rate before the flat payment discount */
  cardPrice: number;
  priceBeforePaymentDiscount: number;
  paymentDiscountPercent: number;
  paymentDiscountAmount: number;
  /** Payable test price after flat payment discount, before wallet credits */
  finalPrice: number;
  membershipApplied: boolean;
  flatDiscountPercent: number;
  isFreeForMember: boolean;
};

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private platformSettings: PlatformSettingsService,
  ) {}

  async activeMembership(userId: string) {
    return this.prisma.membership.findFirst({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      include: { plan: true },
    });
  }

  async calculateForTest(
    test: {
      price: Prisma.Decimal | number;
      discountPercent: Prisma.Decimal | number;
      membershipFree?: boolean;
    },
    userId?: string,
  ): Promise<PriceBreakdown> {
    const originalPrice = Number(test.price);
    const baseDiscountPct = Number(test.discountPercent);
    const cardPrice = Math.round(originalPrice * (1 - baseDiscountPct / 100));
    const baseDiscount = originalPrice - cardPrice;
    const settings = await this.platformSettings.getPricingSettings();

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
      };
    }

    const membership = await this.activeMembership(userId);
    const applyToAll = settings.paymentPromoActive && settings.paymentPromoApplyToAllUsers;
    const eligibleForPromo = applyToAll || !!membership;

    const flatPct = settings.paymentPromoActive
      ? membership && !applyToAll
        ? Number(membership.plan.flatDiscountPercent)
        : settings.paymentPromoPercent
      : 0;

    if (test.membershipFree && membership) {
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
      };
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
      };
    }

    const specialPrice = cardPrice;
    const paymentDiscountAmount =
      flatPct > 0 ? Math.round(specialPrice * (flatPct / 100)) : 0;
    const priceAfterPaymentDiscount = specialPrice - paymentDiscountAmount;

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
    };
  }
}
