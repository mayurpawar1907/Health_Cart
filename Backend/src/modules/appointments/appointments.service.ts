import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AppointmentStatus, CollectionType, NotificationType, PaymentMethod, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../../shared/pricing.service';
import { CheckoutService } from '../../shared/checkout.service';
import { WalletService } from '../../shared/wallet.service';
import { PaymentLedgerService } from '../../shared/payment-ledger.service';
import { WhatsAppService } from '../../shared/whatsapp.service';
import { CreateAppointmentDto, RescheduleDto } from './dto/appointments.dto';

const SLOTS = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '07:00 PM',
];

const METRO_PIN_PREFIXES = ['11', '12', '20', '30', '38', '40', '41', '50', '56', '60', '70'];

function isServiceablePincode(pincode: string) {
  return /^\d{6}$/.test(pincode) && METRO_PIN_PREFIXES.some((p) => pincode.startsWith(p));
}

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
    private checkout: CheckoutService,
    private wallet: WalletService,
    private paymentLedger: PaymentLedgerService,
    private whatsapp: WhatsAppService,
  ) {}

  slots(date: string) {
    return { date, slots: SLOTS, homeCollectionAvailable: true };
  }

  checkServiceability(pincode: string) {
    const ok = isServiceablePincode(pincode);
    return { pincode, serviceable: ok, message: ok ? 'Free home collection available in your area' : 'Home collection coming soon to your pincode. Lab visit available.' };
  }

  list(userId: string, status?: string) {
    return this.prisma.appointment.findMany({
      where: {
        userId,
        deletedAt: null,
        ...(status && status !== 'ALL' ? { status: status as AppointmentStatus } : {}),
      },
      include: { test: { include: { category: true } }, address: true, familyMember: true },
      orderBy: { date: 'desc' },
    });
  }

  async get(userId: string, id: string) {
    const item = await this.prisma.appointment.findFirst({
      where: { id, userId, deletedAt: null },
      include: { test: true, reports: true, address: true, familyMember: true },
    });
    if (!item) throw new NotFoundException({ message: 'Appointment not found', error: 'APPOINTMENT_NOT_FOUND' });
    return item;
  }

  async quote(
    userId: string,
    testId: string,
    opts: { useWallet?: boolean; useReferral?: boolean } = {},
  ) {
    const test = await this.prisma.test.findFirst({ where: { id: testId, isActive: true } });
    if (!test) throw new BadRequestException({ message: 'Invalid test', error: 'INVALID_TEST' });
    return this.checkout.quote(userId, test, opts);
  }

  async create(userId: string, dto: CreateAppointmentDto) {
    const test = await this.prisma.test.findFirst({ where: { id: dto.testId, isActive: true } });
    if (!test) throw new BadRequestException({ message: 'Invalid test', error: 'INVALID_TEST' });
    if (!SLOTS.includes(dto.timeSlot)) {
      throw new BadRequestException({ message: 'Invalid time slot', error: 'INVALID_SLOT' });
    }

    const collectionType = dto.collectionType ?? CollectionType.HOME;
    let deliveryAddress = dto.deliveryAddress;
    let addressId = dto.addressId;
    let latitude = dto.latitude;
    let longitude = dto.longitude;

    if (collectionType === CollectionType.HOME) {
      if (addressId) {
        const addr = await this.prisma.address.findFirst({ where: { id: addressId, userId } });
        if (!addr) throw new BadRequestException({ message: 'Invalid address', error: 'INVALID_ADDRESS' });
        deliveryAddress = `${addr.line1}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
        latitude = latitude ?? (addr.latitude ? Number(addr.latitude) : undefined);
        longitude = longitude ?? (addr.longitude ? Number(addr.longitude) : undefined);
        const service = this.checkServiceability(addr.pincode);
        if (!service.serviceable) {
          throw new BadRequestException({ message: service.message, error: 'NOT_SERVICEABLE' });
        }
      } else if (!deliveryAddress) {
        throw new BadRequestException({ message: 'Share your location for home collection', error: 'ADDRESS_REQUIRED' });
      }
    }

    if (dto.familyMemberId) {
      const fm = await this.prisma.familyMember.findFirst({ where: { id: dto.familyMemberId, userId } });
      if (!fm) throw new BadRequestException({ message: 'Invalid family member', error: 'INVALID_FAMILY' });
    }

    const quote = await this.checkout.quote(userId, test, {
      useWallet: dto.useWallet !== false,
      useReferral: dto.useReferral !== false,
    });

    const membership = await this.pricing.activeMembership(userId);

    if (test.membershipFree && membership) {
      await this.prisma.membershipUsage.create({
        data: { membershipId: membership.id, testId: test.id, note: 'Free eligible test' },
      });
    }

    let paymentMethod = dto.paymentMethod ?? PaymentMethod.UPI;
    if (quote.amountDue === 0 && (quote.walletCreditApplied > 0 || quote.referralCreditApplied > 0)) {
      paymentMethod = PaymentMethod.WALLET;
    }

    const paymentStatus =
      quote.amountDue === 0
        ? PaymentStatus.PAID
        : paymentMethod === PaymentMethod.COD
          ? PaymentStatus.PENDING
          : PaymentStatus.PAID;

    const code = `HIC-${Date.now().toString().slice(-8)}`;
    const appointment = await this.prisma.appointment.create({
      data: {
        code,
        userId,
        testId: test.id,
        date: new Date(dto.date),
        timeSlot: dto.timeSlot,
        patientName: dto.patientName,
        patientAge: dto.patientAge,
        notes: dto.notes,
        collectionType,
        addressId,
        familyMemberId: dto.familyMemberId,
        deliveryAddress,
        latitude,
        longitude,
        location: collectionType === CollectionType.HOME ? 'Home collection' : 'HealthID Diagnostics Centre',
        originalPrice: quote.originalPrice,
        membershipDiscount: quote.listDiscountFromMrp,
        cardDiscount: quote.paymentDiscountAmount,
        referralDiscount: quote.referralCreditApplied,
        walletDiscount: quote.walletCreditApplied,
        finalPrice: quote.subtotalAfterPaymentDiscount,
        payableAmount: quote.amountDue,
        paymentStatus,
        paymentMethod,
        reminderEnabled: dto.reminderEnabled ?? true,
        status: AppointmentStatus.CONFIRMED,
      },
      include: { test: true, address: true },
    });

    if (quote.referralCreditApplied > 0 || quote.walletCreditApplied > 0) {
      await this.wallet.debitForBooking(
        userId,
        appointment.id,
        quote.referralCreditApplied,
        quote.walletCreditApplied,
      );
    }

    await this.paymentLedger.recordBookingPayment({
      appointmentId: appointment.id,
      userId,
      bookingCode: code,
      testName: test.name,
      quote,
      method: paymentMethod,
      status: paymentStatus,
    });

    const collectionText = collectionType === CollectionType.HOME ? `Home visit at ${deliveryAddress}` : 'Lab visit';
    const savings: string[] = [];
    if (quote.listDiscountFromMrp > 0) savings.push(`list rate −₹${quote.listDiscountFromMrp}`);
    if (quote.paymentDiscountAmount > 0) savings.push(`${quote.paymentDiscountPercent}% off −₹${quote.paymentDiscountAmount}`);
    if (quote.referralCreditApplied > 0) savings.push(`referral −₹${quote.referralCreditApplied}`);
    if (quote.walletCreditApplied > 0) savings.push(`wallet −₹${quote.walletCreditApplied}`);
    const payText =
      quote.amountDue === 0
        ? quote.isFreeForMember
          ? 'FREE (member benefit)'
          : `Fully covered by wallet${savings.length ? ` (${savings.join(', ')})` : ''}`
        : `₹${quote.amountDue} via ${paymentMethod}${savings.length ? ` after ${savings.join(', ')}` : ''}`;

    const body = `${test.name} booked for ${dto.date} at ${dto.timeSlot}. ${collectionText}. ${payText}. Booking ID: ${code}.`;
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.APPOINTMENT_CONFIRMATION,
        title: 'Booking confirmed',
        body,
      },
    });
    await this.whatsapp.send(userId, 'booking_confirmed', body);

    await this.prisma.testReport.create({
      data: { userId, appointmentId: appointment.id, status: 'PENDING' },
    });

    const remindAt = new Date(dto.date);
    remindAt.setDate(remindAt.getDate() - 1);
    remindAt.setHours(9, 0, 0, 0);
    if (remindAt > new Date()) {
      await this.prisma.testReminder.create({
        data: {
          userId,
          appointmentId: appointment.id,
          label: `${test.name} tomorrow`,
          remindAt,
        },
      });
    }

    return appointment;
  }

  async cancel(userId: string, id: string) {
    const appointment = await this.get(userId, id);
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      throw new BadRequestException({ message: 'This appointment cannot be cancelled', error: 'CANCEL_FAILED' });
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: AppointmentStatus.CANCELLED },
      include: { test: true },
    });
    const body = `${updated.test.name} (${updated.code}) has been cancelled. Refund will be processed in 3-5 business days if applicable.`;
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.APPOINTMENT_CANCELLATION,
        title: 'Booking cancelled',
        body,
      },
    });
    await this.whatsapp.send(userId, 'booking_cancelled', body);
    return updated;
  }

  async reschedule(userId: string, id: string, dto: RescheduleDto) {
    const appointment = await this.get(userId, id);
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      throw new BadRequestException({ message: 'This appointment cannot be rescheduled', error: 'RESCHEDULE_FAILED' });
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        date: new Date(dto.date),
        timeSlot: dto.timeSlot,
        status: AppointmentStatus.RESCHEDULED,
        reminderSentAt: null,
      },
      include: { test: true },
    });
    const body = `${updated.test.name} moved to ${dto.date} at ${dto.timeSlot}.`;
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.APPOINTMENT_RESCHEDULED,
        title: 'Booking rescheduled',
        body,
      },
    });
    await this.whatsapp.send(userId, 'booking_rescheduled', body);
    return updated;
  }
}
