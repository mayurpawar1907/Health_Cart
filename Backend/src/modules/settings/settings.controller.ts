import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PlatformSettingsService } from '../../shared/platform-settings.service';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private platformSettings: PlatformSettingsService) {}

  @Public()
  @Get('pricing')
  async pricing() {
    const s = await this.platformSettings.getPricingSettings();
    return {
      paymentPromoPercent: s.paymentPromoPercent,
      paymentPromoActive: s.paymentPromoActive,
      paymentPromoApplyToAllUsers: s.paymentPromoApplyToAllUsers,
      promoLabel: s.promoLabel,
      updatedAt: s.updatedAt,
    };
  }
}
