# Maestro Test Suite

This directory contains Maestro UI tests for the Mobile Project Manager app.

## Prerequisites

1. Install Maestro:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

   Or using Homebrew (macOS):
   ```bash
   brew tap mobile-dev-inc/tap
   brew install maestro
   ```

2. Make sure your app is running:
   ```bash
   npm start
   # Then run on Android or iOS
   npm run android
   # or
   npm run ios
   ```

## Configuration

Create a `.maestro/config.yaml` file (or set environment variables) with:

```yaml
APP_ID: com.yourcompany.mobileprojectmanager
TEST_EMAIL: test@example.com
TEST_PASSWORD: testpass123
```

Or set environment variables:
```bash
export APP_ID=com.yourcompany.mobileprojectmanager
export TEST_EMAIL=test@example.com
export TEST_PASSWORD=testpass123
```

## Test Files

### Individual Test Flows

- **signup.yaml** - Tests user sign-up flow
- **login.yaml** - Tests user login flow
- **create-project.yaml** - Tests creating a new project
- **create-task.yaml** - Tests creating a new task
- **edit-task.yaml** - Tests editing an existing task
- **move-task.yaml** - Tests moving tasks between columns
- **analytics.yaml** - Tests viewing project analytics
- **full-flow.yaml** - Complete end-to-end workflow test

## Running Tests

### Run a single test:
```bash
maestro test maestro/login.yaml
```

### Run all tests:
```bash
maestro test maestro/
```

### Run with specific app:
```bash
maestro test maestro/login.yaml --app-id com.yourcompany.mobileprojectmanager
```

### Run on specific device:
```bash
maestro test maestro/login.yaml --device "emulator-5554"
```

### Run with environment variables:
```bash
APP_ID=com.yourcompany.mobileprojectmanager TEST_EMAIL=test@example.com TEST_PASSWORD=testpass123 maestro test maestro/login.yaml
```

## Test Coverage

### ✅ Authentication
- [x] User sign-up
- [x] User login

### ✅ Projects
- [x] Create project
- [x] View projects list
- [x] Open project

### ✅ Tasks
- [x] Create task
- [x] Edit task
- [x] Move task between columns
- [x] View tasks in Kanban board

### ✅ Analytics
- [x] View project analytics
- [x] View tasks by status
- [x] View tasks by assignee

### ✅ End-to-End
- [x] Complete user workflow

## Notes

1. **Random Values**: Tests use `${RANDOM}` to generate unique values and avoid conflicts
2. **Prerequisites**: Some tests require previous steps (e.g., login before creating projects)
3. **Timing**: Maestro automatically waits for elements, but you may need to adjust timeouts for slower devices
4. **Real-time Sync**: Real-time sync testing requires two devices/emulators running simultaneously

## Troubleshooting

### Test fails to find element
- Check if the app is fully loaded
- Verify element text/ID matches exactly
- Use Maestro Studio to inspect elements: `maestro studio`

### App crashes during test
- Check app logs: `adb logcat` (Android) or Xcode console (iOS)
- Verify Firebase configuration is correct
- Ensure test data doesn't conflict with existing data

### Slow test execution
- Increase wait times in test files
- Use `waitForAnimationToEnd` command
- Check device/emulator performance

## Maestro Studio

Use Maestro Studio to record and debug tests:

```bash
maestro studio
```

This opens a visual interface where you can:
- Record test flows
- Inspect app elements
- Debug test failures
- Generate test files

## Continuous Integration

To run Maestro tests in CI/CD:

```yaml
# Example GitHub Actions
- name: Run Maestro Tests
  run: |
    maestro test maestro/
```

## Additional Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Maestro Examples](https://maestro.mobile.dev/examples)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)

