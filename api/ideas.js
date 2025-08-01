// Frontend API - Serve real ideas to the app
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export default async function handler(req, res) {
  console.log('API called with DB connection')
  
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'newest' 
    } = req.query
    
    const offset = (parseInt(page) - 1) * parseInt(limit)
    
    // Simple query first
    const query = `
      SELECT 
        id,
        problem,
        target_user as "targetUser",
        mvp_suggestion as "mvpSuggestion", 
        source_url as source,
        source_platform as "sourceType",
        tags,
        confidence_score as confidence,
        created_at as timestamp
      FROM ideas 
      WHERE confidence_score > 0.7
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `
    
    console.log('Executing query...')
    const result = await sql(query, parseInt(limit), offset)
    console.log('Query result:', result.length, 'rows')
    
    // Process results
    const ideas = result.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
      timestamp: new Date(row.timestamp).toISOString()
    }))
    
    return res.status(200).json({
      ideas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: ideas.length,
        pages: 1
      }
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      error: 'Failed to fetch ideas',
      message: error.message
    })
  }
}

export const config = {
  runtime: 'nodejs'
}