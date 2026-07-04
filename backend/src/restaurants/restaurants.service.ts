import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Restaurant } from './entities/restaurant.entity';
import { Review } from './entities/review.entity';
import { SearchRestaurantsDto } from './dto/search-restaurants.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { haversineDistanceKm } from '../common/utils/distance';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantsRepo: Repository<Restaurant>,
    @InjectRepository(Review)
    private readonly reviewsRepo: Repository<Review>,
  ) {}

  async search(query: SearchRestaurantsDto) {
    const qb = this.restaurantsRepo.createQueryBuilder('r');

    if (query.cuisine) {
      qb.andWhere('r.cuisine ILIKE :cuisine', { cuisine: `%${query.cuisine}%` });
    }
    if (query.priceRange) {
      qb.andWhere('r.price_range = :priceRange', { priceRange: query.priceRange });
    }
    if (query.minRating !== undefined) {
      qb.andWhere('r.avg_rating >= :minRating', { minRating: query.minRating });
    }

    const restaurants = await qb.getMany();

    const hasCoords = query.latitude !== undefined && query.longitude !== undefined;
    const radius = query.radius ?? 5;

    let results = restaurants.map((r) => {
      const distance = hasCoords
        ? haversineDistanceKm(query.latitude as number, query.longitude as number, r.latitude, r.longitude)
        : undefined;
      return this.toRestaurantResponse(r, distance);
    });

    if (hasCoords) {
      results = results
        .filter((r) => (r.distance as number) <= radius)
        .sort((a, b) => (a.distance as number) - (b.distance as number));
    }

    return results;
  }

  async findOne(id: string) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { id } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${id}" not found`);
    }

    const reviews = await this.reviewsRepo.find({
      where: { restaurantId: id },
      relations: { user: true },
      order: { createdAt: 'DESC' },
    });

    return {
      ...this.toRestaurantResponse(restaurant),
      reviews: reviews.map((rev) => ({
        id: rev.id,
        userId: rev.userId,
        userName: rev.user?.name ?? 'Unknown',
        rating: rev.rating,
        comment: rev.comment,
        tags: rev.tags,
        createdAt: rev.createdAt,
      })),
    };
  }

  async addReview(restaurantId: string, dto: CreateReviewDto) {
    const restaurant = await this.restaurantsRepo.findOne({ where: { id: restaurantId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id "${restaurantId}" not found`);
    }

    const existing = await this.reviewsRepo.findOne({
      where: { restaurantId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User has already reviewed this restaurant');
    }

    const review = this.reviewsRepo.create({
      id: `rev_${randomUUID().slice(0, 8)}`,
      restaurantId,
      userId: dto.userId,
      rating: dto.rating,
      comment: dto.comment,
      tags: dto.tags ?? [],
    });

    const saved = await this.reviewsRepo.save(review);

    await this.recalculateAverageRating(restaurantId);

    return saved;
  }

  private async recalculateAverageRating(restaurantId: string) {
    const result = await this.reviewsRepo
      .createQueryBuilder('rev')
      .select('AVG(rev.rating)', 'avg')
      .where('rev.restaurant_id = :restaurantId', { restaurantId })
      .getRawOne<{ avg: string | null }>();

    const avg = result?.avg;

    await this.restaurantsRepo.update(restaurantId, {
      avgRating: avg ? parseFloat(parseFloat(avg).toFixed(2)) : 0,
    });
  }

  private toRestaurantResponse(r: Restaurant, distance?: number) {
    return {
      id: r.id,
      name: r.name,
      cuisine: r.cuisine,
      priceRange: r.priceRange,
      location: { lat: r.latitude, lng: r.longitude },
      address: r.address,
      tags: r.tags,
      avgRating: Number(r.avgRating),
      isOpen: r.isOpen === 1,
      images: r.images,
      ...(distance !== undefined ? { distance: Math.round(distance * 100) / 100 } : {}),
    };
  }
}
