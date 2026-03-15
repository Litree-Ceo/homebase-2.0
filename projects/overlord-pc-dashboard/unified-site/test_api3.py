#!/usr/bin/env python3
"""Test the marketplace API on port 5051."""
import urllib.request
import json

base = 'http://localhost:5051'

try:
    # Test health
    req = urllib.request.Request(f'{base}/api/health')
    resp = urllib.request.urlopen(req, timeout=5)
    health = json.loads(resp.read().decode())
    print('Health:', health)
    
    # Test themes
    req = urllib.request.Request(f'{base}/api/marketplace/themes')
    resp = urllib.request.urlopen(req, timeout=5)
    themes = json.loads(resp.read().decode())
    print(f'\nThemes ({len(themes)}):')
    for t in themes:
        price = "FREE" if t["price"] == 0 else f"${t['price']}"
        print(f'  - {t["name"]} ({price})')
        print(f'    Tagline: {t["tagline"]}')
        print(f'    Tags: {", ".join(t["tags"][:3])}')
        print()
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
