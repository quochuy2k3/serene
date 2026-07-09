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

  const start = useCallback(() => {
    if (stateRef.current === "playing") return;

    clearLoadTimeout();
    try {
      player.seekTo(0);
      player.play();
      setState("playing");
      loadTimeoutRef.current = setTimeout(() => {
        if (stateRef.current === "playing" && !player.isLoaded) {
          setState("error");
        }
      }, LOAD_TIMEOUT_MS);
    } catch {
      setState("error");
    }
  }, [player, clearLoadTimeout]);

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
