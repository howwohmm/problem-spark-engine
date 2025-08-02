
-- Enable pg_cron extension for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a cron job to run the scraping function every 3 hours
SELECT cron.schedule(
  'scrape-ideas-every-3-hours',
  '0 */3 * * *', -- every 3 hours at the top of the hour
  $$
  SELECT
    net.http_post(
        url:='https://rnzczybbwzkyepwtkfql.supabase.co/functions/v1/scrape-ideas',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuemN6eWJid3preWVwd3RrZnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMjAwMDQsImV4cCI6MjA2Njg5NjAwNH0.r1c97Cd5sdzc7bMPh2c0eMVtqXaSNLRwOCn3r2AcCOY"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
