import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type InvoiceBreakdown = {
  mrp: number;
  specialPrice: number;
  listDiscountFromMrp: number;
  priceBeforePaymentDiscount: number;
  paymentDiscountPercent: number;
  paymentDiscountAmount: number;
  subtotalAfterPaymentDiscount: number;
  referralCreditApplied: number;
  walletCreditApplied: number;
  amountDue: number;
  isFreeForMember: boolean;
  totalDiscount: number;
};

export type PaymentInvoice = {
  invoiceNumber: string;
  issuedAt: string;
  bookingCode: string;
  testName: string;
  patientName?: string;
  customer: { name: string; email: string; mobile?: string };
  payment: {
    id: string;
    method: string;
    status: string;
    amount: number;
    currency: string;
  };
  pricing: InvoiceBreakdown;
  appointment?: {
    id: string;
    code: string;
    date: string;
    timeSlot?: string;
  };
};

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async nextInvoiceNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const prefix = `HC-INV-${y}${m}${d}`;
    const count = await this.prisma.paymentTransaction.count({
      where: { invoiceNumber: { startsWith: prefix } },
    });
    return `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }

  private mapBreakdown(raw: unknown): InvoiceBreakdown {
    const b = (raw ?? {}) as Record<string, number | boolean>;
    const mrp = Number(b.mrp ?? 0);
    const specialPrice = Number(b.specialPrice ?? 0);
    const listDiscountFromMrp = Number(b.listDiscountFromMrp ?? 0);
    const paymentDiscountAmount = Number(b.paymentDiscountAmount ?? 0);
    const referralCreditApplied = Number(b.referralCreditApplied ?? 0);
    const walletCreditApplied = Number(b.walletCreditApplied ?? 0);
    const amountDue = Number(b.amountDue ?? 0);

    return {
      mrp,
      specialPrice,
      listDiscountFromMrp,
      priceBeforePaymentDiscount: Number(b.priceBeforePaymentDiscount ?? specialPrice),
      paymentDiscountPercent: Number(b.paymentDiscountPercent ?? 0),
      paymentDiscountAmount,
      subtotalAfterPaymentDiscount: Number(b.subtotalAfterPaymentDiscount ?? amountDue),
      referralCreditApplied,
      walletCreditApplied,
      amountDue,
      isFreeForMember: Boolean(b.isFreeForMember),
      totalDiscount: listDiscountFromMrp + paymentDiscountAmount + referralCreditApplied + walletCreditApplied,
    };
  }

  buildInvoice(row: {
    id: string;
    invoiceNumber: string | null;
    bookingCode: string;
    testName: string;
    amount: { toNumber?: () => number } | number | string;
    currency: string;
    method: string;
    status: string;
    breakdown: unknown;
    createdAt: Date;
    user: { fullName: string; email: string; mobile?: string | null };
    appointment?: {
      id: string;
      code: string;
      date: Date;
      timeSlot?: string | null;
      patientName?: string | null;
    } | null;
  }): PaymentInvoice {
    const pricing = this.mapBreakdown(row.breakdown);
    return {
      invoiceNumber: row.invoiceNumber ?? `HC-DRAFT-${row.id.slice(0, 8).toUpperCase()}`,
      issuedAt: row.createdAt.toISOString(),
      bookingCode: row.bookingCode,
      testName: row.testName,
      patientName: row.appointment?.patientName ?? undefined,
      customer: {
        name: row.user.fullName,
        email: row.user.email,
        mobile: row.user.mobile ?? undefined,
      },
      payment: {
        id: row.id,
        method: row.method,
        status: row.status,
        amount: typeof row.amount === 'object' && row.amount && 'toNumber' in row.amount
          ? Number((row.amount as { toNumber: () => number }).toNumber())
          : Number(row.amount),
        currency: row.currency,
      },
      pricing,
      appointment: row.appointment
        ? {
            id: row.appointment.id,
            code: row.appointment.code,
            date: row.appointment.date.toISOString(),
            timeSlot: row.appointment.timeSlot ?? undefined,
          }
        : undefined,
    };
  }

  async ensureInvoiceNumber(transactionId: string): Promise<string> {
    const row = await this.prisma.paymentTransaction.findUnique({ where: { id: transactionId } });
    if (!row) throw new NotFoundException({ message: 'Payment not found', error: 'NOT_FOUND' });
    if (row.invoiceNumber) return row.invoiceNumber;
    const invoiceNumber = await this.nextInvoiceNumber();
    await this.prisma.paymentTransaction.update({ where: { id: transactionId }, data: { invoiceNumber } });
    return invoiceNumber;
  }

  async getForUser(userId: string, transactionId: string): Promise<PaymentInvoice> {
    await this.ensureInvoiceNumber(transactionId);
    const row = await this.prisma.paymentTransaction.findFirst({
      where: { id: transactionId, userId },
      include: {
        user: { select: { fullName: true, email: true, mobile: true } },
        appointment: {
          select: { id: true, code: true, date: true, timeSlot: true, patientName: true },
        },
      },
    });
    if (!row) throw new NotFoundException({ message: 'Invoice not found', error: 'NOT_FOUND' });
    return this.buildInvoice(row);
  }

  async getForAdmin(transactionId: string): Promise<PaymentInvoice> {
    await this.ensureInvoiceNumber(transactionId);
    const row = await this.prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { select: { fullName: true, email: true, mobile: true } },
        appointment: {
          select: { id: true, code: true, date: true, timeSlot: true, patientName: true },
        },
      },
    });
    if (!row) throw new NotFoundException({ message: 'Invoice not found', error: 'NOT_FOUND' });
    return this.buildInvoice(row);
  }
}
