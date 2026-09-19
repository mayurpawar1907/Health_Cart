import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFamilyMemberDto } from './dto/family.dto';
import { FamilyService } from './family.service';

@ApiTags('family')
@ApiBearerAuth()
@Controller('family')
export class FamilyController {
  constructor(private family: FamilyService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.family.list(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateFamilyMemberDto) {
    return this.family.create(user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.family.remove(user.id, id);
  }
}
