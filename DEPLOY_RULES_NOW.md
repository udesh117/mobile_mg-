# 🚨 URGENT: Deploy Firestore Rules to Fix Permissions Error

## Current Error:
```
ERROR Realtime subscription error: [FirebaseError: Missing or insufficient permissions.]
```

## Quick Fix (5 minutes):

### Step 1: Open Firebase Console
Click this link: https://console.firebase.google.com/project/ahion-e7b57/firestore/rules

### Step 2: Copy Rules
Open the file `firestore.rules` in your project and copy ALL its content.

### Step 3: Paste & Publish
1. In Firebase Console, you'll see a code editor
2. **Delete everything** in the editor
3. **Paste** the content from `firestore.rules`
4. Click the **"Publish"** button (top right, blue button)

### Step 4: Wait & Reload
- Wait 10-30 seconds for rules to deploy
- Reload your app (press `r` in terminal or shake device)

---

## Alternative: Install Firebase CLI

If you prefer command line:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login (will open browser)
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

---

## What the Rules Do:

✅ Allow authenticated users to read/write their own projects  
✅ Allow authenticated users to read/write tasks in their projects  
✅ Maintain security by checking ownership/membership  
✅ Fix the "Missing or insufficient permissions" error  

---

## After Deploying:

Your app will work perfectly! The permissions error will disappear.

