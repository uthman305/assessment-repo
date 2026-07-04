import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export type EarnAction = 'check-in' | 'review' | 'referral';

export class EarnPointsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsIn(['check-in', 'review', 'referral'])
  action: EarnAction;

  @IsOptional()
  @IsString()
  restaurantId?: string;

  @IsOptional()
  @IsString()
  referredUserId?: string;
}
