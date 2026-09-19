import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CheckoutQuote } from './checkout.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class PaymentLedgerService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
  ) {}

  async recordBookingPayment(params: {
    appointmentId: string;
    userId: string;
    bookingCode: string;
    testName: string;
    quote: CheckoutQuote;
    method: PaymentMethod;
    status: PaymentStatus;
  }) {
    const { appointmentId, userId, bookingCode, testName, quote, method, status } = params;
    const breakdown = {
      mrp: quote.originalPrice,
      specialPrice: quote.listPrice,
      listDiscountFromMrp: quote.listDiscountFromMrp,
      priceBeforePaymentDiscount: quote.priceBeforePaymentDiscount,
      paymentDiscountPercent: quote.paymentDiscountPercent,
      paymentDiscountAmount: quote.paymentDiscountAmount,
      subtotalAfterPaymentDiscount: quote.subtotalAfterPaymentDiscount,
      referralCreditApplied: quote.referralCreditApplied,
      walletCreditApplied: quote.walletCreditApplied,
      amountDue: quote.amountDue,
      isFreeForMember: quote.isFreeForMember,
    };

    const invoiceNumber = await this.invoiceService.nextInvoiceNumber();

    return this.prisma.paymentTransaction.create({
      data: {
        appointmentId,
        userId,
        bookingCode,
        testName,
        invoiceNumber,
        amount: quote.amountDue,
        method,
        status,
        breakdown,
      },
    });
  }

  async listForUser(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          appointment: {
            select: {
              id: true,
              code: true,
              date: true,
              timeSlot: true,
              patientName: true,
              paymentStatus: true,
            },
          },
        },
      }),
      this.prisma.paymentTransaction.count({ where: { userId } }),
    ]);

    return {
      items: items.map((t) => this.serialize(t)),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async listForAdmin(filters: {
    q?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 25;
    const skip = (page - 1) * limit;
    const where: Prisma.PaymentTransactionWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.method) where.method = filters.method;
    if (filters.q?.trim()) {
      const q = filters.q.trim();
      where.OR = [
        { bookingCode: { contains: q } },
        { testName: { contains: q } },
        { user: { fullName: { contains: q } } },
        { user: { email: { contains: q } } },
        { user: { mobile: { contains: q } } },
      ];
    }

    const [items, total, stats] = await Promise.all([
      this.prisma.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { id: true, fullName: true, email: true, mobile: true } },
          appointment: {
            select: {
              id: true,
              code: true,
              date: true,
              payableAmount: true,
              finalPrice: true,
              paymentStatus: true,
            },
          },
        },
      }),
      this.prisma.paymentTransaction.count({ where }),
      this.prisma.paymentTransaction.groupBy({
        by: ['status'],
        _count: { _all: true },
        _sum: { amount: true },
      }),
    ]);

    return {
      items: items.map((t) => this.serialize(t)),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      stats: stats.map((s) => ({
        status: s.status,
        count: s._count._all,
        amount: Number(s._sum.amount ?? 0),
      })),
    };
  }

  async getForUser(userId: string, id: string) {
    const row = await this.prisma.paymentTransaction.findFirst({
      where: { id, userId },
      include: {
        appointment: {
          include: {
            test: { select: { name: true, slug: true } },
          },
        },
      },
    });
    if (!row) throw new NotFoundException({ message: 'Payment not found', error: 'NOT_FOUND' });
    return this.serialize(row);
  }

  async getForAdmin(id: string) {
    const row = await this.prisma.paymentTransaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true } },
        appointment: {
          include: {
            test: { select: { name: true, slug: true } },
          },
        },
      },
    });
    if (!row) throw new NotFoundException({ message: 'Payment not found', error: 'NOT_FOUND' });
    return this.serialize(row);
  }

  async updateStatus(id: string, status: PaymentStatus) {
    const row = await this.prisma.paymentTransaction.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        appointment: { select: { id: true, code: true } },
      },
    });

    await this.prisma.appointment.update({
      where: { id: row.appointmentId },
      data: { paymentStatus: status },
    });

    return this.serialize(row);
  }

  private serialize(
    row: {
      id: string;
      appointmentId: string;
      userId: string;
      bookingCode: string;
      testName: string;
      invoiceNumber?: string | null;
      amount: Prisma.Decimal | number;
      currency: string;
      method: PaymentMethod;
      status: PaymentStatus;
      breakdown: unknown;
      createdAt: Date;
      updatedAt: Date;
      user?: { id: string; fullName: string; email: string; mobile?: string };
      appointment?: unknown;
    },
  ) {
    return {
      id: row.id,
      appointmentId: row.appointmentId,
      userId: row.userId,
      bookingCode: row.bookingCode,
      testName: row.testName,
      invoiceNumber: (row as { invoiceNumber?: string | null }).invoiceNumber ?? null,
      amount: Number(row.amount),
      currency: row.currency,
      method: row.method,
      status: row.status,
      breakdown: row.breakdown,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      user: row.user,
      appointment: row.appointment,
    };
  }
}
