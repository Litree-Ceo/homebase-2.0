"""Discord webhook client for Overlord Dashboard notifications."""

import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, TypedDict, Union

import requests

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    log = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    log = logging.getLogger(__name__)


class DiscordEmbed(TypedDict, total=False):
    """Type definition for Discord embed structure."""

    title: str
    description: str
    color: int
    footer: Dict[str, str]
    timestamp: str


class DiscordPayload(TypedDict):
    """Type definition for Discord webhook payload."""

    embeds: List[DiscordEmbed]


def send_discord_notification(
    message: str, embed_title: str, embed_color: int = 3447003
) -> bool:
    """Sends a formatted message to a Discord webhook.

    Args:
        message: Main message content to send.
        embed_title: Title for the embed.
        embed_color: Color integer for the embed (default: blue).

    Returns:
        True if notification was sent successfully, False otherwise.
    """
    webhook_url: Optional[str] = os.getenv("DISCORD_WEBHOOK_URL")

    if not webhook_url or "your_webhook_url_here" in webhook_url:
        log.debug(
            "DISCORD_WEBHOOK_URL not set or is a placeholder. Skipping notification."
        )
        return False

    headers: Dict[str, str] = {"Content-Type": "application/json"}

    embed: DiscordEmbed = {
        "title": embed_title,
        "description": message,
        "color": embed_color,
        "footer": {"text": "Overlord PC Dashboard"},
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

    payload: DiscordPayload = {"embeds": [embed]}

    try:
        response: requests.Response = requests.post(webhook_url, json=payload)
        response.raise_for_status()  # Raise an exception for bad status codes
        log.info("Successfully sent Discord notification.")
        return True
    except requests.exceptions.RequestException as e:
        log.error("Failed to send Discord notification: %s", e)
        return False


if __name__ == "__main__":
    # Example usage for direct testing
    from dotenv import load_dotenv

    load_dotenv()
    send_discord_notification(
        message="This is a test notification from the Overlord Dashboard.",
        embed_title="System Test",
        embed_color=15158332,  # Red for test
    )
