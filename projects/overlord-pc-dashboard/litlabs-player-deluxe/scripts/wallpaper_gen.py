import argparse
import logging
import os
import random
from pathlib import Path
from typing import Tuple, Optional

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont

# Directory for output
OUTPUT_DIR = Path("wallpapers")


def create_base_canvas(width: int = 1920, height: int = 1080, color: Tuple[int, int, int] = (0, 0, 0)) -> Image.Image:
    """Creates a new image canvas."""
    return Image.new("RGB", (width, height), color)


def _load_font(size: int) -> ImageFont.FreeTypeFont:
    """Try common bold fonts on Windows, macOS, and Linux; fall back to default."""
    # Common font paths
    paths = [
        # Windows
        "C:/Windows/Fonts/impact.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
        # macOS
        "/System/Library/Fonts/Supplemental/Impact.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        # Linux (paths can vary greatly)
        "/usr/share/fonts/truetype/msttcorefonts/Impact.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        "/usr/share/fonts/corefonts/impact.ttf",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except (OSError, IOError):
            logging.debug("Font not found: %s", path)
            continue
    logging.warning("Custom fonts not found. Falling back to default font.")
    return ImageFont.load_default()


def add_chromatic_glitch(image: Image.Image, intensity: int = 14) -> Image.Image:
    """Multi-layer RGB channel split — chromatic aberration effect."""
    r, g, b = image.split()
    for _ in range(3):
        ox = random.randint(-intensity, intensity)
        oy = random.randint(-intensity // 2, intensity // 2)
        r = ImageChops.offset(r, ox, oy)
        g = ImageChops.offset(g, -ox, -oy)
        b = ImageChops.offset(b, ox // 2, 0)
    return Image.merge("RGB", (r, g, b))


def add_vhs_scanlines(image: Image.Image, alpha: int = 28) -> Image.Image:
    """Overlay horizontal scanlines for VHS / CRT look."""
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for y in range(0, image.height, 4):
        draw.line([(0, y), (image.width, y)], fill=(255, 255, 255, alpha), width=1)
    return Image.alpha_composite(image.convert("RGBA"), overlay).convert("RGB")


def add_neon_text(
    image: Image.Image,
    text: str,
    pos: Tuple[int, int],
    size: int = 80,
    color: Tuple[int, int, int] = (0, 255, 157),
    stroke: Tuple[int, int, int] = (255, 0, 255),
) -> Image.Image:
    """Draw glowing neon text with a coloured stroke shadow."""
    draw = ImageDraw.Draw(image)
    font = _load_font(size)
    # glow / stroke
    for dx in range(-3, 4, 2):
        for dy in range(-3, 4, 2):
            draw.text((pos[0] + dx, pos[1] + dy), text, font=font, fill=stroke)
    draw.text(pos, text, font=font, fill=color)
    return image


# ── THEME GENERATORS ─────────────────────────────────────────────────────────

def generate_vaporwave(name: str) -> Path:
    """Generates a vaporwave themed wallpaper."""
    img = create_base_canvas(color=(20, 0, 40))
    draw = ImageDraw.Draw(img)
    # Grid
    for x in range(0, 1920, 80):
        draw.line([(x, 0), (x, 1080)], fill=(255, 0, 255, 80), width=1)
    for y in range(0, 1080, 80):
        draw.line([(0, y), (1920, y)], fill=(0, 255, 255, 80), width=1)
    # Retro sun
    draw.ellipse([(800, 200), (1120, 520)], fill=(255, 100, 0))
    img = add_neon_text(
        img, "RETRO FUTURE 2026", (450, 600), 90, (255, 255, 255), (0, 255, 255)
    )
    img = add_neon_text(
        img, "LITLAB PLAYER", (600, 750), 55, (0, 255, 255), (255, 0, 255)
    )
    img = add_chromatic_glitch(img, 8)
    img = add_vhs_scanlines(img)
    img = ImageEnhance.Color(img).enhance(2.2)
    img = ImageEnhance.Brightness(img).enhance(1.25)
    path = OUTPUT_DIR / name
    img.save(path)
    logging.info("Saved wallpaper to %s", path)
    return path


def generate_matrix_rave(name: str) -> Path:
    """Generates a matrix themed wallpaper."""
    img = create_base_canvas(color=(0, 5, 0))
    draw = ImageDraw.Draw(img)
    # Matrix rain
    for _ in range(200):
        x = random.randint(0, 1920)
        y = random.randint(0, 1080)
        length = random.randint(50, 300)
        draw.line(
            [(x, y), (x, y + length)], fill=(0, random.randint(180, 255), 70), width=2
        )
    img = add_neon_text(
        img, "TAKE THE RED REEL", (450, 500), 90, (255, 0, 0), (0, 255, 70)
    )
    img = ImageEnhance.Contrast(img).enhance(2.5)
    img = add_chromatic_glitch(img, 10)
    img = add_vhs_scanlines(img)
    path = OUTPUT_DIR / name
    img.save(path)
    logging.info("Saved wallpaper to %s", path)
    return path


def generate_litlab_neon(name: str) -> Path:
    """Cyberpunk neon circuit grid with LITLAB PLAYER branding."""
    img = create_base_canvas(color=(5, 0, 20))
    draw = ImageDraw.Draw(img)
    # Circuit traces
    for _ in range(60):
        x = random.randint(0, 1920)
        y = random.randint(0, 1080)
        length = random.randint(80, 400)
        color = random.choice([(0, 255, 157), (0, 255, 255), (255, 0, 255)])
        draw.line([(x, y), (x + length, y)], fill=color, width=2)
        draw.line(
            [(x + length, y), (x + length, y + random.randint(40, 200))],
            fill=color,
            width=2,
        )
    # Horizon glow
    for i in range(50, 0, -1):
        opacity = i * 3
        draw.line([(0, 540), (1920, 540)], fill=(0, 255, 157, opacity), width=i)
    img = add_neon_text(
        img, "LITLAB PLAYER", (200, 380), 110, (0, 255, 157), (255, 0, 255)
    )
    img = add_neon_text(
        img, "SYSTEM ONLINE // 2026", (300, 530), 50, (0, 255, 255), (0, 180, 110)
    )
    img = add_chromatic_glitch(img, 12)
    img = add_vhs_scanlines(img)
    img = ImageEnhance.Contrast(img).enhance(1.8)
    path = OUTPUT_DIR / name
    img.save(path)
    logging.info("Saved wallpaper to %s", path)
    return path


# ── API & CLI ────────────────────────────────────────────────────────────────

THEMES = {
    "vaporwave": generate_vaporwave,
    "matrix": generate_matrix_rave,
    "neon": generate_litlab_neon,
    "glitch": generate_litlab_neon,  # Alias for neon
}

def generate_wallpaper(theme: str = "glitch", uid: Optional[int] = None) -> Path:
    """
    API function to generate a wallpaper. Returns the saved file path.
    Supported themes: glitch, vaporwave, matrix, neon
    """
    if uid is None:
        uid = random.randint(1000, 9999)
    
    filename = f"{theme}_{uid}.png"
    
    generator_func = THEMES.get(theme, THEMES["glitch"])
    return generator_func(filename)


def main():
    """CLI entry point for generating wallpapers."""
    parser = argparse.ArgumentParser(description="Generate cyberpunk wallpapers.")
    parser.add_argument(
        "theme",
        nargs="?",
        default="all",
        choices=list(THEMES.keys()) + ["all"],
        help="The theme of the wallpaper to generate. 'all' generates one of each.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=OUTPUT_DIR,
        help="The directory to save wallpapers to.",
    )
    parser.add_argument("--verbose", "-v", action="store_true", help="Enable debug logging.")

    args = parser.parse_args()

    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(level=log_level, format="%(levelname)s: %(message)s")

    # Update global output dir and ensure it exists
    global OUTPUT_DIR
    OUTPUT_DIR = args.output_dir
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if args.theme == "all":
        logging.info("Generating all wallpaper themes...")
        for theme_name in THEMES:
            generate_wallpaper(theme=theme_name)
    else:
        logging.info("Generating wallpaper for theme: %s", args.theme)
        generate_wallpaper(theme=args.theme)
    
    logging.info("Wallpaper generation complete. Output directory: %s", OUTPUT_DIR.resolve())


if __name__ == "__main__":
    main()
