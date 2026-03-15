#!/usr/bin/env python3
"""
System Overlord Bot Manager
Orchestrates all autonomous agents
"""

import os
import sys
import subprocess
import logging
from threading import Thread
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [OVERLORD] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

BOTS = [
    ('gg_deals_monitor.py', 'GG.deals Price Monitor'),
    # Add more bots here:
    # ('real_debrid_bot.py', 'Real-Debrid Unlocker'),
    # ('osint_aggregator.py', 'OSINT Aggregator'),
]

def run_bot(script, name):
    """Run a bot in a subprocess"""
    logger.info(f"🚀 Starting {name}...")
    try:
        subprocess.run([sys.executable, script], check=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {name} failed: {e}")
    except KeyboardInterrupt:
        logger.info(f"⚡ {name} stopped")

def main():
    logger.info("╔════════════════════════════════╗")
    logger.info("║  SYSTEM OVERLORD Bot Manager   ║")
    logger.info("║  $0 → ∞ Autonomous Revenue     ║")
    logger.info("╚════════════════════════════════╝")
    logger.info("")
    
    threads = []
    
    for bot_script, bot_name in BOTS:
        if not os.path.exists(bot_script):
            logger.warning(f"⚠️ {bot_script} not found, skipping")
            continue
        
        thread = Thread(target=run_bot, args=(bot_script, bot_name), daemon=True)
        thread.start()
        threads.append(thread)
    
    logger.info(f"✅ All {len(threads)} bots running")
    logger.info("Press Ctrl+C to stop")
    
    try:
        for thread in threads:
            thread.join()
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down...")

if __name__ == '__main__':
    main()
