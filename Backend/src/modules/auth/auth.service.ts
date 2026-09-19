import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { WalletService } from '../../shared/wallet.service';
import { ForgotPasswordDto, LoginDto, ResetPasswordDto, SignupDto } from './dto/auth.dto';
import { NotificationType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private wallet: WalletService,
  ) {}

  async signup(dto: SignupDto) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({
        message: 'Passwords do not match',
        error: 'PASSWORD_MISMATCH',
      });
    }
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email.toLowerCase() }, { mobile: dto.mobile }] },
    });
    if (existing) {
      throw new ConflictException({
        message: 'Email or mobile is already registered',
        error: 'DUPLICATE_ACCOUNT',
      });
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const referrer = dto.referralCode ? await this.wallet.resolveReferrer(dto.referralCode) : null;
    if (dto.referralCode?.trim() && !referrer) {
      throw new BadRequestException({
        message: 'Invalid referral code',
        error: 'INVALID_REFERRAL_CODE',
      });
    }

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName.trim(),
        email: dto.email.toLowerCase(),
        mobile: dto.mobile,
        passwordHash,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        gender: dto.gender,
        referredByUserId: referrer?.id,
        profile: { create: {} },
        wallet: { create: {} },
        notifications: {
          create: {
            type: NotificationType.PROMOTIONAL,
            title: 'Welcome to HealthID Card',
            body: referrer
              ? 'Account created. Activate your free HealthID Card to unlock member rates and ₹250 joining bonus.'
              : 'Your account is ready. Activate your free HealthID Card and get ₹250 wallet bonus.',
          },
        },
      },
    });

    await this.wallet.assignReferralCode(user.id, user.fullName);

    return {
      message: 'Account created. Please log in to continue.',
      email: user.email,
    };
  }

  async login(dto: LoginDto, userAgent?: string) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [{ email: identifier }, { mobile: dto.identifier.trim() }],
      },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
        error: 'INVALID_CREDENTIALS',
      });
    }
    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'Account is deactivated',
        error: 'ACCOUNT_INACTIVE',
      });
    }
    return this.issueTokens(user.id, user.email, user.role, user.fullName, userAgent);
  }

  async refresh(refreshToken: string, userAgent?: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; typ: string }>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
      if (payload.typ !== 'refresh') throw new Error('bad');
      const tokenHash = this.hash(refreshToken);
      const stored = await this.prisma.refreshToken.findFirst({
        where: { tokenHash, userId: payload.sub, revokedAt: null, expiresAt: { gt: new Date() } },
      });
      if (!stored) throw new Error('missing');
      await this.prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
      return this.issueTokens(user.id, user.email, user.role, user.fullName, userAgent);
    } catch {
      throw new UnauthorizedException({
        message: 'Session expired. Please sign in again.',
        error: 'REFRESH_FAILED',
      });
    }
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: this.hash(refreshToken), revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Logged out' };
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out from all devices' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { mobile: dto.identifier.trim() }] },
    });
    if (!user) {
      return { message: 'If an account exists, a reset token has been issued.' };
    }
    const raw = randomBytes(24).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hash(raw),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      },
    });
    return {
      message: 'If an account exists, a reset token has been issued.',
      resetToken: process.env.NODE_ENV === 'production' ? undefined : raw,
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash: this.hash(dto.token), usedAt: null, expiresAt: { gt: new Date() } },
    });
    if (!token) {
      throw new BadRequestException({ message: 'Invalid or expired reset token', error: 'RESET_INVALID' });
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
      this.prisma.refreshToken.updateMany({
        where: { userId: token.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);
    return { message: 'Password updated. Please sign in.' };
  }

  async sessions(userId: string) {
    return this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, userAgent: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: string,
    fullName: string,
    userAgent?: string,
  ) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role, typ: 'access' },
      {
        secret: this.config.getOrThrow('JWT_ACCESS_SECRET'),
        expiresIn: (this.config.get('JWT_ACCESS_EXPIRES_IN') ?? '15m') as `${number}m`,
      },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: userId, typ: 'refresh' },
      {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: (this.config.get('JWT_REFRESH_EXPIRES_IN') ?? '7d') as `${number}d`,
      },
    );
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: this.hash(refreshToken),
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role, fullName },
    };
  }

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }
}
