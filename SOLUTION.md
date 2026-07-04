# Solution Report

## 1. Local Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or update `.env` to point elsewhere)

### Database
```bash
createdb localbuka
psql -d localbuka -f backend/db/schema.sql
```
`backend/db/schema.sql` is the provided `DATABASE_SCHEMA.sql` with one bug fixed and one
additive column — see section 4 for details.

### Backend (NestJS)
```bash
cd backend
cp .env.example .env   # defaults already match a local Postgres install
npm install
npm run start:dev      # http://localhost:3000
```
Run tests: `npm run test:e2e` (14 integration tests covering search, reviews, and points logic).

### Frontend (React + Vite)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```
The frontend expects the backend at `http://localhost:3000` (configurable via `VITE_API_BASE_URL`).
There's no login system in this assessment, so the top-right dropdown lets you switch between
the three seeded demo users to exercise reviews, check-ins, and rewards as different people.

### Mobile (React Native / Expo)
```bash
cd mobile
npm install
npx expo start
```
Open in Expo Go or a simulator. **Important:** `localhost` in `src/api/client.ts` only resolves
correctly on iOS simulator. For a physical device, replace it with your machine's LAN IP; for
the Android emulator, use `10.0.2.2`.

---

## 2. Technical Stack & Architecture Decisions

**Database client — TypeORM, schema-first.** I loaded `DATABASE_SCHEMA.sql` directly rather than
letting an ORM auto-generate tables (`synchronize: false`), so the actual DDL you provided is
what's running, not a re-interpretation of it in TypeScript decorators. Entities are mapped
explicitly onto the existing column names (e.g. `@Column({ name: 'price_range' })`) so the
mapping is auditable against the schema file.

**API validation — class-validator/class-transformer.** DTOs (`SearchRestaurantsDto`,
`CreateReviewDto`, `EarnPointsDto`, `RedeemPointsDto`) declare constraints declaratively, and a
global `ValidationPipe` (`whitelist: true, transform: true`) rejects bad input before it reaches
any service logic — e.g. a rating of `9` never gets past the controller boundary.

**State management on web — local component state only (`useState`/`useEffect`), no
Redux/Zustand/Context.** The app is two shallow, mostly-independent screens (Discover, Rewards)
with no state shared across distant parts of the tree, so a global store would add indirection
without solving a real problem here. If the app grew to include a shopping cart or persisted
auth session, I'd reach for Context (simple) or Zustand (if update frequency got high).

**Errors — a single global `HttpExceptionFilter`** normalizes every error response to
`{ success: false, error, statusCode, timestamp }`, so the frontend's `request()` helper has one
code path for handling failures regardless of which endpoint failed.

**Rate limiting — `@nestjs/throttler`**, applied to `POST /restaurants/:id/reviews` specifically
(5 requests/minute), rather than globally, since review spam is the realistic abuse vector the
rubric calls out; a blanket limit would also throttle legitimate rapid searching.

---

## 3. Handling Business Constraints & Corner Cases

**Duplicate check-ins (once per restaurant per day).** Rather than a DB-level constraint (which
can't easily express "per calendar day"), I check application-side with a range query —
`created_at >= date_trunc('day', now())` — against the `points_ledger`, scoped to
`(user_id, restaurant_id, action = 'check-in')`. This is backed by the
`idx_ledger_checkin_limit` composite index (see bug note below) so the check stays fast as the
ledger grows. This is a check-then-act pattern; under real concurrent load from the same user
double-tapping check-in at the same instant, a DB-level partial unique constraint or a
serializable transaction would be the more bulletproof fix — noted as a limitation below.

**Optimistic UI (favorite button).** There's no favorites endpoint in `API_CONTRACTS.md`, so I
simulated the network round-trip in `api/client.ts`'s `toggleFavorite()` (a resolved promise
after a delay) so the actual UI behavior — flip the heart instantly, roll back and show an error
message if the "request" fails — is fully implemented and easy to wire to a real endpoint later.
State lives in the `RestaurantCard` component: `setIsFavorite(next)` fires immediately, and the
catch block reverts it (`setIsFavorite(!next)`) plus surfaces an inline error.

**Distance sorting.** The backend computes Haversine distance in `common/utils/distance.ts` for
each restaurant against the query's `latitude`/`longitude`, filters out anything beyond `radius`
(default 5km), and sorts ascending. I did this in the application layer rather than in SQL
because the seed dataset is tiny (5 rows) and it keeps the formula readable and unit-testable;
at real scale I'd push this into a SQL expression (or PostGIS) so it's indexable.

---

## 4. Key Limitations & Future Enhancements

**Bug found and fixed in the provided schema.** `DATABASE_SCHEMA.sql`'s
`idx_ledger_checkin_limit` index used `(created_at::DATE)`, which Postgres rejects with
`functions in index expression must be marked IMMUTABLE` — a `timestamptz → date` cast isn't
immutable because its result depends on the session's timezone. I fixed this by indexing the raw
columns (`user_id, restaurant_id, action, created_at`) and doing the day-boundary comparison in
the query itself (`created_at >= date_trunc('day', now())`), which the index still serves
efficiently as a range scan.

**Referral eligibility gap.** The requirements state a referral bonus needs "the referred user to
have completed their first order," but the provided schema has no `orders` table (correctly out
of scope for this assessment). I added one additive boolean, `users.has_completed_order`
(defaulted `false`, seeded `true` only for `user_101`), to make that rule testable end-to-end
without building a full orders system. A real implementation would check an actual `orders` table
instead.

**No auth.** Every endpoint trusts a `userId` passed in the request body/query. The frontend
works around this with a demo user switcher instead of login. Real auth (JWT + guards) is the
first thing I'd add with more time.

**Check-in race condition.** As noted above, the "once per day" rule is enforced with a
check-then-insert, not a DB constraint — safe for normal usage, but two simultaneous requests
from the same user could theoretically both pass the check before either commits. I'd close this
with a Postgres partial unique index on `(user_id, restaurant_id, action, date_trunc('day', created_at))`
using an `IMMUTABLE` wrapper function, or a transaction with `SELECT ... FOR UPDATE`.

**Not built due to time:** pagination on `GET /restaurants` and `GET /points/balance/:userId`'s
history, WebSocket/live order tracking (mentioned as a future direction in `REQUIREMENTS.md`),
and a "favorites" backend endpoint (see above). The mobile app is a single check-in screen as
scoped, wired to one hardcoded demo restaurant/user rather than navigation, since no navigation
library was in scope.

**Structure note.** I put the mobile app in a top-level `mobile/` folder rather than nested inside
`frontend/` as the README's suggested layout shows, since Expo and Vite have incompatible
tooling/config expectations and keeping them as sibling packages avoided fighting both build
systems in one folder.
