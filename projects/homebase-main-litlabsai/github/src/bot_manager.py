import os
import subprocess
import threading
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.secrets.env'))

BOTS = [
    {
        "name": "CookingAIAgent",
        "cmd": ["python", "docs/Labs-Ai/python-agents/cooking-agent/main.py"],
        "cwd": os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
    },
    {
        "name": "Chatbot",
        "cmd": ["python", "src/chatbot.py"],
        "cwd": os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
    },
    # Add more bots here as needed
]

class BotManager:
    def __init__(self):
        self.processes = {}
        self.running = True

    def start_bot(self, bot):
        print(f"[BotManager] Starting {bot['name']}...")
        proc = subprocess.Popen(bot["cmd"], cwd=bot["cwd"])
        self.processes[bot["name"]] = proc

    def stop_bot(self, bot):
        proc = self.processes.get(bot["name"])
        if proc and proc.poll() is None:
            print(f"[BotManager] Stopping {bot['name']}...")
            proc.terminate()
            proc.wait()

    def start_all(self):
        for bot in BOTS:
            self.start_bot(bot)

    def stop_all(self):
        for bot in BOTS:
            self.stop_bot(bot)

    def monitor(self):
        try:
            while self.running:
                time.sleep(10)
                # Optionally, check bot health or restart if needed
        except KeyboardInterrupt:
            self.running = False
            self.stop_all()

    def cli(self):
        print("\n[BotManager] Universal Bot Control")
        print("Commands: start, stop, status, quit")
        while self.running:
            cmd = input("[bots] > ").strip().lower()
            if cmd == "start":
                self.start_all()
            elif cmd == "stop":
                self.stop_all()
            elif cmd == "status":
                for name, proc in self.processes.items():
                    status = "running" if proc.poll() is None else "stopped"
                    print(f"- {name}: {status}")
            elif cmd == "quit":
                self.running = False
                self.stop_all()
                print("[BotManager] Exiting.")
            else:
                print("Unknown command.")

def main():
    manager = BotManager()
    threading.Thread(target=manager.monitor, daemon=True).start()
    manager.cli()

if __name__ == "__main__":
    main()
