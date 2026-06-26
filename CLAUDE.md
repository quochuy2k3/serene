# Serene — Agent Instructions

## Project Overview

Anti-motion-sickness app combining 100 Hz Audio Therapy + Motion Cues Overlay.
Free, non-profit app for iOS + Android. Package: `com.serene.app`.

**Design spec:** `docs/superpowers/specs/2026-04-04-serene-app-design.md`

## Tech Stack

- **Framework:** Expo SDK 54 (bare workflow) + TypeScript
- **Navigation:** Expo Router v6 (file-based, `app/` directory)
- **Package manager:** pnpm
- **i18n:** i18next + react-i18next + expo-localization (VI + EN)
- **Fonts:** Manrope (via @expo-google-fonts/manrope)
- **Animation:** react-native-reanimated v4 (iOS dots)
- **Audio:** expo-audio (pre-rendered 100 Hz sine WAV)
- **Android native:** Kotlin (MotionCuesService, MotionCuesModule)

## Architecture

```
app/              → Expo Router screens (5 screens)
components/       → Shared UI components
modules/          → Native module JS bridges
hooks/            → Custom React hooks
constants/        → Theme, config, types
i18n/             → i18next setup + locale JSON files
android/          → Native Android code (after prebuild)
ios/              → Native iOS code (after prebuild)
```

## Design System

- **Colors:** Primary `#4A90A4`, Secondary `#78909C`, Tertiary `#B2DFDB`, Neutral `#F5F7F7`
- **Font:** Manrope (Regular 400, Medium 500, SemiBold 600, Bold 700, ExtraBold 800)
- **All design tokens** are in `constants/theme.ts` — always import from there, never hardcode values
- **Button variants:** Primary (filled), Secondary (outlined), Inverted (dark), Outlined (border only)

## Coding Conventions

### General
- TypeScript strict mode — no `any`, no `// @ts-ignore`
- Use `const` by default, `let` only when reassignment is needed
- Functional components only — no class components
- Use named exports for components, default exports only for screen files (`app/*.tsx`)

### Styling
- `StyleSheet.create()` for all styles — no inline style objects
- Import colors, fonts, spacing from `@/constants/theme` — never hardcode
- Use `useSafeAreaInsets()` for safe area handling
- Use `Pressable` over `TouchableOpacity` — it's the modern RN standard

### i18n
- All user-facing text MUST use `t()` from `useTranslation()` — never hardcode strings
- Translation keys: nested by feature (`home.title`, `audio.startListening`)
- Both `en.json` and `vi.json` must be updated together — never add a key to one without the other
- Type-safe translations via `i18next.d.ts` at project root

### Navigation
- Use `useRouter()` from `expo-router` for navigation
- `router.push()` for forward navigation, `router.back()` for back
- `router.replace()` when you don't want back navigation (e.g., Done → Audio replay)

### Platform-specific code
- Use `Platform.OS === "android"` / `Platform.OS === "ios"` for branching
- For platform-specific components, use `Platform.select()` or conditional rendering
- Android overlay = native Kotlin service (not React Native)
- iOS overlay = expo-sensors + react-native-reanimated (in-app only)

### Hooks
- Custom hooks in `hooks/` — prefix with `use`
- `useMotionCues.ts` — overlay state management
- `useAudioSession.ts` — audio playback state

### Error Handling
- Wrap AsyncStorage calls in try/catch
- Deep links (`Linking.openURL`) need try/catch with fallback
- AudioContext on iOS needs user gesture — UX must enforce tap before play

## Key Technical Details

### Audio 100 Hz
- `expo-audio` plays a pre-rendered 100 Hz sine WAV (`assets/audio/100hz.wav`)
- Duration: exactly 60 seconds (fade in/out baked into the file to avoid clicks)
- `setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false })`
- Session timing tracked in JS (`useAudioSession`); on completion → `done` screen
- iOS requires a user tap gesture to start playback (UX enforces tap before play)

### Motion Cues Overlay (Android)
- Native Foreground Service (`MotionCuesService.kt`)
- `TYPE_APPLICATION_OVERLAY` via WindowManager
- `LINEAR_ACCELERATION` sensor at ~60fps
- Dot offset: `shiftX = (-accelX * sensitivity).coerceIn(-max, max)`
- Permission: `SYSTEM_ALERT_WINDOW` — requires Settings page manual grant
- Notification: `IMPORTANCE_MIN` (required by Android for foreground services)

### Motion Cues Overlay (iOS)
- In-app only (Apple blocks third-party system overlays)
- expo-sensors Accelerometer + react-native-reanimated worklets
- Guide to enable Apple's built-in Vehicle Motion Cues

## Commands

```bash
pnpm start          # Start dev server
pnpm run android    # Run on Android
pnpm run ios        # Run on iOS
pnpm run prebuild   # Generate android/ and ios/ native projects
pnpm run lint       # Run linter
```

## Don'ts
- Don't use `expo-av` for audio — the project standardizes on `expo-audio`; the 100 Hz tone ships as a pre-rendered WAV asset
- Don't use background audio mode — the 100 Hz session is only 60 seconds
- Don't use private iOS APIs for system overlay — instant App Store rejection
- Don't claim "cure" or "treat" motion sickness — use "may help reduce symptoms"
- Don't hardcode colors/fonts/spacing — always use theme tokens
- Don't hardcode user-facing text — always use i18n `t()` function
