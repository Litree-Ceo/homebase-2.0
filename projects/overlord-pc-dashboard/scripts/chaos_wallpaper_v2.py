import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

# Directory for output
OUTPUT_DIR = os.path.join(os.getcwd(), "wallpapers")
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)


def create_base_canvas(width=1920, height=1080, color=(0, 0, 0)):
    return Image.new("RGB", (width, height), color)


def add_glitch_effect(image):
    # Fixed: Use ImageChops.offset correctly
    r, g, b = image.split()
    r = ImageChops.offset(r, random.randint(-15, 15), random.randint(-10, 10))
    g = ImageChops.offset(g, random.randint(-10, 10), random.randint(-15, 15))
    return Image.merge("RGB", (r, g, b))


def get_best_font(size):
    # Try to find a bold font on Windows
    paths = [
        "C:\\Windows\\Fonts\\impact.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf",
        "arial.ttf",
    ]
    for path in paths:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_text_vibe(draw, text, position, font_size, color, glow=True):
    font = get_best_font(font_size)
    if glow:
        # Simple shadow
        for offset in range(1, 6):
            draw.text(
                (position[0] + offset, position[1] + offset),
                text,
                font=font,
                fill=(0, 0, 0),
            )
    draw.text(position, text, font=font, fill=color)


# Collection Functions
def generate_all():
    # 1. Full Chaos Mashup
    img1 = create_base_canvas(color=(10, 10, 10))
    draw1 = ImageDraw.Draw(img1)
    for _ in range(80):
        c1 = (random.randint(0, 1920), random.randint(0, 1080))
        c2 = (random.randint(0, 1920), random.randint(0, 1080))
        draw1.line(
            [c1, c2],
            fill=(
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
            ),
            width=3,
        )
    draw_text_vibe(draw1, "ZERO CHILL. FULL CONTROL.", (250, 480), 120, (255, 255, 255))
    img1 = add_glitch_effect(img1)
    img1.save(os.path.join(OUTPUT_DIR, "1_Chaos_Mashup.png"))

    # 2. Vaporwave
    img2 = create_base_canvas(color=(30, 0, 60))
    draw2 = ImageDraw.Draw(img2)
    for i in range(0, 1920, 80):
        draw2.line([(i, 0), (i, 1080)], fill=(255, 0, 255), width=1)
    for i in range(0, 1080, 80):
        draw2.line([(0, i), (1920, i)], fill=(0, 255, 255), width=1)
    draw2.ellipse([820, 250, 1100, 530], fill=(255, 100, 0))
    draw_text_vibe(draw2, "1986 UPGRADED", (580, 600), 110, (255, 255, 255))
    img2 = add_glitch_effect(img2)
    img2.save(os.path.join(OUTPUT_DIR, "2_Vaporwave_Chaos.png"))

    # 3. Underwater
    img3 = create_base_canvas(color=(0, 30, 70))
    draw3 = ImageDraw.Draw(img3)
    for _ in range(150):
        x, y = random.randint(0, 1920), random.randint(0, 1080)
        r = random.randint(3, 10)
        draw3.ellipse([x - r, y - r, x + r, y + r], fill=(135, 206, 250))
    draw_text_vibe(draw3, "DEEP SEA SURREAL", (480, 480), 100, (0, 255, 200))
    img3 = img3.filter(ImageFilter.GaussianBlur(radius=1.5))
    img3.save(os.path.join(OUTPUT_DIR, "3_Underwater_Legend.png"))

    # 4. Glitch Matrix
    img4 = create_base_canvas(color=(0, 5, 0))
    draw4 = ImageDraw.Draw(img4)
    for _ in range(300):
        x, y = random.randint(0, 1920), random.randint(0, 1080)
        draw4.text((x, y), random.choice("01X#$"), fill=(0, 255, 70))
    draw_text_vibe(draw4, "THERE IS NO ALGORITHM", (380, 480), 90, (250, 0, 0))
    img4 = add_glitch_effect(img4)
    img4.save(os.path.join(OUTPUT_DIR, "4_Glitch_Matrix.png"))

    # 5. Dreamscape
    img5 = create_base_canvas(color=(255, 192, 203))
    draw5 = ImageDraw.Draw(img5)
    for _ in range(12):
        x, y = random.randint(100, 1700), random.randint(100, 900)
        draw5.ellipse([x, y, x + 500, y + 250], fill=(255, 255, 255))
    draw_text_vibe(draw5, "LEGEND DREAM DROP", (420, 480), 120, (128, 0, 128))
    img5.save(os.path.join(OUTPUT_DIR, "5_Surreal_Dreamscape.png"))

    # 6. Wasteland
    img6 = create_base_canvas(color=(40, 25, 10))
    draw6 = ImageDraw.Draw(img6)
    for _ in range(60):
        draw6.line(
            [
                random.randint(0, 1920),
                random.randint(0, 1080),
                random.randint(0, 1920),
                random.randint(0, 1080),
            ],
            fill=(15, 10, 5),
            width=5,
        )
    draw_text_vibe(draw6, "THE LEGENDS ROSE", (450, 500), 110, (210, 40, 0))
    img6.save(os.path.join(OUTPUT_DIR, "6_Legend_Wasteland.png"))


def generate_all_vertical():
    # Phone Aspect Ratio 1080x2340 (Typical 19.5:9)
    W, H = 1080, 2340
    V_DIR = os.path.join(OUTPUT_DIR, "mobile")
    if not os.path.exists(V_DIR):
        os.makedirs(V_DIR)

    # 1. Chaos Mashup Vertical
    img = create_base_canvas(W, H, color=(5, 5, 5))
    draw = ImageDraw.Draw(img)
    for _ in range(150):
        c1 = (random.randint(0, W), random.randint(0, H))
        c2 = (random.randint(0, W), random.randint(0, H))
        draw.line(
            [c1, c2],
            fill=(random.randint(100, 255), 0, random.randint(100, 255)),
            width=2,
        )
    draw_text_vibe(draw, "ZERO CHILL", (150, 800), 140, (255, 255, 255))
    draw_text_vibe(draw, "FULL CONTROL", (180, 1000), 100, (0, 255, 0))
    img = add_glitch_effect(img)
    img.save(os.path.join(V_DIR, "Mobile_Chaos.png"))

    # 2. Vaporwave Vertical
    img = create_base_canvas(W, H, color=(20, 0, 40))
    draw = ImageDraw.Draw(img)
    for i in range(0, W, 60):
        draw.line([(i, 0), (i, H)], fill=(255, 0, 255), width=1)
    for i in range(0, H, 60):
        draw.line([(0, i), (W, i)], fill=(0, 255, 255), width=1)
    draw.ellipse([200, 400, 880, 1080], fill=(255, 100, 0))
    draw_text_vibe(draw, "1986", (350, 1200), 200, (255, 255, 255))
    draw_text_vibe(draw, "UPGRADED", (250, 1450), 120, (0, 255, 255))
    img = add_glitch_effect(img)
    img.save(os.path.join(V_DIR, "Mobile_Vaporwave.png"))


if __name__ == "__main__":
    generate_all()
    generate_all_vertical()
    print(f"Desktop and Mobile wallpapers created successfully in {OUTPUT_DIR}")
