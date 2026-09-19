import { Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.notifications.list(user.id);
  }

  @Get('unread-count')
  unread(@CurrentUser() user: { id: string }) {
    return this.notifications.unreadCount(user.id).then((count) => ({ count }));
  }

  @Patch('read-all')
  readAll(@CurrentUser() user: { id: string }) {
    return this.notifications.markAll(user.id);
  }

  @Patch(':id/read')
  read(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notifications.markRead(user.id, id);
  }
}
