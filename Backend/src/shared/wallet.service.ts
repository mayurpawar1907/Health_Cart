import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WALLET_RULES, WalletTxnType } from './wallet.constants';

function money(n: number) {
  return Math.round(n * 100) / 100;
}

function generateReferralCode(fullName: string) {
  const base = fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() || 'HIC';
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base}${suffix}`;
}

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async assignReferralCode(userId: string, fullName: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.referralCode) return user.referralCode;

    for (let i = 0; i < 8; i++) {
      const code = generateReferralCode(fullName);
      try {
        const updated = await this.prisma.user.update({
          where: { id: userId },
          data: { referralCode: code },
        });
        return updated.referralCode!;
      } catch {
        /* collision — retry */
      }
    }
    throw new BadRequestException({ message: 'Could not generate referral code', error: 'REFERRAL_CODE_FAILED' });
  }

  async ensureWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({ data: { userId } });
    }
    return wallet;
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { referralCode: true, fullName: true },
    });
    const code = user.referralCode ?? (await this.assignReferralCode(userId, user.fullName));
    const wallet = await this.ensureWallet(userId);
    const transactions = await this.prisma.walletTransaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const referralTestsLeft = Math.floor(Number(wallet.referralBalance) / WALLET_RULES.REFERRAL_PER_TEST);

    return {
      balance: money(Number(wallet.balance)),
      referralBalance: money(Number(wallet.referralBalance)),
      totalSpendable: money(Number(wallet.balance) + Number(wallet.referralBalance)),
      referralPerTest: WALLET_RULES.REFERRAL_PER_TEST,
      referralTestsRemaining: referralTestsLeft,
      joiningBonusCredited: wallet.joiningBonusCredited,
      referralCode: code,
      rules: WALLET_RULES,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: money(Number(t.amount)),
        description: t.description,
        createdAt: t.createdAt,
      })),
    };
  }

  private async credit(
    userId: string,
    opts: {
      type: WalletTxnType;
      amount: number;
      toReferralPool?: boolean;
      description: string;
      meta?: Prisma.InputJsonValue;
    },
  ) {
    const wallet = await this.ensureWallet(userId);
    const amount = money(opts.amount);
    if (amount <= 0) return wallet;

    const balance = money(Number(wallet.balance) + (opts.toReferralPool ? 0 : amount));
    const referralBalance = money(Number(wallet.referralBalance) + (opts.toReferralPool ? amount : 0));

    const updated = await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance,
        referralBalance,
        joiningBonusCredited:
          opts.type === WalletTxnType.JOINING_BONUS ? true : wallet.joiningBonusCredited,
      },
    });

    await this.prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: opts.type,
        amount,
        balanceAfter: balance,
        referralBalanceAfter: referralBalance,
        description: opts.description,
        meta: opts.meta ?? undefined,
      },
    });

    return updated;
  }

  async creditJoiningBonus(userId: string) {
    const wallet = await this.ensureWallet(userId);
    if (wallet.joiningBonusCredited) return null;

    await this.credit(userId, {
      type: WalletTxnType.JOINING_BONUS,
      amount: WALLET_RULES.JOINING_BONUS,
      description: `₹${WALLET_RULES.JOINING_BONUS} joining bonus — welcome to HealthID Card`,
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.PROMOTIONAL,
        title: '₹250 joining bonus credited',
        body: `Your HealthID Wallet now has ₹${WALLET_RULES.JOINING_BONUS} to use on lab tests. Apply it at checkout.`,
      },
    });

    return WALLET_RULES.JOINING_BONUS;
  }

  async creditReferralBonus(referrerId: string, referredUserId: string) {
    const existing = await this.prisma.referral.findUnique({ where: { referredUserId } });
    if (existing) return null;

    await this.prisma.referral.create({
      data: {
        referrerId,
        referredUserId,
        bonusAmount: WALLET_RULES.REFERRAL_BONUS,
      },
    });

    await this.credit(referrerId, {
      type: WalletTxnType.REFERRAL_EARNED,
      amount: WALLET_RULES.REFERRAL_BONUS,
      toReferralPool: true,
      description: `₹${WALLET_RULES.REFERRAL_BONUS} referral bonus — friend activated HealthID Card`,
      meta: { referredUserId },
    });

    await this.prisma.notification.create({
      data: {
        userId: referrerId,
        type: NotificationType.PROMOTIONAL,
        title: 'Referral bonus unlocked!',
        body: `₹${WALLET_RULES.REFERRAL_BONUS} added to your referral wallet. Use ₹${WALLET_RULES.REFERRAL_PER_TEST} on each test booking (up to 5 tests).`,
      },
    });

    return WALLET_RULES.REFERRAL_BONUS;
  }

  async resolveReferrer(referralCode?: string) {
    if (!referralCode?.trim()) return null;
    const code = referralCode.trim().toUpperCase();
    return this.prisma.user.findFirst({
      where: { referralCode: code, deletedAt: null, isActive: true },
      select: { id: true, referralCode: true, fullName: true },
    });
  }

  computeCheckoutCredits(
    wallet: { balance: number; referralBalance: number },
    subtotalAfterCard: number,
    opts: { useWallet: boolean; useReferral: boolean },
  ) {
    let due = money(subtotalAfterCard);
    let referralApplied = 0;
    let walletApplied = 0;

    if (opts.useReferral && due > 0 && wallet.referralBalance > 0) {
      referralApplied = money(
        Math.min(WALLET_RULES.REFERRAL_PER_TEST, wallet.referralBalance, due),
      );
      due = money(due - referralApplied);
    }

    if (opts.useWallet && due > 0 && wallet.balance > 0) {
      walletApplied = money(Math.min(wallet.balance, due));
      due = money(due - walletApplied);
    }

    return { referralApplied, walletApplied, amountDue: due };
  }

  async debitForBooking(
    userId: string,
    appointmentId: string,
    referralApplied: number,
    walletApplied: number,
  ) {
    if (referralApplied <= 0 && walletApplied <= 0) return;

    const wallet = await this.ensureWallet(userId);
    const balance = money(Number(wallet.balance) - walletApplied);
    const referralBalance = money(Number(wallet.referralBalance) - referralApplied);

    if (balance < 0 || referralBalance < 0) {
      throw new BadRequestException({ message: 'Insufficient wallet balance', error: 'WALLET_INSUFFICIENT' });
    }

    await this.prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance, referralBalance },
    });

    if (referralApplied > 0) {
      await this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxnType.REFERRAL_REDEEMED,
          amount: -referralApplied,
          balanceAfter: balance,
          referralBalanceAfter: referralBalance,
          description: `₹${referralApplied} referral credit applied to booking`,
          appointmentId,
        },
      });
    }

    if (walletApplied > 0) {
      await this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTxnType.WALLET_REDEEMED,
          amount: -walletApplied,
          balanceAfter: balance,
          referralBalanceAfter: referralBalance,
          description: `₹${walletApplied} wallet balance applied to booking`,
          appointmentId,
        },
      });
    }
  }
}
