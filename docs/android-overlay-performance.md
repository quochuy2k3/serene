# Android Motion Cues Overlay — Performance Fix

How the Android overlay went from "freezes/kills Google & system apps" to smooth 60fps.

## Symptoms

- Starting the overlay caused other apps (Google app, system UI) to be killed or ANR.
- Overlay dot motion was janky.

## Root cause: WindowManager relayout storm

The original `MotionCuesService` created **8 separate overlay windows** (one `View` per dot) and moved them on **every sensor event**:

```kotlin
// onSensorChanged, fired at SENSOR_DELAY_GAME (~200 Hz)
dots.forEachIndexed { index, dot ->
    params.x = ...; params.y = ...
    windowManager.updateViewLayout(dot, params)   // 8× per event
}
```

`WindowManager.updateViewLayout()` is **not** a cheap, local move — it forces `system_server` to relayout the **entire window stack**. At ~200 Hz × 8 dots that is **~1600 global relayouts/second**.

Logcat evidence (every ~5 ms):

```
W WindowManager: App com.serene.app has a system alert window (type = 2038) ... setting alpha to 0,80...
V WindowManager: Relayout Window{...com.serene.app}...
```

That saturated the WindowManager thread and starved every other window — including `com.google.android.googlequicksearchbox` (seen with `allowStartForeground=DENIED`). Hence other apps dying.

## The fix: one window, repaint instead of relayout

Replace 8 moving windows with **one full-screen, non-touchable overlay window** containing a custom `View` that draws all 8 dots in `onDraw`. The sensor only updates two floats and asks for a vsync-throttled repaint — **no per-frame WindowManager calls at all**.

```kotlin
// Sensor handler — cheap: no WindowManager traffic
override fun onSensorChanged(event: SensorEvent) {
    val view = dotsView ?: return
    val shiftX = (-event.values[0] * SENSITIVITY).coerceIn(-MAX_SHIFT, MAX_SHIFT)
    val shiftY = ( event.values[1] * SENSITIVITY).coerceIn(-MAX_SHIFT, MAX_SHIFT)
    view.updateShift(shiftX, shiftY)
}

private class DotsView(context: Context) : View(context) {
    private var shiftX = 0f
    private var shiftY = 0f

    fun updateShift(x: Float, y: Float) {
        shiftX = x; shiftY = y
        postInvalidateOnAnimation()   // coalesced to display vsync (~60 fps)
    }

    override fun onDraw(canvas: Canvas) {
        for ((xRatio, yRatio) in DOT_POSITIONS) {
            val cx = width * xRatio + shiftX
            val cy = height * yRatio + shiftY
            canvas.drawCircle(cx, cy, radiusPx, fillPaint)
            canvas.drawCircle(cx, cy, radiusPx, strokePaint)
        }
    }
}
```

One window added once via `windowManager.addView(...)`; the dots move purely inside the view's own draw pass.

### Why it works

| | Before | After |
|---|--------|-------|
| Overlay windows | 8 | 1 |
| Per-frame WindowManager calls | ~1600/s | 0 |
| Repaint cadence | uncapped (~200 Hz) | vsync-coalesced (~60 fps) |
| Effect on other apps | starved / killed | none |

Key idea: **`updateViewLayout` is global and expensive; `View.onDraw` is local and cheap.** Anything that animates every frame inside an overlay should repaint a single view, never move windows.

### Other details

- Window-level `LayoutParams.alpha = 0.85f` keeps the system from forcing alpha down and silences the `FLAG_NOT_TOUCHABLE` alpha warning.
- `postInvalidateOnAnimation()` (not `invalidate()`/`postInvalidate()`) ties repaints to the `Choreographer` vsync and coalesces bursts.
- The old `res/drawable/motion_cue_dot.xml` is no longer used (dots are drawn with `Paint`); harmless if left in place.

## Files

- `plugins/motion-cues-native/java/MotionCuesService.kt` — the rewrite (source of truth; copied into `android/` by the config plugin).

## Build / reproduce

Native module lives in a local Expo config plugin (`plugins/withMotionCuesModule.js`), so it only exists in a **custom dev build**, never in Expo Go.

```bash
npx expo prebuild --platform android --clean   # regenerates android/, runs the plugin
npx expo run:android                           # builds + installs the dev-client APK
```

After editing the Kotlin source, either re-run `prebuild` or copy the file into the generated tree and rebuild:

```bash
cp plugins/motion-cues-native/java/MotionCuesService.kt \
   android/app/src/main/java/com/serene/app/MotionCuesService.kt
./android/gradlew -p android assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Verify

With the overlay running, sample logcat:

```bash
adb logcat -c
# start overlay, move the device a few seconds
adb logcat -d | grep -c "Relayout Window.*com.serene.app"
```

Should be a small number (window create only), **not** hundreds per second. Other apps stay alive; dot motion is smooth.

## Gotchas hit along the way (non-code)

- **`MotionCuesModule is only available on Android` crash** — the native module isn't in Expo Go or a stale binary. Must run the custom dev build. JS now degrades gracefully (`modules/MotionCuesModule.ts` warns once instead of throwing).
- **`SYSTEM_ALERT_WINDOW` missing** — added to the plugin's permission list; required for `TYPE_APPLICATION_OVERLAY`.
- **"Permission required" after granting** — on ColorOS/OnePlus the AOSP overlay toggle doesn't stick; grant it under **Settings → Apps → Serene → Display over other apps** (a.k.a. "Floating windows"). Verify: `adb shell appops get com.serene.app SYSTEM_ALERT_WINDOW` → `allow`.
