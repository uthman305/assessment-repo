import type { EarnPointsResponse, Restaurant } from '../types';

// For a physical device or emulator, replace with your machine's LAN IP,
// e.g. http://192.168.1.10:3000. localhost on an Android emulator maps to
// the emulator itself, not your dev machine — use 10.0.2.2 for the Android
// emulator, or your LAN IP for a physical device / iOS simulator.
export const API_BASE_URL = 'http://localhost:3000';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body: ApiResponse<T> = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error ?? 'Request failed');
  }
  return body.data;
}

export function getRestaurant(id: string): Promise<Restaurant> {
  return request<Restaurant>(`/restaurants/${id}`);
}

export function checkIn(userId: string, restaurantId: string): Promise<EarnPointsResponse> {
  return request<EarnPointsResponse>('/points/earn', {
    method: 'POST',
    body: JSON.stringify({ userId, action: 'check-in', restaurantId }),
  });
}
