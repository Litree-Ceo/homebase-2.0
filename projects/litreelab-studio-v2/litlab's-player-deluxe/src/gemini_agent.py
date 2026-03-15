"""
A robust agent for interacting with the Google Gemini Pro API.

This script provides a command-line interface to generate content using the
Google Gemini Pro model. It includes enhanced error handling, configuration
management, streaming, and retry logic.

*** IMPORTANT ***
This is a Python script (.py) and must be executed with a Python interpreter.
It CANNOT be imported or required directly into JavaScript files (e.g., app.js).
Attempting to do so will cause a `ReferenceError: module is not defined`.

To run this script:
python gemini_agent.py "Your prompt here"
"""

import os
import sys
import time
import argparse
from google import genai

# ─── Constants ───────────────────────────────────────────────────────────────
MAX_RETRIES = 3
INITIAL_BACKOFF = 2
DEFAULT_MODEL = "gemini-pro"


# ─── Custom Exceptions ───────────────────────────────────────────────────────
class GeminiAgentError(Exception):
    """Base exception for all agent-related errors."""


class ApiKeyError(GeminiAgentError):
    """Raised when the API key is missing or invalid."""


class ModelError(GeminiAgentError):
    """Raised for errors during model initialization."""


class ContentGenerationError(GeminiAgentError):
    """Raised for errors during content generation."""


# ─── Core Functions ──────────────────────────────────────────────────────────
def get_client(api_key: str):
    """Creates and returns a Gemini client with the provided API key."""
    try:
        return genai.Client(api_key=api_key)
    except (ValueError, TypeError) as e:
        raise ApiKeyError(f"Failed to create Gemini client: {e}") from e


def generate_content(
    client: genai.Client, model_name: str, prompt: str, stream: bool = False
):
    """Generates content from the model with retry logic."""
    retries = 0
    backoff = INITIAL_BACKOFF
    while retries < MAX_RETRIES:
        try:
            if stream:
                for chunk in client.models.generate_content_stream(
                    model=model_name, contents=prompt
                ):
                    print(chunk.text, end="", flush=True)
                print()  # Final newline
                return

            response = client.models.generate_content(
                model=model_name, contents=prompt
            )
            print(response.text)
            return

        except (ValueError, TypeError, genai.APIError) as e:  # pylint: disable=no-member
            error_str = str(e)
            if "RESOURCE_EXHAUSTED" in error_str or "503" in error_str:
                retries += 1
                if retries >= MAX_RETRIES:
                    raise ContentGenerationError(
                        f"API issue after {MAX_RETRIES} attempts: {e}"
                    ) from e
                print(f"Transient error. Retrying in {backoff}s...", file=sys.stderr)
                time.sleep(backoff)
                backoff *= 2
            else:
                raise ContentGenerationError(f"Unexpected error during generation: {e}") from e


# ─── Main Execution ──────────────────────────────────────────────────────────
def main():
    """Main function to parse arguments and run the agent."""
    parser = argparse.ArgumentParser(
        description="A robust CLI for Google's Gemini Pro API.",
        epilog='Example: python gemini_agent.py "Tell me a story about a robot" -s',
    )
    parser.add_argument("prompt", type=str, help="The prompt to send to the model.")
    parser.add_argument(
        "-m",
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help=f"Model to use (default: {DEFAULT_MODEL})",
    )
    parser.add_argument(
        "--api-key", type=str, default=None, help="Your Gemini API key."
    )
    parser.add_argument(
        "-s", "--stream", action="store_true", help="Stream the response."
    )
    args = parser.parse_args()

    try:
        api_key = args.api_key or os.getenv("GEMINI_API_KEY")
        if not api_key or "YOUR_API_KEY_HERE" in api_key:
            raise ApiKeyError(
                "API key not found or is a placeholder. Please set your GEMINI_API_KEY in the .env file."
            )
        client = get_client(api_key)
        generate_content(client, args.model, args.prompt, args.stream)
    except GeminiAgentError as e:
        print(f"\n[AGENT ERROR] {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
