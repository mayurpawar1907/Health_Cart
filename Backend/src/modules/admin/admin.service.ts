import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
  NotificationType,
  PaymentMethod,
  PaymentStatus,
  ReportStatus,
  Role,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsAppService } from '../../shared/whatsapp.service';
import { PlatformSettingsService, type PricingSettings } from '../../shared/platform-settings.service';
import { PaymentLedgerService } from '../../shared/payment-ledger.service';
import { StorageService } from '../../shared/storage.service';
import { InvoiceService } from '../../shared/invoice.service';
import { createReadStream, existsSync } from 'fs';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
    private platformSettings: PlatformSettingsService,
    private paymentLedger: PaymentLedgerService,
    private storage: StorageService,
    private invoice: InvoiceService,
  ) {}

  private async audit(userId: string, action: string, entity: string, entityId?: string, meta?: object) {
    await this.prisma.auditLog.create({
      data: { userId, action, entity, entityId, meta: meta ?? undefined },
    });
  }

  private ensureAdminRole(actor: { id: string; role: Role }, targetRole?: Role) {
    if (actor.role !== Role.SUPER_ADMIN && actor.role !== Role.ADMIN) {
      throw new ForbiddenException({ message: 'Admin access required', error: 'FORBIDDEN' });
    }
    if (targetRole === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({ message: 'Super admin access required', error: 'FORBIDDEN' });
    }
  }

  private ensureSuperAdmin(actor: { role: Role }) {
    if (actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({ message: 'Super admin access required', error: 'FORBIDDEN' });
    }
  }

  async dashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [
      totalUsers,
      activeUsers,
      totalTests,
      activeTests,
      totalAppointments,
      todayAppointments,
      pendingReports,
      activeMemberships,
      revenueAgg,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, role: Role.USER } }),
      this.prisma.user.count({ where: { deletedAt: null, role: Role.USER, isActive: true } }),
      this.prisma.test.count({ where: { deletedAt: null } }),
      this.prisma.test.count({ where: { deletedAt: null, isActive: true } }),
      this.prisma.appointment.count({ where: { deletedAt: null } }),
      this.prisma.appointment.count({ where: { deletedAt: null, date: { gte: today } } }),
      this.prisma.testReport.count({ where: { status: { in: [ReportStatus.PENDING, ReportStatus.PROCESSING] } } }),
      this.prisma.membership.count({ where: { isActive: true, expiresAt: { gt: new Date() } } }),
      this.prisma.appointment.aggregate({
        where: { deletedAt: null, paymentStatus: PaymentStatus.PAID },
        _sum: { finalPrice: true },
      }),
    ]);

    const recentAppointments = await this.prisma.appointment.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { fullName: true, email: true } },
        test: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return {
      stats: {
        totalUsers,
        activeUsers,
        totalTests,
        activeTests,
        totalAppointments,
        todayAppointments,
        pendingReports,
        activeMemberships,
        totalRevenue: Number(revenueAgg._sum.finalPrice ?? 0),
      },
      recentAppointments,
    };
  }

  listUsers(query: { q?: string; role?: Role; active?: string; page?: string; limit?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(10, Number(query.limit) || 25));
    const where = {
      deletedAt: null,
      ...(query.q
        ? {
            OR: [
              { fullName: { contains: query.q } },
              { email: { contains: query.q } },
              { mobile: { contains: query.q } },
            ],
          }
        : {}),
      ...(query.role ? { role: query.role } : {}),
      ...(query.active === 'true' ? { isActive: true } : query.active === 'false' ? { isActive: false } : {}),
    };

    return this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          mobile: true,
          role: true,
          isActive: true,
          gender: true,
          createdAt: true,
          _count: { select: { appointments: true, memberships: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, limit, pages: Math.ceil(total / limit) }));
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: {
        addresses: true,
        familyMembers: true,
        memberships: { include: { plan: true, members: true }, orderBy: { createdAt: 'desc' } },
        appointments: {
          where: { deletedAt: null },
          include: { test: { select: { name: true } }, reports: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        notifications: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!user) throw new NotFoundException({ message: 'User not found', error: 'USER_NOT_FOUND' });
    const { passwordHash, ...safe } = user;
    void passwordHash;
    return safe;
  }

  async updateUser(
    actor: { id: string; role: Role },
    id: string,
    data: {
      fullName?: string;
      email?: string;
      mobile?: string;
      isActive?: boolean;
      role?: Role;
      gender?: string;
    },
  ) {
    this.ensureAdminRole(actor, data.role);
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException({ message: 'User not found', error: 'USER_NOT_FOUND' });

    if (data.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({ message: 'Only super admin can assign super admin role', error: 'FORBIDDEN' });
    }
    if (target.role === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException({ message: 'Cannot modify super admin', error: 'FORBIDDEN' });
    }
    if (id === actor.id && data.isActive === false) {
      throw new BadRequestException({ message: 'You cannot deactivate your own account', error: 'SELF_DEACTIVATE' });
    }
    if (data.isActive === false && (target.role === Role.ADMIN || target.role === Role.SUPER_ADMIN)) {
      const adminCount = await this.prisma.user.count({
        where: {
          role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
          isActive: true,
          deletedAt: null,
          id: { not: id },
        },
      });
      if (adminCount < 1) {
        throw new BadRequestException({ message: 'At least one active admin must remain', error: 'LAST_ADMIN' });
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        email: data.email,
        mobile: data.mobile,
        isActive: data.isActive,
        role: data.role,
        gender: data.gender as never,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobile: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    await this.audit(actor.id, 'UPDATE_USER', 'User', id, data);
    return updated;
  }

  listTests(query: { q?: string; categoryId?: string; active?: string }) {
    return this.prisma.test.findMany({
      where: {
        deletedAt: null,
        ...(query.q ? { name: { contains: query.q } } : {}),
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.active === 'true' ? { isActive: true } : query.active === 'false' ? { isActive: false } : {}),
      },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async createTest(
    actorId: string,
    dto: {
      name: string;
      categoryId: string;
      shortDescription: string;
      description: string;
      preparation: string;
      sampleType: string;
      reportHours?: number;
      price: number;
      specialPrice?: number;
      discountPercent?: number;
      membershipEligible?: boolean;
      membershipFree?: boolean;
      isPopular?: boolean;
      isActive?: boolean;
    },
  ) {
    const discountPercent =
      dto.discountPercent ??
      (dto.specialPrice != null && dto.price > 0
        ? Math.round((1 - dto.specialPrice / dto.price) * 10000) / 100
        : 0);
    const test = await this.prisma.test.create({
      data: {
        name: dto.name,
        slug: slugify(dto.name),
        categoryId: dto.categoryId,
        shortDescription: dto.shortDescription,
        description: dto.description,
        preparation: dto.preparation,
        sampleType: dto.sampleType,
        reportHours: dto.reportHours ?? 24,
        price: dto.price,
        discountPercent,
        membershipEligible: dto.membershipEligible ?? true,
        membershipFree: dto.membershipFree ?? false,
        isPopular: dto.isPopular ?? false,
        isActive: dto.isActive ?? true,
        faqs: [],
      },
      include: { category: true },
    });
    await this.audit(actorId, 'CREATE_TEST', 'Test', test.id, { name: test.name });
    return test;
  }

  async updateTest(actorId: string, id: string, dto: Record<string, unknown>) {
    const existing = await this.prisma.test.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException({ message: 'Test not found', error: 'TEST_NOT_FOUND' });

    const price = dto.price != null ? Number(dto.price) : Number(existing.price);
    let discountPercent = dto.discountPercent != null ? Number(dto.discountPercent) : Number(existing.discountPercent);
    if (dto.specialPrice != null && price > 0) {
      discountPercent = Math.round((1 - Number(dto.specialPrice) / price) * 10000) / 100;
    }

    const { specialPrice: _sp, ...rest } = dto;
    void _sp;
    const test = await this.prisma.test.update({
      where: { id },
      data: { ...rest, price, discountPercent } as never,
      include: { category: true },
    });
    await this.audit(actorId, 'UPDATE_TEST', 'Test', id, dto);
    return test;
  }

  listCategories() {
    return this.prisma.testCategory.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { tests: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(actorId: string, body: { name: string; description?: string }) {
    const cat = await this.prisma.testCategory.create({
      data: { name: body.name, slug: slugify(body.name), description: body.description },
    });
    await this.audit(actorId, 'CREATE_CATEGORY', 'TestCategory', cat.id, body);
    return cat;
  }

  async updateCategory(actorId: string, id: string, body: { name?: string; description?: string; isActive?: boolean }) {
    const cat = await this.prisma.testCategory.update({ where: { id }, data: body });
    await this.audit(actorId, 'UPDATE_CATEGORY', 'TestCategory', id, body);
    return cat;
  }

  listAppointments(query: { status?: AppointmentStatus; q?: string; payment?: PaymentStatus }) {
    return this.prisma.appointment.findMany({
      where: {
        deletedAt: null,
        ...(query.status ? { status: query.status } : {}),
        ...(query.payment ? { paymentStatus: query.payment } : {}),
        ...(query.q
          ? {
              OR: [
                { code: { contains: query.q } },
                { patientName: { contains: query.q } },
                { user: { fullName: { contains: query.q } } },
                { user: { email: { contains: query.q } } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true } },
        test: { select: { id: true, name: true, price: true } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async updateAppointmentStatus(actorId: string, id: string, status: AppointmentStatus) {
    const updated = await this.prisma.appointment.update({ where: { id }, data: { status } });
    await this.audit(actorId, 'UPDATE_STATUS', 'Appointment', id, { status });
    return updated;
  }

  async updateAppointmentPayment(
    actorId: string,
    id: string,
    data: { paymentStatus: PaymentStatus; paymentMethod?: string },
  ) {
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { paymentStatus: data.paymentStatus, paymentMethod: data.paymentMethod as never },
    });
    await this.audit(actorId, 'UPDATE_PAYMENT', 'Appointment', id, data);
    return updated;
  }

  listMemberships(query: { active?: string }) {
    return this.prisma.membership.findMany({
      where: {
        ...(query.active === 'true' ? { isActive: true, expiresAt: { gt: new Date() } } : {}),
        ...(query.active === 'false' ? { OR: [{ isActive: false }, { expiresAt: { lte: new Date() } }] } : {}),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobile: true } },
        plan: true,
        members: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  listPlans() {
    return this.prisma.membershipPlan.findMany({ include: { benefits: true, _count: { select: { memberships: true } } } });
  }

  async grantMembership(actorId: string, body: { userId: string; planId: string; months?: number }) {
    const plan = await this.prisma.membershipPlan.findUniqueOrThrow({ where: { id: body.planId } });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: body.userId } });
    const startsAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + (body.months ?? Math.round(plan.durationDays / 30)));

    const number = `HIC-${user.fullName.split(' ')[0].toUpperCase().slice(0, 4)}${String(Date.now()).slice(-4)}`;
    const membership = await this.prisma.membership.create({
      data: {
        userId: body.userId,
        planId: body.planId,
        number,
        startsAt,
        expiresAt,
        members: { create: [{ name: user.fullName, relation: 'Self', isPrimary: true }] },
      },
      include: { plan: true, user: { select: { fullName: true, email: true } } },
    });
    await this.audit(actorId, 'GRANT_MEMBERSHIP', 'Membership', membership.id, body);
    return membership;
  }

  listReports(query: { status?: ReportStatus }) {
    return this.prisma.testReport.findMany({
      where: query.status ? { status: query.status } : undefined,
      include: {
        user: { select: { fullName: true, email: true } },
        appointment: { include: { test: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async uploadReport(dto: {
    appointmentId: string;
    summary?: string;
    storagePath?: string;
    fileName?: string;
    fileMimeType?: string;
    fileSize?: number;
  }) {
    if (!dto.storagePath) {
      throw new BadRequestException({ message: 'Report file is required', error: 'FILE_REQUIRED' });
    }
    const appointment = await this.prisma.appointment.findUniqueOrThrow({
      where: { id: dto.appointmentId },
      include: { test: true },
    });
    const existing = await this.prisma.testReport.findFirst({ where: { appointmentId: dto.appointmentId } });
    const data = {
      status: ReportStatus.AVAILABLE,
      fileUrl: dto.storagePath,
      fileName: dto.fileName,
      fileMimeType: dto.fileMimeType,
      fileSize: dto.fileSize,
      summary: dto.summary,
      releasedAt: new Date(),
    };
    const report = existing
      ? await this.prisma.testReport.update({ where: { id: existing.id }, data })
      : await this.prisma.testReport.create({
          data: { userId: appointment.userId, appointmentId: appointment.id, ...data },
        });

    const body = `Your ${appointment.test.name} report is ready. ${dto.summary ?? 'Open HealthID Card to view and download.'}`;
    await this.prisma.notification.create({
      data: {
        userId: appointment.userId,
        type: NotificationType.REPORT_AVAILABLE,
        title: 'Report available',
        body,
      },
    });
    await this.whatsapp.send(appointment.userId, 'report_available', body);
    return report;
  }

  async getReportFile(id: string) {
    const report = await this.prisma.testReport.findUnique({
      where: { id },
      include: { appointment: { include: { test: true } } },
    });
    if (!report?.fileUrl) {
      throw new NotFoundException({ message: 'Report file not found', error: 'NOT_FOUND' });
    }
    const absolute = this.storage.resolveAbsolute(report.fileUrl);
    if (!existsSync(absolute)) {
      throw new NotFoundException({ message: 'Report file missing on server', error: 'FILE_MISSING' });
    }
    return {
      stream: createReadStream(absolute),
      fileName: report.fileName ?? `${report.appointment.code}-report.pdf`,
      mimeType: report.fileMimeType ?? 'application/octet-stream',
    };
  }

  getPaymentInvoice(id: string) {
    return this.invoice.getForAdmin(id);
  }

  listAuditLogs(query: { entity?: string; page?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = 50;
    const where = query.entity ? { entity: query.entity } : undefined;
    return this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        include: { user: { select: { fullName: true, email: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]).then(([items, total]) => ({ items, total, page, pages: Math.ceil(total / limit) }));
  }

  listWhatsAppMessages() {
    return this.prisma.whatsAppMessage.findMany({
      include: { user: { select: { fullName: true, mobile: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  getPricingSettings() {
    return this.platformSettings.getPricingSettings();
  }

  async updatePricingSettings(actor: { id: string; role: Role }, dto: Partial<PricingSettings>) {
    this.ensureSuperAdmin(actor);
    const updated = await this.platformSettings.updatePricingSettings(actor.id, dto);
    await this.audit(actor.id, 'UPDATE_PRICING_SETTINGS', 'PlatformSettings', 'default', dto);
    return updated;
  }

  listPayments(query: {
    q?: string;
    status?: PaymentStatus;
    method?: PaymentMethod;
    page?: string;
    limit?: string;
  }) {
    return this.paymentLedger.listForAdmin({
      q: query.q,
      status: query.status,
      method: query.method,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 25,
    });
  }

  getPayment(id: string) {
    return this.paymentLedger.getForAdmin(id);
  }

  async updatePaymentStatus(actorId: string, id: string, status: PaymentStatus) {
    const updated = await this.paymentLedger.updateStatus(id, status);
    await this.audit(actorId, 'UPDATE_PAYMENT_STATUS', 'PaymentTransaction', id, { status });
    return updated;
  }
}
