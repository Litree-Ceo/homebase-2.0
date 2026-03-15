@echo off
REM Launch CookingAIAgent on startup
cd /d %~dp0..
REM Activate your Python environment if needed (uncomment next line)
REM call path\to\venv\Scripts\activate.bat
python docs\Labs-Ai\python-agents\cooking-agent\main.py
