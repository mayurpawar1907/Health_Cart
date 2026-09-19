import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PROMO_FLAT_DISCOUNT_PERCENT } from './pricing.constants';

export type PricingSettings = {
  paymentPromoPercent: number;
  paymentPromoActive: boolean;
  paymentPromoApplyToAllUsers: boolean;
  promoLabel: string;
  updatedAt?: Date;
};

const DEFAULT_SETTINGS: PricingSettings = {
  paymentPromoPercent: PROMO_FLAT_DISCOUNT_PERCENT,
  paymentPromoActive: true,
  paymentPromoApplyToAllUsers: true,
  promoLabel: 'Extra off special price at payment',
};

@Injectable()
export class PlatformSettingsService {
  private cache: PricingSettings | null = null;
  private cacheAt = 0;
  private readonly ttlMs = 30_000;

  constructor(private prisma: PrismaService) {}

  private map(row: {
    paymentPromoPercent: { toNumber?: () => number } | number | string;
    paymentPromoActive: boolean;
    paymentPromoApplyToAllUsers: boolean;
    promoLabel: string;
    updatedAt?: Date;
  }): PricingSettings {
    const pct =
      typeof row.paymentPromoPercent === 'object' && row.paymentPromoPercent && 'toNumber' in row.paymentPromoPercent
        ? Number((row.paymentPromoPercent as { toNumber: () => number }).toNumber())
        : Number(row.paymentPromoPercent);
    return {
      paymentPromoPercent: pct,
      paymentPromoActive: row.paymentPromoActive,
      paymentPromoApplyToAllUsers: row.paymentPromoApplyToAllUsers,
      promoLabel: row.promoLabel,
      updatedAt: row.updatedAt,
    };
  }

  async getPricingSettings(): Promise<PricingSettings> {
    const now = Date.now();
    if (this.cache && now - this.cacheAt < this.ttlMs) return this.cache;

    const row = await this.prisma.platformSettings.findUnique({ where: { id: 'default' } });
    if (!row) {
      this.cache = DEFAULT_SETTINGS;
      this.cacheAt = now;
      return DEFAULT_SETTINGS;
    }

    this.cache = this.map(row);
    this.cacheAt = now;
    return this.cache;
  }

  async getPaymentPromoPercent(): Promise<number> {
    const s = await this.getPricingSettings();
    if (!s.paymentPromoActive) return 0;
    return s.paymentPromoPercent;
  }

  async shouldApplyPromoToAllUsers(): Promise<boolean> {
    const s = await this.getPricingSettings();
    return s.paymentPromoActive && s.paymentPromoApplyToAllUsers;
  }

  async updatePricingSettings(
    actorUserId: string,
    dto: Partial<PricingSettings>,
  ): Promise<PricingSettings> {
    const row = await this.prisma.platformSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        paymentPromoPercent: dto.paymentPromoPercent ?? DEFAULT_SETTINGS.paymentPromoPercent,
        paymentPromoActive: dto.paymentPromoActive ?? DEFAULT_SETTINGS.paymentPromoActive,
        paymentPromoApplyToAllUsers:
          dto.paymentPromoApplyToAllUsers ?? DEFAULT_SETTINGS.paymentPromoApplyToAllUsers,
        promoLabel: dto.promoLabel ?? DEFAULT_SETTINGS.promoLabel,
        updatedByUserId: actorUserId,
      },
      update: {
        ...(dto.paymentPromoPercent != null ? { paymentPromoPercent: dto.paymentPromoPercent } : {}),
        ...(dto.paymentPromoActive != null ? { paymentPromoActive: dto.paymentPromoActive } : {}),
        ...(dto.paymentPromoApplyToAllUsers != null
          ? { paymentPromoApplyToAllUsers: dto.paymentPromoApplyToAllUsers }
          : {}),
        ...(dto.promoLabel != null ? { promoLabel: dto.promoLabel } : {}),
        updatedByUserId: actorUserId,
      },
    });

    this.cache = this.map(row);
    this.cacheAt = Date.now();
    return this.cache;
  }

  invalidateCache() {
    this.cache = null;
    this.cacheAt = 0;
  }
}
