#!/usr/bin/env python3
"""
Generate PNG versions of the Litlab logo from SVG.
Requires: pip install cairosvg
"""
import os
import sys

# Check if cairosvg is available
try:
    import cairosvg
except ImportError:
    print("❌ cairosvg not installed. Install with: pip install cairosvg")
    print("   (You may also need: pip install CairoSVG)")
    sys.exit(1)

# Configuration
SVG_FILE = "logo-litlabs.svg"
OUTPUT_DIR = "png"

# Sizes needed for different use cases
SIZES = {
    # Favicons
    "favicon-16.png": 16,
    "favicon-32.png": 32,
    "favicon-48.png": 48,
    # Apple Touch Icons
    "apple-touch-57.png": 57,
    "apple-touch-72.png": 72,
    "apple-touch-114.png": 114,
    "apple-touch-144.png": 144,
    "apple-touch-180.png": 180,
    # Android/Chrome
    "android-36.png": 36,
    "android-48.png": 48,
    "android-72.png": 72,
    "android-96.png": 96,
    "android-144.png": 144,
    "android-192.png": 192,
    # Microsoft Tiles
    "mstile-70.png": 70,
    "mstile-144.png": 144,
    "mstile-150.png": 150,
    "mstile-310.png": 310,
    # App Store / High Res
    "logo-256.png": 256,
    "logo-512.png": 512,
    "logo-1024.png": 1024,
}


def generate_pngs():
    """Generate all PNG sizes from SVG."""
    if not os.path.exists(SVG_FILE):
        print(f"❌ {SVG_FILE} not found in current directory!")
        sys.exit(1)

    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    print(f"🎨 Generating PNGs from {SVG_FILE}...")
    print("-" * 50)

    for filename, size in SIZES.items():
        output_path = os.path.join(OUTPUT_DIR, filename)
        try:
            cairosvg.svg2png(
                url=SVG_FILE,
                write_to=output_path,
                output_width=size,
                output_height=size,
            )
            print(f"  ✅ {filename} ({size}x{size})")
        except Exception as e:
            print(f"  ❌ {filename} - Error: {e}")

    print("-" * 50)
    print(f"✨ Done! PNGs saved to ./{OUTPUT_DIR}/")
    print()
    print("📋 To use in your HTML:")
    print(
        '  <link rel="icon" type="image/png" sizes="32x32" href="assets/png/favicon-32.png">'
    )
    print(
        '  <link rel="apple-touch-icon" sizes="180x180" href="assets/png/apple-touch-180.png">'
    )


if __name__ == "__main__":
    generate_pngs()
