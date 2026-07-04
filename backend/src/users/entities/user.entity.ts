import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'referred_by', type: 'varchar', length: 50, nullable: true })
  referredBy: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'referred_by' })
  referrer: User | null;

  @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Not part of the provided DDL, but needed to satisfy the "referral requires the
  // referred user to have completed their first order" rule from REQUIREMENTS.md.
  // We simulate order completion with a simple flag rather than a full orders table,
  // which is out of scope for this assessment. See SOLUTION.md for the trade-off note.
  @Column({ name: 'has_completed_order', type: 'boolean', default: false })
  hasCompletedOrder: boolean;
}
