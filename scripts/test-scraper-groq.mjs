import dotenv from 'dotenv';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';

// Predefined tags
const PREDEFINED_TAGS = [
  'AI/ML', 'Blockchain', 'IoT', 'VR/AR', 'Cloud', 'Mobile', 'Web3', 'API',
  'SaaS', 'Marketplace', 'Platform', 'B2B', 'B2C', 'Enterprise', 'Subscription', 'Freemium',
  'FinTech', 'HealthTech', 'EdTech', 'E-commerce', 'Gaming', 'Social Media', 'Productivity',
  'Security', 'DevTools', 'Legal Tech', 'Real Estate', 'Travel',
  'Automation', 'Analytics', 'Collaboration', 'Communication', 'Data Management', 'Open Source'
];

if (!GROQ_API_KEY) {
  throw new Error('GROQ_API_KEY is required');
}

async function fetchHNPosts(limit = 10) {
  console.log('Fetching HN posts...');
  const response = await fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=ask_hn&hitsPerPage=${limit}`);
  const data = await response.json();
  
  return data.hits.map(post => ({
    id: post.objectID,
    title: post.title,
    text: post.story_text || '',
    url: `https://news.ycombinator.com/item?id=${post.objectID}`,
    created: post.created_at_i,
    score: post.points || 0
  }));
}

async function processWithAI(rawPost) {
  console.log('Processing with AI:', rawPost.title);
  const prompt = `
  Extract a startup idea from this post. Return JSON only:

  Post Title: "${rawPost.title}"
  Post Content: "${rawPost.text || ''}"

  Available tags (pick 2-4 most relevant): ${PREDEFINED_TAGS.join(', ')}

  Extract:
  {
    "problem": "One-line problem statement (max 100 chars)",
    "mvpSuggestion": "Simple solution idea (max 150 chars)",
    "tags": ["tag1", "tag2", "tag3"],
    "marketSize": 0.8,
    "implementation": 0.7,
    "competition": 0.6,
    "timing": 0.8,
    "monetization": 0.7,
    "uniqueValue": "What makes this unique (max 100 chars)",
    "risks": "Key risks (max 100 chars)",
    "timeToMvp": 3,
    "confidence": 0.8,
    "reasoning": "Why this idea could work (max 200 chars)"
  }

  Rules:
  - Only use tags from the provided list
  - Do not include "targetUser" field
  - Keep problem statement concise
  - Only return valid JSON. If no clear startup idea, return {"confidence": 0}
  `;

  try {
    console.log('Calling Groq API...');
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a startup idea analyzer. Extract key information and categorize with provided tags only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error response:', error);
      throw new Error(`Groq API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    console.log('Groq API response:', data);
    const aiResponse = data.choices[0].message.content;
    
    // Clean the response - remove markdown code blocks if present
    const cleanResponse = aiResponse.replace(/\`\`\`json|\`\`\`|\n/g, '').trim();
    console.log('Cleaned response:', cleanResponse);
    
    const parsed = JSON.parse(cleanResponse);
    
    // Add original post content as description
    parsed.originalDescription = rawPost.text || rawPost.title;
    
    return parsed;
  } catch (error) {
    console.error('Error processing with AI:', error);
    return { confidence: 0 };
  }
}

async function analyzeIdea(idea) {
  console.log('Analyzing idea:', idea.problem);
  // Calculate viability score (weighted average)
  const weights = {
    marketSize: 0.25,
    implementation: 0.2,
    competition: 0.15,
    timing: 0.15,
    monetization: 0.25
  };

  const viabilityScore = 
    (idea.marketSize * weights.marketSize) +
    (idea.implementation * weights.implementation) +
    (idea.competition * weights.competition) +
    (idea.timing * weights.timing) +
    (idea.monetization * weights.monetization);

  // Filter criteria
  const isViable = 
    viabilityScore >= 0.65 && // Good overall viability
    idea.timeToMvp <= 6 && // Can be built within 6 months
    idea.marketSize >= 0.6 && // Decent market size
    idea.monetization >= 0.5; // Clear monetization potential

  if (!isViable) {
    console.log('❌ Idea filtered out:');
    console.log(`   Viability Score: ${viabilityScore.toFixed(2)}`);
    console.log(`   Time to MVP: ${idea.timeToMvp} months`);
    console.log(`   Market Size: ${idea.marketSize}`);
    console.log(`   Monetization: ${idea.monetization}`);
    return null;
  }

  return {
    ...idea,
    viabilityScore
  };
}

async function main() {
  try {
    console.log('🔍 Fetching posts from Hacker News...');
    const posts = await fetchHNPosts(10);
    console.log(`📝 Found ${posts.length} posts`);

    const viableIdeas = [];

    for (const post of posts) {
      console.log(`\nProcessing: ${post.title}`);
      
      // Wait between requests to respect rate limits
      if (viableIdeas.length > 0) {
        console.log('Waiting 5 seconds between requests...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

      const analysis = await processWithAI(post);
      console.log('AI Analysis:', analysis);
      
      if (analysis.confidence > 0) {
        const viableIdea = await analyzeIdea(analysis);
        if (viableIdea) {
          viableIdeas.push({
            ...viableIdea,
            source: post.url
          });
        }
      }
    }

    console.log(`\n🎉 Scraping complete! Found ${viableIdeas.length} viable ideas`);
    
    if (viableIdeas.length > 0) {
      console.log('\nViable Ideas:\n');
      viableIdeas.forEach((idea, index) => {
        console.log(`${index + 1}. ${idea.problem}`);
        console.log(`   Solution: ${idea.mvpSuggestion}`);
        console.log(`   Original: ${idea.originalDescription.substring(0, 200)}${idea.originalDescription.length > 200 ? '...' : ''}`);
        console.log(`   Unique Value: ${idea.uniqueValue}`);
        console.log(`   Risks: ${idea.risks}`);
        console.log(`   Time to MVP: ${idea.timeToMvp} months`);
        console.log(`   Tags: ${idea.tags.join(', ')}`);
        console.log(`   Analysis: ${idea.reasoning}`);
        console.log(`   Source: ${idea.source}`);
        console.log(`   Scores:`);
        console.log(`     - Market Size: ${idea.marketSize}`);
        console.log(`     - Implementation: ${idea.implementation}`);
        console.log(`     - Competition: ${idea.competition}`);
        console.log(`     - Timing: ${idea.timing}`);
        console.log(`     - Monetization: ${idea.monetization}`);
        console.log(`     - Overall Viability: ${idea.viabilityScore.toFixed(2)}`);
        console.log();
      });
    }
  } catch (error) {
    console.error('Main error:', error);
    throw error;
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});