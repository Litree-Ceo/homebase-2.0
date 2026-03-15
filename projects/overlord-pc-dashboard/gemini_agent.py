"""Google Gemini AI agent for Overlord Dashboard."""

import logging
import os
import sys
import time
from typing import Optional

import google.generativeai as genai
from dotenv import load_dotenv

# Use core logger for consistency and security sanitization
try:
    from core import get_logger

    logger = get_logger(__name__)
except ImportError:
    # Fallback if core not available
    logger = logging.getLogger(__name__)

# --- Configuration ---
MAX_RETRIES = 3
INITIAL_BACKOFF = 2
DEFAULT_MODEL = "gemini-1.0-pro"


def get_gemini_response(prompt: str) -> str:
    """Gets a response from the Gemini API with exponential backoff."""
    load_dotenv()  # Load environment variables from .env
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        return "Error: GEMINI_API_KEY not found. Please set it in your .env file."

    logger.debug("Configuring Gemini API with provided key")
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(DEFAULT_MODEL)

    retries = 0
    backoff_time = INITIAL_BACKOFF

    while retries < MAX_RETRIES:
        try:
            response = model.generate_content(prompt)
            logger.info("Successfully generated response from Gemini API")
            return response.text
        except Exception as e:
            retries += 1
            logger.warning(
                "Gemini API error (attempt %d/%d): %s. Retrying in %d seconds...",
                retries,
                MAX_RETRIES,
                str(e),
                backoff_time,
            )
            time.sleep(backoff_time)
            backoff_time *= 2  # Exponential backoff

    logger.error("Failed to get response from Gemini API after %d retries", MAX_RETRIES)
    return f"Error: Failed to get a response after {MAX_RETRIES} retries. Please check your API key and network connection."


if __name__ == "__main__":
    if len(sys.argv) > 1:
        input_prompt = sys.argv[1]
        # The response is printed to stdout, which will be captured by the server
        print(get_gemini_response(input_prompt))
    else:
        logger.error("No prompt provided to Gemini agent")
        print("Error: No prompt provided.", file=sys.stderr)
