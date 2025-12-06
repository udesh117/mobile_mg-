# Architecture Documentation

## Overview

The Mobile Project Manager app is built with a modern React Native stack, using Firebase as the backend-as-a-service. The architecture follows a clean separation of concerns with clear data flow patterns.

## Tech Stack

### Frontend
- **React Native (Expo)**: Cross-platform mobile framework
- **TypeScript**: Type safety and better developer experience
- **Expo Router**: File-based routing system
- **React Native Paper**: Material Design component library

### Backend & Services
- **Firebase Auth**: Email/password authentication
- **Firestore**: NoSQL database with real-time capabilities
- **Firestore Security Rules**: Row-level security

### State Management
- **Zustand**: Lightweight global state (auth, UI modals)
- **React Query (TanStack Query)**: Server state management, caching, and synchronization

### Real-Time
- **Firestore onSnapshot**: Real-time database listeners
- **Optimistic Updates**: Immediate UI feedback with React Query

## Architecture Patterns

### 1. Data Flow

```
User Action → Component → Hook (React Query) → Firestore → Real-time Update → React Query Cache → UI Update
```

### 2. State Management Strategy

**Zustand Stores:**
- `authStore`: User authentication state, session management
- `uiStore`: Modal visibility, selected items

**React Query:**
- Projects data (`useProjects`)
- Tasks data (`useTasks`)
- Project members (`useProjectMembers`)
- Analytics (`useAnalytics`)

### 3. Real-Time Sync Implementation

1. **Initial Load**: React Query fetches data from Firestore
2. **Real-Time Subscription**: `useRealtimeTasks` hook sets up `onSnapshot` listener
3. **Cache Update**: When Firestore emits changes, React Query cache is updated
4. **UI Re-render**: Components automatically re-render with new data

**Optimization:**
- Debounced updates using `requestAnimationFrame`
- Mounted state checks to prevent memory leaks
- Status-specific query invalidation

### 4. Component Structure

```
Screen Component
  ├── Custom Hooks (data fetching)
  ├── UI Components (presentation)
  └── Modals (user interactions)
```

### 5. Navigation Structure

```
app/
├── (auth)/          # Unauthenticated routes
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/          # Authenticated main app
│   ├── projects.tsx
│   ├── analytics.tsx
│   └── profile.tsx
└── project/[id].tsx  # Dynamic project detail route
```

## Key Design Decisions

### Why Firebase?
- **Rapid Development**: No backend server to build/maintain
- **Real-Time Built-in**: Firestore provides real-time sync out of the box
- **Scalability**: Firebase handles scaling automatically
- **Security**: Row-level security rules for multi-tenant data

### Why React Query + Zustand?
- **React Query**: Perfect for server state (caching, synchronization, optimistic updates)
- **Zustand**: Simple, lightweight for client-only state (modals, UI state)
- **Separation**: Clear distinction between server and client state

### Why Expo Router?
- **File-based Routing**: Intuitive route structure
- **Type Safety**: TypeScript support for routes
- **Deep Linking**: Built-in support for deep links

## Data Models

### Project
```typescript
{
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: Date;
}
```

### Task
```typescript
{
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  assigneeId?: string;
  dueDate?: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### ProjectMember
```typescript
{
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'member';
  createdAt: Date;
}
```

## Security

### Firestore Security Rules
- Projects: Only owners and members can access
- Tasks: Only project members can read/write
- Project Members: Only owners can add/remove members

### Authentication
- Firebase Auth handles JWT tokens
- Session persistence via Firebase SDK
- Protected routes via `AuthGuard` component

## Performance Optimizations

1. **Query Caching**: React Query caches data for 5 minutes
2. **Optimistic Updates**: Immediate UI feedback before server confirmation
3. **Debounced Real-Time**: Updates batched using `requestAnimationFrame`
4. **Lazy Loading**: Components load data only when needed
5. **Indexed Queries**: Firestore indexes for common query patterns

## Testing Strategy

1. **Unit Tests**: Utility functions, store logic
2. **Component Tests**: React Native Testing Library for UI components
3. **Integration Tests**: User flows (auth, CRUD operations)

## Future Enhancements

- Offline queue for pending operations
- Conflict resolution with vector clocks
- File attachments for tasks
- Comments and activity feed
- Push notifications
- Advanced analytics and reporting

