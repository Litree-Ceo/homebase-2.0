# Real-Debrid Panel Integration Guide

## API Endpoints Handled
Your `server.py` already supports these 4 core endpoints:
1. `GET /api/stream/config` - Check if RD_API_KEY is set.
2. `GET /api/stream/torrents` - List active torrents.
3. `POST /api/stream/addMagnet` - Add a new magnet link.
4. `POST /api/stream/unrestrict` - Convert a file link into a streaming URL.

## How to use the Controller
The `realdebrid_controller.js` uses the existing `makeHeaders()` and `apiKey` logic from your dashboard to ensure authentication works out of the box.

## UI Components
- **Torrent List**: Auto-refreshes every 10 seconds.
- **Magnet Input**: Validation for `magnet:` strings.
- **Streaming**: Supports opening unrestricted links in native players.
