# Maestro Testing Guide

## ✅ Setup Complete!

Your Maestro test suite is ready to use. Here's everything you need to know.

## Quick Start (3 Steps)

### Step 1: Install Maestro
```bash
# macOS/Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# macOS (Homebrew)
brew tap mobile-dev-inc/tap
brew install maestro

# Windows
# Download from: https://github.com/mobile-dev-inc/maestro/releases
```

### Step 2: Verify Setup
```bash
# Run validation script (macOS/Linux)
bash maestro/validate-setup.sh

# Or PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File maestro/validate-setup.ps1
```

### Step 3: Run Your First Test
```bash
# Make sure your app is running first
npm start
# In another terminal: npm run android (or ios)

# Then run a test
maestro test maestro/login.yaml
```

## Configuration

Your app ID is already configured in `.maestro/config.yaml`:
- **Android:** `com.projectmanager.mobile`
- **iOS:** `com.projectmanager.mobile`

To use different credentials, either:
1. Update `.maestro/config.yaml`
2. Set environment variables:
   ```bash
   export TEST_EMAIL=your@email.com
   export TEST_PASSWORD=yourpassword
   ```

## Available Tests

### Individual Tests
```bash
# Authentication
maestro test maestro/signup.yaml      # User sign-up
maestro test maestro/login.yaml       # User login

# Projects
maestro test maestro/create-project.yaml  # Create project

# Tasks
maestro test maestro/create-task.yaml      # Create task
maestro test maestro/edit-task.yaml       # Edit task
maestro test maestro/move-task.yaml       # Move task (drag-and-drop)

# Analytics
maestro test maestro/analytics.yaml        # View analytics

# Complete Flow
maestro test maestro/full-flow.yaml       # End-to-end workflow
```

### Using NPM Scripts
```bash
npm run test:maestro          # Run all tests
npm run test:maestro:login    # Run login test only
npm run test:maestro:full       # Run full flow test
```

## Test Prerequisites

Some tests require previous steps:

| Test | Prerequisites |
|------|--------------|
| `login.yaml` | None (starts from login screen) |
| `signup.yaml` | None (starts from signup screen) |
| `create-project.yaml` | User must be logged in |
| `create-task.yaml` | User logged in + at least 1 project |
| `edit-task.yaml` | User logged in + project + at least 1 task |
| `move-task.yaml` | User logged in + project + at least 1 task |
| `analytics.yaml` | User logged in + at least 1 project |
| `full-flow.yaml` | None (complete flow from signup) |

## Running Tests on Specific Devices

### List Available Devices
```bash
maestro device list
```

### Run on Specific Device
```bash
maestro test maestro/login.yaml --device "emulator-5554"
```

### Android
```bash
# List Android devices
adb devices

# Run on specific Android device
maestro test maestro/login.yaml --device "emulator-5554"
```

### iOS
```bash
# List iOS simulators
xcrun simctl list devices

# Run on specific iOS simulator
maestro test maestro/login.yaml --device "iPhone 14"
```

## Debugging Tests

### Use Maestro Studio
```bash
maestro studio
```
This opens a visual interface where you can:
- Record test flows
- Inspect app elements
- Debug test failures
- Generate test files

### Common Issues

#### "Element not found"
- Use `maestro studio` to inspect elements
- Check element text matches exactly (case-sensitive)
- Add `waitForAnimationToEnd` after actions
- Verify app is fully loaded

#### "App not found"
- Make sure app is running on device/emulator
- Check APP_ID matches your app's bundle identifier
- List devices: `maestro device list`

#### Test runs too fast
- Add `waitForAnimationToEnd` commands
- Increase timeout in config: `DEFAULT_TIMEOUT: 30000`

## Test Structure

Each test file follows this structure:
```yaml
appId: ${APP_ID}
---
# Test description
- launchApp
- assertVisible: "Expected Text"
- tapOn: "Button Text"
- inputText: "Text to input"
# ... more commands
```

## Environment Variables

You can override config values with environment variables:

```bash
# Set app ID
export APP_ID=com.projectmanager.mobile

# Set test credentials
export TEST_EMAIL=test@example.com
export TEST_PASSWORD=testpass123

# Run test
maestro test maestro/login.yaml
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Maestro Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
      - name: Start app
        run: npm start &
      - name: Run Maestro tests
        run: maestro test maestro/
        env:
          APP_ID: com.projectmanager.mobile
```

## Best Practices

1. **Use unique test data**: Tests use `${RANDOM}` to avoid conflicts
2. **Clean up after tests**: Consider adding cleanup steps
3. **Test on real devices**: Emulators are fine, but test on real devices too
4. **Keep tests focused**: Each test should test one specific flow
5. **Use descriptive names**: Test file names should clearly indicate what they test

## Real-Time Sync Testing

To test real-time sync:
1. Start app on Device A
2. Start app on Device B (same or different account)
3. Run test on Device A that creates/updates tasks
4. Verify changes appear on Device B automatically

This requires manual coordination or a more complex test setup.

## Next Steps

1. ✅ **Install Maestro** (if not done)
2. ✅ **Verify setup** with validation script
3. ✅ **Run your first test**: `maestro test maestro/login.yaml`
4. ✅ **Explore Maestro Studio**: `maestro studio`
5. ✅ **Customize tests** for your specific needs

## Resources

- 📚 [Maestro Documentation](https://maestro.mobile.dev/)
- 💡 [Maestro Examples](https://maestro.mobile.dev/examples)
- 🐙 [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- 📖 [Full README](./README.md)
- 🚀 [Quick Start Guide](./QUICK_START.md)

---

**Happy Testing!** 🎉

