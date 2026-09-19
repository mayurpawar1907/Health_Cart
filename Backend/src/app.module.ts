import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TestsModule } from './modules/tests/tests.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MembershipModule } from './modules/membership/membership.module';
import { FamilyModule } from './modules/family/family.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { HistoryModule } from './modules/history/history.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AdminModule } from './modules/admin/admin.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 80 }]),
    PrismaModule,
    SharedModule,
    AuthModule,
    UsersModule,
    TestsModule,
    AppointmentsModule,
    MembershipModule,
    FamilyModule,
    RemindersModule,
    NotificationsModule,
    HistoryModule,
    DashboardModule,
    AdminModule,
    WalletModule,
    SettingsModule,
    PaymentsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
