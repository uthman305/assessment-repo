import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

export type PointsAction = 'check-in' | 'review' | 'referral' | 'redeem';

@Entity('points_ledger')
export class PointsLedger {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  action: PointsAction;

  @Column({ name: 'restaurant_id', type: 'varchar', length: 50, nullable: true })
  restaurantId: string | null;

  @Column({ type: 'int' })
  points: number;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant | null;
}
