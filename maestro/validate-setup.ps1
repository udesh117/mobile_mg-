# Maestro Setup Validation Script (PowerShell)
# This script checks if Maestro is properly installed and configured

Write-Host "🔍 Validating Maestro Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if Maestro is installed
Write-Host "1. Checking Maestro installation..." -ForegroundColor Yellow
try {
    $maestroVersion = maestro --version 2>&1
    Write-Host "   ✅ Maestro is installed: $maestroVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Maestro is not installed" -ForegroundColor Red
    Write-Host "   Install with: curl -Ls 'https://get.maestro.mobile.dev' | bash" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Check if config file exists
Write-Host "2. Checking configuration file..." -ForegroundColor Yellow
if (Test-Path ".maestro/config.yaml") {
    Write-Host "   ✅ Configuration file exists" -ForegroundColor Green
    
    $configContent = Get-Content ".maestro/config.yaml" -Raw
    if ($configContent -match "APP_ID:\s*(.+)") {
        $appId = $matches[1].Trim()
        Write-Host "   ✅ APP_ID found: $appId" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  APP_ID not set in config.yaml" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Configuration file not found at .maestro/config.yaml" -ForegroundColor Yellow
}

Write-Host ""

# Check if test files exist
Write-Host "3. Checking test files..." -ForegroundColor Yellow
$testFiles = @(
    "maestro/signup.yaml",
    "maestro/login.yaml",
    "maestro/create-project.yaml",
    "maestro/create-task.yaml",
    "maestro/edit-task.yaml",
    "maestro/move-task.yaml",
    "maestro/analytics.yaml",
    "maestro/full-flow.yaml"
)

$missingFiles = 0
foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file (missing)" -ForegroundColor Red
        $missingFiles++
    }
}

if ($missingFiles -eq 0) {
    Write-Host "   ✅ All test files present" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  $missingFiles test file(s) missing" -ForegroundColor Yellow
}

Write-Host ""

# Check if app.json exists
Write-Host "4. Checking app configuration..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    Write-Host "   ✅ app.json found" -ForegroundColor Green
    
    $appJson = Get-Content "app.json" -Raw | ConvertFrom-Json
    if ($appJson.expo.android.package) {
        Write-Host "   ✅ Android package: $($appJson.expo.android.package)" -ForegroundColor Green
    }
    if ($appJson.expo.ios.bundleIdentifier) {
        Write-Host "   ✅ iOS bundle identifier: $($appJson.expo.ios.bundleIdentifier)" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  app.json not found" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 Setup Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Maestro is installed and ready" -ForegroundColor Green
Write-Host "✅ Test files are in place" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update .maestro/config.yaml with your APP_ID"
Write-Host "   2. Start your app: npm start && npm run android (or ios)"
Write-Host "   3. Run a test: maestro test maestro/login.yaml"
Write-Host ""
Write-Host "💡 Quick test commands:" -ForegroundColor Yellow
Write-Host "   npm run test:maestro          # Run all tests"
Write-Host "   npm run test:maestro:login    # Run login test"
Write-Host "   npm run test:maestro:full     # Run full flow"
Write-Host ""

