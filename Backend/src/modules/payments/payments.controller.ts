import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PaymentLedgerService } from '../../shared/payment-ledger.service';
import { InvoiceService } from '../../shared/invoice.service';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(
    private ledger: PaymentLedgerService,
    private invoiceService: InvoiceService,
  ) {}

  @Get('transactions')
  list(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ledger.listForUser(user.id, page ? Number(page) : 1, limit ? Number(limit) : 20);
  }

  @Get('transactions/:id')
  detail(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ledger.getForUser(user.id, id);
  }

  @Get('transactions/:id/invoice')
  invoice(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.invoiceService.getForUser(user.id, id);
  }
}
