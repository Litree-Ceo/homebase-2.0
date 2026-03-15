"""
Ask Imagine Marketplace - Database Models
AI-Generated Themes & Digital Assets Marketplace
"""

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

# ═══════════════════════════════════════════════════════════════
# DATABASE SCHEMA
# ═══════════════════════════════════════════════════════════════

MARKETPLACE_SCHEMA = """
-- Themes/Products Table
CREATE TABLE IF NOT EXISTS marketplace_themes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tagline TEXT,
    price REAL NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    category TEXT NOT NULL,
    tags TEXT, -- JSON array
    preview_url TEXT,
    thumbnail_url TEXT,
    screenshots TEXT, -- JSON array of URLs
    css_variables TEXT, -- JSON object with theme CSS vars
    creator_name TEXT,
    creator_avatar TEXT,
    ai_prompt TEXT, -- The prompt used to generate this theme
    ai_model TEXT, -- Model used (e.g., 'midjourney', 'dalle3', 'stable-diffusion')
    status TEXT DEFAULT 'active', -- active, inactive, featured
    sales_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    rating_count INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Categories Table
CREATE TABLE IF NOT EXISTS marketplace_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    theme_count INTEGER DEFAULT 0
);

-- User Purchases Table
CREATE TABLE IF NOT EXISTS marketplace_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    theme_id INTEGER NOT NULL,
    purchase_price REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    transaction_id TEXT,
    purchased_at TEXT NOT NULL,
    FOREIGN KEY (theme_id) REFERENCES marketplace_themes(id)
);

-- User Theme Favorites/Wishlist
CREATE TABLE IF NOT EXISTS marketplace_favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    theme_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(user_id, theme_id),
    FOREIGN KEY (theme_id) REFERENCES marketplace_themes(id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS marketplace_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    theme_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (theme_id) REFERENCES marketplace_themes(id)
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_themes_category ON marketplace_themes(category);
CREATE INDEX IF NOT EXISTS idx_themes_status ON marketplace_themes(status);
CREATE INDEX IF NOT EXISTS idx_themes_price ON marketplace_themes(price);
CREATE INDEX IF NOT EXISTS idx_purchases_user ON marketplace_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON marketplace_favorites(user_id);
"""

# ═══════════════════════════════════════════════════════════════
# AI-GENERATED THEME SEEDS
# ═══════════════════════════════════════════════════════════════

THEME_SEEDS = [
    {
        "slug": "blood-samurai",
        "name": "Blood Samurai",
        "tagline": "Honor. Steel. Crimson.",
        "description": "An ultra-violent feudal Japanese aesthetic featuring katana-slash animations, blood-red particle effects, and ink-wash backgrounds. Perfect for warriors who code.",
        "price": 4.99,
        "category": "cyberpunk",
        "tags": ["samurai", "japanese", "red", "dark", "animated", "premium"],
        "css_variables": {
            "--bg-primary": "#0a0000",
            "--bg-secondary": "#1a0505",
            "--accent-primary": "#ff0000",
            "--accent-secondary": "#8b0000",
            "--text-primary": "#ffffff",
            "--text-secondary": "#ffcccc",
            "--glow-color": "rgba(255, 0, 0, 0.5)",
            "--font-display": "'Cinzel', serif",
            "--font-body": "'Noto Sans JP', sans-serif",
            "--border-style": "1px solid var(--accent-secondary)",
            "--animation-speed": "0.3s"
        },
        "ai_prompt": "Cybernetic samurai warrior in crimson armor, blood moon background, katana with glowing red edge, falling cherry blossoms mixed with digital rain, feudal Japan meets cyberpunk, cinematic lighting, 8k ultra detailed",
        "ai_model": "midjourney-v6"
    },
    {
        "slug": "neon-tokyo-drift",
        "name": "Neon Tokyo Drift",
        "tagline": "Speed. Light. Future.",
        "description": "High-octane Tokyo street racing aesthetic with neon kanji, speed lines, and pulsing cyberpunk cityscapes. Features animated neon signs and drift smoke effects.",
        "price": 3.99,
        "category": "cyberpunk",
        "tags": ["tokyo", "neon", "racing", "purple", "cyan", "animated"],
        "css_variables": {
            "--bg-primary": "#0a0a1a",
            "--bg-secondary": "#151528",
            "--accent-primary": "#ff00ff",
            "--accent-secondary": "#00ffff",
            "--text-primary": "#ffffff",
            "--text-secondary": "#ccccff",
            "--glow-color": "rgba(255, 0, 255, 0.6)",
            "--font-display": "'Orbitron', sans-serif",
            "--font-body": "'Rajdhani', sans-serif",
            "--border-style": "2px solid var(--accent-primary)",
            "--animation-speed": "0.2s"
        },
        "ai_prompt": "Tokyo street racing scene at midnight, neon purple and cyan lights reflecting on wet asphalt, drifting sports car with underglow, cyberpunk skyscrapers with holographic ads, motion blur, synthwave aesthetic, 8k photorealistic",
        "ai_model": "dalle3"
    },
    {
        "slug": "glitch-core",
        "name": "Glitch Core",
        "tagline": "Break the System.",
        "description": "Raw digital corruption aesthetic with CRT scanlines, chromatic aberration, and intentional glitch effects. For hackers who embrace the noise.",
        "price": 2.99,
        "category": "minimal",
        "tags": ["glitch", "retro", "green", "black", "animated", "hacker"],
        "css_variables": {
            "--bg-primary": "#000000",
            "--bg-secondary": "#0a0a0a",
            "--accent-primary": "#00ff41",
            "--accent-secondary": "#ff0000",
            "--text-primary": "#00ff41",
            "--text-secondary": "#008f11",
            "--glow-color": "rgba(0, 255, 65, 0.4)",
            "--font-display": "'VT323', monospace",
            "--font-body": "'Share Tech Mono', monospace",
            "--border-style": "1px dashed var(--accent-primary)",
            "--animation-speed": "0.1s"
        },
        "ai_prompt": "Digital glitch art, corrupted data visualization, chromatic aberration, RGB split, scanlines, matrix-like falling code, corrupted 3D wireframes, vaporwave sunset glitching, retro computer aesthetic, cyberpunk terminal",
        "ai_model": "stable-diffusion-xl"
    },
    {
        "slug": "void-obsidian",
        "name": "Void Obsidian",
        "tagline": "Embrace the Dark.",
        "description": "Premium dark mode for professionals. Deep blacks with subtle purple accents. OLED-optimized with minimal eye strain.",
        "price": 0.00,
        "category": "minimal",
        "tags": ["dark", "minimal", "professional", "oled", "free"],
        "css_variables": {
            "--bg-primary": "#000000",
            "--bg-secondary": "#0d0d0d",
            "--accent-primary": "#9d4edd",
            "--accent-secondary": "#7b2cbf",
            "--text-primary": "#e0e0e0",
            "--text-secondary": "#a0a0a0",
            "--glow-color": "rgba(157, 78, 221, 0.3)",
            "--font-display": "'Inter', sans-serif",
            "--font-body": "'Inter', sans-serif",
            "--border-style": "1px solid #1a1a1a",
            "--animation-speed": "0.3s"
        },
        "ai_prompt": "Abstract obsidian crystal formations in pure darkness, subtle purple light refraction, minimal geometric shapes, premium dark aesthetic, 8k render",
        "ai_model": "midjourney-v6"
    },
    {
        "slug": "acid-wasteland",
        "name": "Acid Wasteland",
        "tagline": "Toxic. Loud. Alive.",
        "description": "Post-apocalyptic radioactive theme with toxic green/yellow gradients and grunge textures. Warning: May cause mutations.",
        "price": 3.49,
        "category": "cyberpunk",
        "tags": ["toxic", "green", "yellow", "post-apocalyptic", "grunge"],
        "css_variables": {
            "--bg-primary": "#0f1a0f",
            "--bg-secondary": "#1a2e1a",
            "--accent-primary": "#ccff00",
            "--accent-secondary": "#39ff14",
            "--text-primary": "#f0fff0",
            "--text-secondary": "#ccffcc",
            "--glow-color": "rgba(204, 255, 0, 0.5)",
            "--font-display": "'Black Ops One', cursive",
            "--font-body": "'Roboto Condensed', sans-serif",
            "--border-style": "2px groove var(--accent-primary)",
            "--animation-speed": "0.25s"
        },
        "ai_prompt": "Toxic wasteland with glowing acid pools, radioactive warning signs, mutant flora, post-apocalyptic bunker interior, green and yellow toxic fog, industrial grunge, fallout aesthetic",
        "ai_model": "dalle3"
    },
    {
        "slug": "royal-obsidian",
        "name": "Royal Obsidian",
        "tagline": "Rule Your Code.",
        "description": "Luxurious dark theme with gold and deep purple accents. For developers who demand elegance.",
        "price": 5.99,
        "category": "minimal",
        "tags": ["luxury", "gold", "purple", "premium", "elegant"],
        "css_variables": {
            "--bg-primary": "#0a0a0f",
            "--bg-secondary": "#151520",
            "--accent-primary": "#ffd700",
            "--accent-secondary": "#9966cc",
            "--text-primary": "#ffffff",
            "--text-secondary": "#d4af37",
            "--glow-color": "rgba(255, 215, 0, 0.4)",
            "--font-display": "'Playfair Display', serif",
            "--font-body": "'Lato', sans-serif",
            "--border-style": "1px solid var(--accent-primary)",
            "--animation-speed": "0.4s"
        },
        "ai_prompt": "Luxurious throne room with obsidian walls, gold accents, purple velvet, royal aesthetic, dark elegance, premium interior design, cinematic lighting",
        "ai_model": "midjourney-v6"
    },
    {
        "slug": "synthwave-sunset",
        "name": "Synthwave Sunset",
        "tagline": "Forever 1984.",
        "description": "Retro-futuristic synthwave aesthetic with grid horizons, chrome gradients, and palm tree silhouettes. Pure 80s nostalgia.",
        "price": 2.99,
        "category": "retro",
        "tags": ["synthwave", "retro", "80s", "pink", "blue", "sunset"],
        "css_variables": {
            "--bg-primary": "#1a0b2e",
            "--bg-secondary": "#2d1b4e",
            "--accent-primary": "#ff71ce",
            "--accent-secondary": "#01cdfe",
            "--text-primary": "#ffffff",
            "--text-secondary": "#ffb6c1",
            "--glow-color": "rgba(255, 113, 206, 0.5)",
            "--font-display": "'Road Rage', cursive",
            "--font-body": "'Outrun Future', sans-serif",
            "--border-style": "1px solid var(--accent-primary)",
            "--animation-speed": "0.3s"
        },
        "ai_prompt": "Synthwave sunset with grid horizon, chrome sphere, palm trees silhouette, pink and blue gradient sky, 1980s retro aesthetic, retrowave, outrun style",
        "ai_model": "stable-diffusion-xl"
    },
    {
        "slug": "hacker-terminal",
        "name": "Hacker Terminal",
        "tagline": "Root Access Granted.",
        "description": "Authentic terminal experience with monospace fonts, blink cursors, and Matrix-style rain effects. True hackers only.",
        "price": 0.00,
        "category": "minimal",
        "tags": ["terminal", "hacker", "matrix", "green", "monospace", "free"],
        "css_variables": {
            "--bg-primary": "#000000",
            "--bg-secondary": "#001100",
            "--accent-primary": "#00ff00",
            "--accent-secondary": "#003300",
            "--text-primary": "#00ff00",
            "--text-secondary": "#008800",
            "--glow-color": "rgba(0, 255, 0, 0.6)",
            "--font-display": "'Courier New', monospace",
            "--font-body": "'Courier New', monospace",
            "--border-style": "1px solid #003300",
            "--animation-speed": "0.05s"
        },
        "ai_prompt": "Hacker terminal screen with green text on black background, matrix digital rain, command line interface, code scrolling, cybersecurity aesthetic",
        "ai_model": "dalle3"
    },
    {
        "slug": "arctic-frost",
        "name": "Arctic Frost",
        "tagline": "Cold. Clean. Focused.",
        "description": "Crisp arctic aesthetic with ice blues, whites, and subtle frost effects. Perfect for focused coding sessions.",
        "price": 1.99,
        "category": "minimal",
        "tags": ["cold", "blue", "white", "clean", "focus"],
        "css_variables": {
            "--bg-primary": "#0a1628",
            "--bg-secondary": "#142442",
            "--accent-primary": "#00d4ff",
            "--accent-secondary": "#87ceeb",
            "--text-primary": "#ffffff",
            "--text-secondary": "#b0e0e6",
            "--glow-color": "rgba(0, 212, 255, 0.4)",
            "--font-display": "'Nunito', sans-serif",
            "--font-body": "'Nunito', sans-serif",
            "--border-style": "1px solid rgba(135, 206, 235, 0.3)",
            "--animation-speed": "0.35s"
        },
        "ai_prompt": "Arctic ice cave with crystal formations, aurora borealis, frozen waterfall, ice blue and white color palette, pristine snow, cold atmosphere, 8k nature photography",
        "ai_model": "midjourney-v6"
    },
    {
        "slug": "inferno-forged",
        "name": "Inferno Forged",
        "tagline": "Born in Fire.",
        "description": "Intense volcanic theme with magma flows, ember particles, and forge-like heat. For those who like it hot.",
        "price": 3.99,
        "category": "cyberpunk",
        "tags": ["fire", "orange", "red", "magma", "intense"],
        "css_variables": {
            "--bg-primary": "#1a0500",
            "--bg-secondary": "#2d0a00",
            "--accent-primary": "#ff4500",
            "--accent-secondary": "#ff8c00",
            "--text-primary": "#fff5e6",
            "--text-secondary": "#ffcc99",
            "--glow-color": "rgba(255, 69, 0, 0.5)",
            "--font-display": "'Cinzel Decorative', serif",
            "--font-body": "'Merriweather', serif",
            "--border-style": "1px solid var(--accent-primary)",
            "--animation-speed": "0.2s"
        },
        "ai_prompt": "Volcanic forge with flowing magma, blacksmith anvil glowing orange, sparks flying, hellish landscape, fire and brimstone, intense heat waves, fantasy forge",
        "ai_model": "dalle3"
    },
    {
        "slug": "futuristic-empire-os",
        "name": "Futuristic Empire OS",
        "tagline": "Command Your Universe",
        "description": "A majestic, imperial interface for those who rule their digital domain. Deep space blacks meet royal gold accents with holographic UI elements.",
        "price": 6.99,
        "category": "cyberpunk",
        "tags": ["empire", "royal", "gold", "space", "command", "luxury", "os"],
        "css_variables": {
            "--bg-primary": "#050508",
            "--bg-secondary": "#0a0a12",
            "--bg-panel": "rgba(10, 10, 18, 0.95)",
            "--accent-primary": "#ffd700",
            "--accent-secondary": "#ff8c00",
            "--accent-glow": "#ffb700",
            "--text-primary": "#ffffff",
            "--text-secondary": "#c0b0a0",
            "--text-muted": "#6a6050",
            "--border-color": "rgba(255, 215, 0, 0.3)",
            "--glow-color": "rgba(255, 215, 0, 0.4)",
            "--font-display": "'Orbitron', 'Cinzel', sans-serif",
            "--font-body": "'Inter', 'Segoe UI', sans-serif",
            "--border-style": "1px solid var(--border-color)",
            "--shadow-empire": "0 10px 40px rgba(0, 0, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.1)",
            "--animation-speed": "0.3s"
        },
        "ai_prompt": "Futuristic imperial command center interface, deep space black background, holographic gold UI elements, royal throne room meets starship bridge, elegant gold and orange accents, sci-fi empire aesthetic, cinematic lighting, 8k render",
        "ai_model": "midjourney-v6",
        "status": "featured"
    }
]

CATEGORIES = [
    {"slug": "cyberpunk", "name": "Cyberpunk", "description": "Neon, dystopia, and high-tech aesthetics", "icon": "⚡"},
    {"slug": "minimal", "name": "Minimal", "description": "Clean, simple, and distraction-free", "icon": "◆"},
    {"slug": "retro", "name": "Retro", "description": "Nostalgic 80s and 90s vibes", "icon": "📼"},
    {"slug": "nature", "name": "Nature", "description": "Organic and natural world inspired", "icon": "🌿"},
    {"slug": "abstract", "name": "Abstract", "description": "Artistic and experimental designs", "icon": "🎨"}
]

# ═══════════════════════════════════════════════════════════════
# DATABASE FUNCTIONS
# ═══════════════════════════════════════════════════════════════

class MarketplaceDB:
    def __init__(self, db_path: str = "unified.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection with row factory."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize the marketplace database schema."""
        conn = self.get_connection()
        try:
            conn.executescript(MARKETPLACE_SCHEMA)
            conn.commit()
            logger.info("Marketplace database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize marketplace DB: {e}")
            raise
        finally:
            conn.close()
    
    def seed_categories(self) -> int:
        """Seed default categories. Returns count added."""
        conn = self.get_connection()
        cursor = conn.cursor()
        added = 0
        
        for idx, cat in enumerate(CATEGORIES):
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO marketplace_categories 
                    (slug, name, description, icon, sort_order)
                    VALUES (?, ?, ?, ?, ?)
                """, (cat["slug"], cat["name"], cat["description"], cat["icon"], idx))
                if cursor.rowcount > 0:
                    added += 1
            except Exception as e:
                logger.warning(f"Failed to add category {cat['slug']}: {e}")
        
        conn.commit()
        conn.close()
        return added
    
    def seed_themes(self) -> int:
        """Seed AI-generated themes. Returns count added."""
        conn = self.get_connection()
        cursor = conn.cursor()
        added = 0
        now = datetime.now().isoformat()
        
        for theme in THEME_SEEDS:
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO marketplace_themes 
                    (slug, name, tagline, description, price, currency, category, tags,
                     css_variables, ai_prompt, ai_model, status, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    theme["slug"],
                    theme["name"],
                    theme.get("tagline", ""),
                    theme["description"],
                    theme["price"],
                    theme.get("currency", "USD"),
                    theme["category"],
                    json.dumps(theme["tags"]),
                    json.dumps(theme["css_variables"]),
                    theme["ai_prompt"],
                    theme["ai_model"],
                    theme.get("status", "active"),
                    now,
                    now
                ))
                if cursor.rowcount > 0:
                    added += 1
                    logger.info(f"Added theme: {theme['name']}")
            except Exception as e:
                logger.error(f"Failed to add theme {theme['name']}: {e}")
        
        # Update category counts
        cursor.execute("""
            UPDATE marketplace_categories 
            SET theme_count = (
                SELECT COUNT(*) FROM marketplace_themes 
                WHERE marketplace_themes.category = marketplace_categories.slug
                AND marketplace_themes.status = 'active'
            )
        """)
        
        conn.commit()
        conn.close()
        return added
    
    def get_all_themes(self, category: Optional[str] = None, 
                       status: str = "active") -> List[Dict]:
        """Get all themes with optional filtering."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Include both active and featured themes
        if status == "active":
            query = "SELECT * FROM marketplace_themes WHERE status IN ('active', 'featured')"
            params = []
        else:
            query = "SELECT * FROM marketplace_themes WHERE status = ?"
            params = [status]
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        query += " ORDER BY sales_count DESC, rating DESC"
        
        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()
        
        themes = []
        for row in rows:
            theme = dict(row)
            try:
                theme["tags"] = json.loads(theme.get("tags") or "[]")
            except:
                theme["tags"] = []
            try:
                theme["css_variables"] = json.loads(theme.get("css_variables") or "{}")
            except:
                theme["css_variables"] = {}
            try:
                theme["screenshots"] = json.loads(theme.get("screenshots") or "[]")
            except:
                theme["screenshots"] = []
            themes.append(theme)
        
        return themes
    
    def get_theme_by_slug(self, slug: str) -> Optional[Dict]:
        """Get a single theme by its slug."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM marketplace_themes WHERE slug = ?", (slug,))
        row = cursor.fetchone()
        conn.close()
        
        if row:
            theme = dict(row)
            try:
                theme["tags"] = json.loads(theme.get("tags") or "[]")
            except:
                theme["tags"] = []
            try:
                theme["css_variables"] = json.loads(theme.get("css_variables") or "{}")
            except:
                theme["css_variables"] = {}
            try:
                theme["screenshots"] = json.loads(theme.get("screenshots") or "[]")
            except:
                theme["screenshots"] = []
            return theme
        return None
    
    def get_categories(self) -> List[Dict]:
        """Get all categories with theme counts."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM marketplace_categories 
            ORDER BY sort_order, name
        """)
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]
    
    def record_purchase(self, user_id: str, theme_id: int, 
                        price: float, currency: str = "USD",
                        transaction_id: Optional[str] = None) -> bool:
        """Record a theme purchase."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Record purchase
            cursor.execute("""
                INSERT INTO marketplace_purchases 
                (user_id, theme_id, purchase_price, currency, transaction_id, purchased_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (user_id, theme_id, price, currency, transaction_id, 
                  datetime.now().isoformat()))
            
            # Update sales count
            cursor.execute("""
                UPDATE marketplace_themes 
                SET sales_count = sales_count + 1
                WHERE id = ?
            """, (theme_id,))
            
            conn.commit()
            return True
        except Exception as e:
            logger.error(f"Failed to record purchase: {e}")
            return False
        finally:
            conn.close()
    
    def get_user_purchases(self, user_id: str) -> List[Dict]:
        """Get all themes purchased by a user."""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT t.*, p.purchased_at, p.purchase_price
            FROM marketplace_themes t
            JOIN marketplace_purchases p ON t.id = p.theme_id
            WHERE p.user_id = ?
            ORDER BY p.purchased_at DESC
        """, (user_id,))
        
        rows = cursor.fetchall()
        conn.close()
        
        themes = []
        for row in rows:
            theme = dict(row)
            try:
                theme["tags"] = json.loads(theme.get("tags") or "[]")
            except:
                theme["tags"] = []
            try:
                theme["css_variables"] = json.loads(theme.get("css_variables") or "{}")
            except:
                theme["css_variables"] = {}
            themes.append(theme)
        
        return themes

# ═══════════════════════════════════════════════════════════════
# SEEDING FUNCTION
# ═══════════════════════════════════════════════════════════════

def seed_marketplace(db_path: str = "unified.db") -> Dict[str, int]:
    """
    Seed the marketplace with categories and AI-generated themes.
    Returns counts of items added.
    """
    logger.info("Starting marketplace seeding...")
    
    db = MarketplaceDB(db_path)
    
    categories_added = db.seed_categories()
    logger.info(f"✅ Categories added: {categories_added}")
    
    themes_added = db.seed_themes()
    logger.info(f"✅ Themes added: {themes_added}")
    
    return {
        "categories": categories_added,
        "themes": themes_added,
        "total": categories_added + themes_added
    }

if __name__ == "__main__":
    # Run seeding when script is executed directly
    logging.basicConfig(level=logging.INFO)
    result = seed_marketplace()
    print(f"\nSeeding complete! Added {result['total']} items:")
    print(f"   - Categories: {result['categories']}")
    print(f"   - Themes: {result['themes']}")
