# LocalBuka Case Study Scoring Sheet / Evaluation Rubric

Total points: **100 Points**.

---

## 1. Backend: NestJS / Node.js (40 Points)
- **Database & Setup (10 Points)**:
  - Database schema loaded correctly and contains all foreign key relations (`users`, `restaurants`, `reviews`, `points_ledger`). [5 pts]
  - Optimized indices added on coordinates (`latitude`, `longitude`), `cuisine`, and lookup patterns. [5 pts]
- **Restaurant Search & Sorting (10 Points)**:
  - Supports query filters (cuisine, price, minimum rating). [5 pts]
  - Correctly calculates distance and sorts by proximity when user lat/lng parameters are provided. [5 pts]
- **Reviews Submission (10 Points)**:
  - Correct validation of input rating (1-5 range) and tags. [5 pts]
  - Restricts users to a single review per restaurant (returns correct error code e.g. `400` or `409`). [5 pts]
- **Points & Rewards Logic (10 Points)**:
  - Prevents double check-ins per day per restaurant. [4 pts]
  - Validates referrals (referred user exists and has orders). [3 pts]
  - Correct points balance validation for redemptions (multiples of 50 points). [3 pts]

---

## 2. Frontend: React Web Application (30 Points)
- **Layout & Visual Design (10 Points)**:
  - Responsive search filters (Cuisine, Price, Rating) and clean list presentation. [5 pts]
  - Looks modern, uses standard modern fonts, and uses appropriate semantic HTML. [5 pts]
- **Restaurant Card Components (10 Points)**:
  - Renders title, cuisine type, rating, tags, and fallback image on load failure. [5 pts]
  - Demonstrates skeleton loading animations while loading data. [5 pts]
- **State Management & UI States (10 Points)**:
  - Dynamic favorite toggle utilizing optimistic state updates (visual update runs before API request completes). [5 pts]
  - Handles error recovery and rolls back state when the API favorite request fails. [5 pts]

---

## 3. Mobile: React Native Screen (15 Points)
- **Check-In Flow & GPS Calculations (10 Points)**:
  - Requests foreground location permissions and handles rejection gracefully. [5 pts]
  - Calculates geographic distance correctly (within 100m) and blocks check-ins from greater distances. [5 pts]
- **Integration with Backend (5 Points)**:
  - Hits the backend `/points/earn` check-in endpoint and updates point balance dynamically on success. [5 pts]

---

## 4. Code Quality & Architecture (15 Points)
- **TypeScript Strictness (5 Points)**:
  - Code uses appropriate models, strict typing, and avoids usage of raw `any` types. [5 pts]
- **Git History & Hygiene (5 Points)**:
  - Project contains clean and descriptive commits demonstrating development progression. [5 pts]
- **Solution Writeup (5 Points)**:
  - Complete and thorough answers in `SOLUTION.md` detailing architectural trade-offs, setup steps, and limitations. [5 pts]

---

## Grading Scale
- **90+ Points**: Exceptional, production-ready quality. Candidate shows solid engineering seniority.
- **75-89 Points**: Strong developer. Good grasp of full stack development; ready for team onboarding.
- **60-74 Points**: Meets requirements. Needs minor mentoring on architectural practices but capable of shipping basic features.
- **<60 Points**: Does not meet current requirements.
