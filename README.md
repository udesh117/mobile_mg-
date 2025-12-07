# MG Road - Mobile Project Manager

A modern, production-ready mobile Kanban-style project management app built with React Native (Expo) and Firebase. Manage team projects and tasks with real-time synchronization across devices.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)
![Expo](https://img.shields.io/badge/Expo-54.0.27-000020.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg)

## ✨ Features

### 🔐 Authentication
- Email/password authentication with Firebase Auth
- Secure session management
- Protected routes with authentication guards

### 📁 Project Management
- Create, edit, and delete projects
- Project search functionality
- Project task count display (X/Y tasks)
- Project icons based on project type
- Real-time project updates across devices

### 📋 Task Management
- Kanban board with three columns (To Do, In Progress, Done)
- Create, edit, delete, and assign tasks
- Task priority levels (High, Medium, Low)
- Task due dates
- Typable assignee names
- Drag-and-drop task movement (landscape mode recommended)
- Real-time task synchronization

### 📊 Analytics
- Project-specific analytics dashboard
- Task counts by status (Total, To Do, In Progress, Done)
- Tasks by assignee with visual avatars
- Time period filtering (Week, Month, All Time)
- Auto-updating analytics when tasks change

### 👤 Profile Management
- Profile picture upload (Camera/Gallery)
- Remove profile picture option
- Account information display
- Settings menu (Notifications, Theme, Language)
- Help & Support (FAQs, Contact Support, About)
- Secure logout

### 🎨 User Interface
- Modern dark mode design
- Responsive layout for all screen sizes
- Smooth animations and transitions
- Intuitive navigation with tab bar
- Material Design icons

## 🛠 Tech Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile framework
- **TypeScript** - Type safety
- **Expo Router** - File-based routing
- **React Native Paper** - Material Design components
- **Material Icons** - Icon library

### Backend & Services
- **Firebase Auth** - Email/password authentication
- **Firestore** - NoSQL database with real-time capabilities
- **Firestore Security Rules** - Row-level security

### State Management
- **Zustand** - Global state (auth, UI modals)
- **React Query (TanStack Query)** - Server state management, caching, synchronization

### Real-Time & Sync
- **Firestore onSnapshot** - Real-time database listeners
- **Optimistic Updates** - Immediate UI feedback
- **Auto-invalidation** - Automatic data refresh

### Additional Libraries
- **react-native-draggable-flatlist** - Drag and drop functionality
- **expo-image-picker** - Image selection
- **expo-linear-gradient** - Gradient backgrounds
- **date-fns** - Date formatting
- **@react-native-async-storage/async-storage** - Local storage

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **Expo CLI** (`npm install -g expo-cli`)
- **Firebase account** (free tier works)
- **Android Studio** (for Android) or **Xcode** (for iOS)
- **Expo Go app** (for testing on physical devices)

## 🚀 Setup Instructions

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
3. Enable **Authentication** → **Email/Password** provider
4. Create **Firestore Database** (start in test mode for development)
5. Get your Firebase config from **Project Settings** → **General** → **Your apps**
6. Update `src/config/firebase.ts` with your Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

### 4. Configure Firestore Security Rules

In Firebase Console → **Firestore Database** → **Rules**, copy the rules from `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isProjectMember(projectId) {
      return request.auth != null && 
        exists(/databases/$(database)/documents/projectMembers/$(projectId + '_' + request.auth.uid));
    }
    
    function isProjectOwner(projectId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId == request.auth.uid;
    }
    
    // Projects collection
    match /projects/{projectId} {
      allow read: if isAuthenticated() && 
        (request.auth.uid == resource.data.ownerId || isProjectMember(projectId));
      allow create: if isAuthenticated() && 
        request.auth.uid == request.resource.data.ownerId;
      allow update, delete: if isAuthenticated() && 
        request.auth.uid == resource.data.ownerId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if isAuthenticated() && canAccessTask(resource.data.projectId);
    }
    
    // Project Members collection
    match /projectMembers/{memberId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
        isProjectOwner(get(/databases/$(database)/documents/projects/$(split(memberId, '_')[0])).data.ownerId);
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

# Run on web
npm run web
```

## 📁 Project Structure

```
mg_road/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                  # Main app tabs
│   │   ├── projects.tsx         # Projects list with search
│   │   ├── analytics.tsx        # Analytics dashboard
│   │   └── profile.tsx          # User profile
│   ├── project/
│   │   └── [id].tsx             # Kanban board for project
│   └── _layout.tsx              # Root layout
├── src/
│   ├── components/              # Reusable components
│   │   ├── KanbanBoard.tsx      # Main Kanban board
│   │   ├── TaskCard.tsx         # Task card component
│   │   ├── ProjectCard.tsx     # Project card component
│   │   ├── CreateTaskModal.tsx # Task creation modal
│   │   ├── EditTaskModalWithData.tsx # Task editing modal
│   │   └── CreateProjectModal.tsx # Project creation modal
│   ├── hooks/                   # Custom hooks
│   │   ├── useProjects.ts       # Project data management
│   │   ├── useTasks.ts          # Task data management
│   │   ├── useRealtimeTasks.ts  # Real-time task updates
│   │   ├── useAnalytics.ts      # Analytics data
│   │   ├── useProjectMembers.ts # Project members
│   │   └── useProjectTaskCount.ts # Task count per project
│   ├── store/                   # Zustand stores
│   │   ├── authStore.ts         # Authentication state
│   │   └── uiStore.ts            # UI state
│   ├── types/                   # TypeScript types
│   │   └── index.ts             # Type definitions
│   ├── utils/                   # Utility functions
│   │   ├── responsive.ts        # Responsive scaling
│   │   ├── dateUtils.ts         # Date formatting
│   │   └── authGuard.tsx        # Auth guard component
│   └── config/
│       └── firebase.ts          # Firebase configuration
├── assets/                      # Images, fonts, etc.
├── firestore.rules              # Firestore security rules
├── app.json                     # Expo configuration
└── package.json                 # Dependencies
```

## 🎯 Key Features Explained

### Real-Time Synchronization
The app uses Firestore's `onSnapshot` listeners to provide real-time updates. When a task is moved, created, or updated on one device, all connected devices receive the update automatically.

### Auto-Updating Analytics
Analytics automatically refresh when tasks are created, updated, or deleted. The dashboard shows:
- Total tasks count
- Tasks by status (To Do, In Progress, Done)
- Tasks by assignee with visual avatars
- Filterable by time period

### Task Priority System
Tasks can be assigned priority levels:
- **High** - Urgent tasks
- **Medium** - Normal priority (default)
- **Low** - Low priority tasks

### Typable Assignee Names
Instead of selecting from a dropdown, users can type assignee names directly. These names are reflected in the Analytics dashboard.

### Project Search
The Projects screen includes a search bar that filters projects by name and description in real-time.

### Profile Management
- Upload profile pictures from camera or gallery
- Remove profile pictures
- View account information
- Access settings and help options

## 🧪 Testing

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

Maestro is used for end-to-end UI testing. See [maestro/README.md](./maestro/README.md) for detailed setup.

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
```

**Test Coverage:**
- ✅ Authentication (sign-up, login)
- ✅ Project creation and management
- ✅ Task creation, editing, and deletion
- ✅ Task movement between columns
- ✅ Analytics viewing
- ✅ Complete end-to-end workflows

## 🏗 Architecture

### State Management
- **Zustand**: Global state (auth, UI modals)
- **React Query**: Server state (projects, tasks, analytics)
- **Real-time**: Firestore `onSnapshot` listeners with optimistic updates

### Data Flow
```
User Action → Component → Hook (React Query) → Firestore 
→ Real-time Update → React Query Cache → UI Update
```

### Navigation
- **Expo Router**: File-based routing system
- **Tab Navigation**: Projects, Analytics, Profile
- **Stack Navigation**: Project detail (Kanban board)

## 📱 Screenshots

### Projects Screen
- List of all projects with search functionality
- Project cards showing task progress
- Create new project button

### Analytics Screen
- Project selector dropdown
- Task status cards
- Tasks by assignee section
- Time period filter buttons

### Kanban Board
- Three columns: To Do, In Progress, Done
- Drag and drop functionality (landscape mode recommended)
- Create task button
- Task cards with priority and assignee

### Profile Screen
- Profile picture with edit option
- Account information
- Settings and Help options
- Logout button

## 🔒 Security

- Firebase Authentication for secure user management
- Firestore Security Rules for data access control
- Row-level security based on project membership
- Protected routes with authentication guards

## 🐛 Known Limitations

- Offline support is basic (Firestore handles caching, but full offline queue not implemented)
- Conflict resolution uses last-write-wins by timestamp
- File attachments and comments not included
- Drag-and-drop works best in landscape mode

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

MG Road Development Team

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for the development platform
- React Native community for excellent libraries
- Material Icons for iconography

---

**Made with ❤️ using React Native and Firebase**
