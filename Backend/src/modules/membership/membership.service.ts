import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../../shared/wallet.service';
import { WhatsAppService } from '../../shared/whatsapp.service';

@Injectable()
export class MembershipService {
  constructor(
    private prisma: PrismaService,
    private whatsapp: WhatsAppService,
    private wallet: WalletService,
  ) {}

  plans() {
    return this.prisma.membershipPlan.findMany({
      where: { isActive: true },
      include: { benefits: { include: { test: true } } },
      orderBy: [{ isFree: 'desc' }, { price: 'asc' }],
    });
  }

  async current(userId: string) {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      include: {
        plan: { include: { benefits: { include: { test: true } } } },
        usage: { include: { test: true }, orderBy: { usedAt: 'desc' } },
        members: { include: { familyMember: true } },
      },
    });
    return membership;
  }

  async card(userId: string) {
    const membership = await this.current(userId);
    if (!membership) throw new NotFoundException({ message: 'No active membership', error: 'NO_MEMBERSHIP' });
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      brand: 'HEALTH ID CARD',
      title: 'Family Health Card',
      memberName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      membershipId: membership.number,
      validFrom: membership.startsAt,
      validUntil: membership.expiresAt,
      plan: membership.plan.name,
      flatDiscountPercent: Number(membership.plan.flatDiscountPercent),
      maxFamilyMembers: membership.plan.maxFamilyMembers,
      familyMembers: membership.members.map((m) => ({
        id: m.id,
        name: m.name,
        relation: m.relation,
        isPrimary: m.isPrimary,
      })),
      qrPayload: JSON.stringify({
        v: 2,
        id: membership.number,
        name: user.fullName,
        valid: membership.expiresAt.toISOString().slice(0, 10),
      }),
    };
  }

  benefits(userId: string) {
    return this.current(userId).then((m) => m?.plan.benefits ?? []);
  }

  async subscribe(userId: string, planId: string) {
    const plan = await this.prisma.membershipPlan.findFirst({ where: { id: planId, isActive: true } });
    if (!plan) throw new BadRequestException({ message: 'Invalid plan', error: 'INVALID_PLAN' });
    const existing = await this.current(userId);
    if (existing) {
      throw new BadRequestException({ message: 'You already have an active membership', error: 'ALREADY_MEMBER' });
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, fullName: true, referredByUserId: true },
    });
    const startsAt = new Date();
    const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 86400000);
    const number = `HIC-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-6)}`;

    const membership = await this.prisma.membership.create({
      data: {
        userId,
        planId: plan.id,
        number,
        startsAt,
        expiresAt,
        members: {
          create: {
            name: user.fullName,
            relation: 'Self',
            isPrimary: true,
          },
        },
      },
      include: { plan: { include: { benefits: true } }, members: true },
    });

    const family = await this.prisma.familyMember.findMany({ where: { userId } });
    for (const f of family.slice(0, plan.maxFamilyMembers - 1)) {
      await this.addFamilyToCard(userId, f.id, membership.id);
    }

    const priceText = plan.isFree ? 'FREE for 1 year' : `₹${Number(plan.price)}/year`;
    const body = `Your HealthID Card (${number}) is active until ${expiresAt.toDateString()}. ${priceText}. Enjoy ${Number(plan.flatDiscountPercent)}% off on all tests + free home collection.`;
    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.PROMOTIONAL,
        title: 'HealthID Card activated',
        body,
      },
    });
    await this.whatsapp.send(userId, 'membership_activated', body);

    await this.wallet.assignReferralCode(userId, user.fullName);
    await this.wallet.creditJoiningBonus(userId);

    if (user.referredByUserId) {
      await this.wallet.creditReferralBonus(user.referredByUserId, userId);
    }

    return membership;
  }

  async addFamilyToCard(userId: string, familyMemberId: string, membershipId?: string) {
    const membership =
      membershipId
        ? await this.prisma.membership.findFirst({ where: { id: membershipId, userId }, include: { plan: true } })
        : await this.current(userId);
    if (!membership) throw new BadRequestException({ message: 'No active membership', error: 'NO_MEMBERSHIP' });

    const family = await this.prisma.familyMember.findFirst({ where: { id: familyMemberId, userId } });
    if (!family) throw new NotFoundException({ message: 'Family member not found', error: 'NOT_FOUND' });

    const count = await this.prisma.membershipMember.count({ where: { membershipId: membership.id } });
    if (count >= membership.plan.maxFamilyMembers) {
      throw new BadRequestException({
        message: `Card supports up to ${membership.plan.maxFamilyMembers} members`,
        error: 'FAMILY_LIMIT',
      });
    }

    const existing = await this.prisma.membershipMember.findFirst({
      where: { membershipId: membership.id, familyMemberId },
    });
    if (existing) return existing;

    return this.prisma.membershipMember.create({
      data: {
        membershipId: membership.id,
        familyMemberId,
        name: family.name,
        relation: family.relation,
      },
    });
  }

  async removeFromCard(userId: string, memberId: string) {
    const membership = await this.current(userId);
    if (!membership) throw new BadRequestException({ message: 'No active membership', error: 'NO_MEMBERSHIP' });
    const member = await this.prisma.membershipMember.findFirst({
      where: { id: memberId, membershipId: membership.id, isPrimary: false },
    });
    if (!member) throw new NotFoundException({ message: 'Cannot remove primary member', error: 'NOT_FOUND' });
    await this.prisma.membershipMember.delete({ where: { id: member.id } });
    return { message: 'Removed from card' };
  }
}
