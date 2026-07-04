# Configurable Overlay Dots Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Android motion-cues overlay honor user-configurable dot size, density (count), sensitivity, and opacity from the Settings screen, applying live when the overlay is running.

**Architecture:** `constants/config.ts` becomes the single source of numeric mappings and exposes a pure `resolveOverlayConfig(settings)` → `OverlayConfig`. The JS bridge forwards that config to native as Intent extras; `MotionCuesService.kt` rebuilds its overlay window (size, dot-count layout, window alpha) and sensor gain from the extras on every start. `useMotionCues` restarts the running service whenever a relevant setting changes.

**Tech Stack:** Expo SDK 54 (bare), TypeScript, React Native 0.81, Kotlin Android foreground service, `@react-native-community/slider`, `jest-expo` (new, for the one pure unit test).

## Global Constraints

- Package manager: **pnpm**. Expo deps via `npx expo install <pkg>`.
- TypeScript strict — no `any`, no `// @ts-ignore`.
- Styling via `StyleSheet.create()`; import colors/fonts/spacing from `@/constants/theme` — never hardcode.
- All user-facing text via `t()`; add keys to **both** `i18n/locales/en.json` and `vi.json` together.
- `Pressable` over `TouchableOpacity`. Named exports for components; default export only for `app/*` screens.
- Android-only feature. iOS overlay is out of scope.
- Density presets: Low = 4, Medium = 8, High = 12 dots (peripheral frame).
- Opacity slider range 0.2–1.0, step 0.05; persist on slide-complete only.
- Native base constants stay native: `BASE_SENSITIVITY = 6f`, `MAX_SHIFT = 40f`.

---

## File Structure

- `constants/config.ts` — extend config maps; add `DotDensity`, `OverlayConfig`, pure `resolveOverlayConfig`.
- `__tests__/config.test.ts` — new; unit tests for `resolveOverlayConfig`.
- `package.json` — add `test` script + `jest` preset + devDeps.
- `hooks/useSettings.tsx` — add `dotDensity` to `Settings` + default.
- `app/(tabs)/settings.tsx` — add Density segmented control + Opacity slider; renumber entrance stagger.
- `modules/MotionCuesModule.ts` — `startOverlay(config: OverlayConfig)`.
- `hooks/useMotionCues.ts` — consume settings, pass config, auto-restart effect.
- `android/.../MotionCuesModule.kt` — `startOverlay(...)` with 4 params → Intent extras.
- `android/.../MotionCuesService.kt` — read extras, rebuild overlay + sensor gain, variable dot layout, window alpha.
- `i18n/locales/en.json`, `i18n/locales/vi.json` — density keys.

---

### Task 1: Config maps + pure resolver (TDD)

**Files:**
- Modify: `constants/config.ts`
- Modify: `package.json`
- Create: `__tests__/config.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `MOTION_CUES_CONFIG.dotDensities: { low:4; medium:8; high:12 }`, `.defaultDotDensity: "medium"`, `.opacityRange: { min:0.2; max:1.0 }`
  - `type DotDensity = keyof typeof MOTION_CUES_CONFIG.dotDensities`
  - `type OverlayConfig = { dotSizeDp: number; sensitivity: number; dotCount: number; opacity: number }`
  - `function resolveOverlayConfig(s: { dotSize: DotSize; dotDensity: DotDensity; sensitivity: Sensitivity; dotOpacity: number }): OverlayConfig`

- [ ] **Step 1: Install jest tooling**

```bash
npx expo install jest-expo
pnpm add -D jest @types/jest
```

- [ ] **Step 2: Add test script + jest preset to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "jest"
```

And add a top-level `"jest"` block (sibling of `"scripts"`):

```json
"jest": {
  "preset": "jest-expo",
  "testMatchPatterns": ["**/__tests__/**/*.test.ts"]
}
```

If `jest-expo` rejects `testMatchPatterns`, use the standard key instead:

```json
"jest": {
  "preset": "jest-expo",
  "testMatch": ["**/__tests__/**/*.test.ts"]
}
```

- [ ] **Step 3: Write the failing test**

Create `__tests__/config.test.ts`:

```ts
import { resolveOverlayConfig, MOTION_CUES_CONFIG } from "@/constants/config";

describe("resolveOverlayConfig", () => {
  it("maps medium/medium/medium defaults to concrete values", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "medium",
        dotDensity: "medium",
        sensitivity: "medium",
        dotOpacity: 0.6,
      })
    ).toEqual({ dotSizeDp: 12, sensitivity: 1.0, dotCount: 8, opacity: 0.6 });
  });

  it("maps small/low/low with min opacity", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "small",
        dotDensity: "low",
        sensitivity: "low",
        dotOpacity: 0.2,
      })
    ).toEqual({ dotSizeDp: 8, sensitivity: 0.5, dotCount: 4, opacity: 0.2 });
  });

  it("maps large/high/high with max opacity", () => {
    expect(
      resolveOverlayConfig({
        dotSize: "large",
        dotDensity: "high",
        sensitivity: "high",
        dotOpacity: 1.0,
      })
    ).toEqual({ dotSizeDp: 16, sensitivity: 1.5, dotCount: 12, opacity: 1.0 });
  });

  it("clamps opacity into the configured range", () => {
    const low = resolveOverlayConfig({
      dotSize: "medium", dotDensity: "medium", sensitivity: "medium", dotOpacity: 0.05,
    });
    const high = resolveOverlayConfig({
      dotSize: "medium", dotDensity: "medium", sensitivity: "medium", dotOpacity: 5,
    });
    expect(low.opacity).toBe(MOTION_CUES_CONFIG.opacityRange.min);
    expect(high.opacity).toBe(MOTION_CUES_CONFIG.opacityRange.max);
  });
});
```

- [ ] **Step 4: Run the test, verify it fails**

Run: `pnpm test`
Expected: FAIL — `resolveOverlayConfig` is not exported / `dotDensities` undefined.

- [ ] **Step 5: Extend config + implement resolver**

In `constants/config.ts`, replace the `MOTION_CUES_CONFIG` object and trailing type exports with:

```ts
export const MOTION_CUES_CONFIG = {
  dotCount: 8,
  defaultDotSize: "medium" as const,
  defaultDotDensity: "medium" as const,
  defaultOpacity: 0.6,
  defaultSensitivity: "medium" as const,
  sensorUpdateInterval: 16, // ~60fps
  maxShift: 30,
  opacityRange: { min: 0.2, max: 1.0 },
  dotSizes: {
    small: 8,
    medium: 12,
    large: 16,
  },
  dotDensities: {
    low: 4,
    medium: 8,
    high: 12,
  },
  sensitivityMultipliers: {
    low: 0.5,
    medium: 1.0,
    high: 1.5,
  },
} as const;

export type DotSize = keyof typeof MOTION_CUES_CONFIG.dotSizes;
export type DotDensity = keyof typeof MOTION_CUES_CONFIG.dotDensities;
export type Sensitivity = keyof typeof MOTION_CUES_CONFIG.sensitivityMultipliers;

export type OverlayConfig = {
  dotSizeDp: number;
  sensitivity: number;
  dotCount: number;
  opacity: number;
};

export function resolveOverlayConfig(s: {
  dotSize: DotSize;
  dotDensity: DotDensity;
  sensitivity: Sensitivity;
  dotOpacity: number;
}): OverlayConfig {
  const { min, max } = MOTION_CUES_CONFIG.opacityRange;
  return {
    dotSizeDp: MOTION_CUES_CONFIG.dotSizes[s.dotSize],
    sensitivity: MOTION_CUES_CONFIG.sensitivityMultipliers[s.sensitivity],
    dotCount: MOTION_CUES_CONFIG.dotDensities[s.dotDensity],
    opacity: Math.min(max, Math.max(min, s.dotOpacity)),
  };
}
```

Leave `AUDIO_CONFIG` and `APP_CONFIG` unchanged.

- [ ] **Step 6: Run the test, verify it passes**

Run: `pnpm test`
Expected: PASS — 4 tests green.

- [ ] **Step 7: Commit**

```bash
git add constants/config.ts __tests__/config.test.ts package.json pnpm-lock.yaml
git commit -m "feat(motion-cues): add dot density/opacity config + pure resolver"
```

---

### Task 2: Settings type + density i18n keys + slider dep

**Files:**
- Modify: `hooks/useSettings.tsx`
- Modify: `i18n/locales/en.json`
- Modify: `i18n/locales/vi.json`
- Install: `@react-native-community/slider`

**Interfaces:**
- Consumes: `DotDensity`, `MOTION_CUES_CONFIG.defaultDotDensity` (Task 1).
- Produces: `Settings.dotDensity: DotDensity`; i18n keys `settings.dotDensity|densityLow|densityMedium|densityHigh`.

- [ ] **Step 1: Install the slider (native dep)**

```bash
npx expo install @react-native-community/slider
```

- [ ] **Step 2: Add `dotDensity` to Settings type + default**

In `hooks/useSettings.tsx`:

Change the import line:

```ts
import type { DotSize, DotDensity, Sensitivity } from "@/constants/config";
```

Change the `Settings` type to:

```ts
export type Settings = {
  dotSize: DotSize;
  dotDensity: DotDensity;
  dotOpacity: number;
  sensitivity: Sensitivity;
};
```

Change `DEFAULT_SETTINGS` to:

```ts
const DEFAULT_SETTINGS: Settings = {
  dotSize: MOTION_CUES_CONFIG.defaultDotSize,
  dotDensity: MOTION_CUES_CONFIG.defaultDotDensity,
  dotOpacity: MOTION_CUES_CONFIG.defaultOpacity,
  sensitivity: MOTION_CUES_CONFIG.defaultSensitivity,
};
```

(The existing `{ ...DEFAULT_SETTINGS, ...parsed }` merge already backfills `dotDensity` for users with older stored settings — no migration needed.)

- [ ] **Step 3: Add density keys to en.json**

In `i18n/locales/en.json`, inside `"settings"`, immediately after the `"dotSizeLarge": "Large",` line, add:

```json
    "dotDensity": "Dot Density",
    "densityLow": "Low",
    "densityMedium": "Medium",
    "densityHigh": "High",
```

- [ ] **Step 4: Add density keys to vi.json**

In `i18n/locales/vi.json`, inside `"settings"`, immediately after the `"dotSizeLarge": "Lớn",` line, add:

```json
    "dotDensity": "Mật độ chấm",
    "densityLow": "Thấp",
    "densityMedium": "Vừa",
    "densityHigh": "Cao",
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: PASS (no errors). If `i18next.d.ts` surfaces a missing-key error, it confirms the keys were added to both files — re-check spelling matches Steps 3–4.

- [ ] **Step 6: Commit**

```bash
git add hooks/useSettings.tsx i18n/locales/en.json i18n/locales/vi.json package.json pnpm-lock.yaml
git commit -m "feat(settings): add dotDensity setting + i18n + slider dep"
```

---

### Task 3: Settings UI — density control + opacity slider

**Files:**
- Modify: `app/(tabs)/settings.tsx`

**Interfaces:**
- Consumes: `Settings.dotDensity`, `updateSettings` (Task 2); `MOTION_CUES_CONFIG.opacityRange` (Task 1); density i18n keys (Task 2).
- Produces: UI only.

- [ ] **Step 1: Add imports**

In `app/(tabs)/settings.tsx`:

Add to the React import (currently the file imports from `"react"` implicitly? it does not — add it):

```ts
import { useEffect, useState } from "react";
```

Add the slider + config imports near the existing imports:

```ts
import Slider from "@react-native-community/slider";
import { APP_CONFIG, MOTION_CUES_CONFIG } from "@/constants/config";
```

(Replace the existing `import { APP_CONFIG } from "@/constants/config";` line with the combined one above.)

- [ ] **Step 2: Add density options + opacity draft state**

Inside `SettingsScreen`, after the existing `dotSizeOptions` array, add:

```ts
  const dotDensityOptions = [
    { key: "settings.densityLow" as const, value: "low" as const },
    { key: "settings.densityMedium" as const, value: "medium" as const },
    { key: "settings.densityHigh" as const, value: "high" as const },
  ];
```

After the `useTabBarClearance()` / entrance hooks block, add local draft state for the slider so dragging updates the label live without persisting each frame:

```ts
  const [opacityDraft, setOpacityDraft] = useState(settings.dotOpacity);
  useEffect(() => {
    setOpacityDraft(settings.dotOpacity);
  }, [settings.dotOpacity]);
```

- [ ] **Step 3: Renumber entrance stagger for the two new sections**

Replace the entrance-hook block:

```ts
  const headerEntrance = useScreenEntrance(0);
  const section1Entrance = useStaggeredEntrance(1);
  const section2Entrance = useStaggeredEntrance(2);
  const section3Entrance = useStaggeredEntrance(3);
  const aboutEntrance = useStaggeredEntrance(4);
```

with:

```ts
  const headerEntrance = useScreenEntrance(0);
  const sizeEntrance = useStaggeredEntrance(1);
  const densityEntrance = useStaggeredEntrance(2);
  const opacityEntrance = useStaggeredEntrance(3);
  const sensitivityEntrance = useStaggeredEntrance(4);
  const languageEntrance = useStaggeredEntrance(5);
  const aboutEntrance = useStaggeredEntrance(6);
```

Then update the JSX section wrappers:
- Dot Size section: `section1Entrance` → `sizeEntrance`
- Sensitivity section: `section2Entrance` → `sensitivityEntrance`
- Language section: `section3Entrance` → `languageEntrance`

- [ ] **Step 4: Insert Density segmented control**

Directly after the closing `</Animated.View>` of the Dot Size section, insert:

```tsx
        {/* Dot Density */}
        <Animated.View style={[styles.section, densityEntrance]}>
          <Text style={styles.sectionLabel}>{t("settings.dotDensity")}</Text>
          <View style={styles.segmented}>
            {dotDensityOptions.map(({ key, value }) => {
              const active = settings.dotDensity === value;
              return (
                <Pressable
                  key={value}
                  onPress={() =>
                    handleSegmentPress(() =>
                      updateSettings({ dotDensity: value })
                    )
                  }
                  style={[styles.segment, active && styles.segmentActive]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      active && styles.segmentTextActive,
                    ]}
                  >
                    {t(key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
```

- [ ] **Step 5: Insert Opacity slider**

Directly after the Density section's closing `</Animated.View>`, insert:

```tsx
        {/* Dot Opacity */}
        <Animated.View style={[styles.section, opacityEntrance]}>
          <Text style={styles.sectionLabel}>
            {t("settings.dotOpacity")} — {Math.round(opacityDraft * 100)}%
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={MOTION_CUES_CONFIG.opacityRange.min}
            maximumValue={MOTION_CUES_CONFIG.opacityRange.max}
            step={0.05}
            value={opacityDraft}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.neutralDark}
            thumbTintColor={colors.primary}
            onValueChange={setOpacityDraft}
            onSlidingComplete={(v) => {
              haptics.select();
              updateSettings({ dotOpacity: v });
            }}
          />
        </Animated.View>
```

- [ ] **Step 6: Add slider style**

In the `StyleSheet.create({ ... })` block, add:

```ts
  slider: {
    width: "100%",
    height: 40,
  },
```

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm run lint`
Expected: PASS. (`colors.neutralDark` already exists — used in `motion-cues.tsx` Switch.)

- [ ] **Step 8: Commit**

```bash
git add "app/(tabs)/settings.tsx"
git commit -m "feat(settings): add dot density control and opacity slider UI"
```

---

### Task 4: JS bridge accepts OverlayConfig

**Files:**
- Modify: `modules/MotionCuesModule.ts`

**Interfaces:**
- Consumes: `OverlayConfig` (Task 1).
- Produces: `MotionCuesModule.startOverlay(config: OverlayConfig): void`; native contract `startOverlay(dotSizeDp, sensitivity, dotCount, opacity)`.

- [ ] **Step 1: Update the native module type + import**

In `modules/MotionCuesModule.ts`, add the import at the top:

```ts
import type { OverlayConfig } from "@/constants/config";
```

Change the `startOverlay` entry in the `MotionCuesNativeModule` type from:

```ts
  startOverlay: () => void;
```

to:

```ts
  startOverlay: (
    dotSizeDp: number,
    sensitivity: number,
    dotCount: number,
    opacity: number
  ) => void;
```

- [ ] **Step 2: Update the exported `startOverlay`**

Replace the exported `startOverlay(): void { ... }` method with:

```ts
  startOverlay(config: OverlayConfig): void {
    if (Platform.OS !== "android") return;
    if (!isAvailable || !nativeModule) {
      warnMissing();
      return;
    }
    nativeModule.startOverlay(
      config.dotSizeDp,
      config.sensitivity,
      config.dotCount,
      config.opacity
    );
  },
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: FAIL only in `hooks/useMotionCues.ts` (calls `startOverlay()` with no args). That is fixed in Task 5. `modules/MotionCuesModule.ts` itself must be error-free.

- [ ] **Step 4: Commit**

```bash
git add modules/MotionCuesModule.ts
git commit -m "feat(motion-cues): bridge startOverlay carries OverlayConfig"
```

---

### Task 5: useMotionCues resolves + auto-restarts

**Files:**
- Modify: `hooks/useMotionCues.ts`

**Interfaces:**
- Consumes: `useSettings` (Task 2), `resolveOverlayConfig` (Task 1), `MotionCuesModule.startOverlay(config)` (Task 4).
- Produces: `startOverlay` now uses live settings; running overlay restarts on setting change.

- [ ] **Step 1: Add imports**

In `hooks/useMotionCues.ts`, add:

```ts
import { useSettings } from "@/hooks/useSettings";
import { resolveOverlayConfig } from "@/constants/config";
```

- [ ] **Step 2: Read settings in the hook**

Immediately after the existing `useState` declarations inside `useMotionCues`, add:

```ts
  const { settings } = useSettings();
```

- [ ] **Step 3: Pass resolved config on start**

Replace the existing `startOverlay` callback with:

```ts
  // Android: start foreground service + overlay with current settings
  const startOverlay = useCallback(async () => {
    if (Platform.OS !== "android") return;
    const status = await MotionCuesModule.checkPermission();
    if (status !== "granted") {
      await MotionCuesModule.requestPermission();
      return;
    }
    MotionCuesModule.startOverlay(resolveOverlayConfig(settings));
    setIsActive(true);
  }, [settings]);
```

- [ ] **Step 4: Add the auto-restart effect**

After the `startOverlay`/`stopOverlay` callbacks, add:

```ts
  // Restart the running overlay when a visual setting changes so the new
  // size/density/opacity/sensitivity take effect immediately. Excludes
  // `isActive` from deps so activation itself doesn't double-start.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!isActive) return;
    MotionCuesModule.startOverlay(resolveOverlayConfig(settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.dotSize,
    settings.dotDensity,
    settings.sensitivity,
    settings.dotOpacity,
  ]);
```

- [ ] **Step 5: Typecheck + lint**

Run: `npx tsc --noEmit && pnpm run lint`
Expected: PASS (the Task 4 error is now resolved).

- [ ] **Step 6: Commit**

```bash
git add hooks/useMotionCues.ts
git commit -m "feat(motion-cues): drive overlay from settings + live restart"
```

---

### Task 6: Native service honors config

**Files:**
- Modify: `android/app/src/main/java/com/serene/app/MotionCuesModule.kt`
- Modify: `android/app/src/main/java/com/serene/app/MotionCuesService.kt`

**Interfaces:**
- Consumes: native call `startOverlay(dotSizeDp: Double, sensitivity: Double, dotCount: Int, opacity: Double)` (Task 4 contract).
- Produces: overlay rendered with the passed size/count/opacity and sensor gain.

- [ ] **Step 1: Update the Kotlin bridge method**

In `MotionCuesModule.kt`, replace the `startOverlay()` method with:

```kotlin
    @ReactMethod
    fun startOverlay(
        dotSizeDp: Double,
        sensitivity: Double,
        dotCount: Int,
        opacity: Double
    ) {
        val intent = Intent(reactContext, MotionCuesService::class.java).apply {
            putExtra(MotionCuesService.EXTRA_DOT_SIZE_DP, dotSizeDp.toFloat())
            putExtra(MotionCuesService.EXTRA_SENSITIVITY, sensitivity.toFloat())
            putExtra(MotionCuesService.EXTRA_DOT_COUNT, dotCount)
            putExtra(MotionCuesService.EXTRA_OPACITY, opacity.toFloat())
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            reactContext.startForegroundService(intent)
        } else {
            reactContext.startService(intent)
        }
    }
```

Leave `stopOverlay`, permission methods, and listener no-ops unchanged.

- [ ] **Step 2: Rewrite MotionCuesService.kt**

Replace the entire contents of `MotionCuesService.kt` with:

```kotlin
package com.serene.app

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.PixelFormat
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.view.View
import android.view.WindowManager
import androidx.core.app.NotificationCompat

class MotionCuesService : Service(), SensorEventListener {

    private lateinit var windowManager: WindowManager
    private lateinit var sensorManager: SensorManager
    private var linearAccelerationSensor: Sensor? = null
    private var dotsView: DotsView? = null

    // Config, refreshed on every onStartCommand.
    private var dotSizeDp = DEFAULT_DOT_SIZE_DP
    private var sensitivityMultiplier = DEFAULT_SENSITIVITY_MULT
    private var dotCount = DEFAULT_DOT_COUNT
    private var opacity = DEFAULT_OPACITY

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        sensorManager = getSystemService(SENSOR_SERVICE) as SensorManager
        linearAccelerationSensor =
            sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIF_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(NOTIF_ID, notification)
        }

        // Refresh config from the (re)start intent. Fallbacks keep a bare
        // start (e.g. START_STICKY relaunch with null intent) rendering.
        dotSizeDp = intent?.getFloatExtra(EXTRA_DOT_SIZE_DP, dotSizeDp) ?: dotSizeDp
        sensitivityMultiplier =
            intent?.getFloatExtra(EXTRA_SENSITIVITY, sensitivityMultiplier)
                ?: sensitivityMultiplier
        dotCount = intent?.getIntExtra(EXTRA_DOT_COUNT, dotCount) ?: dotCount
        opacity = intent?.getFloatExtra(EXTRA_OPACITY, opacity) ?: opacity

        // Rebuild so a restart (settings change) applies the new look.
        teardown()
        setupOverlay()
        startSensor()

        return START_STICKY
    }

    private fun setupOverlay() {
        val positions = positionsFor(dotCount)
        val view = DotsView(this, dotSizeDp, positions)

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            // User-configurable window alpha; floor keeps dots visible.
            alpha = opacity.coerceIn(MIN_OPACITY, 1f)
        }

        try {
            windowManager.addView(view, params)
            dotsView = view
        } catch (_: Exception) {
            // Permission may have been revoked or device doesn't support it
        }
    }

    private fun startSensor() {
        linearAccelerationSensor?.let { sensor ->
            sensorManager.registerListener(
                this,
                sensor,
                SensorManager.SENSOR_DELAY_GAME
            )
        }
    }

    private fun teardown() {
        try {
            sensorManager.unregisterListener(this)
        } catch (_: Exception) {
            // Ignore
        }
        dotsView?.let { view ->
            try {
                windowManager.removeView(view)
            } catch (_: Exception) {
                // Ignore
            }
        }
        dotsView = null
    }

    override fun onSensorChanged(event: SensorEvent) {
        if (event.sensor.type != Sensor.TYPE_LINEAR_ACCELERATION) return
        val view = dotsView ?: return

        val accelX = event.values[0]
        val accelY = event.values[1]

        val gain = BASE_SENSITIVITY * sensitivityMultiplier
        // Negate X: car turns right → dots shift left (matches Apple)
        val shiftX = (-accelX * gain).coerceIn(-MAX_SHIFT, MAX_SHIFT)
        // Positive Y: car accelerates → dots shift down
        val shiftY = (accelY * gain).coerceIn(-MAX_SHIFT, MAX_SHIFT)

        view.updateShift(shiftX, shiftY)
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {
        // No-op
    }

    private fun buildNotification(): Notification {
        val notificationManager = getSystemService(NotificationManager::class.java)
        if (notificationManager.getNotificationChannel(CHANNEL_ID) == null) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Motion Cues",
                NotificationManager.IMPORTANCE_MIN
            ).apply {
                description = "Shows when motion cues overlay is active"
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(channel)
        }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Serene — Motion Cues active")
            .setContentText("Helping reduce motion sickness")
            .setSmallIcon(android.R.drawable.ic_menu_info_details)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        teardown()
    }

    /**
     * Draws all dots in a single overlay window. Sensor updates only mutate
     * the shift fields and request a vsync-throttled repaint, so the heavy
     * per-frame WindowManager.updateViewLayout path is gone entirely.
     */
    @SuppressLint("ViewConstructor")
    private class DotsView(
        context: Context,
        dotSizeDp: Float,
        private val positions: List<Pair<Float, Float>>
    ) : View(context) {

        private val density = resources.displayMetrics.density
        private val radiusPx = dotSizeDp * density / 2f

        private val fillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#E6FFFFFF")
            style = Paint.Style.FILL
        }
        private val strokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#33000000")
            style = Paint.Style.STROKE
            strokeWidth = density // 1dp
        }

        private var shiftX = 0f
        private var shiftY = 0f

        fun updateShift(x: Float, y: Float) {
            shiftX = x
            shiftY = y
            postInvalidateOnAnimation()
        }

        override fun onDraw(canvas: Canvas) {
            val w = width.toFloat()
            val h = height.toFloat()
            for ((xRatio, yRatio) in positions) {
                val cx = w * xRatio + shiftX
                val cy = h * yRatio + shiftY
                canvas.drawCircle(cx, cy, radiusPx, fillPaint)
                canvas.drawCircle(cx, cy, radiusPx, strokePaint)
            }
        }
    }

    companion object {
        const val NOTIF_ID = 1001
        const val CHANNEL_ID = "serene_motion_cues"

        const val EXTRA_DOT_SIZE_DP = "dotSizeDp"
        const val EXTRA_SENSITIVITY = "sensitivity"
        const val EXTRA_DOT_COUNT = "dotCount"
        const val EXTRA_OPACITY = "opacity"

        private const val DEFAULT_DOT_SIZE_DP = 12f
        private const val DEFAULT_SENSITIVITY_MULT = 1f
        private const val DEFAULT_DOT_COUNT = 8
        private const val DEFAULT_OPACITY = 0.85f
        private const val MIN_OPACITY = 0.2f

        private const val BASE_SENSITIVITY = 6f
        private const val MAX_SHIFT = 40f

        private val LOW_POSITIONS = listOf(
            0.25f to 0.04f,
            0.75f to 0.04f,
            0.25f to 0.96f,
            0.75f to 0.96f
        )

        private val MEDIUM_POSITIONS = listOf(
            0.25f to 0.04f,   // top-left
            0.75f to 0.04f,   // top-right
            0.04f to 0.25f,   // left-top
            0.04f to 0.75f,   // left-bottom
            0.96f to 0.25f,   // right-top
            0.96f to 0.75f,   // right-bottom
            0.25f to 0.96f,   // bottom-left
            0.75f to 0.96f    // bottom-right
        )

        private val HIGH_POSITIONS = MEDIUM_POSITIONS + listOf(
            0.50f to 0.04f,   // top-mid
            0.50f to 0.96f,   // bottom-mid
            0.04f to 0.50f,   // left-mid
            0.96f to 0.50f    // right-mid
        )

        private fun positionsFor(count: Int): List<Pair<Float, Float>> =
            when (count) {
                4 -> LOW_POSITIONS
                12 -> HIGH_POSITIONS
                else -> MEDIUM_POSITIONS
            }
    }
}
```

- [ ] **Step 3: Compile the Kotlin**

Run: `cd android && ./gradlew compileDebugKotlin && cd ..`
Expected: `BUILD SUCCESSFUL`. If the native module was not previously built, run `pnpm run prebuild:android` first.

- [ ] **Step 4: Commit**

```bash
git add android/app/src/main/java/com/serene/app/MotionCuesModule.kt android/app/src/main/java/com/serene/app/MotionCuesService.kt
git commit -m "feat(motion-cues): native overlay honors size/density/opacity/sensitivity"
```

---

### Task 7: End-to-end manual verification (Android device/emulator)

**Files:** none (verification only).

**Interfaces:**
- Consumes: all prior tasks.
- Produces: confirmation the feature works on-device.

- [ ] **Step 1: Build + install debug APK**

Run: `pnpm run android`
Expected: app launches on the connected device/emulator.

- [ ] **Step 2: Grant overlay permission + start overlay**

In Motion Cues tab, grant `SYSTEM_ALERT_WINDOW` when prompted, then tap Start. Confirm 8 dots appear in the screen periphery (Medium default).

- [ ] **Step 3: Verify density**

Go to Settings → Dot Density. With overlay active:
- Low → 4 dots (corners only).
- High → 12 dots (corners + edge mids + corner mids).
Expected: dot count changes within ~1s (brief flicker on restart), no crash.

- [ ] **Step 4: Verify size**

Settings → Dot Size: Small vs Large visibly changes dot radius while active.

- [ ] **Step 5: Verify opacity**

Settings → Dot Opacity slider: label shows live percentage while dragging; on release the overlay dots get fainter/stronger. Kill and relaunch the app — confirm the slider restores the persisted value.

- [ ] **Step 6: Verify sensitivity**

Settings → Sensitivity: with the device in motion (or shaking the emulator's virtual sensors), High produces larger dot shift than Low.

- [ ] **Step 7: Verify stop + regression**

Stop overlay → dots disappear. Start again → dots reappear with current settings. Confirm no ANR / no repeated permission prompts.

- [ ] **Step 8: Final full check**

Run: `pnpm test && npx tsc --noEmit && pnpm run lint`
Expected: all PASS.

- [ ] **Step 9: Commit any lint/format fixes if produced**

```bash
git add -A
git commit -m "chore(motion-cues): verification fixes for configurable dots" || echo "nothing to commit"
```

---

## Self-Review

**Spec coverage:**
- Density presets 4/8/12 → Task 1 (config) + Task 3 (UI) + Task 6 (native layout). ✓
- Wire size/density/sensitivity/opacity → Tasks 4–6. ✓
- Opacity slider, persist on complete → Task 3. ✓
- Auto-restart while active → Task 5. ✓
- Android-only, shared settings screen → Tasks 3/5 guard `Platform.OS`. ✓
- i18n both locales → Task 2. ✓
- Single source of truth in config.ts → Task 1 resolver. ✓
- Slider dep install → Task 2. ✓
- Out of scope (iOS, opacity-per-dot color) → untouched. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✓

**Type consistency:** `OverlayConfig { dotSizeDp, sensitivity, dotCount, opacity }` used identically in Tasks 1, 4, 5. Native extras `EXTRA_DOT_SIZE_DP/EXTRA_SENSITIVITY/EXTRA_DOT_COUNT/EXTRA_OPACITY` defined in Task 6 service companion and referenced in Task 6 module. `resolveOverlayConfig` signature matches `Settings` shape from Task 2. ✓
