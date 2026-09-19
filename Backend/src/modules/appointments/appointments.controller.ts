import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateAppointmentDto, RescheduleDto } from './dto/appointments.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Get('slots')
  slots(@Query('date') date: string) {
    return this.appointments.slots(date);
  }

  @Get('serviceability')
  serviceability(@Query('pincode') pincode: string) {
    return this.appointments.checkServiceability(pincode);
  }

  @Get('quote')
  quote(
    @CurrentUser() user: { id: string },
    @Query('testId') testId: string,
    @Query('useWallet') useWallet?: string,
    @Query('useReferral') useReferral?: string,
  ) {
    return this.appointments.quote(user.id, testId, {
      useWallet: useWallet !== 'false',
      useReferral: useReferral !== 'false',
    });
  }

  @Get()
  list(@CurrentUser() user: { id: string }, @Query('status') status?: string) {
    return this.appointments.list(user.id, status);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateAppointmentDto) {
    return this.appointments.create(user.id, dto);
  }

  @Get(':id')
  get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.appointments.get(user.id, id);
  }

  @Patch(':id')
  reschedule(@CurrentUser() user: { id: string }, @Param('id') id: string, @Body() dto: RescheduleDto) {
    return this.appointments.reschedule(user.id, id, dto);
  }

  @Delete(':id')
  cancel(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.appointments.cancel(user.id, id);
  }
}
