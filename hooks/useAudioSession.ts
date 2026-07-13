import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { AUDIO_CONFIG } from "@/constants/config";

const audioSource = require("@/assets/audio/100hz.wav");

// How long the player may stay unloaded after start before we call it an error.
const LOAD_TIMEOUT_MS = 4000;

type AudioState = "idle" | "playing" | "interrupted" | "completed" | "error";

/**
 * 100 Hz session driven by the player's playback position — the WAV is
 * exactly AUDIO_CONFIG.duration seconds, so position maps 1:1 to the
 * countdown and the displayed time can never drift from the audio.
 */
export function useAudioSession() {
  const player = useAudioPlayer(audioSource, { updateInterval: 250 });
  const status = useAudioPlayerStatus(player);
  const [state, setState] = useState<AudioState>("idle");
  const stateRef = useRef<AudioState>(state);
  stateRef.current = state;
  const loadTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // A play was requested but the player wasn't loaded yet — start it as soon
  // as loading finishes (see the effect below). Issuing seekTo/play on an
  // unloaded player is undefined behaviour in expo-audio and can wedge it.
  const wantsPlayRef = useRef(false);

  // Configure audio to play even in silent mode
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).catch(() => {
      // Best-effort — playback failures surface via the error state below
    });
  }, []);

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const remainingSeconds =
    state === "idle" || state === "error"
      ? AUDIO_CONFIG.duration
      : Math.max(0, AUDIO_CONFIG.duration - status.currentTime);

  // Completion + in-foreground interruption detection (call, Siri, focus loss)
  useEffect(() => {
    if (state !== "playing") return;

    if (
      status.didJustFinish ||
      (status.isLoaded && !status.playing && remainingSeconds <= 0)
    ) {
      clearLoadTimeout();
      setState("completed");
      return;
    }

    // Player stopped mid-session without finishing → interrupted.
    // currentTime guard skips the first ticks right after start().
    if (
      status.isLoaded &&
      !status.playing &&
      status.currentTime > 0.5 &&
      remainingSeconds > 0
    ) {
      setState("interrupted");
    }
  }, [
    state,
    status.didJustFinish,
    status.playing,
    status.isLoaded,
    status.currentTime,
    remainingSeconds,
    clearLoadTimeout,
  ]);

  // Actually kick off playback from the top. Only safe once the player is
  // loaded; callers must guard on player.isLoaded or defer via wantsPlayRef.
  const beginPlayback = useCallback(() => {
    wantsPlayRef.current = false;
    clearLoadTimeout();
    try {
      player.seekTo(0);
      player.play();
    } catch {
      setState("error");
    }
  }, [player, clearLoadTimeout]);

  const start = useCallback(() => {
    if (stateRef.current === "playing") return;

    clearLoadTimeout();
    setState("playing");

    if (player.isLoaded) {
      beginPlayback();
      return;
    }

    // Player still loading (common when the screen was just re-mounted, e.g.
    // Done → Listen again). Defer play until load finishes; only surface an
    // error if the asset genuinely never loads within the timeout.
    wantsPlayRef.current = true;
    loadTimeoutRef.current = setTimeout(() => {
      if (stateRef.current === "playing" && wantsPlayRef.current && !player.isLoaded) {
        wantsPlayRef.current = false;
        setState("error");
      }
    }, LOAD_TIMEOUT_MS);
  }, [player, beginPlayback, clearLoadTimeout]);

  // A play was requested before the player finished loading → start it now.
  useEffect(() => {
    if (wantsPlayRef.current && status.isLoaded) {
      beginPlayback();
    }
  }, [status.isLoaded, beginPlayback]);

  const resume = useCallback(() => {
    if (stateRef.current !== "interrupted") return;
    try {
      player.play();
      setState("playing");
    } catch {
      setState("error");
    }
  }, [player]);

  const stop = useCallback(() => {
    wantsPlayRef.current = false;
    clearLoadTimeout();
    try {
      player.pause();
      player.seekTo(0);
    } catch {
      // Already stopped — ignore
    }
    setState("idle");
  }, [player, clearLoadTimeout]);

  const restart = useCallback(() => {
    stop();
    start();
  }, [stop, start]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLoadTimeout();
    };
  }, [clearLoadTimeout]);

  return {
    state,
    remainingSeconds,
    isPlaying: status.playing,
    start,
    stop,
    resume,
    restart,
  };
}
