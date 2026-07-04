import { IsInt, IsString, IsNotEmpty, Min, Max, IsArray, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
