"""Vibe Coder - Code generation endpoint using OpenRouter."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.ai_service import ai_service

router = APIRouter()


class CodeGenRequest(BaseModel):
    prompt: str
    language: str = "typescript"
    context: Optional[str] = ""


class CodeGenResponse(BaseModel):
    code: str
    explanation: str
    model: str
    provider: str


@router.post("/generate")
async def generate_code(request: CodeGenRequest):
    """
    Generate code from natural language using OpenRouter AI.
    Supports: Python, JavaScript, TypeScript, React, CSS, HTML, Rust, Go
    """
    try:
        # Enhance prompt with language context
        enhanced_prompt = f"""Generate {request.language} code for the following request.

Request: {request.prompt}

Context: {request.context or 'Modern React TypeScript frontend development'}

Requirements:
1. Write clean, well-commented code
2. Follow best practices for {request.language}
3. Include type definitions where applicable
4. Make it production-ready

Output format:
- Provide ONLY the code first (wrapped in ``` if markdown)
- Then provide a brief explanation of what the code does
"""

        result = ai_service.generate_code(
            prompt=enhanced_prompt,
            language=request.language
        )
        
        if "error" in result:
            # Return mock response for demo mode
            return {
                "code": generate_mock_code(request.prompt, request.language),
                "explanation": f"Demo mode: Generated {request.language} code. Connect OpenRouter for real AI generation.",
                "model": "mock/demo",
                "provider": "local"
            }
        
        # Parse code and explanation from AI response
        content = result.get("code", "")
        
        # Try to extract code blocks
        code = content
        explanation = ""
        
        if "```" in content:
            parts = content.split("```")
            for i, part in enumerate(parts):
                if i % 2 == 1:  # Inside code block
                    # Remove language identifier
                    lines = part.split("\n")
                    if lines[0].strip() in ["typescript", "javascript", "python", "css", "html", "rust", "go", "react"]:
                        code = "\n".join(lines[1:])
                    else:
                        code = part
                elif i > 0:  # Text after code block (explanation)
                    explanation = part.strip()
        
        if not explanation:
            explanation = f"Generated {request.language} code based on your prompt."
        
        return {
            "code": code.strip(),
            "explanation": explanation,
            "model": result.get("model", "unknown"),
            "provider": result.get("provider", "unknown"),
        }
        
    except Exception as e:
        # Return mock response on error
        return {
            "code": generate_mock_code(request.prompt, request.language),
            "explanation": f"Error with AI service, returning demo code: {str(e)}",
            "model": "mock/error",
            "provider": "local"
        }


def generate_mock_code(prompt: str, language: str) -> str:
    """Generate mock code for demo mode."""
    
    templates = {
        "typescript": f"""// {prompt}
interface Props {{
  title: string;
  onAction: () => void;
}}

export const Component: React.FC<Props> = ({{ title, onAction }}) => {{
  const [state, setState] = useState(false);
  
  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white">{{title}}</h2>
      <button 
        onClick={{onAction}}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Execute
      </button>
    </div>
  );
}};""",
        "python": f"""# {prompt}
def process_data(data: dict) -> dict:
    \"\"\"
    Process input data and return formatted result.
    
    Args:
        data: Input dictionary
        
    Returns:
        Processed data dictionary
    \"\"\"
    result = {{}}
    
    try:
        for key, value in data.items():
            processed = transform_value(value)
            result[key] = processed
            
        return {{
            "status": "success", 
            "data": result,
            "count": len(result)
        }}
    except Exception as e:
        return {{
            "status": "error", 
            "message": str(e)
        }}

def transform_value(item):
    \"\"\"Transform individual value.\"\"\"
    if isinstance(item, (int, float)):
        return item * 2
    return str(item).upper()""",
        "javascript": f"""// {prompt}
const {{ useState, useEffect }} = React;

function CustomComponent({{ initialData }}) {{
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {{
    fetchData();
  }}, []);
  
  const fetchData = async () => {{
    setLoading(true);
    try {{
      const response = await fetch('/api/data');
      const json = await response.json();
      setData(json);
    }} catch (error) {{
      console.error('Error:', error);
    }} finally {{
      setLoading(false);
    }}
  }};
  
  return (
    <div className="container">
      {{loading ? <p>Loading...</p> : <pre>{{JSON.stringify(data, null, 2)}}</pre>}}
    </div>
  );
}}""",
        "css": f"""/* {prompt} */
.custom-component {{
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}}

.custom-component:hover {{
  transform: translateY(-2px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  border-color: rgba(99, 102, 241, 0.3);
}}""",
        "react": f"""// {prompt}
import {{ useState, useEffect, useCallback }} from 'react';

export default function FeatureComponent() {{
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {{
    fetchData();
  }}, []);

  const fetchData = useCallback(async () => {{
    try {{
      setLoading(true);
      const res = await fetch('/api/data');
      
      if (!res.ok) throw new Error('Failed to fetch');
      
      const json = await res.json();
      setData(json);
    }} catch (err) {{
      setError(err.message);
    }} finally {{
      setLoading(false);
    }}
  }}, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {{error}}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Feature Component</h1>
      <pre className="bg-gray-900 p-4 rounded-lg overflow-auto">
        {{JSON.stringify(data, null, 2)}}
      </pre>
      <button 
        onClick={{fetchData}}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
      >
        Refresh
      </button>
    </div>
  );
}}""",
        "rust": f"""// {prompt}
use serde::{{Deserialize, Serialize}};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct Data {{
    pub id: String,
    pub value: i32,
    pub metadata: HashMap<String, String>,
}}

impl Data {{
    pub fn new(id: &str) -> Self {{
        Self {{
            id: id.to_string(),
            value: 0,
            metadata: HashMap::new(),
        }}
    }}
    
    pub fn process(&mut self) -> Result<(), String> {{
        if self.value < 0 {{
            return Err("Value cannot be negative".to_string());
        }}
        
        self.value *= 2;
        self.metadata.insert("processed".to_string(), "true".to_string());
        
        Ok(())
    }}
}}""",
        "go": f"""// {prompt}
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type Data struct {{
    ID       string            `json:"id"`
    Value    int               `json:"value"`
    Metadata map[string]string `json:"metadata"`
}}

func handleRequest(w http.ResponseWriter, r *http.Request) {{
    data := Data{{
        ID:       "123",
        Value:    42,
        Metadata: make(map[string]string),
    }}
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}}

func main() {{
    http.HandleFunc("/api/data", handleRequest)
    fmt.Println("Server running on :8080")
    http.ListenAndServe(":8080", nil)
}}""",
    }
    
    return templates.get(language, templates["typescript"])


@router.get("/health")
async def code_health():
    """Check if code generation is available."""
    status = ai_service.get_status()
    return {{
        "available": True,  # Always available with mock fallback
        "ai_configured": status["configured"],
        "provider": status["provider"],
        "message": "Vibe Coder ready" if status["configured"] else "Vibe Coder ready (demo mode)"
    }}
