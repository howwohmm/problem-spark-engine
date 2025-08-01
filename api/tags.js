// API endpoint to get all available tags
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  try {
    // Get all unique tags from ideas
    const result = await sql`
      SELECT tags 
      FROM ideas 
      WHERE confidence_score > 0.7 
      AND tags IS NOT NULL
      AND jsonb_array_length(tags::jsonb) > 0
    `
    
    // Extract and flatten all tags
    const allTags = new Set()
    
    result.forEach(row => {
      try {
        const tags = JSON.parse(row.tags || '[]')
        tags.forEach(tag => {
          if (tag && typeof tag === 'string') {
            allTags.add(tag.trim())
          }
        })
      } catch (error) {
        console.error('Error parsing tags:', error)
      }
    })
    
    // Convert to sorted array
    const sortedTags = Array.from(allTags).sort()
    
    return res.status(200).json({
      tags: sortedTags,
      count: sortedTags.length
    })
    
  } catch (error) {
    console.error('Tags API Error:', error)
    
    // Return fallback tags if database fails
    const fallbackTags = [
      'AI', 'Automation', 'B2B', 'Content Creation', 'DevTools', 
      'E-commerce', 'EdTech', 'Fintech', 'Gaming', 'Health',
      'Marketing', 'Mobile App', 'Productivity', 'SaaS', 'Small Business',
      'Social Media', 'Startups', 'Web App', 'Remote Work', 'Analytics'
    ]
    
    return res.status(200).json({
      tags: fallbackTags,
      count: fallbackTags.length,
      fallback: true
    })
  }
}

export const config = {
  runtime: 'edge'
}