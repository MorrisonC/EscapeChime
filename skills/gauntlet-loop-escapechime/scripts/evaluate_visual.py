import sys
import os
from PIL import Image, ImageStat

def evaluate_visual(capture_dir):
    stage1 = os.path.join(capture_dir, "stage_1.png")
    stage8 = os.path.join(capture_dir, "stage_8.png")

    if not os.path.exists(stage1) or not os.path.exists(stage8):
        print("BAR")
        print("Missing required capture frames (stage_1.png or stage_8.png).")
        return

    img1 = Image.open(stage1)
    img8 = Image.open(stage8)

    stat1 = ImageStat.Stat(img1)
    stat8 = ImageStat.Stat(img8)

    # Calculate contrast / variance and mean brightness
    mean1 = sum(stat1.mean) / len(stat1.mean)
    mean8 = sum(stat8.mean) / len(stat8.mean)

    # Stage 8 (fully redacted) should be noticeably darker than stage 1
    if mean1 - mean8 < 0.5:
        print("BAR")
        print(f"Redaction contrast deficit: stage_8 mean brightness ({mean8:.1f}) is not sufficiently darker than stage_1 ({mean1:.1f}).")
    else:
        print("OURS")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("BAR")
        print("No capture directory specified.")
        sys.exit(1)
    evaluate_visual(sys.argv[1])
