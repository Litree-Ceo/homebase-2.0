"""AI Assistant endpoints - Simplified Free Tier (OpenRouter)."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import ai_service

router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    model: Optional[str] = "default"  # default, fast, chat
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    model: str
    provider: str


class CodeRequest(BaseModel):
    prompt: str
    language: Optional[str] = "python"


class CodeResponse(BaseModel):
    code: str
    explanation: str
    language: str
    model: str


class ExplainRequest(BaseModel):
    code: str
    language: Optional[str] = "python"


class AgentRequest(BaseModel):
    task: str
    context: Optional[str] = None
    fast: Optional[bool] = False  # Use fast agent model


class MarketRequest(BaseModel):
    query: str
    use_thinking: Optional[bool] = None  # None = use default, True/False = override


class ThinkingToggleRequest(BaseModel):
    enabled: bool


class VisionRequest(BaseModel):
    description: str  # Text description of UI/mockup


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    General chat. Model options:
    - 'default': gpt-oss-120b (best overall)
    - 'fast': step-3.5-flash (lightning fast)
    - 'chat': arcee-trinity (creative/conversational)
    """
    try:
        history = [{"role": m.role, "content": m.content} for m in (request.history or [])]
        
        result = ai_service.chat(
            message=request.message,
            history=history,
            model=request.model or "default",
            system_prompt=request.system_prompt,
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return ChatResponse(
            response=result["content"],
            model=result.get("model", "unknown"),
            provider=result.get("provider", "unknown"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-code", response_model=CodeResponse)
async def generate_code(request: CodeRequest):
    """
    Generate code using qwen3-coder-480b (best free coding model).
    Supports: python, javascript, typescript, html, css, bash, sql, rust, go
    """
    try:
        result = ai_service.generate_code(
            prompt=request.prompt,
            language=request.language or "python",
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return CodeResponse(
            code=result["code"],
            explanation=result["explanation"],
            language=result["language"],
            model=result.get("model", "unknown"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/explain")
async def explain_code(request: ExplainRequest):
    """Explain what code does using gpt-oss-120b."""
    try:
        result = ai_service.explain_code(
            code=request.code,
            language=request.language or "python",
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "explanation": result["explanation"],
            "language": request.language,
            "model": result.get("model"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/agent")
async def agent_task(request: AgentRequest):
    """
    Agent-style task with tool use capability.
    Uses gpt-oss-120b for best reasoning and JSON tool calling.
    """
    try:
        result = ai_service.agent_task(
            task=request.task,
            context=request.context,
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "response": result.get("content"),
            "model": result.get("model"),
            "provider": result.get("provider"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/market")
async def market_analysis(request: MarketRequest):
    """
    Market/BTC analysis using GLM-4.5-air with thinking mode toggle.
    Thinking mode provides deeper analysis for trading signals.
    """
    try:
        result = ai_service.market_analysis(
            query=request.query,
            use_thinking=request.use_thinking,
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "analysis": result.get("content"),
            "model": result.get("model"),
            "thinking_enabled": result.get("thinking_enabled"),
            "used_fallback": result.get("used_fallback", False),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/thinking/toggle")
async def toggle_thinking(request: ThinkingToggleRequest):
    """
    Toggle thinking mode for GLM-4.5 (BTC market agent).
    
    Thinking mode provides deeper reasoning for:
    - BTC signal analysis
    - Market pattern recognition
    - Trading strategy evaluation
    """
    try:
        from app.services.ai_service import TaskType
        
        result = ai_service.toggle_thinking_mode(
            task_type=TaskType.MARKET,
            enabled=request.enabled
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/thinking/status")
async def get_thinking_status():
    """Get current thinking mode status for all supported models."""
    try:
        from app.services.ai_service import TaskType
        return ai_service.get_thinking_status(TaskType.MARKET)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vision-to-code")
async def vision_to_code(request: VisionRequest):
    """
    Convert UI description to React code using qwen3-vl.
    (For actual image input, use base64 encoding)
    """
    try:
        result = ai_service.vision_to_code(request.description)
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "code": result["code"],
            "model": result.get("model"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/models")
async def list_models():
    """
    Get the ZERO COST Model Map.
    All models are fully free via OpenRouter.
    """
    return ai_service.get_model_map()


@router.get("/health")
async def health_check():
    """
    Check ZERO COST AI service status.
    """
    status = ai_service.get_status()
    
    return {
        "status": "ready" if status["configured"] else "not_configured",
        "configured": status["configured"],
        "tier": "ZERO COST",
        "cost": "$0.00",
        
        "zero_cost_model_map": status.get("model_map", {}),
        
        "setup_instructions": None if status["configured"] else {
            "step_1": "Visit https://openrouter.ai",
            "step_2": "Sign up for FREE (no credit card required!)",
            "step_3": "Copy your API key",
            "step_4": "Add to overlord-modern/backend/.env:",
            "env_line": "OPENROUTER_API_KEY=sk-or-v1-...",
            "step_5": "Restart backend",
            "cost": "$0.00 forever",
        },
        
        "benefits": [
            "✅ 100% Free - No credit card",
            "✅ 6 State-of-the-art models",
            "✅ Automatic fallback on failure",
            "✅ 131K-262K context windows",
            "✅ Tool use + Vision + Code",
        ]
    }
