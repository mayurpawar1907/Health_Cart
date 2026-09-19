import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletService } from '../../shared/wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private wallet: WalletService) {}

  @Get()
  summary(@CurrentUser() user: { id: string }) {
    return this.wallet.getSummary(user.id);
  }
}
