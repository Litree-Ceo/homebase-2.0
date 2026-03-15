import requests
import sys

def check_env():
    print(f"Python Version: {sys.version}")
    print(f"Requests Version: {requests.__version__}")
    
    try:
        response = requests.get('https://api.github.com')
        print(f"GitHub API Status: {response.status_code} (Connectivity Verified)")
    except Exception as e:
        print(f"Connectivity Error: {e}")

if __name__ == "__main__":
    check_env()
