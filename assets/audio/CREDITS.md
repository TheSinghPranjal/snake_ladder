# Audio credits

Every sound in this folder is original. Each was synthesised from sine, triangle and square oscillators and filtered noise by `tool/synth_audio.py`, with no recorded samples or third-party sources. The project authors release them under **CC0 1.0** (public domain dedication).

| File | Source | Licence | Length |
|---|---|---|---|
| `dice_shake.ogg` / `.m4a` | `tool/synth_audio.py` → `dice_shake()` | CC0 1.0 | 0.62 s |
| `dice_land.ogg` / `.m4a` | `dice_land()` | CC0 1.0 | 0.19 s |
| `hop.ogg` / `.m4a` | `hop()` | CC0 1.0 | 0.09 s |
| `ladder_climb.ogg` / `.m4a` | `ladder_climb()` | CC0 1.0 | 0.77 s |
| `snake_slide.ogg` / `.m4a` | `snake_slide()` | CC0 1.0 | 1.10 s |
| `snake_gulp.ogg` / `.m4a` | `snake_gulp()` | CC0 1.0 | 0.28 s |
| `extra_roll.ogg` / `.m4a` | `extra_roll()` | CC0 1.0 | 0.40 s |
| `blocked.ogg` / `.m4a` | `blocked()` | CC0 1.0 | 0.35 s |
| `capture.ogg` / `.m4a` | `capture()` | CC0 1.0 | 0.35 s |
| `win_fanfare.ogg` / `.m4a` | `win_fanfare()` | CC0 1.0 | 2.18 s |
| `ui_tap.ogg` / `.m4a` | `ui_tap()` | CC0 1.0 | 0.05 s |
| `music_loop.ogg` / `.m4a` | `music_loop()`, 32 bars at 128 bpm, note tails wrapped to the start so it loops seamlessly | CC0 1.0 | 60.0 s |

## Format

- OGG Vorbis (Android) and AAC in M4A (iOS), mono.
- Effects: 44.1 kHz. Vorbis quality 4, AAC 64 kbps.
- Music: 22.05 kHz. Vorbis quality −1, AAC 18 kbps. These settings keep it under the 150 KB limit.
- The script measures each encoded file and lowers the gain until its peak is at or below −1 dBFS.

Regenerate with `python3 tool/synth_audio.py`. It needs `oggenc` (`brew install vorbis-tools`) and `ffmpeg`.
