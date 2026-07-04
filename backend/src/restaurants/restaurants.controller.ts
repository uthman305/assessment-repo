import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RestaurantsService } from './restaurants.service';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get()
  async search(@Query() query: SearchRestaurantsDto) {
    const data = await this.restaurantsService.search(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.restaurantsService.findOne(id);
    return { success: true, data };
  }

  // Rate limited: max 5 review submissions per minute per client, to prevent review spam.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post(':id/reviews')
  async addReview(@Param('id') id: string, @Body() dto: CreateReviewDto) {
    const data = await this.restaurantsService.addReview(id, dto);
    return { success: true, message: 'Review submitted successfully', data };
  }
}
