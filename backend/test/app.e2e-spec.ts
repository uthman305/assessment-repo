import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('LocalBuka API (e2e)', () => {
  let app: INestApplication<App>;
  let server: App;

  const seedRestaurantId = 'buka_003'; // Bukateria Supreme, per mock_data.json

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /restaurants', () => {
    it('returns the seeded list of restaurants', async () => {
      const res = await request(server).get('/restaurants').expect(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('filters by cuisine (case-insensitive, partial match)', async () => {
      const res = await request(server).get('/restaurants?cuisine=nigerian').expect(200);
      expect(res.body.data.every((r: any) => r.cuisine.toLowerCase().includes('nigerian'))).toBe(true);
    });

    it('sorts results by distance when coordinates are provided', async () => {
      const res = await request(server)
        .get('/restaurants?latitude=6.52&longitude=3.37&radius=50')
        .expect(200);
      const distances = res.body.data.map((r: any) => r.distance);
      const sorted = [...distances].sort((a, b) => a - b);
      expect(distances).toEqual(sorted);
    });
  });

  describe('GET /restaurants/:id', () => {
    it('returns 404 for a non-existent restaurant', async () => {
      await request(server).get('/restaurants/does_not_exist').expect(404);
    });

    it('returns restaurant detail with a reviews array', async () => {
      const res = await request(server).get(`/restaurants/${seedRestaurantId}`).expect(200);
      expect(res.body.data.id).toBe(seedRestaurantId);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
    });
  });

  describe('POST /restaurants/:id/reviews', () => {
    it('rejects an out-of-range rating with 400', async () => {
      await request(server)
        .post(`/restaurants/${seedRestaurantId}/reviews`)
        .send({ userId: 'user_101', rating: 9, comment: 'too high' })
        .expect(400);
    });

    it('rejects a duplicate review from the same user with 409', async () => {
      // user_101 already reviewed buka_001 in the seed data.
      await request(server)
        .post('/restaurants/buka_001/reviews')
        .send({ userId: 'user_101', rating: 4, comment: 'trying again' })
        .expect(409);
    });
  });

  describe('POST /points/earn', () => {
    it('rejects check-in for a non-existent user with 404', async () => {
      await request(server)
        .post('/points/earn')
        .send({ userId: 'ghost_user', action: 'check-in', restaurantId: seedRestaurantId })
        .expect(404);
    });

    it('rejects a referral where the referred user has not completed an order', async () => {
      // user_102 exists but has_completed_order defaults to false in seed data.
      await request(server)
        .post('/points/earn')
        .send({ userId: 'user_103', action: 'referral', referredUserId: 'user_102' })
        .expect(400);
    });

    it('awards a referral bonus when the referred user has completed an order', async () => {
      // user_101 is seeded with has_completed_order = true.
      const res = await request(server)
        .post('/points/earn')
        .send({ userId: 'user_103', action: 'referral', referredUserId: 'user_101' })
        .expect(201);
      expect(res.body.data.pointsAdded).toBe(100);
    });
  });

  describe('POST /points/redeem', () => {
    it('rejects a non-multiple-of-50 redemption with 400', async () => {
      await request(server).post('/points/redeem').send({ userId: 'user_103', points: 30 }).expect(400);
    });

    it('rejects redemption above the current balance with 400', async () => {
      await request(server)
        .post('/points/redeem')
        .send({ userId: 'user_103', points: 999999 })
        .expect(400);
    });
  });

  describe('GET /points/balance/:userId', () => {
    it('returns 404 for an unknown user', async () => {
      await request(server).get('/points/balance/ghost_user').expect(404);
    });

    it('returns a balance and history array for a real user', async () => {
      const res = await request(server).get('/points/balance/user_101').expect(200);
      expect(typeof res.body.data.balance).toBe('number');
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });
});
