# Maestro Quick Start Guide

## Installation

### macOS/Linux
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### macOS (Homebrew)
```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

### Windows
Download from [Maestro releases](https://github.com/mobile-dev-inc/maestro/releases)

## Verify Installation
```bash
maestro --version
```

## Quick Test Run

1. **Start your app:**
   ```bash
   npm start
   # In another terminal:
   npm run android
   # or
   npm run ios
   ```

2. **Run a simple test:**
   ```bash
   # Set your app ID (check app.json)
   export APP_ID=com.projectmanager.mobile
   
   # Run login test
   maestro test maestro/login.yaml
   ```

## Configuration

Update `.maestro/config.yaml` with your app details:

```yaml
APP_ID: com.projectmanager.mobile  # From app.json
TEST_EMAIL: your-test@email.com
TEST_PASSWORD: your-test-password
```

Or set environment variables:
```bash
export APP_ID=com.projectmanager.mobile
export TEST_EMAIL=test@example.com
export TEST_PASSWORD=testpass123
```

## Available Tests

```bash
# All tests
npm run test:maestro

# Individual tests
maestro test maestro/login.yaml
maestro test maestro/signup.yaml
maestro test maestro/create-project.yaml
maestro test maestro/create-task.yaml
maestro test maestro/edit-task.yaml
maestro test maestro/move-task.yaml
maestro test maestro/analytics.yaml

# Full end-to-end flow
maestro test maestro/full-flow.yaml
```

## Troubleshooting

### "App not found" error
- Make sure your app is running on the device/emulator
- Check the APP_ID matches your app's bundle identifier
- List devices: `maestro device list`

### "Element not found" error
- Use Maestro Studio to inspect elements: `maestro studio`
- Check if the app is fully loaded (add `waitForAnimationToEnd`)
- Verify element text matches exactly (case-sensitive)

### Test runs too fast
- Add `waitForAnimationToEnd` after actions
- Increase timeout in config: `DEFAULT_TIMEOUT: 30000`

## Next Steps

- Read [maestro/README.md](./README.md) for detailed documentation
- Use `maestro studio` to record and debug tests
- Check [Maestro docs](https://maestro.mobile.dev/) for advanced features

