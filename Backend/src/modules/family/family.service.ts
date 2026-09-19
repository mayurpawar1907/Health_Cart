import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MembershipService } from '../membership/membership.service';
import { CreateFamilyMemberDto } from './dto/family.dto';

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private membership: MembershipService,
  ) {}

  list(userId: string) {
    return this.prisma.familyMember.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(userId: string, dto: CreateFamilyMemberDto) {
    const member = await this.prisma.familyMember.create({
      data: {
        userId,
        name: dto.name,
        relation: dto.relation,
        age: dto.age,
        gender: dto.gender,
        mobile: dto.mobile,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    const card = await this.membership.current(userId);
    if (card) {
      await this.membership.addFamilyToCard(userId, member.id).catch(() => undefined);
    }

    return member;
  }

  async remove(userId: string, id: string) {
    const member = await this.prisma.familyMember.findFirst({ where: { id, userId } });
    if (!member) throw new NotFoundException({ message: 'Family member not found', error: 'NOT_FOUND' });

    await this.prisma.membershipMember.deleteMany({ where: { familyMemberId: id } });
    await this.prisma.familyMember.delete({ where: { id } });
    return { message: 'Removed' };
  }
}
