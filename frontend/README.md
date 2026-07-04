# LocalBuka Frontend

React + TypeScript (Vite) web app: a restaurant discovery dashboard and a rewards dashboard.

## Setup
```bash
cp .env.example .env
npm install
npm run dev
```
Runs at `http://localhost:5173`. Expects the backend at `http://localhost:3000`
(configurable via `VITE_API_BASE_URL` in `.env`).

There's no auth in this assessment — use the user switcher in the header to try flows as
each of the three seeded demo users.

## Features
- **Discover:** search + filter (cuisine, price, min rating), "use my location" distance
  sort, skeleton loading cards, restaurant detail panel with review submission.
- **Favorites:** optimistic UI toggle with rollback on failure (see `SOLUTION.md` for the
  note on why this is simulated — there's no favorites endpoint in the provided contract).
- **Rewards:** points balance, redeem-for-voucher flow, transaction history.

## Structure
```
src/
  api/client.ts       — typed fetch wrapper for the backend
  types/index.ts       — shared TS types matching API_CONTRACTS.md
  components/          — RestaurantCard (+ skeleton), SearchFiltersBar
  pages/                — DiscoverPage, RewardsPage
```
