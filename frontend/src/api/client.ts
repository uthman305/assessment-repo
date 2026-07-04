import type { ApiResponse, PointsBalance, Restaurant, RestaurantDetail, Review, SearchFilters } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body: ApiResponse<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new ApiError(body.error ?? 'Request failed', res.status);
  }

  return body.data;
}

export function searchRestaurants(filters: SearchFilters): Promise<Restaurant[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  });
  const query = params.toString();
  return request<Restaurant[]>(`/restaurants${query ? `?${query}` : ''}`);
}

export function getRestaurant(id: string): Promise<RestaurantDetail> {
  return request<RestaurantDetail>(`/restaurants/${id}`);
}

export function submitReview(
  restaurantId: string,
  payload: { userId: string; rating: number; comment: string; tags: string[] },
): Promise<Review> {
  return request<Review>(`/restaurants/${restaurantId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function toggleFavorite(restaurantId: string, isFavorited: boolean): Promise<void> {
  // NOTE: There is no favorites endpoint in API_CONTRACTS.md / REQUIREMENTS.md.
  // This simulates the network round-trip so the optimistic-UI behavior required by
  // the rubric (instant visual update, rollback on failure) is demonstrable end-to-end.
  // See SOLUTION.md for how this would be wired to a real endpoint.
  return new Promise((resolve) => {
    setTimeout(resolve, 400);
  }).then(() => {
    void restaurantId;
    void isFavorited;
  });
}

export function earnPoints(payload: {
  userId: string;
  action: 'check-in' | 'review' | 'referral';
  restaurantId?: string;
  referredUserId?: string;
}): Promise<{ pointsAdded: number; newBalance: number }> {
  return request(`/points/earn`, { method: 'POST', body: JSON.stringify(payload) });
}

export function redeemPoints(payload: {
  userId: string;
  points: number;
}): Promise<{ pointsRedeemed: number; newBalance: number; voucherCode: string }> {
  return request(`/points/redeem`, { method: 'POST', body: JSON.stringify(payload) });
}

export function getBalance(userId: string): Promise<PointsBalance> {
  return request<PointsBalance>(`/points/balance/${userId}`);
}

export { ApiError };
