import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private prisma: PrismaService) {}

  async send(userId: string, template: string, body: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user) return null;
    if (user.profile && !user.profile.whatsappOn) return null;

    const message = await this.prisma.whatsAppMessage.create({
      data: {
        userId,
        mobile: user.mobile,
        template,
        body,
        status: 'SENT',
      },
    });

    this.logger.log(`WhatsApp → ${user.mobile} [${template}]: ${body.slice(0, 120)}`);
    return message;
  }

  async notify(userId: string, template: string, title: string, body: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    if (!user?.profile?.notificationsOn) return;

    await this.prisma.notification.create({
      data: { userId, type: 'PROMOTIONAL' as never, title, body },
    });

    await this.send(userId, template, `${title}\n\n${body}`);
  }
}
