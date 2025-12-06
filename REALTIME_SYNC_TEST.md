# Real-Time Sync Testing Guide

## 🎯 Objective

Test that changes made on one device automatically appear on another device without manual refresh.

## 📋 Prerequisites

1. Two devices/emulators (or one device + one emulator)
2. Both devices connected to the same Firebase project
3. Both devices online
4. App running on both devices

## 🚀 Step-by-Step Test Procedure

### Setup

1. **Start Device/Emulator A**
   ```bash
   npm start
   npm run android  # or npm run ios
   ```

2. **Start Device/Emulator B** (in another terminal or on physical device)
   ```bash
   npm start
   npm run android  # or use Expo Go app on physical device
   ```

3. **Login on Both Devices**
   - Use the same account on both devices (or different accounts in the same project)
   - Navigate to the same project on both devices

### Test Scenarios

#### Test 1: Task Creation ✅

**On Device A:**
1. Open a project
2. Tap "New Task" button
3. Enter task title: "Real-Time Test Task"
4. Add description: "Testing real-time sync"
5. Tap "Create"

**On Device B:**
- ✅ **Expected:** Task should appear automatically in "To Do" column
- ✅ **No refresh needed** - should appear within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 2: Task Movement (Drag-and-Drop) ✅

**On Device A:**
1. Find the task created in Test 1
2. Long-press and drag it to "In Progress" column
3. Release to drop

**On Device B:**
- ✅ **Expected:** Task should move to "In Progress" column automatically
- ✅ **No refresh needed** - should update within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 3: Task Update ✅

**On Device A:**
1. Tap on the task
2. Edit the title to "Updated Real-Time Test"
3. Tap "Save"

**On Device B:**
- ✅ **Expected:** Task title should update automatically
- ✅ **No refresh needed** - should update within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 4: Task Deletion ✅

**On Device A:**
1. Tap on the task
2. Tap "Delete" button
3. Confirm deletion

**On Device B:**
- ✅ **Expected:** Task should disappear automatically
- ✅ **No refresh needed** - should disappear within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 5: Project Creation ✅

**On Device A:**
1. Go to Projects screen
2. Tap "New Project" button
3. Enter project name: "Real-Time Test Project"
4. Tap "Create"

**On Device B:**
- ✅ **Expected:** New project should appear in projects list automatically
- ✅ **No refresh needed** - should appear within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 6: Task Assignment ✅

**On Device A:**
1. Open a task
2. Assign it to a project member
3. Save

**On Device B:**
- ✅ **Expected:** Assignment should update automatically
- ✅ **No refresh needed** - should update within 1-2 seconds

**Result:** [ ] Pass / [ ] Fail

---

#### Test 7: Multiple Simultaneous Changes ✅

**On Device A:**
1. Create Task 1: "Task A"
2. Create Task 2: "Task B"
3. Move Task A to "In Progress"
4. Edit Task B title to "Task B Updated"

**On Device B:**
- ✅ **Expected:** All changes should appear in correct order
- ✅ **No refresh needed** - all updates should sync automatically

**Result:** [ ] Pass / [ ] Fail

---

## 📊 Test Results Template

```
Real-Time Sync Test Results
Date: ___________
Tester: ___________

Test 1 - Task Creation:        [ ] Pass [ ] Fail
Test 2 - Task Movement:        [ ] Pass [ ] Fail
Test 3 - Task Update:          [ ] Pass [ ] Fail
Test 4 - Task Deletion:         [ ] Pass [ ] Fail
Test 5 - Project Creation:     [ ] Pass [ ] Fail
Test 6 - Task Assignment:      [ ] Pass [ ] Fail
Test 7 - Multiple Changes:     [ ] Pass [ ] Fail

Overall Result: [ ] All Pass [ ] Some Fail [ ] All Fail

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

## 🎥 Recording the Test (Optional but Recommended)

### Android
```bash
# Start recording
adb shell screenrecord /sdcard/realtime-sync-test.mp4

# Stop recording (Ctrl+C)
adb pull /sdcard/realtime-sync-test.mp4 .
```

### iOS
- Use QuickTime (built-in on macOS)
- Connect device and select "New Movie Recording"

### Screen Recording Apps
- Android: AZ Screen Recorder, Mobizen
- iOS: Built-in screen recording

## 🔍 Troubleshooting

### Changes Not Syncing

1. **Check Firebase Connection**
   - Verify both devices are online
   - Check Firebase console for errors
   - Verify Firestore rules are deployed

2. **Check Network**
   - Both devices on same network (or both online)
   - No firewall blocking Firebase

3. **Check Firestore Rules**
   - Rules should allow read/write for authenticated users
   - Verify rules are deployed: `firebase deploy --only firestore:rules`

4. **Check App Logs**
   ```bash
   # Android
   adb logcat | grep -i firebase
   
   # iOS
   # Check Xcode console
   ```

5. **Verify Real-Time Listeners**
   - Check browser console (if using web)
   - Check React Native debugger
   - Look for `onSnapshot` errors

### Slow Sync

- Normal: 1-2 seconds delay is acceptable
- If > 5 seconds: Check network speed
- If > 10 seconds: Check Firebase quota/limits

### Partial Sync

- Some changes sync, others don't: Check Firestore rules
- Check for permission errors in logs
- Verify user authentication on both devices

## ✅ Success Criteria

Real-time sync is working if:
- ✅ Changes appear within 1-2 seconds
- ✅ No manual refresh needed
- ✅ All test scenarios pass
- ✅ No errors in console/logs

## 📝 Notes

- **Latency:** 1-2 seconds is normal for Firestore real-time updates
- **Offline:** Firestore caches data, but real-time sync requires online connection
- **Multiple Users:** Test with different accounts to verify multi-user sync
- **Edge Cases:** Test with slow network, intermittent connectivity

## 🎯 Next Steps After Testing

1. **Document Results:** Fill out test results template
2. **Record Demo:** Create screen recording (optional)
3. **Fix Issues:** Address any failures
4. **Re-test:** Verify fixes work

---

**Ready to test?** Start with Test 1 and work through each scenario!

