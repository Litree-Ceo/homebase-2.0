import os

import requests
from telegram import Update
from telegram.ext import Application, ContextTypes, MessageHandler, filters

BRIDGE_URL = os.environ.get(
    "OVERLORD_BRIDGE_URL",
    "https://<your-project-id>.cloudfunctions.net/botWebhook",
)
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN")
BOT_WEBHOOK_SECRET = os.environ.get("BOT_WEBHOOK_SECRET", "")
TARGET_UID = os.environ.get("OVERLORD_TARGET_UID", "public")


async def forward(update: Update, _context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.text:
        return

    text = update.message.text.lower().strip()

    try:
        payload = {
            "channel": "telegram",
            "text": text,
            "uid": TARGET_UID,
            "senderId": (
                str(update.effective_user.id) if update.effective_user else "unknown"
            ),
            "senderName": (
                update.effective_user.username
                if update.effective_user and update.effective_user.username
                else (
                    update.effective_user.first_name
                    if update.effective_user
                    else "telegram-user"
                )
            ),
            "chatId": (
                str(update.effective_chat.id) if update.effective_chat else "unknown"
            ),
            "raw": update.to_dict(),
        }
        headers = {}
        if BOT_WEBHOOK_SECRET:
            headers["x-overlord-bot-secret"] = BOT_WEBHOOK_SECRET

        requests.post(
            f"{BRIDGE_URL}?channel=telegram&uid={TARGET_UID}",
            json=payload,
            headers=headers,
            timeout=10,
        )
        await update.message.reply_text(f"OVERLORD RECEIVED FROM TELEGRAM: {text}")
    except requests.RequestException as exc:
        await update.message.reply_text(f"BRIDGE ERROR: {exc}")


if __name__ == "__main__":
    if BOT_TOKEN == "YOUR_BOT_TOKEN":
        raise RuntimeError(
            "Set TELEGRAM_BOT_TOKEN before running telegram_overlord_bot.py"
        )

    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, forward))
    app.run_polling()
