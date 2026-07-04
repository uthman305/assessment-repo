import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { PointsModule } from './points/points.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Review } from './restaurants/entities/review.entity';
import { User } from './users/entities/user.entity';
import { PointsLedger } from './points/entities/points-ledger.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'localbuka'),
        entities: [Restaurant, Review, User, PointsLedger],
        // The schema is provided/managed via DATABASE_SCHEMA.sql, not TypeORM migrations.
        synchronize: false,
      }),
    }),
    RestaurantsModule,
    PointsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
