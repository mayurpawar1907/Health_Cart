import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PricingService } from './pricing.service';
import { WalletService } from './wallet.service';
import { WALLET_RULES } from './wallet.constants';

export type CheckoutQuote = {
  testId: string;
  testName: string;
  originalPrice: number;
  /** Special partner rate — 30% payment discount is calculated on this, not MRP */
  listPrice: number;
  /** @alias listPrice */
  specialPrice: number;
  /** MRP − list rate */
  listDiscountFromMrp: number;
  priceBeforePaymentDiscount: number;
  paymentDiscountPercent: number;
  paymentDiscountAmount: number;
  /** After flat payment discount, before wallet */
  subtotalAfterPaymentDiscount: number;
  /** @deprecated use listDiscountFromMrp */
  cardDiscount: number;
  /** @deprecated use listPrice */
  cardPrice: number;
  membershipApplied: boolean;
  flatDiscountPercent: number;
  isFreeForMember: boolean;
  /** @deprecated use subtotalAfterPaymentDiscount */
  subtotalAfterCard: number;
  walletBalance: number;
  referralBalance: number;
  referralPerTest: number;
  referralCreditAvailable: number;
  useWallet: boolean;
  useReferral: boolean;
  referralCreditApplied: number;
  walletCreditApplied: number;
  amountDue: number;
  /** @deprecated use amountDue */
  finalPrice: number;
  /** @deprecated use cardDiscount */
  membershipDiscount: number;
  baseDiscount: number;
};

@Injectable()
export class CheckoutService {
  constructor(
    private pricing: PricingService,
    private wallet: WalletService,
  ) {}

  async quote(
    userId: string,
    test: {
      id: string;
      name: string;
      price: Prisma.Decimal | number;
      discountPercent: Prisma.Decimal | number;
      membershipFree?: boolean;
    },
    opts: { useWallet?: boolean; useReferral?: boolean } = {},
  ): Promise<CheckoutQuote> {
    const useWallet = opts.useWallet !== false;
    const useReferral = opts.useReferral !== false;

    const base = await this.pricing.calculateForTest(test, userId);
    const walletRecord = await this.wallet.ensureWallet(userId);
    const walletBalance = Number(walletRecord.balance);
    const referralBalance = Number(walletRecord.referralBalance);

    const subtotalAfterPaymentDiscount = base.isFreeForMember ? 0 : base.finalPrice;
    const listDiscountFromMrp = base.membershipApplied ? base.membershipDiscount : 0;

    const referralCreditAvailable =
      subtotalAfterPaymentDiscount > 0
        ? Math.min(WALLET_RULES.REFERRAL_PER_TEST, referralBalance, subtotalAfterPaymentDiscount)
        : 0;

    const credits = this.wallet.computeCheckoutCredits(
      { balance: walletBalance, referralBalance },
      subtotalAfterPaymentDiscount,
      { useWallet, useReferral },
    );

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
    };
  }
}
