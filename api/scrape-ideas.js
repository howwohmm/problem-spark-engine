// Vercel Edge Function - Real data scraper
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

// Reddit API wrapper
async function fetchRedditPosts(subreddit, limit = 10) {
  const response = await fetch(
    `https://www.reddit.com/r/${subreddit}/new.json?limit=${limit}`,
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
  return data.data.children.map(post => ({
    id: post.data.id,
    title: post.data.title,
    selftext: post.data.selftext,
    url: `https://reddit.com${post.data.permalink}`,
    created: post.data.created_utc,
    subreddit: post.data.subreddit,
    score: post.data.score
  }))
}

// Hacker News API wrapper  
async function fetchHNPosts(limit = 10) {
  // Get "Ask HN" posts
  const askHNResponse = await fetch('https://hacker-news.firebaseio.com/v0/askstories.json')
  const askHNIds = await askHNResponse.json()
  
  const posts = []
  for (let i = 0; i < Math.min(limit, askHNIds.length); i++) {
    const postResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${askHNIds[i]}.json`)
    const post = await postResponse.json()
    
    if (post && post.text && post.title) {
      posts.push({
        id: post.id.toString(),
        title: post.title,
        text: post.text,
        url: `https://news.ycombinator.com/item?id=${post.id}`,
        created: post.time,
        score: post.score || 0
      })
    }
  }
  
  return posts
}

// Gemini AI processing
async function processWithAI(rawPost) {
  const prompt = `
  Extract a startup idea from this post. Return JSON only:
  
  Post Title: "${rawPost.title}"
  Post Content: "${rawPost.text || rawPost.selftext || ''}"
  
  Extract:
  {
    "problem": "Clear problem statement (max 100 chars)",
    "targetUser": "Who has this problem (max 50 chars)",  
    "mvpSuggestion": "Simple solution idea (max 150 chars)",
    "tags": ["tag1", "tag2", "tag3"],
    "confidence": 0.85
  }
  
  Only return JSON. If no clear startup idea, return {"confidence": 0}
  `
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
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
      if (parsed.confidence > 0.7) {
        return {
          ...parsed,
          sourceUrl: rawPost.url,
          sourcePlatform: rawPost.subreddit ? 'reddit' : 'hackernews',
          originalTitle: rawPost.title,
          createdAt: new Date(rawPost.created * 1000).toISOString()
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

// Store in database
async function storeIdea(idea) {
  const id = `${idea.sourcePlatform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  await sql`
    INSERT INTO ideas (
      id, problem, target_user, mvp_suggestion, source_url, 
      source_platform, tags, confidence_score, created_at
    ) VALUES (
      ${id},
      ${idea.problem},
      ${idea.targetUser}, 
      ${idea.mvpSuggestion},
      ${idea.sourceUrl},
      ${idea.sourcePlatform},
      ${JSON.stringify(idea.tags)},
      ${idea.confidence},
      ${idea.createdAt}
    )
  `
  
  return id
}

// Main scraper function
export default async function handler(req, res) {
  try {
    console.log('🚀 Starting idea scraping...')
    
    const subreddits = ['entrepreneur', 'startups', 'SaaS', 'indiehackers']
    const allPosts = []
    const processedIdeas = []
    
    // Scrape Reddit
    for (const subreddit of subreddits) {
      try {
        const posts = await fetchRedditPosts(subreddit, 5)
        allPosts.push(...posts)
        console.log(`✅ Scraped ${posts.length} posts from r/${subreddit}`)
      } catch (error) {
        console.error(`❌ Error scraping r/${subreddit}:`, error)
      }
    }
    
    // Scrape Hacker News
    try {
      const hnPosts = await fetchHNPosts(5)
      allPosts.push(...hnPosts)
      console.log(`✅ Scraped ${hnPosts.length} posts from Hacker News`)
    } catch (error) {
      console.error('❌ Error scraping Hacker News:', error)
    }
    
    // Process with AI
    console.log(`🤖 Processing ${allPosts.length} posts with AI...`)
    
    for (const post of allPosts) {
      try {
        const idea = await processWithAI(post)
        if (idea) {
          const storedId = await storeIdea(idea)
          processedIdeas.push({ id: storedId, ...idea })
          console.log(`✅ Stored idea: ${idea.problem.substring(0, 50)}...`)
        }
      } catch (error) {
        console.error('❌ Error processing post:', error)
      }
    }
    
    console.log(`🎉 Scraping complete! Processed ${processedIdeas.length} new ideas`)
    
    return res.status(200).json({
      success: true,
      scraped: allPosts.length,
      processed: processedIdeas.length,
      ideas: processedIdeas.map(idea => ({
        problem: idea.problem,
        confidence: idea.confidence,
        platform: idea.sourcePlatform
      }))
    })
    
  } catch (error) {
    console.error('❌ Scraping failed:', error)
    return res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Rate limiting and error handling
export const config = {
  runtime: 'edge',
  maxDuration: 300 // 5 minutes max
}