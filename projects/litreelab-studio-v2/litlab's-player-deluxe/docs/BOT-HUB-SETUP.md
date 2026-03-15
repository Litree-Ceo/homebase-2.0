# Bot Hub Setup (Telegram + OpenClaw + Others)

This project now includes a unified bot ingress in Firebase Functions:

- Function: `botWebhook` (HTTP)
- Event read API: `listBotEvents` (callable)
- Firestore paths:
  - `bot_events` (global, server-only)
  - `users/{uid}/bot_events` (user stream, readable by owner)

## Why this is the best setup

- One secure webhook endpoint for every bot channel
- Shared event format for website features (notifications, commands, inbox)
- Firebase-native auth/rules and server-side writes only
- Easy to add new channels without changing frontend architecture

## 1) Set function secret

Set this before deploy so webhooks are protected:

```powershell
cd functions
firebase functions:secrets:set BOT_WEBHOOK_SECRET
```

Use the same secret value in each bot client via header:

- `x-overlord-bot-secret: <secret>`

## 2) Deploy functions + rules

```powershell
cd ..
firebase deploy --only functions,firestore:rules
```

## 3) Telegram bot wiring

The script `modules/dashboard/telegram_overlord_bot.py` now sends to Firebase `botWebhook`.

Set env vars before launch:

```powershell
$env:TELEGRAM_BOT_TOKEN = "<telegram token>"
$env:BOT_WEBHOOK_SECRET = "<same secret>"
$env:OVERLORD_TARGET_UID = "<firebase uid>"
python modules/dashboard/telegram_overlord_bot.py
```

## 4) OpenClaw (or any custom bot) wiring

Send POST requests to:

`https://<your-project-id>.cloudfunctions.net/botWebhook?channel=openclaw&uid=<firebase_uid>`

Example payload:

```json
{
  "channel": "openclaw",
  "text": "run diagnostics",
  "senderId": "openclaw-agent-1",
  "senderName": "OpenClaw",
  "chatId": "room-main"
}
```

Example curl:

```bash
curl -X POST "https://<your-project-id>.cloudfunctions.net/botWebhook?channel=openclaw&uid=<firebase_uid>" \
  -H "Content-Type: application/json" \
  -H "x-overlord-bot-secret: <secret>" \
  -d '{"channel":"openclaw","text":"status","senderId":"oc-1","senderName":"OpenClaw","chatId":"main"}'
```

## 5) Reading events in site code

Use callable function `listBotEvents` from authenticated frontend to fetch latest events for current user.

## 6) Termux bot strategy (recommended)

Run bot clients on Termux and keep Firebase as hub:

- Termux runs Telegram/OpenClaw processes (pm2)
- Bots post into `botWebhook`
- Website reads one unified stream

This keeps mobile automation fast and avoids exposing local bridge services.

## 7) VS Code launch profiles (recommended)

Use `.vscode/launch.json` profiles:

- `Overlord: Dashboard (Server)` for `modules/dashboard/server.py`
- `Overlord: Social Hub (Chrome)` for `modules/social/index.html`
- `Overlord: Telegram Bot` for `modules/dashboard/telegram_overlord_bot.py`

Before launching the Telegram profile, set these environment values in the launch config or terminal:

- `TELEGRAM_BOT_TOKEN`
- `BOT_WEBHOOK_SECRET`
- `OVERLORD_TARGET_UID`

If debugging on Python 3.14 is unstable, keep these flags enabled in launch config:

- `PYDEVD_USE_CYTHON=NO`
- `PYDEVD_USE_FRAME_EVAL=NO`
