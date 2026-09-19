import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RemindersService } from './reminders.service';

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name);

  constructor(private reminders: RemindersService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCustomReminders() {
    const count = await this.reminders.processDueReminders();
    if (count) this.logger.log(`Sent ${count} custom test reminders`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleAppointmentReminders() {
    const count = await this.reminders.processAppointmentReminders();
    if (count) this.logger.log(`Sent ${count} appointment reminders`);
  }
}
