import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentStatus, PaymentMethod, PaymentStatus, ReportStatus, Role } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { StorageService } from '../../shared/storage.service';

class UpsertTestDto {
  @IsString() name: string;
  @IsString() categoryId: string;
  @IsString() shortDescription: string;
  @IsString() description: string;
  @IsString() preparation: string;
  @IsString() sampleType: string;
  @IsOptional() @Type(() => Number) @IsNumber() reportHours?: number;
  @Type(() => Number) @IsNumber() price: number;
  @IsOptional() @Type(() => Number) @IsNumber() specialPrice?: number;
  @IsOptional() @Type(() => Number) @IsNumber() discountPercent?: number;
  @IsOptional() @IsBoolean() membershipEligible?: boolean;
  @IsOptional() @IsBoolean() membershipFree?: boolean;
  @IsOptional() @IsBoolean() isPopular?: boolean;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class UpdateUserDto {
  @IsOptional() @IsString() fullName?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() mobile?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsEnum(Role) role?: Role;
}

class StatusDto {
  @IsEnum(AppointmentStatus) status: AppointmentStatus;
}

class PaymentDto {
  @IsEnum(PaymentStatus) paymentStatus: PaymentStatus;
  @IsOptional() @IsString() paymentMethod?: string;
}

class UploadReportDto {
  @IsString() appointmentId: string;
  @IsOptional() @IsString() summary?: string;
}

class GrantMembershipDto {
  @IsString() userId: string;
  @IsString() planId: string;
  @IsOptional() @Type(() => Number) @IsNumber() months?: number;
}

class UpdatePricingSettingsDto {
  @IsOptional() @Type(() => Number) @IsNumber() paymentPromoPercent?: number;
  @IsOptional() @IsBoolean() paymentPromoActive?: boolean;
  @IsOptional() @IsBoolean() paymentPromoApplyToAllUsers?: boolean;
  @IsOptional() @IsString() promoLabel?: string;
}

class PaymentStatusDto {
  @IsEnum(PaymentStatus) status: PaymentStatus;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private admin: AdminService,
    private storage: StorageService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.admin.dashboard();
  }

  @Get('users')
  users(
    @Query('q') q?: string,
    @Query('role') role?: Role,
    @Query('active') active?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listUsers({ q, role, active, page, limit });
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.admin.getUser(id);
  }

  @Patch('users/:id')
  updateUser(
    @CurrentUser() actor: { id: string; role: Role },
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.admin.updateUser(actor, id, dto);
  }

  @Patch('users/:id/active')
  toggleUser(
    @CurrentUser() actor: { id: string; role: Role },
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.admin.updateUser(actor, id, { isActive: body.isActive });
  }

  @Get('tests')
  tests(@Query('q') q?: string, @Query('categoryId') categoryId?: string, @Query('active') active?: string) {
    return this.admin.listTests({ q, categoryId, active });
  }

  @Post('tests')
  createTest(@CurrentUser() actor: { id: string }, @Body() dto: UpsertTestDto) {
    return this.admin.createTest(actor.id, dto);
  }

  @Patch('tests/:id')
  updateTest(@CurrentUser() actor: { id: string }, @Param('id') id: string, @Body() dto: Partial<UpsertTestDto>) {
    return this.admin.updateTest(actor.id, id, dto);
  }

  @Get('categories')
  categories() {
    return this.admin.listCategories();
  }

  @Post('categories')
  createCategory(@CurrentUser() actor: { id: string }, @Body() body: { name: string; description?: string }) {
    return this.admin.createCategory(actor.id, body);
  }

  @Patch('categories/:id')
  updateCategory(
    @CurrentUser() actor: { id: string },
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; isActive?: boolean },
  ) {
    return this.admin.updateCategory(actor.id, id, body);
  }

  @Get('appointments')
  appointments(
    @Query('status') status?: AppointmentStatus,
    @Query('q') q?: string,
    @Query('payment') payment?: PaymentStatus,
  ) {
    return this.admin.listAppointments({ status, q, payment });
  }

  @Patch('appointments/:id/status')
  updateAppointment(
    @CurrentUser() actor: { id: string },
    @Param('id') id: string,
    @Body() dto: StatusDto,
  ) {
    return this.admin.updateAppointmentStatus(actor.id, id, dto.status);
  }

  @Patch('appointments/:id/payment')
  updatePayment(
    @CurrentUser() actor: { id: string },
    @Param('id') id: string,
    @Body() dto: PaymentDto,
  ) {
    return this.admin.updateAppointmentPayment(actor.id, id, dto);
  }

  @Get('memberships')
  memberships(@Query('active') active?: string) {
    return this.admin.listMemberships({ active });
  }

  @Get('membership-plans')
  plans() {
    return this.admin.listPlans();
  }

  @Post('memberships/grant')
  grantMembership(@CurrentUser() actor: { id: string }, @Body() dto: GrantMembershipDto) {
    return this.admin.grantMembership(actor.id, dto);
  }

  @Get('reports')
  reports(@Query('status') status?: ReportStatus) {
    return this.admin.listReports({ status });
  }

  @Post('reports/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadReport(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadReportDto,
  ) {
    const saved = this.storage.saveReportFile(file, dto.appointmentId);
    return this.admin.uploadReport({
      appointmentId: dto.appointmentId,
      summary: dto.summary,
      storagePath: saved.storagePath,
      fileName: saved.fileName,
      fileMimeType: saved.fileMimeType,
      fileSize: saved.fileSize,
    });
  }

  @Get('reports/:id/file')
  async downloadReport(@Param('id') id: string) {
    const { stream, fileName, mimeType } = await this.admin.getReportFile(id);
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: `attachment; filename="${fileName.replace(/"/g, '')}"`,
    });
  }

  @Get('audit-logs')
  auditLogs(@Query('entity') entity?: string, @Query('page') page?: string) {
    return this.admin.listAuditLogs({ entity, page });
  }

  @Get('whatsapp')
  whatsapp() {
    return this.admin.listWhatsAppMessages();
  }

  @Get('settings/pricing')
  pricingSettings() {
    return this.admin.getPricingSettings();
  }

  @Patch('settings/pricing')
  updatePricingSettings(
    @CurrentUser() actor: { id: string; role: Role },
    @Body() dto: UpdatePricingSettingsDto,
  ) {
    return this.admin.updatePricingSettings(actor, dto);
  }

  @Get('payments')
  payments(
    @Query('q') q?: string,
    @Query('status') status?: PaymentStatus,
    @Query('method') method?: PaymentMethod,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.admin.listPayments({ q, status, method, page, limit });
  }

  @Get('payments/:id')
  paymentDetail(@Param('id') id: string) {
    return this.admin.getPayment(id);
  }

  @Patch('payments/:id/status')
  updatePaymentStatus(
    @CurrentUser() actor: { id: string },
    @Param('id') id: string,
    @Body() dto: PaymentStatusDto,
  ) {
    return this.admin.updatePaymentStatus(actor.id, id, dto.status);
  }

  @Get('payments/:id/invoice')
  paymentInvoice(@Param('id') id: string) {
    return this.admin.getPaymentInvoice(id);
  }
}
