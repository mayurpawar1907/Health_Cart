import { CollectionType, PaymentMethod } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  testId: string;

  @IsString()
  date: string;

  @IsString()
  timeSlot: string;

  @IsString()
  patientName: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  patientAge?: number;

  @IsOptional()
  @IsEnum(CollectionType)
  collectionType?: CollectionType;

  @IsOptional()
  @IsString()
  addressId?: string;

  @IsOptional()
  @IsString()
  familyMemberId?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsBoolean()
  reminderEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  useWallet?: boolean;

  @IsOptional()
  @IsBoolean()
  useReferral?: boolean;
}

export class RescheduleDto {
  @IsString()
  date: string;

  @IsString()
  timeSlot: string;
}

export class QuoteDto {
  @IsString()
  testId: string;
}
