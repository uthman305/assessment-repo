import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { PointsLedger } from './entities/points-ledger.entity';
import { User } from '../users/entities/user.entity';
import { EarnPointsDto } from './dto/earn-points.dto';
import { RedeemPointsDto } from './dto/redeem-points.dto';

const POINTS_MAP: Record<string, number> = {
  'check-in': 50,
  review: 20,
  referral: 100,
};

@Injectable()
export class PointsService {
  constructor(
    @InjectRepository(PointsLedger)
    private readonly ledgerRepo: Repository<PointsLedger>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async earn(dto: EarnPointsDto) {
    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${dto.userId}" not found`);
    }

    if (dto.action === 'check-in') {
      if (!dto.restaurantId) {
        throw new BadRequestException('restaurantId is required for check-in');
      }
      await this.assertNoCheckInToday(dto.userId, dto.restaurantId);
    }

    if (dto.action === 'referral') {
      if (!dto.referredUserId) {
        throw new BadRequestException('referredUserId is required for referral');
      }
      const referredUser = await this.usersRepo.findOne({ where: { id: dto.referredUserId } });
      if (!referredUser) {
        throw new BadRequestException('Referred user does not exist');
      }
      if (!referredUser.hasCompletedOrder) {
        throw new BadRequestException('Referred user has not completed their first order yet');
      }
    }

    const points = POINTS_MAP[dto.action];

    const entry = this.ledgerRepo.create({
      id: `tx_${randomUUID().slice(0, 8)}`,
      userId: dto.userId,
      action: dto.action,
      restaurantId: dto.restaurantId ?? null,
      points,
    });
    await this.ledgerRepo.save(entry);

    const newBalance = await this.getBalance(dto.userId);

    return { pointsAdded: points, newBalance };
  }

  async redeem(dto: RedeemPointsDto) {
    if (dto.points % 50 !== 0) {
      throw new BadRequestException('Points must be redeemed in multiples of 50');
    }

    const user = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${dto.userId}" not found`);
    }

    const currentBalance = await this.getBalance(dto.userId);
    if (currentBalance < dto.points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const entry = this.ledgerRepo.create({
      id: `tx_${randomUUID().slice(0, 8)}`,
      userId: dto.userId,
      action: 'redeem',
      restaurantId: null,
      points: -dto.points,
    });
    await this.ledgerRepo.save(entry);

    const newBalance = await this.getBalance(dto.userId);
    const voucherCode = this.generateVoucherCode();

    return { pointsRedeemed: dto.points, newBalance, voucherCode };
  }

  async getBalanceWithHistory(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }

    const history = await this.ledgerRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const balance = history.reduce((sum, tx) => sum + tx.points, 0);

    return {
      userId,
      balance,
      history: history.map((tx) => ({
        id: tx.id,
        action: tx.action,
        points: tx.points,
        createdAt: tx.createdAt,
      })),
    };
  }

  private async getBalance(userId: string): Promise<number> {
    const result = await this.ledgerRepo
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.points), 0)', 'sum')
      .where('tx.user_id = :userId', { userId })
      .getRawOne<{ sum: string }>();
    return parseInt(result?.sum ?? '0', 10);
  }

  private async assertNoCheckInToday(userId: string, restaurantId: string) {
    const existing = await this.ledgerRepo
      .createQueryBuilder('tx')
      .where('tx.user_id = :userId', { userId })
      .andWhere('tx.restaurant_id = :restaurantId', { restaurantId })
      .andWhere("tx.action = 'check-in'")
      .andWhere('tx.created_at >= date_trunc(\'day\', now())')
      .getOne();

    if (existing) {
      throw new BadRequestException('Check-in points can only be earned once per day per restaurant');
    }
  }

  private generateVoucherCode(): string {
    const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    return `BUKA-DISC-${suffix}`;
  }
}
