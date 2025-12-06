# Real-Time Sync Setup: Emulator + Phone

## 🎯 Your Setup
- **Device A:** Android Emulator (already running)
- **Device B:** Your Phone (Expo Go app)

## 🚀 Quick Setup Steps

### Step 1: Start Expo Server

```bash
npm start
```

This will show you a QR code and connection options.

### Step 2: Connect Emulator

**Option A: Automatic (if emulator is running)**
- Expo should automatically detect and connect to the emulator
- You'll see "Android" in the Expo menu

**Option B: Manual**
- Press `a` in the Expo terminal to open on Android emulator
- Or scan the QR code from the emulator's browser

### Step 3: Connect Your Phone

1. **Install Expo Go** (if not already installed)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Connect to Same Network**
   - Make sure your phone and computer are on the same Wi-Fi network
   - Or use tunnel mode (see below)

3. **Scan QR Code**
   - Open Expo Go app on your phone
   - Tap "Scan QR Code"
   - Scan the QR code from the terminal
   - App will load on your phone

### Step 4: Login on Both Devices ⚠️ IMPORTANT

**✅ Use the SAME account on both devices!**

**On Emulator:**
- Sign up or login with an account (e.g., `test@example.com` / `password123`)
- Note the email/password you use

**On Phone:**
- Use the **EXACT SAME credentials** to login
- Same email, same password
- This ensures both devices see the same projects and tasks

**Why Same Account?**
- Both devices see the same data
- Changes sync automatically
- Simplest test scenario
- Tests core real-time sync requirement

### Step 5: Navigate to Same Project

**On Emulator:**
- Create a project or open an existing one
- Note the project name

**On Phone:**
- Open the **same project**
- You should see the same tasks

## ✅ Ready to Test!

Now both devices are connected and viewing the same project. Follow the test scenarios in `REALTIME_SYNC_TEST.md`.

---

## 🔧 Troubleshooting

### Phone Can't Connect

**Problem:** QR code doesn't work or connection fails

**Solutions:**

1. **Check Network:**
   - Phone and computer must be on same Wi-Fi
   - Try disabling VPN on either device

2. **Use Tunnel Mode:**
   ```bash
   npm start -- --tunnel
   ```
   - This works even on different networks
   - Slower but more reliable

3. **Manual Connection:**
   - In Expo Go, tap "Enter URL manually"
   - Enter: `exp://YOUR_COMPUTER_IP:8081`
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

4. **Firewall:**
   - Allow Expo through Windows Firewall
   - Port 8081 should be open

### App Not Loading

**Problem:** App shows error or doesn't load

**Solutions:**

1. **Clear Cache:**
   ```bash
   npm start -- --clear
   ```

2. **Restart Expo:**
   - Stop Expo (Ctrl+C)
   - Restart: `npm start`

3. **Check Firebase Config:**
   - Ensure Firebase is properly configured
   - Check `src/config/firebase.ts`

### Different Projects Showing

**Problem:** Devices show different projects

**Solutions:**

1. **Use Same Account:**
   - Both devices must use the same login credentials
   - Logout and login again on both

2. **Check Firebase:**
   - Verify both devices connect to same Firebase project
   - Check Firebase console for data

### Real-Time Sync Not Working

**Problem:** Changes don't appear on other device

**Solutions:**

1. **Check Internet:**
   - Both devices need internet connection
   - Firestore requires online connection

2. **Check Firebase Rules:**
   - Verify Firestore rules are deployed
   - Rules should allow read/write for authenticated users

3. **Check Logs:**
   - Look for errors in Expo terminal
   - Check phone's Expo Go logs

4. **Wait a Moment:**
   - Real-time sync has 1-2 second delay
   - This is normal

---

## 📱 Expo Go Tips

### On Your Phone:

1. **Keep Expo Go Open:**
   - Don't close the app during testing
   - App stays connected while open

2. **Reload if Needed:**
   - Shake phone to open developer menu
   - Tap "Reload" if app seems stuck

3. **Check Connection:**
   - Look for "Connected" status in Expo Go
   - Red banner means disconnected

---

## 🎬 Testing Workflow

### Recommended Order:

1. **Setup (5 min):**
   - Start Expo server
   - Connect emulator
   - Connect phone
   - Login on both

2. **Test 1: Task Creation (2 min)**
   - Create task on emulator
   - Watch it appear on phone

3. **Test 2: Task Movement (2 min)**
   - Move task on emulator
   - Watch it move on phone

4. **Test 3: Task Update (2 min)**
   - Edit task on phone
   - Watch it update on emulator

5. **Test 4: Task Deletion (2 min)**
   - Delete task on emulator
   - Watch it disappear on phone

6. **Test 5-7: Continue with other scenarios**

**Total Time:** ~15-20 minutes

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Changes appear within 1-2 seconds
- ✅ No manual refresh needed
- ✅ Both devices stay in sync
- ✅ No errors in console

---

## 📝 Next Steps

1. **Start Expo:** `npm start`
2. **Connect emulator:** Press `a` or it auto-connects
3. **Connect phone:** Scan QR code with Expo Go
4. **Login on both:** Use same account
5. **Open same project:** On both devices
6. **Start testing:** Follow `REALTIME_SYNC_TEST.md`

---

**Ready?** Start with `npm start` and let's test! 🚀

