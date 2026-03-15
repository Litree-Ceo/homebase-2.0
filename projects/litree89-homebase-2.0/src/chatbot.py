import os
import asyncio
from agent_framework import ChatAgent
from agent_framework_azure_ai import AzureAIAgentClient
from azure.identity.aio import DefaultAzureCredential
from dotenv import load_dotenv

load_dotenv()

async def main():
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    async with ChatAgent(
        chat_client=AzureAIAgentClient(
            project_endpoint=endpoint,
            model_deployment_name=deployment,
            async_credential=DefaultAzureCredential(),
            agent_name="EverythingHomebaseBot",
        ),
        instructions="You are a helpful assistant for EverythingHomebase.",
    ) as agent:
        while True:
            user_input = input("You: ")
            if user_input.lower() in ["exit", "quit"]:
                break
            print("Bot: ", end="", flush=True)
            async for chunk in agent.run_stream(user_input):
                if chunk.text:
                    print(chunk.text, end="", flush=True)
            print()

if __name__ == "__main__":
    asyncio.run(main())
