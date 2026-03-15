#!/usr/bin/env python3
"""
Project Scanner - Checks what's needed and what's missing
"""
import os
import sys


def check_file(path):
    """Check if a file exists and return size."""
    if os.path.exists(path):
        size = os.path.getsize(path)
        return True, size
    return False, 0


def main():
    print("=" * 60)
    print("  SYSTEM OVERLORD - PROJECT SCANNER")
    print("=" * 60)
    print()

    # Critical files
    print("[FILES] CRITICAL FILES")
    print("-" * 40)
    critical = {
        "server.py": "Main server",
        "config.yaml": "Configuration",
        ".env": "Environment variables",
        "index.html": "Dashboard UI",
        "app.js": "Frontend logic",
        "style.css": "Styles",
        "realdebrid_controller.js": "Streaming module",
        "overlord.db": "Database",
    }

    all_ok = True
    for file, desc in critical.items():
        exists, size = check_file(file)
        status = "[OK]" if exists else "[MISSING]"
        size_str = f"({size:,} bytes)" if exists else "MISSING"
        print(f"  {status} {file:<30} {size_str}")
        if not exists:
            all_ok = False

    print()
    print("[FILES] ASSETS")
    print("-" * 40)
    assets = [
        "assets/logo-overlord.svg",
        "assets/logo-overlord-simple.svg",
        "assets/logo-preview.html",
        "assets/generate-pngs.py",
    ]
    for asset in assets:
        exists, size = check_file(asset)
        status = "[OK]" if exists else "[MISSING]"
        print(f"  {status} {asset}")

    print()
    print("[FILES] JAVASCRIPT LIBRARIES")
    print("-" * 40)
    js_libs = [
        "js/react.production.min.js",
        "js/react-dom.production.min.js",
        "js/Recharts.js",
    ]
    for js in js_libs:
        exists, size = check_file(js)
        status = "[OK]" if exists else "[MISSING]"
        print(f"  {status} {js}")

    print()
    print("[CONF] CONFIGURATION")
    print("-" * 40)

    # Check config.yaml
    try:
        import yaml

        with open("config.yaml", encoding="utf-8") as f:
            config = yaml.safe_load(f)

        print(f"  [OK] Config loads successfully")
        print(f"  [INFO] Server port: {config['server']['port']}")
        print(f"  [INFO] Auth enabled: {config['auth']['enabled']}")
        print(f"  [INFO] Rate limiting: {config['rate_limit']['enabled']}")

        if config["firebase"]["enabled"]:
            print(f"  [WARN] Firebase: ENABLED")
            if not config["firebase"]["database_url"]:
                print(f"    [ERR] Firebase database_url is empty!")
            if not os.path.exists(config["firebase"]["service_account_key"]):
                print(
                    f"    [ERR] Firebase key file missing: {config['firebase']['service_account_key']}"
                )
        else:
            print(f"  [INFO] Firebase: disabled")

    except Exception as e:
        print(f"  [ERR] Config error: {e}")

    print()
    print("[SEC] SECURITY")
    print("-" * 40)

    # Check if default API key is being used
    try:
        api_key = config["auth"]["api_key"]
        if (
            "change" in api_key.lower()
            or "default" in api_key.lower()
            or len(api_key) < 20
        ):
            print(f"  [WARN] API key looks weak/default - consider changing")
        else:
            print(f"  [OK] API key appears configured")
    except:
        print(f"  [ERR] Could not check API key")

    # Check .env for Real-Debrid
    if os.path.exists(".env"):
        with open(".env") as f:
            env_content = f.read()
        if "RD_API_KEY=" in env_content and "your-" not in env_content:
            print(f"  [OK] Real-Debrid API key found in .env")
        else:
            print(f"  [WARN] Real-Debrid API key may need configuration")

    print()
    print("[READY] READY TO START")
    print("-" * 40)

    if all_ok:
        print("  [OK] All critical files present")
        print("  [OK] Server can start with: python server.py")
        print()
        print("  Access URLs:")
        print("    • Dashboard: http://localhost:8080")
        print("    • Logo Preview: assets/logo-preview.html")
    else:
        print("  [ERR] Some critical files are missing!")

    print()
    print("=" * 60)


if __name__ == "__main__":
    main()
