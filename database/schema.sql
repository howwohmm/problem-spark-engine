-- PlanetScale Database Schema for Problem Spark Engine
-- Run this in your PlanetScale dashboard or CLI

-- Main ideas table
CREATE TABLE ideas (
  id VARCHAR(255) PRIMARY KEY,
  problem TEXT NOT NULL,
  target_user TEXT,
  mvp_suggestion TEXT,
  source_url TEXT,
  source_platform ENUM('reddit', 'hackernews', 'twitter') NOT NULL,
  tags JSON,
  confidence_score FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_platform (source_platform),
  INDEX idx_created (created_at),
  INDEX idx_confidence (confidence_score),
  
  -- Full-text search index
  FULLTEXT idx_search (problem, mvp_suggestion, target_user)
);

-- Users table (for future Farcaster auth)
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  farcaster_fid INT UNIQUE,
  username VARCHAR(100),
  display_name VARCHAR(200),
  pfp_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_fid (farcaster_fid),
  INDEX idx_username (username)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  user_id VARCHAR(255),
  idea_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (user_id, idea_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  
  INDEX idx_user (user_id),
  INDEX idx_idea (idea_id),
  INDEX idx_created (created_at)
);

-- Collections table (for bookmark organization)
CREATE TABLE collections (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#3b82f6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Collection items (many-to-many)
CREATE TABLE collection_items (
  collection_id VARCHAR(255),
  idea_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (collection_id, idea_id),
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Analytics table (optional)
CREATE TABLE analytics (
  id VARCHAR(255) PRIMARY KEY,
  event_type ENUM('view', 'bookmark', 'share', 'click') NOT NULL,
  idea_id VARCHAR(255),
  user_id VARCHAR(255),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  
  INDEX idx_event (event_type),
  INDEX idx_created (created_at),
  INDEX idx_idea (idea_id)
);

-- Sample data (optional - for testing)
INSERT INTO ideas (
  id, problem, target_user, mvp_suggestion, source_url, 
  source_platform, tags, confidence_score
) VALUES 
(
  'sample_1',
  'Developers struggle to automatically announce GitHub releases on social media',
  'Open-source maintainers and indie developers',
  'A webhook service that posts GitHub releases to Twitter/X and LinkedIn automatically',
  'https://news.ycombinator.com/item?id=38920043',
  'hackernews',
  '["DevTools", "Automation", "Social Media"]',
  0.92
),
(
  'sample_2', 
  'Small business owners waste hours manually scheduling social media posts',
  'Small business owners and solopreneurs',
  'A scheduler that adapts one post for multiple platforms with optimal timing',
  'https://reddit.com/r/entrepreneur/comments/example',
  'reddit',
  '["Social Media", "Automation", "Small Business"]',
  0.88
);