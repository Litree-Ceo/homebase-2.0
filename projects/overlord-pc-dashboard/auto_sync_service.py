import time
import subprocess
import os
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# --- Configuration ---
REPO_PATH = "."  # Path to your git repository
COMMIT_MESSAGE = "Auto-sync: file change detected"
WATCHED_EXTENSIONS = [".py", ".js", ".html", ".css", ".yaml", ".json", ".md"]
DEBOUNCE_INTERVAL = 5  # Seconds to wait for more changes

class GitSyncEventHandler(FileSystemEventHandler):
    """Handles file system events and triggers a git commit and push."""

    def __init__(self):
        super().__init__()
        self.debounce_timer = None

    def on_any_event(self, event):
        """Catch all events, filter for relevant file types, and debounce."""
        if event.is_directory:
            return

        # Check if the file extension is one we want to watch
        if any(event.src_path.endswith(ext) for ext in WATCHED_EXTENSIONS):
            print(f"[GitSync] Change detected: {event.src_path}")
            self.debounce_sync()

    def debounce_sync(self):
        """Reset the debounce timer on each new event."""
        if self.debounce_timer:
            self.debounce_timer.cancel()
        
        self.debounce_timer = threading.Timer(DEBOUNCE_INTERVAL, self.sync_repository)
        self.debounce_timer.start()
        print(f"[GitSync] Waiting {DEBOUNCE_INTERVAL}s for more changes...")

    def sync_repository(self):
        """Adds, commits, and pushes changes to the git repository."""
        print("\n[GitSync] Debounce timer elapsed. Starting sync...")
        try:
            # Add all changes
            print("[GitSync] Running: git add . ...")
            add_result = subprocess.run(["git", "add", "."], cwd=REPO_PATH, capture_output=True, text=True, check=False)
            if add_result.returncode != 0:
                print(f"[GitSync] Error adding files: {add_result.stderr}")
                return

            # Commit changes
            print(f'[GitSync] Running: git commit -m "{COMMIT_MESSAGE}" ...')
            # Use --quiet to avoid output if there's nothing to commit
            commit_result = subprocess.run(
                ["git", "commit", "-m", COMMIT_MESSAGE],
                cwd=REPO_PATH,
                capture_output=True,
                text=True,
                check=False,
            )

            # Check if there was anything to commit
            if "nothing to commit, working tree clean" in commit_result.stdout:
                print("[GitSync] No new changes to commit.")
                return
            elif (
                commit_result.returncode != 0
                and "nothing to commit" not in commit_result.stdout
            ):
                print(f"[GitSync] Error committing files: {commit_result.stderr}")
                return
            else:
                print("[GitSync] Commit successful.")

            # Push changes
            print("[GitSync] Running: git push ...")
            push_result = subprocess.run(["git", "push"], cwd=REPO_PATH, capture_output=True, text=True, check=False)
            if push_result.returncode != 0:
                print(f"[GitSync] Error pushing changes: {push_result.stderr}")
            else:
                print("[GitSync] Push successful.")

        except Exception as e:
            print(f"[GitSync] An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("--- Overlord Auto-Sync Service Initializing ---")
    print(f"Watching for changes in: {os.path.abspath(REPO_PATH)}")
    print(f"Will commit with message: '\"{COMMIT_MESSAGE}\"'.")
    print("---")

    event_handler = GitSyncEventHandler()
    observer = Observer()
    observer.schedule(event_handler, REPO_PATH, recursive=True)
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
    print("--- Overlord Auto-Sync Service Terminated ---")
