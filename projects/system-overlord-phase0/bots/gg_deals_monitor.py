#!/usr/bin/env python3
"""
GG.deals Price Monitor Bot
Tracks game price drops and generates affiliate revenue
"""

import os
import sys
import time
import logging
from datetime import datetime, timedelta
import requests
import firebase_admin
from firebase_admin import credentials, firestore, db
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [GG.DEALS] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

# Firebase setup
try:
    firebase_admin.initialize_app()
    db_instance = firestore.client()
    logger.info("Firebase initialized")
except Exception as e:
    logger.error(f"Firebase init failed: {e}")
    sys.exit(1)

AFFILIATE_ID = os.getenv('GG_DEALS_AFFILIATE_ID', 'YOUR_ID')
CHECK_INTERVAL = int(os.getenv('NOTIFICATION_INTERVAL', 300))

class GGDealsMonitor:
    def __init__(self):
        self.deals_cache = {}
        self.price_history = {}
        
    def fetch_deals(self):
        """Fetch latest game deals from GG.deals"""
        try:
            response = requests.get(
                'https://www.gg.deals/api/games',
                params={
                    'limit': 100,
                    'sort': 'release_date',
                    'order': 'desc'
                },
                timeout=10
            )
            response.raise_for_status()
            return response.json().get('data', [])
        except requests.RequestException as e:
            logger.error(f"Fetch failed: {e}")
            return []
    
    def detect_deals(self, games):
        """Identify new deals and price drops"""
        new_deals = []
        
        for game in games:
            game_id = str(game.get('id'))
            current_price = game.get('minPrice') or game.get('priceNew', 999)
            
            # Check if new deal
            if game_id not in self.deals_cache:
                new_deals.append({
                    'type': 'new_deal',
                    'game_id': game_id,
                    'title': game.get('title'),
                    'price': current_price,
                    'original_price': game.get('priceOld', current_price),
                    'url': f"https://www.gg.deals/game/{game.get('slug')}/?affiliateID={AFFILIATE_ID}",
                    'discount': int(((game.get('priceOld', 0) - current_price) / max(game.get('priceOld', 1), 1)) * 100)
                })
                self.deals_cache[game_id] = current_price
            
            # Check for price drops
            elif current_price < self.deals_cache.get(game_id, current_price):
                price_drop = self.deals_cache[game_id] - current_price
                new_deals.append({
                    'type': 'price_drop',
                    'game_id': game_id,
                    'title': game.get('title'),
                    'previous_price': self.deals_cache[game_id],
                    'current_price': current_price,
                    'drop_amount': price_drop,
                    'url': f"https://www.gg.deals/game/{game.get('slug')}/?affiliateID={AFFILIATE_ID}",
                })
                self.deals_cache[game_id] = current_price
        
        return new_deals
    
    def log_deal_to_firebase(self, deal):
        """Store deal in Firestore"""
        try:
            db_instance.collection('deals').document(deal['game_id']).set({
                'title': deal.get('title'),
                'price': deal.get('current_price') or deal.get('price'),
                'original_price': deal.get('original_price'),
                'discount': deal.get('discount', 0),
                'url': deal.get('url'),
                'type': deal['type'],
                'timestamp': firestore.SERVER_TIMESTAMP,
            }, merge=True)
            logger.info(f"✅ Logged: {deal['title']} @ ${deal.get('current_price') or deal.get('price')}")
        except Exception as e:
            logger.error(f"Firebase write failed: {e}")
    
    def run(self):
        """Main bot loop"""
        logger.info("🤖 GG.deals Monitor started")
        
        while True:
            try:
                logger.info("🔍 Checking for deals...")
                games = self.fetch_deals()
                
                if games:
                    deals = self.detect_deals(games)
                    
                    if deals:
                        logger.info(f"💎 Found {len(deals)} deal(s)")
                        for deal in deals:
                            self.log_deal_to_firebase(deal)
                    else:
                        logger.info("➖ No new deals detected")
                else:
                    logger.warning("⚠️ No games fetched")
                
                time.sleep(CHECK_INTERVAL)
            except KeyboardInterrupt:
                logger.info("⚡ Monitor stopped")
                break
            except Exception as e:
                logger.error(f"❌ Unexpected error: {e}")
                time.sleep(CHECK_INTERVAL)

if __name__ == '__main__':
    monitor = GGDealsMonitor()
    monitor.run()
