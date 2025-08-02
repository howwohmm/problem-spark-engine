
-- Clean Supabase setup for Problem Spark Engine
-- First, drop any existing tables to start fresh
DROP TABLE IF EXISTS collection_items;
DROP TABLE IF EXISTS collections;
DROP TABLE IF EXISTS bookmarks;
DROP TABLE IF EXISTS analytics;
DROP TABLE IF EXISTS ideas;
DROP TABLE IF EXISTS users;

-- Create the main ideas table with proper Supabase structure
CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem text NOT NULL,
  target_user text,
  mvp_suggestion text,
  source_url text,
  source_platform text CHECK (source_platform IN ('reddit', 'hackernews', 'twitter')),
  tags text[] DEFAULT '{}',
  confidence_score float DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create users/profiles table (connected to auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  display_name text,
  pfp_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, idea_id)
);

-- Create collections table
CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT '#3b82f6',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create collection_items junction table
CREATE TABLE public.collection_items (
  collection_id uuid REFERENCES public.collections(id) ON DELETE CASCADE,
  idea_id uuid REFERENCES public.ideas(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (collection_id, idea_id)
);

-- Enable Row Level Security
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ideas (public read access)
CREATE POLICY "Allow public read access to ideas" 
ON public.ideas FOR SELECT 
USING (true);

CREATE POLICY "Allow service role full access to ideas" 
ON public.ideas FOR ALL 
USING (true);

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create RLS policies for bookmarks
CREATE POLICY "Users can view own bookmarks" 
ON public.bookmarks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" 
ON public.bookmarks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" 
ON public.bookmarks FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for collections
CREATE POLICY "Users can view own collections" 
ON public.collections FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own collections" 
ON public.collections FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for collection_items
CREATE POLICY "Users can view collection items of their collections" 
ON public.collection_items FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_items.collection_id 
  AND collections.user_id = auth.uid()
));

CREATE POLICY "Users can manage collection items of their collections" 
ON public.collection_items FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_items.collection_id 
  AND collections.user_id = auth.uid()
)) 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.collections 
  WHERE collections.id = collection_items.collection_id 
  AND collections.user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_ideas_platform ON public.ideas(source_platform);
CREATE INDEX idx_ideas_created ON public.ideas(created_at);
CREATE INDEX idx_ideas_confidence ON public.ideas(confidence_score);
CREATE INDEX idx_ideas_tags ON public.ideas USING GIN(tags);
CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_idea ON public.bookmarks(idea_id);
CREATE INDEX idx_collections_user ON public.collections(user_id);

-- Create full-text search index
CREATE INDEX idx_ideas_search ON public.ideas USING GIN(
  to_tsvector('english', problem || ' ' || COALESCE(mvp_suggestion, '') || ' ' || COALESCE(target_user, ''))
);

-- Create trigger to auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at 
BEFORE UPDATE ON public.ideas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
BEFORE UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at 
BEFORE UPDATE ON public.collections 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'display_name'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.ideas (
  problem, target_user, mvp_suggestion, source_url, 
  source_platform, tags, confidence_score
) VALUES 
(
  'Developers struggle to automatically announce GitHub releases on social media',
  'Open-source maintainers and indie developers',
  'A webhook service that posts GitHub releases to Twitter/X and LinkedIn automatically',
  'https://news.ycombinator.com/item?id=38920043',
  'hackernews',
  ARRAY['DevTools', 'Automation', 'Social Media'],
  0.92
),
(
  'Small business owners waste hours manually scheduling social media posts',
  'Small business owners and solopreneurs',
  'A scheduler that adapts one post for multiple platforms with optimal timing',
  'https://reddit.com/r/entrepreneur/comments/example',
  'reddit',
  ARRAY['Social Media', 'Automation', 'Small Business'],
  0.88
),
(
  'Remote teams struggle with async feedback on design mockups',
  'Design teams and product managers',
  'A tool that lets teams leave timestamped voice notes on design files',
  'https://reddit.com/r/webdev/comments/example2',
  'reddit',
  ARRAY['Design', 'Remote Work', 'Collaboration'],
  0.85
);
