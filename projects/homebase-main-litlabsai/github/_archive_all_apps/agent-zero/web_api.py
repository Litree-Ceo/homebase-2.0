#!/usr/bin/env python3
"""
Agent Zero Web API - Flask/FastAPI wrapper for web integration
Links to web3.agent-zero.ai and www.agent-zero.ai
"""

import os
import sys
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
import uvicorn

# Import Agent Zero
from main import AgentZero, AgentState

# Create FastAPI app
app = FastAPI(
    title="Agent Zero API",
    description="Web API for Agent Zero AI agent",
    version="1.0.0"
)

# CORS configuration for web3.agent-zero.ai and www.agent-zero.ai
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://web3.agent-zero.ai",
        "https://www.agent-zero.ai",
        "https://agent-zero.ai",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8080",
        "*"  # Remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global agent instance
agent: Optional[AgentZero] = None

# Pydantic models
class CommandRequest(BaseModel):
    command: str
    session_id: Optional[str] = None

class CommandResponse(BaseModel):
    response: str
    status: str
    timestamp: str
    session_id: Optional[str] = None

class AgentStatus(BaseModel):
    name: str
    state: str
    uptime: str
    messages_processed: int
    capabilities: List[str]
    ai_providers: Dict[str, bool]

class HealthCheck(BaseModel):
    status: str
    timestamp: str
    version: str

# Initialize agent on startup
@app.on_event("startup")
async def startup_event():
    global agent
    print("🚀 Starting Agent Zero Web API...")
    agent = AgentZero()
    agent.initialize()
    print("✅ Agent Zero Web API is ready!")
    print("🌐 CORS enabled for web3.agent-zero.ai and www.agent-zero.ai")

@app.on_event("shutdown")
async def shutdown_event():
    print("👋 Agent Zero Web API shutting down...")

@app.get("/", response_model=HealthCheck)
async def root():
    """Root endpoint - health check"""
    return HealthCheck(
        status="online",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "agent": agent.get_status() if agent else None,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/status", response_model=AgentStatus)
async def get_status():
    """Get Agent Zero status"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    status = agent.get_status()
    return AgentStatus(**status)

@app.post("/command", response_model=CommandResponse)
async def process_command(request: CommandRequest):
    """Process a command from the web interface"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        response = agent.process_command(request.command)
        return CommandResponse(
            response=response,
            status=agent.state.value,
            timestamp=datetime.now().isoformat(),
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: CommandRequest):
    """Chat endpoint - alias for command"""
    return await process_command(request)

@app.get("/capabilities")
async def get_capabilities():
    """Get agent capabilities"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    return {
        "capabilities": agent.capabilities,
        "ai_providers": agent.get_status()["ai_providers"]
    }

@app.get("/history")
async def get_history(limit: int = 10):
    """Get conversation history"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    history = agent.conversation_history[-limit:] if agent.conversation_history else []
    return {
        "history": history,
        "total_messages": len(agent.conversation_history)
    }

@app.post("/clear-history")
async def clear_history():
    """Clear conversation history"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    agent.conversation_history.clear()
    return {"message": "Conversation history cleared"}

@app.post("/save")
async def save_conversation(filename: str):
    """Save conversation to file"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    result = agent.save_conversation(filename)
    return {"message": result}

@app.post("/load")
async def load_conversation(filename: str):
    """Load conversation from file"""
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    result = agent.load_conversation(filename)
    return {"message": result}

# WebSocket support for real-time communication
@app.websocket("/ws")
async def websocket_endpoint(websocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    print(f"🔌 WebSocket client connected")
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_text()
            message = json.loads(data)
            command = message.get("command", "")
            
            # Process command
            response = agent.process_command(command) if agent else "Agent not ready"
            
            # Send response
            await websocket.send_json({
                "response": response,
                "status": agent.state.value if agent else "unknown",
                "timestamp": datetime.now().isoformat()
            })
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        print("🔌 WebSocket client disconnected")
        await websocket.close()

# Catch-all for 404s
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "error": "Not found",
            "path": str(request.url),
            "available_endpoints": [
                "/",
                "/health",
                "/status",
                "/command",
                "/chat",
                "/capabilities",
                "/history"
            ]
        }
    )

def main():
    """Run the web API server"""
    host = os.getenv("AGENT_ZERO_HOST", "0.0.0.0")
    port = int(os.getenv("AGENT_ZERO_PORT", "8000"))
    
    print(f"""
╔═══════════════════════════════════════════════════════════════╗
║              🤖 Agent Zero Web API                            ║
╠═══════════════════════════════════════════════════════════════╣
║  Server: http://{host}:{port}                              ║
║  CORS:   web3.agent-zero.ai, www.agent-zero.ai               ║
╚═══════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(app, host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()
