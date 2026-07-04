# LocalBuka Mobile

React Native (Expo) app: a single restaurant detail screen with a GPS-gated check-in flow.

## Setup
```bash
npm install
npx expo start
```
Open in Expo Go or a simulator/emulator.

**Backend URL:** `src/api/client.ts` points to `http://localhost:3000`, which only resolves
correctly from an iOS simulator. For a physical device, swap it for your machine's LAN IP;
for the Android emulator, use `10.0.2.2`.

## How check-in works
1. Requests foreground location permission (see `app.json` for the permission strings).
2. Gets the device's current position.
3. Computes distance to the restaurant with the same Haversine formula used on the backend
   (`src/utils/distance.ts`).
4. If within 100m, calls `POST /points/earn` with `action: "check-in"`; otherwise shows an
   alert without hitting the network.

## Structure
```
src/
  api/client.ts               — typed fetch wrapper
  utils/distance.ts           — Haversine distance in meters
  components/CheckInButton.tsx — permission + geolocation + check-in flow
  screens/RestaurantDetailScreen.tsx
```
