# Configurable Overlay Dots — Design

**Date:** 2026-07-02
**Status:** Approved design, pending implementation plan
**Scope:** Android motion-cues overlay only (iOS in-app overlay does not exist yet — separate future task)

## Problem

The Settings screen exposes Dot Size and Sensitivity segmented controls, but these
values never reach the native Android overlay. `MotionCuesService.kt` renders with
hardcoded constants (`DOT_SIZE_DP = 12f`, `SENSITIVITY = 6f`, fixed 8-dot layout) and
a hardcoded window `alpha = 0.85f`. The controls are therefore decorative.

Goals:
1. Make Dot Size and Sensitivity actually drive the overlay.
2. Add a new **Dot Density** control (dot count).
3. Add a **Dot Opacity** control (already typed as `dotOpacity`, no UI, unused).
4. Changes apply live: if the overlay is running, it restarts with the new config.

## Decisions (from brainstorming)

- **Density = count presets**, peripheral frame: Low = 4, Medium = 8, High = 12.
- **Wire all of size, density, sensitivity** (and now opacity) through JS → native.
- **Opacity = continuous slider** (0.2–1.0), persisted on slide-complete to avoid a
  restart storm during drag.
- **Auto-restart** the overlay when any of these settings change while it is active.
- **Android-only.** The shared Settings screen stays as-is; iOS overlay is out of scope.
- **Out of scope:** iOS overlay rendering; changing the notification; changing sensor rate.

## Single source of truth

`constants/config.ts` owns all numeric mappings. Native holds only the curated dot
*position* lists (a rendering concern) plus its base sensitivity constant. JS resolves
settings → concrete values and passes them across the bridge.

## Components

### 1. `constants/config.ts`

Extend `MOTION_CUES_CONFIG`:

```ts
dotDensities: { low: 4, medium: 8, high: 12 },
defaultDotDensity: "medium",
opacityRange: { min: 0.2, max: 1.0 },   // slider bounds
// existing: dotSizes {small:8, medium:12, large:16}, sensitivityMultipliers {0.5,1.0,1.5},
// defaultOpacity 0.6, maxShift 30
```

Add exported type:

```ts
export type DotDensity = keyof typeof MOTION_CUES_CONFIG.dotDensities;
```

Base sensitivity stays a native constant (`BASE_SENSITIVITY = 6f`); JS passes the
multiplier from `sensitivityMultipliers`.

### 2. `hooks/useSettings.tsx`

- Add `dotDensity: DotDensity` to the `Settings` type.
- Add to `DEFAULT_SETTINGS`: `dotDensity: MOTION_CUES_CONFIG.defaultDotDensity`.
- `dotOpacity` already exists (default `0.6`) — no type change, now consumed.
- Persistence and merge logic unchanged (spread over defaults handles the new key for
  users with older stored settings).

### 3. `app/(tabs)/settings.tsx`

- New **Dot Density** segmented control (Low/Med/High), same pattern/styles as Dot Size.
  Options map to `low|medium|high`; label keys `settings.densityLow|Medium|High`.
- New **Dot Opacity** slider section:
  - `@react-native-community/slider`, `min = 0.2`, `max = 1.0`, `step = 0.05`.
  - Local state mirrors the value during drag (`onValueChange` → local state only, for
    a live percentage label).
  - `onSlidingComplete` → `updateSettings({ dotOpacity })` (single persist → single
    restart). Haptic `select()` on complete.
  - Label shows current percentage, e.g. `Opacity — 60%`.
- Order: Dot Size → Dot Density → Dot Opacity → Sensitivity → Language → About.

### 4. `modules/MotionCuesModule.ts`

Change the bridge signature to carry config:

```ts
type OverlayConfig = {
  dotSizeDp: number;      // resolved px-dp size (8|12|16)
  sensitivity: number;    // multiplier (0.5|1.0|1.5)
  dotCount: number;       // 4|8|12
  opacity: number;        // 0.2..1.0
};
startOverlay(config: OverlayConfig): void;   // was: startOverlay(): void
```

The JS `startOverlay` forwards the four numbers to the native method. Guard rails
(non-android / missing module) unchanged.

### 5. `MotionCuesModule.kt`

```kotlin
@ReactMethod
fun startOverlay(dotSizeDp: Double, sensitivity: Double, dotCount: Int, opacity: Double) {
    val intent = Intent(reactContext, MotionCuesService::class.java).apply {
        putExtra(MotionCuesService.EXTRA_DOT_SIZE_DP, dotSizeDp.toFloat())
        putExtra(MotionCuesService.EXTRA_SENSITIVITY, sensitivity.toFloat())
        putExtra(MotionCuesService.EXTRA_DOT_COUNT, dotCount)
        putExtra(MotionCuesService.EXTRA_OPACITY, opacity.toFloat())
    }
    // startForegroundService / startService as before
}
```

`stopOverlay` unchanged.

### 6. `MotionCuesService.kt`

- Define `EXTRA_*` keys + sane fallbacks (12dp, 1.0, 8, 0.85) in the companion.
- `onStartCommand` reads extras into instance fields:
  `dotSizeDp`, `sensitivityMultiplier`, `dotCount`, `opacity`.
  Because start is called again on restart, `onStartCommand` must **rebuild** the
  overlay: if a `dotsView` already exists, remove it before `setupOverlay()` so new
  size/count/opacity take effect. (Service is `START_STICKY`; a fresh start intent
  re-runs `onStartCommand`.)
- `setupOverlay()` sets `params.alpha = opacity` (clamped ≥ 0.2) instead of the constant.
- `DotsView` constructor takes `dotSizeDp: Float` and `dotCount: Int`:
  - `radiusPx = dotSizeDp * density / 2f`.
  - Positions chosen by count from curated lists (see below), fallback to the 8-list.
- `onSensorChanged`: `shift = accel * BASE_SENSITIVITY * sensitivityMultiplier`,
  coerced to `±MAX_SHIFT`. `BASE_SENSITIVITY = 6f`, `MAX_SHIFT = 40f` stay native.

Curated peripheral position lists (ratios of width/height):

```
LOW (4):    (0.25,0.04) (0.75,0.04) (0.25,0.96) (0.75,0.96)
MEDIUM (8): current list (4 corners-ish + 4 edge mids)
HIGH (12):  MEDIUM + (0.50,0.04) (0.50,0.96) (0.04,0.50) (0.96,0.50)
```

### 7. `hooks/useMotionCues.ts`

- Consume `useSettings()`.
- Add a resolver: settings → `OverlayConfig`
  (`dotSizeDp = dotSizes[dotSize]`, `sensitivity = sensitivityMultipliers[sensitivity]`,
  `dotCount = dotDensities[dotDensity]`, `opacity = dotOpacity`).
- `startOverlay` passes the resolved config to the module.
- **Auto-restart effect:** when `isActive` is true and any of
  `dotSize | dotDensity | sensitivity | dotOpacity` change, call `startOverlay` again.
  Guard with `Platform.OS === "android"`. The motion-cues tab stays mounted after first
  visit (React Navigation default), so the hook instance that owns `isActive` also
  subscribes to the shared settings context — the effect fires cross-screen.

### 8. i18n — `i18n/locales/en.json` + `vi.json` (both, together)

Add under `settings`:

```
dotDensity, densityLow, densityMedium, densityHigh, dotOpacity
```

EN: "Dot Density" / "Low" / "Medium" / "High" / "Dot Opacity".
VI: "Mật độ chấm" / "Thấp" / "Vừa" / "Cao" / "Độ mờ chấm".

### 9. Dependency

`npx expo install @react-native-community/slider` (not currently installed). Requires a
native rebuild (`npx expo prebuild` already done for android/; run `pnpm run android`).

## Data flow

```
Settings UI ──updateSettings──▶ SettingsContext (AsyncStorage)
                                      │
              useMotionCues (motion-cues tab) reads context
                                      │ resolve
                            OverlayConfig {dotSizeDp,sensitivity,dotCount,opacity}
                                      │ startOverlay(cfg)
                       MotionCuesModule.ts ─▶ MotionCuesModule.kt ─Intent extras─▶ Service
                                      │
                          onStartCommand rebuild ─▶ DotsView(size,count) + params.alpha=opacity
```

## Error handling

- Bridge guards (non-android, missing native module) already present; unchanged.
- Native extras always have fallbacks → a start without extras still renders.
- Restart path wraps `removeView` in try/catch (permission may be revoked mid-session),
  matching existing `onDestroy` handling.
- Slider clamps to config range; native re-clamps `alpha ≥ 0.2` so dots never vanish.

## Testing

- **Unit (JS):** config resolver maps each settings combo → correct `OverlayConfig`
  (size dp, multiplier, count, opacity). Density/size/opacity defaults present after
  merge of legacy stored settings (missing keys).
- **Manual (Android device/emulator):**
  - Each density renders 4 / 8 / 12 dots.
  - Each size visibly changes radius.
  - Opacity slider changes dot visibility; released value persists across app restart.
  - Sensitivity changes shift magnitude under motion.
  - Change a setting while overlay active → overlay restarts with new look, no crash.
- **Regression:** overlay still starts/stops; no per-frame WindowManager traffic added
  (restart is only on setting change, not per sensor event).

## Non-goals / YAGNI

- No iOS overlay renderer.
- No per-dot color config, no shape config, no animation curve config.
- No live streaming of config to a running service (restart is simpler and adequate).
