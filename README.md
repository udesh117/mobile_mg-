# Mobile Project Manager

A production-ready mobile Kanban-style project manager app built with React Native (Expo) and Firebase. Manage team projects and tasks with real-time synchronization across devices.

## Features

- ✅ Email/password authentication with Firebase Auth
- ✅ Create and manage projects
- ✅ Kanban board with three columns (To Do, In Progress, Done)
- ✅ Create, edit, delete, and assign tasks
- ✅ Drag-and-drop task movement
- ✅ Real-time sync across devices
- ✅ Project analytics (tasks by status and assignee)
- ✅ Task due dates and assignment

## Tech Stack

- **Frontend:** React Native (Expo) + TypeScript
- **Backend:** Firebase (Firestore + Auth)
- **State Management:** React Query + Zustand
- **Navigation:** Expo Router
- **UI Library:** React Native Paper
- **Drag & Drop:** react-native-draggable-flatlist
- **Testing:** Jest + React Native Testing Library

## Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account
- Android Studio (for Android) or Xcode (for iOS)

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd mg_road
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore database (start in test mode for development)
5. Get your Firebase config from Project Settings > General > Your apps
6. Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Update `.env` with your Firebase config:
```
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

### 4. Configure Firestore Security Rules

In Firebase Console > Firestore Database > Rules, add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projects: users can only access projects they own or are members of
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         exists(/databases/$(database)/documents/projectMembers/$(projectId + '_' + request.auth.uid)));
      
      // Tasks: users can only access tasks in projects they're members of
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && 
          exists(/databases/$(database)/documents/projectMembers/$(projectId + '_' + request.auth.uid));
      }
      
      // Project Members: users can read members of projects they're in, owners can add members
      match /projectMembers/{memberId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          (request.auth.uid == get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId);
      }
    }
  }
}
```

### 5. Run the app

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
mg_road/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable components
│   ├── screens/           # Screen components
│   ├── hooks/             # Custom hooks (React Query)
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── config/            # Firebase config
├── assets/                # Images, fonts, etc.
└── package.json
```

## Testing

### Unit Tests (Jest)

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

### UI Tests (Maestro)

Maestro is used for end-to-end UI testing. See [maestro/README.md](./maestro/README.md) for detailed setup instructions.

**Prerequisites:**
```bash
# Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
```

**Run Maestro tests:**
```bash
# Run all Maestro tests
npm run test:maestro

# Run specific test
npm run test:maestro:login

# Run full flow test
npm run test:maestro:full

# Or use Maestro directly
maestro test maestro/login.yaml
```

**Test Coverage:**
- ✅ Authentication (sign-up, login)
- ✅ Project creation and management
- ✅ Task creation, editing, and deletion
- ✅ Task movement between columns
- ✅ Analytics viewing
- ✅ Complete end-to-end workflows

## Real-Time Sync

The app uses Firestore's `onSnapshot` for real-time updates. When a task is moved, created, or updated on one device, all connected devices receive the update automatically through Firestore's real-time listeners.

## Architecture

- **State Management:** Zustand for global state (auth, UI), React Query for server state (projects, tasks)
- **Real-time:** Firestore `onSnapshot` listeners with optimistic updates via React Query
- **Navigation:** Expo Router with file-based routing
- **Styling:** React Native Paper for consistent Material Design components

## Known Limitations

- Offline support is basic (Firestore handles caching, but full offline queue not implemented)
- Conflict resolution uses last-write-wins by timestamp
- File attachments and comments not included
- Drag-and-drop works for reordering tasks within columns; cross-column movement uses Edit Modal (tap-based method) for better mobile reliability

## License

MIT

