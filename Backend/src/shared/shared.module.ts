import { Global, Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { WhatsAppService } from './whatsapp.service';
import { WalletService } from './wallet.service';
import { CheckoutService } from './checkout.service';
import { PlatformSettingsService } from './platform-settings.service';
import { PaymentLedgerService } from './payment-ledger.service';
import { StorageService } from './storage.service';
import { InvoiceService } from './invoice.service';

@Global()
@Module({
  providers: [
    PricingService,
    WhatsAppService,
    WalletService,
    CheckoutService,
    PlatformSettingsService,
    PaymentLedgerService,
    StorageService,
    InvoiceService,
  ],
  exports: [
    PricingService,
    WhatsAppService,
    WalletService,
    CheckoutService,
    PlatformSettingsService,
    PaymentLedgerService,
    StorageService,
    InvoiceService,
  ],
})
export class SharedModule {}
