
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to parse RSS/XML
function parseXML(xmlString: string) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml');
}

// Fetch Reddit posts from r/Startup_Ideas RSS feed
async function fetchRedditStartupIdeas(limit = 10) {
  try {
    const response = await fetch(
      `https://www.reddit.com/r/Startup_Ideas/new.rss?limit=${limit}`,
      {
        headers: {
          'User-Agent': 'ProblemSparkEngine/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Reddit RSS error: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const doc = parseXML(xmlText);
    const items = doc.querySelectorAll('item');
    
    const posts = [];
    for (const item of items) {
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      
      // Extract text content from HTML description
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      posts.push({
        id: link.split('/').pop() || Math.random().toString(36),
        title: title.replace('[link]', '').replace('[comments]', '').trim(),
        selftext: textContent.substring(0, 500), // Limit content length
        url: link,
        created: Math.floor(new Date(pubDate).getTime() / 1000),
        subreddit: 'Startup_Ideas',
        score: 0
      });
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit RSS:', error);
    throw error;
  }
}

// Fetch Hacker News "Ask HN" posts from RSS
async function fetchHackerNewsAsk(limit = 10) {
  try {
    const response = await fetch('https://hnrss.org/ask');
    
    if (!response.ok) {
      throw new Error(`HN RSS error: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const doc = parseXML(xmlText);
    const items = doc.querySelectorAll('item');
    
    const posts = [];
    let count = 0;
    
    for (const item of items) {
      if (count >= limit) break;
      
      const title = item.querySelector('title')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      
      // Skip if no meaningful content
      if (!title || !description || description.length < 50) continue;
      
      // Extract text content from HTML description
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = description;
      const textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      posts.push({
        id: link.split('id=')[1] || Math.random().toString(36),
        title: title,
        text: textContent.substring(0, 500), // Limit content length
        url: link,
        created: Math.floor(new Date(pubDate).getTime() / 1000),
        score: 0
      });
      
      count++;
    }
    
    return posts;
  } catch (error) {
    console.error('Error fetching HN RSS:', error);
    throw error;
  }
}

// Process posts with Gemini AI
async function processWithAI(rawPost: any) {
  const prompt = `
  Extract a startup idea from this post. Return JSON only:
  
  Post Title: "${rawPost.title}"
  Post Content: "${rawPost.text || rawPost.selftext || ''}"
  
  Extract:
  {
    "problem": "Clear problem statement (max 100 chars)",
    "target_user": "Who has this problem (max 50 chars)",  
    "mvp_suggestion": "Simple solution idea (max 150 chars)",
    "tags": ["tag1", "tag2", "tag3"],
    "confidence_score": 0.85
  }
  
  Only return JSON. If no clear startup idea, return {"confidence_score": 0}
  `
  
  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 300
        }
      })
    })
    
    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!content) {
      console.error('No content returned from Gemini API')
      return null
    }
    
    try {
      const parsed = JSON.parse(content)
      if (parsed.confidence_score > 0.7) {
        return {
          problem: parsed.problem,
          target_user: parsed.target_user,
          mvp_suggestion: parsed.mvp_suggestion,
          source_url: rawPost.url,
          source_platform: rawPost.subreddit ? 'reddit' : 'hackernews',
          tags: parsed.tags || [],
          confidence_score: parsed.confidence_score
        }
      }
    } catch (parseError) {
      console.error('AI response parsing error:', parseError)
    }
  } catch (error) {
    console.error('Gemini API error:', error)
  }
  
  return null
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for database access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const requestBody = await req.json().catch(() => ({}))
    const isScheduled = requestBody.scheduled || false

    console.log(`🚀 Starting idea scraping... ${isScheduled ? '(Scheduled)' : '(Manual)'}`)
    
    const allPosts: any[] = []
    const processedIdeas: any[] = []
    
    // Scrape Reddit r/Startup_Ideas
    try {
      const redditPosts = await fetchRedditStartupIdeas(10)
      allPosts.push(...redditPosts)
      console.log(`✅ Scraped ${redditPosts.length} posts from r/Startup_Ideas`)
    } catch (error) {
      console.error('❌ Error scraping r/Startup_Ideas:', error)
    }
    
    // Scrape Hacker News Ask posts
    try {
      const hnPosts = await fetchHackerNewsAsk(10)
      allPosts.push(...hnPosts)
      console.log(`✅ Scraped ${hnPosts.length} Ask HN posts`)
    } catch (error) {
      console.error('❌ Error scraping Hacker News:', error)
    }
    
    // Process with AI (Gemini)
    console.log(`🤖 Processing ${allPosts.length} posts with AI...`)
    
    for (const post of allPosts) {
      try {
        const idea = await processWithAI(post)
        if (idea) {
          // Check if we already have this idea (avoid duplicates)
          const { data: existing } = await supabaseClient
            .from('ideas')
            .select('id')
            .eq('source_url', idea.source_url)
            .single()
          
          if (!existing) {
            // Store in Supabase
            const { error } = await supabaseClient
              .from('ideas')
              .insert([idea])
            
            if (error) {
              console.error('❌ Error storing idea:', error)
            } else {
              processedIdeas.push(idea)
              console.log(`✅ Stored new idea: ${idea.problem.substring(0, 50)}...`)
            }
          } else {
            console.log(`⏭️ Skipped duplicate idea: ${idea.problem.substring(0, 50)}...`)
          }
        }
      } catch (error) {
        console.error('❌ Error processing post:', error)
      }
    }
    
    const message = `🎉 Scraping complete! Found ${allPosts.length} posts, processed ${processedIdeas.length} new ideas`
    console.log(message)
    
    return new Response(
      JSON.stringify({
        success: true,
        scraped: allPosts.length,
        processed: processedIdeas.length,
        new_ideas: processedIdeas.length,
        scheduled: isScheduled,
        timestamp: new Date().toISOString(),
        ideas: processedIdeas.map(idea => ({
          problem: idea.problem,
          confidence_score: idea.confidence_score,
          platform: idea.source_platform
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error('❌ Scraping failed:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
