import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsController } from './points.controller';
import { PointsService } from './points.service';
import { PointsLedger } from './entities/points-ledger.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PointsLedger, User])],
  controllers: [PointsController],
  providers: [PointsService],
})
export class PointsModule {}
