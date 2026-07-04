import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class RedeemPointsDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @IsPositive()
  points: number;
}
