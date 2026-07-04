# LocalBuka Backend

NestJS REST API for restaurant discovery, reviews, and the points/rewards system.

## Stack
- NestJS 11 + TypeScript (strict mode)
- PostgreSQL via TypeORM (schema-first — see `db/schema.sql`)
- class-validator / class-transformer for request validation
- @nestjs/throttler for rate limiting

## Setup
```bash
createdb localbuka
psql -d localbuka -f db/schema.sql

cp .env.example .env
npm install
npm run start:dev
```
Server runs at `http://localhost:3000`.

## Testing
```bash
npm run test:e2e
```
14 integration tests cover search/filtering, review submission (incl. duplicate/invalid
rejection), and points earn/redeem business rules (check-in limits, referral eligibility,
redemption multiples).

## Notable design decisions
See `../SOLUTION.md` for the full write-up, including a bug found and fixed in the provided
`DATABASE_SCHEMA.sql`.

## Endpoints
See `../API_CONTRACTS.md` for the full contract. Summary:
- `GET /restaurants` — search/filter/sort (cuisine, price, rating, distance)
- `GET /restaurants/:id` — detail + reviews
- `POST /restaurants/:id/reviews` — submit a review (rate-limited, one per user per restaurant)
- `POST /points/earn` — award points for check-in / review / referral
- `POST /points/redeem` — redeem points (multiples of 50) for a voucher code
- `GET /points/balance/:userId` — balance + transaction history
