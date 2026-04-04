# Serene App Design Spec

> Anti-motion-sickness app combining 100 Hz Audio Therapy + Motion Cues Overlay
> Package: `com.serene.app` | Expo bare workflow + TypeScript | Free, non-profit

## Problem

Motion sickness affects ~46% of the global population. Root cause: **sensory conflict** — the brain receives conflicting signals between eyes (seeing a still screen) and inner ear (sensing vehicle motion).

## Solution

Two science-backed approaches:

1. **Audio 100 Hz** — Based on Nagoya University research (Japan), foundation of Samsung Hearapy (2026). Stimulates vestibular system via 100 Hz sine wave for 60 seconds, effects last ~2 hours.
2. **Motion Cues Overlay** — Based on Apple Vehicle Motion Cues (iOS 18). Displays 8 animated dots at screen edges, moving opposite to vehicle acceleration to synchronize vision with body perception.

## Market Position

- **Android**: No built-in Motion Cues (Google Android 17 expected June 2026). Serene fills this gap with a real system overlay — works over TikTok, YouTube, any app.
- **iOS**: Apple has Vehicle Motion Cues (iOS 18) but few users know how to enable it. Serene guides activation + provides supplementary in-app overlay.

---

## Design System

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#4A90A4` | Main actions, active states, key UI |
| Secondary | `#78909C` | Supporting elements, inactive states |
| Tertiary | `#B2DFDB` | Accents, highlights, subtle backgrounds |
| Neutral | `#F5F7F7` | Backgrounds, cards |
| Text Primary | `#1A1A2E` | Main text |
| Text Secondary | `#78909C` | Secondary text |

### Typography
- **Font Family**: Manrope (all weights)
- **Headline**: Manrope Bold, 28-32px
- **Body**: Manrope Regular, 16px
- **Label**: Manrope Medium, 14px

### Button Variants
- **Primary**: Filled with Primary color, white text
- **Secondary**: Outlined with Secondary color border
- **Inverted**: Dark filled background
- **Outlined**: Border only, no fill

### Components
- Search input with icon
- Bottom navigation (Home, Search, Profile icons)
- Labels with edit/action icons
- Action icon buttons (edit, group, tag, delete)

---

## Features

### Feature 1 — Audio Therapy 100 Hz
**Platform:** iOS + Android

- Hidden WebView (0x0px) runs Web Audio API: OscillatorNode type=sine, frequency=100 Hz
- GainNode controls volume, target ~85 dB
- Plays exactly 60 seconds, WebView postMessage('done') back to RN
- User can replay anytime after 2 hours

**Why WebView:** Web Audio API allows precise Hz-level frequency control. RN libraries like expo-av only play audio files, can't generate raw sine waves.

**iOS note:** AudioContext requires user gesture to unlock. UX ensures user taps "Start" before audio plays.

**Not needed:** Background audio, Foreground Service, keep-awake (only 60 seconds).

### Feature 2 — Motion Cues Overlay

#### Android — System Overlay
1. Native Module (`MotionCuesModule.kt`) bridges RN and Android service
2. `MotionCuesService.kt` runs as independent Foreground Service
3. `SensorManager` reads `LINEAR_ACCELERATION` ~60fps
4. `WindowManager.addView()` creates 8 circle Views as `TYPE_APPLICATION_OVERLAY`
5. Each sensor update → calculate opposite-direction offset → `updateViewLayout()` each dot

**Permission:** `SYSTEM_ALERT_WINDOW` requires `Settings.ACTION_MANAGE_OVERLAY_PERMISSION` for manual user grant. AppState listener re-checks on return.

**Notification:** Foreground Service requires ongoing notification. Use `IMPORTANCE_MIN`.

**Native Module methods:** `requestPermission()`, `checkPermission()`, `startOverlay()`, `stopOverlay()`

#### iOS — In-app Overlay + Apple Settings Guide
- **Foreground:** `expo-sensors` Accelerometer + `react-native-reanimated` v3 renders 8 dots on UI thread at 60fps
- **Background:** Dots disabled (iOS blocks third-party system overlays)
- **Guide:** Step-by-step to enable Apple Vehicle Motion Cues: Settings > Accessibility > Motion > Vehicle Motion Cues
- **Deep link:** `Linking.openURL('App-prefs:Accessibility')` with fallback to `app-settings:`

### Motion Cues Onboarding Flow
- If cues not yet enabled: "Start" button leads to demo slides
- **iOS slides:** Guide with real screenshots showing how to navigate to Settings and enable Vehicle Motion Cues
- **Android slides:** Animation demo of dots in action, then permission request flow or manual permission guide, then enable overlay

---

## Screens (5)

### 1. Home Screen
- App name "Serene" + tagline
- "Listen 100 Hz" button → Audio screen
- "Motion Cues" button → Motion Cues screen
- Overlay status badge: On/Off (Android)

### 2. Audio Screen
1. Volume guide: headphone volume instructions
2. "Start" button → unlock AudioContext + start WebView
3. 60-second countdown with animation
4. Auto-navigate to Done screen on completion

### 3. Done Screen
- Completion message
- Reminder: "Effects last ~2 hours"
- "Listen Again" button
- "Enable Motion Cues" button → upsell feature 2

### 4. Motion Cues Screen
**Android UI:** Status (On/Off), Toggle button, Permission warning if not granted, Brief explanation
**iOS UI:** Tab 1: In-app overlay toggle | Tab 2: Apple Vehicle Motion Cues guide + deep link

### 5. Settings Screen
- Dot size: Small / Medium / Large
- Dot opacity: Slider
- Sensitivity: Low / Medium / High
- About: App info, research sources (Nagoya University)
- Version

---

## Technical Stack

### Framework
- Expo bare workflow (access to android/ native code + Expo tooling)
- TypeScript
- Expo Router (file-based navigation)
- pnpm (package manager)

### Dependencies
| Package | Purpose | Platform |
|---------|---------|----------|
| react-native-webview | Audio engine 100 Hz | Both |
| expo-sensors | Accelerometer for iOS overlay | iOS |
| react-native-reanimated | Dots animation (UI thread) | iOS |
| expo-router | Navigation | Both |
| expo-linking | Deep link Accessibility | iOS |
| i18next + react-i18next | Internationalization | Both |
| expo-localization | Device locale detection | Both |

### Android Native (Kotlin)
- `WindowManager` — System overlay rendering
- `SensorManager` — LINEAR_ACCELERATION ~60fps
- `NotificationCompat` — Foreground Service notification
- `ReactContextBaseJavaModule` — RN bridge

### Permissions
**Android Manifest:**
```xml
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE"/>
```
**iOS:** No special permissions needed.

### i18n
- Languages: Vietnamese (vi), English (en)
- Library: i18next + react-i18next + expo-localization
- Auto-detect device locale, fallback to English

---

## File Architecture

```
serene/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout
│   ├── index.tsx                 # Home screen
│   ├── audio.tsx                 # Audio 60s screen
│   ├── done.tsx                  # Done screen
│   ├── motion-cues.tsx           # Motion Cues screen
│   └── settings.tsx              # Settings screen
├── components/
│   ├── AudioEngine.tsx           # Hidden WebView + Web Audio API
│   ├── MotionDotsOverlay.tsx     # iOS in-app dots (Reanimated)
│   ├── CountdownTimer.tsx        # Countdown UI component
│   └── IOSGuide.tsx              # Step-by-step iOS guide
├── modules/
│   └── MotionCuesModule.ts       # JS bridge for Android native
├── android/app/src/main/java/com/serene/app/
│   ├── MotionCuesModule.kt       # Native Module (4 methods)
│   ├── MotionCuesPackage.kt      # Register module
│   └── MotionCuesService.kt      # Foreground Service + WindowManager
├── hooks/
│   ├── useMotionCues.ts          # Overlay state management
│   └── useAudioSession.ts        # Audio state management
├── constants/
│   ├── config.ts                 # Dot count, sensitivity defaults
│   └── theme.ts                  # Colors, typography, spacing
├── i18n/
│   ├── index.ts                  # i18n configuration
│   └── locales/
│       ├── en.json               # English translations
│       └── vi.json               # Vietnamese translations
└── assets/                       # Icons, images, fonts
```

---

## Dot Offset Formula
```kotlin
val shiftX = (-accelerationX * sensitivity).toInt().coerceIn(-maxShift, maxShift)
val shiftY = (accelerationY * sensitivity).toInt().coerceIn(-maxShift, maxShift)
```
Negative X-axis: car turns right → dots shift left (matches Apple). Positive Y: car accelerates → dots shift down.

---

## Risks & Mitigations

| Risk | Level | Mitigation |
|------|-------|------------|
| Android 14+ ForegroundService restriction | High | Declare `foregroundServiceType="specialUse"`, fill Play Store Declaration Form |
| iOS AudioContext gesture requirement | Medium | UX forces "Start" tap before audio plays |
| App Store health claims | Medium | Use cautious language: "may help reduce symptoms", cite Nagoya University |
| iOS deep link URL scheme changes | Medium | try/catch with fallback to `app-settings:` |
| Play Store SYSTEM_ALERT_WINDOW review | Low | Honest, clear Declaration Form description |

---

*Spec version 1.0 — 2026-04-04*
