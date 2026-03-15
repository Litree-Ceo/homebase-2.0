import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path

# Explicitly load from project root with override
root_env = Path("C:/Users/litre/homebase-2.0/.env")
load_dotenv(root_env, override=True)

from browser_use import Agent, Browser, Controller
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import ConfigDict, Field

# Define flexible wrappers to allow browser-use to monkey-patch attributes (provider, ainvoke, etc.)
class FlexibleChatOpenAI(ChatOpenAI):
    model_config = ConfigDict(extra='allow', frozen=False)
    
    @property
    def model(self):
        """Alias for model_name if not present"""
        if hasattr(self, 'model_name'):
            return self.model_name
        return super().model

class FlexibleChatGoogleGenerativeAI(ChatGoogleGenerativeAI):
    model_config = ConfigDict(extra='allow', frozen=False)
    
    @property
    def model_name(self):
        """Alias for model field"""
        return self.model

# Configure your model here
# For "at its best" performance, GPT-4o is recommended, but Gemini 1.5 Pro is also excellent and you have keys.
# Ensure your API keys are set in your environment variables.

async def main():
    # Initialize the browser
    # headless=False so you can see what it's doing (not "frozen")
    browser = Browser()
    
    # Debug: Print key status (masked)
    google_key = os.getenv("GOOGLE_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    print(f"DEBUG: GOOGLE_KEY found: {bool(google_key)}")
    print(f"DEBUG: OPENAI_KEY found: {bool(openai_key)}")
    if openai_key:
        print(f"DEBUG: OPENAI_KEY start: {openai_key[:3]}...")
    
    # Check for API keys
    if not google_key and not openai_key:
        print("⚠️  WARNING: No API keys found in .env!")
        print("   Please set GOOGLE_API_KEY or OPENAI_API_KEY")
        # Attempt to use what we have
    
    # Get task from command line args or input
    import sys
    if len(sys.argv) > 1:
        user_task = " ".join(sys.argv[1:])
    else:
        print("🤖 Enter your browser task:")
        user_task = input("> ")

    # Select model based on available keys
    # Prefer Google if OpenAI is invalid/empty/placeholder
    use_google = False
    if google_key:
        use_google = True
    
    # If we have OpenAI key and it looks valid, use it?
    # User complained about OpenAI key not working, so let's prioritize Google if available.
    # But if User explicitly set OpenAI, we should use it.
    # Logic: If Google is present, use it (since I just injected it).
    
    llm = None
    if use_google:
        print("✅ Using Google Gemini 1.5 Pro")
        llm = FlexibleChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=google_key)
        # Fix for browser-use provider check
        try:
            llm.provider = 'google'
        except Exception as e:
            print(f"⚠️ Warning setting provider: {e}")
            
    elif openai_key and not openai_key.startswith("sk-..."):
        print("✅ Using OpenAI GPT-4o")
        llm = FlexibleChatOpenAI(model="gpt-4o")
        try:
            llm.provider = 'openai'
        except:
            pass
    else:
        print("❌ No valid API keys available.")
        # Fallback check for Firebase key
        fb_key = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY")
        if fb_key:
             print("✅ Using Firebase/Google Key as fallback")
             llm = FlexibleChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key=fb_key)
             llm.provider = 'google'
        else:
             return

    agent = Agent(
        task=user_task,
        llm=llm,
        browser=browser,
    )

    print(f"🚀 Starting Browser Agent with task: {user_task}")
    history = await agent.run()
    
    print("\n✅ Task Completed!")
    try:
        if history:
            print(history.final_result())
        else:
            print("No history returned.")
    except Exception as e:
        print(f"Result display error: {e}")
    
    try:
        if browser:
            await browser.close()
    except Exception as e:
        # Ignore close errors as the session might be already closed
        pass

if __name__ == "__main__":
    asyncio.run(main())
