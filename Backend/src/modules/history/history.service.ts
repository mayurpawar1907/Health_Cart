import { Injectable, NotFoundException } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/storage.service';

@Injectable()
export class HistoryService {
  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
  ) {}

  history(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId, deletedAt: null },
      include: { test: true, reports: true },
      orderBy: { date: 'desc' },
    });
  }

  reports(userId: string) {
    return this.prisma.testReport.findMany({
      where: { userId },
      include: { appointment: { include: { test: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async report(userId: string, id: string) {
    const report = await this.prisma.testReport.findFirst({
      where: { id, userId },
      include: { appointment: { include: { test: true } } },
    });
    if (!report) throw new NotFoundException({ message: 'Report not found', error: 'REPORT_NOT_FOUND' });
    return report;
  }

  async getReportFile(userId: string, id: string) {
    const report = await this.prisma.testReport.findFirst({
      where: { id, userId },
      include: { appointment: true },
    });
    if (!report?.fileUrl) {
      throw new NotFoundException({ message: 'Report file not found', error: 'REPORT_NOT_FOUND' });
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
}
