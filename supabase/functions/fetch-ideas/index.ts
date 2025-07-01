
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('--- FUNCTION EXECUTION STARTED ---');
    console.log('Starting fetch ideas process...');
    
    // Validate environment variables
    const requiredEnv = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GEMINI_API_KEY'];
    const missingEnv = [];
    
    for (const v of requiredEnv) {
      if (!Deno.env.get(v)) {
        missingEnv.push(v);
      }
    }
    
    if (missingEnv.length > 0) {
      console.error('Missing required environment variables:', missingEnv);
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables', missing: missingEnv }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const ideas: any[] = [];
    
    // Reddit API calls
    console.log('Fetching from Reddit...');
    const subreddits = Deno.env.get('SUBREDDITS')?.split(',') || ['SaaS', 'Entrepreneur', 'startups'];
    console.log('Subreddits to fetch:', subreddits);
    
    for (const sub of subreddits) {
      try {
        console.log(`Fetching from r/${sub}...`);
        const redditUrl = `https://www.reddit.com/r/${sub}/new.json?limit=10`;
        console.log('Reddit URL:', redditUrl);
        
        const redditResponse = await fetch(redditUrl, {
          headers: {
            'User-Agent': 'ideaohm/1.0 (by /u/ideaohm)'
          }
        });
        
        console.log(`Reddit response status for r/${sub}:`, redditResponse.status);
        
        if (!redditResponse.ok) {
          console.error(`Reddit API error for r/${sub}: ${redditResponse.status} ${redditResponse.statusText}`);
          const errorBody = await redditResponse.text();
          console.error('Reddit error response body:', errorBody);
          continue;
        }
        
        const redditData = await redditResponse.json();
        const posts = redditData.data?.children || [];
        console.log(`Received ${posts.length} posts from Reddit r/${sub}`);
        
        posts.forEach((post: any) => {
          const p = post.data;
          if (p.title && p.title.length > 10) { // Only include posts with meaningful titles
            ideas.push({
              title: p.title,
              body: p.selftext || '',
              url: `https://reddit.com${p.permalink}`,
              src: 'reddit'
            });
          }
        });
        
      } catch (error) {
        console.error(`Error fetching from Reddit r/${sub}:`, error.message);
      }
    }
    
    // Hacker News API calls
    console.log('Fetching from Hacker News...');
    try {
      const hnFilter = Deno.env.get('HN_FILTER') || 'story';
      const hnUrl = `https://hn.algolia.com/api/v1/search_by_date?tags=${hnFilter}&hitsPerPage=20`;
      console.log('HN URL:', hnUrl);
      
      const hnResponse = await fetch(hnUrl);
      console.log('HN response status:', hnResponse.status);
      
      if (!hnResponse.ok) {
        console.error(`Hacker News API error: ${hnResponse.status} ${hnResponse.statusText}`);
        const errorBody = await hnResponse.text();
        console.error('HN error response body:', errorBody);
      } else {
        const hnData = await hnResponse.json();
        const hits = hnData.hits || [];
        console.log(`Received ${hits.length} hits from Hacker News`);
        
        hits.forEach((hit: any) => {
          if (hit.title && hit.title.length > 10) { // Only include posts with meaningful titles
            ideas.push({
              title: hit.title || '',
              body: hit.comment_text || hit.story_text || '',
              url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
              src: 'hackernews'
            });
          }
        });
      }
    } catch (error) {
      console.error('Error fetching from Hacker News:', error.message);
    }

    console.log(`Collected ${ideas.length} total ideas`);

    // Filter ideas based on keywords - looking for questions, problems, or discussions
    const regex = /(\?|how to|what are|best way to|need help|looking for|anyone know|problem with|issue with|struggling with|difficulty|challenge)/i;
    const filteredIdeas = ideas.filter(idea => {
      const text = (idea.title + ' ' + idea.body).toLowerCase();
      return regex.test(text) && text.length > 50; // Ensure meaningful content
    });
    
    console.log(`Filtered to ${filteredIdeas.length} relevant ideas`);

    let insertedCount = 0;
    
    // Process each filtered idea
    for (const idea of filteredIdeas) {
      try {
        console.log(`Processing idea: ${idea.title.substring(0, 50)}...`);
        
        // Call Gemini AI to process the idea
        const summary = await summarizeWithGemini(idea.title, idea.body);
        
        if (summary) {
          console.log('Gemini processing successful, inserting into database...');
          
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
            console.log(`Successfully inserted idea ${insertedCount}`);
          }
        } else {
          console.log('Gemini processing failed for this idea');
        }
      } catch (summaryError) {
        console.error('Error processing idea:', summaryError.message);
      }
    }
    
    const result = {
      status: 'ok',
      processed: filteredIdeas.length,
      inserted: insertedCount,
      total_collected: ideas.length,
      subreddits_checked: subreddits
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
    const model = Deno.env.get('GEMINI_MODEL') || 'gemini-1.5-flash';
    
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return null;
    }
    
    console.log('Calling Gemini API...');
    
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
    
    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, response.statusText, errorText);
      return null;
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text returned from Gemini');
      return null;
    }
    
    console.log('Gemini response received, parsing JSON...');
    
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
      const parsed = JSON.parse(jsonString);
      console.log('Successfully parsed Gemini response');
      return parsed;
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
