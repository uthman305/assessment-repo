import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Review } from './review.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  cuisine: string;

  @Column({ name: 'price_range', type: 'int' })
  priceRange: number;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  avgRating: number;

  // Stored as 0/1 in the DB per the provided schema; exposed as boolean at the API boundary.
  @Column({ name: 'is_open', type: 'int', default: 1 })
  isOpen: number;

  @Column({ type: 'text', array: true, default: '{}' })
  images: string[];

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => Review, (review) => review.restaurant)
  reviews: Review[];
}
