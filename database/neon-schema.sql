-- Neon PostgreSQL Schema for Problem Spark Engine
-- Copy/paste this into Neon SQL Editor or run via psql

-- Main ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id VARCHAR(255) PRIMARY KEY,
  problem TEXT NOT NULL,
  target_user TEXT,
  mvp_suggestion TEXT,
  source_url TEXT,
  source_platform VARCHAR(20) CHECK (source_platform IN ('reddit', 'hackernews', 'twitter')),
  tags JSONB,
  confidence_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for future Farcaster auth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  farcaster_fid INTEGER UNIQUE,
  username VARCHAR(100),
  display_name VARCHAR(200),
  pfp_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id VARCHAR(255),
  idea_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, idea_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Collections table (for bookmark organization)
CREATE TABLE IF NOT EXISTS collections (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Collection items (many-to-many)
CREATE TABLE IF NOT EXISTS collection_items (
  collection_id VARCHAR(255),
  idea_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (collection_id, idea_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ideas_platform ON ideas(source_platform);
CREATE INDEX IF NOT EXISTS idx_ideas_created ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_ideas_confidence ON ideas(confidence_score);
CREATE INDEX IF NOT EXISTS idx_users_fid ON users(farcaster_fid);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_idea ON bookmarks(idea_id);
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);

-- Full-text search index (PostgreSQL style)
CREATE INDEX IF NOT EXISTS idx_ideas_search ON ideas USING GIN (
  to_tsvector('english', problem || ' ' || COALESCE(mvp_suggestion, '') || ' ' || COALESCE(target_user, ''))
);

-- JSONB index for tags
CREATE INDEX IF NOT EXISTS idx_ideas_tags ON ideas USING GIN (tags);

-- Sample data for testing
INSERT INTO ideas (
  id, problem, target_user, mvp_suggestion, source_url, 
  source_platform, tags, confidence_score
) VALUES 
(
  'neon_sample_1',
  'Developers struggle to automatically announce GitHub releases on social media',
  'Open-source maintainers and indie developers',
  'A webhook service that posts GitHub releases to Twitter/X and LinkedIn automatically',
  'https://news.ycombinator.com/item?id=38920043',
  'hackernews',
  '["DevTools", "Automation", "Social Media"]'::jsonb,
  0.92
),
(
  'neon_sample_2', 
  'Small business owners waste hours manually scheduling social media posts',
  'Small business owners and solopreneurs',
  'A scheduler that adapts one post for multiple platforms with optimal timing',
  'https://reddit.com/r/entrepreneur/comments/example',
  'reddit',
  '["Social Media", "Automation", "Small Business"]'::jsonb,
  0.88
)
ON CONFLICT (id) DO NOTHING;