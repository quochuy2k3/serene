import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { AUDIO_CONFIG } from "@/constants/config";

const audioSource = require("@/assets/audio/100hz.wav");

type AudioState = "idle" | "playing" | "completed";

export function useAudioSession() {
  const player = useAudioPlayer(audioSource);
  const status = useAudioPlayerStatus(player);
  const [state, setState] = useState<AudioState>("idle");
  const [remainingSeconds, setRemainingSeconds] = useState<number>(AUDIO_CONFIG.duration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Configure audio to play even in silent mode
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "doNotMix",
    }).catch(() => {
      // Best-effort
    });
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (state === "playing") return;

    setState("playing");
    setRemainingSeconds(AUDIO_CONFIG.duration);
    startTimeRef.current = Date.now();

    player.seekTo(0);
    player.play();

    intervalRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, AUDIO_CONFIG.duration - elapsed);
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        stopTimer();
        player.pause();
        setState("completed");
      }
    }, 100);
  }, [player, state, stopTimer]);

  const stop = useCallback(() => {
    stopTimer();
    player.pause();
    setState("idle");
    setRemainingSeconds(AUDIO_CONFIG.duration);
  }, [player, stopTimer]);

  const reset = useCallback(() => {
    stopTimer();
    player.pause();
    player.seekTo(0);
    setState("idle");
    setRemainingSeconds(AUDIO_CONFIG.duration);
  }, [player, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  return {
    state,
    remainingSeconds,
    isPlaying: status.playing,
    start,
    stop,
    reset,
  };
}
