-- ============================================
-- LITLAB ULTRA - CRYPTO & WEB3 DATABASE SCHEMA
-- Multi-chain wallets, NFTs, staking, DeFi integration
-- ============================================

-- Wallets table (multi-chain support)
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  chain TEXT NOT NULL, -- 'ethereum', 'bitcoin', 'solana', 'polygon', 'litbit'
  wallet_type TEXT NOT NULL DEFAULT 'native', -- 'native', 'external', 'custodial'
  name TEXT, -- User-friendly wallet name
  is_primary BOOLEAN DEFAULT FALSE,
  encrypted_private_key TEXT, -- Only for custodial wallets
  public_key TEXT,
  balance DECIMAL(36, 18) DEFAULT 0,
  balance_usd DECIMAL(20, 2) DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, wallet_address, chain)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_address ON wallets(wallet_address);
CREATE INDEX idx_wallets_chain ON wallets(chain);
CREATE INDEX idx_wallets_primary ON wallets(user_id, is_primary);

-- Tokens table (track all tokens across chains)
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  contract_address TEXT,
  decimals INTEGER DEFAULT 18,
  logo_url TEXT,
  token_type TEXT NOT NULL DEFAULT 'native', -- 'native', 'erc20', 'spl', 'bep20'
  price_usd DECIMAL(20, 8),
  market_cap BIGINT,
  volume_24h BIGINT,
  price_change_24h DECIMAL(10, 4),
  is_verified BOOLEAN DEFAULT FALSE,
  is_tradeable BOOLEAN DEFAULT TRUE,
  coingecko_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, chain, contract_address)
);

CREATE INDEX idx_tokens_symbol ON tokens(symbol);
CREATE INDEX idx_tokens_chain ON tokens(chain);
CREATE INDEX idx_tokens_verified ON tokens(is_verified);

-- Token balances table
CREATE TABLE IF NOT EXISTS token_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
  balance_usd DECIMAL(20, 2) DEFAULT 0,
  locked_balance DECIMAL(36, 18) DEFAULT 0, -- For staking
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wallet_id, token_id)
);

CREATE INDEX idx_token_balances_wallet_id ON token_balances(wallet_id);
CREATE INDEX idx_token_balances_token_id ON token_balances(token_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS crypto_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  transaction_hash TEXT NOT NULL,
  chain TEXT NOT NULL,
  type TEXT NOT NULL, -- 'send', 'receive', 'swap', 'stake', 'unstake', 'mint', 'burn'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'failed'
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  token_id UUID REFERENCES tokens(id) ON DELETE SET NULL,
  amount DECIMAL(36, 18) NOT NULL,
  amount_usd DECIMAL(20, 2),
  fee DECIMAL(36, 18),
  fee_usd DECIMAL(20, 2),
  nonce INTEGER,
  block_number BIGINT,
  confirmations INTEGER DEFAULT 0,
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_crypto_transactions_wallet_id ON crypto_transactions(wallet_id);
CREATE INDEX idx_crypto_transactions_hash ON crypto_transactions(transaction_hash);
CREATE INDEX idx_crypto_transactions_chain ON crypto_transactions(chain);
CREATE INDEX idx_crypto_transactions_status ON crypto_transactions(status);
CREATE INDEX idx_crypto_transactions_created_at ON crypto_transactions(created_at DESC);

-- NFT collections table
CREATE TABLE IF NOT EXISTS nft_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  symbol TEXT,
  chain TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  contract_type TEXT NOT NULL, -- 'ERC721', 'ERC1155', 'SPL'
  creator_address TEXT,
  owner_count INTEGER DEFAULT 0,
  item_count INTEGER DEFAULT 0,
  floor_price DECIMAL(20, 8),
  floor_price_usd DECIMAL(20, 2),
  volume_24h DECIMAL(20, 8),
  volume_total DECIMAL(20, 8),
  banner_url TEXT,
  logo_url TEXT,
  featured_image_url TEXT,
  external_url TEXT,
  twitter_url TEXT,
  discord_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  royalty_percentage DECIMAL(5, 2),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chain, contract_address)
);

CREATE INDEX idx_nft_collections_chain ON nft_collections(chain);
CREATE INDEX idx_nft_collections_name ON nft_collections(name);
CREATE INDEX idx_nft_collections_verified ON nft_collections(is_verified);

-- NFTs table
CREATE TABLE IF NOT EXISTS nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES nft_collections(id) ON DELETE CASCADE,
  token_id TEXT NOT NULL,
  owner_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  animation_url TEXT,
  external_url TEXT,
  attributes JSONB, -- Array of traits
  rarity_score DECIMAL(10, 4),
  rarity_rank INTEGER,
  last_sale_price DECIMAL(20, 8),
  last_sale_price_usd DECIMAL(20, 2),
  last_sale_date TIMESTAMP WITH TIME ZONE,
  listed_for_sale BOOLEAN DEFAULT FALSE,
  sale_price DECIMAL(20, 8),
  metadata_uri TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, token_id)
);

CREATE INDEX idx_nfts_collection_id ON nfts(collection_id);
CREATE INDEX idx_nfts_owner_wallet_id ON nfts(owner_wallet_id);
CREATE INDEX idx_nfts_listed ON nfts(listed_for_sale);
CREATE INDEX idx_nfts_rarity ON nfts(rarity_rank);

-- NFT marketplace listings table
CREATE TABLE IF NOT EXISTS nft_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nft_id UUID NOT NULL REFERENCES nfts(id) ON DELETE CASCADE,
  seller_wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  price DECIMAL(20, 8) NOT NULL,
  price_usd DECIMAL(20, 2),
  payment_token_id UUID REFERENCES tokens(id) ON DELETE SET NULL,
  listing_type TEXT NOT NULL DEFAULT 'fixed', -- 'fixed', 'auction'
  auction_end_time TIMESTAMP WITH TIME ZONE,
  highest_bid DECIMAL(20, 8),
  highest_bidder_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold', 'cancelled', 'expired'
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sold_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_nft_listings_nft_id ON nft_listings(nft_id);
CREATE INDEX idx_nft_listings_seller ON nft_listings(seller_wallet_id);
CREATE INDEX idx_nft_listings_status ON nft_listings(status);
CREATE INDEX idx_nft_listings_price ON nft_listings(price);

-- Staking pools table
CREATE TABLE IF NOT EXISTS staking_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  chain TEXT NOT NULL,
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  reward_token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
  pool_type TEXT NOT NULL DEFAULT 'flexible', -- 'flexible', 'locked'
  lock_period_days INTEGER, -- For locked staking
  apy DECIMAL(10, 4) NOT NULL, -- Annual Percentage Yield
  min_stake_amount DECIMAL(36, 18),
  max_stake_amount DECIMAL(36, 18),
  total_staked DECIMAL(36, 18) DEFAULT 0,
  total_staked_usd DECIMAL(20, 2) DEFAULT 0,
  participant_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_staking_pools_chain ON staking_pools(chain);
CREATE INDEX idx_staking_pools_token_id ON staking_pools(token_id);
CREATE INDEX idx_staking_pools_active ON staking_pools(is_active);

-- User stakes table
CREATE TABLE IF NOT EXISTS user_stakes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES staking_pools(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  amount DECIMAL(36, 18) NOT NULL,
  amount_usd DECIMAL(20, 2),
  rewards_earned DECIMAL(36, 18) DEFAULT 0,
  rewards_claimed DECIMAL(36, 18) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'unstaking', 'withdrawn'
  staked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_at TIMESTAMP WITH TIME ZONE, -- For locked staking
  unstaked_at TIMESTAMP WITH TIME ZONE,
  last_reward_claim_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_stakes_pool_id ON user_stakes(pool_id);
CREATE INDEX idx_user_stakes_wallet_id ON user_stakes(wallet_id);
CREATE INDEX idx_user_stakes_status ON user_stakes(status);

-- Swap history table
CREATE TABLE IF NOT EXISTS swap_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  from_token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  to_token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  from_amount DECIMAL(36, 18) NOT NULL,
  to_amount DECIMAL(36, 18) NOT NULL,
  exchange_rate DECIMAL(36, 18),
  slippage_tolerance DECIMAL(5, 2),
  actual_slippage DECIMAL(5, 2),
  gas_fee DECIMAL(36, 18),
  protocol_fee DECIMAL(36, 18),
  total_fee_usd DECIMAL(20, 2),
  dex_protocol TEXT, -- 'uniswap', 'pancakeswap', 'sushiswap', etc.
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_swap_history_wallet_id ON swap_history(wallet_id);
CREATE INDEX idx_swap_history_status ON swap_history(status);
CREATE INDEX idx_swap_history_created_at ON swap_history(created_at DESC);

-- Liquidity pools table
CREATE TABLE IF NOT EXISTS liquidity_pools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  chain TEXT NOT NULL,
  dex_protocol TEXT NOT NULL,
  token_a_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  token_b_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  reserve_a DECIMAL(36, 18) DEFAULT 0,
  reserve_b DECIMAL(36, 18) DEFAULT 0,
  total_liquidity_usd DECIMAL(20, 2) DEFAULT 0,
  volume_24h_usd DECIMAL(20, 2) DEFAULT 0,
  apy DECIMAL(10, 4),
  fee_percentage DECIMAL(5, 2),
  lp_token_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_liquidity_pools_chain ON liquidity_pools(chain);
CREATE INDEX idx_liquidity_pools_tokens ON liquidity_pools(token_a_id, token_b_id);
CREATE INDEX idx_liquidity_pools_active ON liquidity_pools(is_active);

-- User liquidity positions table
CREATE TABLE IF NOT EXISTS user_liquidity_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pool_id UUID NOT NULL REFERENCES liquidity_pools(id) ON DELETE CASCADE,
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  lp_token_amount DECIMAL(36, 18) NOT NULL,
  token_a_provided DECIMAL(36, 18) NOT NULL,
  token_b_provided DECIMAL(36, 18) NOT NULL,
  initial_value_usd DECIMAL(20, 2),
  current_value_usd DECIMAL(20, 2),
  fees_earned_usd DECIMAL(20, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'withdrawn'
  provided_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  withdrawn_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_user_liquidity_pool_id ON user_liquidity_positions(pool_id);
CREATE INDEX idx_user_liquidity_wallet_id ON user_liquidity_positions(wallet_id);
CREATE INDEX idx_user_liquidity_status ON user_liquidity_positions(status);

-- Token price history table (for charts)
CREATE TABLE IF NOT EXISTS token_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_id UUID NOT NULL REFERENCES tokens(id) ON DELETE CASCADE,
  price_usd DECIMAL(20, 8) NOT NULL,
  volume_24h BIGINT,
  market_cap BIGINT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(token_id, timestamp)
);

CREATE INDEX idx_token_price_history_token_id ON token_price_history(token_id);
CREATE INDEX idx_token_price_history_timestamp ON token_price_history(timestamp DESC);

-- Wallet watchlist table
CREATE TABLE IF NOT EXISTS wallet_watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  watched_address TEXT NOT NULL,
  chain TEXT NOT NULL,
  label TEXT,
  notes TEXT,
  alert_on_transaction BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, watched_address, chain)
);

CREATE INDEX idx_wallet_watchlist_user_id ON wallet_watchlist(user_id);
CREATE INDEX idx_wallet_watchlist_address ON wallet_watchlist(watched_address);

-- Crypto alerts table
CREATE TABLE IF NOT EXISTS crypto_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'price', 'transaction', 'balance'
  token_id UUID REFERENCES tokens(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  condition TEXT NOT NULL, -- 'above', 'below', 'equals'
  target_value DECIMAL(20, 8),
  current_value DECIMAL(20, 8),
  is_triggered BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_crypto_alerts_user_id ON crypto_alerts(user_id);
CREATE INDEX idx_crypto_alerts_active ON crypto_alerts(is_active);
CREATE INDEX idx_crypto_alerts_type ON crypto_alerts(alert_type);

-- ============================================
-- Functions and Triggers
-- ============================================

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at BEFORE UPDATE ON tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nft_collections_updated_at BEFORE UPDATE ON nft_collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nfts_updated_at BEFORE UPDATE ON nfts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE swap_history ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
CREATE POLICY "Users can view their own wallets" ON wallets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wallets" ON wallets
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their own transactions" ON crypto_transactions
  FOR SELECT USING (wallet_id IN (
    SELECT id FROM wallets WHERE user_id = auth.uid()
  ));

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Total tables: 17
-- Features: Multi-chain wallets, Tokens, NFTs, Staking, Swaps, Liquidity pools, Price tracking, Alerts
-- Ready for full Web3 integration!
