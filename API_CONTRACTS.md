# LocalBuka Intern Assessment API Contracts

This API specification outlines the exact routes, request formats, and response shapes candidates are expected to build.

---

## 1. Restaurant Discovery & Search

### GET `/restaurants`
Searches and filters restaurants dynamically.

#### Query Parameters
- `latitude` (optional, float): User latitude (e.g. `6.5244`)
- `longitude` (optional, float): User longitude (e.g. `3.3792`)
- `radius` (optional, float in km): Search radius, default: `5`
- `cuisine` (optional, string): Case-insensitive match (e.g. `Nigerian`)
- `priceRange` (optional, number): `1`, `2`, `3`, or `4`
- `minRating` (optional, float): Min rating filter (e.g., `4.0`)

#### Response: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "buka_001",
      "name": "Mama Cass Kitchen",
      "cuisine": "Nigerian",
      "priceRange": 2,
      "location": {
        "lat": 6.5244,
        "lng": 3.3792
      },
      "address": "Herbert Macaulay Way, Yaba, Lagos",
      "tags": ["jollof", "swallow", "spicy"],
      "avgRating": 4.5,
      "isOpen": true,
      "images": ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c"],
      "distance": 0.25 // Calculated field if lat/lng are provided (in km)
    }
  ]
}
```

### GET `/restaurants/:id`
Retrieves a single restaurant profile, including its reviews.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "buka_001",
    "name": "Mama Cass Kitchen",
    "cuisine": "Nigerian",
    "priceRange": 2,
    "location": {
      "lat": 6.5244,
      "lng": 3.3792
    },
    "address": "Herbert Macaulay Way, Yaba, Lagos",
    "tags": ["jollof", "swallow", "spicy"],
    "avgRating": 4.5,
    "isOpen": true,
    "images": ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c"],
    "reviews": [
      {
        "id": "rev_201",
        "userId": "user_101",
        "userName": "Chijioke Adebayo",
        "rating": 5,
        "comment": "The best jollof rice in Yaba, hands down!",
        "tags": ["jollof", "spicy"],
        "createdAt": "2026-06-28T12:00:00Z"
      }
    ]
  }
}
```

---

## 2. Reviews

### POST `/restaurants/:id/reviews`
Submits a review for a restaurant.

#### Request Body
```json
{
  "userId": "user_101",
  "rating": 5,
  "comment": "Superb local dishes and clean space.",
  "tags": ["spicy", "swallow", "neat"]
}
```

#### Validation Rules
- `userId` is required.
- `rating` must be an integer between 1 and 5.
- A user can only submit one review per restaurant. Repeated reviews must return a `400 Bad Request` or `409 Conflict` error.

#### Response: `201 Created`
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "data": {
    "id": "rev_203",
    "restaurantId": "buka_001",
    "userId": "user_101",
    "rating": 5,
    "comment": "Superb local dishes and clean space.",
    "tags": ["spicy", "swallow", "neat"],
    "createdAt": "2026-06-30T18:00:00Z"
  }
}
```

---

## 3. Points & Rewards System

### POST `/points/earn`
Earns points for specific user actions.

#### Request Body
```json
{
  "userId": "user_101",
  "action": "check-in", 
  "restaurantId": "buka_001", // Required only for 'check-in' and 'review'
  "referredUserId": "user_102" // Required only for 'referral'
}
```

#### Validation Rules
- **`check-in`**:
  - Awards 50 points.
  - Can only be claimed once per user per restaurant per calendar day. Attempting a duplicate must return `400 Bad Request`.
- **`review`**:
  - Awards 20 points.
- **`referral`**:
  - Awards 100 points.
  - Can only be awarded if the referred user exists and has placed at least one completed order (simulated or flagged in DB).

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "pointsAdded": 50,
    "newBalance": 350
  }
}
```

### POST `/points/redeem`
Redeems points in exchange for discount vouchers.

#### Request Body
```json
{
  "userId": "user_101",
  "points": 100
}
```

#### Validation & Business Rules
- Points must be redeemed in multiples of `50`.
- User balance must be equal to or greater than the requested `points`.

#### Response: `201 Created`
```json
{
  "success": true,
  "data": {
    "pointsRedeemed": 100,
    "newBalance": 250,
    "voucherCode": "BUKA-DISC-X9B2"
  }
}
```

### GET `/points/balance/:userId`
Fetch points balance and transaction history.

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "user_101",
    "balance": 250,
    "history": [
      {
        "id": "tx_303",
        "action": "redeem",
        "points": -100,
        "createdAt": "2026-06-30T18:15:00Z"
      },
      {
        "id": "tx_301",
        "action": "review",
        "points": 20,
        "createdAt": "2026-06-28T12:00:00Z"
      }
    ]
  }
}
```
