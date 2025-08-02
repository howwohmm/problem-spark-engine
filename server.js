import express from 'express';
import cors from 'cors';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// In-memory storage for ideas
let ideas = [];

app.get('/api/ideas', (req, res) => {
  console.log('GET /api/ideas - Current ideas:', ideas.length);
  res.json({
    ideas,
    pagination: {
      page: 1,
      limit: 50,
      total: ideas.length,
      pages: 1
    }
  });
});

app.post('/api/scrape-ideas', (req, res) => {
  try {
    // Clear existing ideas to avoid duplicates
    ideas = [];
    
    // Run the scraper script
    const scriptPath = path.join(__dirname, 'scripts', 'test-scraper-groq.mjs');
    const scraper = spawn('node', [scriptPath]);

    let output = '';
    let error = '';
    let collectingIdeas = false;
    let currentIdea = '';

    scraper.stdout.on('data', (data) => {
      const text = data.toString();
      console.log('Scraper output:', text);
      
      // Start collecting after "Viable Ideas:"
      if (text.includes('Viable Ideas:')) {
        collectingIdeas = true;
        return;
      }
      
      if (collectingIdeas) {
        output += text;
      }
    });

    scraper.stderr.on('data', (data) => {
      error += data.toString();
      console.error('Scraper error:', data.toString());
    });

    scraper.on('close', (code) => {
      if (code !== 0) {
        console.error('Scraper failed');
        console.error('Error output:', error);
        res.status(500).json({ error: 'Scraping failed', details: error });
        return;
      }

      try {
        // Parse ideas from output
        const ideaMatches = output.match(/\d+\.\s+[^\n]+/g) || [];
        
        ideaMatches.forEach((match, index) => {
          // Extract the problem statement (first line after number)
          const problem = match.replace(/^\d+\.\s+/, '').trim();
          
          // Get the section for this idea (between this match and the next)
          const startIndex = output.indexOf(match);
          const nextMatch = ideaMatches[index + 1];
          const endIndex = nextMatch ? output.indexOf(nextMatch) : output.length;
          const ideaSection = output.substring(startIndex, endIndex);
          
          // Parse fields from the idea section
          const getField = (prefix) => {
            const regex = new RegExp(`${prefix}\\s*([^\\n]+)`, 'i');
            const match = ideaSection.match(regex);
            return match ? match[1].trim() : '';
          };
          
          // Get original description
          const originalMatch = ideaSection.match(/Original:\s*([^]*?)(?=\s*Unique Value:|$)/i);
          const originalDescription = originalMatch ? originalMatch[1].trim() : '';
          
          // Parse tags
          const tagsMatch = ideaSection.match(/Tags:\s*([^\\n]+)/i);
          const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : [];
          
          ideas.push({
            id: Math.random().toString(36).substr(2, 9),
            problem,
            target_user: '', // Removed as requested
            mvp_suggestion: getField('Solution:'),
            original_description: originalDescription,
            source_url: getField('Source:'),
            source_platform: 'hackernews',
            tags,
            created_at: new Date().toISOString(),
            confidence_score: 0.8,
            unique_value: getField('Unique Value:'),
            risks: getField('Risks:'),
            time_to_mvp: parseInt(getField('Time to MVP:')) || 3,
            reasoning: getField('Analysis:')
          });
        });

        console.log('Successfully parsed ideas:', ideas.length);
        ideas.forEach(idea => {
          console.log(`- ${idea.problem}`);
        });

        res.json({
          success: true,
          scraped: 10,
          processed: ideas.length,
          viable: ideas.length,
          message: `Found ${ideas.length} viable ideas`
        });
      } catch (parseError) {
        console.error('Error parsing ideas:', parseError);
        res.status(500).json({ error: 'Failed to parse ideas', details: parseError.message });
      }
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});