# Serene — MVP Release Checklist

## Crash reporting (blocked on account)

- [ ] Create free Sentry org/project → get DSN
- [ ] `npx expo install @sentry/react-native` + add plugin to `app.json`, init in `app/_layout.tsx` with DSN from env
- [ ] Wire `ErrorBoundary` (components/ErrorBoundary.tsx) to `Sentry.captureException` in `getDerivedStateFromError`/`componentDidCatch`
- [ ] Test: throw in dev screen → event appears in Sentry

## Device test matrix (before store submission)

Both platforms unless noted; run in EN and VI.

- [ ] Theme: System/Light/Dark switch, status bar flips, no white flash on dark launch, dark splash shows
- [ ] Audio: full 60 s session → exactly one success haptic + screen-reader announcement → done screen
- [ ] Audio: background app 20 s mid-session → return → "Session paused" + Resume continues at correct second; audio and countdown agree
- [ ] Audio: incoming call / Siri mid-session → interrupted state, resume works
- [ ] Audio: iOS silent-mode switch on → tone still plays
- [ ] Tab switching: rapid home↔settings↔motion switches (reduce-motion OFF) → no blank screen (regression: react-navigation#12755 workaround)
- [ ] Android overlay: fresh install → onboarding slide 3 numbered steps → Grant → find Serene in system list → toggle → return → Start enabled without app restart
- [ ] Android overlay: return WITHOUT granting → denied card with manual steps + "Open Settings again"
- [ ] Android overlay: revoke permission while overlay active → reopen app → state resyncs
- [ ] iOS: Apple Vehicle Motion Cues deep link opens Accessibility settings (iOS 18+); in-app overlay dots visible in BOTH themes
- [ ] Reduce animations toggle: interface animations stop, overlay dots + timer breathing KEEP moving
- [ ] VoiceOver/TalkBack: home cards (role+state), settings radios (checked state), slider, language row, back button localized, onboarding step announcements
- [ ] Max font size (iOS AX / Android 2.0): headers wrap not clip, buttons not truncated, onboarding slide 3 scrolls
- [ ] Crash screen: temporarily throw in a screen → error boundary shows, Restart recovers

## Play Store (Android)

- [ ] `SYSTEM_ALERT_WINDOW` — sensitive permission: fill Play Console declaration; justification: "Displays passive motion-cue dots over other apps to help reduce motion sickness; no screen content is read"
- [ ] Foreground service type declared in manifest (verify prebuild output: `specialUse` or `dataSync` type present for MotionOffsetService/MotionFlowService) + Play Console FGS declaration
- [ ] Data safety form: no data collected, no data shared
- [ ] Health claims wording in listing: "may help reduce motion sickness symptoms" — never "treats"/"cures"
- [ ] Privacy policy URL (required even with zero collection) — host PRIVACY.md via GitHub Pages or serene site

## App Store (iOS)

- [ ] App Privacy: "Data Not Collected"
- [ ] Health claims wording in listing + review notes: cite Nagoya University research, "may help reduce symptoms"
- [ ] Review notes: explain 100 Hz WAV plays only in foreground for 60 s (no background audio mode requested); in-app overlay uses public APIs only
- [ ] Privacy policy URL

## Nice-to-have (post-MVP)

- [ ] Android 13+ themed icon: add `monochrome` layer to adaptive icon (currently system auto-tints foreground)
- [ ] Haptic pulses synced to breathing cycle during session (opt-in)
- [ ] Maestro smoke flow: launch → start session → stop → settings toggle
