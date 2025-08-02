
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    console.log('🚀 Starting idea scraping...')
    
    const subreddits = ['entrepreneur', 'startups', 'SaaS', 'indiehackers']
    const allPosts: any[] = []
    const processedIdeas: any[] = []
    
    // Scrape Reddit
    for (const subreddit of subreddits) {
      try {
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/new.json?limit=5`,
          {
            headers: {
              'User-Agent': 'ProblemSparkEngine/1.0'
            }
          }
        )
        
        if (!response.ok) {
          throw new Error(`Reddit API error: ${response.statusText}`)
        }
        
        const data = await response.json()
        const posts = data.data.children.map((post: any) => ({
          id: post.data.id,
          title: post.data.title,
          selftext: post.data.selftext,
          url: `https://reddit.com${post.data.permalink}`,
          created: post.data.created_utc,
          subreddit: post.data.subreddit,
          score: post.data.score
        }))
        
        allPosts.push(...posts)
        console.log(`✅ Scraped ${posts.length} posts from r/${subreddit}`)
      } catch (error) {
        console.error(`❌ Error scraping r/${subreddit}:`, error)
      }
    }
    
    // Scrape Hacker News
    try {
      const askHNResponse = await fetch('https://hacker-news.firebaseio.com/v0/askstories.json')
      const askHNIds = await askHNResponse.json()
      
      for (let i = 0; i < Math.min(5, askHNIds.length); i++) {
        const postResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${askHNIds[i]}.json`)
        const post = await postResponse.json()
        
        if (post && post.text && post.title) {
          allPosts.push({
            id: post.id.toString(),
            title: post.title,
            text: post.text,
            url: `https://news.ycombinator.com/item?id=${post.id}`,
            created: post.time,
            score: post.score || 0
          })
        }
      }
      
      console.log(`✅ Scraped posts from Hacker News`)
    } catch (error) {
      console.error('❌ Error scraping Hacker News:', error)
    }
    
    // Process with AI (Gemini)
    console.log(`🤖 Processing ${allPosts.length} posts with AI...`)
    
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured')
    }
    
    for (const post of allPosts) {
      try {
        const prompt = `
        Extract a startup idea from this post. Return JSON only:
        
        Post Title: "${post.title}"
        Post Content: "${post.text || post.selftext || ''}"
        
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
        const content = data.candidates[0].content.parts[0].text
        
        try {
          const parsed = JSON.parse(content)
          if (parsed.confidence_score > 0.7) {
            const idea = {
              problem: parsed.problem,
              target_user: parsed.target_user,
              mvp_suggestion: parsed.mvp_suggestion,
              source_url: post.url,
              source_platform: post.subreddit ? 'reddit' : 'hackernews',
              tags: parsed.tags,
              confidence_score: parsed.confidence_score
            }
            
            // Store in Supabase
            const { error } = await supabaseClient
              .from('ideas')
              .insert([idea])
            
            if (error) {
              console.error('❌ Error storing idea:', error)
            } else {
              processedIdeas.push(idea)
              console.log(`✅ Stored idea: ${idea.problem.substring(0, 50)}...`)
            }
          }
        } catch (parseError) {
          console.error('AI response parsing error:', parseError)
        }
      } catch (error) {
        console.error('❌ Error processing post:', error)
      }
    }
    
    console.log(`🎉 Scraping complete! Processed ${processedIdeas.length} new ideas`)
    
    return new Response(
      JSON.stringify({
        success: true,
        scraped: allPosts.length,
        processed: processedIdeas.length,
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
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
