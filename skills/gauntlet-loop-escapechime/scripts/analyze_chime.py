#!/usr/bin/env python3
"""
Objective proxy for the ChimeAudio target, for use when the critic
runtime can't take audio input directly. This is NOT a substitute for a
real perceptual critic pick -- it's a fallback that at least checks GDD
Section 3.4's stated numeric target (the failure chime's notes pitch-bent
flat by ~40-60 cents progressively through the phrase) rather than
leaving the target completely unjudged.

Requires: numpy, scipy (for FFT-based pitch estimation). Install with
  pip install numpy scipy --break-system-packages
if not already present.

Usage: analyze_chime.py --success success_chime.wav --failure failure_chime.wav
"""
import argparse
import sys

try:
    import numpy as np
    from scipy.io import wavfile
    from scipy.signal import find_peaks
except ImportError:
    print("This proxy needs numpy + scipy: pip install numpy scipy --break-system-packages", file=sys.stderr)
    sys.exit(1)


def estimate_fundamental(signal, sample_rate):
    """Crude FFT-peak fundamental estimate -- good enough for a relative
    pitch-deviation check between two clips of the same clean triad,
    not a substitute for a proper pitch-tracking library."""
    windowed = signal * np.hanning(len(signal))
    spectrum = np.abs(np.fft.rfft(windowed))
    freqs = np.fft.rfftfreq(len(windowed), 1 / sample_rate)
    peak_idx = np.argmax(spectrum)
    return freqs[peak_idx]


def cents_deviation(f_measured, f_reference):
    if f_reference <= 0 or f_measured <= 0:
        return float("nan")
    return 1200 * np.log2(f_measured / f_reference)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--success", required=True, help="Path to the clean/success chime WAV")
    p.add_argument("--failure", required=True, help="Path to the corrupted/failure chime WAV")
    args = p.parse_args()

    sr_s, sig_s = wavfile.read(args.success)
    sr_f, sig_f = wavfile.read(args.failure)

    if sig_s.ndim > 1:
        sig_s = sig_s.mean(axis=1)
    if sig_f.ndim > 1:
        sig_f = sig_f.mean(axis=1)

    f0_success = estimate_fundamental(sig_s.astype(float), sr_s)
    f0_failure = estimate_fundamental(sig_f.astype(float), sr_f)
    deviation_cents = cents_deviation(f0_failure, f0_success)

    print("=== ChimeAudio objective proxy (NOT a perceptual critic verdict) ===")
    print(f"Success chime estimated fundamental: {f0_success:.1f} Hz")
    print(f"Failure chime estimated fundamental: {f0_failure:.1f} Hz")
    print(f"Deviation: {deviation_cents:.1f} cents")
    print()
    target_lo, target_hi = -60, -40  # flat by 40-60 cents per GDD 3.4
    if target_lo <= deviation_cents <= target_hi:
        print(f"PROXY RESULT: within GDD 3.4's stated -40 to -60 cent target range.")
    else:
        print(f"PROXY RESULT: OUTSIDE GDD 3.4's stated -40 to -60 cent target range.")
    print()
    print("This checks pitch deviation only -- it does NOT evaluate the")
    print("backward-reverb pre-tail or ring-mod shimmer GDD 3.4 also asks")
    print("for, which need an actual listen (human or audio-capable critic).")


if __name__ == "__main__":
    main()
