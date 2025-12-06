# Maestro Installation for Windows

## Installation Options

### Option 1: Using WSL (Windows Subsystem for Linux) - Recommended

If you have WSL installed:

```bash
# In WSL terminal
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$HOME/.maestro/bin:$PATH"
maestro --version
```

### Option 2: Direct Download (Windows)

1. Go to [Maestro Releases](https://github.com/mobile-dev-inc/maestro/releases)
2. Download the latest Windows binary
3. Extract and add to PATH

### Option 3: Using Chocolatey (if installed)

```powershell
choco install maestro
```

### Option 4: Manual Installation

1. Download from: https://github.com/mobile-dev-inc/maestro/releases/latest
2. Extract the binary
3. Add to your system PATH
4. Verify: `maestro --version`

## Quick Test After Installation

```bash
maestro --version
```

## Alternative: Test Real-Time Sync Manually First

Since Maestro installation on Windows can be complex, you might want to:
1. **Test real-time sync manually first** (easier, immediate)
2. **Install Maestro later** (for automated E2E tests)

See `REALTIME_SYNC_TEST.md` for manual testing instructions.

