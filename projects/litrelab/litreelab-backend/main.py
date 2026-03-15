import os
import json
import httpx
import jwt
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from passlib.context import CryptContext
from dotenv import load_dotenv
from openai import AzureOpenAI

# Load environment variables
load_dotenv()

app = FastAPI(title="Litreelab API (HomeBase 3.0)")

# Enable CORS for the Astro frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Azure OpenAI Configuration
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
)
DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")

# Passlib for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Simple In-Memory User Store (for demo)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = pwd_context.hash(os.getenv("ADMIN_PASSWORD", "admin"))

# --- Models ---

class Token(BaseModel):
    access_token: str
    token_type: str

class AgentChatRequest(BaseModel):
    message: str

class AgentChatResponse(BaseModel):
    reply: str
    model_used: str

class StatusResponse(BaseModel):
    status: str
    version: str
    ai_enabled: bool

# --- Tool Definitions ---

import subprocess
import glob

def get_system_time():
    """Returns the current system time."""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def read_local_file(file_path: str):
    """Reads a file from the local filesystem."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

def search_directory(path: str, pattern: str = "*"):
    """Searches a directory for files matching a pattern."""
    try:
        search_path = os.path.join(path, f"**/{pattern}")
        files = glob.glob(search_path, recursive=True)
        # Limit to 50 results to prevent massive payloads
        if len(files) > 50:
            return "\\n".join(files[:50]) + f"\\n... and {len(files) - 50} more."
        return "\\n".join(files) if files else "No files found."
    except Exception as e:
        return f"Error searching directory: {str(e)}"

def run_safe_command(command: str):
    """Executes a command safely on the system. Use carefully!"""
    try:
        result = subprocess.run(
            ["powershell.exe", "-Command", command], 
            capture_output=True, 
            text=True, 
            timeout=10
        )
        output = result.stdout
        if result.stderr:
            output += f"\\nERROR:\\n{result.stderr}"
        return output.strip() or "Command executed successfully (no output)."
    except subprocess.TimeoutExpired:
        return "Command timed out after 10 seconds."
    except Exception as e:
        return f"Error executing command: {str(e)}"

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_system_time",
            "description": "Get the current date and time of the system.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_local_file",
            "description": "Read the contents of a specific file on the user's computer.",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {"type": "string", "description": "The full path to the file."}
                },
                "required": ["file_path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "search_directory",
            "description": "Search for files in a directory using a glob pattern.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "The directory path to search in."},
                    "pattern": {"type": "string", "description": "The glob pattern (e.g., '*.ts', 'main.*'). Defaults to '*'."}
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "run_safe_command",
            "description": "Run a shell/PowerShell command on the system. MUST NOT execute destructive actions.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "The PowerShell command to run."}
                },
                "required": ["command"],
            },
        },
    }
]

# --- Auth Helpers ---

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        return username
    except jwt.PyJWTError:
        raise credentials_exception

# --- Routes ---

@app.get("/")
async def root():
    return {"message": "Litreelab API is live!"}

@app.get("/status", response_model=StatusResponse)
async def get_status():
    return StatusResponse(
        status="healthy",
        version="3.0.1",
        ai_enabled=True
    )

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username != ADMIN_USERNAME or not pwd_context.verify(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/agent/chat", response_model=AgentChatResponse)
async def agent_chat(request: AgentChatRequest, current_user: str = Depends(get_current_user)):
    """
    Chat with the AI Agent via Azure OpenAI with Tool-Calling capabilities.
    """
    try:
        messages = [
            {"role": "system", "content": "You are LitreeLab-OS, a high-performance system assistant for HomeBase 3.0."},
            {"role": "user", "content": request.message}
        ]
        
        # First call to check for tool needs
        response = client.chat.completions.create(
            model=DEPLOYMENT_NAME,
            messages=messages,
            tools=tools,
            tool_choice="auto",
        )
        
        response_message = response.choices[0].message
        tool_calls = response_message.tool_calls

        if tool_calls:
            messages.append(response_message)
            
            for tool_call in tool_calls:
                function_name = tool_call.function.name
                function_args = json.loads(tool_call.function.arguments)
                
                if function_name == "get_system_time":
                    result = get_system_time()
                elif function_name == "read_local_file":
                    result = read_local_file(function_args.get("file_path"))
                elif function_name == "search_directory":
                    result = search_directory(function_args.get("path"), function_args.get("pattern", "*"))
                elif function_name == "run_safe_command":
                    result = run_safe_command(function_args.get("command"))
                else:
                    result = "Unknown tool"

                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": result,
                })
            
            # Second call for final synthesized response
            second_response = client.chat.completions.create(
                model=DEPLOYMENT_NAME,
                messages=messages,
            )
            reply = second_response.choices[0].message.content
        else:
            reply = response_message.content

        return AgentChatResponse(reply=reply, model_used=DEPLOYMENT_NAME)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Azure AI Error: {str(e)}")

# Placeholder Routes
@app.get("/api/friends")
async def get_friends(current_user: str = Depends(get_current_user)):
    return {
        "friends": [
            {"id": 1, "name": "Alice", "status": "online", "avatar": "👩"},
            {"id": 2, "name": "Bob", "status": "offline", "avatar": "👨"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
