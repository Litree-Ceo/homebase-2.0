import subprocess
import sys

# Get files and prompt from command line arguments
files = sys.argv[1:-1]
prompt = sys.argv[-1]

# Construct the Aider command
command = ["aider"] + files + ["--message", prompt]

# Run the Aider command
# We use a try-except block to gracefully handle cases where Aider is not installed
try:
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    print(result.stdout)
except FileNotFoundError:
    print(
        "Error: 'aider' command not found. Please install Aider on your Termux device with: pip install aider-chat"
    )
except Exception as e:
    print(f"An error occurred while running Aider: {e}")
    if hasattr(e, "stderr"):
        print(f"Stderr: {e.stderr}")
