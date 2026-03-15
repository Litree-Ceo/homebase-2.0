import os
import subprocess
import threading
import time

AGENTS = [
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
]

class MasterController:
    def __init__(self):
        self.processes = {}
        self.running = True

    def start_agent(self, agent):
        print(f"[Master] Starting {agent['name']}...")
        proc = subprocess.Popen(agent["cmd"], cwd=agent["cwd"])
        self.processes[agent["name"]] = proc

    def stop_agent(self, agent):
        proc = self.processes.get(agent["name"])
        if proc and proc.poll() is None:
            print(f"[Master] Stopping {agent['name']}...")
            proc.terminate()
            proc.wait()

    def start_all(self):
        for agent in AGENTS:
            self.start_agent(agent)

    def stop_all(self):
        for agent in AGENTS:
            self.stop_agent(agent)

    def auto_git_sync(self):
        print("[Master] Running auto-git-sync.ps1...")
        subprocess.call(["powershell", "-ExecutionPolicy", "Bypass", "-File", "auto-git-sync.ps1"], cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

    def monitor(self):
        try:
            while self.running:
                time.sleep(10)
                # Optionally, check agent health or restart if needed
        except KeyboardInterrupt:
            self.running = False
            self.stop_all()

    def cli(self):
        print("\n[MasterController] EverythingHomebase Master Control")
        print("Commands: start, stop, sync, status, quit")
        while self.running:
            cmd = input("[master] > ").strip().lower()
            if cmd == "start":
                self.start_all()
            elif cmd == "stop":
                self.stop_all()
            elif cmd == "sync":
                self.auto_git_sync()
            elif cmd == "status":
                for name, proc in self.processes.items():
                    status = "running" if proc.poll() is None else "stopped"
                    print(f"- {name}: {status}")
            elif cmd == "quit":
                self.running = False
                self.stop_all()
                print("[Master] Exiting.")
            else:
                print("Unknown command.")

def main():
    master = MasterController()
    threading.Thread(target=master.monitor, daemon=True).start()
    master.cli()

if __name__ == "__main__":
    main()
