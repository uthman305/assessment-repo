import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { User } from '../../users/entities/user.entity';

@Entity('reviews')
@Unique('uq_user_restaurant_review', ['userId', 'restaurantId'])
export class Review {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ name: 'restaurant_id', type: 'varchar', length: 50 })
  restaurantId: string;

  @Column({ name: 'user_id', type: 'varchar', length: 50 })
  userId: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
