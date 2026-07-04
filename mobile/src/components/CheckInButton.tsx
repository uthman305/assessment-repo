import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import { haversineDistanceMeters } from '../utils/distance';
import { checkIn } from '../api/client';

const CHECK_IN_RADIUS_METERS = 100;

interface CheckInButtonProps {
  restaurantId: string;
  restaurantName: string;
  restaurantLat: number;
  restaurantLng: number;
  userId: string;
  onSuccess: (newBalance: number) => void;
}

type CheckInState = 'idle' | 'loading' | 'success';

export const CheckInButton: React.FC<CheckInButtonProps> = ({
  restaurantId,
  restaurantName,
  restaurantLat,
  restaurantLng,
  userId,
  onSuccess,
}) => {
  const [state, setState] = useState<CheckInState>('idle');
  const [lastError, setLastError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setState('loading');
    setLastError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState('idle');
        Alert.alert(
          'Permission needed',
          'Location permission is required to check in. Please enable it in your device settings.',
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      const distance = haversineDistanceMeters(latitude, longitude, restaurantLat, restaurantLng);

      if (distance > CHECK_IN_RADIUS_METERS) {
        setState('idle');
        Alert.alert('Too far away', 'You must be at the restaurant to check in.');
        return;
      }

      const result = await checkIn(userId, restaurantId);
      setState('success');
      onSuccess(result.newBalance);
      Alert.alert('Checked in! 🎉', `You earned ${result.pointsAdded} points at ${restaurantName}.`);
    } catch (err) {
      setState('idle');
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setLastError(message);
      Alert.alert('Check-in failed', message);
    }
  };

  return (
    <View style={styles.container}>
      {state === 'loading' ? (
        <ActivityIndicator size="large" color="#4a7c59" />
      ) : (
        <TouchableOpacity
          style={[styles.button, state === 'success' && styles.buttonSuccess]}
          onPress={handleCheckIn}
          disabled={state === 'success'}
        >
          <Text style={styles.buttonText}>
            {state === 'success' ? '✓ Checked in today' : '📍 Check-In to Earn Points'}
          </Text>
        </TouchableOpacity>
      )}
      {lastError && <Text style={styles.errorText}>{lastError}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#e8672c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSuccess: {
    backgroundColor: '#4a7c59',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  errorText: {
    color: '#d9534f',
    marginTop: 8,
    fontSize: 13,
    textAlign: 'center',
  },
});
