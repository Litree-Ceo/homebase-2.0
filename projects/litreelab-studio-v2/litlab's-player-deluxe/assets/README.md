# Overlord Logo Assets

Professional logo files for the System Overlord PC Dashboard.

## Files

| File | Description | Use Case |
|------|-------------|----------|
| `logo-overlord.svg` | Full featured logo with glow effects, hex grid, circuit traces | Main app icon, marketing |
| `logo-overlord-simple.svg` | Clean version with reduced details | Small sizes, favicon base |
| `logo-overlord-minimal.svg` | Minimal diamond symbol only | System tray, tiny icons |
| `logo-overlord-animated.svg` | Animated version with pulsing effects | Web splash screens, loading states |

## Generating PNGs

To generate PNG versions for all platforms:

```bash
cd assets
pip install cairosvg
python generate-pngs.py
```

This creates PNGs in the `png/` folder at sizes: 16, 32, 48, 57, 72, 96, 114, 144, 180, 192, 256, 512, 1024px

## Design Specs

- **Primary Colors:**
  - Cyan: `#52f2ff` (main accent)
  - Magenta: `#ff4ddb` (secondary glow)
  - Gold: `#f8d874` (highlights)
  - Background: `#0a0a0f` (deep space black)

- **Symbol:** Diamond with vertical line (◈) - represents "Overlord" monitoring core

- **Style:** Cyberpunk, glassmorphism, neon glow

## Usage in HTML

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="assets/logo-overlord-simple.svg">
<link rel="icon" type="image/png" sizes="32x32" href="assets/png/favicon-32.png">

<!-- Apple Touch -->
<link rel="apple-touch-icon" sizes="180x180" href="assets/png/apple-touch-180.png">

<!-- PWA -->
<link rel="manifest" href="manifest.json">
```

## License

Part of the Overlord PC Dashboard project.
