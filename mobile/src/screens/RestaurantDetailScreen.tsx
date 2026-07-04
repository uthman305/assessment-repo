import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { getRestaurant } from '../api/client';
import { CheckInButton } from '../components/CheckInButton';
import type { Restaurant } from '../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800';

// Hardcoded for this assessment screen — in the full app this would come from
// navigation params (e.g. React Navigation route.params) and an auth context.
const DEMO_RESTAURANT_ID = 'buka_001';
const DEMO_USER_ID = 'user_103';

export function RestaurantDetailScreen() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getRestaurant(DEMO_RESTAURANT_ID)
      .then(setRestaurant)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load restaurant'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#e8672c" />
      </SafeAreaView>
    );
  }

  if (loadError || !restaurant) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{loadError ?? 'Restaurant not found.'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: restaurant.images[0] || FALLBACK_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.body}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.meta}>
            {restaurant.cuisine} · {'₦'.repeat(restaurant.priceRange)} · ★ {restaurant.avgRating.toFixed(1)}
          </Text>
          <Text style={styles.address}>{restaurant.address}</Text>

          <View style={styles.tagsRow}>
            {restaurant.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          {balance !== null && (
            <View style={styles.balanceBanner}>
              <Text style={styles.balanceText}>Your points balance: {balance}</Text>
            </View>
          )}

          <CheckInButton
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            restaurantLat={restaurant.location.lat}
            restaurantLng={restaurant.location.lng}
            userId={DEMO_USER_ID}
            onSuccess={setBalance}
          />

          <Text style={styles.hint}>
            You must be within 100 meters of {restaurant.name} for check-in to succeed.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#17140f',
  },
  centered: {
    flex: 1,
    backgroundColor: '#17140f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 220,
  },
  body: {
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f2ece0',
  },
  meta: {
    color: '#e0b13c',
    marginTop: 6,
    fontSize: 14,
  },
  address: {
    color: '#b8ae9c',
    marginTop: 4,
    fontSize: 13,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  tagPill: {
    backgroundColor: '#2b261d',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagText: {
    color: '#b8ae9c',
    fontSize: 12,
  },
  balanceBanner: {
    backgroundColor: '#2b261d',
    borderRadius: 10,
    padding: 12,
    marginTop: 20,
  },
  balanceText: {
    color: '#4a7c59',
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    color: '#b8ae9c',
    fontSize: 12,
    marginTop: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#d9534f',
    padding: 20,
    textAlign: 'center',
  },
});
