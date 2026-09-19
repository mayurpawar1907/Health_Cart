import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { ForgotPasswordDto, LoginDto, RefreshDto, ResetPasswordDto, SignupDto } from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.auth.signup(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, req.headers['user-agent']);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.auth.refresh(dto.refreshToken, req.headers['user-agent']);
  }

  @Public()
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  logout(@CurrentUser() user: { id: string }, @Body() dto: RefreshDto) {
    return this.auth.logout(user.id, dto.refreshToken);
  }

  @ApiBearerAuth()
  @Post('logout-all')
  logoutAll(@CurrentUser() user: { id: string }) {
    return this.auth.logoutAll(user.id);
  }

  @ApiBearerAuth()
  @Get('sessions')
  sessions(@CurrentUser() user: { id: string }) {
    return this.auth.sessions(user.id);
  }
}
