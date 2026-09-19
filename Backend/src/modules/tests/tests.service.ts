import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../shared/pricing.service';

@Injectable()
export class TestsService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  categories() {
    return this.prisma.testCategory.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async list(
    query: {
      search?: string;
      category?: string;
      minPrice?: string;
      maxPrice?: string;
      sort?: string;
      popular?: string;
      membership?: string;
      packages?: string;
    },
    userId?: string,
  ) {
    const where: Prisma.TestWhereInput = { isActive: true, deletedAt: null, AND: [] };
    const and = where.AND as Prisma.TestWhereInput[];
    if (query.search) {
      and.push({
        OR: [{ name: { contains: query.search } }, { shortDescription: { contains: query.search } }],
      });
    }
    if (query.category) and.push({ category: { slug: query.category } });
    if (query.popular === 'true') and.push({ isPopular: true, isPackage: false });
    if (query.membership === 'true') {
      and.push({ OR: [{ membershipEligible: true }, { membershipFree: true }] });
    }
    if (query.packages === 'true') and.push({ isPackage: true });
    if (query.minPrice || query.maxPrice) {
      and.push({
        price: {
          ...(query.minPrice ? { gte: query.minPrice } : {}),
          ...(query.maxPrice ? { lte: query.maxPrice } : {}),
        },
      });
    }

    const orderBy: Prisma.TestOrderByWithRelationInput =
      query.sort === 'price_asc'
        ? { price: 'asc' }
        : query.sort === 'price_desc'
          ? { price: 'desc' }
          : { isPopular: 'desc' };

    const tests = await this.prisma.test.findMany({
      where,
      include: {
        category: true,
        parameters: true,
        packageTests: { include: { includedTest: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy,
    });

    return Promise.all(tests.map((t) => this.withPricing(t, userId)));
  }

  async get(idOrSlug: string, userId?: string) {
    const test = await this.prisma.test.findFirst({
      where: {
        isActive: true,
        deletedAt: null,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        parameters: true,
        packageTests: { include: { includedTest: true } },
      },
    });
    if (!test) throw new NotFoundException({ message: 'Test not found', error: 'TEST_NOT_FOUND' });
    return this.withPricing(test, userId);
  }

  searchSuggestions(q: string) {
    if (!q || q.length < 2) return [];
    return this.prisma.test.findMany({
      where: { isActive: true, deletedAt: null, name: { contains: q } },
      select: { id: true, name: true, slug: true, price: true },
      take: 8,
    });
  }

  private async withPricing<T extends { price: Prisma.Decimal; discountPercent: Prisma.Decimal; membershipFree?: boolean }>(
    test: T,
    userId?: string,
  ) {
    const breakdown = await this.pricing.calculateForTest(test, userId);
    const price = Number(test.price);
    const discountPercent = Number(test.discountPercent);
    return {
      ...test,
      price,
      discountPercent,
      discountedPrice: breakdown.cardPrice,
      memberPrice: breakdown.cardPrice,
      priceAfterPaymentDiscount: breakdown.membershipApplied ? breakdown.finalPrice : breakdown.originalPrice,
      membershipDiscountApplied: breakdown.membershipDiscount,
      paymentDiscountAmount: breakdown.paymentDiscountAmount,
      membershipApplied: breakdown.membershipApplied,
      flatDiscountPercent: breakdown.flatDiscountPercent,
      isFreeForMember: breakdown.isFreeForMember,
    };
  }
}
