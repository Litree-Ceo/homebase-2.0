"""
DeepSeek Chat Client - Python Integration
Minimal, reusable wrapper for DeepSeek API
No hardcoded secrets - uses env vars only
"""

import os
import json
from typing import Optional, List, Dict, Any
import requests


class DeepSeekMessage:
    """Message structure for DeepSeek API"""

    def __init__(self, role: str, content: str):
        self.role = role  # "system", "user", or "assistant"
        self.content = content

    def to_dict(self) -> Dict[str, str]:
        return {"role": self.role, "content": self.content}


class DeepSeekClient:
    """DeepSeek API client wrapper"""

    API_URL = "https://api.deepseek.com/chat/completions"

    def __init__(self, api_key: Optional[str] = None, timeout: int = 60):
        self.api_key = api_key or os.getenv("DEEPSEEK_API_KEY")
        if not self.api_key:
            raise RuntimeError(
                "Missing DEEPSEEK_API_KEY env var. "
                "Add it to .env.local or set environment variable."
            )
        self.timeout = timeout

    def chat(
        self,
        messages: List[DeepSeekMessage],
        model: str = "deepseek-chat",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        frequency_penalty: Optional[float] = None,
        presence_penalty: Optional[float] = None,
        stop: Optional[List[str]] = None,
    ) -> str:
        """
        Call DeepSeek Chat API
        
        Args:
            messages: List of DeepSeekMessage objects
            model: Model name (default: deepseek-chat)
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            top_p: Nucleus sampling parameter
            frequency_penalty: Frequency penalty (-2.0-2.0)
            presence_penalty: Presence penalty (-2.0-2.0)
            stop: Stop sequences
            
        Returns:
            Response text from the model
            
        Raises:
            RuntimeError: If API call fails
        """
        payload: Dict[str, Any] = {
            "model": model,
            "messages": [msg.to_dict() for msg in messages],
            "temperature": temperature,
        }

        # Add optional parameters if provided
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if top_p is not None:
            payload["top_p"] = top_p
        if frequency_penalty is not None:
            payload["frequency_penalty"] = frequency_penalty
        if presence_penalty is not None:
            payload["presence_penalty"] = presence_penalty
        if stop is not None:
            payload["stop"] = stop

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            response = requests.post(
                self.API_URL,
                headers=headers,
                json=payload,
                timeout=self.timeout,
            )

            if response.status_code >= 400:
                error_text = response.text
                raise RuntimeError(
                    f"DeepSeek API error {response.status_code}: {error_text}"
                )

            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content")

            if not content:
                raise RuntimeError("No content in DeepSeek response")

            return content

        except requests.RequestException as e:
            raise RuntimeError(f"DeepSeek API request failed: {str(e)}")

    def generate_code(
        self,
        prompt: str,
        language: str = "python",
        temperature: float = 0.3,
    ) -> str:
        """
        Generate code using DeepSeek
        
        Args:
            prompt: Code generation prompt
            language: Programming language (python, typescript, javascript, etc)
            temperature: Lower temp (0.3) for more deterministic code
            
        Returns:
            Generated code
        """
        messages = [
            DeepSeekMessage(
                "system",
                f"You are an expert code generator. Generate clean, well-structured {language} code. "
                "Return only the code, no explanations.",
            ),
            DeepSeekMessage("user", prompt),
        ]
        return self.chat(messages, temperature=temperature)

    def simple_chat(self, user_message: str) -> str:
        """
        Simple one-turn chat
        
        Args:
            user_message: User's message
            
        Returns:
            Model's response
        """
        messages = [
            DeepSeekMessage("system", "You are a helpful assistant."),
            DeepSeekMessage("user", user_message),
        ]
        return self.chat(messages)
