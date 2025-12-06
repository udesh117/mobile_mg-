# Deploy Firestore Rules

## Option 1: Firebase Console (Easiest)

1. Go to https://console.firebase.google.com
2. Select your project: **ahion-e7b57**
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab at the top
5. Copy and paste the entire content from `firestore.rules` file
6. Click **Publish** button

## Option 2: Install Firebase CLI and Deploy

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy the rules
firebase deploy --only firestore:rules
```

## What Was Fixed

The Firestore rules were updated to:
- Allow access to the top-level `tasks` collection (not subcollection)
- Fix permissions for authenticated users to read/write their project tasks
- Maintain security by checking project ownership or membership

After deploying, your app should work without permission errors!

