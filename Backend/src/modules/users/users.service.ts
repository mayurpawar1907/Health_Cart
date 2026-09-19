import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, addresses: { orderBy: { createdAt: 'desc' } } },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _p, ...safe } = user;
    return safe;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
        avatarUrl: dto.avatarUrl,
        profile: {
          upsert: {
            create: {
              language: dto.language ?? 'en',
              theme: dto.theme ?? 'system',
              notificationsOn: dto.notificationsOn ?? true,
              whatsappOn: dto.whatsappOn ?? true,
              locationLat: dto.locationLat,
              locationLng: dto.locationLng,
            },
            update: {
              language: dto.language,
              theme: dto.theme,
              notificationsOn: dto.notificationsOn,
              whatsappOn: dto.whatsappOn,
              locationLat: dto.locationLat,
              locationLng: dto.locationLng,
            },
          },
        },
      },
    });

    if (dto.line1 && dto.city && dto.state && dto.pincode) {
      const existing = await this.prisma.address.findFirst({ where: { userId, isPrimary: true } });
      if (existing) {
        await this.prisma.address.update({
          where: { id: existing.id },
          data: {
            line1: dto.line1,
            city: dto.city,
            state: dto.state,
            pincode: dto.pincode,
            latitude: dto.locationLat,
            longitude: dto.locationLng,
          },
        });
      } else {
        await this.prisma.address.create({
          data: {
            userId,
            line1: dto.line1,
            city: dto.city,
            state: dto.state,
            pincode: dto.pincode,
            latitude: dto.locationLat,
            longitude: dto.locationLng,
          },
        });
      }
    }

    return this.getProfile(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (!(await bcrypt.compare(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException({ message: 'Current password is incorrect', error: 'BAD_PASSWORD' });
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) },
    });
    return { message: 'Password changed' };
  }
}
