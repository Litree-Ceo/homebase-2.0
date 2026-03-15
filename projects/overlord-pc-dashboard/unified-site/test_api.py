#!/usr/bin/env python3
"""Test the marketplace API."""
import urllib.request
import json

base = 'http://localhost:5000'

try:
    # Test stats
    req = urllib.request.Request(f'{base}/api/marketplace/stats')
    resp = urllib.request.urlopen(req, timeout=5)
    stats = json.loads(resp.read().decode())
    print('Stats:', stats)
    
    # Test categories
    req = urllib.request.Request(f'{base}/api/marketplace/categories')
    resp = urllib.request.urlopen(req, timeout=5)
    cats = json.loads(resp.read().decode())
    print(f'Categories: {len(cats)}')
    for c in cats:
        print(f'  - {c["name"]}: {c["theme_count"]} themes')
    
    # Test themes
    req = urllib.request.Request(f'{base}/api/marketplace/themes')
    resp = urllib.request.urlopen(req, timeout=5)
    themes = json.loads(resp.read().decode())
    print(f'Themes: {len(themes)}')
    for t in themes[:5]:
        print(f'  - {t["name"]} (${t["price"]}) - {t["tagline"]}')
        
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
