import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFont

# Directory for output
OUTPUT_DIR = "wallpapers"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def create_base_canvas(width=1920, height=1080, color=(0, 0, 0)):
    return Image.new("RGB", (width, height), color)


def _load_font(size: int):
    """Try common bold fonts on Windows; fall back to default."""
    paths = [
        "C:\\Windows\\Fonts\\impact.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "arial.ttf",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
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
    pos: tuple,
    size: int = 80,
    color=(0, 255, 157),
    stroke=(255, 0, 255),
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


def generate_vaporwave(name="vaporwave_chaos.png") -> str:
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
        img, "OVERLORD EMPIRE", (600, 750), 55, (0, 255, 255), (255, 0, 255)
    )
    img = add_chromatic_glitch(img, 8)
    img = add_vhs_scanlines(img)
    img = ImageEnhance.Color(img).enhance(2.2)
    img = ImageEnhance.Brightness(img).enhance(1.25)
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path)
    print(f"Saved {name}")
    return path


def generate_matrix_rave(name="glitch_matrix.png") -> str:
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
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path)
    print(f"Saved {name}")
    return path


def generate_overlord_neon(name="neon_overlord.png") -> str:
    """Cyberpunk neon circuit grid with OVERLORD branding."""
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
        img, "OVERLORD v11.6", (200, 380), 110, (0, 255, 157), (255, 0, 255)
    )
    img = add_neon_text(
        img, "SYSTEM ONLINE // 2026", (300, 530), 50, (0, 255, 255), (0, 180, 110)
    )
    img = add_chromatic_glitch(img, 12)
    img = add_vhs_scanlines(img)
    img = ImageEnhance.Contrast(img).enhance(1.8)
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path)
    print(f"Saved {name}")
    return path


def generate_blood_samurai(name="blood_samurai.png") -> str:
    """Red/black katana warrior aesthetic."""
    img = create_base_canvas(color=(8, 0, 0))
    draw = ImageDraw.Draw(img)
    # Blood drip streaks
    for _ in range(80):
        x = random.randint(0, 1920)
        length = random.randint(100, 500)
        draw.line(
            [(x, 0), (x, length)],
            fill=(random.randint(180, 255), 0, 0),
            width=random.randint(1, 4),
        )
    img = add_neon_text(
        img, "BLOOD SAMURAI", (350, 400), 115, (255, 20, 20), (255, 120, 0)
    )
    img = add_neon_text(
        img, "戦士 // OVERLORD", (430, 560), 70, (255, 80, 0), (180, 0, 0)
    )
    img = add_chromatic_glitch(img, 15)
    img = add_vhs_scanlines(img, alpha=20)
    img = ImageEnhance.Contrast(img).enhance(2.0)
    path = os.path.join(OUTPUT_DIR, name)
    img.save(path)
    print(f"Saved {name}")
    return path


# ── BRIDGE API ────────────────────────────────────────────────────────────────


def generate_wallpaper(theme: str = "glitch") -> str:
    """
    Called by overlord_bridge.py.  Returns the saved file path.
    Supported themes: glitch, vaporwave, matrix, neon, blood
    """
    uid = random.randint(1000, 9999)
    dispatch = {
        "vaporwave": lambda: generate_vaporwave(f"vaporwave_{uid}.png"),
        "matrix": lambda: generate_matrix_rave(f"matrix_{uid}.png"),
        "neon": lambda: generate_overlord_neon(f"neon_{uid}.png"),
        "blood": lambda: generate_blood_samurai(f"blood_{uid}.png"),
    }
    fn = dispatch.get(theme, lambda: generate_overlord_neon(f"glitch_{uid}.png"))
    return fn()


if __name__ == "__main__":
    generate_vaporwave()
    generate_matrix_rave()
    generate_overlord_neon()
    generate_blood_samurai()
    print("Wallpaper generation script ready.")
