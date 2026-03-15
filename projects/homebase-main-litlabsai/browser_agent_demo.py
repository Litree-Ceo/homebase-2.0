import asyncio
import os
from dotenv import load_dotenv
from browser_use import Agent, Browser
from langchain_openai import ChatOpenAI

# Load environment variables
load_dotenv()

async def main():
    print("🚀 Starting Browser Use Agent (Option B)...")
    
    # Check for API Key
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key.startswith("sk-...") or api_key == "your_api_key_here":
        print("⚠️  WARNING: OPENAI_API_KEY is not set or invalid in .env")
        print("   Please edit .env and add your key: OPENAI_API_KEY=sk-...")
        return

    # Initialize the LLM
    llm = ChatOpenAI(model="gpt-4o", temperature=0.0)

    # Initialize the Agent
    agent = Agent(
        task="Go to google.com and search for 'Trae IDE features'",
        llm=llm,
        browser=Browser() # Defaults to chrome/headless=False usually
    )
    
    # Run the agent
    print("🤖 Agent is running...")
    result = await agent.run()
    print("\n✅ Result:")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
