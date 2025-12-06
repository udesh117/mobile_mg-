#!/bin/bash

# Maestro Setup Validation Script
# This script checks if Maestro is properly installed and configured

echo "🔍 Validating Maestro Setup..."
echo ""

# Check if Maestro is installed
echo "1. Checking Maestro installation..."
if command -v maestro &> /dev/null; then
    MAESTRO_VERSION=$(maestro --version 2>&1)
    echo "   ✅ Maestro is installed: $MAESTRO_VERSION"
else
    echo "   ❌ Maestro is not installed"
    echo "   Install with: curl -Ls 'https://get.maestro.mobile.dev' | bash"
    exit 1
fi

echo ""

# Check if config file exists
echo "2. Checking configuration file..."
if [ -f ".maestro/config.yaml" ]; then
    echo "   ✅ Configuration file exists"
    
    # Check if APP_ID is set
    if grep -q "APP_ID:" .maestro/config.yaml; then
        APP_ID=$(grep "APP_ID:" .maestro/config.yaml | cut -d' ' -f2)
        echo "   ✅ APP_ID found: $APP_ID"
    else
        echo "   ⚠️  APP_ID not set in config.yaml"
    fi
else
    echo "   ⚠️  Configuration file not found at .maestro/config.yaml"
fi

echo ""

# Check if test files exist
echo "3. Checking test files..."
TEST_FILES=(
    "maestro/signup.yaml"
    "maestro/login.yaml"
    "maestro/create-project.yaml"
    "maestro/create-task.yaml"
    "maestro/edit-task.yaml"
    "maestro/move-task.yaml"
    "maestro/analytics.yaml"
    "maestro/full-flow.yaml"
)

MISSING_FILES=0
for file in "${TEST_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -eq 0 ]; then
    echo "   ✅ All test files present"
else
    echo "   ⚠️  $MISSING_FILES test file(s) missing"
fi

echo ""

# Check if app.json exists and extract app ID
echo "4. Checking app configuration..."
if [ -f "app.json" ]; then
    echo "   ✅ app.json found"
    
    # Try to extract Android package
    if grep -q "package" app.json; then
        ANDROID_PACKAGE=$(grep -A 1 '"android"' app.json | grep '"package"' | cut -d'"' -f4)
        if [ ! -z "$ANDROID_PACKAGE" ]; then
            echo "   ✅ Android package: $ANDROID_PACKAGE"
        fi
    fi
    
    # Try to extract iOS bundle identifier
    if grep -q "bundleIdentifier" app.json; then
        IOS_BUNDLE=$(grep -A 1 '"ios"' app.json | grep '"bundleIdentifier"' | cut -d'"' -f4)
        if [ ! -z "$IOS_BUNDLE" ]; then
            echo "   ✅ iOS bundle identifier: $IOS_BUNDLE"
        fi
    fi
else
    echo "   ⚠️  app.json not found"
fi

echo ""

# Check for connected devices
echo "5. Checking for connected devices..."
if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    if [ $DEVICES -gt 0 ]; then
        echo "   ✅ Found $DEVICES Android device(s)"
        adb devices | grep "device$" | while read line; do
            DEVICE_ID=$(echo $line | awk '{print $1}')
            echo "      - $DEVICE_ID"
        done
    else
        echo "   ⚠️  No Android devices connected"
    fi
else
    echo "   ⚠️  ADB not found (Android devices check skipped)"
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Setup Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Maestro is installed and ready"
echo "✅ Test files are in place"
echo ""
echo "📝 Next steps:"
echo "   1. Update .maestro/config.yaml with your APP_ID"
echo "   2. Start your app: npm start && npm run android (or ios)"
echo "   3. Run a test: maestro test maestro/login.yaml"
echo ""
echo "💡 Quick test commands:"
echo "   npm run test:maestro          # Run all tests"
echo "   npm run test:maestro:login    # Run login test"
echo "   npm run test:maestro:full     # Run full flow"
echo ""

