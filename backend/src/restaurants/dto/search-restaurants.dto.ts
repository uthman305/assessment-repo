import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class SearchRestaurantsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  radius?: number = 5;

  @IsOptional()
  @IsString()
  cuisine?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4)
  priceRange?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;
}
