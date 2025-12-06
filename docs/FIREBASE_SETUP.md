# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "Mobile Project Manager"
4. Disable Google Analytics (optional for development)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password** provider
4. Click **Save**

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (for development)
4. Choose a location (closest to your users)
5. Click **Enable**

## Step 4: Configure Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is project member
    function isProjectMember(projectId) {
      return request.auth != null && 
        exists(/databases/$(database)/documents/projectMembers/$(projectId + '_' + request.auth.uid));
    }
    
    // Helper function to check if user is project owner
    function isProjectOwner(projectId) {
      return request.auth != null && 
        get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId == request.auth.uid;
    }
    
    // Projects collection
    match /projects/{projectId} {
      // Users can read projects they own or are members of
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || isProjectMember(projectId));
      
      // Users can create projects (they become owner)
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.ownerId;
      
      // Only owners can update/delete projects
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
      
      // Tasks subcollection
      match /tasks/{taskId} {
        // Project members can read/write tasks
        allow read, write: if request.auth != null && isProjectMember(projectId);
      }
    }
    
    // Project Members collection
    match /projectMembers/{memberId} {
      // Users can read members of projects they're in
      allow read: if request.auth != null;
      
      // Only project owners can add/remove members
      allow create: if request.auth != null && 
        isProjectOwner(get(/databases/$(database)/documents/projectMembers/$(memberId)).data.projectId);
      
      allow update, delete: if request.auth != null && 
        isProjectOwner(resource.data.projectId);
    }
  }
}
```

3. Click **Publish**

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to **Your apps**
3. If you don't have an app, click **Add app** > **Android** or **iOS**
4. For React Native with Expo, you'll need:
   - **Android:** Package name (e.g., `com.projectmanager.mobile`)
   - **iOS:** Bundle ID (e.g., `com.projectmanager.mobile`)
5. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
6. Place these files in the project root (they'll be used during build)

## Step 6: Configure Firebase in Code

**Option A: Hardcoded Configuration (Current Setup - Works Out of the Box)**

The Firebase configuration is currently hardcoded in `src/config/firebase.ts`. This works fine for development and small projects. Simply update the values in that file with your Firebase project credentials.

**Option B: Environment Variables (Recommended for Production)**

For better security and environment management, you can use environment variables:

1. Install `expo-constants` (already included) and `dotenv` if needed
2. Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Note:** 
- In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app
- The `.env` file is already in `.gitignore` to prevent committing secrets
- For @react-native-firebase, configuration is done through native files (google-services.json for Android, GoogleService-Info.plist for iOS) rather than environment variables

## Step 7: Create Firestore Indexes

1. Go to **Firestore Database** > **Indexes**
2. Create composite indexes for common queries:

**Index 1: Tasks by Project and Status**
- Collection: `tasks`
- Fields: `projectId` (Ascending), `status` (Ascending), `position` (Ascending)

**Index 2: Tasks by Project and Assignee**
- Collection: `tasks`
- Fields: `projectId` (Ascending), `assigneeId` (Ascending)

**Index 3: Project Members by Project**
- Collection: `projectMembers`
- Fields: `projectId` (Ascending), `userId` (Ascending)

## Step 8: Enable Firestore Realtime

Firestore real-time updates are enabled by default. No additional configuration needed.

## Testing the Setup

1. Run the app: `npm start`
2. Try to sign up with a test email
3. Check Firebase Console > Authentication to see the new user
4. Create a test project and check Firestore Database to see the data

## Troubleshooting

- **"Firebase App not initialized"**: Make sure google-services.json (Android) or GoogleService-Info.plist (iOS) is in the correct location
- **"Permission denied"**: Check Firestore security rules
- **"Index missing"**: Create the required indexes in Firestore Console

