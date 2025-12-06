# Login Strategy for Real-Time Sync Testing

## ✅ Recommended: Same Login Credentials

### Use the SAME account on both devices

**Why:**
- ✅ Both devices see the same projects
- ✅ Both devices see the same tasks
- ✅ Changes sync automatically between your own devices
- ✅ Simplest test scenario
- ✅ Tests the core real-time sync requirement

### How to Test:

1. **On Emulator:**
   - Sign up or login with: `test@example.com` / `password123`
   - Create a project: "Test Project"
   - Create some tasks

2. **On Phone:**
   - Login with the **same credentials**: `test@example.com` / `password123`
   - You'll see the same "Test Project"
   - You'll see the same tasks

3. **Test Real-Time Sync:**
   - Create task on emulator → appears on phone
   - Move task on phone → moves on emulator
   - Perfect for testing sync!

---

## 🔄 Alternative: Different Users (Advanced)

### Use DIFFERENT accounts (for multi-user testing)

**When to use:**
- Testing project sharing/collaboration
- Testing permissions
- Testing multi-user scenarios

**Requirements:**
- Both users must be members of the same project
- Project owner needs to add the second user as a member
- More complex setup

**How to Test:**

1. **On Emulator (User A - Owner):**
   - Login: `userA@example.com`
   - Create project: "Shared Project"
   - Add User B as member (if you have member management UI)

2. **On Phone (User B - Member):**
   - Login: `userB@example.com`
   - Should see "Shared Project" (if added as member)
   - Can see and edit tasks in shared project

3. **Test Multi-User Sync:**
   - User A creates task → User B sees it
   - User B edits task → User A sees changes
   - Tests collaboration features

---

## 🎯 For Your Current Test: Use Same Credentials

**Recommended Setup:**

```
Emulator:  test@example.com / password123
Phone:     test@example.com / password123
```

**Benefits:**
- ✅ Immediate access to same projects
- ✅ No setup needed
- ✅ Clear test results
- ✅ Tests core real-time sync

---

## 📝 Quick Test Account

**Create a test account:**

1. **On Emulator:**
   - Go to Sign Up
   - Email: `testrealtime@test.com`
   - Password: `test123456`
   - Sign Up

2. **On Phone:**
   - Go to Login
   - Email: `testrealtime@test.com`
   - Password: `test123456`
   - Login

3. **Both devices now:**
   - See the same account
   - See the same projects
   - See the same tasks
   - Ready to test sync!

---

## ✅ Summary

**For Basic Real-Time Sync Test:**
- ✅ **Use SAME credentials** on both devices
- ✅ Simplest and most effective
- ✅ Tests the core requirement

**For Advanced Multi-User Test:**
- Use different credentials
- Requires project sharing setup
- Tests collaboration features

---

## 🚀 Next Steps

1. **Create/Login with same account on emulator**
2. **Login with same account on phone**
3. **Open same project on both**
4. **Start testing real-time sync!**

Use the same credentials - it's the easiest way to test! 🎯

