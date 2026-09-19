import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile')
  profile(@CurrentUser() user: { id: string }) {
    return this.users.getProfile(user.id);
  }

  @Patch('profile')
  update(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Post('change-password')
  changePassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user.id, dto);
  }
}
