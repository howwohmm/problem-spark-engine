import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('--- CANARY: FUNCTION EXECUTION STARTED ---');
    console.log('Starting fetch ideas process...');
    
    // --- NETWORK TEST ---
    try {
      console.log('--- Performing outbound network test to GitHub ---');
      const testResponse = await fetch('https://api.github.com');
      console.log(`--- Network test status: ${testResponse.status} ---`);
    } catch (e) {
      console.error('--- NETWORK TEST FAILED ---', e.message);
    }
    // --------------------

    // Validate environment variables
    const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY', 'SUBREDDITS', 'HN_FILTER'];
    for (const v of requiredEnv) {
      if (!Deno.env.get(v)) {
        throw new Error(`Missing required environment variable: ${v}`);
      }
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ideas: any[] = [];
    
    // Reddit API calls
    console.log('Fetching from Reddit...');
    const subreddits = Deno.env.get('SUBREDDITS')?.split(',') || ['SaaS', 'Entrepreneur'];
    
    for (const sub of subreddits) {
      try {
        const redditResponse = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=10`, {
          headers: {
            'User-Agent': 'ideaohm/1.0'
          }
        });
        
        if (!redditResponse.ok) {
          console.error(`Reddit API error for r/${sub}: ${redditResponse.status} ${redditResponse.statusText}`);
          const errorBody = await redditResponse.text();
          console.error('Response body:', errorBody);
          continue; // Skip to the next subreddit
        }
        
        if (redditResponse.ok) {
          const redditData = await redditResponse.json();
          const posts = redditData.data?.children || [];
          console.log(`Received ${posts.length} posts from Reddit r/${sub}.`);
          
          posts.forEach((post: any) => {
            const p = post.data;
            ideas.push({
              title: p.title,
              body: p.selftext || '',
              url: `https://reddit.com${p.permalink}`,
              src: 'reddit'
            });
          });
        }
      } catch (error) {
        console.error(`Error fetching from Reddit r/${sub}:`, error);
      }
    }
    
    // Hacker News API calls
    console.log('Fetching from Hacker News...');
    try {
      const hnFilter = Deno.env.get('HN_FILTER') || '(story,ask_hn)';
      const hnResponse = await fetch(
        `https://hn.algolia.com/api/v1/search_by_date?tags=${hnFilter}&hitsPerPage=20`
      );
      
      if (!hnResponse.ok) {
        console.error(`Hacker News API error: ${hnResponse.status} ${hnResponse.statusText}`);
        const errorBody = await hnResponse.text();
        console.error('Response body:', errorBody);
      } else if (hnResponse.ok) {
        const hnData = await hnResponse.json();
        const hits = hnData.hits || [];
        console.log(`Received ${hits.length} hits from Hacker News.`);
        hits.forEach((hit: any) => {
          ideas.push({
            title: hit.title || '',
            body: hit.comment_text || hit.story_text || '',
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            src: 'hackernews'
          });
        });
      }
    } catch (error) {
      console.error('Error fetching from Hacker News:', error);
    }

    console.log(`Collected ${ideas.length} total ideas`);

    // Filter ideas based on keywords - looking for questions or discussions
    const regex = /(\?|how to|what are|best way to)/i;
    const filteredIdeas = ideas.filter(idea => 
      regex.test((idea.title + ' ' + idea.body).toLowerCase())
    );
    
    console.log(`Filtered to ${filteredIdeas.length} relevant ideas`);

    let insertedCount = 0;
    
    // Process each filtered idea
    for (const idea of filteredIdeas) {
      try {
        // Call Gemini AI to process the idea
        const summary = await summarizeWithGemini(idea.title, idea.body);
        
        if (summary) {
          // Insert into Supabase
          const { error } = await supabase
            .from('ideas')
            .upsert({
              problem: summary.problem,
              target_user: summary.target_user,
              mvp_suggestion: summary.mvp_suggestion,
              tags: summary.tags,
              source_url: idea.url,
              source_platform: idea.src
            }, { 
              onConflict: 'source_url',
              ignoreDuplicates: false 
            });
          
          if (error) {
            console.error('Error inserting idea:', error);
          } else {
            insertedCount++;
          }
        }
      } catch (summaryError) {
        console.error('Error processing idea:', summaryError);
      }
    }
    
    const result = {
      status: 'ok',
      processed: filteredIdeas.length,
      inserted: insertedCount,
      total_collected: ideas.length
    };
    
    console.log('Process completed:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Fetch ideas error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch ideas', details: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function summarizeWithGemini(title: string, body: string) {
  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-pro';
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return null;
    }
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this post and return a JSON object with these fields: problem (the main problem described), target_user (who faces this problem), mvp_suggestion (a simple solution idea), tags (array of relevant tags).

Title: ${title}
Content: ${body}

Return only valid JSON, no additional text.`
            }]
          }],
          generationConfig: { 
            maxOutputTokens: 256,
            temperature: 0.7
          }
        })
      }
    );
    
    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text returned from Gemini');
      return null;
    }
    
    // Clean the text and extract the JSON object
    try {
      // Find the start and end of the JSON object
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}');
      
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error('No valid JSON object found in Gemini response:', text);
        return null;
      }
      
      const jsonString = text.substring(startIndex, endIndex + 1);
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse JSON from Gemini response:', e.message);
      console.error('Raw Gemini response text:', text);
      return null;
    }
  } catch (e) {
    console.error(`Gemini API call failed: ${e.message}`);
    return null;
  }
}
