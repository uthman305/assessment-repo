# LocalBuka Case Study Requirements

This document outlines the detailed functional requirements that the intern must complete for their submission.

---

## 1. Stack & Tech Requirements
- **Backend**: NestJS (preferred) or pure Node.js (Express) with TypeScript.
- **Frontend Web**: React with TypeScript. Styling can be vanilla CSS or TailwindCSS.
- **Mobile**: React Native (with Expo or React Native CLI).
- **Database**: PostgreSQL (using TypeORM or Prisma is highly recommended, or raw SQL queries).
- **TypeScript**: The application must utilize strict type checking.

---

## 2. Backend Features (NestJS / Node.js)
You are required to build a RESTful API containing the following modules:

### A. Restaurant Discovery & Search
- **GET `/restaurants`**:
  - Should support query parameters for filtering: `latitude`, `longitude`, `radius` (in km), `cuisine`, `priceRange` (1-4 dollar/naira signs), `minRating`.
  - Sort results dynamically based on geographic distance if coordinates are provided.
- **GET `/restaurants/:id`**:
  - Fetch detailed restaurant info, reviews, average rating, and active promotions.

### B. User Reviews & Rating
- **POST `/restaurants/:id/reviews`**:
  - Accept review body, rating (1 to 5), and custom tags (e.g. `["spicy", "neat", "cheap"]`).
  - Users can only submit one review per restaurant (enforced via database uniqueness or API checks).
  - Recalculate average rating of the restaurant asynchronously or on next request.

### C. Points & Rewards System
- **POST `/points/earn`**:
  - Awards points based on user action: `check-in` (50 points), `review` (20 points), `referral` (100 points).
  - Constraints:
    - Points for `check-in` can only be earned once per day per restaurant.
    - Points for `referral` require validation that the referred user exists and completed their first order.
- **POST `/points/redeem`**:
  - Allows users to redeem points in multiples of 50 (e.g., 50 points = ₦500 off).
  - Validation: Ensure the user has a sufficient balance before executing redemption.
- **GET `/points/balance/:userId`**:
  - Returns total points available and a ledger of points transactions (earned vs redeemed).

---

## 3. Frontend Web Features (React)

### A. Restaurant Search & Feed Page
- A clean, modern UI showcasing a search bar and filter controls (Cuisine, Distance, Rating, Price).
- Display a list of dynamic **Restaurant Cards** matching the criteria.
- **Restaurant Cards** must include:
  - Restaurant name, image fallback, rating, price level, and tag pills.
  - A favorite button with an optimistic UI state (state updates instantly before API confirmation).
  - Skeleton loading states.

### B. Rewards Dashboard
- A dashboard screen demonstrating current points balance, recent transaction ledger (rewards earned, vouchers redeemed).
- An interactive form or button to "Redeem Voucher".

---

## 4. Mobile Screen (React Native)

### A. Restaurant Detail & GPS Check-In
- Build a detail screen displaying the restaurant information.
- Provide a **"Check-In to Earn Points"** button.
- **Functional Flow**:
  1. User taps the check-in button.
  2. Request location permissions using Expo Location or React Native Geolocation.
  3. Compute distance to the restaurant coordinates (use Haversine formula).
  4. If the distance is less than 100 meters, trigger `/points/earn` with action `check-in` and display a success state.
  5. If the distance is greater than 100 meters, display an error message: "You must be at the restaurant to check in."

---

## 5. Security & System Design (Bonus/Interview Topics)
- **Rate Limiting**: Implement basic rate-limiting on the review endpoint.
- **Deep Linking**: Config for mobile app opening custom restaurant profile URLs.
- **Live Order gateway**: Discuss how you would design real-time updates for table reservations or orders.
