import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async overview(userId: string) {
    const [upcoming, completed, cancelled, membership, recent, popular, packages] = await Promise.all([
      this.prisma.appointment.count({
        where: { userId, status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED, AppointmentStatus.PENDING] } },
      }),
      this.prisma.appointment.count({ where: { userId, status: AppointmentStatus.COMPLETED } }),
      this.prisma.appointment.count({ where: { userId, status: AppointmentStatus.CANCELLED } }),
      this.prisma.membership.findFirst({
        where: { userId, isActive: true, expiresAt: { gt: new Date() } },
        include: { plan: true },
      }),
      this.prisma.appointment.findMany({
        where: { userId },
        include: { test: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.test.findMany({
        where: { isActive: true, isPopular: true, isPackage: false },
        include: { category: true },
        take: 6,
      }),
      this.prisma.test.findMany({
        where: { isActive: true, isPackage: true },
        include: { category: true, parameters: true },
        orderBy: { isPopular: 'desc' },
        take: 6,
      }),
    ]);

    const next = await this.prisma.appointment.findFirst({
      where: {
        userId,
        status: { in: [AppointmentStatus.CONFIRMED, AppointmentStatus.RESCHEDULED] },
        date: { gte: new Date(new Date().toDateString()) },
      },
      include: { test: true },
      orderBy: [{ date: 'asc' }],
    });

    return {
      stats: {
        upcoming,
        completed,
        cancelled,
        membership: membership ? membership.plan.name : 'None',
      },
      membership,
      upcomingAppointment: next,
      recent,
      popularTests: popular,
      healthPackages: packages,
    };
  }
}
