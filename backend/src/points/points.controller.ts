import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PointsService } from './points.service';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';

@Controller('points')
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Post('earn')
  async earn(@Body() dto: EarnPointsDto) {
    const data = await this.pointsService.earn(dto);
    return { success: true, data };
  }

  @Post('redeem')
  async redeem(@Body() dto: RedeemPointsDto) {
    const data = await this.pointsService.redeem(dto);
    return { success: true, data };
  }

  @Get('balance/:userId')
  async balance(@Param('userId') userId: string) {
    const data = await this.pointsService.getBalanceWithHistory(userId);
    return { success: true, data };
  }
}
