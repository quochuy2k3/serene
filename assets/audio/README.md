# Audio Assets

## 100hz.mp3 (or 100hz.m4a, 100hz.wav)

Place your 100 Hz sine wave audio file here. The app expects a file named `100hz.mp3`.

**Specifications:**
- Frequency: 100 Hz pure sine wave
- Duration: 60 seconds (with smooth fade in/out at start/end to avoid clicks)
- Format: MP3 (preferred), M4A, or WAV
- Mono or stereo (stereo recommended for symmetric vestibular stimulation)
- Bitrate: 128 kbps minimum for MP3
- Normalized to -3 dB peak

**Why 100 Hz?**
Based on research from Nagoya University (Japan), a 100 Hz tone stimulates the otolith organs in the inner ear, helping synchronize the vestibular system. Same science as Samsung Hearapy.

**Generating with sox (command line):**
```bash
sox -n -r 44100 -c 2 100hz.mp3 synth 60 sine 100 fade 0.5 60 0.5 gain -3
```

**Generating with ffmpeg:**
```bash
ffmpeg -f lavfi -i "sine=frequency=100:duration=60:sample_rate=44100" -ac 2 -b:a 128k 100hz.mp3
```
