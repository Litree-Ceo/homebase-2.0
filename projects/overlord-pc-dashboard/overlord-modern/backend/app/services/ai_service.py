"""AI Service with OpenRouter Free Tier - ZERO COST MODEL MAP."""

import os
import ssl
import json
import urllib.request
import urllib.error
from typing import Optional, Dict, Any, List
from enum import Enum


class TaskType(str, Enum):
    """Task types for model selection."""
    CODE = "code"
    MARKET = "market"
    SCENE_CONTROL = "scene_control"
    REASONING = "reasoning"
    VISION = "vision"
    CHAT = "chat"


class AIService:
    """
    ZERO COST AI Service using OpenRouter Free Tier Only.
    
    FREE MODEL MAP (Zero Cost, Fully Free):
    - code: qwen3-coder (best coding) → gpt-oss-20b fallback
    - market: glm-4-5-air (thinking mode) → step-3.5-flash fallback  
    - scene_control: gpt-oss-120b (JSON tool calls) → qwen3-next fallback
    - reasoning: gpt-oss-120b (complex tasks) → arcee-trinity fallback
    - vision: qwen3-vl (UI→code) → nemotron-nano fallback
    - chat: arcee-trinity (creative) → llama-3.3 fallback
    """
    
    # ZERO COST MODEL MAP - Fully Free OpenRouter Models
    MODEL_MAP = {
        TaskType.CODE: {
            "model": "qwen/qwen3-coder-480b-a35b:free",
            "max_tokens": 4096,
            "temperature": 0.2,
            "fallback": "openai/gpt-oss-20b:free",
        },
        TaskType.MARKET: {
            "model": "z-ai/glm-4-5-air:free",
            "max_tokens": 1024,
            "temperature": 0.3,
            "fallback": "stepfun/step-3-5-flash:free",
            "supports_thinking": True,  # GLM-4.5 has thinking mode toggle
        },
        TaskType.SCENE_CONTROL: {
            "model": "openai/gpt-oss-120b:free",
            "max_tokens": 512,
            "temperature": 0.1,
            "fallback": "qwen/qwen3-next-80b-a3b-instruct:free",
        },
        TaskType.REASONING: {
            "model": "openai/gpt-oss-120b:free",
            "max_tokens": 8192,
            "temperature": 0.7,
            "fallback": "arcee-ai/arcee-trinity-large-preview:free",
        },
        TaskType.VISION: {
            "model": "qwen/qwen3-vl-235b-a22b-thinking:free",
            "max_tokens": 2048,
            "temperature": 0.4,
            "fallback": "nvidia/nemotron-nano-12b-2-vl:free",
        },
        TaskType.CHAT: {
            "model": "arcee-ai/arcee-trinity-large-preview:free",
            "max_tokens": 1024,
            "temperature": 0.8,
            "fallback": "meta-llama/llama-3.3-70b-instruct:free",
        },
    }
    
    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.site_url = os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173")
        self.site_name = os.getenv("OPENROUTER_SITE_NAME", "Overlord Dashboard")
        
        # Thinking mode toggle for GLM-4.5 (BTC market agent)
        self.thinking_mode = {
            TaskType.MARKET: True,  # Default ON for market analysis
        }
    
    def _call_openrouter(
        self,
        messages: List[Dict],
        model: str,
        max_tokens: int,
        temperature: float,
        use_fallback: bool = False,
        thinking: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Call OpenRouter API with fallback support and thinking mode."""
        if not self.api_key:
            return self._mock_response(messages)
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.site_url,
            "X-Title": self.site_name,
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        
        # Add thinking mode for GLM-4.5 and compatible models
        if thinking is not None and "glm" in model.lower():
            payload["thinking"] = thinking
        
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode(),
                headers=headers,
                method="POST"
            )
            context = ssl.create_default_context()
            
            with urllib.request.urlopen(req, context=context, timeout=60) as resp:
                result = json.loads(resp.read().decode())
                return {
                    "content": result["choices"][0]["message"]["content"],
                    "model": result.get("model", model),
                    "provider": "openrouter",
                    "usage": result.get("usage", {}),
                }
                
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            
            # Try fallback model if primary fails
            if not use_fallback:
                for task_type, config in self.MODEL_MAP.items():
                    if config["model"] == model and config["fallback"]:
                        print(f"Primary model failed, trying fallback: {config['fallback']}")
                        return self._call_openrouter(
                            messages, 
                            config["fallback"], 
                            max_tokens, 
                            temperature,
                            use_fallback=True
                        )
            
            try:
                error_data = json.loads(error_body)
                return {"error": error_data.get("error", {}).get("message", str(e))}
            except:
                return {"error": f"OpenRouter error {e.code}: {error_body[:200]}"}
                
        except Exception as e:
            return {"error": f"Request failed: {str(e)}"}
    
    def _mock_response(self, messages: List[Dict]) -> Dict[str, Any]:
        """Demo mode - returns helpful setup instructions."""
        user_msg = messages[-1].get("content", "") if messages else ""
        is_code = any(kw in user_msg.lower() for kw in ["code", "python", "javascript", "function"])
        
        content = f"""I'd help, but I'm in **DEMO MODE**.

**ZERO COST Setup:**

1. Visit https://openrouter.ai
2. Sign up for **FREE** (no credit card!)
3. Copy your API key
4. Add to `.env`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-...
   ```
5. Restart backend

**Your ZERO COST Model Map:**

| Task | Primary Model | Fallback |
|------|--------------|----------|
| 💻 Code | qwen3-coder-480b | gpt-oss-20b |
| 📈 Market | glm-4-5-air | step-3.5-flash |
| 🎮 Scene Control | gpt-oss-120b | qwen3-next |
| 🧠 Reasoning | gpt-oss-120b | arcee-trinity |
| 👁️ Vision | qwen3-vl | nemotron-nano |
| 💬 Chat | arcee-trinity | llama-3.3 |

**Cost: $0.00 forever!** 🚀"""
        
        return {
            "content": content,
            "model": "demo-mode",
            "provider": "mock",
        }
    
    def execute_task(
        self,
        task_type: TaskType,
        messages: List[Dict],
        custom_max_tokens: Optional[int] = None,
        use_thinking: Optional[bool] = None
    ) -> Dict[str, Any]:
        """Execute a task with the appropriate zero-cost model."""
        config = self.MODEL_MAP[task_type]
        
        # Determine thinking mode for GLM-4.5
        thinking = use_thinking
        if thinking is None and config.get("supports_thinking"):
            thinking = self.thinking_mode.get(task_type, True)
        
        result = self._call_openrouter(
            messages=messages,
            model=config["model"],
            max_tokens=custom_max_tokens or config["max_tokens"],
            temperature=config["temperature"],
            thinking=thinking,
        )
        
        # Track if fallback was used
        if result.get("model") == config.get("fallback"):
            result["used_fallback"] = True
        
        # Include thinking status in result
        if config.get("supports_thinking"):
            result["thinking_enabled"] = thinking
        
        return result
    
    # =========================================================================
    # PUBLIC API METHODS (mapped to task types)
    # =========================================================================
    
    def chat(self, message: str, history: Optional[List[Dict]] = None) -> Dict[str, Any]:
        """General chat - uses arcee-trinity (creative) or llama-3.3 fallback."""
        messages = history or []
        messages.append({"role": "user", "content": message})
        return self.execute_task(TaskType.CHAT, messages)
    
    def generate_code(self, prompt: str, language: str = "python") -> Dict[str, Any]:
        """Code generation - uses qwen3-coder (best free coding model)."""
        messages = [
            {"role": "system", "content": f"You are an expert {language} programmer."},
            {"role": "user", "content": f"Generate {language} code for: {prompt}"},
        ]
        
        result = self.execute_task(TaskType.CODE, messages, custom_max_tokens=4096)
        
        if "error" in result:
            return result
        
        # Parse code from response
        content = result.get("content", "")
        code = content
        explanation = ""
        
        if "```" in content:
            parts = content.split("```")
            for i, part in enumerate(parts):
                if i % 2 == 1:
                    lines = part.split("\n")
                    if lines:
                        code = "\n".join(lines[1:] if lines[0].strip() in [language, "python", "javascript", "typescript", "tsx"] else lines).strip()
                    break
            explanation = parts[0].strip() if parts else ""
        
        return {
            "code": code,
            "explanation": explanation or f"{language.upper()} code generated by qwen3-coder",
            "language": language,
            "model": result.get("model"),
            "provider": result.get("provider"),
            "used_fallback": result.get("used_fallback", False),
        }
    
    def agent_task(self, task: str, context: Optional[str] = None) -> Dict[str, Any]:
        """Agent task - uses gpt-oss-120b with JSON tool calling."""
        content = task
        if context:
            content = f"Context: {context}\n\nTask: {task}"
        
        messages = [{"role": "user", "content": content}]
        return self.execute_task(TaskType.SCENE_CONTROL, messages)
    
    def market_analysis(self, query: str, use_thinking: Optional[bool] = None) -> Dict[str, Any]:
        """Market analysis - uses glm-4-5-air with thinking mode for BTC/signals."""
        messages = [{"role": "user", "content": f"Market analysis: {query}"}]
        return self.execute_task(TaskType.MARKET, messages, use_thinking=use_thinking)
    
    def toggle_thinking_mode(self, task_type: TaskType, enabled: bool) -> Dict[str, Any]:
        """Toggle thinking mode for supported models (GLM-4.5)."""
        config = self.MODEL_MAP.get(task_type, {})
        
        if not config.get("supports_thinking"):
            return {
                "error": f"Task type '{task_type.value}' does not support thinking mode",
                "supported_tasks": [t.value for t, c in self.MODEL_MAP.items() if c.get("supports_thinking")],
            }
        
        self.thinking_mode[task_type] = enabled
        
        return {
            "task_type": task_type.value,
            "thinking_mode": enabled,
            "model": config["model"],
            "message": f"Thinking mode {'enabled' if enabled else 'disabled'} for {task_type.value}",
        }
    
    def get_thinking_status(self, task_type: Optional[TaskType] = None) -> Dict[str, Any]:
        """Get thinking mode status for all or specific task."""
        if task_type:
            config = self.MODEL_MAP.get(task_type, {})
            return {
                "task_type": task_type.value,
                "supports_thinking": config.get("supports_thinking", False),
                "thinking_enabled": self.thinking_mode.get(task_type, True) if config.get("supports_thinking") else None,
                "model": config.get("model"),
            }
        
        # Return all tasks with thinking support
        return {
            "thinking_modes": {
                t.value: {
                    "enabled": self.thinking_mode.get(t, True),
                    "model": c["model"],
                }
                for t, c in self.MODEL_MAP.items()
                if c.get("supports_thinking")
            }
        }
    
    def reasoning(self, prompt: str) -> Dict[str, Any]:
        """Complex reasoning - uses gpt-oss-120b with large context."""
        messages = [{"role": "user", "content": prompt}]
        return self.execute_task(TaskType.REASONING, messages, custom_max_tokens=8192)
    
    def vision_to_code(self, description: str) -> Dict[str, Any]:
        """Vision/UI to code - uses qwen3-vl."""
        messages = [{
            "role": "user",
            "content": f"Convert this UI to React/Tailwind code:\n\n{description}"
        }]
        
        result = self.execute_task(TaskType.VISION, messages)
        
        if "error" in result:
            return result
        
        content = result.get("content", "")
        code = content
        
        if "```" in content:
            parts = content.split("```")
            for i, part in enumerate(parts):
                if i % 2 == 1:
                    lines = part.split("\n")
                    if lines:
                        code = "\n".join(lines[1:] if lines[0].strip() in ["tsx", "jsx", "typescript", "javascript"] else lines).strip()
                    break
        
        return {
            "code": code,
            "model": result.get("model"),
            "provider": result.get("provider"),
            "used_fallback": result.get("used_fallback", False),
        }
    
    def explain_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Explain code - uses gpt-oss-120b for best reasoning."""
        messages = [{
            "role": "user",
            "content": f"Explain this {language} code:\n\n```{language}\n{code}\n```"
        }]
        
        result = self.execute_task(TaskType.REASONING, messages)
        
        return {
            "explanation": result.get("content", ""),
            "language": language,
            "model": result.get("model"),
            "provider": result.get("provider"),
        }
    
    # =========================================================================
    # STATUS & UTILITIES
    # =========================================================================
    
    def get_status(self) -> Dict[str, Any]:
        """Get zero-cost service status."""
        configured = bool(self.api_key)
        
        return {
            "configured": configured,
            "provider": "openrouter" if configured else "mock",
            "cost": "$0.00",
            "tier": "ZERO COST - Fully Free",
            
            "model_map": {
                task.value: {
                    "primary": config["model"],
                    "fallback": config["fallback"],
                    "max_tokens": config["max_tokens"],
                    "temperature": config["temperature"],
                }
                for task, config in self.MODEL_MAP.items()
            },
            
            "signup": None if configured else "https://openrouter.ai",
        }
    
    def get_model_map(self) -> Dict[str, Any]:
        """Get the zero-cost model map for the router."""
        return {
            "provider": "openrouter",
            "tier": "ZERO COST - Fully Free",
            "models": {
                "code": {
                    "task": "Code Generation",
                    "primary": self.MODEL_MAP[TaskType.CODE]["model"],
                    "fallback": self.MODEL_MAP[TaskType.CODE]["fallback"],
                    "best_for": "Programming, debugging, code review",
                },
                "market": {
                    "task": "Market Analysis",
                    "primary": self.MODEL_MAP[TaskType.MARKET]["model"],
                    "fallback": self.MODEL_MAP[TaskType.MARKET]["fallback"],
                    "best_for": "BTC signals, trading analysis",
                },
                "scene_control": {
                    "task": "Scene Control",
                    "primary": self.MODEL_MAP[TaskType.SCENE_CONTROL]["model"],
                    "fallback": self.MODEL_MAP[TaskType.SCENE_CONTROL]["fallback"],
                    "best_for": "JSON tool calls, automation",
                },
                "reasoning": {
                    "task": "Complex Reasoning",
                    "primary": self.MODEL_MAP[TaskType.REASONING]["model"],
                    "fallback": self.MODEL_MAP[TaskType.REASONING]["fallback"],
                    "best_for": "Analysis, problem solving",
                },
                "vision": {
                    "task": "Vision/UI",
                    "primary": self.MODEL_MAP[TaskType.VISION]["model"],
                    "fallback": self.MODEL_MAP[TaskType.VISION]["fallback"],
                    "best_for": "UI mockups → code",
                },
                "chat": {
                    "task": "General Chat",
                    "primary": self.MODEL_MAP[TaskType.CHAT]["model"],
                    "fallback": self.MODEL_MAP[TaskType.CHAT]["fallback"],
                    "best_for": "Creative, conversational",
                },
            },
        }


# Singleton instance
ai_service = AIService()


# Legacy compatibility
async def generate_code_from_prompt(prompt: str) -> Dict[str, Any]:
    """Legacy compatibility for app builder."""
    return ai_service.generate_code(prompt, language="react")
