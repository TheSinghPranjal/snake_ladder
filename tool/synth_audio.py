#!/usr/bin/env python3
"""Synthesises every sound in assets/audio/ from scratch (no samples).

Writes OGG Vorbis (Android) and M4A AAC (iOS) for each sound, each peak
normalised to -1 dBFS and kept under 150 KB.

Requires oggenc (brew install vorbis-tools) and ffmpeg. Run:
    python3 tool/synth_audio.py
"""
import array
import math
import os
import random
import subprocess
import tempfile
import wave

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'audio')
SR = 44100
PEAK = 10 ** (-1 / 20)  # -1 dBFS
LIMIT = 150 * 1024
rng = random.Random(7)


def silence(sec, sr=SR):
    return [0.0] * int(sec * sr)


def env(i, n, attack=0.005, release=0.1, sr=SR):
    t = i / sr
    total = n / sr
    a = min(1.0, t / attack) if attack > 0 else 1.0
    r = min(1.0, (total - t) / release) if release > 0 else 1.0
    return max(0.0, min(a, r))


def tone(freq, sec, kind='sine', decay=6.0, attack=0.004, sr=SR, vol=1.0, sweep=None):
    """A single note. sweep=(f_end) glides the pitch exponentially."""
    n = int(sec * sr)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / sr
        f = freq * (sweep / freq) ** (t / sec) if sweep else freq
        phase += 2 * math.pi * f / sr
        if kind == 'square':
            v = 0.6 if math.sin(phase) >= 0 else -0.6
        elif kind == 'tri':
            v = 2 / math.pi * math.asin(math.sin(phase))
        elif kind == 'marimba':
            v = math.sin(phase) + 0.35 * math.sin(4 * phase) * math.exp(-t * 30)
        else:
            v = math.sin(phase)
        out.append(v * math.exp(-t * decay) * env(i, n, attack, min(0.02, sec / 4), sr) * vol)
    return out


def noise(sec, decay=20.0, vol=1.0, sr=SR, lowpass=0.5):
    n = int(sec * sr)
    out = []
    prev = 0.0
    for i in range(n):
        prev = prev + lowpass * (rng.uniform(-1, 1) - prev)
        out.append(prev * math.exp(-(i / sr) * decay) * vol)
    return out


def mix(base, other, at=0.0, sr=SR):
    start = int(at * sr)
    if len(base) < start + len(other):
        base.extend([0.0] * (start + len(other) - len(base)))
    for i, v in enumerate(other):
        base[start + i] += v
    return base


def normalise(samples, target=PEAK):
    peak = max(abs(v) for v in samples) or 1.0
    return [v / peak * target for v in samples]


def measured_peak_db(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(out.split('max_volume:')[1].split('dB')[0])


def note(name):
    names = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
    semis = names[name[0]] + (1 if '#' in name else 0)
    octave = int(name[-1])
    return 440.0 * 2 ** ((semis - 9) / 12 + (octave - 4))


# ---------- effects ----------
def dice_shake():
    s = silence(0.62)
    for k in range(9):
        mix(s, noise(0.05, decay=60, vol=0.8, lowpass=0.7), at=k * 0.065 + rng.uniform(0, 0.015))
        mix(s, tone(1800 + rng.uniform(-300, 300), 0.03, decay=90, vol=0.25), at=k * 0.065)
    return s


def dice_land():
    s = tone(140, 0.18, decay=24, sweep=80, vol=1.0)
    mix(s, noise(0.06, decay=70, vol=0.6, lowpass=0.35))
    mix(s, tone(2200, 0.04, decay=80, vol=0.25), at=0.01)
    mix(s, tone(110, 0.1, decay=40, vol=0.4), at=0.09)
    return s


def hop():
    s = tone(620, 0.09, kind='tri', decay=30, sweep=900, vol=0.9)
    mix(s, noise(0.02, decay=120, vol=0.2), at=0.0)
    return s


def ladder_climb():
    s = []
    for k, n in enumerate(['C5', 'E5', 'G5', 'C6', 'E6', 'G6']):
        mix(s, tone(note(n), 0.22, kind='marimba', decay=12, vol=0.7), at=k * 0.11)
    return s


def snake_slide():
    s = tone(900, 1.1, kind='tri', decay=1.4, sweep=140, vol=0.8)
    vib = [v * (0.85 + 0.15 * math.sin(i / SR * 2 * math.pi * 9)) for i, v in enumerate(s)]
    mix(vib, noise(1.0, decay=3, vol=0.12, lowpass=0.08))
    return vib


def snake_gulp():
    s = tone(320, 0.22, decay=10, sweep=120, vol=1.0)
    mix(s, tone(180, 0.16, decay=14, sweep=90, vol=0.7), at=0.12)
    return s


def extra_roll():
    s = []
    for k, n in enumerate(['G5', 'C6', 'E6']):
        mix(s, tone(note(n), 0.24, kind='square', decay=10, vol=0.35), at=k * 0.08)
        mix(s, tone(note(n), 0.24, kind='sine', decay=10, vol=0.5), at=k * 0.08)
    return s


def blocked():
    s = tone(220, 0.14, kind='square', decay=14, vol=0.45)
    mix(s, tone(165, 0.22, kind='square', decay=10, vol=0.45), at=0.13)
    return s


def capture():
    s = noise(0.35, decay=8, vol=0.35, lowpass=0.12)
    mix(s, tone(300, 0.3, kind='tri', decay=6, sweep=1200, vol=0.7))
    mix(s, tone(1200, 0.08, decay=40, vol=0.4), at=0.26)
    return s


def win_fanfare():
    s = []
    seq = [('C5', 0, 0.18), ('E5', 0.15, 0.18), ('G5', 0.3, 0.18), ('C6', 0.45, 0.6), ('G5', 0.95, 0.15), ('C6', 1.08, 0.9)]
    for n, at, dur in seq:
        mix(s, tone(note(n), dur + 0.2, kind='square', decay=3, vol=0.28), at=at)
        mix(s, tone(note(n) * 2, dur + 0.2, kind='sine', decay=4, vol=0.25), at=at)
    for n in ['C4', 'E4', 'G4']:
        mix(s, tone(note(n), 1.0, kind='tri', decay=2, vol=0.25), at=1.08)
    for k in range(10):
        mix(s, tone(2600 + k * 180, 0.06, decay=50, vol=0.12), at=1.1 + k * 0.05)
    return s


def ui_tap():
    s = tone(1400, 0.05, decay=70, vol=0.8)
    mix(s, noise(0.015, decay=200, vol=0.3))
    return s


# ---------- music: 32 bars at 128 bpm = 60 s, seamless ----------
def music_loop(sr=22050):
    bpm = 128
    beat = 60 / bpm
    bars = 32
    total = int(bars * 4 * beat * sr)
    s = [0.0] * total
    prog = [['C', 'E', 'G'], ['A', 'C', 'E'], ['F', 'A', 'C'], ['G', 'B', 'D']]
    bass = ['C2', 'A1', 'F1', 'G1']
    melody = ['E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'C5', 'E5', 'G5', 'E5', 'F5', 'E5', 'D5', 'B4']

    def put(samples, at_sec):
        start = int(at_sec * sr)
        for i, v in enumerate(samples):
            s[(start + i) % total] += v  # wrap tails to the start: seamless loop

    for bar in range(bars):
        chord = prog[bar % 4]
        t0 = bar * 4 * beat
        put(tone(note(bass[bar % 4]), beat * 1.8, kind='tri', decay=1.5, sr=sr, vol=0.5), t0)
        put(tone(note(bass[bar % 4]) * 1.5, beat * 0.9, kind='tri', decay=3, sr=sr, vol=0.3), t0 + 2 * beat)
        for b in range(8):
            n = chord[b % 3] + ('4' if b % 2 else '5')
            put(tone(note(n), beat * 0.6, kind='marimba', decay=9, sr=sr, vol=0.16), t0 + b * beat / 2)
        if bar % 8 >= 4:
            for k in range(4):
                put(tone(note(melody[(bar * 4 + k) % len(melody)]), beat * 0.9, kind='sine', decay=3, sr=sr, vol=0.22), t0 + k * beat)
        for b in range(4):
            put(noise(0.05, decay=60, vol=0.08, sr=sr, lowpass=0.9), t0 + b * beat + beat / 2)
    return s


SOUNDS = {
    'dice_shake': dice_shake, 'dice_land': dice_land, 'hop': hop, 'ladder_climb': ladder_climb,
    'snake_slide': snake_slide, 'snake_gulp': snake_gulp, 'extra_roll': extra_roll, 'blocked': blocked,
    'capture': capture, 'win_fanfare': win_fanfare, 'ui_tap': ui_tap,
}


def write_wav(path, samples, sr):
    data = array.array('h', (int(max(-1, min(1, v)) * 32767) for v in samples))
    with wave.open(path, 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


def encode(name, samples, sr, ogg_q, aac_kbps):
    """Encodes both formats, lowering the gain until each decoded peak is <= -1 dBFS."""
    ogg = os.path.join(OUT, f'{name}.ogg')
    m4a = os.path.join(OUT, f'{name}.m4a')
    for path, cmd in ((ogg, lambda wav: ['oggenc', '-Q', '-q', str(ogg_q), '-o', ogg, wav]),
                      (m4a, lambda wav: ['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'aac', '-b:a', f'{aac_kbps}k', '-movflags', '+faststart', m4a])):
        target_db = -1.0
        for _ in range(6):
            with tempfile.TemporaryDirectory() as tmp:
                wav = os.path.join(tmp, f'{name}.wav')
                write_wav(wav, normalise(samples, 10 ** (target_db / 20)), sr)
                subprocess.run(cmd(wav), check=True)
            peak = measured_peak_db(path)
            if peak <= -1.0:
                break
            target_db -= peak + 1.0 + 0.05
    sizes = [os.path.getsize(p) for p in (ogg, m4a)]
    for p, size in zip((ogg, m4a), sizes):
        assert size <= LIMIT, f'{p} is {size} bytes'
    return sizes


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for name, fn in SOUNDS.items():
        samples = fn()
        rows.append((name, len(samples) / SR, *encode(name, samples, SR, 4, 64)))
    music = music_loop()
    rows.append(('music_loop', len(music) / 22050, *encode('music_loop', music, 22050, -1, 18)))
    for name, sec, ogg, m4a in rows:
        print(f'{name:12} {sec:6.2f}s  ogg {ogg / 1024:6.1f} KB  m4a {m4a / 1024:6.1f} KB')


if __name__ == '__main__':
    main()
