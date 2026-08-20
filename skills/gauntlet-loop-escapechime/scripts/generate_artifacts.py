import os
import sys
import numpy as np
from scipy.io import wavfile
from PIL import Image, ImageDraw

def generate_chimes(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    sample_rate = 44100
    duration = 0.5
    t = np.linspace(0, duration, int(sample_rate * duration), False)

    # Success chime: G4 (392Hz), E4 (329.63Hz), C4 (261.63Hz)
    freqs_success = [392.0, 329.63, 261.63]
    audio_s = np.zeros_like(t)
    for i, f in enumerate(freqs_success):
        note_t = t[i*int(len(t)/3):]
        if len(note_t) > 0:
            audio_s[i*int(len(t)/3):] += np.sin(2 * np.pi * f * note_t) * np.exp(-3 * note_t)

    audio_s = audio_s / np.max(np.abs(audio_s)) * 32767
    wavfile.write(f"{out_dir}/success_chime.wav", sample_rate, audio_s.astype(np.int16))

    # Failure chime: detuned flat by ~50 cents (freq * 2^(-50/1200) = freq * 0.97153)
    freqs_failure = [f * 0.97153 for f in freqs_success]
    audio_f = np.zeros_like(t)
    for i, f in enumerate(freqs_failure):
        note_t = t[i*int(len(t)/3):]
        if len(note_t) > 0:
            audio_f[i*int(len(t)/3):] += np.sin(2 * np.pi * f * note_t) * np.exp(-3 * note_t)

    audio_f = audio_f / np.max(np.abs(audio_f)) * 32767
    wavfile.write(f"{out_dir}/failure_chime.wav", sample_rate, audio_f.astype(np.int16))


def generate_visual_frame(out_path, title, stage):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    width, height = 1920, 1080
    img = Image.new('RGB', (width, height), color=(15, 12, 12))
    draw = ImageDraw.Draw(img)

    # Draw dark room frame / wall
    draw.rectangle([100, 100, 1820, 980], fill=(30, 25, 25), outline=(60, 50, 40), width=4)

    # Draw portrait frame
    draw.rectangle([200, 200, 700, 850], fill=(20, 18, 18), outline=(120, 90, 50), width=8)

    # Bust silhouette
    draw.ellipse([350, 280, 550, 520], fill=(180, 160, 140)) # head
    draw.polygon([(280, 800), (620, 800), (520, 550), (380, 550)], fill=(120, 100, 90)) # shoulders

    # Apply redactions based on stage
    if stage >= 1: draw.rectangle([340, 380, 370, 440], fill=(10, 0, 0)) # left ear
    if stage >= 2: draw.rectangle([530, 380, 560, 440], fill=(10, 0, 0)) # right ear
    if stage >= 3: draw.rectangle([380, 350, 440, 365], fill=(10, 0, 0)) # left brow
    if stage >= 4: draw.rectangle([460, 350, 520, 365], fill=(10, 0, 0)) # right brow
    if stage >= 5: draw.rectangle([435, 390, 465, 450], fill=(10, 0, 0)) # nose
    if stage >= 6: draw.rectangle([390, 380, 430, 410], fill=(10, 0, 0)) # left eye
    if stage >= 7: draw.rectangle([470, 380, 510, 410], fill=(10, 0, 0)) # right eye
    if stage >= 8: draw.rectangle([410, 460, 490, 500], fill=(10, 0, 0)) # mouth

    # Question Plaque
    draw.rectangle([800, 250, 1700, 750], fill=(40, 35, 30), outline=(100, 80, 60), width=6)
    draw.text((850, 300), f"GRAMMAR TRIAL - {title}", fill=(220, 200, 160))
    draw.text((850, 400), "The editor demands correct punctuation and syntax.", fill=(180, 180, 180))

    img.save(out_path)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        sys.exit(1)
    cmd = sys.argv[1]
    target = sys.argv[2]
    out_dir = sys.argv[3]

    if cmd == "audio":
        generate_chimes(out_dir)
    else:
        generate_visual_frame(f"{out_dir}/stage_1.png", target, 1)
        generate_visual_frame(f"{out_dir}/stage_8.png", target, 8)
