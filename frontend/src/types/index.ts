export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number; // 1 to 4
  location: Location;
  address: string;
  tags: string[];
  avgRating: number;
  isOpen: boolean;
  images: string[];
  distance?: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}

export interface RestaurantDetail extends Restaurant {
  reviews: Review[];
}

export interface PointsTransaction {
  id: string;
  action: 'check-in' | 'review' | 'referral' | 'redeem';
  points: number;
  createdAt: string;
}

export interface PointsBalance {
  userId: string;
  balance: number;
  history: PointsTransaction[];
}

export interface SearchFilters {
  cuisine?: string;
  priceRange?: number;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const DEMO_USERS = [
  { id: 'user_101', name: 'Chijioke Adebayo' },
  { id: 'user_102', name: 'Amaka Igwe' },
  { id: 'user_103', name: 'Tunde Bakare' },
];
