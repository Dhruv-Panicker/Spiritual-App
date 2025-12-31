# Phase 0: Minimal Working App

This is the absolute minimal version of the app that should build successfully.

## Dependencies
- expo: ~52.0.0
- expo-router: ~3.5.23
- react: 18.3.1
- react-native: 0.76.3

**No native modules** - this should build without any issues.

## Setup

```bash
cd PHASE_0_MINIMAL
npm install
```

## Test Build

```bash
# For iOS Simulator
eas build --profile simulator --platform ios

# Or for development
npm start
```

## Success Criteria

✅ `npm install` completes without errors
✅ `npm start` runs successfully
✅ EAS build completes successfully
✅ App installs and runs on simulator
✅ Displays "Spiritual App - Phase 0" screen

## Next Phase

Once this builds successfully, we can move to Phase 1 (Navigation).

