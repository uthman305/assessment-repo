# LocalBuka Intern Case Study Boilerplate Code

This document provides candidates with starter structures, configurations, and functional snippets.

---

## 1. Backend (NestJS Module Structure)

Initialize your NestJS application using `npx -y @nestjs/cli new backend --strict --package-manager npm`.

Recommended module structure for backend:
```text
backend/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts
│   └── utils/
│       └── distance.ts
├── restaurants/
│   ├── dto/
│   │   ├── create-review.dto.ts
│   │   └── search-restaurants.dto.ts
│   ├── restaurants.controller.ts
│   ├── restaurants.module.ts
│   └── restaurants.service.ts
└── points/
    ├── dto/
    │   ├── earn-points.dto.ts
    │   └── redeem-points.dto.ts
    ├── points.controller.ts
    ├── points.module.ts
    └── points.service.ts
```

### Global HTTP Exception Filter
Create `backend/src/common/filters/http-exception.filter.ts` to standardize your API error responses:

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    response.status(status).json({
      success: false,
      error: typeof message === 'object' && message !== null ? (message as any).message || message : message,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 2. Frontend (React Card Component & Types)

In your React frontend directory (`frontend/`), define your TypeScript contracts first.

### Data Types (`frontend/src/types/index.ts`)
```typescript
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
  distance?: number; // Calculated on coordinates search
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
```

### Reusable Card Component (`frontend/src/components/RestaurantCard.tsx`)
```tsx
import React, { useState } from 'react';
import { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleFavorite?: (id: string, isFavorited: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onToggleFavorite,
  isLoading = false
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = async () => {
    const newState = !isFavorite;
    // Optimistic UI update
    setIsFavorite(newState);
    
    if (onToggleFavorite) {
      try {
        await onToggleFavorite(restaurant.id, newState);
      } catch (err) {
        // Rollback state on failure
        setIsFavorite(!newState);
        console.error('Failed to update favorite status', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="skeleton-card" style={{ padding: '16px', border: '1px solid #eee', borderRadius: '8px' }} aria-hidden="true">
        <div style={{ height: '150px', background: '#ccc', borderRadius: '4px', marginBottom: '8px' }} />
        <div style={{ height: '20px', background: '#ccc', width: '60%', marginBottom: '8px' }} />
        <div style={{ height: '15px', background: '#ccc', width: '40%' }} />
      </div>
    );
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

  return (
    <article 
      className="restaurant-card" 
      style={{ border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', padding: '16px' }}
    >
      <img 
        src={restaurant.images[0] || fallbackImage} 
        alt={restaurant.name}
        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = fallbackImage;
        }}
      />
      <h3>{restaurant.name}</h3>
      <p>{restaurant.cuisine} • Rating: {restaurant.avgRating} ★</p>
      <div>
        {restaurant.tags.map((tag) => (
          <span key={tag} className="tag-pill" style={{ marginRight: '6px', fontSize: '0.8rem', background: '#f0f0f0', padding: '4px 8px', borderRadius: '12px' }}>
            #{tag}
          </span>
        ))}
      </div>
      <button 
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? `Remove ${restaurant.name} from favorites` : `Add ${restaurant.name} to favorites`}
        style={{ marginTop: '12px', background: isFavorite ? '#ff4757' : '#2ed573', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
      >
        {isFavorite ? 'Saved ❤️' : 'Save 🤍'}
      </button>
    </article>
  );
};
```

---

## 3. Mobile (React Native / Expo GPS Check-In Code)

In your React Native App (`mobile/`), you can request permissions and check user proximity to the restaurant.

```tsx
import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';

// Helper: Haversine distance in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

interface CheckInButtonProps {
  restaurantId: string;
  restaurantLat: number;
  restaurantLng: number;
  userId: string;
  onSuccess: (newBalance: number) => void;
}

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  restaurantId,
  restaurantLat,
  restaurantLng,
  userId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      // 1. Request foreground location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in settings to check in.');
        setLoading(false);
        return;
      }

      // 2. Fetch current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 3. Compute distance to restaurant
      const distance = calculateDistance(latitude, longitude, restaurantLat, restaurantLng);

      if (distance > 100) {
        Alert.alert(
          'Too Far Away',
          `You are ${Math.round(distance)}m away. You must be within 100m of the restaurant to check in.`
        );
        setLoading(false);
        return;
      }

      // 4. Invoke the earn points endpoint
      const response = await fetch('http://YOUR_API_HOST/points/earn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'check-in',
          restaurantId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success!', `Checked in! You've earned 50 points. New balance: ${result.data.newBalance}`);
        onSuccess(result.data.newBalance);
      } else {
        Alert.alert('Failed to Check-in', result.error || 'Please try again later.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred during check-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ marginVertical: 16 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#2ed573" />
      ) : (
        <Button title="Check-In at Restaurant 📍" onPress={handleCheckIn} color="#2ed573" />
      )}
    </View>
  );
};
```
