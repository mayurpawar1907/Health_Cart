import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { Gender } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsBoolean()
  notificationsOn?: boolean;

  @IsOptional()
  @IsBoolean()
  whatsappOn?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @Matches(/^\d{6}$/)
  pincode?: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
  newPassword: string;
}
