#!/usr/bin/env python3
"""
Generate assets/audio/100hz.wav — the pure 100 Hz therapy tone.

Same stimulus as the original asset (pure 100 Hz sine, mono, 44.1 kHz, 16-bit,
60 s), but normalized to -1 dBFS instead of -6 dBFS. That is the entire usable
headroom: a sine's peak IS its loudest sample, so anything above ~-1 dBFS
clips and distorts. Net gain over the original: about +5 dB.

The original asset is kept at assets/audio/100hz_origin.wav.

Note: the tone still sounds quiet on phone speakers. That is physics, not the
file — the ear is far less sensitive at 100 Hz (ISO 226 equal-loudness) and
phone speakers roll off steeply below ~500 Hz. Headphones are required.

Pure Python stdlib — no numpy/ffmpeg needed.

Usage:
  python3 scripts/generate_100hz.py
"""

import math
import os
import struct
import wave

SAMPLE_RATE = 44100
DURATION_S = 60.0
FREQUENCY = 100.0  # Hz — the therapeutic stimulus; never change this.
PEAK_DBFS = -1.0   # max safe peak for a sine before clipping

FADE_IN_S = 0.5    # raised-cosine fades kill the start/end clicks
FADE_OUT_S = 0.8


def db_to_lin(db: float) -> float:
    return 10.0 ** (db / 20.0)


def envelope(t: float) -> float:
    if t < FADE_IN_S:
        return 0.5 - 0.5 * math.cos(math.pi * t / FADE_IN_S)
    end = DURATION_S - t
    if end < FADE_OUT_S:
        return 0.5 - 0.5 * math.cos(math.pi * end / FADE_OUT_S)
    return 1.0


def main():
    n = int(SAMPLE_RATE * DURATION_S)
    amp = db_to_lin(PEAK_DBFS)
    two_pi_f = 2.0 * math.pi * FREQUENCY

    frames = bytearray()
    for i in range(n):
        t = i / SAMPLE_RATE
        s = amp * envelope(t) * math.sin(two_pi_f * t)
        frames += struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767.0))

    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "..", "assets", "audio", "100hz.wav")
    with wave.open(out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SAMPLE_RATE)
        w.writeframes(bytes(frames))
    print(f"wrote {out} ({len(frames) / 1_000_000:.1f} MB)")


if __name__ == "__main__":
    main()
