# NHAI Field Team Mobile App

A React Native mobile app for NHAI field teams to update live task status for the project coordinator.

## Features

- NHAI project and assigned field task view
- Chainage, work done, issue, and next-action capture
- Quick Start, Complete, Map, and Call actions
- Coordinator workspace sync through the web app API
- Queued status when the coordinator API cannot be reached

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- A running web dashboard API connected to Supabase

### Installation

1. Clone the repository
2. Navigate to the mobile-app directory
3. Install dependencies:

```bash
npm install
```

### Running the App

#### Web (for development/testing)
```bash
npm run web
```

By default, the app syncs tasks and live updates with `http://localhost:4001/api/nhai/workspace`.
For a physical phone, set `EXPO_PUBLIC_COORDINATOR_API_URL` to the web app URL reachable from that device.

```env
EXPO_PUBLIC_COORDINATOR_API_URL=http://192.168.1.25:4001
```

The mobile app does not use the Supabase service key. The web app API owns the Supabase connection and keeps the mobile app limited to task/update operations.

#### Android
```bash
npm run android
```

#### iOS (macOS only)
```bash
npm run ios
```

## Project Structure

- `components/` - Reusable UI components
- `lib/` - Types, mock data, and utilities
- `App.tsx` - Main app component with navigation

## Technologies Used

- React Native
- Expo
- NativeWind (Tailwind CSS for React Native)
- React Navigation
- TypeScript
