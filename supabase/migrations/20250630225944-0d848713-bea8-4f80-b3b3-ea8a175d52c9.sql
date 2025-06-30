
-- Create the ideas table to store data from Reddit and Hacker News
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem TEXT,
  target_user TEXT,
  mvp_suggestion TEXT,
  tags TEXT[],
  source_url TEXT UNIQUE,
  source_platform TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create an index on source_url for faster lookups during upserts
CREATE INDEX IF NOT EXISTS idx_ideas_source_url ON public.ideas(source_url);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON public.ideas(created_at);

-- Create an index on source_platform for filtering
CREATE INDEX IF NOT EXISTS idx_ideas_source_platform ON public.ideas(source_platform);

-- Enable Row Level Security (optional - can be disabled for public access)
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to ideas" 
  ON public.ideas 
  FOR SELECT 
  TO public 
  USING (true);

-- Create a policy to allow service role to insert/update
CREATE POLICY "Allow service role full access to ideas" 
  ON public.ideas 
  FOR ALL 
  TO service_role 
  USING (true);
