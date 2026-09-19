import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { MembershipService } from './membership.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

class SubscribeDto {
  @IsString()
  planId: string;
}

class FamilyLinkDto {
  @IsString()
  familyMemberId: string;
}

@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(private membership: MembershipService) {}

  @Public()
  @Get('plans')
  plans() {
    return this.membership.plans();
  }

  @ApiBearerAuth()
  @Get()
  current(@CurrentUser() user: { id: string }) {
    return this.membership.current(user.id);
  }

  @ApiBearerAuth()
  @Get('card')
  card(@CurrentUser() user: { id: string }) {
    return this.membership.card(user.id);
  }

  @ApiBearerAuth()
  @Get('benefits')
  benefits(@CurrentUser() user: { id: string }) {
    return this.membership.benefits(user.id);
  }

  @ApiBearerAuth()
  @Post()
  subscribe(@CurrentUser() user: { id: string }, @Body() dto: SubscribeDto) {
    return this.membership.subscribe(user.id, dto.planId);
  }

  @ApiBearerAuth()
  @Post('family')
  addFamily(@CurrentUser() user: { id: string }, @Body() dto: FamilyLinkDto) {
    return this.membership.addFamilyToCard(user.id, dto.familyMemberId);
  }

  @ApiBearerAuth()
  @Delete('family/:id')
  removeFamily(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.membership.removeFromCard(user.id, id);
  }
}
