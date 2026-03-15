-- ============================================
-- LITLAB ULTRA - MEDIA CENTER DATABASE SCHEMA
-- Kodi Diggz style media system with IPTV, streaming, watch together
-- ============================================

-- Media items table (movies, TV shows, music, podcasts)
CREATE TABLE IF NOT EXISTS media_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'movie', 'tv_show', 'music', 'podcast', 'audiobook', 'ebook', 'comic'
  title TEXT NOT NULL,
  original_title TEXT,
  description TEXT,
  tagline TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  trailer_url TEXT,
  release_date DATE,
  runtime INTEGER, -- in minutes
  genres TEXT[],
  cast TEXT[], -- Array of actor names
  directors TEXT[],
  studios TEXT[],
  rating DECIMAL(3, 1), -- e.g., 8.5
  rating_count INTEGER DEFAULT 0,
  content_rating TEXT, -- 'G', 'PG', 'PG-13', 'R', etc.
  language TEXT,
  country TEXT,
  status TEXT, -- 'released', 'upcoming', 'in_production'
  budget BIGINT,
  revenue BIGINT,
  tmdb_id INTEGER UNIQUE,
  imdb_id TEXT UNIQUE,
  metadata JSONB, -- Additional metadata
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  added_by TEXT REFERENCES users(uid) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_items_type ON media_items(type);
CREATE INDEX idx_media_items_title ON media_items(title);
CREATE INDEX idx_media_items_release_date ON media_items(release_date DESC);
CREATE INDEX idx_media_items_rating ON media_items(rating DESC);
CREATE INDEX idx_media_items_genres ON media_items USING GIN(genres);
CREATE INDEX idx_media_items_tmdb_id ON media_items(tmdb_id);

-- TV show episodes table
CREATE TABLE IF NOT EXISTS tv_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  show_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  air_date DATE,
  runtime INTEGER,
  still_url TEXT,
  rating DECIMAL(3, 1),
  tmdb_id INTEGER,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(show_id, season_number, episode_number)
);

CREATE INDEX idx_tv_episodes_show_id ON tv_episodes(show_id);
CREATE INDEX idx_tv_episodes_season ON tv_episodes(show_id, season_number);

-- Music albums table
CREATE TABLE IF NOT EXISTS music_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  release_date DATE,
  cover_url TEXT,
  genre TEXT,
  record_label TEXT,
  total_tracks INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_music_albums_artist ON music_albums(artist);
CREATE INDEX idx_music_albums_title ON music_albums(title);

-- Music tracks table
CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES music_albums(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  track_number INTEGER,
  duration INTEGER, -- in seconds
  audio_url TEXT,
  lyrics TEXT,
  plays_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_music_tracks_album_id ON music_tracks(album_id);
CREATE INDEX idx_music_tracks_artist ON music_tracks(artist);

-- IPTV channels table
CREATE TABLE IF NOT EXISTS iptv_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  stream_url TEXT NOT NULL,
  category TEXT, -- 'news', 'sports', 'entertainment', 'movies', etc.
  country TEXT,
  language TEXT,
  quality TEXT, -- 'SD', 'HD', 'FHD', '4K'
  is_active BOOLEAN DEFAULT TRUE,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_iptv_channels_category ON iptv_channels(category);
CREATE INDEX idx_iptv_channels_country ON iptv_channels(country);
CREATE INDEX idx_iptv_channels_active ON iptv_channels(is_active);

-- User libraries table
CREATE TABLE IF NOT EXISTS user_libraries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  media_item_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'want_to_watch', -- 'watching', 'completed', 'want_to_watch', 'dropped'
  personal_rating DECIMAL(3, 1),
  review TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  progress JSONB, -- Current episode/timestamp
  times_watched INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, media_item_id)
);

CREATE INDEX idx_user_libraries_user_id ON user_libraries(user_id);
CREATE INDEX idx_user_libraries_status ON user_libraries(user_id, status);
CREATE INDEX idx_user_libraries_favorite ON user_libraries(user_id, favorite);

-- Watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES tv_episodes(id) ON DELETE CASCADE,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
  duration_watched INTEGER, -- in seconds
  total_duration INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  timestamp_position INTEGER, -- Resume position in seconds
  device_type TEXT, -- 'web', 'mobile', 'tv'
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX idx_watch_history_media_id ON watch_history(media_item_id);
CREATE INDEX idx_watch_history_watched_at ON watch_history(watched_at DESC);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  playlist_type TEXT NOT NULL, -- 'video', 'music', 'mixed'
  privacy TEXT NOT NULL DEFAULT 'private', -- 'public', 'private', 'unlisted'
  item_count INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_type ON playlists(playlist_type);
CREATE INDEX idx_playlists_privacy ON playlists(privacy);

-- Playlist items table
CREATE TABLE IF NOT EXISTS playlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES tv_episodes(id) ON DELETE CASCADE,
  track_id UUID REFERENCES music_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(playlist_id, position)
);

CREATE INDEX idx_playlist_items_playlist_id ON playlist_items(playlist_id);
CREATE INDEX idx_playlist_items_media_id ON playlist_items(media_item_id);

-- Watch together rooms table
CREATE TABLE IF NOT EXISTS watch_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  host_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  media_item_id UUID REFERENCES media_items(id) ON DELETE SET NULL,
  episode_id UUID REFERENCES tv_episodes(id) ON DELETE SET NULL,
  current_timestamp INTEGER DEFAULT 0, -- Current playback position in seconds
  is_playing BOOLEAN DEFAULT FALSE,
  max_participants INTEGER DEFAULT 50,
  participant_count INTEGER DEFAULT 1,
  privacy TEXT NOT NULL DEFAULT 'public', -- 'public', 'private', 'friends_only'
  password TEXT, -- For private rooms
  chat_enabled BOOLEAN DEFAULT TRUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_watch_rooms_host_id ON watch_rooms(host_id);
CREATE INDEX idx_watch_rooms_privacy ON watch_rooms(privacy);
CREATE INDEX idx_watch_rooms_active ON watch_rooms(ended_at) WHERE ended_at IS NULL;

-- Watch room participants table
CREATE TABLE IF NOT EXISTS watch_room_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES watch_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'host', 'moderator', 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_watch_room_participants_room_id ON watch_room_participants(room_id);
CREATE INDEX idx_watch_room_participants_user_id ON watch_room_participants(user_id);

-- Watch room chat table
CREATE TABLE IF NOT EXISTS watch_room_chat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES watch_rooms(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text', -- 'text', 'emoji', 'sticker'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_watch_room_chat_room_id ON watch_room_chat(room_id);
CREATE INDEX idx_watch_room_chat_created_at ON watch_room_chat(created_at DESC);

-- Live streaming sessions table
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  streamer_id TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT NOT NULL,
  stream_key TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_live BOOLEAN DEFAULT FALSE,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_live_streams_streamer_id ON live_streams(streamer_id);
CREATE INDEX idx_live_streams_is_live ON live_streams(is_live);
CREATE INDEX idx_live_streams_category ON live_streams(category);

-- Live stream viewers table
CREATE TABLE IF NOT EXISTS live_stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID NOT NULL REFERENCES live_streams(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(uid) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  watch_duration INTEGER, -- in seconds
  UNIQUE(stream_id, user_id)
);

CREATE INDEX idx_live_stream_viewers_stream_id ON live_stream_viewers(stream_id);
CREATE INDEX idx_live_stream_viewers_user_id ON live_stream_viewers(user_id);

-- Media collections table
CREATE TABLE IF NOT EXISTS media_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  collection_type TEXT NOT NULL, -- 'curated', 'franchise', 'genre', 'trending'
  item_count INTEGER DEFAULT 0,
  curator_id TEXT REFERENCES users(uid) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_collections_type ON media_collections(collection_type);
CREATE INDEX idx_media_collections_featured ON media_collections(is_featured);

-- Collection items table
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES media_collections(id) ON DELETE CASCADE,
  media_item_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
  position INTEGER,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, media_item_id)
);

CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);
CREATE INDEX idx_collection_items_media_id ON collection_items(media_item_id);

-- Subtitles table
CREATE TABLE IF NOT EXISTS subtitles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_item_id UUID REFERENCES media_items(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES tv_episodes(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  subtitle_url TEXT NOT NULL,
  format TEXT DEFAULT 'srt', -- 'srt', 'vtt', 'ass'
  is_auto_generated BOOLEAN DEFAULT FALSE,
  uploader_id TEXT REFERENCES users(uid) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subtitles_media_id ON subtitles(media_item_id);
CREATE INDEX idx_subtitles_episode_id ON subtitles(episode_id);
CREATE INDEX idx_subtitles_language ON subtitles(language);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update updated_at timestamp
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_libraries_updated_at BEFORE UPDATE ON user_libraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_libraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- Example RLS policies
CREATE POLICY "Anyone can view media items" ON media_items
  FOR SELECT USING (TRUE);

CREATE POLICY "Users can manage their own library" ON user_libraries
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own watch history" ON watch_history
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own playlists" ON playlists
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view public playlists" ON playlists
  FOR SELECT USING (privacy = 'public' OR user_id = auth.uid());

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_user_libraries_user_media ON user_libraries(user_id, media_item_id);
CREATE INDEX idx_watch_history_user_media ON watch_history(user_id, media_item_id, watched_at DESC);
CREATE INDEX idx_playlists_user_type ON playlists(user_id, playlist_type);
CREATE INDEX idx_watch_rooms_active_public ON watch_rooms(privacy, ended_at) WHERE ended_at IS NULL;

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- Total tables: 18
-- Features: Movies, TV Shows, Music, Podcasts, IPTV, Watch Together, Live Streaming, Playlists, Collections
-- Ready for Kodi Diggz-level media center!
