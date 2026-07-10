# Motion Cues Guide Enhancement — Design

**Date:** 2026-07-09
**Status:** Approved (implementation in progress)

## Goal

Enhance the per-platform Motion Cues user guide (onboarding + control screens) with richer, more detailed guidance, smooth scroll-driven transitions, and purposeful animation — without lengthening first-run beyond 4 slides.

## Scope

1. Onboarding slides carousel (both platforms)
2. Illustrated settings-path mockups
3. New "Best results" tips slide
4. Collapsible help/troubleshooting section on control screens
5. Control screen animation polish

## 1. OnboardingSlides — scroll-driven parallax carousel

- Replace `FlatList` scroll handling with `Animated.FlatList` + `useAnimatedScrollHandler` feeding a shared `scrollX`.
- Per-slide interpolation from `scrollX`: opacity 0.35 → 1 → 0.35, scale 0.94 → 1 → 0.94, inner content translateX parallax. Gesture-continuous — follows the finger.
- Pagination dots become morphing pills: width and color interpolate from `scrollX`, so the handoff animates mid-swipe.
- Footer CTA crossfades when its label changes between slides; the actions container uses a layout transition so the secondary button appearing/disappearing is smooth.
- New optional `onSkip` prop renders a ghost "Skip" affordance (hidden on the last slide). Skipping completes onboarding the same as "Later".
- All decorative animation honors reduce-motion (default Reanimated behavior; no `ReduceMotion.Never`).
- Public API otherwise unchanged (`Slide[]`, `primaryCta`, `secondaryCta`).

## 2. SettingsPathMockup component

Stylized mini illustration (same visual language as `DemoPhoneMockup`, fixed light palette) of the settings screen the user must reach:

- **Android variant:** "Display over other apps" list — abstract rows plus a Serene row with a toggle. A looping timeline pulses a tap ring on the Serene row, then flips the toggle on.
- **iOS variant:** Settings → Accessibility → Motion → Vehicle Motion Cues as labeled rows; the highlight walks down the path, then flips the final toggle.

A `useStageLoop(stepCount, dwellMs)` hook drives the loop; the parent passes the current stage to both the mockup and the numbered `StepItem`s so the step list highlights in sync with the mockup animation. Labels come from i18n (VI works). Not pixel-perfect OS clones.

Used in the Android permission slide and the iOS steps slide.

## 3. New content

- New slide per platform (position 3 of 4): **"Best results"** — icon tip rows: start cues before the ride begins, keep the phone in view, combine with the 100 Hz audio session, take a break if symptoms persist.
- All new strings land in `en.json` and `vi.json` together (parity test enforces).
- No medical claims — "may help" phrasing.

## 4. Collapsible help section (control screens)

New `CollapsibleCard` component: chevron rotates, body fades in/out, container animates via layout transition, `accessibilityState={{ expanded }}`.

- **Android help cards:** overlay not visible → permission/restart; dots frozen → battery optimization; why the persistent notification exists; Android 11+ opens the app list vs ≤10 opening Serene's page directly.
- **iOS help cards:** Vehicle Motion Cues missing → requires iOS 18+; settings path recap; why the in-app overlay is foreground-only (Apple restriction).

Sits below existing cards, above the "Review guide" button.

## 5. Control screen polish

- Status card: `PulsingDot` for the active state; border-accent color animates on state change.
- Cards enter with a staggered fade-up.
- `MotionStylePicker`: animated sliding thumb (spring) instead of instant background swap; description text crossfades on selection change.
- Warning cards fade in/out with layout transitions instead of popping.

## Files

- `components/OnboardingSlides.tsx` — rewrite internals, API + `onSkip`
- `components/SettingsPathMockup.tsx` — new
- `components/CollapsibleCard.tsx` — new
- `app/(tabs)/motion-cues.tsx` — slides, help sections, picker thumb, status polish
- `i18n/locales/en.json`, `i18n/locales/vi.json` — new keys

## Testing

- Existing `__tests__/i18n.test.ts` parity test covers new keys.
- `pnpm lint`, `tsc --noEmit`, `pnpm test`.
