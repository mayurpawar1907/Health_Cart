import { Controller, Get, Param, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('history')
@ApiBearerAuth()
@Controller()
export class HistoryController {
  constructor(private history: HistoryService) {}

  @Get('history')
  list(@CurrentUser() user: { id: string }) {
    return this.history.history(user.id);
  }

  @Get('reports')
  reports(@CurrentUser() user: { id: string }) {
    return this.history.reports(user.id);
  }

  @Get('reports/:id')
  report(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.history.report(user.id, id);
  }

  @Get('reports/:id/file')
  async reportFile(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    const { stream, fileName, mimeType } = await this.history.getReportFile(user.id, id);
    return new StreamableFile(stream, {
      type: mimeType,
      disposition: `attachment; filename="${fileName.replace(/"/g, '')}"`,
    });
  }
}
