import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../../shared/whatsapp.service';
import { CreateReminderDto } from './dto/reminders.dto';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
  ) {}

  list(userId: string) {
    return this.prisma.testReminder.findMany({
      where: { userId, isActive: true },
      include: { test: true, appointment: { include: { test: true } } },
      orderBy: { remindAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateReminderDto) {
    if (!dto.testId && !dto.appointmentId) {
      throw new BadRequestException({ message: 'Link a test or appointment', error: 'INVALID_REMINDER' });
    }
    return this.prisma.testReminder.create({
      data: {
        userId,
        testId: dto.testId,
        appointmentId: dto.appointmentId,
        label: dto.label,
        remindAt: new Date(dto.remindAt),
      },
      include: { test: true, appointment: { include: { test: true } } },
    });
  }

  async remove(userId: string, id: string) {
    const item = await this.prisma.testReminder.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException({ message: 'Reminder not found', error: 'NOT_FOUND' });
    await this.prisma.testReminder.update({ where: { id }, data: { isActive: false } });
    return { message: 'Reminder removed' };
  }

  async processDueReminders() {
    const now = new Date();
    const due = await this.prisma.testReminder.findMany({
      where: { isActive: true, notifiedAt: null, remindAt: { lte: now } },
      include: { user: true, test: true, appointment: { include: { test: true } } },
    });

    for (const r of due) {
      const testName = r.test?.name ?? r.appointment?.test?.name ?? 'Health test';
      const body = `Reminder: ${r.label}. ${testName} is scheduled. Open HealthID Card to view details.`;
      await this.prisma.notification.create({
        data: {
          userId: r.userId,
          type: 'APPOINTMENT_REMINDER',
          title: 'Test reminder',
          body,
        },
      });
      await this.whatsapp.send(r.userId, 'test_reminder', body);
      await this.prisma.testReminder.update({ where: { id: r.id }, data: { notifiedAt: now } });
    }

    return due.length;
  }

  async processAppointmentReminders() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const dayEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    const upcoming = await this.prisma.appointment.findMany({
      where: {
        deletedAt: null,
        reminderEnabled: true,
        reminderSentAt: null,
        status: { in: ['CONFIRMED', 'RESCHEDULED'] },
        date: { gte: dayStart, lte: dayEnd },
      },
      include: { user: true, test: true },
    });

    for (const a of upcoming) {
      const body = `Your ${a.test.name} home collection is tomorrow at ${a.timeSlot}. Phlebotomist will visit: ${a.deliveryAddress ?? a.location}.`;
      await this.prisma.notification.create({
        data: {
          userId: a.userId,
          type: 'APPOINTMENT_REMINDER',
          title: 'Appointment tomorrow',
          body,
        },
      });
      await this.whatsapp.send(a.userId, 'appointment_reminder', body);
      await this.prisma.appointment.update({ where: { id: a.id }, data: { reminderSentAt: new Date() } });
    }

    return upcoming.length;
  }
}
