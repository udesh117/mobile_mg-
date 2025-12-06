# 🚀 Start Testing - Quick Guide

## ✅ You Have WSL! (Perfect for Maestro)

Since you have WSL 2.6.1.0 installed, you can easily install Maestro. Here are your options:

## Option 1: Manual Real-Time Sync Test (Start Here - 15 min) ⚡

**Fastest way to verify the critical requirement!**

### Quick Steps:
1. **Start two devices/emulators:**
   ```bash
   # Terminal 1
   npm start
   npm run android
   
   # Terminal 2 (or use Expo Go on physical device)
   npm start
   # Connect via Expo Go app
   ```

2. **Follow the test guide:**
   - Open `REALTIME_SYNC_TEST.md`
   - Test all 7 scenarios
   - Document results

3. **Record (optional):**
   - Use screen recording to capture the sync
   - Great for submission!

**Time:** 15-30 minutes  
**Difficulty:** Easy  
**Result:** Visual proof of real-time sync

---

## Option 2: Maestro E2E Testing (Using WSL) 🤖

**Automated testing for all user flows!**

### Quick Steps:

1. **Install Maestro in WSL:**
   ```bash
   # Open WSL terminal
   wsl
   
   # Install Maestro
   curl -Ls "https://get.maestro.mobile.dev" | bash
   
   # Add to PATH (add to ~/.bashrc for permanent)
   export PATH="$HOME/.maestro/bin:$PATH"
   
   # Verify
   maestro --version
   ```

2. **Start your app:**
   ```bash
   # In PowerShell (Windows terminal)
   npm start
   npm run android  # or ios
   ```

3. **Run tests from WSL:**
   ```bash
   # In WSL terminal
   cd /mnt/c/Users/UDESH/Desktop/mg_road
   maestro test maestro/login.yaml
   ```

**Time:** 30-60 minutes (including setup)  
**Difficulty:** Medium  
**Result:** Automated test suite

---

## 🎯 Recommended Approach

### Do Both! (Best Coverage)

**Phase 1: Manual Real-Time Sync (15 min)**
- ✅ Immediate visual verification
- ✅ Tests critical requirement
- ✅ Can record video

**Phase 2: Maestro E2E (30 min)**
- ✅ Automated test coverage
- ✅ Repeatable tests
- ✅ Documentation

---

## 📋 Quick Start Commands

### For Manual Testing:
```bash
# 1. Start app on device/emulator
npm start
npm run android

# 2. Open REALTIME_SYNC_TEST.md and follow guide
```

### For Maestro (WSL):
```bash
# 1. Open WSL
wsl

# 2. Install Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$HOME/.maestro/bin:$PATH"

# 3. Navigate to project
cd /mnt/c/Users/UDESH/Desktop/mg_road

# 4. Start app in PowerShell first, then:
maestro test maestro/login.yaml
```

---

## 🎬 What You'll Test

### Manual Real-Time Sync:
- ✅ Task creation syncs
- ✅ Task movement syncs
- ✅ Task updates sync
- ✅ Task deletion syncs
- ✅ Project creation syncs

### Maestro E2E:
- ✅ Login flow
- ✅ Signup flow
- ✅ Project creation
- ✅ Task CRUD
- ✅ Task movement
- ✅ Analytics

---

## 📝 Next Action

**Choose your path:**

1. **Quick Test (15 min):** Open `REALTIME_SYNC_TEST.md` and start manual testing
2. **Full Suite (30 min):** Install Maestro in WSL and run automated tests
3. **Both (45 min):** Do manual first, then Maestro

---

## ✅ Ready?

**I recommend starting with Manual Real-Time Sync** - it's faster and tests the most critical requirement!

Open `REALTIME_SYNC_TEST.md` and let's test! 🚀

