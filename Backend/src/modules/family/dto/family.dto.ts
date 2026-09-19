import { FamilyRelation, Gender } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFamilyMemberDto {
  @IsString()
  name: string;

  @IsEnum(FamilyRelation)
  relation: FamilyRelation;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  age?: number;

  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  mobile?: string;
}
