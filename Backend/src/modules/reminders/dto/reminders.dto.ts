import { IsOptional, IsString } from 'class-validator';

export class CreateReminderDto {
  @IsOptional()
  @IsString()
  testId?: string;

  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsString()
  label: string;

  @IsString()
  remindAt: string;
}
