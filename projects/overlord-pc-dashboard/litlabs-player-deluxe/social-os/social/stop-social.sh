#!/bin/bash
pkill -f "python3 -m http.server 3000" 2>/dev/null && echo "✅ Social Hub stopped" || echo "No running Social Hub found"
rm -f social.pid 2>/dev/null
