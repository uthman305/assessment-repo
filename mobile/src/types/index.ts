export interface Location {
  lat: number;
  lng: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  priceRange: number;
  location: Location;
  address: string;
  tags: string[];
  avgRating: number;
  isOpen: boolean;
  images: string[];
}

export interface EarnPointsResponse {
  pointsAdded: number;
  newBalance: number;
}
