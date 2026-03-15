#!/usr/bin/env python3
"""Test the marketplace seeding."""
import sys
sys.path.insert(0, '.')
from marketplace_models import seed_marketplace

result = seed_marketplace('unified.db')
print(f"Seeded {result['themes']} themes and {result['categories']} categories")
print("Theme slugs:")
for theme in [
    "blood-samurai", "neon-tokyo-drift", "glitch-core", 
    "void-obsidian", "acid-wasteland", "royal-obsidian",
    "synthwave-sunset", "hacker-terminal", "arctic-frost", "inferno-forged"
]:
    print(f"  - {theme}")
