import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TestsService } from './tests.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('tests')
@ApiBearerAuth()
@Controller('tests')
export class TestsController {
  constructor(private tests: TestsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('popular') popular?: string,
    @Query('membership') membership?: string,
    @Query('packages') packages?: string,
  ) {
    return this.tests.list({ search, category, minPrice, maxPrice, sort, popular, membership, packages }, user.id);
  }

  @Get('categories')
  categories() {
    return this.tests.categories();
  }

  @Get('search/suggest')
  suggest(@Query('q') q: string) {
    return this.tests.searchSuggestions(q);
  }

  @Get(':id')
  get(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.tests.get(id, user.id);
  }
}
