# NewsLens Mobile

React Native (Expo) mobile app for [NewsLens](../README.md) — AI-powered unbiased news aggregator.

## Setup

```bash
cd mobile
npm install
```

Copy the environment file and set your API URL:
```bash
cp .env.example .env.local
# Edit .env.local and set EXPO_PUBLIC_API_URL to your deployed NewsLens URL
```

## Running

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Expo Go (scan QR code)
npm start
```

## Architecture

- **Framework**: Expo SDK 52 + Expo Router (file-based navigation)
- **Navigation**: Tab bar with Feed and Settings tabs
- **Data**: Fetches from the NewsLens Next.js API (`/api/news`, `/api/settings`)
- **Theming**: Automatic dark/light mode based on system preference

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Feed | `/(tabs)/` | Scrollable list of news digests with story cards |
| Settings | `/(tabs)/settings` | Category preference selector |

## API Integration

The app connects to the web app's REST API:

- `GET /api/news?days=7` — fetch recent digests
- `GET /api/settings` — get category preferences
- `POST /api/settings` — update category preferences
