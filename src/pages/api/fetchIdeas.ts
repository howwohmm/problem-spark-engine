
import { NextApiRequest, NextApiResponse } from 'next'
import snoowrap from 'snoowrap'
import axios from 'axios'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { summarize } from '@/lib/gemini'

const reddit = new snoowrap({
  userAgent: 'ideaohm',
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USER!,
  password: process.env.REDDIT_PASS!
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ideas: any[] = []
    
    // Reddit
    for (const sub of process.env.SUBREDDITS!.split(',')) {
      const posts = await reddit.getSubreddit(sub).getNew({ limit: 50 })
      posts.forEach(p => ideas.push({
        title: p.title,
        body: p.selftext || '',
        url: `https://reddit.com${p.permalink}`,
        src: 'reddit'
      }))
    }
    
    // Hacker News
    const hnRes = await axios.get(
      `https://hn.algolia.com/api/v1/search_by_date`,
      { params: { tags: process.env.HN_FILTER, numericFilters: 'points>10' } }
    )
    hnRes.data.hits.forEach((h: any) => ideas.push({
      title: h.title,
      body: h.comment_text || h.story_text || '',
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      src: 'hackernews'
    }))

    // Filter & transform
    const regex = /(how do i|is there a|pain|problem|struggle|tool)/i
    const filteredIdeas = ideas.filter(i => regex.test((i.title + i.body)))
    
    let insertedCount = 0
    for (const idea of filteredIdeas) {
      try {
        const brief = await summarize(idea.title, idea.body)
        await supabaseAdmin.from('ideas').upsert({
          problem: brief.problem,
          target_user: brief.target_user,
          mvp_suggestion: brief.mvp_suggestion,
          tags: brief.tags,
          source_url: idea.url,
          source_platform: idea.src
        }, { onConflict: 'source_url' })
        insertedCount++
      } catch (summaryError) {
        console.error('Error processing idea:', summaryError)
        // Continue with next idea instead of failing completely
      }
    }
    
    res.status(200).json({ status: 'ok', processed: filteredIdeas.length, inserted: insertedCount })
  } catch (e) {
    console.error('Fetch ideas error:', e)
    res.status(500).json({ error: 'Failed to fetch ideas' })
  }
}
